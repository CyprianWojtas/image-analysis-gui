def run(inputs, attributes):
	
	if 'image' not in inputs:
		raise RuntimeError('No input image')
	
	h, w, c = inputs['image'].shape

	return {'width': w, 'height': h}
