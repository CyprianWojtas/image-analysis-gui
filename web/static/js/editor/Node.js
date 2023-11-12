import { createElement, createNodeTree } from "../Utils.js";
import { NodeInput, NodeOutput, VariableDragEndEvent, VariableDragStartEvent } from "./NodeVariables.js";
export default class Node extends EventTarget {
    constructor(id, nodeData = {}) {
        super();
        this.inputsContainer = createElement("div", { class: "inputsContainer" });
        this.outputsContainer = createElement("div", { class: "outputsContainer" });
        //===== Variables =====//
        this.inputs = {};
        this.outputs = {};
        this.id = id;
        this.element = createNodeTree({
            name: "div",
            attributes: {
                class: "node"
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
            this.dispatchEvent(new VariableDragStartEvent(e.variableId, this.id));
        });
        input.addEventListener("variable_drag_end", (e) => {
            this.dispatchEvent(new VariableDragEndEvent(e.variableId, this.id));
        });
        this.inputs[id] = input;
        this.inputsContainer.append(input.element);
    }
    addOutput(id, type, name, description) {
        const output = new NodeOutput(id, type, name, description);
        output.addEventListener("variable_drag_start", (e) => {
            this.dispatchEvent(new VariableDragStartEvent(e.variableId, this.id));
        });
        output.addEventListener("variable_drag_end", (e) => {
            this.dispatchEvent(new VariableDragEndEvent(e.variableId, this.id));
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
        this.dispatchEvent(new Event("node_move"));
    }
    dragStart(e) {
        let startPosX = this.posX;
        let startPosY = this.posY;
        let dragPosX = e.clientX;
        let dragPosY = e.clientY;
        const moveEvent = (e) => {
            let newX = startPosX + e.clientX - dragPosX;
            let newY = startPosY + e.clientY - dragPosY;
            if (newX < 0)
                newX = 0;
            if (newY < 0)
                newY = 0;
            this.moveTo(newX, newY);
        };
        const mouseupEvent = (e) => {
            moveEvent(e);
            window.removeEventListener("mousemove", moveEvent);
            window.removeEventListener("mouseup", mouseupEvent);
        };
        window.addEventListener("mousemove", moveEvent);
        window.addEventListener("mouseup", mouseupEvent);
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