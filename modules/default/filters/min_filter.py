import cv2
import numpy as np

def run(inputs, attributes):

	ksize = int(inputs['radius']) * 2 + 1

	min_image = cv2.erode(inputs['image_in'], kernel=np.ones((ksize, ksize), np.uint8), iterations=1)

	return {'image_out': min_image}
