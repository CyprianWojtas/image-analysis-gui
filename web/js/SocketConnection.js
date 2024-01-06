import { io } from "./lib/socket.io.esm.min.js";
export class AnalysisNodeProcessingEvent extends Event {
    constructor(nodeId) {
        super("analysis_node_processing");
        this.nodeId = nodeId;
    }
}
export class AnalysisNodeProcessedEvent extends Event {
    constructor(nodeId, data) {
        super("analysis_node_processed");
        this.nodeId = nodeId;
        this.data = data;
    }
}
export class AnalysisUpdatedEvent extends Event {
    constructor(analysisId) {
        super("analysis_updated");
        this.analysisId = analysisId;
    }
}
export class AnalysisStatusEvent extends Event {
    constructor(data) {
        super("analysis_status");
        this.analysisId = data.analysisId;
        this.active = data.active;
        this.paused = data.paused;
        this.solvedNodes = data.solvedNodes || [];
        this.errors = data.errors;
    }
}
export class AnalysisNodeErrorEvent extends Event {
    constructor(nodeId, error) {
        super("analysis_node_error");
        this.nodeId = nodeId;
        this.error = error;
    }
}
export class AnalysisNodeDataEvent extends Event {
    constructor(nodeId, data) {
        super("analysis_node_data");
        this.nodeId = nodeId;
        this.data = data;
    }
}
export default class SocketConnection extends EventTarget {
    static init() {
        this.eventManager = new EventTarget();
        this.socket = io();
        this.socket.on("analysis_node_processing", data => {
            this.dispatchEvent(new AnalysisNodeProcessingEvent(data.nodeId));
        });
        this.socket.on("analysis_node_processed", data => {
            this.dispatchEvent(new AnalysisNodeProcessedEvent(data.nodeId, data.data));
        });
        this.socket.on("analysis_node_error", data => {
            this.dispatchEvent(new AnalysisNodeErrorEvent(data.nodeId, data.error));
        });
        this.socket.on("analysis_status", data => {
            this.dispatchEvent(new AnalysisStatusEvent(data));
        });
        this.socket.on("analysis_updated", data => {
            this.dispatchEvent(new AnalysisUpdatedEvent(data.analysisId));
        });
        this.socket.on("analysis_node_data", data => {
            this.dispatchEvent(new AnalysisNodeDataEvent(data.nodeId, data.data));
        });
    }
    static addEventListener(event, callback) {
        this.eventManager.addEventListener(event, callback);
    }
    static removeEventListener(event) {
        this.eventManager.removeEventListener(event);
    }
    static dispatchEvent(event) {
        this.eventManager.dispatchEvent(event);
    }
    static runAnalysis(analysisId) {
        console.log("Running analysis...");
        this.socket.emit("analysis_run", { analysisId: analysisId });
    }
    static stopAnalysis(analysisId) {
        this.socket.emit("analysis_stop", { analysisId: analysisId });
    }
    static setAnalysisPause(analysisId, paused) {
        this.socket.emit("analysis_set_paused", { analysisId: analysisId, paused: paused });
    }
    static getAnalysisStatus(analysisId) {
        this.socket.emit("analysis_status", { analysisId: analysisId });
    }
    static getAnalysisData(analysisId) {
        this.socket.emit("analysis_get_node_data", { analysisId: analysisId });
    }
    static updateAnalysis(analysisId, data, nodesToReset) {
        this.socket.emit("analysis_update", {
            analysisId: analysisId,
            data: data,
            nodes: nodesToReset
        });
    }
}
//# sourceMappingURL=SocketConnection.js.map