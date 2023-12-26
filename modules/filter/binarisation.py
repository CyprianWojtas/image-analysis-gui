import cv2


def run(inputs, attributes):
		
	greyscale = cv2.cvtColor(inputs['image_in'], cv2.COLOR_BGR2GRAY)
	_, binary_image = cv2.threshold(greyscale, inputs['treshold'], 255, cv2.THRESH_BINARY)
	return {'image_out': binary_image}
