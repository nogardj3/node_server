import express from "express";
import cors from "cors";
import { logger } from "../../../logging";
import * as util from "../../../util";
import * as user_db from "../../database/chef/user";
import * as recipe_db from "../../database/chef/recipe";
import { findPair } from "yaml/util";

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

recipe_app.get("/detail", async (req: express.Request, res: express.Response) => {
    logger.info("recipe detail", req.query);

    let result = await recipe_db.getRecipeDetail(req.query.recipe_id);

    res.send(result);
});

recipe_app.post("/create", async (req: express.Request, res: express.Response) => {
    logger.info("recipe create", req.body);

    // let result = await recipe_db.createRecipe(
    //     req.body.user_id,
    //     req.body.recipe_name,
    //     req.body.recipe_img,
    //     req.body.contents,
    //     req.body.datetime,
    //     req.body.amount_time,
    //     req.body.ingredients,
    //     req.body.tags,
    //     req.body.phases
    // );

    /*
    CHEF FCM Type 1 = 팔로우 하고있는 유저의 새 레시피 등록
    1. 타겟들의 fcmtoken
    2. 새 레시피의 recipe name, 작성자의 nickname, user_profile_img
    2. 리뷰 작성자의 nickname, img
    */

    let result = "1";

    let target_user_data = (await user_db.getUserDetail(req.body.user_id)) as any;
    let follow_user_data = (await user_db.getFollower(req.body.user_id)) as any;

    if (follow_user_data.length != 0) {
        let fcm_tokens = follow_user_data.map((v: any) => v["user_fcm_token"]);

        let data = {
            type: util.NOTI_TYPE_ADD_SUB_USER_RECIPE,
            target_recipe_id: result,
            target_recipe_name: req.body.recipe_name,
            target_user_name: target_user_data["nickname"],
            target_user_img: target_user_data["user_profile_img"],
        };

        let fcm_result = await util.sendChefFCM(
            fcm_tokens,
            "새 레시피 알림",
            "팔로우 하는 " +
                target_user_data["nickname"] +
                "의 " +
                req.body.recipe_name +
                "가 등록되었습니다.",
            data
        );
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
