import cv2


def run(inputs, attributes):
	
	if inputs['image_in'] is None:
		raise RuntimeError('No input image')
	
	if inputs['blur_radius'] is None:
		raise RuntimeError('No input blur radius')
	
	if inputs['blur_radius'] < 0:
		raise RuntimeError('Blur radius cannot be negative')
	
	blur_radius = int(inputs['blur_radius'])

	blurred_image = cv2.GaussianBlur(
		inputs['image_in'],
		(blur_radius * 2 + 1, blur_radius * 2 + 1),
		0
	)
	return {'image_out': blurred_image}
