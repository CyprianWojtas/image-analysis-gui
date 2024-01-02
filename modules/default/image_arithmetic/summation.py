import cv2
import numpy as np


def run(inputs, attributes):
	image1 = inputs['image_in']
	image2 = inputs['image_in2']

	# Ensure both images have the same dimensions
	image2 = cv2.resize(image2, (image1.shape[1], image1.shape[0]))

	# Perform Image Summation
	result_image = cv2.add(image1, image2)

	return {'image_out': result_image}
