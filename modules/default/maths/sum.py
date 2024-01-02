def run(inputs, attributes):

	sum = 0
	i = 1
	while inputs.get(f'number{i}'):
		sum += inputs.get(f'number{i}')
		i += 1

	return {'sum': sum}
