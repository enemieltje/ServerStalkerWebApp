import
{
	Server,
	serve,
	ServerRequest,
	setCookie,
	Cookie,
	readAll
} from "../deps.ts";

// import Router from "./router.ts";

type ServerStalkPost = {
	period: number

} & Record<string, unknown>

export default class HttpServer
{
	private server?: Server;
	private timeStamp = 0;
	private currentDataObject: ServerStalkPost = {period: 30000, online: false}
	// private idCounter = 0;
	// private idMap = new Map<number, Date>();
	// private Router = new Router;
	decoder = new TextDecoder();

	constructor ()
	{
	}


	async start (port = 8080)
	{
		// this.Router.setRoutes('./src/client', 0);
		this.server = serve(`:${port}`);
		console.log(`HTTP webserver running. Access it at:  http://localhost:${port}/`);


		for await (const req of this.server)
		{
			console.group(`Request: ${req.method} ${req.url}`);

			this.httpRequest(req);

			console.groupEnd();
		}
	}

	private httpRequest (req: ServerRequest)
	{

		switch (req.method)
		{
			case ("GET"):
				this.httpGetRequest(req);

				break;
			case ("POST"):
				this.httpPostRequest(req);

				break;
			default:
				req.respond({status: 418, body: "invalid req"});
		}
	}
	private httpGetRequest (req: ServerRequest)
	{
		this.checkStatus();
		req.respond({ status: 200, body: JSON.stringify(this.currentDataObject) });
	}

	private async httpPostRequest (req: ServerRequest)
	{
		const buf: Uint8Array = await readAll(req.body);
		const body = this.decoder.decode(buf);
		this.currentDataObject = JSON.parse(body);
		req.respond({ status: 200 });

		this.checkStatus();
		this.timeStamp = Date.now();
	}

	private checkStatus() {
		const time = Date.now();
		console.debug(`Difference: ${time - this.timeStamp}\nDouble Period: ${2 * this.currentDataObject.period}`)
		if (time - this.timeStamp < 2 * this.currentDataObject.period)
		{
			delete this.currentDataObject.stopTime;
			this.currentDataObject.online = true;
		}
		else
		{
			if (this.currentDataObject.online)
			{
				this.currentDataObject.stopTime = time;
				this.currentDataObject.onlineTime = time - (this.currentDataObject.startTime as number);
				this.currentDataObject.online = false;
			}
		}
	}

}
