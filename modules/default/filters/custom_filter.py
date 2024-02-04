import cv2
import numpy as np

def run(inputs, attributes):

	kernel = np.array(attributes['kernel'])

	image_out = cv2.filter2D(inputs['image_in'], -1, kernel)

	return {'image_out': image_out}
