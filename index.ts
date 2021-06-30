import * as rest from "./node/rest";
import * as logging from "./node/logging";
import * as route from "./node/route";
import * as util from "./node/util";

process.on("SIGINT", function () {
    console.log("============SIGINT===============");
    process.exit();
});
process.on("uncaughtException", function (err) {
    console.error("Node NOT Exiting... uncaughtException");
    console.error(err);
});
process.on("error", function (err) {
    console.error("Node NOT Exiting... error");
    console.error(err);
});

function init() {
    route.createServer(util.PREFERENCES.PORT_ROUTE);
    rest.createServer(util.PREFERENCES.PORT_REST);
    logging.createServer(util.PREFERENCES.PORT_LOGGING);
}

init();
