import { createElement, createNodeTree } from "../Utils.js";
import { NodeInput, NodeOutput, NodeVariable, VariableDragEndEvent, VariableDragStartEvent } from "./NodeVariables.js";


class NodeDragEvent extends Event
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


export class NodeDragStartEvent extends NodeDragEvent
{
	constructor(node: Node)
	{
		super("node_drag_start", node);
	}
}

export class NodeDragEndEvent extends NodeDragEvent
{
	constructor(node: Node)
	{
		super("node_drag_end", node);
	}
}

export class NodeMoveEvent extends NodeDragEvent
{
	constructor(node: Node)
	{
		super("node_move", node);
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
	
	private inputsContainer:  HTMLDivElement = <HTMLDivElement>createElement("div", { class: "inputsContainer" });
	private outputsContainer: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "outputsContainer" });

	constructor(id: string, type: string, nodeData: any = {})
	{
		super();

		this.id = id;
		this.type = type;

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
						attributes:
						{
							class: "nodeTitle"
						},
						listeners:
						{
							mousedown: e => this.dragStart(e)
						},
						childNodes:
						[
							nodeData?.name || "New Node"
						]
					},
					this.inputsContainer,
					this.outputsContainer
				]
			}
		);

		for (const input of nodeData.inputs || [])
		{
			this.addInput(input.id, input.type, input.name, input.description);
		}

		for (const output of nodeData.outputs || [])
		{
			this.addOutput(output.id, output.type, output.name, output.description);
		}

		this.moveTo(nodeData.posX || 0, nodeData.posY || 0);
	}

	//===== Variables =====//

	inputs:  {[key: string]: NodeInput}  = {};
	outputs: {[key: string]: NodeOutput} = {};

	private addInput(id: string, type: string, name: string, description: string)
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

	private addOutput(id: string, type: string, name: string, description: string)
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

			this.dispatchEvent(new NodeDragEndEvent(this));
		}

		window.addEventListener("mousemove", moveEvent);
		window.addEventListener("mouseup", mouseupEvent);

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
}
