import NodeEditor from "./editor/NodeEditor.js";
import Wiki from "./editor/Wiki.js";
import FilePicker, { FileOpenEvent } from "./files/FilePicker.js";

(async () =>
{
	const editor = new NodeEditor();
	const filePicker = new FilePicker();
	Wiki.init();
	

	await editor.loadNodeTypes();

	const editorStyles = editor.createEditorStyles();

	document.head.append(editorStyles);

	document.body.append(editor.element);
	
	// @ts-ignore
	window.editor = editor;

	if (window.location.hash)
	{
		editor.openFile(window.location.hash.substring(1));
	}
	else
	{
		filePicker.open();
	}

	filePicker.addEventListener("file_open", async (e: FileOpenEvent) =>
	{
		editor.openFile(e.path);
		window.location.hash = e.path;
	});

	// setInterval(() =>
	// {
	// 	window.location.hash = encodeURIComponent(editor.toJSON());
	// }, 1000);
	
})();
