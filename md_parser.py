import re

import yaml


def find_md_parts(text):

	parts = {}

	while True:
		march = re.search(r'\n!(\w+)\n([\w\W]*?)(\n!\w+\n)', text)

		if march:
			text = text[march.start(3):]
			parts[march.group(1)] = march.group(2).strip()
		else:
			march = re.search(r'\n!(\w+)\n([\w\W]*)', text)
			if march:
				parts[march.group(1)] = march.group(2).strip()

			return parts


def parse(text):

	_, yml_data, md_text = text.split('---', 2)

	data = yaml.safe_load(yml_data)

	md_parts = find_md_parts(md_text)

	return {
		'data': data,
		'md_text': md_text,
		'md_parts': md_parts
	}


def parse_file(path: str):
	with open(path, 'r') as f:
		data_str = f.read()

	return parse(data_str)
