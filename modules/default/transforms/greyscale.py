import cv2


def run(inputs, attributes):
	
	if 'image_in' not in inputs:
		raise RuntimeError('No input image')
	
	if len(inputs['image_in'].shape) > 2:
		image = cv2.cvtColor(inputs['image_in'], cv2.COLOR_BGR2GRAY)
	else:
		image = inputs['image_in']

	return {'image_out': image}
