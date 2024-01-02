import cv2


def run(inputs, attributes):
	
	if 'image_in' not in inputs:
		raise RuntimeError('No input image')
	
	blue_channel, green_channel, red_channel = cv2.split(inputs['image_in'])
	
	return {'image_r': red_channel, 'image_g': green_channel, 'image_b': blue_channel}
