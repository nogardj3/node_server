import express from "express";
import cors from "cors";
import { logger } from "../../../logging";
import * as util from "../../../util";
import * as basic_db from "../../database/chef/basic";
import * as user_db from "../../database/chef/user";

class App {
    public application: express.Application;

    constructor() {
        this.application = express();
    }
}

export const user_app = new App().application;
user_app.use(cors());
user_app.use(express.json());
user_app.use(express.urlencoded({ extended: false }));

user_app.post("/signup", async (req: express.Request, res: express.Response) => {
    logger.info("user signup", req.query);

    let result = await user_db.createUser(req.query);

    if (Object.keys(result).length == 0)
        res.status(500).send({
            message: "internal error",
        });
    else {
        res.send(result);
    }
});

user_app.post("/update", async (req: express.Request, res: express.Response) => {
    logger.info("user update", req.body);

    let result = await user_db.updateUser(
        req.body.user_id,
        req.body.user_img,
        req.body.nickname,
        req.body.bio
    );

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

user_app.post("/subscribe", async (req: express.Request, res: express.Response) => {
    logger.info("user subscribe", req.body);

    let result = await user_db.subscribeUser(req.body.user_id, req.body.target_id);

    /*
    CHEF FCM Type 4 = 누군가 당신을 팔로우
    1. 타겟의 fcmtoken, user_id
    2. 팔로워의 nickname, image
    */

    let target_user_data = (await user_db.getUserDetail(req.body.target_id)) as any;
    let follow_user_data = (await user_db.getUserDetail(req.body.user_id)) as any;

    let send_user_nickname = follow_user_data["nickname"];

    let fcm_token = target_user_data["user_fcm_token"];
    let contents = send_user_nickname + "가 당신을 팔로우합니다.";
    let data = {
        type: util.NOTI_TYPE_SUB_USER,
        target_intent: "home",
        target_intent_data: target_user_data["user_id"],
        notification_contents: contents,
        notification_img: follow_user_data["user_profile_img"],
        notification_datetime: Date.now().toString(),
    };

    let fcm_result = await util.sendChefFCM(fcm_token, "팔로우 알림", contents, data);
    console.log(fcm_result);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

user_app.post("/unsubscribe", async (req: express.Request, res: express.Response) => {
    logger.info("user unsubscribe", req.body);

    let result = await user_db.unsubscribeUser(req.body.user_id, req.body.target_id);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

user_app.post("/check/nickname", async (req: express.Request, res: express.Response) => {
    logger.info("user check", req.body);

    let nickname = req.body.nickname as string;

    let result: any = await user_db.checkNickname(nickname);

    if (result > 0)
        res.status(409).send({
            msg: "already exists",
        });
    else
        res.send({
            msg: "ok",
        });
});

user_app.post("/check/", async (req: express.Request, res: express.Response) => {
    logger.info("user check", req.body);

    let token = req.body.user_token as string;
    let fcm_token = req.body.user_fcm_token as string;
    let uid = req.body.user_id as string;

    let result: any = await user_db.checkUserInfo(token, fcm_token, uid);

    if (result["value"] != null) {
        res.send(result["value"]);
    } else {
        res.status(409).send({
            message: "already exists",
        });
    }
});

user_app.get("/follower", async (req: express.Request, res: express.Response) => {
    logger.info("user follower", req.query);

    let result = await user_db.getFollower(req.query.target_id);

    res.send(result);
});

user_app.get("/following", async (req: express.Request, res: express.Response) => {
    logger.info("user following", req.query);

    let result = await user_db.getFollowing(req.query.target_id);

    res.send(result);
});

user_app.get("/detail", async (req: express.Request, res: express.Response) => {
    logger.info("user detail", req.query);

    let result = await user_db.getUserDetail(req.query.user_id);

    res.send(result);
});

user_app.get("/*", async (req: express.Request, res: express.Response) => {
    logger.info("user list", req.query);

    let result = await user_db.getUserList(req.query.nickname);

    res.send(result);
});

/**
 * @swagger
 * paths:
 *   /chef/user/signup:
 *     post:
 *       description: User 생성
 *       summary: User 생성
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
 *                 user_id:
 *                   type: string
 *                   description: user_id
 *                 nickname:
 *                   type: string
 *                   description: nickname
 *                 user_token:
 *                   type: string
 *                   description: user_token
 *                 user_fcm_token:
 *                   type: string
 *                   description: user_fcm_token
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
 *   /chef/user/update:
 *     post:
 *       description: User 업데이트
 *       summary: User 업데이트
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
 *                 user_id:
 *                   type: string
 *                   description: user_id
 *                 nickname:
 *                   type: string
 *                   description: nickname
 *                 user_img:
 *                   type: string
 *                   description: user_img
 *                 bio:
 *                   type: string
 *                   description: bio
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
 *   /chef/user/subscribe:
 *     post:
 *       description: User 구독
 *       summary: User 구독
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
 *                 user_id:
 *                   type: string
 *                   description: user_id
 *                 target_id:
 *                   type: string
 *                   description: target_id
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
 *   /chef/user/unsubscribe:
 *     post:
 *       description: User 구독 해제
 *       summary: User 구독 해제
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
 *                 user_id:
 *                   type: string
 *                   description: user_id
 *                 target_id:
 *                   type: string
 *                   description: target_id
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
 *   /chef/user/check/nickname:
 *     post:
 *       description: User Nickname 체크
 *       summary: User Nickname 체크
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
 *                 nickname:
 *                   type: string
 *                   description: nickname
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
 *   /chef/user/check/:
 *     post:
 *       description: User 가입 확인
 *       summary: User 가입 확인
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
 *                 user_token:
 *                   type: string
 *                   description: user_token
 *                 user_fcm_token:
 *                   type: string
 *                   description: user_fcm_token
 *                 user_id:
 *                   type: string
 *                   description: user_id
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
 *   /chef/user/follower:
 *     get:
 *       description: User Follower 조회
 *       summary: User Follower 조회
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: target_id
 *           in: query
 *           description: 조회할 user id
 *           required: false
 *           schema:
 *             type: string
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
 *   /chef/user/following:
 *     get:
 *       description: User Following 조회
 *       summary: User Following 조회
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: target_id
 *           in: query
 *           description: 조회할 user id
 *           required: false
 *           schema:
 *             type: string
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
 *   /chef/user/detail:
 *     get:
 *       description: User 상세정보
 *       summary: User 상세정보
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: user_id
 *           in: query
 *           description: 조회할 user id
 *           required: false
 *           schema:
 *             type: string
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
 *   /chef/user/:
 *     get:
 *       description: User 조회
 *       summary: User 조회
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: nickname
 *           in: query
 *           description: User - nickname으로 조회
 *           schema:
 *             type: string
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
