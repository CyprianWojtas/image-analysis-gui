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
export class AnalysisNodeErrorEvent extends Event {
    constructor(nodeId, error) {
        super("analysis_node_error");
        this.nodeId = nodeId;
        this.error = error;
    }
}
export default class SocketConnection extends EventTarget {
    static init() {
        this.eventManager = new EventTarget();
        this.socket = io();
        this.socket.on("connect", () => {
            this.dispatchEvent(new Event("connected"));
        });
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
            console.log("analysis_status", data);
        });
        this.socket.on("analysis_updated", data => {
            console.log("analysis_updated", data.analysisId);
            this.socket.emit("analysis_run", { analysisId: data.analysisId });
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
        this.socket.emit("analysis_run", { analysisId: analysisId });
    }
    static getAnalysisStatus(analysisId) {
        this.socket.emit("analysis_status", { analysisId: analysisId });
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