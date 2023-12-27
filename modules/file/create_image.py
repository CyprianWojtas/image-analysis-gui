import numpy as np


def run(inputs, attributes):

	image = np.zeros((inputs['height'], inputs['width'], 3), np.uint8)
	if 'channel_b' in inputs:
		image[:, :, 0] = inputs['channel_b']
	if 'channel_g' in inputs:
		image[:, :, 1] = inputs['channel_g']
	if 'channel_r' in inputs:
		image[:, :, 2] = inputs['channel_r']

	return {'file': image}
