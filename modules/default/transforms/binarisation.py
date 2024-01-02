import cv2


def run(inputs, attributes):
	
	if inputs['treshold'] is None:
		inputs['treshold'] = 127
	
	if len(inputs['image_in'].shape) > 2:
		image = cv2.cvtColor(inputs['image_in'], cv2.COLOR_BGR2GRAY)
	else:
		image = inputs['image_in']

	_, binary_image = cv2.threshold(image, inputs['treshold'], 255, cv2.THRESH_BINARY)
	return {'image_out': binary_image}
