import express from "express";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { PREFERENCES } from "./util";

class App {
    public application: express.Application;

    constructor() {
        this.application = express();
    }
}

export const api_doc_app = new App().application;
api_doc_app.use(cors());
const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Server Swagger Api-doc ",
            version: "0.1.0",
            description:
                "This is a simple CRUD API application made with Express and documented with Swagger",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
            contact: {
                name: "LogRocket",
                url: "https://logrocket.com",
                email: "info@email.com",
            },
        },
        servers: [
            {
                url: "http://localhost:" + PREFERENCES.PORT_REST,
                description: "rest",
            },
        ],
    },
    schemes: ["http"],
    apis: ["./**/**.ts"],
};

const specs = swaggerJsdoc(options);

api_doc_app.use("/", swaggerUi.serve, swaggerUi.setup(specs));
