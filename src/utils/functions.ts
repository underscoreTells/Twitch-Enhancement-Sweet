import { ServiceInfo } from "../app/auth-service-interface";
import { FileIO } from "../app/file-io";
import type { FileWorkerManagerPool } from "../app/file-worker-manager-pool";
import { SERVICESPATH } from "./constants";
import * as constants from "./constants";

class FileData extends FileIO {}

async function getServicesInfoFromFile(
	files: FileWorkerManagerPool,
): Promise<ServiceInfo[]> {
	const fileData = new FileData();
	let services: ServiceInfo[] = [];
	const file = await files.requestWorker();

	if (file !== undefined) {
		await file.read(SERVICESPATH, fileData, "JSON");
		services = fileData.getData();
	}

	files.releaseWorker(file);
	return services;
}

export async function initializeServices(
	files: FileWorkerManagerPool,
): Promise<Map<string, ServiceInfo>> {
	const services: Map<string, ServiceInfo> = new Map();
	for (const service of InitServices) {
		const serviceInfo = service();
		services.set(serviceInfo.serviceName, serviceInfo);
	}

	const servicesFromFile = await getServicesInfoFromFile(files);

	for (let i = 0; i < servicesFromFile.length; i++) {
		const service = services.get(servicesFromFile[i].serviceName);

		if (service !== undefined && Object.keys(servicesFromFile[i]).length > 0) {
			service.refreshToken = servicesFromFile[i].refreshToken;

			service.tokenExpiresIn = servicesFromFile[i].tokenExpiresIn;
		}
	}

	return services;
}

export async function servicesToFile(
	services: Map<string, ServiceInfo>,
	files: FileWorkerManagerPool,
) {
	const file = await files.requestWorker();

	await file.write(SERVICESPATH, "JSON", services);
}

const InitServices = [
	() => {
		return InitializeNightbot();
	},
	() => {
		return InitializeTwitch();
	},
	() => {
		return InitializeStreamlabs();
	},
];

function InitializeNightbot(): ServiceInfo {
	const service = new ServiceInfo();

	service.serviceName = "Nightbot";
	service.clientId = constants.NIGHTBOTCLIENTID;
	service.clientSecret = constants.NIGHTBOTCLIENTSECRET;
	service.redirectUri = constants.NIGHTBOTREDIRECTURI;
	service.tokenUrl = constants.NIGHTBOTTOKENURL;
	service.authorizeUrl = constants.NIGHTBOTAUTHORIZEURL;

	return service;
}

function InitializeTwitch(): ServiceInfo {
	const service = new ServiceInfo();

	service.serviceName = "Twitch";
	service.clientId = constants.TWITCHCLIENTID;
	service.clientSecret = constants.TWITCHCLIENTSECRET;
	service.redirectUri = constants.TWITCHREDIRECTURI;
	service.tokenUrl = constants.TWITCHTOKENURL;
	service.authorizeUrl = constants.TWITCHAUTHORIZEURL;

	return service;
}

function InitializeStreamlabs(): ServiceInfo {
	const service = new ServiceInfo();

	service.serviceName = "Streamlabs";
	service.clientId = constants.STREAMLABSCLIENTID;
	service.clientSecret = constants.STREAMLABSCLIENTSECRET;
	service.redirectUri = constants.STREAMLABSREDIRECTURI;
	service.tokenUrl = constants.STREAMLABSTOKENURL;
	service.authorizeUrl = constants.STREAMLABSAUTHORIZEURL;

	return service;
}
