import math
import cv2
import numpy as np

def run(inputs, attributes):

	contours, _ = cv2.findContours(inputs['image'], cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

	# Initialise variables to store the smallest contour and its area
	smallest_contour = None
	smallest_contour_area = math.inf

	# Iterate through the contours
	for contour in contours:

		# Quickly calculate the area of the contour
		contour_area = cv2.contourArea(contour)
		
		# Check if the current contour has a smaller area than the previously found largest contour
		if contour_area < smallest_contour_area:
			smallest_contour_area = contour_area
			smallest_contour = contour

	image = np.zeros((inputs['image'].shape[0], inputs['image'].shape[1]), np.uint8)

	if smallest_contour is not None:
		cv2.fillPoly(image, [smallest_contour], (255, 255, 255))

	# Count the actual size
	smallest_contour_area = cv2.countNonZero(image)

	return { 'size': smallest_contour_area, 'object_image': image }
