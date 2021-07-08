import { logger } from "./logging";
import * as util from "./util";
import { Collection, Db, MongoClient } from "mongodb";
import axios from "axios";
import * as querystring from "querystring";
import moment from "moment";
import isEmpty from "is-empty";

import { COLLECTION_FAQ } from "./models/chef/faq";
import { COLLECTION_NOTICE } from "./models/chef/notice";
import { COLLECTION_USER, getInitialData } from "./models/chef/user";
import e from "express";

const DB_URL: string = "mongodb://localhost:27017";
const DB_NAME: string = "chef";

let faq_collection: Collection;
let notice_collection: Collection;
let user_collection: Collection;

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

        initializer(mongo_db);

        faq_collection = mongo_db.collection(COLLECTION_FAQ);
        notice_collection = mongo_db.collection(COLLECTION_NOTICE);
        user_collection = mongo_db.collection(COLLECTION_USER);

        // mongo_db.createCollection(COLLECTION_NOTICE);
    } catch (error) {
        if (connection != null) {
            logger.error(error);
            connection.close();
        }
    }
};

async function initializer(db: Db) {
    let collections: string[] = [COLLECTION_FAQ, COLLECTION_NOTICE, COLLECTION_USER];
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

export const checkUserInfo = async (user_token: string, user_id: string): Promise<object> => {
    logger.info("checkUserInfo", user_token, user_id);

    return await user_collection
        .findOneAndUpdate(
            {
                user_id: user_id,
            },
            { $set: { user_token: user_token } },
            {
                returnDocument: "after",
            }
        )
        .then((data) => {
            return Promise.resolve(data);
        })
        .catch((err) => {
            logger.error("MONGODB error", err);
            return Promise.reject(404);
        });
};

export const createUser = async (userInfo: any): Promise<object> => {
    logger.info("createUser", userInfo);

    let check_exist_nick = await user_collection.findOne(
        { nickname: userInfo["nickname"] },
        {
            projection: {
                _id: 0,
            },
        }
    );

    if (check_exist_nick == null) {
        let initial_data = getInitialData(
            userInfo["user_token"],
            userInfo["user_id"],
            userInfo["nickname"]
        );
        return user_collection.insertOne(initial_data).then((data) => {
            return Promise.resolve(initial_data);
        });
    } else return Promise.resolve({});
};

export const getFollower = async (user_id: any, target_id: any): Promise<object> => {
    let data: any = await user_collection.findOne({
        user_id: target_id,
    });

    console.log(data);

    let followers_with_data = await user_collection
        .find({
            user_id: { $in: data["follow"] },
        })
        .project({ _id: 0, user_id: 1, profile_img_url: 1, nickname: 1, follow: 1 })
        .toArray();

    console.log(followers_with_data);
    let res: object[] = [];

    followers_with_data.forEach((ele: any) => {
        let data = ele;

        if (ele.user_id != user_id) {
            let follow: string[] = ele.follow as string[];

            console.log(follow);

            if (follow.includes(user_id)) data["is_follow"] = 1;
            else data["is_follow"] = 0;

            delete data["follow"];

            res.push(data);
        }
    });

    return Promise.resolve(res);
};

export const getFollowing = async (user_id: any, target_id: any): Promise<object> => {
    let data = await user_collection
        .find({
            follow: target_id,
        })
        .project({ _id: 0, user_id: 1, profile_img_url: 1, nickname: 1, follow: 1 })
        .toArray();

    let res: object[] = [];

    data.forEach((ele: any) => {
        let data = ele;

        if (ele.user_id != user_id) {
            let follow: string[] = ele.follow as string[];

            console.log(ele, ele.follow);

            if (follow.includes(user_id)) data["is_follow"] = 1;
            else data["is_follow"] = 0;

            delete data["follow"];

            res.push(data);
        }
    });

    return Promise.resolve(res);
};
