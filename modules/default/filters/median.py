import cv2


def run(inputs, attributes):

	return {'image_out': cv2.medianBlur(inputs['image_in'], ksize=inputs['radius'] * 2 + 1)}
