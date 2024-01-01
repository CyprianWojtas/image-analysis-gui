import Settings from "../Settings.js";
import SocketConnection from "../SocketConnection.js";
import { createElement, createNodeTree, stopLMBPropagation } from "../Utils.js";
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
    constructor(node, pushToHistory = true, reloadAnalysis = false) {
        super("node_change", node);
        this.pushToHistory = pushToHistory;
        this.reloadAnalysis = reloadAnalysis;
    }
}
export default class Node extends EventTarget {
    constructor(id, type, attributes = {}) {
        var _a;
        super();
        /** Dictionary containing all custom node attributes (saved in analysis file) */
        this.attributes = {};
        /** List containing names of all custom node inputs; if specified used as default inputs for the node */
        this.customInputs = [];
        /** List containing names of all custom node outputs; if specified used as default outputs for the node */
        this.customOuptuts = [];
        /** HTML element containing the node contents */
        this.nodeContents = createElement("div", { class: "nodeContents" });
        /** HTML element containing the inputs and theif handles */
        this.inputsContainer = createElement("div", { class: "inputsContainer" });
        /** HTML element containing the outputs and theif handles */
        this.outputsContainer = createElement("div", { class: "outputsContainer" });
        /** HTML element displaying errors when running the node fails */
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
            class: `node nodeId_${this.id}`,
            style: `--node-colour: ${((_a = AssetLoader.nodesGroups[nodeData.group]) === null || _a === void 0 ? void 0 : _a.colour) || "#333"}`,
            childNodes: [
                {
                    name: "div",
                    class: "nodeTitle",
                    listeners: {
                        mousedown: e => this.dragStart(e)
                    },
                    childNodes: [
                        (nodeData === null || nodeData === void 0 ? void 0 : nodeData.name) || "New Node",
                        {
                            name: "div",
                            class: "buttons buttons-circled",
                            childNodes: [
                                {
                                    name: "button",
                                    title: "Reload",
                                    childNodes: [{ name: "i", class: "icon-arrows-cw" }],
                                    listeners: {
                                        mousedown: e => stopLMBPropagation(e),
                                        click: e => {
                                            e.stopPropagation();
                                            this.sendUpdate(true);
                                        }
                                    }
                                },
                                {
                                    name: "button",
                                    title: "Duplicate",
                                    childNodes: [{ name: "i", class: "icon-duplicate" }],
                                    listeners: {
                                        mousedown: e => stopLMBPropagation(e),
                                        click: e => {
                                            e.stopPropagation();
                                            this.editor.addNode(this.type, undefined, this.posX + 18, this.posY + 18, Object.assign({}, this.attributes));
                                            this.editor.historyPush();
                                        }
                                    }
                                },
                                {
                                    name: "button",
                                    title: "Help",
                                    childNodes: [{ name: "i", class: "icon-help" }],
                                    listeners: {
                                        mousedown: e => stopLMBPropagation(e),
                                        click: e => {
                                            e.stopPropagation();
                                            Wiki.openArticle(this.type);
                                        }
                                    }
                                },
                                {
                                    name: "button",
                                    class: "btn-close",
                                    title: "Remove",
                                    childNodes: [{ name: "i", class: "icon-cancel" }],
                                    listeners: {
                                        mousedown: e => stopLMBPropagation(e),
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
                mousedown: e => stopLMBPropagation(e)
            }
        });
        SocketConnection.addEventListener("analysis_node_processing", (e) => {
            if (e.nodeId != this.id)
                return;
            this.element.classList.add("processing");
        });
        SocketConnection.addEventListener("analysis_node_processed", (e) => {
            if (e.nodeId != this.id)
                return;
            this.markAsProcessed();
            this.onProcessed(e.data);
        });
        SocketConnection.addEventListener("analysis_node_error", (e) => {
            if (e.nodeId != this.id)
                return;
            console.error(`Error ${this.id}!\n${e.error}`);
            this.markAsError(e.error);
        });
        SocketConnection.addEventListener("analysis_node_data", (e) => {
            if (e.nodeId != this.id)
                return;
            this.markAsProcessed();
            this.onProcessed(e.data);
        });
        this.renderContents();
        this.moveTo(0, 0);
    }
    /**
     * Creates node contents when the node is being created
     */
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
    //===== Node Status =====//
    /**
     * Marks the node as being done processing
     */
    markAsProcessed() {
        this.element.classList.remove("processing");
        this.element.classList.add("processed");
    }
    /**
     * Shows the node processing error
     */
    markAsError(error) {
        this.element.classList.remove("processing");
        this.element.classList.add("error");
        this.errorBox.innerHTML = "";
        this.errorBox.append(error);
        this.onError(error);
    }
    /**
     * Marks node as outdated (unprocessed)
     */
    markOutdated() {
        this.element.classList.remove("processing");
        this.element.classList.remove("processed");
        this.element.classList.remove("error");
        this.onOutdated();
    }
    /**
     * Creates a node input and appends it to the inputsContainer
     */
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
    /**
     * Creates a node output and appends it to the outputsContainer
     */
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
            this.sendUpdate(false);
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
            jsonObj.customOutputs = this.customOuptuts;
        return jsonObj;
    }
    sendUpdate(reloadAnalysis = true) {
        this.dispatchEvent(new NodeChangeEvent(this, true, reloadAnalysis));
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
    onOutdated() {
    }
}
//# sourceMappingURL=Node.js.map