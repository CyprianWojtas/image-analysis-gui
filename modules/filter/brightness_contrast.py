def run(inputs, attributes):
	return {'image_out': f'BrightnessContrast<{inputs["image_in"]}; {inputs["brightness"]}; {inputs["contrast"]}>'}
