import Settings from "../Settings.js";
import SettingsPage from "../SettingsPage.js";
import SocketConnection, { AnalysisStatusEvent, AnalysisUpdatedEvent } from "../SocketConnection.js";
import { createElement, createNodeTree } from "../Utils.js";
import { Analysis, NodeSerialisable } from "../apiTypes/Analysis.js";
import FilePicker from "../FilePicker.js";
import AssetLoader from "./AssetLoader.js";
import Node, { NodeChangeEvent } from "./Node.js";
import NodeShelf from "./NodeShelf.js";
import { NodeVariable, VariableDragEndEvent, VariableDragStartEvent } from "./NodeVariables.js";


export default
class NodeEditor
{
	element: HTMLDivElement;

	filePicker: FilePicker;

	private c: HTMLCanvasElement = document.createElement("canvas");
	private ctx: CanvasRenderingContext2D = this.c.getContext("2d");

	private headerEl: HTMLDivElement = <HTMLDivElement>createNodeTree(
		{
			name: "div",
			class: "header",
			childNodes:
			[
				{
					name: "input",
					listeners:
					{
						blur: e =>
						{
							if (e.target.value == this.metadata.title)
								return;

							this.metadata.title = e.target.value;
							this.historyPush();
						}
					}
				},
				{
					name: "button",
					class: "filesBtn",
					childNodes: [ "Files" ],
					listeners:
					{
						click: () => this.filePicker.open()
					}
				},
				{
					name: "button",
					class: "settingsBtn",
					childNodes: [ "Settings" ],
					listeners:
					{
						click: () => SettingsPage.open()
					}
				},
				{
					name: "button",
					class: "runAnalysis",
					childNodes: [ "Run Analysis" ],
					listeners:
					{
						click: () =>
						{
							if (this.analysisActive)
								this.turnOff(true);
							else
							{
								this.turnOn();
							}
						}
					}
				},
				{
					name: "button",
					class: "playPauseButton",
					childNodes: [ { name: "i", class: "icon-pause" } ],
					listeners:
					{
						click: () => this.setPaused(!this.analysisPaused)
					}
				}
			]
		}
	);

	private scaleInputEl: HTMLInputElement = <HTMLInputElement>createElement(
		"input",
		{ class: "scaleInput", value: "100", type: "number" },
		{
			change: () => this.setScale(this.scaleInputEl.valueAsNumber / 100, 0.5, 0.5, false)
		}
	);
	private scaleBoxEl: HTMLDivElement = <HTMLDivElement>createNodeTree(
		{
			name: "div",
			class: "scaleBox",
			childNodes:
			[
				this.scaleInputEl,
				"%",
				{
					name: "button",
					class: "scalePlus",
					childNodes: [ { name: "i", class: "icon-plus" } ],
					listeners:
					{
						click: () => this.setScale(this.scale * 1.1)
					}
				},
				{
					name: "button",
					class: "scaleMinus",
					childNodes: [ { name: "i", class: "icon-minus" } ],
					listeners:
					{
						click: () => this.setScale(this.scale / 1.1)
					}
				}
			]
		}
	);

