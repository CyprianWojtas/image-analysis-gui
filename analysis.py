import json

import files
import modules
from flask_socketio import emit


started_analysis = {}


class Analysis:
	def __init__(self, analysis_id):
		self.analysis_id = analysis_id

		analysis_data = json.loads(files.get(analysis_id))

		self.nodes = analysis_data['nodes']
		# input -> output mapping (what given input should take)
		self.connections = {}
		self.variables = {}
		self.gui_data = {}
		self.nodes_to_solve = {**self.nodes}

		for connection in analysis_data['connections']:
			self.connections[connection[1]] = connection[0]

	def run(self):

		mods = modules.load_python_modules()

		while self.nodes_to_solve:
			solved_nodes = []
			for node_id, node in self.nodes_to_solve.items():

				runnable = True
				inputs_dict = {}

				required_inputs = []

				for node_input in mods[node['type']]['inputs']:
					required_inputs.append(node_input['id'])

				if 'customInputs' in node:
					for node_input in node['customInputs']:
						required_inputs.append(node_input)

				for node_input in required_inputs:
					input_id = node_id + "?" + node_input

					if input_id not in self.connections:
						continue

					output_id = self.connections[input_id]

					# Node doesn't have all required inputs
					if output_id not in self.variables:
						runnable = False
						break

					inputs_dict[node_input] = self.variables[output_id]

				if not runnable:
					continue

				if 'run' not in mods[node['type']]:
					print(f'Cannot run module \'{node["type"]}\'!')
					return None

				print(f'Running: {node_id}')
				emit('analysis_node_processing', {'nodeId': node_id})

				try:
					node_outputs = mods[node['type']]['run'](inputs_dict, node['attributes'])
				except Exception as err:
					emit('analysis_node_error', {'nodeId': node_id, 'error': str(err)})
					continue

				if type(node_outputs) is tuple:

					self.gui_data[node_id] = node_outputs[1]

					emit(
						'analysis_node_processed',
						{
							'nodeId': node_id,
							'data': node_outputs[1]
						}
					)
					node_outputs = node_outputs[0]
				else:
					emit('analysis_node_processed', {'nodeId': node_id})

				for node_output_id, node_output in node_outputs.items():
					output_id = node_id + "?" + node_output_id
					self.variables[output_id] = node_output

				solved_nodes.append(node_id)

			if not solved_nodes:
				print('No more nodes can be solved!')
				return None

			for node_id in solved_nodes:
				del self.nodes_to_solve[node_id]

		print('Analysis finished!')

	def reset_node(self, node_id):

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


def run(analysis_id):
	if analysis_id not in started_analysis:
		a = Analysis(analysis_id)
		started_analysis[analysis_id] = a
		a.run()
	else:
		started_analysis[analysis_id].run()


def update(analysis_id, data):
	if analysis_id not in started_analysis:
		return False

	a = started_analysis[analysis_id]
	data_dict = json.loads(data)

	for node_id, node in data_dict['nodes'].items():
		if node_id not in a.nodes:
			a.nodes_to_solve[node_id] = node
		a.nodes[node_id] = node

	a.connections = {}
	for connection in data_dict['connections']:
		a.connections[connection[1]] = connection[0]


def status(analysis_id):
	if analysis_id in started_analysis:
		return {
			'active': True,
			'gui_data': started_analysis[analysis_id].gui_data
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
