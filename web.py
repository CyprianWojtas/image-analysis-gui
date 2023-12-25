from flask import Flask, send_file
from flask_socketio import SocketIO

import analysis
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


@app.route("/files/")
def files_route():
	return send_file('web/static/files/index.html')


@socketio.on('run_analysis')
def socket_run_analysis(json):
	print('received json: ' + str(json))
	a = analysis.Analysis(json['analysisId'])
	a.run()

