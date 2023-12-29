import { io } from "./lib/socket.io.esm.min.js";

export class AnalysisNodeProcessingEvent extends Event
{
	nodeId: string;

	constructor(nodeId: string)
	{
		super("analysis_node_processing");
		this.nodeId = nodeId;
	}
}

export class AnalysisNodeProcessedEvent extends Event
{
	nodeId: string;
	data: any;

	constructor(nodeId: string, data: any)
	{
		super("analysis_node_processed");
		this.nodeId = nodeId;
		this.data = data;
	}
}

export class AnalysisUpdatedEvent extends Event
{
	analysisId: string;

	constructor(analysisId: string)
	{
		super("analysis_updated");
		this.analysisId = analysisId;
	}
}

export class AnalysisStatusEvent extends Event
{
	analysisId: string;
	active: boolean;
	paused: boolean;
	solvedNodes: string[];
	errors: { [nodeId: string]: string };

	constructor(data: any)
	{
		super("analysis_status");
		this.analysisId  = data.analysisId;
		this.active      = data.active;
		this.paused      = data.paused;
		this.solvedNodes = data.solvedNodes || [];
		this.errors      = data.errors;
	}
}

export class AnalysisNodeErrorEvent extends Event
{
	nodeId: string;
	error: string;

	constructor(nodeId: string, error: string)
	{
		super("analysis_node_error");
		this.nodeId = nodeId;
		this.error = error;
	}
}

export class AnalysisNodeDataEvent extends Event
{
	nodeId: string;
	data: any;

	constructor(nodeId: string, data: any)
	{
		super("analysis_node_data");
		this.nodeId = nodeId;
		this.data = data;
	}
}

export default
class SocketConnection extends EventTarget
{
	private static socket;
	private static eventManager;

	static init()
	{
		this.eventManager = new EventTarget();
		this.socket = io();

		// this.socket.on("connect", () =>
		// {
		// 	this.dispatchEvent(new Event("connected"));
		// });

		this.socket.on("analysis_node_processing", data =>
		{
			this.dispatchEvent(new AnalysisNodeProcessingEvent(data.nodeId));
		});

		this.socket.on("analysis_node_processed", data =>
		{
			this.dispatchEvent(new AnalysisNodeProcessedEvent(data.nodeId, data.data));
		});

		this.socket.on("analysis_node_error", data =>
		{
			this.dispatchEvent(new AnalysisNodeErrorEvent(data.nodeId, data.error));
		});

		this.socket.on("analysis_status", data =>
		{
			this.dispatchEvent(new AnalysisStatusEvent(data));
		});

		this.socket.on("analysis_updated", data =>
		{
			this.dispatchEvent(new AnalysisUpdatedEvent(data.analysisId));
		});

		this.socket.on("analysis_node_data", data =>
		{
			this.dispatchEvent(new AnalysisNodeDataEvent(data.nodeId, data.data));
		});
	}


	static addEventListener(event, callback)
	{
		this.eventManager.addEventListener(event, callback);
	}

	static removeEventListener(event)
	{
		this.eventManager.removeEventListener(event);
	}

	private static dispatchEvent(event)
	{
		this.eventManager.dispatchEvent(event);
	}

	static runAnalysis(analysisId: string)
	{
		this.socket.emit("analysis_run", { analysisId: analysisId });
	}

	static stopAnalysis(analysisId: string)
	{
		this.socket.emit("analysis_stop", { analysisId: analysisId });
	}

	static setAnalysisPause(analysisId: string, paused: boolean)
	{
		this.socket.emit("analysis_set_paused", { analysisId: analysisId, paused: paused });
	}

	static getAnalysisStatus(analysisId: string)
	{
		this.socket.emit("analysis_status", { analysisId: analysisId });
	}

	static getAnalysisData(analysisId: string)
	{
		this.socket.emit("analysis_get_node_data", { analysisId: analysisId });
	}

	static updateAnalysis(analysisId: string, data: string, nodesToReset: string[])
	{
		this.socket.emit(
			"analysis_update",
			{
				analysisId: analysisId,
				data: data,
				nodes: nodesToReset
			}
		);
	}
}
