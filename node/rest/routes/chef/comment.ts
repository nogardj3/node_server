import express from "express";
import cors from "cors";
import { logger } from "../../../logging";
import * as util from "../../../util";
import * as user_db from "../../database/chef/user";
import * as post_db from "../../database/chef/post";

class App {
    public application: express.Application;

    constructor() {
        this.application = express();
    }
}

export const comment_app = new App().application;
comment_app.use(cors());
comment_app.use(express.json());
comment_app.use(express.urlencoded({ extended: false }));

comment_app.post("/create", async (req: express.Request, res: express.Response) => {
    logger.info("comment create", req.body);

    let result = await post_db.createComment(
        req.body.post_id,
        req.body.user_id,
        req.body.contents as string,
        req.body.datetime
    );

    /*
    CHEF FCM Type 3 = 새 댓글 등록
    1. 타겟의 fcmtoken, post id, post title
    2. 리뷰 작성자의 nickname, img
    */

    let target_post_data = (await post_db.getPostDetail(req.body.post_id)) as any;
    let comment_user_data = (await user_db.getUserDetail(req.body.user_id)) as any;

    let post_contents = target_post_data["contents"] as string;
    post_contents = post_contents.length >= 20 ? post_contents.slice(0, 20) + "..." : post_contents;

    let fcm_token = ((await user_db.getUserDetail(target_post_data["user_id"])) as any)[
        "user_fcm_token"
    ];
    let data = {
        type: util.NOTI_TYPE_ADD_COMMENT,
        target_post_id: (target_post_data["post_id"] as Number).toString(),
        target_post_title: post_contents,
        comment_user_nickname: comment_user_data["nickname"],
        comment_user_img: comment_user_data["user_profile_img"],
    };

    let fcm_result = await util.sendChefFCM(
        fcm_token,
        "댓글 알림",
        post_contents + "에 댓글이 등록되었습니다.",
        data
    );
    console.log(fcm_result);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

comment_app.post("/delete", async (req: express.Request, res: express.Response) => {
    logger.info("comment delete", req.body);

    let result = await post_db.deleteComment(req.body.comment_id);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

comment_app.get("/*", async (req: express.Request, res: express.Response) => {
    logger.info("comment list", req.query);

    let result = await post_db.getComment(req.query.post_id);

    res.send(result);
});
