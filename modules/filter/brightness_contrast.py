import cv2


def run(inputs, attributes):
	image = inputs['image_in']

	adjusted_image = cv2.convertScaleAbs(image, alpha=inputs.get("contrast", 1), beta=inputs.get("brightness", 0))

	return {'image_out': adjusted_image}
