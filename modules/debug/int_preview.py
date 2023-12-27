def run(inputs, attributes):
	if 'value' not in inputs:
		raise RuntimeError('No input')

	return { 'value_out': inputs['value'] }, {'value': inputs['value'] }
