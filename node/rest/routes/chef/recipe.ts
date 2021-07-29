import express from "express";
import cors from "cors";
import { logger } from "../../../logging";
import * as util from "../../../util";
import * as user_db from "../../database/chef/user";
import * as recipe_db from "../../database/chef/recipe";

class App {
    public application: express.Application;

    constructor() {
        this.application = express();
    }
}

export const recipe_app = new App().application;
recipe_app.use(cors());
recipe_app.use(express.json());
recipe_app.use(express.urlencoded({ extended: false }));

recipe_app.post("/create", async (req: express.Request, res: express.Response) => {
    logger.info("recipe create", req.body);

    let result = await recipe_db.createRecipe(
        req.body.user_id,
        req.body.recipe_name,
        req.body.recipe_img,
        req.body.contents,
        req.body.datetime,
        req.body.amount_time,
        req.body.ingredients,
        req.body.tags,
        req.body.phase
    );

    /*
    CHEF FCM Type 1 = 팔로우 하고있는 유저의 새 레시피 등록
    1. 타겟들의 fcmtoken
    2. 새 레시피의 recipe name, 작성자의 nickname, user_profile_img
    2. 리뷰 작성자의 nickname, img
    */

    let target_user_data = (await user_db.getUserDetail(req.body.user_id)) as any;
    let follow_user_data = (await user_db.getFollower(req.body.user_id)) as any;

    if (follow_user_data.length != 0) {
        let fcm_tokens = follow_user_data.map((v: any) => v["user_fcm_token"]);
        let contents =
            "팔로우 하는 " +
            target_user_data["nickname"] +
            "의 " +
            req.body.recipe_name +
            "가 등록되었습니다.";

        let data = {
            type: util.NOTI_TYPE_ADD_SUB_USER_RECIPE,
            target_intent: "recipe_detail",
            target_intent_data: result,
            notification_contents: contents,
            notification_img: target_user_data["user_profile_img"],
            notification_datetime: Date.now().toString(),
        };

        let fcm_result = await util.sendChefFCM(fcm_tokens, "새 레시피 알림", contents, data);
    }

    if (result != "ERROR") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

recipe_app.post("/update", async (req: express.Request, res: express.Response) => {
    logger.info("recipe update", req.body);

    let result = await recipe_db.updateRecipe(
        req.body.recipe_id,
        req.body.recipe_name,
        req.body.recipe_img,
        req.body.contents,
        req.body.amount_time,
        req.body.ingredients,
        req.body.tags,
        req.body.phases
    );

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

recipe_app.post("/delete", async (req: express.Request, res: express.Response) => {
    logger.info("recipe delete", req.body);

    let result = await recipe_db.deleteRecipe(req.body.recipe_id);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

recipe_app.post("/like", async (req: express.Request, res: express.Response) => {
    logger.info("recipe like", req.body);

    let result = await recipe_db.setLikeRecipe(req.body.recipe_id, req.body.user_id, req.body.like);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

recipe_app.post("/count", async (req: express.Request, res: express.Response) => {
    logger.info("recipe count", req.body);

    let result = await recipe_db.addCountRecipe(req.body.recipe_id);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

recipe_app.get("/detail", async (req: express.Request, res: express.Response) => {
    logger.info("recipe detail", req.query);

    let result = await recipe_db.getRecipeDetail(req.query.recipe_id);

    res.send(result);
});

recipe_app.get("/*", async (req: express.Request, res: express.Response) => {
    logger.info("recipe list", req.query);

    let result = await recipe_db.getRecipeList(
        req.query.user_id,
        req.query.recipe_name,
        req.query.tag,
        req.query.ingredient,
        req.query.sort
    );

    res.send(result);
});

/**
 * @swagger
 * paths:
 *   /chef/recipe/create:
 *     post:
 *       description: Recipe 생성 - 작업중
 *       summary: Recipe 생성 - 작업중
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
 *                 post_img:
 *                   type: string
 *                   description: post_img
 *                 contents:
 *                   type: string
 *                   description: contents
 *                 datetime:
 *                   type: string
 *                   description: datetime
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: tags
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
 *   /chef/recipe/update:
 *     post:
 *       description: recipe 업데이트 - 작업중
 *       summary: recipe 업데이트 - 작업중
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
 *                 post_id:
 *                   type: string
 *                   description: post_id
 *                 post_img:
 *                   type: string
 *                   description: post_img
 *                 contents:
 *                   type: string
 *                   description: contents
 *                 datetime:
 *                   type: string
 *                   description: datetime
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: tags
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
 *   /chef/recipe/delete:
 *     post:
 *       description: Recipe 삭제
 *       summary: Recipe 삭제
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
 *                 recipe_id:
 *                   type: string
 *                   description: recipe_id
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
 *   /chef/recipe/like:
 *     post:
 *       description: recipe 좋아요
 *       summary: recipe 좋아요
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
 *                 recipe_id:
 *                   type: string
 *                   description: recipe_id
 *                 user_id:
 *                   type: string
 *                   description: user_id
 *                 like:
 *                   type: string
 *                   description: like, -1 or 1
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
 *   /chef/recipe/detail:
 *     get:
 *       description: Recipe 상세정보
 *       summary: Recipe 상세정보
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: recipe_id
 *           in: query
 *           description: 조회할 recipe id
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
 *   /chef/recipe/:
 *     get:
 *       description: Recipe 조회
 *       summary: Recipe 조회
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: user_id
 *           in: query
 *           description: Recipe - user_id로 조회
 *           schema:
 *             type: string
 *         - name: recipe_name
 *           in: query
 *           description: Recipe - recipe_name으로 조회
 *           schema:
 *             type: string
 *         - name: tags
 *           in: query
 *           description: Recipe - tag으로 조회
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *         - name: ingredients
 *           in: query
 *           description: Recipe - ingredient로 조회
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *         - name: sort
 *           in: query
 *           description: Recipe - 정렬방법
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
