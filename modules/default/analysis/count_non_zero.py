import cv2

def run(inputs, attributes):
	return { 'count': cv2.countNonZero(inputs['image']) }
