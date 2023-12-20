import { createElement, createNodeTree } from "../Utils.js";
import { marked } from "../lib/marked.esm.js";
import katex from "../lib/katex/auto-render.js";

export default
class Wiki
{
	static element: HTMLDivElement;

	static nodes: {[key: string]: any} = {};

	private static searchBox: HTMLInputElement;
	private static nodesListBox: HTMLDivElement;
	private static articleTitle: HTMLDivElement;
	private static articleContent: HTMLDivElement;

	static init()
	{
		this.searchBox = <HTMLInputElement>createElement("input",
			{
				class: "nodesSearchBox",
			},
			{
				input: () =>
				{
					this.filterNodes()
				}
			}
		);

		this.nodesListBox = <HTMLDivElement>createElement("div", { class: "nodesListBox" } );
		this.articleTitle = <HTMLDivElement>createElement("div", { class: "title" } );
		this.articleContent = <HTMLDivElement>createElement("div", { class: "articleContent" } );
		
		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes:
				{
					class: "wikiBox hidden"
				},
				childNodes:
				[
					{
						name: "div",
						attributes:
						{
							class: "nodes"
						},
						childNodes:
						[
							this.searchBox,
							this.nodesListBox
						]
					},
					{
						name: "div",
						attributes:
						{
							class: "article"
						},
						childNodes:
						[
							this.articleTitle,
							{
								name: "button",
								attributes: { class: "closeButton" },
								listeners: { click: () => this.close() },
								childNodes: [ "x" ]
							},
							this.articleContent
						]
					}
				]
			}
		);

		document.body.append(this.element);
	}

	static addNodes(nodes: { [key: string]: any; })
	{
		this.nodes = nodes;
		this.filterNodes();
	}

	static filterNodes()
	{
		this.nodesListBox.innerHTML = "";

		for (const nodeId in this.nodes)
		{
			const node = this.nodes[nodeId];

			this.nodesListBox.append(createNodeTree(
				{
					name: "button",
					attributes:
					{
						class: `node node_${ nodeId }`
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
								node?.name || "New Node"
							]
						}
					],
					listeners:
					{
						click: () => this.openArticle(nodeId)
					}
				}
			));
		}
	}

	static openArticle(nodeId: string)
	{
		if (!this.nodes[nodeId])
			return;

			this.nodesListBox.querySelector(`.node.selected`)?.classList.remove("selected");
			this.nodesListBox.querySelector(`.node.node_${ nodeId.replace("/", "\\/") }`)?.classList.add("selected");

		this.element.classList.remove("hidden");

		this.articleTitle.innerHTML = "";
		this.articleTitle.append(this.nodes[nodeId].name);

		let articleText: string = this.nodes[nodeId].wiki || this.nodes[nodeId].description;

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
