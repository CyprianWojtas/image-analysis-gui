import cv2


def run(inputs, attributes):
	
	reconstructed_image = cv2.merge([inputs['image_b'], inputs['image_g'], inputs['image_r']])
	
	return {'image_out': reconstructed_image}
