import SocketConnection, { AnalysisNodeProcessedEvent } from "../SocketConnection.js";
import { createElement, createNodeTree } from "../Utils.js";
import AssetLoader from "./AssetLoader.js";
import { NodeInput, NodeOutput, NodeVariable, VariableDragEndEvent, VariableDragStartEvent } from "./NodeVariables.js";
import Wiki from "./Wiki.js";


class NodeEvent extends Event
{
	node: Node;
	nodeId: string;

	constructor(eventName: string, node: Node)
	{
		super(eventName, { bubbles: true });

		this.node = node;
		this.nodeId = node.id;
	}
}


export class NodeDragStartEvent extends NodeEvent
{
	constructor(node: Node)
	{
		super("node_drag_start", node);
	}
}

export class NodeDragEndEvent extends NodeEvent
{
	constructor(node: Node)
	{
		super("node_drag_end", node);
	}
}

export class NodeMoveEvent extends NodeEvent
{
	constructor(node: Node)
	{
		super("node_move", node);
	}
}

export class NodeRemoveEvent extends NodeEvent
{
	constructor(node: Node)
	{
		super("node_remove", node);
	}
}

export class NodeChangeEvent extends NodeEvent
{
	pushToHistory: boolean;

	constructor(node: Node, pushToHistory: boolean = true)
	{
		super("node_change", node);
		this.pushToHistory = pushToHistory;
	}
}

export default
class Node extends EventTarget
{
	id: string;
	type: string;
	element: HTMLDivElement;

	posX: number;
	posY: number;

	attributes: any = {};
	customInputs: string[] = [];
	customOuptuts: string[] = [];

