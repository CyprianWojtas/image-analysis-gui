import { createElement, createNodeTree } from "../Utils.js";
import Node from "./Node.js";
import NodeShelf from "./NodeShelf.js";
import Wiki from "./Wiki.js";
export default class NodeEditor {
    constructor() {
        this.c = document.createElement("canvas");
        this.ctx = this.c.getContext("2d");
        this.nodeContainer = createElement("div", { class: "nodeContainer" });
        this.posX = 0;
        this.posY = 0;
        this.nodeShelf = new NodeShelf();
        this.nodes = {};
        this.nodeConnections = [];
        this.history = [];
        this.draggedVariableId = null;
        this.draggedVariableType = null;
        // ===== Data Import/Export ===== //
        this.undoHistory = [];
        this.element = createNodeTree({
            name: "div",
            attributes: {
                class: "nodeEditor"
            },
            childNodes: [
                {
                    name: "div",
                    attributes: {
                        class: "nodesBox"
                    },
                    childNodes: [
                        this.c,
                        this.nodeContainer
                    ],
                    listeners: {
                        dragover: e => e.preventDefault(),
                        drop: e => {
                            e.preventDefault();
                            const nodeId = e.dataTransfer.getData("nodeId");
                            if (!nodeId)
                                return;
                            this.addNode(nodeId, null, e.clientX - this.posX, e.clientY - this.posY);
                            this.historyPush();
                        },
                        mousedown: e => this.dragStart(e)
                    }
                },
                this.nodeShelf.element
            ]
        });
        document.body.addEventListener("keydown", e => {
            if (e.ctrlKey && !e.shiftKey && e.code == "KeyZ")
                this.historyUndo();
            if ((e.ctrlKey && e.shiftKey && e.code == "KeyZ") ||
                (e.ctrlKey && !e.shiftKey && e.code == "KeyY"))
                this.historyRedo();
        });
        window.addEventListener("resize", () => this.resizeEditor());
        this.resizeEditor();
    }
    async loadNodeTypes() {
        this.avaliableNodes = await (await fetch("/api/nodes")).json();
        this.avaliableVariableTypes = await (await fetch("/api/variable-types.json")).json();
        Wiki.addNodes(this.avaliableNodes);
        this.nodeShelf.addNodes(this.avaliableNodes, this.avaliableVariableTypes);
    }
    createEditorStyles() {
        const styleEl = document.createElement("style");
        for (const vairiableTypeId in this.avaliableVariableTypes) {
            const vairiableType = this.avaliableVariableTypes[vairiableTypeId];
            styleEl.innerHTML += `.nodeEditor .node .nodeVariableType_${vairiableTypeId} .handle { background: ${vairiableType.color}; }`;
            styleEl.innerHTML +=
                `
				.nodeEditor.variableDraggedType_${vairiableTypeId}.variableDragged_input .node .nodeOutput.nodeVariableType_${vairiableTypeId} .handle,
				.nodeEditor.variableDraggedType_${vairiableTypeId}.variableDragged_output .node .nodeInput.nodeVariableType_${vairiableTypeId} .handle
				{
					filter: none;
				}
				.nodeEditor.variableDraggedType_${vairiableTypeId}.variableDragged_input .node .nodeOutput.nodeVariableType_${vairiableTypeId}:hover .handle,
				.nodeEditor.variableDraggedType_${vairiableTypeId}.variableDragged_output .node .nodeInput.nodeVariableType_${vairiableTypeId}:hover .handle,
				.nodeEditor.variableDraggedType_${vairiableTypeId} .node .nodeInput.dragged .handle,
				.nodeEditor.variableDraggedType_${vairiableTypeId} .node .nodeOutput.dragged .handle
				{
					box-shadow: 0 0 6px 4px ${vairiableType.color};
				}
			`;
        }
        return styleEl;
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
    addNode(nodeType, nodeId = null, nodePosX = 0, nodePosY = 0) {
        if (!this.avaliableNodes[nodeType])
            return null;
        if (!nodeId)
            nodeId = this.generateNodeId(nodeType);
        else if (this.nodes[nodeId])
            return null;
        const node = new Node(nodeId, nodeType, this.avaliableNodes[nodeType]);
        this.nodes[nodeId] = node;
        this.nodeContainer.append(node.element);
        node.moveTo(nodePosX, nodePosY);
        node.addEventListener("node_move", () => {
            this.redrawConnestions();
        });
        node.addEventListener("node_drag_start", () => {
            this.nodeContainer.append(node.element);
        });
        node.addEventListener("node_drag_end", () => {
            this.historyPush();
        });
        node.addEventListener("variable_drag_start", (e) => {
            this.draggedVariableType = e.variable.type;
            let isInput = e.variable.input;
            const conectedVariable = this.getConnectedVariable(e.nodeVarId);
            if (conectedVariable) {
                this.draggedVariableId = conectedVariable;
                if (e.variable.input)
                    this.removeConnection(conectedVariable, e.nodeVarId);
                else
                    this.removeConnection(e.nodeVarId, conectedVariable);
                isInput = !isInput;
            }
            else
                this.draggedVariableId = e.nodeVarId;
            this.element.classList.add("variableDragged");
            this.element.classList.add(`variableDraggedType_${this.draggedVariableType}`);
            this.element.classList.add(`variableDragged_${isInput ? "input" : "output"}`);
            const [nodeId, variableId] = this.draggedVariableId.split("?");
            this.nodes[nodeId].getVariable(variableId).element.classList.add("dragged");
            const moveEvent = (e) => {
                this.redrawConnestions();
                const pos = this.nodes[nodeId].getHandlePosition(variableId);
                if (isInput)
                    this.drawConnection(pos.x, pos.y, e.clientX - this.posX, e.clientY - this.posY, this.avaliableVariableTypes[this.draggedVariableType].color);
                else
                    this.drawConnection(e.clientX - this.posX, e.clientY - this.posY, pos.x, pos.y, this.avaliableVariableTypes[this.draggedVariableType].color);
            };
            const mouseupEvent = (e) => {
                this.draggedVariableId = null;
                this.element.classList.remove("variableDragged");
                this.element.classList.remove(`variableDraggedType_${this.draggedVariableType}`);
                this.element.classList.remove(`variableDragged_${isInput ? "input" : "output"}`);
                this.nodes[nodeId].getVariable(variableId).element.classList.remove("dragged");
                window.removeEventListener("mousemove", moveEvent);
                window.removeEventListener("mouseup", mouseupEvent);
                this.redrawConnestions();
                this.historyPush();
            };
            window.addEventListener("mousemove", moveEvent);
            window.addEventListener("mouseup", mouseupEvent);
        });
        node.addEventListener("variable_drag_end", (e) => {
            if (this.draggedVariableId) {
                if (this.draggedVariableType != e.variable.type || this.getConnectedVariable(e.nodeVarId)) {
                    this.redrawConnestions();
                    return;
                }
                console.log("New connection!", this.draggedVariableId, e.nodeVarId);
                if (e.variable.input)
                    this.addConnection(this.draggedVariableId, e.nodeVarId);
                else
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
        this.nodes[nodeIdInput].inputs[variableIdInput].connectedTo = nodeVarIdOutput;
        this.nodes[nodeIdOutput].outputs[variableIdOutput].connectedTo = nodeVarIdInput;
        this.nodeConnections.push([nodeVarIdOutput, nodeVarIdInput]);
    }
    removeConnection(nodeVarIdOutput, nodeVarIdInput) {
        for (const connectionId in this.nodeConnections) {
            const connection = this.nodeConnections[connectionId];
            if (connection[1] == nodeVarIdInput && connection[0] == nodeVarIdOutput) {
                this.nodeConnections = [...this.nodeConnections.slice(0, parseInt(connectionId)), ...this.nodeConnections.slice(parseInt(connectionId) + 1)];
                this.getVariable(nodeVarIdOutput).connectedTo = null;
                this.getVariable(nodeVarIdInput).connectedTo = null;
                return true;
            }
        }
    }
    getVariable(nodeVarId) {
        var _a;
        const [nodeId, variableId] = nodeVarId.split("?");
        return ((_a = this.nodes[nodeId]) === null || _a === void 0 ? void 0 : _a.getVariable(variableId)) || null;
    }
    getConnectedVariable(nodeVarId) {
        for (const connection of this.nodeConnections) {
            if (connection[0] == nodeVarId)
                return connection[1];
            if (connection[1] == nodeVarId)
                return connection[0];
        }
    }
    //===== Drawing =====//
    resizeEditor() {
        this.c.width = window.innerWidth;
        this.c.height = window.innerHeight;
        this.redrawConnestions();
    }
    drawConnection(p1x, p1y, p2x, p2y, colour = "#fff") {
        let pB1x = (p1x + p2x) / 2;
        let pB2x = (p1x + p2x) / 2;
        let yDiff = Math.abs(p1y - p2y);
        if (yDiff > 72)
            yDiff = 72;
        if (pB1x > p1x - yDiff)
            pB1x = p1x - yDiff;
        if (pB2x < p2x + yDiff)
            pB2x = p2x + yDiff;
        this.ctx.setTransform(1, 0, 0, 1, this.posX, this.posY);
        this.ctx.strokeStyle = colour;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(p1x, p1y);
        this.ctx.bezierCurveTo(pB1x, p1y, pB2x, p2y, p2x, p2y);
        // this.ctx.lineTo(p2x, p2y);
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
        this.ctx.bezierCurveTo(pB1x, p1y, pB2x, p2y, p2x, p2y);
        // this.ctx.lineTo(p2x, p2y);
        this.ctx.stroke();
        this.ctx.fillStyle = colour + "2";
        this.ctx.beginPath();
        this.ctx.arc(p1x, p1y, 6, 0, Math.PI * 2);
        this.ctx.arc(p2x, p2y, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    redrawConnestions() {
        var _a, _b;
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.c.width, this.c.height);
        for (const connection of this.nodeConnections) {
            const [nodeIdOutput, variableIdOutput] = connection[0].split("?");
            const [nodeIdInput, variableIdInput] = connection[1].split("?");
            const posInput = this.nodes[nodeIdInput].getHandlePosition(variableIdInput);
            const posOutput = this.nodes[nodeIdOutput].getHandlePosition(variableIdOutput);
            const variableType = (_a = this.getVariable(connection[0])) === null || _a === void 0 ? void 0 : _a.type;
            this.drawConnection(posInput.x, posInput.y, posOutput.x, posOutput.y, ((_b = this.avaliableVariableTypes[variableType]) === null || _b === void 0 ? void 0 : _b.color) || "#fff");
        }
    }
    // ===== Canvas movement ===== //
    moveTo(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        this.nodeContainer.style.top = posY + "px";
        this.nodeContainer.style.left = posX + "px";
        this.element.style.setProperty('--background-position', `${posX}px ${posY}px`);
    }
    dragStart(e) {
        e.stopPropagation();
        let startPosX = this.posX;
        let startPosY = this.posY;
        let dragPosX = e.clientX;
        let dragPosY = e.clientY;
        const moveEvent = (e) => {
            this.moveTo(startPosX + e.clientX - dragPosX, startPosY + e.clientY - dragPosY);
            this.redrawConnestions();
        };
        const mouseupEvent = (e) => {
            moveEvent(e);
            window.removeEventListener("mousemove", moveEvent);
            window.removeEventListener("mouseup", mouseupEvent);
        };
        window.addEventListener("mousemove", moveEvent);
        window.addEventListener("mouseup", mouseupEvent);
    }
    // ===== Data Import/Export ===== //
    toJSON() {
        const nodes = {};
        for (const node in this.nodes) {
            nodes[node] =
                {
                    type: this.nodes[node].type,
                    posX: this.nodes[node].posX,
                    posY: this.nodes[node].posY
                };
        }
        return JSON.stringify({
            nodes: nodes,
            connections: this.nodeConnections
        });
    }
    loadJSON(json, updateHistory = true) {
        this.nodes = {};
        this.nodeConnections = [];
        this.nodeContainer.innerHTML = "";
        this.ctx.clearRect(0, 0, this.c.width, this.c.height);
        const data = JSON.parse(json);
        for (const nodeId in data.nodes) {
            const node = data.nodes[nodeId];
            this.addNode(node.type, nodeId, node.posX, node.posY);
        }
        for (const connection of data.connections) {
            this.addConnection(connection[0], connection[1]);
        }
        this.redrawConnestions();
        if (updateHistory)
            this.historyPush();
    }
    async openFile(filePath) {
        this.filePath = filePath;
        const resp = await fetch(`/api/files/${filePath}`);
        if (resp.status != 200)
            return false;
        this.history = [];
        this.undoHistory = [];
        this.loadJSON(await resp.text());
    }
    async saveFile() {
        const resp = await fetch(`/api/files/${this.filePath}`, {
            method: 'PUT',
            body: this.history[this.history.length - 1]
        });
        if (resp.status != 200)
            return false;
    }
    historyPush() {
        const status = this.toJSON();
        if (status == this.history[this.history.length - 1])
            return;
        this.history.push(status);
        if (this.history.length > 100)
            this.history.shift();
        this.undoHistory = [];
        this.saveFile();
    }
    historyUndo() {
        if (this.history.length < 2)
            return;
        const undoStatus = this.history.pop();
        const status = this.history[this.history.length - 1];
        this.loadJSON(status, false);
        this.undoHistory.push(undoStatus);
        this.saveFile();
    }
    historyRedo() {
        if (this.undoHistory.length < 1)
            return;
        const status = this.undoHistory.pop();
        this.loadJSON(status, false);
        this.history.push(status);
        this.saveFile();
    }
}
//# sourceMappingURL=NodeEditor.js.map