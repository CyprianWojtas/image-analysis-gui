import Node from "./editor/Node.js";
import NodeEditor from "./editor/NodeEditor.js";

(async () =>
{
	const editor = new NodeEditor();

	await editor.loadNodeTypes();

	document.body.append(editor.element);
	
	const nodeIn = editor.addNode("test/int_input");
	const nodeIn2 = editor.addNode("test/int_input");
	const nodeInOut = editor.addNode("test/int_inout");
	const nodeOut = editor.addNode("test/int_output");

	console.log(editor);

	// console.log(editor.getHandlePosition(nodeOut.id + "?num_out"));
	// console.log(editor.getHandlePosition(nodeIn.id + "?num_in"));

	
	// editor.addConnection(nodeOut.id + "?num_out", nodeInOut.id + "?num_in");
	// editor.addConnection(nodeInOut.id + "?num_out1", nodeIn.id + "?num_in");
	// editor.addConnection(nodeInOut.id + "?num_out2", nodeIn2.id + "?num_in");
	
})();
