import express from "express";
import cors from "cors";
import { logger } from "./logging";

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

export const createServer = (port1: number) => {
    app.listen(port1, function () {
        logger.info("=== routing server on port " + port1);
    });
};
