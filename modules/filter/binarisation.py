import cv2


def run(inputs, attributes):
	
	if 'image_in' not in inputs:
		raise RuntimeError('No input image')
	
	if 'treshold' not in inputs:
		inputs['treshold'] = 127
		
	greyscale = cv2.cvtColor(inputs['image_in'], cv2.COLOR_BGR2GRAY)
	_, binary_image = cv2.threshold(greyscale, inputs['treshold'], 255, cv2.THRESH_BINARY)
	return {'image_out': binary_image}
