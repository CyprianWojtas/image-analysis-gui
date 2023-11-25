import NodeEditor from "./editor/NodeEditor.js";
(async () => {
    const editor = new NodeEditor();
    await editor.loadNodeTypes();
    const editorStyles = editor.createEditorStyles();
    document.head.append(editorStyles);
    document.body.append(editor.element);
    // @ts-ignore
    window.editor = editor;
    if (window.location.hash)
        editor.loadJSON(decodeURIComponent(window.location.hash.substring(1)));
    else
        editor.loadJSON('{"nodes":{"filter/gaussian_blur#h8ub":{"type":"filter/gaussian_blur","posX":614,"posY":126},"file/input#tnp0":{"type":"file/input","posX":217,"posY":114},"var_out/string#ysi5":{"type":"var_out/string","posX":6,"posY":22},"var_duplicate/image_rgb_256#4kz0":{"type":"var_duplicate/image_rgb_256","posX":418,"posY":24},"var_out/int#8tu6":{"type":"var_out/int","posX":11,"posY":213},"filter/subtraction#a2xj":{"type":"filter/subtraction","posX":812,"posY":26},"filter/inversion#vixz":{"type":"filter/inversion","posX":1001,"posY":141},"filter/brightness_contrast#6qgu":{"type":"filter/brightness_contrast","posX":1172,"posY":265},"var_out/int#s7jq":{"type":"var_out/int","posX":5,"posY":367},"var_out/int#au1f":{"type":"var_out/int","posX":6,"posY":439},"filter/binarisation#9b2h":{"type":"filter/binarisation","posX":1339,"posY":409},"var_int/image#box9":{"type":"var_int/image","posX":1493,"posY":550}},"connections":[["var_out/string#ysi5?string","file/input#tnp0?file_name"],["file/input#tnp0?image","var_duplicate/image_rgb_256#4kz0?image_in"],["var_out/int#8tu6?int","filter/gaussian_blur#h8ub?blur_radius"],["var_duplicate/image_rgb_256#4kz0?image_out_2","filter/gaussian_blur#h8ub?image_in"],["var_duplicate/image_rgb_256#4kz0?image_out_1","filter/subtraction#a2xj?image_in"],["filter/gaussian_blur#h8ub?image_out","filter/subtraction#a2xj?subtracted_image"],["filter/subtraction#a2xj?image_out","filter/inversion#vixz?image_in"],["filter/inversion#vixz?image_out","filter/brightness_contrast#6qgu?image_in"],["var_out/int#s7jq?int","filter/brightness_contrast#6qgu?brightness"],["var_out/int#au1f?int","filter/brightness_contrast#6qgu?contrast"],["filter/brightness_contrast#6qgu?image_out","filter/binarisation#9b2h?image_in"],["filter/binarisation#9b2h?image_out","var_int/image#box9?image"]]}');
    setInterval(() => {
        window.location.hash = encodeURIComponent(editor.toJSON());
    }, 1000);
})();
//# sourceMappingURL=main.js.map