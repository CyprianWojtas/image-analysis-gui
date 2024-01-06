import { createElement, createNodeTree } from "../Utils.js";
import AssetLoader from "./AssetLoader.js";
import Wiki from "../Wiki.js";
export default class NodeShelf {
    constructor() {
        this.nodesBox = createElement("div", { class: "nodes" });
        this.searchBox = createElement("div", { class: "nodes", style: "display: none" });
        this.searchInput = createElement("input", { class: "searchInput", placeholder: "Search..." }, { input: () => this.search(this.searchInput.value) });
        this.element = createNodeTree({
            name: "div",
            class: "nodeShelf",
            childNodes: [
                {
                    name: "h1",
                    childNodes: [
                        "Nodes"
                    ]
                },
                this.searchInput,
                this.nodesBox,
                this.searchBox
            ]
        });
        this.loadGroups();
    }
    loadGroups() {
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
    search(searchText) {
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
    createGroupBox(groupId, group, nodes) {
        const nodesBox = createElement("div", { class: "nodeBox" });
        const groupDescription = createElement("div", { class: "groupDescription" });
        groupDescription.innerHTML = (group === null || group === void 0 ? void 0 : group.description) || "";
        const groupBox = createNodeTree({
            name: "div",
            class: `groupType groupTypeId_${groupId}`,
            childNodes: [
                {
                    name: "div",
                    class: "groupTitle",
                    childNodes: [
                        (group === null || group === void 0 ? void 0 : group.name) || groupId,
                    ],
                    listeners: {
                        click: () => {
                            groupBox.classList.toggle("expanded");
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
    createNodeBox(nodeId, node) {
        var _a;
        const nodeDescription = createElement("div", { class: "nodeDescription" });
        nodeDescription.innerHTML = (node === null || node === void 0 ? void 0 : node.description) || "";
        const nodeBox = createNodeTree({
            name: "div",
            class: `nodeType nodeTypeId_${nodeId}`,
            draggable: "true",
            style: `--node-colour: ${((_a = AssetLoader.nodesGroups[node.group]) === null || _a === void 0 ? void 0 : _a.colour) || "#333"}`,
            listeners: {
                dragstart: e => {
                    e.dataTransfer.setData("nodeId", nodeId);
                }
            },
            childNodes: [
                {
                    name: "div",
                    class: "nodeTitle",
                    childNodes: [
                        (node === null || node === void 0 ? void 0 : node.name) || nodeId,
                        {
                            name: "button",
                            class: "wikiLink btn-circled",
                            childNodes: [{ name: "i", class: "icon-help" }],
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