import express from "express";
import cors from "cors";
import { logger } from "./logging";
import { api_doc_app } from "./api_docs";
import { corona_app } from "./rest/corona";
import * as corona_db from "./database_corona";
import * as chef_db from "./database_chef";
import { chef_app } from "./rest/chef";

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

app.use("/api-docs", api_doc_app);
app.use("/corona", corona_app);
app.use("/chef", chef_app);

export const createServer = (port1: number) => {
    app.listen(port1, function () {
        logger.info("=== rest server on port " + port1);
        corona_db.init_db();
        chef_db.init_db();
    });
};

/**
 * @swagger
 * tags:
 *   - name: Corona
 *     description: 코로나
 *   - name: Chef
 *     description: 요리
 */
