import math
import cv2
import numpy as np

def run(inputs, attributes):

	contours, _ = cv2.findContours(inputs['image'], cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
	len(contours)

	objects_area = cv2.countNonZero(inputs['image'])

	if len(contours):
		return { 'size': objects_area / len(contours) }
	
	return { 'size': 0 }
