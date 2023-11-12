import { createElement, createNodeTree } from "../Utils.js";
import Node from "./Node.js";
export default class NodeEditor {
    constructor() {
        this.c = document.createElement("canvas");
        this.ctx = this.c.getContext("2d");
        this.nodeContainer = createElement("div", { class: "nodeContiner" });
        this.nodes = {};
        this.nodeConnections = [];
        this.draggedVariableId = null;
        this.element = createNodeTree({
            name: "div",
            attributes: {
                class: "nodeEditor"
            },
            childNodes: [
                this.c,
                this.nodeContainer
            ]
        });
        window.addEventListener("resize", () => this.resizeEditor());
        this.resizeEditor();
    }
    async loadNodeTypes() {
        this.avaliableNodes = await (await fetch("/api/nodes.json")).json();
    }
    //===== Node management =====//
    generateNodeId(nodeType) {
        const id = nodeType + "#" + Math.floor(Math.random() * 36 ** 4).toString(36);
        if (!this.nodes[id])
            return id;
        return this.generateNodeId(nodeType);
    }
    /**
     * Adds node of a given type
     * @returns Added node or null on fail
     */
    addNode(nodeType, nodeId = null) {
        if (!this.avaliableNodes[nodeType])
            return null;
        if (!nodeId)
            nodeId = this.generateNodeId(nodeType);
        else if (this.nodes[nodeId])
            return null;
        const node = new Node(nodeId, this.avaliableNodes[nodeType]);
        this.nodes[nodeId] = node;
        this.nodeContainer.append(node.element);
        node.addEventListener("node_move", () => {
            this.redrawConnestions();
        });
        node.addEventListener("variable_drag_start", (e) => {
            console.log("Drag start", e.nodeVarId);
            this.draggedVariableId = e.nodeVarId;
            const moveEvent = (e) => {
                this.redrawConnestions();
                const [nodeId, variableId] = this.draggedVariableId.split("?");
                const pos = this.nodes[nodeId].getHandlePosition(variableId);
                this.drawConnection(pos.x, pos.y, e.clientX, e.clientY, "#06f");
            };
            const mouseupEvent = (e) => {
                console.log(e);
                this.draggedVariableId = null;
                window.removeEventListener("mousemove", moveEvent);
                window.removeEventListener("mouseup", mouseupEvent);
                this.redrawConnestions();
            };
            window.addEventListener("mousemove", moveEvent);
            window.addEventListener("mouseup", mouseupEvent);
        });
        node.addEventListener("variable_drag_end", (e) => {
            if (this.draggedVariableId) {
                console.log("New connection!", this.draggedVariableId, e.nodeVarId);
                this.addConnection(this.draggedVariableId, e.nodeVarId);
                this.addConnection(e.nodeVarId, this.draggedVariableId);
                this.redrawConnestions();
            }
        });
        return node;
    }
    getHandlePosition(nodeVarId) {
        const [nodeId, variableId] = nodeVarId.split("?");
        if (!this.nodes[nodeId])
            return null;
        const pos = this.nodes[nodeId].getHandlePosition(variableId);
        if (!pos)
            return null;
        return pos;
    }
    addConnection(nodeVarIdOutput, nodeVarIdInput) {
        const [nodeIdInput, variableIdInput] = nodeVarIdInput.split("?");
        const [nodeIdOutput, variableIdOutput] = nodeVarIdOutput.split("?");
        if (!this.nodes[nodeIdInput])
            return null;
        if (!this.nodes[nodeIdOutput])
            return null;
        if (!this.nodes[nodeIdInput].inputs[variableIdInput])
            return null;
        if (!this.nodes[nodeIdOutput].outputs[variableIdOutput])
            return null;
        this.nodeConnections.push([nodeVarIdInput, nodeVarIdOutput]);
    }
    //===== Drawing =====//
    resizeEditor() {
        this.c.width = window.innerWidth;
        this.c.height = window.innerHeight;
        this.redrawConnestions();
    }
    drawConnection(p1x, p1y, p2x, p2y, colour = "#fff") {
        this.ctx.strokeStyle = colour;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(p1x, p1y);
        this.ctx.lineTo(p2x, p2y);
        this.ctx.stroke();
        this.ctx.fillStyle = colour;
        this.ctx.beginPath();
        this.ctx.arc(p1x, p1y, 4, 0, Math.PI * 2);
        this.ctx.arc(p2x, p2y, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = colour + "2";
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(p1x, p1y);
        this.ctx.lineTo(p2x, p2y);
        this.ctx.stroke();
        this.ctx.fillStyle = colour + "2";
        this.ctx.beginPath();
        this.ctx.arc(p1x, p1y, 6, 0, Math.PI * 2);
        this.ctx.arc(p2x, p2y, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    redrawConnestions() {
        this.ctx.clearRect(0, 0, this.c.width, this.c.height);
        for (const connection of this.nodeConnections) {
            const [nodeIdInput, variableIdInput] = connection[0].split("?");
            const [nodeIdOutput, variableIdOutput] = connection[1].split("?");
            const posInput = this.nodes[nodeIdInput].getHandlePosition(variableIdInput);
            const posOutput = this.nodes[nodeIdOutput].getHandlePosition(variableIdOutput);
            this.drawConnection(posInput.x, posInput.y, posOutput.x, posOutput.y, "#06f");
        }
    }
}
//# sourceMappingURL=NodeEditor.js.map