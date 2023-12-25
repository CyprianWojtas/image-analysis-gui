import json

import files
import modules
from flask_socketio import emit

class Analysis:
	def __init__(self, analysis_id):
		self.analysis_id = analysis_id

		analysis_data = json.loads(files.get(analysis_id))

		self.nodes = analysis_data['nodes']
		# input -> output mapping (what given input should take)
		self.connections = {}
		self.variables = {}

		for connection in analysis_data['connections']:
			self.connections[connection[1]] = connection[0]

		# mods = modules.load_python_modules()

		# print(mods['inputs/type_int'].run({}, {}))

	def run(self):
		nodes_to_solve = {**self.nodes}

		mods = modules.load_python_modules()
		# print(mods)

		while nodes_to_solve:
			solved_nodes = []
			for node_id, node in nodes_to_solve.items():

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
				node_outputs = mods[node['type']]['run'](inputs_dict, node['attributes'])

				if type(node_outputs) is tuple:
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
				del nodes_to_solve[node_id]

		print('Analysis finished!')
