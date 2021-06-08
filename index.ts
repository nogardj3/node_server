import express from "express"
// import api_docs from "./node/api_docs"
// import logging from "./node/logging"
// import rest from "./node/rest"
// import util from "./node/util"
import cors from "cors"
import bodyParser from "body-parser"

class App {
    public application: express.Application;

    constructor(){
        this.application = express()
    }
}

const app = new App().application;

app.get('/*', (req: express.Request, res: express.Response) => {
    console.log('hello')
    res.send('hello world')
})

app.listen(3000, () => {
    console.log('listening port at 3000')
})