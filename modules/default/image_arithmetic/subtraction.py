import cv2
import numpy as np


def run(inputs, attributes):
	image1 = inputs['image_in']
	image2 = inputs['subtracted_image']

	# Ensure both images have the same dimensions
	image2 = cv2.resize(image2, (image1.shape[1], image1.shape[0]))

	# Perform Image Subtraction
	result_image = cv2.subtract(image1, image2)

	return {'image_out': result_image}
