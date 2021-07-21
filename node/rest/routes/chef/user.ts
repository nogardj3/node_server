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

user_app.get("/detail", async (req: express.Request, res: express.Response) => {
    logger.info("user detail", req.query);

    let result = await user_db.getUserDetail(req.query.user_id);

    res.send(result);
});

user_app.get("/check/nickname", async (req: express.Request, res: express.Response) => {
    logger.info("user check", req.query);

    let nickname = req.query.nickname as string;

    let result: any = await user_db.checkNickname(nickname);

    if (result > 0)
        res.status(403).send({
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
        res.status(404).send({
            message: "data not found",
        });
    }
});

user_app.post("/signup", async (req: express.Request, res: express.Response) => {
    logger.info("user signup", req.query);

    let result = await user_db.createUser(req.query);

    if (Object.keys(result).length == 0)
        res.status(403).send({
            message: "nickname already exists",
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
    let data = {
        type: util.NOTI_TYPE_SUB_USER,
        target_user_id: target_user_data["user_id"],
        follow_user_nickname: send_user_nickname,
        follow_user_img: follow_user_data["user_profile_img"],
    };

    let fcm_result = await util.sendChefFCM(
        fcm_token,
        "팔로우 알림",
        send_user_nickname + "가 당신을 팔로우합니다.",
        data
    );
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

user_app.get("/*", async (req: express.Request, res: express.Response) => {
    logger.info("user list", req.query);

    let result = await user_db.getUserList(req.query.nickname);

    res.send(result);
});
