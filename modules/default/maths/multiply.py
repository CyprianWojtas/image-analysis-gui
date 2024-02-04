def run(inputs, attributes):

	mult = 1
	i = 1
	while inputs.get(f'number{i}'):
		mult *= inputs.get(f'number{i}')
		i += 1

	return {'out': mult}
