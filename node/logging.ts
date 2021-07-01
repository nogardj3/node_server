import express from "express";
import cors from "cors";
import * as fs from "fs";
import * as process from "process";
import * as winston from "winston";
import winstonDaily from "winston-daily-rotate-file";

class App {
    public application: express.Application;

    constructor() {
        this.application = express();
    }
}

const app = new App().application;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const logDir = process.env.HOME + "/Documents/contents_log";
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf } = winston.format;

const logFormat = printf((info) => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
export const logger = winston.createLogger({
    format: combine(
        timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        logFormat
    ),
    transports: [
        new winstonDaily({
            level: "error",
            datePattern: "YYYY-MM-DD",
            dirname: logDir + "/error",
            filename: `%DATE%.error.log`,
            maxFiles: 90,
            zippedArchive: true,
        }),
        new winstonDaily({
            level: "warn",
            datePattern: "YYYY-MM-DD",
            dirname: logDir,
            filename: `%DATE%.log`,
            maxFiles: 90,
            zippedArchive: true,
        }),
        new winstonDaily({
            level: "info",
            datePattern: "YYYY-MM-DD",
            dirname: logDir,
            filename: `%DATE%.log`,
            maxFiles: 90,
            zippedArchive: true,
        }),
    ],
});

logger.add(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple() 
        ),
    })
);

app.post("/error", function (req: express.Request, res: express.Response) {
    logger.error(req.body.who, req.body.data);
    res.send({
        ok: "ok",
    });
});

app.post("/warn", function (req: express.Request, res: express.Response) {
    logger.warn(req.body.who, req.body.data);
    res.send({
        ok: "ok",
    });
});

app.post("/*", function (req: express.Request, res: express.Response) {
    logger.info(req.body.who, req.body.data);
    res.send({
        ok: "ok",
    });
});

export const createServer = (port1: number) => {
    app.listen(port1, function () {
        logger.info("=== logging server on port " + port1);
    });
};
