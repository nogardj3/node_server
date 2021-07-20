import { logger } from "../../../logging";
import { Collection, Db, MongoClient } from "mongodb";

import { COLLECTION_USER } from "../../models/chef/user";
import { COLLECTION_POST } from "../../models/chef/post";
import { COLLECTION_COMMENT } from "../../models/chef/comment";

const DB_URL: string = "mongodb://localhost:27017";
const DB_NAME: string = "chef";

let user_collection: Collection;
let post_collection: Collection;
let comment_collection: Collection;

export const init_db = async () => {
    let connection;
    try {
        connection = await MongoClient.connect(DB_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        let mongo_db: Db = await connection.db(DB_NAME);

        user_collection = mongo_db.collection(COLLECTION_USER);
        post_collection = mongo_db.collection(COLLECTION_POST);
        comment_collection = mongo_db.collection(COLLECTION_COMMENT);

        logger.info("Post Database Initialized");
    } catch (error) {
        if (connection != null) {
            logger.error(error);
            connection.close();
        }
    }
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
    else
        post_data = (await post_collection
            .find({})
            .sort({
                datetime: -1,
            })
            .toArray()) as any;

    let res: object[] = [];
    try {
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

            data["comments"] = await getComment(ele.post_id);
            res.push(data);
        }
    } catch (error) {
        logger.error(error);
    }

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

    try {
        let user_data = (await user_collection.findOne({
            user_id: post_data.user_id,
        })) as any;

        post_data["nickname"] = user_data["nickname"];
        post_data["profile_img_url"] = user_data["profile_img_url"];

        post_data["comments"] = await getComment(post_id);
    } catch (error) {
        logger.error("post_detail ", error);
    }

    console.log(post_data);

    return Promise.resolve(post_data);
};

export const setPostLike = async (user_id: any, post_id: any, like: any): Promise<string> => {
    let res;
    if (like == -1) {
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
        datetime: Number.parseInt(datetime),
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
    let changed_val: any = {
        contents: contents,
        datetime: Number.parseInt(datetime),
        tags: tags,
    };

    if (post_img != null) changed_val["post_img"] = post_img;

    let res = (await post_collection.updateOne(
        {
            post_id: Number.parseInt(post_id),
        },
        {
            $set: changed_val,
        }
    )) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};

export const deletePost = async (post_id: any): Promise<string> => {
    let res = (await post_collection.deleteOne({
        post_id: Number.parseInt(post_id),
    })) as any;

    let res2 = (await comment_collection.deleteMany({
        post_id: Number.parseInt(post_id),
    })) as any;
    console.log(res2.result);

    return Promise.resolve(res2.result.ok == 1 ? "OK" : "ERROR");
};

// ========= Comment
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
    try {
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
    } catch (error) {
        logger.error("comment list ", error);
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
