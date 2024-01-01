import json

import files
import modules
from flask_socketio import emit


started_analysis = {}


class Analysis:
	def __init__(self, analysis_id):
		self.analysis_id = analysis_id

		self.modules = modules.load_python_modules()
		analysis_data = json.loads(files.get(analysis_id))

		self.nodes = analysis_data['nodes']
		# input -> output mapping (what given input should take)
		self.connections = {}
		self.variables = {}
		self.gui_data = {}
		self.errors = {}
		self.nodes_to_solve = {**self.nodes}
		self.paused = False

		for connection in analysis_data['connections']:
			self.connections[connection[1]] = connection[0]

	def run(self):

		while self.nodes_to_solve:
			solved_nodes = []
			for node_id in self.nodes_to_solve.keys():
				if self.run_node(node_id):
					solved_nodes.append(node_id)

			if not solved_nodes:
				print('No more nodes can be solved!')
				return None

			for node_id in solved_nodes:
				del self.nodes_to_solve[node_id]

		print('Analysis finished!')

	def is_node_runnable(self, node_id):
		node = self.nodes[node_id]
		inputs_dict = {}

		node_inputs = []
		optional_inputs = set()

		if 'customInputs' in node:
			for node_input in node['customInputs']:
				node_inputs.append(node_input)
		else:
			for node_input in self.modules[node['type']]['inputs']:
				node_inputs.append(node_input['id'])
				if node_input.get('optional'):
					optional_inputs.add(node_input['id'])

		for node_input in node_inputs:
			input_id = node_id + "?" + node_input

			# Variable not connected to anything
			if input_id not in self.connections:
				inputs_dict[node_input] = None

				if node_input not in optional_inputs:
					return False, None

				continue

			output_id = self.connections[input_id]

			# Node doesn't have all required inputs
			if output_id not in self.variables:
				return False, None

			inputs_dict[node_input] = self.variables[output_id]

		return True, inputs_dict

	def run_node(self, node_id):
		node = self.nodes[node_id]

		if node_id in self.errors:
			del self.errors[node_id]

		if 'run' not in self.modules[node['type']]:
			print(f'Cannot run module \'{node["type"]}\'!')
			return False

		runnable, inputs_dict = self.is_node_runnable(node_id)
		if not runnable:
			return False

		print(f'Running: {node_id}')
		emit('analysis_node_processing', {'analysisId': self.analysis_id, 'nodeId': node_id})

		try:
			node_outputs = self.modules[node['type']]['run'](inputs_dict, node['attributes'])
		except Exception as err:
			emit('analysis_node_error', {'analysisId': self.analysis_id, 'nodeId': node_id, 'error': str(err)})
			self.errors[node_id] = str(err)
			return True

		if type(node_outputs) is tuple:

			self.gui_data[node_id] = node_outputs[1]

			emit(
				'analysis_node_processed',
				{
					'analysisId': self.analysis_id,
					'nodeId': node_id,
					'data': node_outputs[1]
				}
			)
			node_outputs = node_outputs[0]
		else:
			emit('analysis_node_processed', {'analysisId': self.analysis_id, 'nodeId': node_id})

		for node_output_id, node_output in node_outputs.items():
			output_id = node_id + "?" + node_output_id
			self.variables[output_id] = node_output

		return True

	def reset_node(self, node_id):

		if node_id not in self.nodes:
			return

		node = self.nodes[node_id]
		mods = modules.load_python_modules()

		if 'customOutputs' in node:
			for node_output in node['customOutputs']:
				output_id = node_id + "?" + node_output
				del self.variables[output_id]
		else:
			for node_output in mods[node['type']]['outputs']:
				output_id = node_id + "?" + node_output['id']
				if output_id in self.variables:
					del self.variables[output_id]

		self.nodes_to_solve[node_id] = node

	def get_gui_data(self):
		for node_id, data in self.gui_data.items():
			if node_id not in self.nodes_to_solve:
				emit(
					'analysis_node_data',
					{
						'analysisId': self.analysis_id,
						'nodeId': node_id,
						'data': data
					}
				)


def is_active(analysis_id: str) -> bool:
	return analysis_id in started_analysis


def run(analysis_id):
	if analysis_id not in started_analysis:
		a = Analysis(analysis_id)
		started_analysis[analysis_id] = a
		a.run()
	else:
		started_analysis[analysis_id].run()


def stop(analysis_id):
	if analysis_id in started_analysis:
		del started_analysis[analysis_id]


def update(analysis_id, data):
	if analysis_id not in started_analysis:
		return False

	a = started_analysis[analysis_id]

	for node_id, node in data['nodes'].items():
		if node_id not in a.nodes:
			a.nodes_to_solve[node_id] = node
		a.nodes[node_id] = node

	a.connections = {}
	for connection in data['connections']:
		a.connections[connection[1]] = connection[0]


def status(analysis_id):
	if analysis_id in started_analysis:
		return {
			'analysisId': analysis_id,
			'active': True,
			'paused': started_analysis[analysis_id].paused,
			'solvedNodes':
				list(started_analysis[analysis_id].nodes.keys() - started_analysis[analysis_id].nodes_to_solve.keys()),
			'errors':
				started_analysis[analysis_id].errors
		}

	return {
		'active': False
	}


def reset_node(analysis_id, node_id):
	if analysis_id not in started_analysis:
		return False

	a = started_analysis[analysis_id]
	a.reset_node(node_id)


def reset_nodes(analysis_id, nodes):
	if analysis_id not in started_analysis:
		return False

	a = started_analysis[analysis_id]

	for node_id in nodes:
		a.reset_node(node_id)


def get_gui_data(analysis_id):
	if analysis_id not in started_analysis:
		return False

	a = started_analysis[analysis_id]
	a.get_gui_data()


def set_paused(analysis_id, paused):
	if analysis_id not in started_analysis:
		return False

	started_analysis[analysis_id].paused = paused
