import importlib.util
import os
import sys

import config
import md_parser

nodes = {}
groups = {}


def get_node_info(node_path=''):

	node_id = node_path[0:-3]

	parsed = md_parser.parse_file(os.path.join(config.MODULES_PATH, node_path))
	node_data = parsed['data']
	node_desc_parts = parsed['md_parts']

	if 'id' in node_data:
		node_id = node_data['id']

	inputs = []

	if 'inputs' in node_data:
		for input_id, input_value in node_data['inputs'].items():
			inputs.append({
				'id': input_id,
				**input_value
			})

	outputs = []

	if 'outputs' in node_data:
		for output_id, output_value in node_data['outputs'].items():
			outputs.append({
				'id': output_id,
				**output_value
			})

	return {
		'id': node_id,
		'group': node_data.get('group', None),
		'path': node_path[0:-3],
		'name': node_data.get('name', 'Unnamed Node'),
		'customClass': node_data.get('custom_class', False),
		'customPyPath': node_data.get('custom_py_path', None),
		'description':
			node_desc_parts['description']
			if 'description' in node_desc_parts
			else (parsed['md_text'] if not node_desc_parts else ''),

		'wiki': node_desc_parts['wiki'] if 'wiki' in node_desc_parts else None,
		'inputs': inputs,
		'outputs': outputs
	}


def get_custom_class(node_id):
	nodes = load_python_modules()

	if node_id not in nodes:
		return None

	node = nodes[node_id]

	if not node.get('customClass'):
		return None

	if type(node.get('customClass')) is bool:
		path = os.path.join(config.MODULES_PATH, node['path'] + '.js')
	else:
		path = os.path.join(config.MODULES_PATH, os.path.dirname(node['path']), node['customClass'])

	print(path)

	if os.path.exists(path) and os.path.isfile(path):
		with open(path, 'r') as f:
			module_class = f.read()

		return module_class

	return None


def get_group(group_path):

	path = os.path.join(config.MODULES_PATH, group_path)

	if not os.path.exists(os.path.join(path, '_group.md')):
		return None

	data = md_parser.parse_file(os.path.join(path, '_group.md'))

	return {
		'id': data['data'].get('id', group_path),
		'path': group_path,
		'name': data['data'].get('name', group_path),
		'colour': data['data'].get('colour'),
		'description': data['md_text']
	}


def get_list(module_path='') -> tuple:

	path = os.path.join(config.MODULES_PATH, module_path)
	modules = {}
	groups = {}

	group_info = get_group(module_path)
	if group_info:
		groups[group_info['id']] = group_info

	for file in os.listdir(path):

		if file == '_group.md':
			continue

		file_path = module_path + '/' + file if module_path else file

		if os.path.isdir(os.path.join(config.MODULES_PATH, file_path)):
			submodules, subgroups = get_list(file_path)
			modules |= submodules
			groups |= subgroups
		elif file_path[-3:].lower() == '.md':
			module = get_node_info(file_path)

			if not module['group']:
				module['group'] = group_info['id'] if group_info else module_path

			modules[module['id']] = module

			del module['id']

	return modules, groups


def load_python_modules():
	global nodes, groups

	if nodes and groups:
		return nodes

	nodes, groups = get_list()

	for node_id, node in nodes.items():
		try:
			if node.get('customPyPath'):
				path = os.path.join(config.MODULES_PATH, os.path.dirname(node['path']), node['customPyPath'])
			else:
				path = os.path.join(config.MODULES_PATH, node['path'] + '.py')

			print(path)

			spec = importlib.util.spec_from_file_location(
				"module." + node_id, path
			)
			module_py = importlib.util.module_from_spec(spec)
			sys.modules["module." + node_id] = module_py
			spec.loader.exec_module(module_py)

			if hasattr(module_py, 'run'):
				node['run'] = module_py.run
		except FileNotFoundError:
			continue

	return nodes

