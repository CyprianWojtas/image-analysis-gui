import { createElement, createNodeTree } from "../Utils.js";
import { NodeInput, NodeOutput, VariableDragEndEvent, VariableDragStartEvent } from "./NodeVariables.js";

export default
class Node extends EventTarget
{
	id: string;
	element: HTMLDivElement;

	posX: number;
	posY: number;
	
	private inputsContainer:  HTMLDivElement = <HTMLDivElement>createElement("div", { class: "inputsContainer" });
	private outputsContainer: HTMLDivElement = <HTMLDivElement>createElement("div", { class: "outputsContainer" });

	constructor(id: string, nodeData: any = {})
	{
		super();

		this.id = id;

		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes:
				{
					class: "node"
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
			this.dispatchEvent(new VariableDragStartEvent(e.variableId, this.id));
		});

		input.addEventListener("variable_drag_end", (e: VariableDragEndEvent) =>
		{
			this.dispatchEvent(new VariableDragEndEvent(e.variableId, this.id));
		});

		this.inputs[id] = input;
		this.inputsContainer.append(input.element);
	}

	private addOutput(id: string, type: string, name: string, description: string)
	{
		const output = new NodeOutput(id, type, name, description);

		output.addEventListener("variable_drag_start", (e: VariableDragStartEvent) =>
		{
			this.dispatchEvent(new VariableDragStartEvent(e.variableId, this.id));
		});

		output.addEventListener("variable_drag_end", (e: VariableDragEndEvent) =>
		{
			this.dispatchEvent(new VariableDragEndEvent(e.variableId, this.id));
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

		this.dispatchEvent(new Event("node_move"));
	}

	private dragStart(e: MouseEvent)
	{
		let startPosX = this.posX;
		let startPosY = this.posY;

		let dragPosX = e.clientX;
		let dragPosY = e.clientY;

		const moveEvent = (e: MouseEvent) =>
		{
			let newX = startPosX + e.clientX - dragPosX;
			let newY = startPosY + e.clientY - dragPosY;

			if (newX < 0) newX = 0;
			if (newY < 0) newY = 0;

			this.moveTo(newX, newY);
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
