import { createElement, createNodeTree } from "../Utils.js";
import AssetLoader from "./AssetLoader.js";
import Wiki from "./Wiki.js";

export default
class NodeShelf
{
	element: HTMLDivElement;

	private nodesBox: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "nodes" });
	private searchBox: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "nodes", style: "display: none" });
	private searchInput: HTMLInputElement = <HTMLInputElement>createElement(
		"input",
		{ class: "searchInput", placeholder: "Search..." },
		{ input: () => this.search(this.searchInput.value) }
	);

	constructor()
	{
		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				class: "nodeShelf",
				childNodes:
				[
					{
						name: "h1",
						childNodes:
						[
							"Nodes"
						]
					},
					this.searchInput,
					this.nodesBox,
					this.searchBox
				]
			}
		);

		this.loadGroups();
	}

	private loadGroups()
	{
		const groupedNodes = {};
		const ungroupedNodes = [];

		this.nodesBox.innerHTML = "";

		for (const nodeId in AssetLoader.nodesData)
		{
			const groupId = AssetLoader.nodesData[nodeId].group;
			if (AssetLoader.nodesGroups[groupId])
			{
				if (!groupedNodes[groupId])
					groupedNodes[groupId] = [];
				
				groupedNodes[groupId].push(nodeId);
			}
			else
				ungroupedNodes.push(nodeId);
		}

		for (const groupId in AssetLoader.nodesGroups)
		{
			const groupDetails = AssetLoader.nodesGroups[groupId];
			this.nodesBox.append(this.createGroupBox(groupId, groupDetails, groupedNodes[groupId]));
		}

		if (ungroupedNodes.length)
			this.nodesBox.append(this.createGroupBox("_unogranised", { name: "Unogranised" }, ungroupedNodes));
	}

	search(searchText: string)
	{
		if (!searchText)
		{
			this.nodesBox.style.display  = "block";
			this.searchBox.style.display = "none";
			return;
		}
		else
		{
			this.nodesBox.style.display  = "none";
			this.searchBox.style.display = "block";
		}

		this.searchBox.innerHTML = "";
		searchText = searchText.toLowerCase();

		const foundInTheName = [];
		const foundInTheDescription = [];

		for (const nodeId in AssetLoader.nodesData)
		{
			const nodeType = AssetLoader.nodesData[nodeId];

			if (nodeType.name.toLowerCase().includes(searchText))
				foundInTheName.push(this.createNodeBox(nodeId, nodeType));
			else if (nodeType.description.toLowerCase().includes(searchText))
				foundInTheDescription.push(this.createNodeBox(nodeId, nodeType));
		}

		this.searchBox.append(...foundInTheName, ...foundInTheDescription);
		if (!this.searchBox.childNodes.length)
			this.searchBox.append(createNodeTree({ name: "div",  class: "noResults", childNodes: [ "No results..." ] }));
	}

	private createGroupBox(groupId: string, group: any, nodes: string[])
	{
		const nodesBox = createElement("div", { class: "nodeBox" });
		const groupDescription = createElement("div", { class: "groupDescription" });
		groupDescription.innerHTML = group?.description || "";

		const groupBox = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				class: `groupType groupTypeId_${ groupId }`,
				childNodes:
				[
					{
						name: "div",
						class: "groupTitle",
						childNodes:
						[
							group?.name || groupId,
							// {
							// 	name: "button",
							// 	class: "wikiLink btn-circled",
							// 	childNodes: [ { name: "i", class: "icon-help" } ],
							// 	listeners:
							// 	{
							// 		click: e =>
							// 		{
							// 			e.stopPropagation();
							// 			Wiki.openArticle(groupId);
							// 		}
							// 	}
							// }
						],
						listeners:
						{
							click: () =>
							{
								groupBox.classList.toggle("expanded");
							}
						}
					},
					{
						name: "div",
						class: "content",
						childNodes:
						[
							groupDescription,
							nodesBox
						]
					}
				]
			}
		);

		for (const nodeId of nodes)
		{
			const nodeType = AssetLoader.nodesData[nodeId];
			nodesBox.append(this.createNodeBox(nodeId, nodeType));
		}

		return groupBox;
	}

	private createNodeBox(nodeId: string, node: any)
	{
		const nodeDescription = createElement("div", { class: "nodeDescription" });
		nodeDescription.innerHTML = node?.description || "";

		const nodeBox = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				class: `nodeType nodeTypeId_${ nodeId }`,
				draggable: "true",
				style: `--node-colour: ${ AssetLoader.nodesGroups[node.group]?.colour || "#333" }`,
				listeners:
				{
					dragstart: e =>
					{
						e.dataTransfer.setData("nodeId", nodeId);
					}
				},
				childNodes:
				[
					{
						name: "div",
						class: "nodeTitle",
						childNodes:
						[
							node?.name || nodeId,
							{
								name: "button",
								class: "wikiLink btn-circled",
								childNodes: [ { name: "i", class: "icon-help" } ],
								listeners:
								{
									click: e =>
									{
										e.stopPropagation();
										Wiki.openArticle(nodeId);
									}
								}
							}
						],
						listeners:
						{
							click: () =>
							{
								nodeBox.classList.toggle("expanded");
							}
						}
					},
					nodeDescription
				]
			}
		);

		return nodeBox;
	}
}