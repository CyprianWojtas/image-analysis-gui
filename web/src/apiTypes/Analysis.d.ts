import Node from "../editor/Node.js";

// Node

export interface NodeVariable
{
	id: string;
	name: string;
	type: string;
	description?: string;
}

export interface NodeTemplate
{
	customClass: boolean;
	class?: typeof Node;
	group: string;
	name: string;
	description: string;
	wiki: string;
	inputs: NodeVariable[];
	outputs: NodeVariable[];
	path: string;
	codePath: string;
}

export interface NodeSerialisable
{
	type: string;
	attributes: { [key: string]: any };
	posX: number;
	posY: number;
	customInputs?: string[];
	customOutputs?: string[];
}

// Variable type
export interface VariableTemplate
{
	id: string;
	name: string;
	description: string;
	colour: string;
}

// Group type
export interface GroupTemplate
{
	id: string;
	name: string;
	path: string;
	description: string;
	colour: string;
}

export interface Analysis
{
	nodes: { [nodeId: string]: NodeSerialisable },
	connections: [connectionOutput: string, connectionInput: string][],
	title: string,
	creationTime: number,
	updateTime: number
}
