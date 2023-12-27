import cv2


def run(inputs, attributes):
	
	if 'image_in' not in inputs:
		raise RuntimeError('No input image')
	
	greyscale = cv2.cvtColor(inputs['image_in'], cv2.COLOR_BGR2GRAY)
	return {'image_out': greyscale}
