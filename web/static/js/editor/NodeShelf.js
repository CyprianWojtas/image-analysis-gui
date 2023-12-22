import { createElement, createNodeTree } from "../Utils.js";
import AssetLoader from "./AssetLoader.js";
import Wiki from "./Wiki.js";
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
        for (const nodeId in AssetLoader.nodesData) {
            const nodeType = AssetLoader.nodesData[nodeId];
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
                        (node === null || node === void 0 ? void 0 : node.name) || "New Node",
                        {
                            name: "button",
                            attributes: {
                                class: "wikiLink"
                            },
                            childNodes: ["?"],
                            listeners: {
                                click: e => {
                                    e.stopPropagation();
                                    Wiki.openArticle(nodeId);
                                }
                            }
                        }
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