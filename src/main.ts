import * as MyApp from "./index";
import "reflect-metadata";
import express from "express";
import { container } from "tsyringe";
import * as Utils from "./utils/functions";

const app = express();
const port = 8080;

app.listen(port, () => {
	MyApp.Logger.getInstance().log(
		`Server is listening on http://localhost:${port}`,
	);
});

container.registerInstance("Server", app); //TODO: fix injection

const files = new MyApp.FileWorkerManagerPool();
const servicesInfo = await Utils.initializeServices(files);
