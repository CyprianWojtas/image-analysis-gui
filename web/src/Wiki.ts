import { createElement, createNodeTree } from "./Utils.js";
import { marked } from "./lib/marked.esm.js";
import katex from "./lib/katex/auto-render.js";
import AssetLoader from "./editor/AssetLoader.js";
import { baseUrl as markedBaseUrl } from "./lib/marked-base-url.js";

export default
class Wiki
{
	static element: HTMLDivElement;

	private static searchInput: HTMLInputElement;
	private static nodesBox: HTMLDivElement;
	private static searchBox: HTMLDivElement;
	private static articleTitle: HTMLDivElement;
	private static articleContent: HTMLDivElement;

	static openedArticleId: string = "";

	static init()
	{
		this.searchInput = <HTMLInputElement>createElement("input",
			{
				class: "nodesSearchInput",
				placeholder: "Search..."
			},
			{
				input: () =>
				{
					this.search(this.searchInput.value)
				}
			}
		);

		this.nodesBox       = <HTMLDivElement>createElement("div", { class: "nodesListBox" } );
		this.searchBox      = <HTMLDivElement>createElement("div", { class: "nodesListBox nodesSearchBox", style: "display: none" } );
		this.articleTitle   = <HTMLDivElement>createElement("div", { class: "title" } );
		this.articleContent = <HTMLDivElement>createElement("div", { class: "articleContent" } );
		
		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				class: "wikiBox fullscreenPage hidden",
				childNodes:
				[
					{
						name: "div",
						class: "nodes",
						childNodes:
						[
							this.searchInput,
							{
								name: "div",
								class: "listBox",
								childNodes:
								[
									this.nodesBox,
									this.searchBox
								]
							}
						]
					},
					{
						name: "div",
						class: "article",
						childNodes:
						[
							this.articleTitle,
							{
								name: "button",
								class: "closeButton",
								listeners: { click: () => this.close() },
								childNodes: [ { name: "i", class: "icon-cancel" } ]
							},
							this.articleContent
						]
					}
				]
			}
		);

		this.loadGroups();

		document.body.append(this.element);
	}

	private static loadGroups()
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

	static search(searchText: string)
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
			this.searchBox.append(createNodeTree({ name: "div", class: "noResults", childNodes: [ "No results..." ] }));
	}

	private static createGroupBox(groupId: string, group: any, nodes: string[])
	{
		const nodesBox = createElement("div", { class: "nodeBox" });
		const groupDescription = createElement("div", { class: "groupDescription" });
		groupDescription.innerHTML = group?.description || "";

		const groupBox = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				class: `groupType groupTypeId_${ groupId }`,
				style: `--node-colour: ${ group.colour || "#333" }`,
				childNodes:
				[
					{
						name: "div",
						class: "groupTitle",
						childNodes:
						[
							group?.name || groupId
						],
						listeners:
						{
							click: e =>
							{
								e.stopPropagation();
								Wiki.openArticle(groupId);
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

	private static createNodeBox(nodeId: string, node: any)
	{
		const nodeBox = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				class: `nodeType nodeTypeId_${ nodeId }${ this.openedArticleId == nodeId ? " selected" : "" }`,
				style: `--node-colour: ${ AssetLoader.nodesGroups[node.group]?.colour || "#333" }`,
				listeners:
				{
					click: e =>
					{
						e.stopPropagation();
						Wiki.openArticle(nodeId);
					}
				},
				childNodes:
				[
					{
						name: "div",
						class: "nodeTitle",
						childNodes:
						[
							node?.name || nodeId
						]
					}
				]
			}
		);

		return nodeBox;
	}

	// ====== Opening / Closing ====== //

	static openArticle(nodeId: string)
	{
		if (!AssetLoader.nodesData[nodeId])
			return;

		this.openedArticleId = nodeId;

		this.nodesBox.querySelector(`.nodeType.selected`)?.classList.remove("selected");
		this.searchBox.querySelector(`.nodeType.selected`)?.classList.remove("selected");
		this.nodesBox.querySelector(`.nodeType.nodeTypeId_${ CSS.escape(nodeId) }`)?.classList.add("selected");
		this.searchBox.querySelector(`.nodeType.nodeTypeId_${ CSS.escape(nodeId) }`)?.classList.add("selected");

		this.element.classList.remove("hidden");

		this.articleTitle.innerHTML = "";
		this.articleTitle.append(AssetLoader.nodesData[nodeId].name);

		let articleText: string = AssetLoader.nodesData[nodeId].wiki || AssetLoader.nodesData[nodeId].description;

		marked.use(markedBaseUrl(`/modules/${ AssetLoader.nodesData[nodeId].path }`));

		this.articleContent.innerHTML = marked.parse(articleText);

		katex(this.articleContent,
			{
				delimiters:
				[
					{left: '$$', right: '$$', display: true},
					{left: '$', right: '$', display: false},
					{left: '\\(', right: '\\)', display: false},
					{left: '\\[', right: '\\]', display: true}
				]
			}
		);
	}

	static close()
	{
		this.element.classList.add("hidden");
	}
}
