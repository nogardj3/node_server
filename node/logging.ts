import express from "express"
import cors from "cors"

class App {
    public application: express.Application;

    constructor(){
        this.application = express()
    }
}

const app = new App().application;
app.use(cors());
app.use(express.json()); //json 형태로 parsing
app.use(express.urlencoded( {extended : false } )); 

var _port : number;

export const createServer = (port1: number) =>{
	_port = port1

	app.listen(port1, function () {
		console.log('=== logging server on port ' + port1)
	});
}


// "use strict";
// const path = require('path');
// const appRoot = path.join(__dirname, "./../")
// const winston = require('winston'); // winston lib
// const winstonDaily = require('winston-daily-rotate-file'); // winston lib
// const process = require('process');
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const app = express()
// const fs = require('fs');

// const logDir = process.env.HOME + '/contents_log'; // logs 디렉토리 하위에 로그 파일 저장

// if (!fs.existsSync(logDir)) {
//     fs.mkdirSync(logDir);
// }


// // CORS 설정
// app.use(cors());
// app.use(bodyParser.urlencoded({
// 	limit: "10mb",
// 	parameterLimit: 1000000,
// 	extended: true
// }));
// app.use(bodyParser.json({
// 	limit: "10mb",
// 	parameterLimit: 1000000,
// 	extended: true
// }));

// const {
// 	combine,
// 	timestamp,
// 	printf
// } = winston.format;

// // Define log format
// const logFormat = printf(info => {
// 	return `${info.timestamp} ${info.level}: ${info.message}`;
// });

// /*
//  * Log Level
//  * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
//  */
// const logger = winston.createLogger({
// 	format: combine(
// 		timestamp({
// 			format: 'YYYY-MM-DD HH:mm:ss',
// 		}),
// 		logFormat
// 	),
// 	transports: [
// 		// error 레벨 로그를 저장할 파일 설정
// 		new winstonDaily({
// 			level: 'error',
// 			datePattern: 'YYYY-MM-DD',
// 			dirname: logDir + '/error', // error.log 파일은 /logs/error 하위에 저장 
// 			filename: `%DATE%.error.log`,
// 			maxFiles: 90,
// 			zippedArchive: true,
// 		}),
// 		// warning 레벨 로그를 저장할 파일 설정
// 		new winstonDaily({
// 			level: 'warn',
// 			datePattern: 'YYYY-MM-DD',
// 			dirname: logDir,
// 			filename: `%DATE%.log`,
// 			maxFiles: 90, // 90일치 로그 파일 저장
// 			zippedArchive: true,
// 		}),
// 		// info 레벨 로그를 저장할 파일 설정
// 		new winstonDaily({
// 			level: 'info',
// 			datePattern: 'YYYY-MM-DD',
// 			dirname: logDir,
// 			filename: `%DATE%.log`,
// 			maxFiles: 90, // 90일치 로그 파일 저장
// 			zippedArchive: true,
// 		}),
// 	]
// });

// // Production 환경이 아닌 경우(dev 등) 
// if (process.env.NODE_ENV !== 'production') {
// 	logger.add(new winston.transports.Console({
// 		format: winston.format.combine(
// 			winston.format.colorize(), // 색깔 넣어서 출력
// 			winston.format.simple(), // `${info.level}: ${info.message} JSON.stringify({ ...rest })` 포맷으로 출력
// 		)
// 	}));
// }


// function createServer(port1) {
// 	app.listen(port1, logger.info('Listenening on port ' + port1));
// }

// app.post('/error', function (req, res) {
// 	let indexer = req.body[req.body.length - 1]
// 	let txt = indexer.substring(2,indexer.lastIndexOf(':')).padEnd(20,' ')  + " |  "
// 	req.body.splice(-1,1)
// 	req.body.forEach(ele => {
// 		if(typeof ele != 'string')
// 			ele = JSON.stringify(ele)
// 		txt += ele + " "
// 	});

// 	logger.error(txt)
// 	res.send({
// 		ok:"ok"
// 	})
// })

// app.post('/warn', function (req, res) {
// 	let indexer = req.body[req.body.length - 1]
// 	let txt = indexer.substring(2,indexer.lastIndexOf(':')).padEnd(20,' ')  + " |  "
// 	req.body.splice(-1,1)
// 	req.body.forEach(ele => {
// 		if(typeof ele != 'string')
// 			ele = JSON.stringify(ele)
// 		txt += ele + " "
// 	});

// 	logger.warn(txt)
// 	res.send({
// 		ok:"ok"
// 	})
// })

// app.post('/*', function (req, res) {
// 	// let indexer = req.body[req.body.length - 1]
// 	// let txt = indexer.substring(2,indexer.lastIndexOf(':')).padEnd(20,' ')  + " |  "
// 	// req.body.splice(-1,1)
// 	let txt = ""
// 	req.body.forEach(ele => {
// 		if(typeof ele != 'string')
// 			ele = JSON.stringify(ele)
// 		txt += ele + " "
// 	});

// 	logger.info(txt)
// 	res.send({
// 		ok:"ok"
// 	})
// })


// module.exports = {
// 	createServer: createServer
// };

