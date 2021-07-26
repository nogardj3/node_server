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

post_app.post("/like", async (req: express.Request, res: express.Response) => {
    logger.info("post like toggle", req.body);

    let result = await post_db.setPostLike(req.body.user_id, req.body.post_id, req.body.like);

    if (result == "OK") res.send({ ok: result });
    else res.status(500).send({ ok: result });
});

post_app.get("/detail", async (req: express.Request, res: express.Response) => {
    logger.info("post detail", req.query);

    let result = await post_db.getPostDetail(req.query.post_id);

    res.send(result);
});

post_app.get("/*", async (req: express.Request, res: express.Response) => {
    logger.info("post list", req.query);

    let result = await post_db.getPostList(req.query.user_id, req.query.nickname);

    res.send(result);
});

/**
 * @swagger
 * paths:
 *   /chef/post/create:
 *     post:
 *       description: Post 생성
 *       summary: Post 생성
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
 *   /chef/post/update:
 *     post:
 *       description: Post 업데이트
 *       summary: Post 업데이트
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
 *   /chef/post/delete:
 *     post:
 *       description: Post 삭제
 *       summary: Post 삭제
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
 *   /chef/post/like:
 *     post:
 *       description: Post 좋아요
 *       summary: Post 좋아요
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
 *                 post_id:
 *                   type: string
 *                   description: post_id
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
 *   /chef/post/detail:
 *     get:
 *       description: Post 상세정보
 *       summary: Post 상세정보
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: post_id
 *           in: query
 *           description: 조회할 post id
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
 *   /chef/post/:
 *     get:
 *       description: Post 조회
 *       summary: Post 조회
 *       tags: [Chef]
 *       produces:
 *         - application/json
 *       parameters:
 *         - name: user_id
 *           in: query
 *           description: Post - user_id로 조회
 *           schema:
 *             type: string
 *         - name: nickname
 *           in: query
 *           description: Post - nickname으로 조회
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
