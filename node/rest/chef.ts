import express from "express";
import cors from "cors";
import { logger } from "../logging";
import * as util from "../util";
import isEmpty from "is-empty";
import * as database from "../database_chef";
import { userInfo } from "os";

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

chef_app.post("/clear", async (req: express.Request, res: express.Response) => {
    const pw: string = req.body.keyword as string;
    const collection_name: string = req.body.collection_name as string;

    if (pw != util.PREFERENCES.DB_CLEAR_KEYWORD) res.status(401).send("unauthorized");
    else {
        let is_cleared = await database.clearDB(collection_name);
        if (is_cleared) res.send("ok");
        else res.status(404).send("internal error");
    }
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
    res.send(util.CHEF_TOS);
});

chef_app.post("/user/check/", async (req: express.Request, res: express.Response) => {
    logger.info("user check", req.body);

    let token = req.body.user_token as string;
    let uid = req.body.user_id as string;

    let result: any = await database.checkUserInfo(token, uid);
    console.log(result);

    if (result["value"] != null) {
        res.send(result);
    } else {
        res.status(404).send({
            message: "data not found",
        });
    }
});

chef_app.post("/user/signup", async (req: express.Request, res: express.Response) => {
    logger.info("user signup", req.body);

    let result = await database.createUser(req.body);
    console.log(result);

    if (Object.keys(result).length == 0)
        res.status(403).send({
            message: "nickname already exists",
        });
    else {
        res.send(result);
    }
});

chef_app.get("/user/follower", async (req: express.Request, res: express.Response) => {
    logger.info("user follower", req.query);

    let result = await database.getFollower(req.query.user_id, req.query.target_id);

    res.send(result);
});

chef_app.get("/user/following", async (req: express.Request, res: express.Response) => {
    logger.info("user following", req.query);

    let result = await database.getFollowing(req.query.user_id, req.query.target_id);

    res.send(result);
});

/**
 * @swagger
 * paths:
 *   /chef/user/check/:
 *     get:
 *       description: 유저 정보 체크
 *       summary: 유저
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: token
 *           in: query
 *           description: 유저 토큰
 *           required: false
 *           schema:
 *             type: integer
 *         - name: page_count
 *           in: query
 *           description: 유저 닉네임
 *           required: false
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: 조회 성공
 *         404:
 *           description: 데이터 없음
 *
 *   /chef/news:
 *     get:
 *       description: 코로나 관련 뉴스 조회
 *       summary: 뉴스
 *       tags: [Chef]
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
 *   /chef/current/vaccine:
 *     get:
 *       description: 위도/경도 기준 코로나 백신 접종센터 조회
 *       summary: 코로나 백신 센터
 *       tags: [Chef]
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
