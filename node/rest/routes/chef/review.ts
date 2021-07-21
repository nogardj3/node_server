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

export const review_app = new App().application;
review_app.use(cors());
review_app.use(express.json());
review_app.use(express.urlencoded({ extended: false }));

// review_app.get("/create", async (req: express.Request, res: express.Response) => {
//     logger.info("review create", req.query);

//     let result = await recipe_db.createReview(
//         req.query.recipe_id,
//         req.query.user_id,
//         req.query.contents,
//         req.query.datetime,
//         req.query.rating
//     );

//     /*
//     CHEF FCM Type 2 = 새 리뷰 등록
//     1. 타겟의 fcmtoken, recipe id, recipe title
//     2. 리뷰 작성자의 nickname, img
//     */

//     let target_recipe_data = (await recipe_db.getRecipeDetail(req.query.recipe_id)) as any;
//     let review_user_data = (await user_db.getUserDetail(req.query.user_id)) as any;

//     let target_recipe_name = target_recipe_data["recipe_name"];

//     let fcm_token = ((await user_db.getUserDetail(target_recipe_data["user_id"])) as any)[
//         "user_fcm_token"
//     ];
//     let data = {
//         type: util.NOTI_TYPE_ADD_REVIEW,
//         target_recipe_id: req.query.recipe_id,
//         target_recipe_title: target_recipe_name,
//         review_user_nickname: review_user_data["nickname"],
//         review_user_img: review_user_data["user_profile_img"],
//     };

//     let fcm_result = await util.sendChefFCM(
//         fcm_token,
//         "리뷰 알림",
//         target_recipe_name + "에 새 리뷰가 등록되었습니다.",
//         data
//     );
//     console.log(fcm_result);

//     if (result == "OK") res.send({ ok: result });
//     else res.status(500).send({ ok: result });
// });

review_app.post("/create", async (req: express.Request, res: express.Response) => {
    logger.info("review create", req.body);

    let result = await recipe_db.createReview(
        req.body.recipe_id,
        req.body.user_id,
        req.body.contents,
        req.body.datetime,
        req.body.rating
    );

    /*
    CHEF FCM Type 2 = 새 리뷰 등록
    1. 타겟의 fcmtoken, recipe id, recipe title
    2. 리뷰 작성자의 nickname, img
    */

    let target_recipe_data = (await recipe_db.getRecipeDetail(req.body.recipe_id)) as any;
    let review_user_data = (await user_db.getUserDetail(req.body.user_id)) as any;

    let target_recipe_name = target_recipe_data["recipe_name"];

    let fcm_token = ((await user_db.getUserDetail(target_recipe_data["user_id"])) as any)[
        "user_fcm_token"
    ];
    let data = {
        type: util.NOTI_TYPE_ADD_REVIEW,
        target_recipe_id: (req.body.recipe_id as Number).toString(),
        target_recipe_title: target_recipe_name,
        review_user_nickname: review_user_data["nickname"],
        review_user_img: review_user_data["user_profile_img"],
    };

    let fcm_result = await util.sendChefFCM(
        fcm_token,
        "리뷰 알림",
        target_recipe_name + "에 새 리뷰가 등록되었습니다.",
        data
    );
    console.log(fcm_result);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

review_app.post("/delete", async (req: express.Request, res: express.Response) => {
    logger.info("review delete", req.body);

    let result = await recipe_db.deleteReview(req.body.review_id);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

review_app.get("/*", async (req: express.Request, res: express.Response) => {
    logger.info("review list", req.query);

    let result = await recipe_db.getReview(req.query.recipe_id);

    res.send(result);
});
