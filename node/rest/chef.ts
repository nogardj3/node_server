import express from "express";
import cors from "cors";
import { logger } from "../logging";
import * as util from "../util";
import { comment_app } from "./routes/chef/comment";
import { post_app } from "./routes/chef/post";
import { recipe_app } from "./routes/chef/recipe";
import { review_app } from "./routes/chef/review";
import { user_app } from "./routes/chef/user";
import * as database from "./database/chef/basic";

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

chef_app.use("/comment", comment_app);
chef_app.use("/post", post_app);
chef_app.use("/recipe", recipe_app);
chef_app.use("/review", review_app);
chef_app.use("/user", user_app);

chef_app.get("/alive", async (req: express.Request, res: express.Response) => {
    res.send({ message: "OK" });
});

chef_app.get("/faq", async (req: express.Request, res: express.Response) => {
    let data = await database.getFAQ();

    res.send(data);
});

chef_app.get("/notice", async (req: express.Request, res: express.Response) => {
    let data = await database.getNotice();

    res.send(data);
});

chef_app.get("/tos", async (req: express.Request, res: express.Response) => {
    res.send({ message: util.CHEF_TOS });
});

chef_app.post("/clear", async (req: express.Request, res: express.Response) => {
    logger.warn("CLEAR CALL");
    const pw: string = req.body.keyword as string;
    const collection_name: string = req.body.collection_name as string;

    if (pw != util.PREFERENCES.DB_CLEAR_KEYWORD) {
        logger.warn("UNAUTHORIZED");
        res.status(401).send("unauthorized");
    } else {
        let is_cleared = await database.clearDB(collection_name);
        if (is_cleared) {
            logger.warn(collection_name + "CLAERED !");
            res.send("ok");
        } else {
            logger.warn(collection_name + "CLAER FAILED");
            res.status(404).send("internal error");
        }
    }
});
