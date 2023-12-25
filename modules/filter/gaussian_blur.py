import cv2


def run(inputs, attributes):
	blurred_image = cv2.GaussianBlur(
		inputs['image_in'],
		(inputs['blur_radius'] * 2 + 1, inputs['blur_radius'] * 2 + 1),
		0
	)
	return {'image_out': blurred_image}
