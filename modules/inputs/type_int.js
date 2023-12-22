import Node from "/js/editor/Node.js";
import { createNodeTree } from "/js/Utils.js";

export default
class IntInputNode extends Node
{
	renderContents()
	{
		this.attributesBox = createNodeTree(
			{
				name: "div",
				attributes: { class: "attributesBox" },
				childNodes:
				[
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
				]
			}
		);

		this.nodeContents.append(
			this.outputsContainer
		);

		this.addOutput("int_out", "int", this.attributesBox, "");
	}
}