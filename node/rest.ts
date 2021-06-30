import express from "express";
import cors from "cors";
import { logger } from "./logging";
import { api_doc_app } from "./api_docs";
import * as database from "./database";
import * as util from "./util";
import isEmpty from "is-empty";

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

app.get("/rest/weather", async (req: express.Request, res: express.Response) => {
    logger.info("rest_weather", req.query);

    let cities: string[] = [];
    if (!isEmpty(req.query.cities)) {
        cities = req.query.cities as string[];
    } else if (req.query.cities instanceof String) {
        let city: string = req.query.cities as string;
        cities.push(city);
    }

    let data = await database.getCachedWeather(cities);

    logger.info("weather response_data", data);
    if (data.length == 0) res.status(404).send("data not found");
    else res.send(data);
});

app.get("/rest/news", async (req: express.Request, res: express.Response) => {
    logger.info("rest_news", req.query);

    let page = 1;
    let page_count = 10;

    if (!isEmpty(req.query) && !isEmpty(req.query.page_count)) {
        page_count = Number.parseInt(req.query.page_count as string);
        page_count = page_count > 100 ? 100 : page_count;
    }
    if (!isEmpty(req.query) && !isEmpty(req.query.page)) {
        page = Number.parseInt(req.query.page as string);
        page = page * page_count >= 100 ? 0 : page;
    }

    let data = await database.getCachedNews(page, page_count);

    logger.info("news response_data", data);

    if (data.length == 0) res.status(404).send("data not found");
    else res.send(data);
});

app.get("/rest/corona/state", async (req: express.Request, res: express.Response) => {
    logger.info("rest_corona_state");

    let data = await database.getCachedCoronaState();

    logger.info("corona_state response_data", data);

    if (data.length == 0) res.status(404).send("data not found");
    else res.send(data);
});

app.get("/rest/corona/city", async (req: express.Request, res: express.Response) => {
    let cities: string[] = req.query.cities as string[];
    let data = await database.getCachedCoronaCity(cities);

    if (data.length == 0) res.status(404).send("data not found");
    else res.send(data);
});

app.get("/rest/corona/vaccine", async (req: express.Request, res: express.Response) => {
    let cities: string[] = req.query.cities as string[];
    let data = await database.getCachedCoronaVaccine(cities);

    if (data.length == 0) res.status(404).send("data not found");
    else res.send(data);
});

app.post("/rest/qrimage", async (request: express.Request, response: express.Response) => {
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
});

export const createServer = (port1: number) => {
    app.listen(port1, function () {
        logger.info("=== rest server on port " + port1);
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
 *   /rest/weather:
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
 * /rest/news:
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
 * /rest/corona/state:
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
 * /rest/corona/city:
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
 * /rest/corona/vaccine:
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
