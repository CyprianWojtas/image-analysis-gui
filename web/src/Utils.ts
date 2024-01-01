/**
 * Create new HTML element
 * @param nodeName - node name
 * @param attributes - `name: value` dictionary
 * @param eventListeners - `name: value` dictionary
 */
export function createElement(nodeName: string, attributes: { [name: string]: any; } = {}, eventListeners: { [name: string]: ((...any) => any) | ((...any) => any)[]; } = {})
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


export interface ElementParams
{
	name: string;
	attributes?: { [name: string]: string };
	listeners?: { [name: string]: ((...any) => any) | ((...any) => any)[] };
	childNodes?: (ElementParams | HTMLElement | Text | ChildNode | string)[];
	[any: string]: any;
}

/** Create HTML node tree */
export function createNodeTree(nodeTree: ElementParams): HTMLElement
{
	const name       = nodeTree.name;
	const listeners  = nodeTree.listeners;
	const childNodes = nodeTree.childNodes;

	delete nodeTree.name;
	delete nodeTree.listeners;
	delete nodeTree.childNodes;
	delete nodeTree.attributes;

	const rootNode = createElement(name, nodeTree, listeners);

	for (const childNode of childNodes || [])
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

/**
 * Converts UNIX timestamp to time date string
 */
export function unixToStr(timestamp: number)
{
	if (!timestamp)
		return "—";

	const date = new Date(timestamp * 1000);

	return `${ date.getHours() }:${ date.getMinutes().toString().padStart(2, "0") } ${ date.getFullYear() }-${ (date.getMonth() + 1).toString().padStart(2, "0") }-${ date.getDate().toString().padStart(2, "0") }`;
}

/**
 * Stops event propagation if the left mouse button is being used
 */
export function stopLMBPropagation(e: MouseEvent)
{
	if (e.button != 0)
		return;
	e.stopPropagation();
}
