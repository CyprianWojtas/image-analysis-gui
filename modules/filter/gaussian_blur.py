import cv2


def run(inputs, attributes):
	
	if 'image_in' not in inputs:
		raise RuntimeError('No input image')
	
	if 'blur_radius' not in inputs:
		raise RuntimeError('No input blur radius')

	blurred_image = cv2.GaussianBlur(
		inputs['image_in'],
		(inputs['blur_radius'] * 2 + 1, inputs['blur_radius'] * 2 + 1),
		0
	)
	return {'image_out': blurred_image}
