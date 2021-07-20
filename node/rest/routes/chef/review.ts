import express from "express";
import cors from "cors";
import { logger } from "../../../logging";
import * as util from "../../../util";
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

review_app.post("/create", async (req: express.Request, res: express.Response) => {
    logger.info("review create", req.body);

    let result = await recipe_db.createReview(
        req.body.recipe_id,
        req.body.user_id,
        req.body.contents,
        req.body.datetime,
        req.body.rating
    );

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
