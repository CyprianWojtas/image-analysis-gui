import os
import re

import yaml


def find_md_parts(text):

	parts = {}

	while True:
		march = re.search(r'\n!(\w+)\n([\w\W]*?)(\n!\w+\n)', text)

		if march:
			print(march.start(3))
			text = text[march.start(3):]
			parts[march.group(1)] = march.group(2).strip()
		else:
			march = re.search(r'\n!(\w+)\n([\w\W]*)', text)
			parts[march.group(1)] = march.group(2).strip()

			return parts


def get_module_info(module_path='', base_path=os.path.join(os.path.dirname(__file__), 'modules')):

	module_id = module_path[0:-3]
	with open(os.path.join(base_path, module_path), 'r') as f:
		module_data_str = f.read()

	_, module_yml, module_description = module_data_str.split('---', 2)

	module_data = yaml.safe_load(module_yml)

	module_desc_parts = find_md_parts(module_description)

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
			else (module_description if not module_desc_parts else ''),

		'wiki': module_desc_parts['wiki'] if 'wiki' in module_desc_parts else None,
		'inputs': inputs,
		'outputs': outputs
	}


def get_custom_class(module_id, base_path=os.path.join(os.path.dirname(__file__), 'modules')):
	path = os.path.join(base_path, module_id + '.js')
	if os.path.exists(path) and os.path.isfile(path):
		with open(path, 'r') as f:
			module_class = f.read()

		return module_class

	return None

def get_list(module_path='', base_path=os.path.join(os.path.dirname(__file__), 'modules')):

	path = os.path.join(base_path, module_path)
	modules = {}

	for file in os.listdir(path):

		file_path = module_path + '/' + file if module_path else file

		if os.path.isdir(os.path.join(base_path, file_path)):
			modules |= get_list(file_path)
		elif file_path[-3:].lower() == '.md':
			module = get_module_info(file_path)
			modules[module['id']] = module

			del module['id']

	return modules
