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
            title: "REST Server Api-doc",
            version: "1.0.0",
            description: "REST Server Api-doc",
            contact: {
                name: "yhjoo",
                url: "https://github.com/nogardj3",
                email: "wwwfy@naver.com",
            },
        },
        servers: [
            {
                url: "http://localhost:" + PREFERENCES.PORT_REST,
                description: "REST server",
            },
        ],
    },
    schemes: ["http"],
    apis: ["./**/**.ts"],
};

const specs = swaggerJsdoc(options);

api_doc_app.use("/", swaggerUi.serve, swaggerUi.setup(specs));
