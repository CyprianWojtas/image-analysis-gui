def run(inputs, attributes):
	if inputs['number2'] == 0:
		raise RuntimeError('Cannot divide by 0')
	
	return {'out': inputs['number1'] / inputs['number2']}
