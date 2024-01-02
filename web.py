import os.path

from flask import Flask, send_file, send_from_directory, request
from flask_socketio import SocketIO, emit
from werkzeug.exceptions import NotFound

import analysis
import config
import web_api

app = Flask(
	__name__,
	static_url_path='',
	static_folder='web'
)
app.config['SECRET_KEY'] = 'secret!'
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024
socketio = SocketIO(app, max_http_buffer_size=1024 * 1024 * 1024)
app.register_blueprint(web_api.api)


def run():
	socketio.run(app, allow_unsafe_werkzeug=True, debug=True)


@app.route("/")
def index_route():
	return send_file('web/index.html')


@app.route("/modules/<path:path>")
def modules_route(path):
	return send_from_directory(config.MODULES_PATH, path)


@app.errorhandler(404)
def page_not_found(e):
	if request.path[-1] == '/':
		index_html = os.path.join(request.path[1:], 'index.html')
	else:
		index_html = request.path[1:] + '.html'

	try:
		return send_from_directory('web', index_html)
	except NotFound:
		pass

	return '404: Page not found', 404


@socketio.on('analysis_run')
def socket_analysis_run(json):
	analysis.run(json.get('analysisId'))


@socketio.on('analysis_stop')
def socket_analysis_stop(json):
	analysis.stop(json.get('analysisId'))


@socketio.on('analysis_status')
def socket_analysis_status(json):
	emit('analysis_status', analysis.status(json.get('analysisId')))


@socketio.on('analysis_reset_nodes')
def socket_analysis_reset_nodes(json):
	analysis.reset_nodes(json.get('analysisId'), json.get('nodes'))


@socketio.on('analysis_update')
def socket_analysis_reset_nodes(json):
	analysis.update(json.get('analysisId'), json.get('data'))
	analysis.reset_nodes(json.get('analysisId'), json.get('nodes'))
	# analysis.run(json.get('analysisId'))
	emit('analysis_updated', {'analysisId': json.get('analysisId')})


@socketio.on('analysis_set_paused')
def socket_analysis_set_paused(json):
	analysis.set_paused(json.get('analysisId'), json.get('paused'))


@socketio.on('analysis_get_node_data')
def socket_analysis_reset_nodes(json):
	analysis.get_gui_data(json.get('analysisId'))
