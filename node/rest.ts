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
app.use(express.json());
app.use(express.urlencoded( {extended : false } )); 

export const createServer = (port1: number) =>{
	app.listen(port1, function () {
		console.log('=== rest server on port ' + port1)
	});
}