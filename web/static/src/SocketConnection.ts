import { io } from "./lib/socket.io.esm.min.js";

export
class AnalysisNodeProcessingEvent extends Event
{
	nodeId: string;

	constructor(nodeId: string)
	{
		super("analysis_node_processing");
		this.nodeId = nodeId;
	}
}

export
class AnalysisNodeProcessedEvent extends Event
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

export default
class SocketConnection extends EventTarget
{
	private static socket;
	private static eventManager;

	static init()
	{
		this.eventManager = new EventTarget();
		this.socket = io();

		this.socket.on("connect", () =>
		{
			this.dispatchEvent(new Event("connected"));
		});

		this.socket.on("analysis_node_processing", data =>
		{
			// console.log("analysis_node_processing", data);
			this.dispatchEvent(new AnalysisNodeProcessingEvent(data.nodeId));
		});

		this.socket.on("analysis_node_processed", data =>
		{
			// console.log("analysis_node_processed", data);
			this.dispatchEvent(new AnalysisNodeProcessedEvent(data.nodeId, data.data));
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

	static runAnalysis(analysisId)
	{
		this.socket.emit('run_analysis', { analysisId: analysisId });
	}
}