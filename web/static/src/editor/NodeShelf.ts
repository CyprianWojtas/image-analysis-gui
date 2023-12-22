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

		for (const nodeId in AssetLoader.nodesData)
		{
			const nodeType = AssetLoader.nodesData[nodeId];
			this.nodesBox.append(this.createNodeBox(nodeId, nodeType));
		}
	}

	private createNodeBox(nodeId: string, node)
	{
		const nodeDescription = createElement("div", { class: "nodeDescription" });
		nodeDescription.innerHTML = node?.description || "";

		const nodeBox = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes:
				{
					class: `nodeType nodeTypeId_${ nodeId }`,
					draggable: "true"
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
							node?.name || "New Node",
							{
								name: "button",
								attributes:
								{
									class: "wikiLink"
								},
								childNodes: [ "?" ],
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