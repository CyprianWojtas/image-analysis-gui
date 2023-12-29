from flask import Flask, send_file, send_from_directory
from flask_socketio import SocketIO, emit

import analysis
import config
import web_api

app = Flask(
	__name__,
	static_url_path='',
	static_folder='web/static',
	template_folder='web/templates',
)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
app.register_blueprint(web_api.api)


def run():
	socketio.run(app, allow_unsafe_werkzeug=True, debug=True)


@app.route("/")
def index_route():
	return send_file('web/static/index.html')


@app.route("/modules/<path:path>")
def modules_route(path):
	return send_from_directory(config.MODULES_PATH, path)


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
