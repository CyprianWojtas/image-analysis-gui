import { createElement, createNodeTree } from "../Utils.js";
import AssetLoader from "./AssetLoader.js";
import Wiki from "../Wiki.js";
import { NodeTemplate } from "../apiTypes/Analysis.js";

export default
class NodeShelf
{
	element: HTMLDivElement;

	private nodesBox: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "nodes" });
	private searchBox: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "nodes", style: "display: none" });
	private favouritesBox: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "favourites" });
	private searchInput: HTMLInputElement = <HTMLInputElement>createElement(
		"input",
		{ class: "searchInput", placeholder: "Search..." },
		{ input: () => this.search(this.searchInput.value) }
	);

	private favouritedNodes: string[] = [ "defaults.image_arithmetics.subtract" ];

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

		this.favouritedNodes = JSON.parse(localStorage.getItem("favouritedNodes") || "[]");

		this.loadGroups();
	}

	private loadGroups()
	{
		const groupedNodes = {};
		const ungroupedNodes = [];

		this.nodesBox.innerHTML = "";
		this.nodesBox.append(this.favouritesBox);

		for (const nodeId of this.favouritedNodes)
		{
			const node = AssetLoader.nodesData[nodeId];
			if (node)
				this.favouritesBox.append(this.createNodeBox(nodeId, node));
		}

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

		for (const nodeId of nodes || [])
		{
			const nodeType = AssetLoader.nodesData[nodeId];
			nodesBox.append(this.createNodeBox(nodeId, nodeType));
		}

		return groupBox;
	}

	/**
	 * Creates the draggable node element
	 */
	private createNodeBox(nodeId: string, node: NodeTemplate, favourited: boolean = false)
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
								name: "div",
								class: "buttons",
								childNodes:
								[
									{
										name: "button",
										class: "favBtn btn-circled",
										childNodes: [ { name: "i", class: this.favouritedNodes.includes(nodeId) ? "icon-star" : "icon-star-empty" } ],
										listeners:
										{
											click: e =>
											{
												e.stopPropagation();
												this.toggleNodeFavourite(nodeId);
												e.target.blur();
												e.target.parentNode.blur();
											}
										}
									},
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
								]
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

	favouriteNode(nodeId: string)
	{
		for (const favIcon of this.element.querySelectorAll(`.nodeTypeId_${ CSS.escape(nodeId) } .favBtn i`))
		{
			favIcon.classList.remove("icon-star-empty");
			favIcon.classList.add("icon-star");
		}
		this.favouritedNodes.unshift(nodeId);

		const node = AssetLoader.nodesData[nodeId];
		if (node)
			this.favouritesBox.prepend(this.createNodeBox(nodeId, node));

		localStorage.setItem("favouritedNodes", JSON.stringify(this.favouritedNodes));
	}

	unfavouriteNode(nodeId: string)
	{
		this.favouritesBox.querySelector(`.nodeTypeId_${ CSS.escape(nodeId) }`)?.remove();

		const index = this.favouritedNodes.indexOf(nodeId);
		if (index > -1)
			this.favouritedNodes.splice(index, 1);
		
		for (const favIcon of this.element.querySelectorAll(`.nodeTypeId_${ CSS.escape(nodeId) } .favBtn i`))
		{
			favIcon.classList.add("icon-star-empty");
			favIcon.classList.remove("icon-star");
		}

		localStorage.setItem("favouritedNodes", JSON.stringify(this.favouritedNodes));
	}

	toggleNodeFavourite(nodeId: string)
	{
		if (this.favouritedNodes.includes(nodeId))
			this.unfavouriteNode(nodeId);
		else
			this.favouriteNode(nodeId);
	}
}
