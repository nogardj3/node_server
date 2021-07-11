import { logger } from "./logging";
import { Collection, Db, MongoClient } from "mongodb";

import { COLLECTION_FAQ } from "./models/chef/faq";
import { COLLECTION_NOTICE } from "./models/chef/notice";
import { COLLECTION_USER, getInitialData } from "./models/chef/user";
import { COLLECTION_COMMENT } from "./models/chef/comment";
import { COLLECTION_POST } from "./models/chef/post";
import { COLLECTION_REVIEW } from "./models/chef/review";

const DB_URL: string = "mongodb://localhost:27017";
const DB_NAME: string = "chef";

let faq_collection: Collection;
let notice_collection: Collection;
let user_collection: Collection;
let post_collection: Collection;
let comment_collection: Collection;
let review_collection: Collection;

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
        post_collection = mongo_db.collection(COLLECTION_POST);
        comment_collection = mongo_db.collection(COLLECTION_COMMENT);
        review_collection = mongo_db.collection(COLLECTION_REVIEW);
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

export const getUserList = async (nickname?: any): Promise<object> => {
    let query: any;
    if (nickname != undefined) query["nickname"] = nickname;
    let res = (await user_collection
        .find(query, {
            projection: {
                _id: 0,
            },
        })
        .sort({
            datetime: 1,
        })
        .toArray()) as any;

    console.log(res);

    return Promise.resolve(res);
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

export const getPostList = async (user_id?: any, nickname?: any): Promise<object> => {
    let post_data;
    if (user_id != undefined)
        post_data = (await post_collection
            .find(
                {
                    user_id: user_id,
                },
                {
                    projection: {
                        _id: 0,
                    },
                }
            )
            .sort({
                datetime: -1,
            })
            .toArray()) as any;
    else post_data = (await post_collection.find({}).toArray()) as any;

    console.log(post_data);
    let res: object[] = [];
    for await (const ele of post_data) {
        let data = ele;
        let user_data = (await user_collection.findOne({
            user_id: ele.user_id,
        })) as any;

        console.log(user_data);
        if (nickname != undefined && nickname != user_data["nickname"]) continue;
        else {
            data["nickname"] = user_data["nickname"];
            data["profile_img_url"] = user_data["profile_img_url"];
        }

        let comment_data = (await comment_collection.findOne({
            post_id: ele.post_id,
        })) as any;

        data["comments"] = comment_data;
        res.push(data);
    }

    console.log(res);

    return Promise.resolve(res);
};

export const getPostDetail = async (post_id: any): Promise<object> => {
    let post_data = (await post_collection.findOne(
        {
            post_id: Number.parseInt(post_id),
        },
        {
            projection: {
                _id: 0,
            },
        }
    )) as any;

    let res: object[] = [];
    for await (const ele of post_data) {
        let data = ele;
        let user_data = (await user_collection.find({
            user_id: ele.user_id,
        })) as any;

        data["nickname"] = user_data["nickname"];
        data["profile_img_url"] = user_data["profile_img_url"];
    }

    console.log(res);

    return Promise.resolve(res);
};

export const setPostLike = async (user_id: any, post_id: any, like: any): Promise<string> => {
    let res;
    if (like == 0) {
        res = (await post_collection.updateOne(
            {
                post_id: Number.parseInt(post_id),
            },
            {
                $pull: {
                    likes: user_id,
                },
            }
        )) as any;
    } else {
        res = (await post_collection.updateOne(
            {
                post_id: Number.parseInt(post_id),
            },
            {
                $addToSet: {
                    likes: user_id,
                },
            }
        )) as any;
    }

    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};

export const createPost = async (
    user_id: any,
    post_img: any,
    contents: any,
    datetime: any,
    tags: any
): Promise<string> => {
    let res = (await post_collection.insertOne({
        post_id: Math.floor(Math.random() * 1000 * 1000 * 1000),
        user_id: user_id,
        post_img: post_img,
        contents: contents,
        datetime: datetime,
        tags: tags,
        comments: [],
        likes: [],
    })) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};

export const updatePost = async (
    post_id: any,
    post_img: any,
    contents: any,
    datetime: any,
    tags: any
): Promise<string> => {
    let res = (await post_collection.updateOne(
        {
            post_id: post_id,
        },
        {
            post_img: post_img,
            contents: contents,
            datetime: datetime,
            tags: tags,
        }
    )) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};

export const deletePost = async (post_id: any): Promise<string> => {
    let res = (await post_collection.deleteOne({
        post_id: Number.parseInt(post_id),
    })) as any;
    console.log(res.result);

    let res2 = (await comment_collection.deleteMany({
        post_id: Number.parseInt(post_id),
    })) as any;
    console.log(res2.result);

    return Promise.resolve(res2.result.ok == 1 ? "OK" : "ERROR");
};

export const getComment = async (post_id: any): Promise<object> => {
    let comment_data = await comment_collection
        .find({
            post_id: Number.parseInt(post_id),
        })
        .project({ _id: 0 })
        .sort({
            datetime: -1,
        })
        .toArray();

    let res: object[] = [];
    for await (const ele of comment_data) {
        let item = ele;

        let user_data = (await user_collection.findOne(
            {
                user_id: ele.user_id,
            },
            {
                projection: {
                    _id: 0,
                    nickname: 1,
                    profile_img_url: 1,
                },
            }
        )) as any;

        item.nickname = user_data["nickname"];
        item.profile_img_url = user_data["profile_img_url"];

        res.push(item);
    }

    return Promise.resolve(res);
};

export const createComment = async (
    post_id: any,
    user_id: any,
    contents: any,
    datetime: any
): Promise<string> => {
    let res = (await comment_collection.insertOne({
        comment_id: Math.floor(Math.random() * 1000 * 1000 * 1000),
        post_id: Number.parseInt(post_id),
        user_id: user_id,
        contents: contents,
        datetime: Number.parseInt(datetime),
    })) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};

export const deleteComment = async (comment_id: any): Promise<string> => {
    let res = (await comment_collection.deleteOne({
        comment_id: Number.parseInt(comment_id),
    })) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};

export const getReview = async (recipe_id: any): Promise<object> => {
    let review_data = await review_collection
        .find({
            recipe_id: Number.parseInt(recipe_id),
        })
        .project({ _id: 0 })
        .sort({
            datetime: -1,
        })
        .toArray();

    let res: object[] = [];
    for await (const ele of review_data) {
        let item = ele;

        let user_data = (await user_collection.findOne(
            {
                user_id: ele.user_id,
            },
            {
                projection: {
                    _id: 0,
                    nickname: 1,
                    profile_img_url: 1,
                },
            }
        )) as any;

        item.nickname = user_data["nickname"];
        item.profile_img_url = user_data["profile_img_url"];

        res.push(item);
    }

    return Promise.resolve(res);
};

export const createReview = async (
    recipe_id: any,
    user_id: any,
    contents: any,
    datetime: any,
    rating: any
): Promise<string> => {
    let res = (await review_collection.insertOne({
        review_id: Math.floor(Math.random() * 1000 * 1000 * 1000),
        recipe_id: Number.parseInt(recipe_id),
        user_id: user_id,
        contents: contents,
        datetime: Number.parseInt(datetime),
        rating: Number.parseInt(rating),
    })) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};

export const deleteReview = async (review_id: any): Promise<string> => {
    let res = (await review_collection.deleteOne({
        review_id: Number.parseInt(review_id),
    })) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};
