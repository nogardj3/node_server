import { logger } from "../../../logging";
import { Collection, Db, MongoClient } from "mongodb";

import { COLLECTION_USER, getInitialData } from "../../models/chef/user";
import { COLLECTION_RECIPE } from "../../models/chef/recipe";

const DB_URL: string = "mongodb://localhost:27017";
const DB_NAME: string = "chef";

let user_collection: Collection;
let recipe_collection: Collection;

export const init_db = async () => {
    let connection;
    try {
        connection = await MongoClient.connect(DB_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        let mongo_db: Db = await connection.db(DB_NAME);

        user_collection = mongo_db.collection(COLLECTION_USER);
        recipe_collection = mongo_db.collection(COLLECTION_RECIPE);

        logger.info("User Database Initialized");
    } catch (error) {
        if (connection != null) {
            logger.error(error);
            connection.close();
        }
    }
};

export const getUserList = async (nickname?: any): Promise<object> => {
    let query: any = {};
    if (nickname != undefined) query["nickname"] = { $regex: nickname };
    let res = (await user_collection
        .find(query, {
            projection: {
                _id: 0,
            },
        })
        .sort({
            datetime: 1,
        })
        .toArray()) as any[];

    if (res.length != 0) {
        for (let i = 0; i < res.length; i++) {
            let follower_count = await user_collection
                .find({
                    follow: res[i]["user_id"],
                })
                .toArray();

            res[i]["follower_count"] = follower_count.length;
        }
    }

    return Promise.resolve(res);
};

export const getUserDetail = async (user_id?: any): Promise<object> => {
    let res = (await user_collection.findOne(
        {
            user_id: user_id,
        },
        {
            projection: {
                _id: 0,
            },
        }
    )) as any;

    let recipe_count = await recipe_collection
        .find({
            $or: [{ user_id: user_id }, { likes: user_id }],
        })
        .toArray();
    res["recipe_count"] = recipe_count.length;
    let follower_count = await user_collection
        .find({
            follow: user_id,
        })
        .toArray();
    res["follower_count"] = follower_count.length;
    res["following_count"] = (res["follow"] as string[]).length;

    return Promise.resolve(res);
};

export const checkNickname = async (nickname: string): Promise<number> => {
    logger.info("checkUserInfo", nickname);

    let res = (await user_collection
        .find({
            nickname: nickname,
        })
        .toArray()) as object[];

    return Promise.resolve(res.length);
};

export const checkUserInfo = async (
    user_token: string,
    user_fcm_token: string,
    user_id: string
): Promise<object> => {
    logger.info("checkUserInfo", user_token, user_fcm_token, user_id);

    let res = await user_collection.findOneAndUpdate(
        {
            user_id: user_id,
        },
        {
            $set: {
                user_token: user_token,
                user_fcm_token: user_fcm_token,
            },
        },
        {
            returnDocument: "after",
        }
    );
    return Promise.resolve(res);
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
            userInfo["user_fcm_token"],
            userInfo["user_id"],
            userInfo["nickname"]
        );
        let res = await user_collection.insertOne(initial_data);

        return Promise.resolve(initial_data);
    } else return Promise.resolve({});
};

export const updateUser = async (
    user_id: any,
    user_img: any,
    nickname: any,
    bio: any
): Promise<string> => {
    let changed_val: any = {
        nickname: nickname,
        bio: bio,
    };

    if (user_img != null) changed_val["user_profile_img"] = user_img;

    let res = (await user_collection.updateOne(
        {
            user_id: user_id,
        },
        {
            $set: changed_val,
        }
    )) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};

export const getFollowing = async (target_id: any): Promise<object> => {
    let data: any = await user_collection.findOne({
        user_id: target_id,
    });

    let res = await user_collection
        .find({
            user_id: { $in: data["follow"] },
        })
        .project({ _id: 0, user_id: 1, user_profile_img: 1, nickname: 1, follow: 1 })
        .toArray();

    if (res.length != 0) {
        for (let i = 0; i < res.length; i++) {
            let follower_count = await user_collection
                .find({
                    follow: res[i]["user_id"],
                })
                .toArray();

            res[i]["follower_count"] = follower_count.length;
        }
    }

    return Promise.resolve(res);
};

export const getFollower = async (target_id: any): Promise<object> => {
    let res = await user_collection
        .find({
            follow: target_id,
        })
        .project({
            _id: 0,
            user_id: 1,
            user_profile_img: 1,
            nickname: 1,
            follow: 1,
            user_fcm_token: 1,
        })
        .toArray();

    if (res.length != 0) {
        for (let i = 0; i < res.length; i++) {
            let follower_count = await user_collection
                .find({
                    follow: res[i]["user_id"],
                })
                .toArray();

            res[i]["follower_count"] = follower_count.length;
        }
    }

    return Promise.resolve(res);
};

export const subscribeUser = async (user_id: any, target_id: any): Promise<string> => {
    let res = (await user_collection.updateOne(
        {
            user_id: user_id,
        },
        {
            $addToSet: {
                follow: target_id,
            },
        }
    )) as any;

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};

export const unsubscribeUser = async (user_id: any, target_id: any): Promise<string> => {
    let res = (await user_collection.updateOne(
        {
            user_id: user_id,
        },
        {
            $pull: {
                follow: target_id,
            },
        }
    )) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};
