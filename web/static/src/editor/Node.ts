import Settings from "../Settings.js";
import SocketConnection, { AnalysisNodeDataEvent, AnalysisNodeErrorEvent, AnalysisNodeProcessedEvent } from "../SocketConnection.js";
import { createElement, createNodeTree, stopLMBPropagation } from "../Utils.js";
import { NodeSerialisable } from "../apiTypes/Analysis.js";
import AssetLoader from "./AssetLoader.js";
import NodeEditor from "./NodeEditor.js";
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
	reloadAnalysis: boolean;

	constructor(node: Node, pushToHistory: boolean = true, reloadAnalysis: boolean = false)
	{
		super("node_change", node);
		this.pushToHistory = pushToHistory;
		this.reloadAnalysis = reloadAnalysis;
	}
}

export default
class Node extends EventTarget
{
	/** Unique node ID */
	id: string;
	/** Node type */
	type: string;
	/** HTML node element */
	element: HTMLDivElement;

	/** Node position X */
	posX: number;
	/** Node position Y */
	posY: number;
	/** The editor node is inserted into */
	editor: NodeEditor;

	/** Dictionary containing all custom node attributes (saved in analysis file) */
	attributes: any = {};
	/** List containing names of all custom node inputs; if specified used as default inputs for the node */
	customInputs: string[] = [];
	/** List containing names of all custom node outputs; if specified used as default outputs for the node */
	customOuptuts: string[] = [];

