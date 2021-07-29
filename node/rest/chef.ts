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
            res.send({
                message: "ok",
            });
        } else {
            logger.warn(collection_name + "CLAER FAILED");
            res.status(500).send({
                message: "internal error",
            });
        }
    }
});

chef_app.post("/notification", async (req: express.Request, res: express.Response) => {
    logger.warn("NOTIFCATION CALL", req.body);
    if (req.body.keyword == util.PREFERENCES.NOTIFICATION_KEYWORD) {
        let data = {
            type: util.NOTI_TYPE_ADMIN,
        };

        let fcm_result = await util.sendChefFCM("token", req.body.title, req.body.contents, data);
        console.log(fcm_result);

        if (fcm_result == "OK") res.send({ ok: fcm_result });
        else res.status(401).send({ ok: fcm_result });
    } else res.status(500).send({ ok: "Internal error" });
});

/**
 * @swagger
 * paths:
 *   /chef/alive:
 *     get:
 *       description: 서버 상태 확인
 *       summary: 서버 상태 확인
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       responses:
 *         200:
 *           description: Success
 *         404:
 *           description: Not Found
 *         409:
 *           description: Already Exists
 *         500:
 *           description: Internal Error
 *
 *   /chef/faq:
 *     get:
 *       description: 자주 묻는 질문
 *       summary: 자주 묻는 질문
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       responses:
 *         200:
 *           description: Success
 *         404:
 *           description: Not Found
 *         409:
 *           description: Already Exists
 *         500:
 *           description: Internal Error
 *
 *   /chef/notice:
 *     get:
 *       description: 공지사항
 *       summary: 공지사항
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       responses:
 *         200:
 *           description: Success
 *         404:
 *           description: Not Found
 *         409:
 *           description: Already Exists
 *         500:
 *           description: Internal Error
 *
 *   /chef/tos:
 *     get:
 *       description: 이용 약관
 *       summary: 이용 약관
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       responses:
 *         200:
 *           description: Success
 *         404:
 *           description: Not Found
 *         409:
 *           description: Already Exists
 *         500:
 *           description: Internal Error
 *
 *   /chef/clear:
 *     post:
 *       description: DB Document 삭제
 *       summary: DB Document 삭제
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 keyword:
 *                   type: string
 *                   description: keyword
 *                 collection_name:
 *                   type: string
 *                   description: collection_name
 *       responses:
 *         200:
 *           description: Success
 *         404:
 *           description: Not Found
 *         409:
 *           description: Already Exists
 *         500:
 *           description: Internal Error
 *
 *   /chef/notification:
 *     post:
 *       description: Chef FCM Notification 보내기
 *       summary: Chef FCM Notification 보내기
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 keyword:
 *                   type: string
 *                   description: keyword
 *                 title:
 *                   type: string
 *                   description: title
 *                 contents:
 *                   type: string
 *                   description: contents
 *       responses:
 *         200:
 *           description: Success
 *         404:
 *           description: Not Found
 *         409:
 *           description: Already Exists
 *         500:
 *           description: Internal Error
 */
