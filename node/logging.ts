import express from "express"
import cors from "cors"
import * as fs from "fs"
import * as process from "process"

import * as winston from "winston"
import winstonDaily from "winston-daily-rotate-file"

class App {
    public application: express.Application;

    constructor(){
        this.application = express()
    }
}

const app = new App().application;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded( {extended : false } )); 

const logDir = process.env.HOME + '/Documents/contents_log'; // logs 디렉토리 하위에 로그 파일 저장
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir,{ recursive: true });
}

const {
	combine,
	timestamp,
	printf
} = winston.format;

// Define log format
const logFormat = printf(info => {
	return `${info.timestamp} ${info.level}: ${info.message}`;
});

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
	format: combine(
		timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		logFormat
	),
	transports: [
		// error 레벨 로그를 저장할 파일 설정
		new winstonDaily({
			level: 'error',
			datePattern: 'YYYY-MM-DD',
			dirname: logDir + '/error', // error.log 파일은 /logs/error 하위에 저장 
			filename: `%DATE%.error.log`,
			maxFiles: 90,
			zippedArchive: true,
		}),
		// warning 레벨 로그를 저장할 파일 설정
		new winstonDaily({
			level: 'warn',
			datePattern: 'YYYY-MM-DD',
			dirname: logDir,
			filename: `%DATE%.log`,
			maxFiles: 90, // 90일치 로그 파일 저장
			zippedArchive: true,
		}),
		// info 레벨 로그를 저장할 파일 설정
		new winstonDaily({
			level: 'info',
			datePattern: 'YYYY-MM-DD',
			dirname: logDir,
			filename: `%DATE%.log`,
			maxFiles: 90, // 90일치 로그 파일 저장
			zippedArchive: true,
		}),
	]
});

logger.add(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(), // 색깔 넣어서 출력
        winston.format.simple(), // `${info.level}: ${info.message} JSON.stringify({ ...rest })` 포맷으로 출력
    )
}));

const getText = (req: express.Request):string => {
	let txt: string = ""
    req.body.forEach((ele:any) => {
		if(typeof ele != 'string')

			ele = JSON.stringify(ele)
		txt += ele + " "
	});

    return txt
}

app.post('/error', function (req: express.Request, res: express.Response) {
	let txt: string = getText(req)

	logger.error(txt)
	res.send({
		ok:"ok"
	})
})

app.post('/warn', function (req: express.Request, res: express.Response) {
	let txt: string = getText(req)

	logger.warn(txt)
	res.send({
		ok:"ok"
	})
})

app.post('/*', function (req: express.Request, res: express.Response) {
	let txt: string = getText(req)

	logger.info(txt)
	res.send({
		ok:"ok"
	})
})

export const createServer = (port1: number) =>{
	app.listen(port1, function () {
        logger.info('=== logging server on port ' + port1)
	});
}