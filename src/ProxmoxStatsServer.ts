import express, { Express, Request, Response } from 'express';
import * as HTTP from 'http';
import * as Cors from "cors";
import ProxmoxSettings from './ProxmoxSettings';
import axios from 'axios';

export default class ProxmoxStatsServer {
	private express: Express;
	private http: HTTP.Server;

	constructor(port: number, proxmoxSettings: ProxmoxSettings) {

		this.express = express();
		this.express.set("port", port);
		this.http = new HTTP.Server(this.express);

		this.express.use(Cors.default());

		this.express.get("/", async (req: Request, res: Response) => {
			try {
				let nodes: any[] = [];

				let totalDiskMax: number = 0;
				let totalDiskCurrent: number = 0;

				let totalMemMax: number = 0;
				let totalMemCurrent: number = 0;

				let totalCpu: number = 0.0;

				let onlineNodes = 0;

				console.log("Fetching " + proxmoxSettings.host + "api2/json/cluster/resources");
				const status = await axios.get(proxmoxSettings.host + "api2/json/cluster/resources", {
					headers: {
						Authorization: `PVEAPIToken=${proxmoxSettings.tokenId}=${proxmoxSettings.apiKey}`,
					}
				});

				status.data.data.forEach((obj: any) => {
					console.log(obj);
					if (obj.type == "storage") {
						totalDiskMax += obj.maxdisk;
						totalDiskCurrent += obj.disk == null ? 0 : obj.disk;
					} else if (obj.type == "node") {
						totalMemMax += obj.maxmem;
						totalMemCurrent += obj.mem == null ? 0 : obj.mem;

						totalCpu += obj.cpu == null ? 0 : obj.cpu;

						const nodeData = {
							name: obj.node,
							memory: {
								current: obj.mem,
								max: obj.maxmem,
							},
							disk: {
								current: obj.disk,
								max: obj.maxdisk,
							},
							cpu: {
								cores: obj.cores,
								usage: obj.cpu
							},
							online: obj.status == "online"
						};

						if (obj.status == "online") {
							onlineNodes++;
						}

						nodes.push(nodeData);
					}
				});

				let avgCpu = 0.0;
				if (onlineNodes > 0) {
					avgCpu = totalCpu / nodes.length;
				}

				res.json({
					total: {
						memory: {
							current: totalMemCurrent,
							max: totalMemMax
						},
						disk: {
							current: totalDiskCurrent,
							max: totalDiskMax
						},
						total_cpu_load: totalCpu
					},
					avarage_cpu_load: avgCpu,
					nodes: nodes
				});
			} catch (err) {
				console.warn("Failed to process request");
				console.error(err);
				res.status(503).send("An error occured while trying to fetch stats");
			}
		});

		this.http.listen(port, (): void => {
			console.log("Listening on port " + port);
		});
	}
}