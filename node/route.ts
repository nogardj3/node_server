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
		console.log('=== routing server on port ' + port1)
	});
}