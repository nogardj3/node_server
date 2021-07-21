import express from "express";
import cors from "cors";
import { logger } from "../logging";
import * as util from "../util";
import { comment_app } from "./routes/chef/comment";
import { post_app } from "./routes/chef/post";
import { recipe_app } from "./routes/chef/recipe";
import { review_app } from "./routes/chef/review";
import { user_app } from "./routes/chef/user";
import * as database from "./database/chef/basic";

class App {
    public application: express.Application;

    constructor() {
        this.application = express();
    }
}

export const chef_app = new App().application;
chef_app.use(cors());
chef_app.use(express.json());
chef_app.use(express.urlencoded({ extended: false }));

chef_app.use("/comment", comment_app);
chef_app.use("/post", post_app);
chef_app.use("/recipe", recipe_app);
chef_app.use("/review", review_app);
chef_app.use("/user", user_app);

chef_app.get("/alive", async (req: express.Request, res: express.Response) => {
    res.send({ message: "OK" });
});

chef_app.get("/faq", async (req: express.Request, res: express.Response) => {
    let data = await database.getFAQ();

    res.send(data);
});

chef_app.get("/notice", async (req: express.Request, res: express.Response) => {
    let data = await database.getNotice();

    res.send(data);
});

chef_app.get("/tos", async (req: express.Request, res: express.Response) => {
    res.send({ message: util.CHEF_TOS });
});

chef_app.post("/clear", async (req: express.Request, res: express.Response) => {
    logger.warn("CLEAR CALL");
    const pw: string = req.body.keyword as string;
    const collection_name: string = req.body.collection_name as string;

    if (pw != util.PREFERENCES.DB_CLEAR_KEYWORD) {
        logger.warn("UNAUTHORIZED");
        res.status(401).send("unauthorized");
    } else {
        let is_cleared = await database.clearDB(collection_name);
        if (is_cleared) {
            logger.warn(collection_name + "CLAERED !");
            res.send("ok");
        } else {
            logger.warn(collection_name + "CLAER FAILED");
            res.status(404).send("internal error");
        }
    }
});

/**
 * @swagger
 * paths:
 *   /corona/weather:
 *     get:
 *       description: 한국 시/도 별 현재 날씨
 *       summary: 날씨
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
 *   /corona/news:
 *     get:
 *       description: 코로나 관련 뉴스 조회
 *       summary: 뉴스
 *       tags: [Corona]
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
 *   /corona/state:
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
 *   /corona/city:
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
 *   /corona/vaccine:
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
