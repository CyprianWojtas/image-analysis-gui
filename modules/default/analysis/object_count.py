import cv2


def run(inputs, attributes):

	contours, _ = cv2.findContours(inputs['image'], cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

	return {'count': len(contours)}
