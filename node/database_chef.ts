import { logger } from "./logging";
import * as util from "./util";
import { Collection, Db, MongoClient } from "mongodb";
import axios from "axios";
import * as querystring from "querystring";
import moment from "moment";
import isEmpty from "is-empty";

import { COLLECTION_FAQ } from "./models/chef/faq";
import { COLLECTION_NOTICE } from "./models/chef/notice";

const DB_URL: string = "mongodb://localhost:27017";
const DB_NAME: string = "chef";

let faq_collection: Collection;
let notice_collection: Collection;

export const init_db = async () => {
    logger.info("initializing chef Database");
    let connection;
    try {
        connection = await MongoClient.connect(DB_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        logger.info("$$ Connected successfully to mongodb server : ", DB_NAME, __filename);
        let mongo_db: Db = await connection.db(DB_NAME);

        faq_collection = mongo_db.collection(COLLECTION_FAQ);
        notice_collection = mongo_db.collection(COLLECTION_NOTICE);

        initializer(mongo_db);
        // mongo_db.createCollection(COLLECTION_NOTICE);
    } catch (error) {
        if (connection != null) {
            logger.error(error);
            connection.close();
        }
    }
};

function initializer(db: Db) {
    // db.createCollection(COLLECTION_FAQ);
    // db.createCollection(COLLECTION_NOTICE);
    // let faqs: object[] = [];
    // for (let i = 1; i <= 10; i++) {
    //     faqs.push({
    //         title: "FAQ Title " + i,
    //         contents: "FAQ Contents " + i,
    //     });
    // }
    // faq_collection.insertMany(faqs);
    // let notices: object[] = [];
    // for (let i = 1; i <= 10; i++) {
    //     notices.push({
    //         title: "Notice Title " + i,
    //         contents: "Notice Contents " + i,
    //         dateTime: Date.now(),
    //     });
    // }
    // notice_collection.insertMany(notices);
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
