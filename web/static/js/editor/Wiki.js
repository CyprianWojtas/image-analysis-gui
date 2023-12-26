import { createElement, createNodeTree } from "../Utils.js";
import { marked } from "../lib/marked.esm.js";
import katex from "../lib/katex/auto-render.js";
class Wiki {
    static init() {
        this.searchBox = createElement("input", {
            class: "nodesSearchBox",
        }, {
            input: () => {
                this.filterNodes();
            }
        });
        this.nodesListBox = createElement("div", { class: "nodesListBox" });
        this.articleTitle = createElement("div", { class: "title" });
        this.articleContent = createElement("div", { class: "articleContent" });
        this.element = createNodeTree({
            name: "div",
            attributes: {
                class: "wikiBox fullscreenPage hidden"
            },
            childNodes: [
                {
                    name: "div",
                    attributes: {
                        class: "nodes"
                    },
                    childNodes: [
                        this.searchBox,
                        this.nodesListBox
                    ]
                },
                {
                    name: "div",
                    attributes: {
                        class: "article"
                    },
                    childNodes: [
                        this.articleTitle,
                        {
                            name: "button",
                            attributes: { class: "closeButton" },
                            listeners: { click: () => this.close() },
                            childNodes: [{ name: "i", attributes: { class: "icon-cancel" } }]
                        },
                        this.articleContent
                    ]
                }
            ]
        });
        document.body.append(this.element);
    }
    static addNodes(nodes) {
        this.nodes = nodes;
        this.filterNodes();
    }
    static filterNodes() {
        this.nodesListBox.innerHTML = "";
        for (const nodeId in this.nodes) {
            const node = this.nodes[nodeId];
            this.nodesListBox.append(createNodeTree({
                name: "button",
                attributes: {
                    class: `node node_${nodeId}`
                },
                childNodes: [
                    {
                        name: "div",
                        attributes: {
                            class: "nodeTitle"
                        },
                        childNodes: [
                            (node === null || node === void 0 ? void 0 : node.name) || "New Node"
                        ]
                    }
                ],
                listeners: {
                    click: () => this.openArticle(nodeId)
                }
            }));
        }
    }
    static openArticle(nodeId) {
        var _a, _b;
        if (!this.nodes[nodeId])
            return;
        (_a = this.nodesListBox.querySelector(`.node.selected`)) === null || _a === void 0 ? void 0 : _a.classList.remove("selected");
        (_b = this.nodesListBox.querySelector(`.node.node_${nodeId.replace("/", "\\/")}`)) === null || _b === void 0 ? void 0 : _b.classList.add("selected");
        this.element.classList.remove("hidden");
        this.articleTitle.innerHTML = "";
        this.articleTitle.append(this.nodes[nodeId].name);
        let articleText = this.nodes[nodeId].wiki || this.nodes[nodeId].description;
        this.articleContent.innerHTML = marked.parse(articleText);
        katex(this.articleContent, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
            ]
        });
    }
    static close() {
        this.element.classList.add("hidden");
    }
}
Wiki.nodes = {};
export default Wiki;
//# sourceMappingURL=Wiki.js.map