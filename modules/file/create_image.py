import numpy as np


def run(inputs, attributes):

	image = np.zeros((inputs['height'], inputs['width'], 3), np.uint8)
	if inputs['channel_b'] is not None:
		image[:, :, 0] = inputs['channel_b']
	if inputs['channel_g'] is not None:
		image[:, :, 1] = inputs['channel_g']
	if inputs['channel_r'] is not None:
		image[:, :, 2] = inputs['channel_r']

	return {'file': image}
