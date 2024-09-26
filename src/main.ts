import * as MyApp from "./index";
import "reflect-metadata";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const port = 8080;

const server = app.listen(port, () => {
	MyApp.Logger.getInstance().log(
		`Server is listening on http://localhost:${port}`,
	);
});

const wss = new WebSocketServer({ server });
