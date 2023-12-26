import importlib.util
import os
import sys

import config
import md_parser


def get_module_info(module_path=''):

	module_id = module_path[0:-3]

	parsed = md_parser.parse_file(os.path.join(config.MODULES_PATH, module_path))
	module_data = parsed['data']
	module_desc_parts = parsed['md_parts']

	inputs = []

	if 'inputs' in module_data:
		for input_id, input_value in module_data['inputs'].items():
			inputs.append({
				'id': input_id,
				**input_value
			})

	outputs = []

	if 'outputs' in module_data:
		for output_id, output_value in module_data['outputs'].items():
			outputs.append({
				'id': output_id,
				**output_value
			})

	return {
		'id': module_id,
		'name': module_data.get('name', 'Unnamed Node'),
		'customClass': module_data.get('custom_class', False),
		'description':
			module_desc_parts['description']
			if 'description' in module_desc_parts
			else (parsed['md_text'] if not module_desc_parts else ''),

		'wiki': module_desc_parts['wiki'] if 'wiki' in module_desc_parts else None,
		'inputs': inputs,
		'outputs': outputs
	}


def get_custom_class(module_id):
	path = os.path.join(config.MODULES_PATH, module_id + '.js')
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
		'id': group_path,
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
		groups[module_path] = group_info

	for file in os.listdir(path):

		if file == '_group.md':
			continue

		file_path = module_path + '/' + file if module_path else file

		if os.path.isdir(os.path.join(config.MODULES_PATH, file_path)):
			submodules, subgroups = get_list(file_path)
			modules |= submodules
			groups |= subgroups
		elif file_path[-3:].lower() == '.md':
			module = get_module_info(file_path)

			module['group'] = module_path

			modules[module['id']] = module

			del module['id']

	return modules, groups


modules = {}
groups = {}


def load_python_modules():
	global modules, groups

	if modules and groups:
		return modules

	modules, groups = get_list()

	for module_id, module in modules.items():
		try:
			spec = importlib.util.spec_from_file_location(
				"module/" + module_id, config.MODULES_PATH + "/" + module_id + ".py"
			)
			module_py = importlib.util.module_from_spec(spec)
			sys.modules["module/inputs/type_int"] = module_py
			spec.loader.exec_module(module_py)

			if hasattr(module_py, 'run'):
				module['run'] = module_py.run
		except FileNotFoundError:
			continue

	return modules

