import { createElement, createNodeTree } from "../Utils.js";
import { NodeInput, NodeOutput, VariableDragEndEvent, VariableDragStartEvent } from "./NodeVariables.js";
class NodeDragEvent extends Event {
    constructor(eventName, node) {
        super(eventName, { bubbles: true });
        this.node = node;
        this.nodeId = node.id;
    }
}
export class NodeDragStartEvent extends NodeDragEvent {
    constructor(node) {
        super("node_drag_start", node);
    }
}
export class NodeDragEndEvent extends NodeDragEvent {
    constructor(node) {
        super("node_drag_end", node);
    }
}
export class NodeMoveEvent extends NodeDragEvent {
    constructor(node) {
        super("node_move", node);
    }
}
export default class Node extends EventTarget {
    constructor(id, type, nodeData = {}) {
        super();
        this.inputsContainer = createElement("div", { class: "inputsContainer" });
        this.outputsContainer = createElement("div", { class: "outputsContainer" });
        //===== Variables =====//
        this.inputs = {};
        this.outputs = {};
        this.id = id;
        this.type = type;
        this.element = createNodeTree({
            name: "div",
            attributes: {
                class: `node nodeId_${this.id}`
            },
            childNodes: [
                {
                    name: "div",
                    attributes: {
                        class: "nodeTitle"
                    },
                    listeners: {
                        mousedown: e => this.dragStart(e)
                    },
                    childNodes: [
                        (nodeData === null || nodeData === void 0 ? void 0 : nodeData.name) || "New Node"
                    ]
                },
                this.inputsContainer,
                this.outputsContainer
            ]
        });
        for (const input of nodeData.inputs || []) {
            this.addInput(input.id, input.type, input.name, input.description);
        }
        for (const output of nodeData.outputs || []) {
            this.addOutput(output.id, output.type, output.name, output.description);
        }
        this.moveTo(nodeData.posX || 0, nodeData.posY || 0);
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
    //===== Node Dragging =====//
    moveTo(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        this.element.style.top = posY + "px";
        this.element.style.left = posX + "px";
        this.dispatchEvent(new NodeMoveEvent(this));
    }
    dragStart(e) {
        e.stopPropagation();
        let startPosX = this.posX;
        let startPosY = this.posY;
        let dragPosX = e.clientX;
        let dragPosY = e.clientY;
        const moveEvent = (e) => {
            this.moveTo(startPosX + e.clientX - dragPosX, startPosY + e.clientY - dragPosY);
        };
        const mouseupEvent = (e) => {
            moveEvent(e);
            window.removeEventListener("mousemove", moveEvent);
            window.removeEventListener("mouseup", mouseupEvent);
            this.dispatchEvent(new NodeDragEndEvent(this));
        };
        window.addEventListener("mousemove", moveEvent);
        window.addEventListener("mouseup", mouseupEvent);
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
            variable.posX = variablePos.x - thisPos.x + 4;
            variable.posY = variablePos.y - thisPos.y + 4;
        }
        return {
            x: this.posX + variable.posX,
            y: this.posY + variable.posY
        };
    }
}
//# sourceMappingURL=Node.js.map