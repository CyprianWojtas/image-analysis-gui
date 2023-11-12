import { createElement, createNodeTree } from "../Utils.js";


class VarDragEvent extends Event
{
	variableId: string;
	nodeId: string;

	constructor(eventName: string, variableId: string, nodeId: string = null)
	{
		super(eventName, { bubbles: true });

		this.variableId = variableId;
		this.nodeId = nodeId;
	}

	get nodeVarId()
	{
		return this.nodeId + "?" + this.variableId;
	}
}


export class VariableDragStartEvent extends VarDragEvent
{
	constructor(variableId: string, nodeId: string = null)
	{
		super("variable_drag_start", variableId, nodeId);
	}
}

export class VariableDragEndEvent extends VarDragEvent
{
	constructor(variableId: string, nodeId: string = null)
	{
		super("variable_drag_end", variableId, nodeId);
	}
}


abstract class NodeVariable extends EventTarget
{
	id: string;
	type: string;
	name: string;
	description: string;

	element: HTMLDivElement;

	protected handleEl: HTMLDivElement;

	/** Used to determine handle position in the node */ 
	posX: number = null;
	/** Used to determine handle position in the node */ 
	posY: number = null;


	constructor(id: string, type: string, name = null, description = null)
	{
		super();

		this.id          = id;
		this.type        = type;
		this.name        = name;
		this.description = description;

		this.handleEl = <HTMLDivElement>createElement(
			"div",
			{ class: "handle" },
			{
				mousedown: () =>
				{
					this.dispatchEvent(new VariableDragStartEvent(this.id));
				},
				mouseup: () =>
				{
					this.dispatchEvent(new VariableDragEndEvent(this.id));
				}
			}
		);
	}

	public getHandleBoundingClientRect()
	{
		return this.handleEl.getBoundingClientRect();
	}
}

export
class NodeInput extends NodeVariable
{
	constructor(id: string, type: string, name = null, description = null)
	{
		super(id, type, name, description);

		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes:
				{
					class: `nodeInput nodeVariableType_${ type }`,
					title: description || ""
				},
				childNodes:
				[
					{
						name: "div",
						attributes:
						{
							class: "name"
						},
						childNodes:
						[
							this.name || this.id || ""
						]
					},
					this.handleEl
				]
			}
		);
	}
}

export
class NodeOutput extends NodeVariable
{
	constructor(id: string, type: string, name = null, description = null)
	{
		super(id, type, name, description);

		this.element = <HTMLDivElement>createNodeTree(
			{
				name: "div",
				attributes:
				{
					class: `nodeOutput nodeVariableType_${ type }`,
					title: description || ""
				},
				childNodes:
				[
					{
						name: "div",
						attributes:
						{
							class: "name"
						},
						childNodes:
						[
							this.name || this.id || ""
						]
					},
					this.handleEl
				]
			}
		);
	}
}