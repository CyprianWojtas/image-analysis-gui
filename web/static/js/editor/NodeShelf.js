import { createElement, createNodeTree } from "../Utils.js";
export default class NodeShelf {
    constructor() {
        this.nodesBox = createElement("div", { class: "nodes" });
        this.element = createNodeTree({
            name: "div",
            attributes: {
                class: "nodeShelf"
            },
            childNodes: [
                {
                    name: "h1",
                    childNodes: [
                        "Nodes"
                    ]
                },
                this.nodesBox
            ]
        });
    }
    addNodes(avaliableNodes, avaliableVariableTypes) {
        this.avaliableNodes = avaliableNodes;
        this.avaliableVariableTypes = avaliableVariableTypes;
        for (const nodeId in this.avaliableNodes) {
            const nodeType = this.avaliableNodes[nodeId];
            this.nodesBox.append(this.createNodeBox(nodeId, nodeType));
        }
    }
    createNodeBox(nodeId, node) {
        const nodeDescription = createElement("div", { class: "nodeDescription" });
        nodeDescription.innerHTML = (node === null || node === void 0 ? void 0 : node.description) || "";
        const nodeBox = createNodeTree({
            name: "div",
            attributes: {
                class: `nodeType nodeTypeId_${nodeId}`,
                draggable: "true"
            },
            listeners: {
                dragstart: e => {
                    e.dataTransfer.setData("nodeId", nodeId);
                }
            },
            childNodes: [
                {
                    name: "div",
                    attributes: {
                        class: "nodeTitle"
                    },
                    childNodes: [
                        (node === null || node === void 0 ? void 0 : node.name) || "New Node"
                    ],
                    listeners: {
                        click: () => {
                            nodeBox.classList.toggle("expanded");
                        }
                    }
                },
                nodeDescription
            ]
        });
        return nodeBox;
    }
}
//# sourceMappingURL=NodeShelf.js.map