	/** HTML element containing the node contents */
	private nodeContents: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "nodeContents" });
	
	/** HTML element containing the inputs and theif handles */
	private inputsContainer:  HTMLDivElement = <HTMLDivElement>createElement("div", { class: "inputsContainer" });
	/** HTML element containing the outputs and theif handles */
	private outputsContainer: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "outputsContainer" });
	/** HTML element displaying errors when running the node fails */
	private errorBox: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "errorBox" });

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
				class: `node nodeId_${ this.id }`,
				style: `--node-colour: ${ AssetLoader.nodesGroups[nodeData.group]?.colour || "#333" }`,
				childNodes:
				[
					{
						name: "div",
						class: "nodeTitle",
						listeners:
						{
							mousedown: e => this.dragStart(e)
						},
						childNodes:
						[
							nodeData?.name || "New Node",
							{
								name: "div",
								class: "buttons buttons-circled",
								childNodes:
								[
									{
										name: "button",
										title: "Reload",
										childNodes: [ { name: "i", class: "icon-arrows-cw" } ],
										listeners:
										{
											mousedown: e => stopLMBPropagation(e),
											click: e =>
											{
												e.stopPropagation();
												this.sendUpdate(true);
											}
										}
									},
									{
										name: "button",
										title: "Duplicate",
										childNodes: [ { name: "i", class: "icon-duplicate" } ],
										listeners:
										{
											mousedown: e => stopLMBPropagation(e),
											click: e =>
											{
												e.stopPropagation();
												this.editor.addNode(this.type, undefined, this.posX + 18, this.posY + 18);
												this.editor.historyPush();
											}
										}
									},
									{
										name: "button",
										title: "Help",
										childNodes: [ { name: "i", class: "icon-help" } ],
										listeners:
										{
											mousedown: e => stopLMBPropagation(e),
											click: e =>
											{
												e.stopPropagation();
												Wiki.openArticle(this.type);
											}
										}
									},
									{
										name: "button",
										class: "btn-close",
										title: "Remove",
										childNodes: [ { name: "i", class: "icon-cancel" } ],
										listeners:
										{
											mousedown: e => stopLMBPropagation(e),
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
					this.nodeContents,
					this.errorBox
				],
				listeners:
				{
					mousedown: e => stopLMBPropagation(e)
				}
			}
		);

		SocketConnection.addEventListener("analysis_node_processing", (e: AnalysisNodeProcessedEvent) =>
		{
			if (e.nodeId != this.id)
				return;

			this.element.classList.add("processing");
		});

		SocketConnection.addEventListener("analysis_node_processed", (e: AnalysisNodeProcessedEvent) =>
		{
			if (e.nodeId != this.id)
				return;

			this.markAsProcessed();
			this.onProcessed(e.data);
		});

		SocketConnection.addEventListener("analysis_node_error", (e: AnalysisNodeErrorEvent) =>
		{
			if (e.nodeId != this.id)
				return;

			console.error(`Error ${ this.id }!\n${ e.error }`);
			this.markAsError(e.error);
		});

		SocketConnection.addEventListener("analysis_node_data", (e: AnalysisNodeDataEvent) =>
		{
			if (e.nodeId != this.id)
				return;

			this.markAsProcessed();
			this.onProcessed(e.data);
		});

		this.renderContents();

		this.moveTo(0, 0);
	}

	/**
	 * Creates node contents when the node is being created
	 */
	protected renderContents(): void
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

	//===== Node Status =====//

	/**
	 * Marks the node as being done processing
	 */
	markAsProcessed(): void
	{
		this.element.classList.remove("processing");
		this.element.classList.add("processed");
	}

	/**
	 * Shows the node processing error
	 */
	markAsError(error: string): void
	{
		this.element.classList.remove("processing");
		this.element.classList.add("error");

		this.errorBox.innerHTML = "";
		this.errorBox.append(error);

		this.onError(error);
	}

	/**
	 * Marks node as outdated (unprocessed)
	 */
	markOutdated()
	{
		this.element.classList.remove("processing");
		this.element.classList.remove("processed");
		this.element.classList.remove("error");
		this.onOutdated();
	}

	//===== Variables =====//

	inputs:  {[key: string]: NodeInput}  = {};
	outputs: {[key: string]: NodeOutput} = {};

	/**
	 * Creates a node input and appends it to the inputsContainer
	 */
	protected addInput(id: string, type: string, name: string, description: string): void
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
	
	/**
	 * Creates a node output and appends it to the outputsContainer
	 */
	protected addOutput(id: string, type: string, name: string, description: string): void
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
		if (e.button != 0)
			return;

		e.stopPropagation();

		let startPosX = this.posX;
		let startPosY = this.posY;

		let dragPosX = e.clientX;
		let dragPosY = e.clientY;

		const moveEvent = (e: MouseEvent) =>
		{
			let posX = startPosX + (e.clientX - dragPosX) / this.editor.scale;
			let posY = startPosY + (e.clientY - dragPosY) / this.editor.scale;
			if (Settings.get("editor.snapToGrid"))
			{
				posX = Math.round(posX / 18) * 18;
				posY = Math.round(posY / 18) * 18;
			}
			this.moveTo(posX, posY);
		}

		const mouseupEvent = (e: MouseEvent) =>
		{
			moveEvent(e);

			window.removeEventListener("mousemove", moveEvent);
			window.removeEventListener("mouseup", mouseupEvent);

			this.element.classList.remove("dragged");

			this.dispatchEvent(new NodeDragEndEvent(this));
			this.sendUpdate(false);
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

			variable.posX = (variablePos.x - thisPos.x) / this.editor.scale + 4;
			variable.posY = (variablePos.y - thisPos.y) / this.editor.scale + 4;
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

	toJSONObj(): NodeSerialisable
	{
		const jsonObj: NodeSerialisable =
		{
			type: this.type,
			attributes: this.attributes,
			posX: this.posX,
			posY: this.posY
		};

		if (this.customInputs.length)
			jsonObj.customInputs = this.customInputs;
		if (this.customOuptuts.length)
			jsonObj.customOutputs = this.customOuptuts;

		return jsonObj;
	}

	protected sendUpdate(reloadAnalysis: boolean = true)
	{
		this.dispatchEvent(new NodeChangeEvent(this, true, reloadAnalysis));
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

	protected onError(error: string)
	{

	}

	protected onOutdated()
	{
		
	}
}
