import * as api_docs from "./node/api_docs"
import * as rest from "./node/rest"
import * as logging from "./node/logging"
import * as route from "./node/route"
import * as util from "./node/util"

process.on('SIGINT', function () {
	console.log("============SIGINT===============");
	process.exit();
});
process.on('uncaughtException', function (err) {
	console.error("Node NOT Exiting... uncaughtException");
	console.error(err);
});
process.on('error', function (err) {
	console.error("Node NOT Exiting... error");
	console.error(err);
});

//TODO async로
async function init(){
    await route.createServer(util.PREFERENCES.PORT_ROUTE)
    await rest.createServer(util.PREFERENCES.PORT_REST)
    await logging.createServer(util.PREFERENCES.PORT_LOGGING)
    await api_docs.createServer(util.PREFERENCES.PORT_API_DOCS)
}

init()