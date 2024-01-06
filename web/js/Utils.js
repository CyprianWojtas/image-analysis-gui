export function createElement(nodeName, attributes = {}, eventListeners = {}) {
    let element = document.createElement(nodeName);
    for (let attribute in attributes)
        element.setAttribute(attribute, attributes[attribute]);
    for (let name in eventListeners) {
        let listenerFn = eventListeners[name];
        if (typeof listenerFn == "function")
            element.addEventListener(name, listenerFn);
        else
            for (let listener of listenerFn)
                element.addEventListener(name, listener);
    }
    return element;
}
export function createNodeTree(nodeTree) {
    const name = nodeTree.name;
    const listeners = nodeTree.listeners;
    const childNodes = nodeTree.childNodes;
    delete nodeTree.name;
    delete nodeTree.listeners;
    delete nodeTree.childNodes;
    delete nodeTree.attributes;
    const rootNode = createElement(name, nodeTree, listeners);
    for (const childNode of childNodes || []) {
        if (typeof childNode == "string" || childNode instanceof HTMLElement || childNode instanceof Text) {
            rootNode.append(childNode);
            continue;
        }
        rootNode.append(createNodeTree(childNode));
    }
    return rootNode;
}
export function unixToStr(timestamp) {
    if (!timestamp)
        return "—";
    const date = new Date(timestamp * 1000);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")} ${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}
export function stopLMBPropagation(e) {
    if (e.button != 0)
        return;
    e.stopPropagation();
}
//# sourceMappingURL=Utils.js.map