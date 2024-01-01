from flask import Blueprint, request, make_response

import files
import modules

api = Blueprint('api', __name__, url_prefix='/api')


@api.route('/nodes')
def api_nodes():
	nodes, groups = modules.get_list()
	return {'nodes': nodes, 'groups': groups}


@api.route('/nodes/<path:node_id>')
def api_node_custom_class(node_id):
	custom_class = modules.get_custom_class(node_id)

	if custom_class:
		resp = make_response(custom_class, 200)
		resp.headers['Content-Type'] = 'application/javascript'
		return resp

	return "File not found", 404


@api.route('/files')
def api_files():
	path = request.args.get('path') or ''
	return files.get_path(path)


@api.route('/files/<path:file_path>')
def api_files_get(file_path):
	file_contents = files.get(file_path)

	if file_contents:
		resp = make_response(file_contents, 200)
		resp.headers['Content-Type'] = 'application/json'
		return resp

	return "File not found", 404


@api.route('/files/<path:file_path>', methods=['CREATE'])
def api_files_create(file_path):
	create_type = request.args.get('type') or 'file'

	if create_type == 'file':
		if files.create(file_path):
			return "OK", 200

	elif create_type == 'dir':
		if files.create_dir(file_path):
			return "OK", 200

	return "File exists", 400


@api.route('/files/<path:file_path>', methods=['PUT'])
def api_files_put(file_path):
	if files.put(file_path, request.data.decode('utf-8')):
		return "OK", 200

	return "File not found", 404
