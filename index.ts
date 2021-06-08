import express from "express"
import * as api_docs from "./node/api_docs"
import * as rest from "./node/rest"
import * as logging from "./node/logging"
import * as route from "./node/route"
import * as util from "./node/util"
import * as fs from "fs"
import * as yaml from "yaml"
import cors from "cors"
import bodyParser from "body-parser"

process.on('SIGINT', function () {
	console.log("============SIGINT===============");
	process.exit();
});
process.on('uncaughtException', function (err) {
	console.log("Node NOT Exiting... uncaughtException");
	console.error("Node NOT Exiting... uncaughtException");
	console.error(err);
});
process.on('error', function (err) {
	console.log("Node NOT Exiting... error");
	console.error("Node NOT Exiting... error");
	console.error(err);
});

class App {
    public application: express.Application;

    constructor(){
        this.application = express()
    }
}

const app = new App().application;
let PREFERENCES;

async function init(){
    PREFERENCES = yaml.parse(fs.readFileSync('./preferences.yaml', "utf8"));

    await route.createServer(PREFERENCES.PORT_ROUTE)
    await rest.createServer(PREFERENCES.PORT_REST)
    await logging.createServer(PREFERENCES.PORT_LOGGING)
    await api_docs.createServer(PREFERENCES.PORT_API_DOCS)
    await util.print('helllllllllo')
}

init()