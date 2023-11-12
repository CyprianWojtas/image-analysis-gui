/**
 * Create new HTML element
 * @param nodeName - node name
 * @param attributes - `name: value` dictionary
 * @param eventListeners - `name: value` dictionary
 */
export function createElement(nodeName: string, attributes: { [name: string]: string; } = {}, eventListeners: { [name: string]: ((...any) => any) | ((...any) => any)[]; } = {})
{
	let element: HTMLElement = document.createElement(nodeName);

	for (let attribute in attributes)
		element.setAttribute(attribute, attributes[attribute]);
	
	for (let name in eventListeners)
	{
		let listenerFn = eventListeners[name];

		if (typeof listenerFn == "function")
			element.addEventListener(name, listenerFn);
		else
			for (let listener of listenerFn)
				element.addEventListener(name, listener);
	}

	return element;
}


interface ElementParams
{
	name: string;
	attributes?: { [name: string]: string };
	listeners?: { [name: string]: ((...any) => any) | ((...any) => any)[] };
	childNodes?: (ElementParams | HTMLElement | Text | ChildNode | string)[];
}

/** Create HTML node tree */
export function createNodeTree(nodeTree: ElementParams): HTMLElement
{
	let rootNode = createElement(nodeTree.name, nodeTree.attributes, nodeTree.listeners);

	for (let childNode of nodeTree.childNodes || [])
	{
		if (typeof childNode == "string" || childNode instanceof HTMLElement || childNode instanceof Text)
		{
			rootNode.append(childNode);
			continue;
		}

		// @ts-ignore
		rootNode.append(createNodeTree(childNode));
	}

	return rootNode;
}

