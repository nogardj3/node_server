import express from "express";
import cors from "cors";
import { logger } from "./logging";
import { api_doc_app } from "./api_docs";
import * as database from "./caching_db";
import * as util from "./util";
import axios from "axios";
import * as querystring from "querystring";
import puppeteer from "puppeteer";

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

/**
 * @swagger
 *
 * /getweather:
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
app.get("/getweather", (req: express.Request, res: express.Response) => {
    var api_url =
        "https://api.openweathermap.org/data/2.5/weather?" +
        querystring.stringify({
            q: util.WEATHER.WEATHER_INIT[0],
            appid: util.PREFERENCES.OPEN_WEATHER_KEY,
        });

    console.log(api_url);
    axios.get(api_url).then((resp) => {
        console.log(resp);
        res.send(resp.data);
    });
});

/**
 * @swagger
 *
 * /getnews:
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
app.get("/getnews", (req: express.Request, res: express.Response) => {
    var api_url =
        "https://openapi.naver.com/v1/search/news?" +
        querystring.stringify({
            query: "코로나",
            sort: "sim",
        });

    console.log(api_url);
    axios
        .get(api_url, {
            headers: {
                "X-Naver-Client-Id": util.PREFERENCES.NAVER_CLIENT_ID,
                "X-Naver-Client-Secret": util.PREFERENCES.NAVER_CLIENT_SECRET,
            },
        })
        .then((resp) => {
            res.send(resp.data.items);
        });
});

/**
 * @swagger
 *
 * /getqrinfo:
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
app.get(
    "/getqrinfo",
    async (request: express.Request, response: express.Response) => {
        const id: string = request.query.id as string;
        const pw: string = request.query.pw as string;
        const qrCodeResult = await util.getQrCode({
            id: id,
            password: pw,
            // id: "wwwfy",
            // password: "12341234",
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
    }
);

export const createServer = (port1: number) => {
    app.listen(port1, function () {
        console.log("=== rest server on port " + port1);
        database.init_db();
    });
};
