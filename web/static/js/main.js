import AssetLoader from "./editor/AssetLoader.js";
import NodeEditor from "./editor/NodeEditor.js";
import Wiki from "./editor/Wiki.js";
import FilePicker from "./files/FilePicker.js";
(async () => {
    Wiki.init();
    await AssetLoader.loadNodeTypes();
    const editor = new NodeEditor();
    const filePicker = new FilePicker();
    const editorStyles = editor.createEditorStyles();
    document.head.append(editorStyles);
    document.body.append(editor.element);
    // @ts-ignore
    window.editor = editor;
    if (window.location.hash) {
        editor.openFile(window.location.hash.substring(1));
    }
    else {
        filePicker.open();
    }
    filePicker.addEventListener("file_open", async (e) => {
        editor.openFile(e.path);
        window.location.hash = e.path;
    });
    // setInterval(() =>
    // {
    // 	window.location.hash = encodeURIComponent(editor.toJSON());
    // }, 1000);
})();
//# sourceMappingURL=main.js.map