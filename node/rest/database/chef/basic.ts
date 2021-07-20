import { logger } from "../../../logging";
import { Collection, Db, MongoClient } from "mongodb";

import { COLLECTION_FAQ } from "../../models/chef/faq";
import { COLLECTION_NOTICE } from "../../models/chef/notice";
import { COLLECTION_USER, getInitialData } from "../../models/chef/user";
import { COLLECTION_POST } from "../../models/chef/post";
import { COLLECTION_COMMENT } from "../../models/chef/comment";
import { COLLECTION_RECIPE } from "../../models/chef/recipe";
import { COLLECTION_REVIEW } from "../../models/chef/review";

import * as post_db from "./post";
import * as recipe_db from "./recipe";
import * as user_db from "./user";

const DB_URL: string = "mongodb://localhost:27017";
const DB_NAME: string = "chef";

let faq_collection: Collection;
let notice_collection: Collection;
let user_collection: Collection;
let post_collection: Collection;
let comment_collection: Collection;
let recipe_collection: Collection;
let review_collection: Collection;

export const init_db = async () => {
    logger.info("initializing chef Database");
    let connection;
    try {
        connection = await MongoClient.connect(DB_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        let mongo_db: Db = await connection.db(DB_NAME);

        initializer(mongo_db);

        faq_collection = mongo_db.collection(COLLECTION_FAQ);
        notice_collection = mongo_db.collection(COLLECTION_NOTICE);
        user_collection = mongo_db.collection(COLLECTION_USER);
        post_collection = mongo_db.collection(COLLECTION_POST);
        comment_collection = mongo_db.collection(COLLECTION_COMMENT);
        review_collection = mongo_db.collection(COLLECTION_REVIEW);
        recipe_collection = mongo_db.collection(COLLECTION_RECIPE);

        post_db.init_db();
        recipe_db.init_db();
        user_db.init_db();

        logger.info("Database Chef Initialized");
    } catch (error) {
        if (connection != null) {
            logger.error(error);
            connection.close();
        }
    }
};

async function initializer(db: Db) {
    let collections: string[] = [
        COLLECTION_FAQ,
        COLLECTION_NOTICE,
        COLLECTION_USER,
        COLLECTION_POST,
        COLLECTION_COMMENT,
        COLLECTION_RECIPE,
        COLLECTION_REVIEW,
    ];
    db.listCollections().toArray((err, res) => {
        collections.forEach((element) => {
            let flag = false;
            res.forEach((ele2) => {
                if (ele2["name"] == element) {
                    flag = true;
                    return;
                }
            });

            if (!flag) db.createCollection(element);
        });
    });
}

export async function clearDB(collection_name: string): Promise<boolean> {
    let cleared = false;
    switch (collection_name) {
        case COLLECTION_FAQ:
            faq_collection.remove({});
            cleared = true;
        case COLLECTION_NOTICE:
            notice_collection.remove({});
            cleared = true;
    }

    if (cleared) return Promise.resolve(true);
    else return Promise.resolve(false);
}

// ========= Basic
export const getFAQ = async (): Promise<object[]> => {
    logger.info("getFAQ");

    return await faq_collection
        .find({})
        .project({
            _id: 0,
        })
        .toArray();
};

export const getNotice = async (): Promise<object[]> => {
    logger.info("getNotice");

    return await notice_collection
        .find({})
        .project({
            _id: 0,
        })
        .toArray();
};
