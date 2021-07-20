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

    let result = await recipe_db.createRecipe(
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
