import json
import os.path
import time

import analysis
import config


def get_path(path: str):

	while path.startswith('/'):
		path = path[1:]

	abs_path = os.path.join(config.FILES_PATH, path)

	files = []
	dirs = []

	for file in os.listdir(abs_path):
		file_path = os.path.join(abs_path, file)
		file_id = path + '/' + file if path else file

		if os.path.isdir(file_path):
			dirs.append(
				{
					'name': file,
					'path': file_id,
					'type': 'dir'
				}
			)
		elif os.path.isfile(file_path):
			with open(file_path, "r") as f:
				try:
					analysis_data = json.load(f)
				except json.JSONDecodeError:
					continue

				files.append(
					{
						'name': file,
						'title': analysis_data.get('title', file),
						'updateTime': analysis_data.get('updateTime'),
						'creationTime': analysis_data.get('creationTime'),
						'path': file_id,
						'type': 'file',
						'active': analysis.is_active(file_id)
					}
				)

	return {'files': files, 'dirs': dirs}


def create(path):

	while path.startswith('/'):
		path = path[1:]

	abs_path = os.path.join(config.FILES_PATH, path)

	if not os.path.isdir(os.path.dirname(abs_path)):
		return False

	if os.path.exists(abs_path):
		return False

	with open(abs_path, 'w') as f:
		json.dump(
			{
				'title': 'New Analysis',
				'nodes': {},
				'connections': [],
				'creationTime': int(time.time()),
				'updateTime': int(time.time())
			},
			f
		)

	return True


def get(path):

	while path.startswith('/'):
		path = path[1:]

	abs_path = os.path.join(config.FILES_PATH, path)

	if not os.path.exists(abs_path) or not os.path.isfile(abs_path):
		return None

	with open(abs_path, 'r') as f:
		file_contents = f.read()

	return file_contents


def put(path: str, value: str):

	while path.startswith('/'):
		path = path[1:]

	abs_path = os.path.join(config.FILES_PATH, path)

	if not os.path.exists(abs_path) or not os.path.isfile(abs_path):
		return False

	try:
		analysis = json.loads(value)
	except json.JSONDecodeError:
		return False

	analysis['updateTime'] = int(time.time())

	with open(abs_path, 'w') as f:
		json.dump(analysis, f)

	return True
