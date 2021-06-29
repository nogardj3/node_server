import express from "express";
import cors from "cors";
import { logger } from "./logging";
import { api_doc_app } from "./api_docs";
import * as database from "./database";
import * as util from "./util";

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
app.get("/get/weather", async (req: express.Request, res: express.Response) => {
    let cities: string[] = req.query.cities as string[];
    try {
        let data = await database.getCachedWeather(cities).catch;
        if (data.length == 0) res.status(404).send("data not found");
        else res.send(data);
    } catch (error) {
        res.status(404).send("internal error");
        logger.error(error);
    }
});

app.get("/get/news", async (req: express.Request, res: express.Response) => {
    try {
        let data = await database.getCachedNews(
            Number.parseInt(req.query.page as string),
            Number.parseInt(req.query.pages as string)
        );
        console.log("-------------");
        console.log(data);
        if (data.length == 0) res.status(404).send("data not found");
        else res.send(data);
    } catch (error) {
        res.status(404).send("internal error");
        logger.error(error);
    }
});

app.get(
    "/get/corona/state",
    async (req: express.Request, res: express.Response) => {
        try {
            let data = await database.getCachedCoronaState();
            if (data.length == 0) res.status(404).send("data not found");
            else res.send(data);
        } catch (error) {
            res.status(404).send("internal error");
            logger.error(error);
        }
    }
);

app.get(
    "/get/corona/city",
    async (req: express.Request, res: express.Response) => {
        try {
            let cities: string[] = req.query.cities as string[];
            let data = await database.getCachedCoronaCity(cities);
            if (data.length == 0) res.status(404).send("data not found");
            else res.send(data);
        } catch (error) {
            res.status(404).send("internal error");
            logger.error(error);
        }
    }
);

app.get(
    "/get/corona/vaccine",
    async (req: express.Request, res: express.Response) => {
        try {
            let cities: string[] = req.query.cities as string[];
            let data = await database.getCachedCoronaVaccine(cities);
            if (data.length == 0) res.status(404).send("data not found");
            else res.send(data);
        } catch (error) {
            res.status(404).send("internal error");
            logger.error(error);
        }
    }
);

app.post(
    "/get/qrimage",
    async (request: express.Request, response: express.Response) => {
        try {
            const id: string = request.body.id as string;
            const pw: string = request.body.pw as string;
            const qrCodeResult = await util.getQrCode({
                id: id,
                password: pw,
            });

            if (qrCodeResult.isSuccess) {
                const imageBuffer = Buffer.from(qrCodeResult.result, "base64");
                response.writeHead(200, {
                    "Content-Type": "image/png",
                    "Content-Length": imageBuffer.length,
                });
                response.end(imageBuffer);
            } else {
                response.json(qrCodeResult);
                response.end();
            }
        } catch (error) {
            response.status(404).send("internal error");
            logger.error(error);
        }
    }
);

export const createServer = (port1: number) => {
    app.listen(port1, function () {
        console.log("=== rest server on port " + port1);
        database.init_db();
    });
};

/**
 * @swagger
 * tags:
 *   name: Weather
 *   description: 날씨 관련 REST
 */
/**
 * @swagger
 * paths:
 *   /get/weather:
 *     get:
 *       summary: 날씨 가져오기
 *       tags: [Weather]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: username
 *           in: formData
 *           required: true
 *           type: string
 *         - name: password
 *           in: formData
 *           required: true
 *           type: string
 */

/**
 * @swagger
 *
 * /get/news:
 *   get:
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         in: formData
 *         required: true
 *         type: string
 */

/**
 * @swagger
 *
 * /get/corona/state:
 *   get:
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         in: formData
 *         required: true
 *         type: string
 */

/**
 * @swagger
 *
 * /get/corona/city:
 *   get:
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         in: formData
 *         required: true
 *         type: string
 */
/**
 * @swagger
 *
 * /get/corona/vaccine:
 *   get:
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         in: formData
 *         required: true
 *         type: string
 */
/**
 * @swagger
 *
 * /post/qrinfo:
 *   post:
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         in: formData
 *         required: true
 *         type: string
 */
