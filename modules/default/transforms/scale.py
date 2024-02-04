import cv2

def run(inputs, attributes):

	width  = int(inputs['width'])
	height = int(inputs['height'])
	

	if width <= 0:
		raise RuntimeError('Width cannot be smaller than 1')
	
	if height <= 0:
		raise RuntimeError('Height cannot be smaller than 1')

	return {'image_out': cv2.resize(inputs['image'], (width, height), interpolation = cv2.INTER_AREA)}
