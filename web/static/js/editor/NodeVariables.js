import { createElement, createNodeTree } from "../Utils.js";
class VarDragEvent extends Event {
    constructor(eventName, variableId, nodeId = null) {
        super(eventName, { bubbles: true });
        this.variableId = variableId;
        this.nodeId = nodeId;
    }
    get nodeVarId() {
        return this.nodeId + "?" + this.variableId;
    }
}
export class VariableDragStartEvent extends VarDragEvent {
    constructor(variableId, nodeId = null) {
        super("variable_drag_start", variableId, nodeId);
    }
}
export class VariableDragEndEvent extends VarDragEvent {
    constructor(variableId, nodeId = null) {
        super("variable_drag_end", variableId, nodeId);
    }
}
class NodeVariable extends EventTarget {
    constructor(id, type, name = null, description = null) {
        super();
        /** Used to determine handle position in the node */
        this.posX = null;
        /** Used to determine handle position in the node */
        this.posY = null;
        this.id = id;
        this.type = type;
        this.name = name;
        this.description = description;
        this.handleEl = createElement("div", { class: "handle" }, {
            mousedown: () => {
                this.dispatchEvent(new VariableDragStartEvent(this.id));
            },
            mouseup: () => {
                this.dispatchEvent(new VariableDragEndEvent(this.id));
            }
        });
    }
    getHandleBoundingClientRect() {
        return this.handleEl.getBoundingClientRect();
    }
}
export class NodeInput extends NodeVariable {
    constructor(id, type, name = null, description = null) {
        super(id, type, name, description);
        this.element = createNodeTree({
            name: "div",
            attributes: {
                class: `nodeInput nodeVariableType_${type}`,
                title: description || ""
            },
            childNodes: [
                {
                    name: "div",
                    attributes: {
                        class: "name"
                    },
                    childNodes: [
                        this.name || this.id || ""
                    ]
                },
                this.handleEl
            ]
        });
    }
}
export class NodeOutput extends NodeVariable {
    constructor(id, type, name = null, description = null) {
        super(id, type, name, description);
        this.element = createNodeTree({
            name: "div",
            attributes: {
                class: `nodeOutput nodeVariableType_${type}`,
                title: description || ""
            },
            childNodes: [
                {
                    name: "div",
                    attributes: {
                        class: "name"
                    },
                    childNodes: [
                        this.name || this.id || ""
                    ]
                },
                this.handleEl
            ]
        });
    }
}
//# sourceMappingURL=NodeVariables.js.map