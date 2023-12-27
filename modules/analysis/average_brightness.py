import cv2
import numpy as np


def run(inputs, attributes):
	
	if 'image' not in inputs:
		raise RuntimeError('No input image')
	
	gray_image = cv2.cvtColor(inputs['image'], cv2.COLOR_BGR2GRAY)
	average_brightness = np.mean(gray_image)

	return {'value': average_brightness}
