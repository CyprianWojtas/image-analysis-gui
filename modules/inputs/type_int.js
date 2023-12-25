import Node from "/js/editor/Node.js";
import { createNodeTree } from "/js/Utils.js";

export default
class IntInputNode extends Node
{
	renderContents()
	{
		this.valueInput = createNodeTree(
			{
				name: "input",
				attributes: { type: "number", style: "width: 6rem", value: this.attributes.value || 0 },
				listeners:
				{
					input: e =>
					{
						this.attributes.value = e.target.valueAsNumber;
					},
					blur: e =>
					{
						this.attributes.value = e.target.valueAsNumber;
						this.sendUpdate();
					},
					mousedown: e => e.stopPropagation()
				}
			}
		);

		this.nodeContents.style.gridTemplateColumns = "auto";

		this.nodeContents.append(
			this.outputsContainer
		);

		this.addOutput("value", "int", this.valueInput, "");
	}
}