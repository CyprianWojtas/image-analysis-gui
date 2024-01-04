import { GroupTemplate, NodeTemplate, VariableTemplate } from "../apiTypes/Analysis.js";

export default
abstract class AssetLoader
{
	/**
	 * Nodes template data
	 */
	static nodesData: { [param: string] : NodeTemplate };
	static nodesGroups: { [param: string] : GroupTemplate };
	static variableTypes: { [param: string] : VariableTemplate };

	static async loadNodeTypes()
	{
		const nodes = await (await fetch("/api/nodes")).json();
		this.nodesData = nodes.nodes;
		this.nodesGroups = nodes.groups;
		this.variableTypes = await (await fetch("/api/variables")).json();

		for(const nodeId in this.nodesData)
		{
			const node = this.nodesData[nodeId];
			if (!node.customClass)
				continue;

			node.class = (await import(`/api/nodes/${ nodeId }`)).default;
		}
	}
}
