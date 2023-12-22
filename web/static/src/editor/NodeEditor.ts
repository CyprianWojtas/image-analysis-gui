import { createElement, createNodeTree } from "../Utils.js";
import AssetLoader from "./AssetLoader.js";
import Node, { NodeChangeEvent } from "./Node.js";
import NodeShelf from "./NodeShelf.js";
import { NodeVariable, VariableDragEndEvent, VariableDragStartEvent } from "./NodeVariables.js";
import Wiki from "./Wiki.js";

export default
class NodeEditor
{
	element: HTMLDivElement;

	private c: HTMLCanvasElement = document.createElement("canvas");
	private ctx: CanvasRenderingContext2D = this.c.getContext("2d");

	private nodeContainer: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "nodeContainer" });
	
	posX: number = 0;
	posY: number = 0;

	private nodeShelf: NodeShelf = new NodeShelf();

	nodes: {[key: string]: Node} = {};
	nodeConnections: [string, string][] = [];
	metadata: {[key: string]: any} = {};

	filePath: string;
	history: string[] = [];

	constructor()
	{
		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes:
				{
					class: "nodeEditor"
				},
				childNodes:
				[
					{
						name: "div",
						attributes:
						{
							class: "nodesBox"
						},
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
								
								this.addNode(nodeId, null, e.clientX - this.posX, e.clientY - this.posY);
								this.historyPush();
							},
							mousedown: e => this.dragStart(e)
						}
					},
					this.nodeShelf.element
				]
			}
		);

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

	private draggedVariableId: string = null;
	private draggedVariableType: string = null;

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

		this.nodes[nodeId] = node;
		this.nodeContainer.append(node.element);

		node.addEventListener("node_change", (e: NodeChangeEvent) =>
		{
			if (e.pushToHistory)
				this.historyPush();
			
			this.redrawConnestions();
		});

		node.addEventListener("node_remove", () =>
		{
			this.removeNodeConnections(nodeId);
			delete this.nodes[nodeId];
			this.historyPush();
			this.redrawConnestions();
		});

		node.moveTo(nodePosX, nodePosY);

		node.addEventListener("node_move", () =>
		{
			this.redrawConnestions();
		});

		node.addEventListener("node_drag_start", () =>
		{
			this.nodeContainer.append(node.element);
		});
		

		node.addEventListener("variable_drag_start", (e: VariableDragStartEvent) =>
		{
			this.draggedVariableType = e.variable.type;
			let isInput = e.variable.input;

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
				this.draggedVariableId = e.nodeVarId;

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
					this.drawConnection(pos.x, pos.y, e.clientX - this.posX, e.clientY - this.posY, AssetLoader.variableTypes[this.draggedVariableType].color);
				else
					this.drawConnection(e.clientX - this.posX, e.clientY - this.posY, pos.x, pos.y, AssetLoader.variableTypes[this.draggedVariableType].color);
			}

			const mouseupEvent = (e: MouseEvent) =>
			{
				this.draggedVariableId = null;
				this.element.classList.remove("variableDragged");
				this.element.classList.remove(`variableDraggedType_${ this.draggedVariableType }`);
				this.element.classList.remove(`variableDragged_${ isInput ? "input" : "output" }`);

				this.nodes[nodeId].getVariable(variableId).element.classList.remove("dragged");

				window.removeEventListener("mousemove", moveEvent);
				window.removeEventListener("mouseup", mouseupEvent);

				this.redrawConnestions();
				
				this.historyPush();
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

				console.log("New connection!", this.draggedVariableId, e.nodeVarId);
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

		this.nodeConnections.push([nodeVarIdOutput, nodeVarIdInput]);
	}

	removeConnection(nodeVarIdOutput: string, nodeVarIdInput: string)
	{
		for (const connectionId in this.nodeConnections)
		{
			const connection = this.nodeConnections[connectionId];
			if (connection[1] == nodeVarIdInput && connection[0] == nodeVarIdOutput)
			{
				this.nodeConnections = [ ...this.nodeConnections.slice(0, parseInt(connectionId)), ...this.nodeConnections.slice(parseInt(connectionId) + 1)];
				this.getVariable(nodeVarIdOutput).connectedTo = null;
				this.getVariable(nodeVarIdInput).connectedTo = null;
				return true;
			}
		}
	}

	removeNodeConnections(nodeId: string)
	{
		const toRemove = [];
		for (const connectionId in this.nodeConnections)
		{
			const connection = this.nodeConnections[connectionId];
			const node1 = connection[0].split("?")[0];
			const node2 = connection[1].split("?")[0];
			if (node1 == nodeId || node2 == nodeId)
			{
				toRemove.push(connectionId);
			}
		}

		for (const id of toRemove.reverse())
		{
			this.nodeConnections.splice(id, 1);
		}
	}

	getVariable(nodeVarId: string): NodeVariable
	{
		const [nodeId,  variableId] = nodeVarId.split("?");
		return this.nodes[nodeId]?.getVariable(variableId) || null;
	}

	getConnectedVariable(nodeVarId: string)
	{
		for (const connection of this.nodeConnections)
		{
			if (connection[0] == nodeVarId)
				return connection[1];

			if (connection[1] == nodeVarId)
				return connection[0];
		}
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
		let pB1x = (p1x + p2x) / 2;
		let pB2x = (p1x + p2x) / 2;

		let yDiff = Math.abs(p1y - p2y);

		if (yDiff > 72)
			yDiff = 72;

		if (pB1x > p1x - yDiff)
			pB1x = p1x - yDiff;

		if (pB2x < p2x + yDiff)
			pB2x = p2x + yDiff;

		this.ctx.setTransform(1, 0, 0, 1, this.posX, this.posY);

		this.ctx.strokeStyle = colour;
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(p1x, p1y);
		this.ctx.bezierCurveTo(pB1x, p1y, pB2x, p2y, p2x, p2y);
		// this.ctx.lineTo(p2x, p2y);
		this.ctx.stroke();

		this.ctx.fillStyle = colour;
		this.ctx.beginPath();
		this.ctx.arc(p1x, p1y, 4, 0, Math.PI * 2);
		this.ctx.arc(p2x, p2y, 4, 0, Math.PI * 2);
		this.ctx.fill();

		this.ctx.strokeStyle = colour + "2";
		this.ctx.lineWidth = 6;
		this.ctx.beginPath();
		this.ctx.moveTo(p1x, p1y);
		this.ctx.bezierCurveTo(pB1x, p1y, pB2x, p2y, p2x, p2y);
		// this.ctx.lineTo(p2x, p2y);
		this.ctx.stroke();

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

		for (const connection of this.nodeConnections)
		{
			const [nodeIdOutput, variableIdOutput] = connection[0].split("?");
			const [nodeIdInput,  variableIdInput ] = connection[1].split("?");

			const posInput  = this.nodes[nodeIdInput ].getHandlePosition(variableIdInput);
			const posOutput = this.nodes[nodeIdOutput].getHandlePosition(variableIdOutput);
			const variableType = this.getVariable(connection[0])?.type;

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

	toJSON(): string
	{
		const nodes = {};

		for (const node in this.nodes)
			nodes[node] = this.nodes[node].toJSONObj();

		return JSON.stringify({
			nodes: nodes,
			connections: this.nodeConnections,
			...this.metadata
		});
	}

	loadJSON(json: string, updateHistory: boolean = true)
	{
		
		this.nodes = {};
		this.nodeConnections = [];
		this.nodeContainer.innerHTML = "";
		this.ctx.clearRect(0, 0, this.c.width, this.c.height);

		const data = JSON.parse(json);
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

		this.redrawConnestions();

		if (updateHistory)
			this.historyPush();
	}

	async openFile(filePath: string)
	{
		this.filePath = filePath;

		const resp = await fetch(`/api/files/${ filePath }`);
		if (resp.status != 200)
			return false;
		
		this.history = [];
		this.undoHistory = [];
		this.loadJSON(await resp.text(), false);
		this.history.push(this.toJSON());
	}

	async saveFile()
	{
		const resp = await fetch(`/api/files/${ this.filePath }`,
		{
			method: 'PUT',
			body: this.history[this.history.length - 1]
		});

		if (resp.status != 200)
			return false;
	}

	// ===== Data Import/Export ===== //

	undoHistory: string[] = [];
	
	historyPush()
	{
		const status = this.toJSON();
		if (status == this.history[this.history.length - 1])
			return;
		
		this.history.push(status);
		if (this.history.length > 100)
			this.history.shift();

		this.undoHistory = [];
		this.saveFile();
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
	}

	historyRedo()
	{
		if (this.undoHistory.length < 1)
			return;

		const status = this.undoHistory.pop();
		this.loadJSON(status, false);

		this.history.push(status);
		this.saveFile();
	}
}
