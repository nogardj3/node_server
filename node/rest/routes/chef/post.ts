import express from "express";
import cors from "cors";
import { logger } from "../../../logging";
import * as util from "../../../util";
import * as post_db from "../../database/chef/post";

class App {
    public application: express.Application;

    constructor() {
        this.application = express();
    }
}

export const post_app = new App().application;
post_app.use(cors());
post_app.use(express.json());
post_app.use(express.urlencoded({ extended: false }));

post_app.get("/detail", async (req: express.Request, res: express.Response) => {
    logger.info("post detail", req.query);

    let result = await post_db.getPostDetail(req.query.post_id);

    res.send(result);
});

post_app.post("/like", async (req: express.Request, res: express.Response) => {
    logger.info("post like toggle", req.body);

    let result = await post_db.setPostLike(req.body.user_id, req.body.post_id, req.body.like);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

post_app.post("/create", async (req: express.Request, res: express.Response) => {
    logger.info("post create", req.body);

    let tags: String[] = [];
    if (typeof req.body.tags == "string") {
        tags.push(req.body.tags);
    } else tags = req.body.tags;
    let result = await post_db.createPost(
        req.body.user_id,
        req.body.post_img,
        req.body.contents,
        req.body.datetime,
        tags
    );

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

post_app.post("/update", async (req: express.Request, res: express.Response) => {
    logger.info("post update", req.body);

    let tags: String[] = [];
    if (typeof req.body.tags == "string") {
        tags.push(req.body.tags);
    } else tags = req.body.tags;
    let result = await post_db.updatePost(
        req.body.post_id,
        req.body.post_img,
        req.body.contents,
        req.body.datetime,
        tags
    );

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

post_app.post("/delete", async (req: express.Request, res: express.Response) => {
    logger.info("post delete", req.body);

    let result = await post_db.deletePost(req.body.post_id);

    if (result == "OK") res.send(result);
    else res.status(500).send(result);
});

post_app.get("/*", async (req: express.Request, res: express.Response) => {
    logger.info("post list", req.query);

    let result = await post_db.getPostList(req.query.user_id, req.query.nickname);

    res.send(result);
});
