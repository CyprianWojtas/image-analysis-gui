from flask import Flask, send_file

app = Flask(
	__name__,
	static_url_path='',
	static_folder='web/static',
	template_folder='web/templates'
)


def run():
	app.run()


@app.route("/")
def hello_world():
	return send_file('web/static/index.html')
