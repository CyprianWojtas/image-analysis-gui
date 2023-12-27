import Settings from "../Settings.js";
import SocketConnection from "../SocketConnection.js";
import { createElement, createNodeTree } from "../Utils.js";
import AssetLoader from "./AssetLoader.js";
import { NodeInput, NodeOutput, VariableDragEndEvent, VariableDragStartEvent } from "./NodeVariables.js";
import Wiki from "./Wiki.js";
class NodeEvent extends Event {
    constructor(eventName, node) {
        super(eventName, { bubbles: true });
        this.node = node;
        this.nodeId = node.id;
    }
}
export class NodeDragStartEvent extends NodeEvent {
    constructor(node) {
        super("node_drag_start", node);
    }
}
export class NodeDragEndEvent extends NodeEvent {
    constructor(node) {
        super("node_drag_end", node);
    }
}
export class NodeMoveEvent extends NodeEvent {
    constructor(node) {
        super("node_move", node);
    }
}
export class NodeRemoveEvent extends NodeEvent {
    constructor(node) {
        super("node_remove", node);
    }
}
export class NodeChangeEvent extends NodeEvent {
    constructor(node, pushToHistory = true) {
        super("node_change", node);
        this.pushToHistory = pushToHistory;
    }
}
export default class Node extends EventTarget {
    constructor(id, type, attributes = {}) {
        var _a;
        super();
        this.attributes = {};
        this.customInputs = [];
        this.customOuptuts = [];
        this.nodeContents = createElement("div", { class: "nodeContents" });
        this.inputsContainer = createElement("div", { class: "inputsContainer" });
        this.outputsContainer = createElement("div", { class: "outputsContainer" });
        this.errorBox = createElement("div", { class: "errorBox" });
        //===== Variables =====//
        this.inputs = {};
        this.outputs = {};
        const nodeData = AssetLoader.nodesData[type];
        this.id = id;
        this.type = type;
        this.attributes = attributes;
        this.element = createNodeTree({
            name: "div",
            attributes: {
                class: `node nodeId_${this.id}`,
                style: `--node-colour: ${((_a = AssetLoader.nodesGroups[nodeData.group]) === null || _a === void 0 ? void 0 : _a.colour) || "#333"}`
            },
            childNodes: [
                {
                    name: "div",
                    attributes: { class: "nodeTitle" },
                    listeners: {
                        mousedown: e => this.dragStart(e)
                    },
                    childNodes: [
                        (nodeData === null || nodeData === void 0 ? void 0 : nodeData.name) || "New Node",
                        {
                            name: "div",
                            attributes: { class: "buttons buttons-circled" },
                            childNodes: [
                                {
                                    name: "button",
                                    attributes: { title: "Duplicate" },
                                    childNodes: [{ name: "i", attributes: { class: "icon-duplicate" } }],
                                    listeners: {
                                        mousedown: e => e.stopPropagation(),
                                        click: e => {
                                            e.stopPropagation();
                                            this.editor.addNode(this.type, undefined, this.posX + 18, this.posY + 18);
                                            this.editor.historyPush();
                                        }
                                    }
                                },
                                {
                                    name: "button",
                                    attributes: { title: "Help" },
                                    childNodes: [{ name: "i", attributes: { class: "icon-help" } }],
                                    listeners: {
                                        mousedown: e => e.stopPropagation(),
                                        click: e => {
                                            e.stopPropagation();
                                            Wiki.openArticle(this.type);
                                        }
                                    }
                                },
                                {
                                    name: "button",
                                    childNodes: [{ name: "i", attributes: { class: "icon-cancel" } }],
                                    attributes: { class: "btn-close", title: "Remove" },
                                    listeners: {
                                        mousedown: e => e.stopPropagation(),
                                        click: e => {
                                            e.stopPropagation();
                                            this.remove();
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                this.nodeContents,
                this.errorBox
            ],
            listeners: {
                mousedown: e => {
                    if (e.button != 0)
                        return;
                    e.stopPropagation();
                }
            }
        });
        SocketConnection.addEventListener("analysis_node_processing", (e) => {
            if (e.nodeId != this.id)
                return;
            console.log(`Processing: ${this.id}...`);
            this.element.classList.add("processing");
        });
        SocketConnection.addEventListener("analysis_node_processed", (e) => {
            if (e.nodeId != this.id)
                return;
            console.log(`Processed: ${this.id}!`);
            this.element.classList.remove("processing");
            this.element.classList.add("processed");
            this.onProcessed(e.data);
        });
        SocketConnection.addEventListener("analysis_node_error", (e) => {
            if (e.nodeId != this.id)
                return;
            console.error(`Error ${this.id}!\n${e.error}`);
            this.element.classList.remove("processing");
            this.element.classList.add("error");
            this.errorBox.innerHTML = "";
            this.errorBox.append(e.error);
            this.onError(e.error);
        });
        this.renderContents();
        this.moveTo(nodeData.posX || 0, nodeData.posY || 0);
    }
    renderContents() {
        this.nodeContents.append(this.inputsContainer, this.outputsContainer);
        const nodeData = AssetLoader.nodesData[this.type];
        for (const input of nodeData.inputs || []) {
            this.addInput(input.id, input.type, input.name, input.description);
        }
        for (const output of nodeData.outputs || []) {
            this.addOutput(output.id, output.type, output.name, output.description);
        }
    }
    addInput(id, type, name, description) {
        const input = new NodeInput(id, type, name, description);
        input.addEventListener("variable_drag_start", (e) => {
            this.dispatchEvent(new VariableDragStartEvent(e.variable, this.id));
        });
        input.addEventListener("variable_drag_end", (e) => {
            this.dispatchEvent(new VariableDragEndEvent(e.variable, this.id));
        });
        this.inputs[id] = input;
        this.inputsContainer.append(input.element);
    }
    removeInput(id) {
        this.inputs[id].element.remove();
        delete this.inputs[id];
    }
    addOutput(id, type, name, description) {
        const output = new NodeOutput(id, type, name, description);
        output.addEventListener("variable_drag_start", (e) => {
            this.dispatchEvent(new VariableDragStartEvent(e.variable, this.id));
        });
        output.addEventListener("variable_drag_end", (e) => {
            this.dispatchEvent(new VariableDragEndEvent(e.variable, this.id));
        });
        this.outputs[id] = output;
        this.outputsContainer.append(output.element);
    }
    removeOutput(id) {
        this.outputs[id].element.remove();
        delete this.outputs[id];
    }
    //===== Node Dragging =====//
    moveTo(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        this.element.style.top = posY + "px";
        this.element.style.left = posX + "px";
        this.dispatchEvent(new NodeMoveEvent(this));
    }
    dragStart(e) {
        if (e.button != 0)
            return;
        e.stopPropagation();
        let startPosX = this.posX;
        let startPosY = this.posY;
        let dragPosX = e.clientX;
        let dragPosY = e.clientY;
        const moveEvent = (e) => {
            let posX = startPosX + (e.clientX - dragPosX) / this.editor.scale;
            let posY = startPosY + (e.clientY - dragPosY) / this.editor.scale;
            if (Settings.get("editor.snapToGrid")) {
                posX = Math.round(posX / 18) * 18;
                posY = Math.round(posY / 18) * 18;
            }
            this.moveTo(posX, posY);
        };
        const mouseupEvent = (e) => {
            moveEvent(e);
            window.removeEventListener("mousemove", moveEvent);
            window.removeEventListener("mouseup", mouseupEvent);
            this.element.classList.remove("dragged");
            this.dispatchEvent(new NodeDragEndEvent(this));
            this.sendUpdate();
        };
        window.addEventListener("mousemove", moveEvent);
        window.addEventListener("mouseup", mouseupEvent);
        this.element.classList.add("dragged");
        this.dispatchEvent(new NodeDragStartEvent(this));
    }
    getVariable(varaibleId) {
        return this.inputs[varaibleId] || this.outputs[varaibleId] || null;
    }
    getHandlePosition(handleId) {
        const variable = this.inputs[handleId] || this.outputs[handleId];
        if (variable.posX === null || variable.posY === null) {
            const thisPos = this.element.getBoundingClientRect();
            const variablePos = variable.getHandleBoundingClientRect();
            variable.posX = (variablePos.x - thisPos.x) / this.editor.scale + 4;
            variable.posY = (variablePos.y - thisPos.y) / this.editor.scale + 4;
        }
        return {
            x: this.posX + variable.posX,
            y: this.posY + variable.posY
        };
    }
    updateHandlePositions() {
        for (const id in this.inputs) {
            this.inputs[id].posX = null;
            this.inputs[id].posY = null;
        }
        for (const id in this.outputs) {
            this.outputs[id].posX = null;
            this.outputs[id].posY = null;
        }
        this.dispatchEvent(new NodeChangeEvent(this, false));
    }
    toJSONObj() {
        const jsonObj = {
            type: this.type,
            attributes: this.attributes,
            posX: this.posX,
            posY: this.posY
        };
        if (this.customInputs.length)
            jsonObj.customInputs = this.customInputs;
        if (this.customOuptuts.length)
            jsonObj.customOuptuts = this.customOuptuts;
        return jsonObj;
    }
    sendUpdate() {
        this.dispatchEvent(new NodeChangeEvent(this));
    }
    remove() {
        this.element.remove();
        this.dispatchEvent(new NodeRemoveEvent(this));
    }
    // Parsing analysis output
    onProcessed(data) {
    }
    onError(error) {
    }
}
//# sourceMappingURL=Node.js.map