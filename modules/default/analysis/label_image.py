import cv2
import numpy as np


def run(inputs, attributes):

	contours, _ = cv2.findContours(inputs['image'], cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
	_, labeled_image, stats, _ = cv2.connectedComponentsWithStats(inputs['image'], connectivity=8)

	return {'image_out': labeled_image.astype(np.uint8) * 50}
