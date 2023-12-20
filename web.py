from flask import Flask, send_file

import web_api

app = Flask(
	__name__,
	static_url_path='',
	static_folder='web/static',
	template_folder='web/templates'
)
app.register_blueprint(web_api.api)


def run():
	app.run()


@app.route("/")
def index_route():
	return send_file('web/static/index.html')


@app.route("/files/")
def files_route():
	return send_file('web/static/files/index.html')
