import os.path

import config


def get_path(path: str):

	while path.startswith('/'):
		path = path[1:]

	abs_path = os.path.join(config.FILES_PATH, path)

	files = []

	for file in os.listdir(abs_path):
		file_path = os.path.join(abs_path, file)
		if os.path.isdir(file_path):
			files.append(
				{
					'name': file,
					'path': path + '/' + file if path else file,
					'type': 'dir'
				}
			)
		elif os.path.isfile(file_path):
			files.append(
				{
					'name': file,
					'path': path + '/' + file if path else file,
					'type': 'file'
				}
			)

	return files


def create(path):

	while path.startswith('/'):
		path = path[1:]

	abs_path = os.path.join(config.FILES_PATH, path)

	if not os.path.isdir(os.path.dirname(abs_path)):
		return False

	if os.path.exists(abs_path):
		return False

	with open(abs_path, 'w') as f:
		f.write('{"nodes":{},"connections":[]}')

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

	with open(abs_path, 'w') as f:
		f.write(value)

	return True