	private nodeContents: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "nodeContents" });
	
	private inputsContainer:  HTMLDivElement = <HTMLDivElement>createElement("div", { class: "inputsContainer" });
	private outputsContainer: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "outputsContainer" });

	constructor(id: string, type: string, attributes: any = {})
	{
		super();

		const nodeData = AssetLoader.nodesData[type];

		this.id = id;
		this.type = type;
		this.attributes = attributes;

		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes:
				{
					class: `node nodeId_${ this.id }`
				},
				childNodes:
				[
					{
						name: "div",
						attributes: { class: "nodeTitle" },
						listeners:
						{
							mousedown: e => this.dragStart(e)
						},
						childNodes:
						[
							nodeData?.name || "New Node",
							{
								name: "div",
								attributes: { class: "buttons" },
								childNodes:
								[
									{
										name: "button",
										childNodes: [ "?" ],
										listeners:
										{
											mousedown: e => e.stopPropagation(),
											click: e =>
											{
												e.stopPropagation();
												Wiki.openArticle(this.type);
											}
										}
									},
									{
										name: "button",
										childNodes: [ "x" ],
										attributes: { class: "btn-close" },
										listeners:
										{
											mousedown: e => e.stopPropagation(),
											click: e =>
											{
												e.stopPropagation();
												this.remove();
											}
										}
									}
								]
							}
						]
					},
					this.nodeContents
				]
			}
		);

		SocketConnection.addEventListener("analysis_node_processing", (e: AnalysisNodeProcessedEvent) =>
		{
			if (e.nodeId != this.id)
				return;

			console.log(`Processing: ${ this.id }...`);
			this.element.classList.add("processing");
		});

		SocketConnection.addEventListener("analysis_node_processed", (e: AnalysisNodeProcessedEvent) =>
		{
			if (e.nodeId != this.id)
				return;

			console.log(`Processed: ${ this.id }!`);

			this.element.classList.remove("processing");
			this.element.classList.add("processed");

			this.onProcessed(e.data);
		});

		this.renderContents();

		this.moveTo(nodeData.posX || 0, nodeData.posY || 0);
	}

	protected renderContents()
	{
		this.nodeContents.append(
			this.inputsContainer,
			this.outputsContainer
		);

		const nodeData = AssetLoader.nodesData[this.type];

		for (const input of nodeData.inputs || [])
		{
			this.addInput(input.id, input.type, input.name, input.description);
		}

		for (const output of nodeData.outputs || [])
		{
			this.addOutput(output.id, output.type, output.name, output.description);
		}
	}

	//===== Variables =====//

	inputs:  {[key: string]: NodeInput}  = {};
	outputs: {[key: string]: NodeOutput} = {};

	protected addInput(id: string, type: string, name: string, description: string)
	{
		const input = new NodeInput(id, type, name, description);

		input.addEventListener("variable_drag_start", (e: VariableDragStartEvent) =>
		{
			this.dispatchEvent(new VariableDragStartEvent(e.variable, this.id));
		});

		input.addEventListener("variable_drag_end", (e: VariableDragEndEvent) =>
		{
			this.dispatchEvent(new VariableDragEndEvent(e.variable, this.id));
		});

		this.inputs[id] = input;
		this.inputsContainer.append(input.element);
	}

	protected removeInput(id: string)
	{
		this.inputs[id].element.remove();
		delete this.inputs[id];
	}

	protected addOutput(id: string, type: string, name: string, description: string)
	{
		const output = new NodeOutput(id, type, name, description);

		output.addEventListener("variable_drag_start", (e: VariableDragStartEvent) =>
		{
			this.dispatchEvent(new VariableDragStartEvent(e.variable, this.id));
		});

		output.addEventListener("variable_drag_end", (e: VariableDragEndEvent) =>
		{
			this.dispatchEvent(new VariableDragEndEvent(e.variable, this.id));
		});

		this.outputs[id] = output;
		this.outputsContainer.append(output.element);
	}

	protected removeOutput(id: string)
	{
		this.outputs[id].element.remove();
		delete this.outputs[id];
	}

	//===== Node Dragging =====//

	moveTo(posX: number, posY: number)
	{
		this.posX = posX;
		this.posY = posY;

		this.element.style.top  = posY + "px";
		this.element.style.left = posX + "px";

		this.dispatchEvent(new NodeMoveEvent(this));
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
		}

		const mouseupEvent = (e: MouseEvent) =>
		{
			moveEvent(e);

			window.removeEventListener("mousemove", moveEvent);
			window.removeEventListener("mouseup", mouseupEvent);

			this.element.classList.remove("dragged");

			this.dispatchEvent(new NodeDragEndEvent(this));
			this.sendUpdate();
		}

		window.addEventListener("mousemove", moveEvent);
		window.addEventListener("mouseup", mouseupEvent);

		this.element.classList.add("dragged");

		this.dispatchEvent(new NodeDragStartEvent(this));
	}

	getVariable(varaibleId: string): NodeVariable
	{
		return this.inputs[varaibleId] || this.outputs[varaibleId] || null;
	}

	getHandlePosition(handleId: string)
	{
		const variable = this.inputs[handleId] || this.outputs[handleId];

		if (variable.posX === null || variable.posY === null)
		{
			const thisPos = this.element.getBoundingClientRect();
			const variablePos = variable.getHandleBoundingClientRect();

			variable.posX = variablePos.x - thisPos.x + 4;
			variable.posY = variablePos.y - thisPos.y + 4;
		}
		
		return {
			x: this.posX + variable.posX,
			y: this.posY + variable.posY
		};
	}

	protected updateHandlePositions()
	{
		for (const id in this.inputs)
		{
			this.inputs[id].posX = null;
			this.inputs[id].posY = null;
		}
		for (const id in this.outputs)
		{
			this.outputs[id].posX = null;
			this.outputs[id].posY = null;
		}

		this.dispatchEvent(new NodeChangeEvent(this, false));
	}

	toJSONObj()
	{
		const jsonObj: { [key: string]: any } =
		{
			type: this.type,
			attributes: this.attributes,
			posX: this.posX,
			posY: this.posY
		};

		if (this.customInputs.length)
			jsonObj.customInputs = this.customInputs;
		if (this.customOuptuts.length)
			jsonObj.customOuptuts = this.customOuptuts;

		return jsonObj;
	}

	protected sendUpdate()
	{
		this.dispatchEvent(new NodeChangeEvent(this));
	}

	remove()
	{
		this.element.remove();
		this.dispatchEvent(new NodeRemoveEvent(this));
	}

	// Parsing analysis output

	protected onProcessed(data: any)
	{

	}
}
