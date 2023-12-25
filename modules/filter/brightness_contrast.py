import cv2


def run(inputs, attributes):
	image = inputs['image_in']

	adjusted_image = cv2.convertScaleAbs(image, alpha=1.5, beta=20)

	# return {'image_out': f'BrightnessContrast<{inputs["image_in"]}; {inputs["brightness"]}; {inputs["contrast"]}>'}
	return {'image_out': adjusted_image}
