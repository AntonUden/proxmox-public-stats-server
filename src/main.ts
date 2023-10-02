import ProxmoxSettings from "./ProxmoxSettings";
import ProxmoxStatsServer from "./ProxmoxStatsServer";

require('console-stamp')(console, '[HH:MM:ss.l]');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const port: number = parseInt(process.env.PORT) || 8080;
const apiKey: string = process.env.API_KEY;
const tokenID: string = process.env.TOKEN_ID;
const proxmoxHost: string = process.env.PROXMOX_HOST;

if (apiKey == null || apiKey.trim().length == 0) {
	console.error("No API key provided");
	process.exit(0);
}

if (tokenID == null || tokenID.trim().length == 0) {
	console.error("No tokenID provided");
	process.exit(0);
}

if (proxmoxHost == null || proxmoxHost.trim().length == 0) {
	console.error("No proxmox host provided");
	process.exit(0);
}

console.log(tokenID);

const proxmoxSettings: ProxmoxSettings = {
	host: proxmoxHost.endsWith("/") ? proxmoxHost : proxmoxHost + "/",
	apiKey: apiKey,
	tokenId: tokenID
}

console.log("Proxmox settings: host: " + proxmoxSettings.host + ". TokenID: " + proxmoxSettings.tokenId);

new ProxmoxStatsServer(port, proxmoxSettings);