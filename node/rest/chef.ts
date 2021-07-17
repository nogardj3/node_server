import express from "express";
import cors from "cors";
import { logger } from "../logging";
import * as util from "../util";
import * as database from "../database_chef";
import { type } from "os";

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

// ========= Basic
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

// ========= User
chef_app.get("/user", async (req: express.Request, res: express.Response) => {
    logger.info("user list", req.query);

    let result = await database.getUserList(req.query.nickname);

    res.send(result);
});

chef_app.get("/user/detail", async (req: express.Request, res: express.Response) => {
    logger.info("user detail", req.query);

    let result = await database.getUserDetail(req.query.user_id);

    res.send(result);
});

chef_app.post("/user/check/", async (req: express.Request, res: express.Response) => {
    logger.info("user check", req.body);

    let token = req.body.user_token as string;
    let uid = req.body.user_id as string;

    let result: any = await database.checkUserInfo(token, uid);
    console.log(result);

    if (result["value"] != null) {
        res.send(result["value"]);
    } else {
        res.status(404).send({
            message: "data not found",
        });
    }
});

chef_app.get("/user/signup", async (req: express.Request, res: express.Response) => {
    logger.info("user signup", req.query);

    let result = await database.createUser(req.query);
    console.log(result);

    if (Object.keys(result).length == 0)
        res.status(403).send({
            message: "nickname already exists",
        });
    else {
        res.send(result);
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

    let result = await database.getFollower(req.query.target_id);

    console.log(result);

    res.send(result);
});

chef_app.get("/user/following", async (req: express.Request, res: express.Response) => {
    logger.info("user following", req.query);

    let result = await database.getFollowing(req.query.target_id);

    res.send(result);
});

chef_app.post("/user/subscribe", async (req: express.Request, res: express.Response) => {
    logger.info("user subscribe", req.body);

    let result = await database.subscribeUser(req.body.user_id, req.body.target_id);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

chef_app.post("/user/unsubscribe", async (req: express.Request, res: express.Response) => {
    logger.info("user unsubscribe", req.body);

    let result = await database.unsubscribeUser(req.body.user_id, req.body.target_id);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

// ========== Post
chef_app.get("/post", async (req: express.Request, res: express.Response) => {
    logger.info("post list", req.query);

    let result = await database.getPostList(req.query.user_id, req.query.nickname);

    res.send(result);
});

chef_app.get("/post/detail", async (req: express.Request, res: express.Response) => {
    logger.info("post detail", req.query);

    let result = await database.getPostDetail(req.query.post_id);

    res.send(result);
});

chef_app.post("/post/like", async (req: express.Request, res: express.Response) => {
    logger.info("post like toggle", req.body);

    let result = await database.setPostLike(req.body.user_id, req.body.post_id, req.body.like);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

chef_app.post("/post/create", async (req: express.Request, res: express.Response) => {
    logger.info("post create", req.body);
    console.log(typeof req.body.tags);

    let tags: String[] = [];
    if (typeof req.body.tags == "string") {
        tags.push(req.body.tags);
    } else tags = req.body.tags;
    let result = await database.createPost(
        req.body.user_id,
        req.body.post_img,
        req.body.contents,
        req.body.datetime,
        tags
    );

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

chef_app.post("/post/update", async (req: express.Request, res: express.Response) => {
    logger.info("post update", req.body);

    let result = await database.updatePost(
        req.body.user_id,
        req.body.post_img,
        req.body.contents,
        req.body.datetime,
        req.body.tags
    );

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

chef_app.post("/post/delete", async (req: express.Request, res: express.Response) => {
    logger.info("post delete", req.body);

    let result = await database.deletePost(req.body.post_id);

    if (result == "OK") res.send(result);
    else res.status(500).send(result);
});

// ========= comment
chef_app.get("/comment", async (req: express.Request, res: express.Response) => {
    logger.info("comment list", req.query);

    let result = await database.getComment(req.query.post_id);

    res.send(result);
});

chef_app.post("/comment/create", async (req: express.Request, res: express.Response) => {
    logger.info("comment create", req.body);

    let result = await database.createComment(
        req.body.post_id,
        req.body.user_id,
        req.body.contents,
        req.body.datetime
    );

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

chef_app.post("/comment/delete", async (req: express.Request, res: express.Response) => {
    logger.info("comment delete", req.body);

    let result = await database.deleteComment(req.body.comment_id);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

// ========== Recipe
chef_app.get("/recipe", async (req: express.Request, res: express.Response) => {
    logger.info("recipe list", req.query);

    let result = await database.getRecipeList(
        req.query.user_id,
        req.query.recipe_name,
        req.query.tag,
        req.query.ingredient,
        req.query.sort
    );

    res.send(result);
});

chef_app.get("/recipe/detail", async (req: express.Request, res: express.Response) => {
    logger.info("recipe detail", req.query);

    let result = await database.getRecipeDetail(req.query.recipe_id);

    res.send(result);
});

chef_app.post("/recipe/create", async (req: express.Request, res: express.Response) => {
    logger.info("recipe create", req.body);

    let result = await database.createRecipe(
        req.body.user_id,
        req.body.recipe_name,
        req.body.recipe_img,
        req.body.contents,
        req.body.datetime,
        req.body.amount_time,
        req.body.ingredients,
        req.body.tags,
        req.body.phases
    );

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

chef_app.post("/recipe/update", async (req: express.Request, res: express.Response) => {
    logger.info("recipe update", req.body);

    let result = await database.updateRecipe(
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

chef_app.post("/recipe/delete", async (req: express.Request, res: express.Response) => {
    logger.info("recipe delete", req.body);

    let result = await database.deleteRecipe(req.body.recipe_id);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

chef_app.post("/recipe/like", async (req: express.Request, res: express.Response) => {
    logger.info("recipe like", req.body);

    let result = await database.setLikeRecipe(req.body.recipe_id, req.body.user_id, req.body.like);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

chef_app.post("/recipe/count", async (req: express.Request, res: express.Response) => {
    logger.info("recipe count", req.body);

    let result = await database.addCountRecipe(req.body.recipe_id);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

// ========= review
chef_app.get("/review", async (req: express.Request, res: express.Response) => {
    logger.info("review list", req.query);

    let result = await database.getReview(req.query.recipe_id);

    res.send(result);
});

chef_app.post("/review/create", async (req: express.Request, res: express.Response) => {
    logger.info("review create", req.body);

    let result = await database.createReview(
        req.body.recipe_id,
        req.body.user_id,
        req.body.contents,
        req.body.datetime,
        req.body.rating
    );

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

chef_app.post("/review/delete", async (req: express.Request, res: express.Response) => {
    logger.info("review delete", req.body);

    let result = await database.deleteReview(req.body.review_id);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});
