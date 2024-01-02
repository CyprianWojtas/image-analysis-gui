import cv2
import numpy as np


def run(inputs, attributes):
	
	if 'image' not in inputs:
		raise RuntimeError('No input image')
	
	if len(inputs['image'].shape) > 2:
		image = cv2.cvtColor(inputs['image'], cv2.COLOR_BGR2GRAY)
	else:
		image = inputs['image']

	average_brightness = np.mean(image)

	return {'value': average_brightness}
