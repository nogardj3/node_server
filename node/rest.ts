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
        if (typeof req.query.cities === "string") cities.push(req.query.cities);
        else cities = req.query.cities as string[];
    }

    console.log(cities, typeof cities);

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

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_COUNT = 10;
app.get("/rest/news", async (req: express.Request, res: express.Response) => {
    logger.info("rest_news", req.query);

    let page = DEFAULT_PAGE;
    let page_count = DEFAULT_PAGE_COUNT;

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
        if (typeof req.query.cities === "string") cities.push(req.query.cities);
        else cities = req.query.cities as string[];
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
        : Number.parseFloat(req.query.within as string) > 30
        ? 30
        : Number.parseFloat(req.query.within as string);

    let data = await database.getCachedCoronaVaccine(lat, lon, within);

    logger.info("corona_vaccine response_data", data);

    if (data.length == 0) res.status(404).send("data not found");
    else res.send(data);
});

app.post("/rest/qrimage", async (req: express.Request, res: express.Response) => {
    const id: string = req.body.id as string;
    const pw: string = req.body.pw as string;
    const qrCodeResult = await util.getQrCode({
        id: id,
        password: pw,
    });

    if (qrCodeResult.isSuccess) {
        const imageBuffer = Buffer.from(qrCodeResult.result, "base64");
        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": imageBuffer.length,
        });
        res.end(imageBuffer);
    } else {
        res.json(qrCodeResult);
        res.end();
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
 *   - name: Weather
 *     description: 날씨
 *   - name: News
 *     description: 코로나 뉴스
 *   - name: Corona
 *     description: 코로나
 *
 * paths:
 *   /rest/weather:
 *     get:
 *       description: 한국 시/도 별 현재 날씨
 *       summary: 날씨
 *       tags: [Weather]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: cities
 *           in: query
 *           description: 조회할 도시
 *           required: false
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *       responses:
 *         200:
 *           description: 조회 성공
 *         404:
 *           description: 데이터 없음
 *
 *   /rest/news:
 *     get:
 *       description: 코로나 관련 뉴스 조회
 *       summary: 뉴스
 *       tags: [News]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: page
 *           in: query
 *           description: 조회할 페이지
 *           required: false
 *           schema:
 *             type: integer
 *         - name: page_count
 *           in: query
 *           description: 조회할 페이지 갯수
 *           required: false
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: 조회 성공
 *         404:
 *           description: 데이터 없음
 *
 *   /rest/corona/state:
 *     get:
 *       description: 5일 코로나 현황 조회
 *       summary: 코로나 현황
 *       tags: [Corona]
 *       produces:
 *         - application/json
 *       responses:
 *         200:
 *           description: 조회 성공
 *         404:
 *           description: 데이터 없음
 *
 *   /rest/corona/city:
 *     get:
 *       description: 5일 코로나 대도시(시/도) 현황 조회
 *       summary: 코로나 대도시 현황
 *       tags: [Corona]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: cities
 *           in: query
 *           description: 조회할 도시
 *           required: false
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *       responses:
 *         200:
 *           description: 조회 성공
 *         404:
 *           description: 데이터 없음
 *
 *   /rest/corona/vaccine:
 *     get:
 *       description: 위도/경도 기준 코로나 백신 접종센터 조회
 *       summary: 코로나 백신 센터
 *       tags: [Corona]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: lat
 *           in: query
 *           description: 위도
 *           required: false
 *           schema:
 *             type: number
 *             format: float
 *         - name: lon
 *           in: query
 *           description: 경도
 *           required: false
 *           schema:
 *             type: number
 *             format: float
 *         - name: within
 *           in: query
 *           description: 반경 - 최대 30
 *           required: false
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: 조회 성공
 *         404:
 *           description: 데이터 없음
 */
