import { createElement, createNodeTree } from "./Utils.js";
import { marked } from "./lib/marked.esm.js";
import katex from "./lib/katex/auto-render.js";
import AssetLoader from "./editor/AssetLoader.js";
import { baseUrl as markedBaseUrl } from "./lib/marked-base-url.js";
import Settings from "./Settings.js";
import hljs from "./lib/highlight.js";
class Wiki {
    static init() {
        this.searchInput = createElement("input", {
            class: "nodesSearchInput",
            placeholder: "Search..."
        }, {
            input: () => {
                this.search(this.searchInput.value);
            }
        });
        this.nodesBox = createElement("div", { class: "nodesListBox" });
        this.searchBox = createElement("div", { class: "nodesListBox nodesSearchBox", style: "display: none" });
        this.articleTitle = createElement("div", { class: "title" });
        this.articleContent = createElement("div", { class: "articleContent" });
        this.element = createNodeTree({
            name: "div",
            class: "wikiBox fullscreenPage hidden",
            childNodes: [
                {
                    name: "div",
                    class: "nodes",
                    childNodes: [
                        this.searchInput,
                        {
                            name: "div",
                            class: "listBox",
                            childNodes: [
                                this.nodesBox,
                                this.searchBox
                            ]
                        }
                    ]
                },
                {
                    name: "div",
                    class: "article",
                    childNodes: [
                        this.articleTitle,
                        {
                            name: "button",
                            class: "closeButton",
                            listeners: { click: () => this.close() },
                            childNodes: [{ name: "i", class: "icon-cancel" }]
                        },
                        this.articleContent
                    ]
                }
            ]
        });
        this.loadGroups();
        document.body.append(this.element);
    }
    static loadGroups() {
        const groupedNodes = {};
        const ungroupedNodes = [];
        this.nodesBox.innerHTML = "";
        for (const nodeId in AssetLoader.nodesData) {
            const groupId = AssetLoader.nodesData[nodeId].group;
            if (AssetLoader.nodesGroups[groupId]) {
                if (!groupedNodes[groupId])
                    groupedNodes[groupId] = [];
                groupedNodes[groupId].push(nodeId);
            }
            else
                ungroupedNodes.push(nodeId);
        }
        for (const groupId in AssetLoader.nodesGroups) {
            const groupDetails = AssetLoader.nodesGroups[groupId];
            this.nodesBox.append(this.createGroupBox(groupId, groupDetails, groupedNodes[groupId]));
        }
        if (ungroupedNodes.length)
            this.nodesBox.append(this.createGroupBox("_unogranised", { name: "Unogranised" }, ungroupedNodes));
    }
    static search(searchText) {
        if (!searchText) {
            this.nodesBox.style.display = "block";
            this.searchBox.style.display = "none";
            return;
        }
        else {
            this.nodesBox.style.display = "none";
            this.searchBox.style.display = "block";
        }
        this.searchBox.innerHTML = "";
        searchText = searchText.toLowerCase();
        const foundInTheName = [];
        const foundInTheDescription = [];
        for (const nodeId in AssetLoader.nodesData) {
            const nodeType = AssetLoader.nodesData[nodeId];
            if (nodeType.name.toLowerCase().includes(searchText))
                foundInTheName.push(this.createNodeBox(nodeId, nodeType));
            else if (nodeType.description.toLowerCase().includes(searchText))
                foundInTheDescription.push(this.createNodeBox(nodeId, nodeType));
        }
        this.searchBox.append(...foundInTheName, ...foundInTheDescription);
        if (!this.searchBox.childNodes.length)
            this.searchBox.append(createNodeTree({ name: "div", class: "noResults", childNodes: ["No results..."] }));
    }
    static createGroupBox(groupId, group, nodes) {
        const nodesBox = createElement("div", { class: "nodeBox" });
        const groupDescription = createElement("div", { class: "groupDescription" });
        groupDescription.innerHTML = (group === null || group === void 0 ? void 0 : group.description) || "";
        const groupBox = createNodeTree({
            name: "div",
            class: `groupType groupTypeId_${groupId}`,
            style: `--node-colour: ${group.colour || "#333"}`,
            childNodes: [
                {
                    name: "div",
                    class: "groupTitle",
                    childNodes: [
                        (group === null || group === void 0 ? void 0 : group.name) || groupId
                    ],
                    listeners: {
                        click: e => {
                            e.stopPropagation();
                            Wiki.openArticle(groupId);
                        }
                    }
                },
                {
                    name: "div",
                    class: "content",
                    childNodes: [
                        groupDescription,
                        nodesBox
                    ]
                }
            ]
        });
        for (const nodeId of nodes || []) {
            const nodeType = AssetLoader.nodesData[nodeId];
            nodesBox.append(this.createNodeBox(nodeId, nodeType));
        }
        return groupBox;
    }
    static createNodeBox(nodeId, node) {
        var _a;
        const nodeBox = createNodeTree({
            name: "div",
            class: `nodeType nodeTypeId_${nodeId}${this.openedArticleId == nodeId ? " selected" : ""}`,
            style: `--node-colour: ${((_a = AssetLoader.nodesGroups[node.group]) === null || _a === void 0 ? void 0 : _a.colour) || "#333"}`,
            listeners: {
                click: e => {
                    e.stopPropagation();
                    Wiki.openArticle(nodeId);
                }
            },
            childNodes: [
                {
                    name: "div",
                    class: "nodeTitle",
                    childNodes: [
                        (node === null || node === void 0 ? void 0 : node.name) || nodeId
                    ]
                }
            ]
        });
        return nodeBox;
    }
    static openArticle(nodeId) {
        var _a, _b, _c, _d;
        if (!AssetLoader.nodesData[nodeId])
            return;
        const nodeData = AssetLoader.nodesData[nodeId];
        this.openedArticleId = nodeId;
        (_a = this.nodesBox.querySelector(`.nodeType.selected`)) === null || _a === void 0 ? void 0 : _a.classList.remove("selected");
        (_b = this.searchBox.querySelector(`.nodeType.selected`)) === null || _b === void 0 ? void 0 : _b.classList.remove("selected");
        (_c = this.nodesBox.querySelector(`.nodeType.nodeTypeId_${CSS.escape(nodeId)}`)) === null || _c === void 0 ? void 0 : _c.classList.add("selected");
        (_d = this.searchBox.querySelector(`.nodeType.nodeTypeId_${CSS.escape(nodeId)}`)) === null || _d === void 0 ? void 0 : _d.classList.add("selected");
        this.element.classList.remove("hidden");
        this.articleTitle.innerHTML = "";
        this.articleTitle.append(nodeData.name);
        let articleText = nodeData.wiki || nodeData.description;
        marked.use(markedBaseUrl(`/modules/${nodeData.path}`));
        this.articleContent.innerHTML = marked.parse(articleText);
        katex(this.articleContent, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
            ]
        });
        for (const pre of this.articleContent.querySelectorAll("pre"))
            hljs.highlightElement(pre);
        if (Settings.get("wiki.showCode")) {
            (async () => {
                console.log(nodeData);
                const code = await (await fetch(`/modules/${nodeData.codePath}`)).text();
                const pre = createElement("pre", { class: "language-python" });
                pre.append(code);
                hljs.highlightElement(pre);
                this.articleContent.append(createNodeTree({ name: "h2", childNodes: ["Node Code"] }), pre);
                if (nodeData.customClass) {
                    const codeJS = await (await fetch(`/api/nodes/${nodeId}`)).text();
                    const pre = createElement("pre", { class: "language-javascript" });
                    pre.append(codeJS);
                    hljs.highlightElement(pre);
                    this.articleContent.append(createNodeTree({ name: "h2", childNodes: ["Node Class Code"] }), pre);
                }
            })();
        }
    }
    static close() {
        this.element.classList.add("hidden");
    }
}
Wiki.openedArticleId = "";
export default Wiki;
//# sourceMappingURL=Wiki.js.map