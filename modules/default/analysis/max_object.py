import cv2
import numpy as np

def run(inputs, attributes):

	contours, _ = cv2.findContours(inputs['image'], cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

	# Initialise variables to store the largest contour and its area
	largest_contour = None
	largest_contour_area = 0

	# Iterate through the contours
	for contour in contours:

		# Quickly calculate the area of the contour
		contour_area = cv2.contourArea(contour)
		
		# Check if the current contour has a larger area than the previously found largest contour
		if contour_area > largest_contour_area:
			largest_contour_area = contour_area
			largest_contour = contour

	image = np.zeros((inputs['image'].shape[0], inputs['image'].shape[1]), np.uint8)

	if largest_contour is not None:
		cv2.fillPoly(image, [largest_contour], (255, 255, 255))

	# Count the actual size
	largest_contour_area = cv2.countNonZero(image)


	return { 'size': largest_contour_area, 'object_image': image }
