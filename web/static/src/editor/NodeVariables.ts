import { createElement, createNodeTree } from "../Utils.js";


class VarDragEvent extends Event
{
	variableId: string;
	variable: NodeVariable;
	nodeId: string;

	constructor(eventName: string, variable: NodeVariable, nodeId: string = null)
	{
		super(eventName, { bubbles: true });

		this.variable = variable;
		this.variableId = variable.id;
		this.nodeId = nodeId;
	}

	get nodeVarId()
	{
		return this.nodeId + "?" + this.variableId;
	}
}


export class VariableDragStartEvent extends VarDragEvent
{
	constructor(variable: NodeVariable, nodeId: string = null)
	{
		super("variable_drag_start", variable, nodeId);
	}
}

export class VariableDragEndEvent extends VarDragEvent
{
	constructor(variable: NodeVariable, nodeId: string = null)
	{
		super("variable_drag_end", variable, nodeId);
	}
}


export abstract class NodeVariable extends EventTarget
{
	id: string;
	type: string;
	input: boolean;
	name: string;
	description: string;

	element: HTMLDivElement;

	protected _connectedTo: string;

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
			{ class: "handle" }
		);
	}

	public getHandleBoundingClientRect()
	{
		return this.handleEl.getBoundingClientRect();
	}

	protected onDragStartEvent(e)
	{
		e.stopPropagation();
		this.dispatchEvent(new VariableDragStartEvent(this));
	}

	protected onDragEndEvent(e)
	{
		this.dispatchEvent(new VariableDragEndEvent(this));
	}

	public get connectedTo(): string
	{
		return this._connectedTo;
	}

	public set connectedTo(newValue: string)
	{
		if (!newValue)
			this.element.classList.remove("connected");
		else
			this.element.classList.add("connected");

		this._connectedTo = newValue;
	}
}

export
class NodeInput extends NodeVariable
{
	constructor(id: string, type: string, name = null, description = null)
	{
		super(id, type, name, description);
		this.input = true;

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
				],
				listeners:
				{
					mousedown: e => this.onDragStartEvent(e),
					mouseup: e => this.onDragEndEvent(e)
				}
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
		this.input = false;

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
				],
				listeners:
				{
					mousedown: e => this.onDragStartEvent(e),
					mouseup: e => this.onDragEndEvent(e)
				}
			}
		);
	}
}
