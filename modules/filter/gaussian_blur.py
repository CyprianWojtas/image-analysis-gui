def run(inputs, attributes):
	return {'image_out': f'Blur<{inputs["image_in"]}; {inputs["blur_radius"]}>'}
