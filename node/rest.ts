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

app.post("/rest/clear", async (req: express.Request, res: express.Response) => {
    const pw: string = req.body.keyword as string;
    const collection_name: string = req.body.collection_name as string;

    if (pw != util.PREFERENCES.DB_CLEAR_KEYWORD) res.status(401).send("unauthorized");
    else {
        let is_cleared = await database.clearDB(collection_name);
        if (is_cleared) res.send("ok");
        else res.status(404).send("internal error");
    }
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
    logger.info("rest_corona_city", req.query);

    let cities: string[] = [];
    if (!isEmpty(req.query.cities)) {
        cities = req.query.cities as string[];
    } else if (req.query.cities instanceof String) {
        let city: string = req.query.cities as string;
        cities.push(city);
    }

    let data = await database.getCachedCoronaCity(cities);

    logger.info("corona_city response_data", data);
    if (data.length == 0) res.status(404).send("data not found");
    else res.send(data);
});

app.get("/rest/corona/vaccine", async (req: express.Request, res: express.Response) => {
    logger.info("rest_corona_vaccine", req.query);
    let lat: number = isEmpty(req.query.lat)
        ? util.PREFERENCES.DEFAULT_LAT
        : Number.parseFloat(req.query.lat as string);
    let lon: number = isEmpty(req.query.lon)
        ? util.PREFERENCES.DEFAULT_LON
        : Number.parseFloat(req.query.lon as string);
    let within: number = isEmpty(req.query.within)
        ? util.PREFERENCES.DEFAULT_WITHIN
        : Number.parseFloat(req.query.within as string);

    let data = await database.getCachedCoronaVaccine(lat, lon, within);

    logger.info("corona_vaccine response_data", data);
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
