import { createElement, createNodeTree } from "../Utils.js";
import AssetLoader from "./AssetLoader.js";
import Wiki from "./Wiki.js";

export default
class NodeShelf
{
	element: HTMLDivElement;

	private nodesBox: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "nodes" });

	constructor()
	{
		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes:
				{
					class: "nodeShelf"
				},
				childNodes:
				[
					{
						name: "h1",
						childNodes:
						[
							"Nodes"
						]
					},
					this.nodesBox
				]
			}
		);

		const groupedNodes = {};
		const ungroupedNodes = [];

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

	private createGroupBox(groupId: string, group: any, nodes: string[])
	{
		const nodesBox = createElement("div", { class: "nodeBox" });
		const groupDescription = createElement("div", { class: "groupDescription" });
		groupDescription.innerHTML = group?.description || "";

		const groupBox = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes:
				{
					class: `groupType groupTypeId_${ groupId }`
				},
				childNodes:
				[
					{
						name: "div",
						attributes:
						{
							class: "groupTitle"
						},
						childNodes:
						[
							group?.name || groupId,
							{
								name: "button",
								attributes:
								{
									class: "wikiLink btn-circled"
								},
								childNodes: [ { name: "i", attributes: { class: "icon-help" } } ],
								listeners:
								{
									click: e =>
									{
										e.stopPropagation();
										Wiki.openArticle(groupId);
									}
								}
							}
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
						attributes: { class: "content" },
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
				attributes:
				{
					class: `nodeType nodeTypeId_${ nodeId }`,
					draggable: "true",
					style: `--node-colour: ${ AssetLoader.nodesGroups[node.group]?.colour || "#333" }`
				},
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
						attributes:
						{
							class: "nodeTitle"
						},
						childNodes:
						[
							node?.name || nodeId,
							{
								name: "button",
								attributes:
								{
									class: "wikiLink btn-circled"
								},
								childNodes: [ { name: "i", attributes: { class: "icon-help" } } ],
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