	private nodeContainer: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "nodeContainer" });
	
	posX: number = 0;
	posY: number = 0;
	scale: number = 1;

	private nodeShelf: NodeShelf = new NodeShelf();

	nodes: {[key: string]: Node} = {};
	nodeConnections: {[input: string]: string} = {};
	metadata: {[key: string]: any} = {};

	analysisId: string;
	analysisActive: boolean = false;
	analysisPaused: boolean = false;
	history: string[] = [];

	constructor()
	{
		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				class: "nodeEditor",
				childNodes:
				[
					this.headerEl,
					{
						name: "div",
						class: "nodesBox",
						childNodes:
						[
							this.c,
							this.nodeContainer
						],
						listeners:
						{
							dragover: e => e.preventDefault(),
							drop: e =>
							{
								e.preventDefault();
								
								const nodeId = e.dataTransfer.getData("nodeId");

								if (!nodeId)
									return;
								
								this.addNode(nodeId, null, (e.clientX - this.posX) / this.scale, (e.clientY - this.posY) / this.scale);
								this.historyPush();
							},
							// Dragging canvas around
							mousedown: e => this.dragStart(e),
							// Scaling the canvas
							wheel: e =>
							{
								const proportionX = e.clientX / window.innerWidth;
								const proportionY = e.clientY / window.innerHeight;
								
								if (e.wheelDelta > 0)
									this.setScale(this.scale * 1.1, proportionX, proportionY);
								else
									this.setScale(this.scale / 1.1, proportionX, proportionY);
							}
						}
					},
					this.nodeShelf.element,
					this.scaleBoxEl
				]
			}
		);

		this.element.dataset.backgroundPattern = Settings.get("editor.background");
		Settings.addSettingsChangedListener("editor.background", e =>
		{
			this.element.dataset.backgroundPattern = e.value;
		});

		Settings.addSettingsChangedListener("editor.connectionStyle", () =>
		{
			this.redrawConnestions();
		});

		SocketConnection.addEventListener("analysis_status", (e: AnalysisStatusEvent) =>
		{
			if (e.analysisId != this.analysisId)
				return;

			for (const nodeId of e.solvedNodes)
				this.nodes[nodeId]?.markAsProcessed();

			for (const nodeId in e.errors)
				this.nodes[nodeId]?.markAsError(e.errors[nodeId]);

			if (e.active)
			{
				this.analysisActive = true;
				SocketConnection.getAnalysisData(this.analysisId);
				this.turnOn(false);
			}

			this.setPaused(e.paused);
		});

		SocketConnection.addEventListener("analysis_updated", (e: AnalysisUpdatedEvent) =>
		{
			if (e.analysisId != this.analysisId)
				return;

			if (!this.analysisPaused)
				SocketConnection.runAnalysis(this.analysisId);
		});
		

		document.body.addEventListener("keydown", e =>
		{
			if (e.ctrlKey && !e.shiftKey && e.code == "KeyZ")
				this.historyUndo();
			if
			(
				(e.ctrlKey && e.shiftKey && e.code == "KeyZ") ||
				(e.ctrlKey && !e.shiftKey && e.code == "KeyY")
			)
				this.historyRedo();
		});

		window.addEventListener("resize", () => this.resizeEditor());
		this.resizeEditor();
	}

	createEditorStyles(): HTMLStyleElement
	{
		const styleEl = document.createElement("style");

		for (const vairiableTypeId in AssetLoader.variableTypes)
		{
			const vairiableType = AssetLoader.variableTypes[vairiableTypeId];
			styleEl.innerHTML += `.nodeEditor .node .nodeVariableType_${ vairiableTypeId } .handle { background: ${ vairiableType.color }; }`;
			styleEl.innerHTML +=
			`
				.nodeEditor.variableDraggedType_${ vairiableTypeId }.variableDragged_input .node .nodeOutput.nodeVariableType_${ vairiableTypeId } .handle,
				.nodeEditor.variableDraggedType_${ vairiableTypeId }.variableDragged_output .node .nodeInput.nodeVariableType_${ vairiableTypeId } .handle
				{
					filter: none;
				}
				.nodeEditor.variableDraggedType_${ vairiableTypeId }.variableDragged_input .node .nodeOutput.nodeVariableType_${ vairiableTypeId }:hover .handle,
				.nodeEditor.variableDraggedType_${ vairiableTypeId }.variableDragged_output .node .nodeInput.nodeVariableType_${ vairiableTypeId }:hover .handle,
				.nodeEditor.variableDraggedType_${ vairiableTypeId } .node .nodeInput.dragged .handle,
				.nodeEditor.variableDraggedType_${ vairiableTypeId } .node .nodeOutput.dragged .handle
				{
					box-shadow: 0 0 6px 4px ${ vairiableType.color };
				}
			`;
		}

		return styleEl;
	}

	//===== Node management =====//

	private generateNodeId(nodeType: string): string
	{
		const id = nodeType + "#" + Math.floor(Math.random() * 36 ** 4).toString(36);
		if (!this.nodes[id])
			return id;
		
		return this.generateNodeId(nodeType);
	}

	// ===== Variable dragging varaibles ===== //
	
	private draggedVariableId: string = null;
	private draggedVariableType: string = null;
	private droppedVariableId: string = null;

	/**
	 * Adds node of a given type
	 * @returns Added node or null on fail
	 */
	addNode(nodeType: string, nodeId: string = null, nodePosX: number = 0, nodePosY: number = 0, attributes: any = {}): Node | null
	{
		if (!AssetLoader.nodesData[nodeType])
			return null;
		
		if (!nodeId)
			nodeId = this.generateNodeId(nodeType);
		else
			if (this.nodes[nodeId])
				return null;

		const node: Node = AssetLoader.nodesData[nodeType].class ?
			new AssetLoader.nodesData[nodeType].class(nodeId, nodeType, attributes) :
			new Node(nodeId, nodeType, attributes);

		node.editor = this;

		this.nodes[nodeId] = node;
		this.nodeContainer.append(node.element);

		node.addEventListener("node_change", (e: NodeChangeEvent) =>
		{
			if (e.pushToHistory)
				this.historyPush();
			
			if (e.reloadAnalysis)
				this.updateRunningAnalysis(this.markNodeOutdated(e.nodeId));
			
			this.redrawConnestions();
		});

		node.addEventListener("node_remove", () =>
		{
			const nodeToUpdate = this.markNodeOutdated(nodeId);
			this.removeNodeConnections(nodeId);
			delete this.nodes[nodeId];
			this.historyPush();
			this.redrawConnestions();
			this.updateRunningAnalysis(nodeToUpdate);
		});

		if (Settings.get("editor.snapToGrid"))
		{
			nodePosX = Math.round(nodePosX / 18) * 18;
			nodePosY = Math.round(nodePosY / 18) * 18;
		}

		node.moveTo(nodePosX, nodePosY);

		// ===== Node dragging ===== //

		node.addEventListener("node_move", () =>
		{
			this.redrawConnestions();
		});

		node.addEventListener("node_drag_start", () =>
		{
			this.nodeContainer.append(node.element);
			this.element.classList.add("nodeDragged");
		});

		node.addEventListener("node_drag_end", () =>
		{
			this.element.classList.remove("nodeDragged");
		});

		// ===== Variable dragging ===== //

		node.addEventListener("variable_drag_start", (e: VariableDragStartEvent) =>
		{
			this.draggedVariableType = e.variable.type;
			let isInput = e.variable.input;

			let originalInput = e.nodeVarId;

			if (isInput)
			{
				const conectedVariable = this.getConnectedVariable(e.nodeVarId);

				if (conectedVariable)
				{
					this.draggedVariableId = conectedVariable;
					this.removeConnection(conectedVariable, e.nodeVarId);

					isInput = !isInput;
				}
				else
					this.draggedVariableId = e.nodeVarId;
			}
			else
			{
				originalInput = null;
				this.draggedVariableId = e.nodeVarId;
			}

			this.element.classList.add("variableDragged");
			this.element.classList.add(`variableDraggedType_${ this.draggedVariableType }`);
			this.element.classList.add(`variableDragged_${ isInput ? "input" : "output" }`);

			const [nodeId, variableId] = this.draggedVariableId.split("?");
			this.nodes[nodeId].getVariable(variableId).element.classList.add("dragged");

			const moveEvent = (e: MouseEvent) =>
			{
				this.redrawConnestions();
				
				const pos = this.nodes[nodeId].getHandlePosition(variableId);

				if (isInput)
					this.drawConnection(
						pos.x, pos.y,
						(e.clientX - this.posX) / this.scale, (e.clientY - this.posY) / this.scale,
						AssetLoader.variableTypes[this.draggedVariableType].color
					);
				else
					this.drawConnection(
						(e.clientX - this.posX) / this.scale, (e.clientY - this.posY) / this.scale,
						pos.x, pos.y,
						AssetLoader.variableTypes[this.draggedVariableType].color
					);
			}

			const mouseupEvent = () =>
			{
				this.element.classList.remove("variableDragged");
				this.element.classList.remove(`variableDraggedType_${ this.draggedVariableType }`);
				this.element.classList.remove(`variableDragged_${ isInput ? "input" : "output" }`);

				this.nodes[nodeId].getVariable(variableId).element.classList.remove("dragged");

				window.removeEventListener("mousemove", moveEvent);
				window.removeEventListener("mouseup", mouseupEvent);

				this.redrawConnestions();
				
				if (this.historyPush())
				{
					const outdatedNodes = [];

					if (this.getVariable(this.draggedVariableId).input)
					{
						console.log("New connection:", this.droppedVariableId, " -> ", this.draggedVariableId);
						outdatedNodes.push(...this.markNodeOutdated(this.draggedVariableId.split("?")[0]));
					}
					else
					{
						if (originalInput != this.droppedVariableId)
						{
							if (originalInput)
							{
								console.log("Removed connection:", this.draggedVariableId, " -> ", originalInput);
								outdatedNodes.push(...this.markNodeOutdated(originalInput.split("?")[0]));
							}
							if (this.droppedVariableId)
							{
								console.log("New connection:", this.draggedVariableId, " -> ", this.droppedVariableId);
								outdatedNodes.push(...this.markNodeOutdated(this.droppedVariableId.split("?")[0]));
							}
						}
					}

					this.droppedVariableId = null;

					this.updateRunningAnalysis(outdatedNodes);
				}
				
				this.draggedVariableId = null;
			}

			window.addEventListener("mousemove", moveEvent);
			window.addEventListener("mouseup", mouseupEvent);
		});

		node.addEventListener("variable_drag_end", (e: VariableDragEndEvent) =>
		{
			if (this.draggedVariableId)
			{
				if (this.draggedVariableType != e.variable.type || (e.variable.input && this.getConnectedVariable(e.nodeVarId)))
				{
					this.redrawConnestions();
					return;
				}

				this.droppedVariableId = e.nodeVarId;

				if (e.variable.input)
					this.addConnection(this.draggedVariableId, e.nodeVarId);
				else
					this.addConnection(e.nodeVarId, this.draggedVariableId);

				this.redrawConnestions();
			}
		});

		return node;
	}

	getHandlePosition(nodeVarId: string)
	{
		const [nodeId, variableId] = nodeVarId.split("?");

		if (!this.nodes[nodeId])
			return null;

		const pos = this.nodes[nodeId].getHandlePosition(variableId);

		if (!pos)
			return null;

		return pos;
	}

	addConnection(nodeVarIdOutput: string, nodeVarIdInput: string)
	{
		const [nodeIdInput,  variableIdInput ] = nodeVarIdInput.split("?");
		const [nodeIdOutput, variableIdOutput] = nodeVarIdOutput.split("?");

		if (!this.nodes[nodeIdInput])
			return null;
		if (!this.nodes[nodeIdOutput])
			return null;

		if (!this.nodes[nodeIdInput].inputs[variableIdInput])
			return null;
		if (!this.nodes[nodeIdOutput].outputs[variableIdOutput])
			return null;

		this.nodes[nodeIdInput].inputs[variableIdInput].connectedTo = nodeVarIdOutput;
		this.nodes[nodeIdOutput].outputs[variableIdOutput].connectedTo = nodeVarIdInput;

		this.nodeConnections[nodeVarIdInput] = nodeVarIdOutput;
	}

	removeConnection(nodeVarIdOutput: string, nodeVarIdInput: string)
	{
		if (this.nodeConnections[nodeVarIdInput] == nodeVarIdOutput)
		{
			this.getVariable(nodeVarIdInput).connectedTo = null;
			this.getVariable(this.nodeConnections[nodeVarIdInput]).connectedTo = null;
			delete this.nodeConnections[nodeVarIdInput];

			return true;
		}
	}

	removeNodeConnections(nodeId: string)
	{
		const toRemove = [];
		for (const nodeVarIdInput in this.nodeConnections)
		{
			const nodeVarIdOutput = this.nodeConnections[nodeVarIdInput];
			const node1 = nodeVarIdInput.split("?")[0];
			const node2 = nodeVarIdOutput.split("?")[0];

			if (node1 == nodeId || node2 == nodeId)
			{
				toRemove.push(nodeVarIdInput);
			}
		}

		for (const nodeVarIdInput of toRemove)
		{
			delete this.nodeConnections[nodeVarIdInput];
		}
	}

	getVariable(nodeVarId: string): NodeVariable
	{
		const [nodeId,  variableId] = nodeVarId.split("?");
		return this.nodes[nodeId]?.getVariable(variableId) || null;
	}

	getConnectedVariable(nodeVarId: string): string
	{
		if (this.nodeConnections[nodeVarId])
			return this.nodeConnections[nodeVarId];

		for (const nodeVarIdInput in this.nodeConnections)
		{
			if (this.nodeConnections[nodeVarIdInput] == nodeVarId)
				return nodeVarIdInput;
		}

		return null;
	}

	/**
	 * Gets nodes connected to the given node outputs
	 */
	getConnectedNodes(nodeId: string): Node[]
	{
		const checkedNode = this.nodes[nodeId];
		if (!checkedNode)
			return null;

		const foundNodes = [];

		for (const nodeVarIdInput in this.nodeConnections)
		{
			const nodeIdOutput = this.nodeConnections[nodeVarIdInput].split("?")[0];
			if (nodeIdOutput != nodeId)
				continue;

			foundNodes.push(this.nodes[nodeVarIdInput.split("?")[0]]);
		}

		return foundNodes;
	}

	markNodeOutdated(nodeId: string): string[]
	{
		this.nodes[nodeId].markOutdated();

		const outdatedNodes: Set<string> = new Set();
		outdatedNodes.add(nodeId);

		for (const node of this.getConnectedNodes(nodeId))
		{
			if (!outdatedNodes.has(node.id))
				for (const childNode of this.markNodeOutdated(node.id))
					outdatedNodes.add(childNode);
		}

		return [ ...outdatedNodes ];
	}

	updateRunningAnalysis(outdatedNodes)
	{
		SocketConnection.updateAnalysis(this.analysisId, this.toJSON(), outdatedNodes);
	}

	//===== Drawing =====//

	private resizeEditor()
	{
		this.c.width  = window.innerWidth;
		this.c.height = window.innerHeight;

		this.redrawConnestions();
	}

	private drawConnection(p1x: number, p1y: number, p2x: number, p2y: number, colour: string = "#fff")
	{
		this.ctx.setTransform(this.scale, 0, 0, this.scale, this.posX, this.posY);

		switch (Settings.get("editor.connectionStyle"))
		{
			case "bezier":
				let pB1x = (p1x + p2x) / 2;
				let pB2x = (p1x + p2x) / 2;

				let yDiff = Math.abs(p1y - p2y);

				if (yDiff > 72)
					yDiff = 72;

				if (pB1x > p1x - yDiff)
					pB1x = p1x - yDiff;

				if (pB2x < p2x + yDiff)
					pB2x = p2x + yDiff;

				this.ctx.strokeStyle = colour;
				this.ctx.lineWidth = 2;
				this.ctx.beginPath();
				this.ctx.moveTo(p1x, p1y);
				this.ctx.bezierCurveTo(pB1x, p1y, pB2x, p2y, p2x, p2y);
				this.ctx.stroke();

				this.ctx.strokeStyle = colour + "2";
				this.ctx.lineWidth = 6;
				this.ctx.beginPath();
				this.ctx.moveTo(p1x, p1y);
				this.ctx.bezierCurveTo(pB1x, p1y, pB2x, p2y, p2x, p2y);
				this.ctx.stroke();
				break;

			case "right":
					let pRB1x = (p1x + p2x) / 2;
					let pRB2x = (p1x + p2x) / 2;
	
					if (pRB1x > p1x - 18)
						pRB1x = p1x - 18;
	
					if (pRB2x < p2x + 18)
						pRB2x = p2x + 18;
	
					this.ctx.strokeStyle = colour;
					this.ctx.lineWidth = 2;
					this.ctx.beginPath();
					this.ctx.moveTo(p1x, p1y);
					this.ctx.lineTo(pRB1x, p1y);
					if (pRB1x != pRB2x)
					{
						this.ctx.lineTo(pRB1x, (p1y + p2y) / 2);
						this.ctx.lineTo(pRB2x, (p1y + p2y) / 2);
					}
					this.ctx.lineTo(pRB2x, p2y);
					this.ctx.lineTo(p2x, p2y);
					this.ctx.stroke();
	
					this.ctx.strokeStyle = colour + "2";
					this.ctx.lineWidth = 6;
					this.ctx.beginPath();
					this.ctx.moveTo(p1x, p1y);
					this.ctx.lineTo(pRB1x, p1y);
					if (pRB1x != pRB2x)
					{
						this.ctx.lineTo(pRB1x, (p1y + p2y) / 2);
						this.ctx.lineTo(pRB2x, (p1y + p2y) / 2);
					}
					this.ctx.lineTo(pRB2x, p2y);
					this.ctx.lineTo(p2x, p2y);
					this.ctx.stroke();
					break;

			case "straight":
				this.ctx.strokeStyle = colour;
				this.ctx.lineWidth = 2;
				this.ctx.beginPath();
				this.ctx.moveTo(p1x, p1y);
				this.ctx.lineTo(p2x, p2y);
				this.ctx.stroke();

				this.ctx.strokeStyle = colour + "2";
				this.ctx.lineWidth = 6;
				this.ctx.beginPath();
				this.ctx.moveTo(p1x, p1y);
				this.ctx.lineTo(p2x, p2y);
				this.ctx.stroke();
		}

		this.ctx.fillStyle = colour;
		this.ctx.beginPath();
		this.ctx.arc(p1x, p1y, 4, 0, Math.PI * 2);
		this.ctx.arc(p2x, p2y, 4, 0, Math.PI * 2);
		this.ctx.fill();

		this.ctx.fillStyle = colour + "2";
		this.ctx.beginPath();
		this.ctx.arc(p1x, p1y, 6, 0, Math.PI * 2);
		this.ctx.arc(p2x, p2y, 6, 0, Math.PI * 2);
		this.ctx.fill();
	}

	redrawConnestions()
	{
		this.ctx.resetTransform();
		this.ctx.clearRect(0, 0, this.c.width, this.c.height);

		for (const nodeVarIdInput in this.nodeConnections)
		{
			const nodeVarIdOutput = this.nodeConnections[nodeVarIdInput];
			const [nodeIdOutput, variableIdOutput] = nodeVarIdOutput.split("?");
			const [nodeIdInput,  variableIdInput ] = nodeVarIdInput.split("?");

			const posInput  = this.nodes[nodeIdInput ].getHandlePosition(variableIdInput);
			const posOutput = this.nodes[nodeIdOutput].getHandlePosition(variableIdOutput);
			const variableType = this.getVariable(nodeVarIdInput)?.type;

			this.drawConnection(posInput.x, posInput.y, posOutput.x, posOutput.y, AssetLoader.variableTypes[variableType]?.color || "#fff");
		}
	}

	// ===== Canvas movement ===== //

	moveTo(posX: number, posY: number)
	{
		this.posX = posX;
		this.posY = posY;

		this.nodeContainer.style.top  = posY + "px";
		this.nodeContainer.style.left = posX + "px";

		this.element.style.setProperty('--background-position', `${ posX }px ${ posY }px`);
	}
	setScale(newScale: number, propX: number = 0.5, propY: number = 0.5, updateInput: boolean = true)
	{
		if (newScale > 5 || newScale < 0.2)
		{
			// Invalid value from input
			if (!updateInput)
				this.scaleInputEl.value = (this.scale * 100).toFixed();
			return;
		}

		if (updateInput)
			this.scaleInputEl.value = (newScale * 100).toFixed();

		const scaleChange = newScale / this.scale;
		this.moveTo(
			Math.round(this.posX * scaleChange + window.innerWidth  * (1 - scaleChange) * propX),
			Math.round(this.posY * scaleChange + window.innerHeight * (1 - scaleChange) * propY)
		);

		this.scale = newScale;
		this.nodeContainer.style.transform = `scale(${ newScale })`;
		this.element.style.setProperty('--scale', <any>newScale);

		this.redrawConnestions();
	}

	private dragStart(e: MouseEvent)
	{
		e.stopPropagation();

		let startPosX = this.posX;
		let startPosY = this.posY;

		let dragPosX = e.clientX;
		let dragPosY = e.clientY;

		const moveEvent = (e: MouseEvent) =>
		{
			this.moveTo(startPosX + e.clientX - dragPosX, startPosY + e.clientY - dragPosY);
			this.redrawConnestions();
		}

		const mouseupEvent = (e: MouseEvent) =>
		{
			moveEvent(e);

			window.removeEventListener("mousemove", moveEvent);
			window.removeEventListener("mouseup", mouseupEvent);
		}

		window.addEventListener("mousemove", moveEvent);
		window.addEventListener("mouseup", mouseupEvent);
	}

	// ===== Data Import/Export ===== //

	toJSONObj(): Analysis
	{
		const nodes: { [nodeId: string]: NodeSerialisable } = {};

		for (const nodeId in this.nodes)
			nodes[nodeId] = this.nodes[nodeId].toJSONObj();

		const connectionsArr = [];

		for (const nodeVarIdInput in this.nodeConnections)
			connectionsArr.push([this.nodeConnections[nodeVarIdInput], nodeVarIdInput]);

		return {
			nodes: nodes,
			connections: connectionsArr,
			title: this.metadata.title,
			creationTime: this.metadata.creationTime,
			updateTime: this.metadata.updateTime,
			...this.metadata
		};
	}

	toJSON(): string
	{
		return JSON.stringify(this.toJSONObj());
	}

	loadJSON(json: string, updateHistory: boolean = true)
	{
		
		this.nodes = {};
		this.nodeConnections = {};
		this.nodeContainer.innerHTML = "";
		this.ctx.clearRect(0, 0, this.c.width, this.c.height);

		const data: Analysis = JSON.parse(json);
		for (const nodeId in data.nodes || [])
		{
			const node = data.nodes[nodeId];

			this.addNode(node.type, nodeId, node.posX, node.posY, node.attributes);
		}

		for (const connection of data.connections || [])
		{
			this.addConnection(connection[0], connection[1]);
		}

		this.metadata = data;
		delete this.metadata.nodes;
		delete this.metadata.connections;

		this.headerEl.querySelector("input").value = this.metadata.title || "New Analysis";

		this.redrawConnestions();

		if (updateHistory)
			this.historyPush();
	}

	async openFile(filePath: string)
	{
		this.analysisId = filePath;

		const resp = await fetch(`/api/files/${ filePath }`);
		if (resp.status != 200)
			return false;
	
		this.turnOff();	
		this.history = [];
		this.undoHistory = [];
		this.loadJSON(await resp.text(), false);
		this.history.push(this.toJSON());
		SocketConnection.getAnalysisStatus(this.analysisId);
	}

	async saveFile()
	{
		const resp = await fetch(`/api/files/${ this.analysisId }`,
		{
			method: 'PUT',
			body: this.history[this.history.length - 1]
		});

		if (resp.status != 200)
			return false;
	}

	// ===== Data Import/Export ===== //

	undoHistory: string[] = [];
	
	historyPush(): boolean
	{
		const status = this.toJSON();
		if (status == this.history[this.history.length - 1])
			return false;
		
		this.history.push(status);
		if (this.history.length > 100)
			this.history.shift();

		this.undoHistory = [];
		this.saveFile();

		return true;
	}

	historyUndo()
	{
		if (this.history.length < 2)
			return;

		const undoStatus = this.history.pop();
		const status = this.history[this.history.length - 1];
		
		this.loadJSON(status, false);

		this.undoHistory.push(undoStatus);
		this.saveFile();
		this.updateRunningAnalysis(Object.keys(this.nodes));
	}

	historyRedo()
	{
		if (this.undoHistory.length < 1)
			return;

		const status = this.undoHistory.pop();
		this.loadJSON(status, false);

		this.history.push(status);
		this.saveFile();
		this.updateRunningAnalysis(Object.keys(this.nodes));
	}

	// Analysis
	turnOn(startAutomatically: boolean = true): void
	{
		this.analysisActive = true;
		this.element.classList.add("runningAnalysis");
		this.headerEl.querySelector(".runAnalysis").innerHTML = "Running Analysis";

		if (startAutomatically)
			SocketConnection.runAnalysis(this.analysisId);
	}

	turnOff(stopAnalysis: boolean = false): void
	{
		for (const nodeId in this.nodes)
			this.nodes[nodeId].markOutdated();

		this.analysisActive = false;
		this.element.classList.remove("runningAnalysis");
		this.headerEl.querySelector(".runAnalysis").innerHTML = "Run Analysis";
		
		if (stopAnalysis)
			SocketConnection.stopAnalysis(this.analysisId);
	}

	setPaused(paused: boolean)
	{
		this.analysisPaused = paused;
		
		const playPauseContent = this.headerEl.querySelector(".playPauseButton i");
		if (!paused)
		{
			playPauseContent.classList.add("icon-pause");
			playPauseContent.classList.remove("icon-play");
			SocketConnection.runAnalysis(this.analysisId);
		}
		else
		{
			playPauseContent.classList.remove("icon-pause");
			playPauseContent.classList.add("icon-play");
		}

		SocketConnection.setAnalysisPause(this.analysisId, paused);
	}
}
