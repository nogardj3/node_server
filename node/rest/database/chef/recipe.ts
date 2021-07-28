import { logger } from "../../../logging";
import { Collection, Db, MongoClient } from "mongodb";

import { COLLECTION_USER } from "../../models/chef/user";
import { COLLECTION_RECIPE } from "../../models/chef/recipe";
import { COLLECTION_REVIEW } from "../../models/chef/review";

const DB_URL: string = "mongodb://localhost:27017";
const DB_NAME: string = "chef";

let user_collection: Collection;
let recipe_collection: Collection;
let review_collection: Collection;

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
        review_collection = mongo_db.collection(COLLECTION_REVIEW);

        logger.info("Recipe Database Initialized");
    } catch (error) {
        if (connection != null) {
            logger.error(error);
            connection.close();
        }
    }
};

export const getRecipeList = async (
    user_id?: any,
    recipe_name?: any,
    tag?: any,
    ingredient?: any,
    sort?: any
): Promise<object> => {
    let recipe_data;
    let query: any = {};
    if (user_id != undefined) {
        query = {
            $or: [{ user_id: user_id }, { likes: user_id }],
        };
    }
    if (recipe_name != undefined) query["recipe_name"] = recipe_name;
    if (tag != undefined) {
        query["tags"] = { $regex: tag };
    }
    if (ingredient != undefined) {
        query["ingredients"] = {
            $elemMatch: { name: { $regex: ingredient } },
        };
    }

    let _sort: any = {};
    if (sort != undefined) {
        if (sort == "popular") _sort["view_count"] = -1;
        else if (sort == "latest") _sort["datetime"] = -1;
    }

    recipe_data = (await recipe_collection
        .find(query, {
            projection: {
                _id: 0,
            },
        })
        .sort(_sort)
        .toArray()) as any;

    let res: object[] = [];
    try {
        for await (const ele of recipe_data) {
            let data = ele;
            let user_data = (await user_collection.findOne({
                user_id: ele.user_id,
            })) as any;

            data["nickname"] = user_data["nickname"];
            data["user_profile_img"] = user_data["user_profile_img"];

            let review_data = await review_collection.find({ recipe_id: ele.recipe_id }).toArray();
            console.log(review_data);
            let sum = 0;
            review_data.forEach((element) => {
                sum += element["rating"];
            });

            data["rating"] = review_data.length != 0 ? sum / review_data.length : 0;

            res.push(data);
        }

        if (res.length != 0 && sort == "rating")
            res.sort(function (a: any, b: any) {
                return a["rating"] > b["rating"] ? -1 : a["rating"] < b["rating"] ? 1 : 0;
            });
    } catch (error) {
        logger.error(error);
    }

    return Promise.resolve(res);
};

export const getRecipeDetail = async (recipe_id: any): Promise<object> => {
    let recipe_data = (await recipe_collection.findOne(
        {
            recipe_id: Number.parseInt(recipe_id),
        },
        {
            projection: {
                _id: 0,
            },
        }
    )) as any;

    try {
        let user_data = (await user_collection.findOne({
            user_id: recipe_data.user_id,
        })) as any;

        recipe_data["nickname"] = user_data["nickname"];
        recipe_data["user_profile_img"] = user_data["user_profile_img"];

        let review_data = await review_collection
            .find({ recipe_id: recipe_data.recipe_id })
            .toArray();
        console.log(review_data);
        let sum = 0;
        review_data.forEach((element) => {
            sum += element["rating"];
        });

        recipe_data["rating"] = review_data.length != 0 ? sum / review_data.length : 0;

        console.log(recipe_data);
    } catch (error) {
        logger.error("recipe_detail ", error);
    }

    console.log(recipe_data);

    return Promise.resolve(recipe_data);
};

export const createRecipe = async (
    user_id: any,
    recipe_name: any,
    recipe_img: any,
    contents: any,
    datetime: any,
    amount_time: any,
    ingredients: any,
    tags: any,
    phases: any
): Promise<string> => {
    let recipe_id = Math.floor(Math.random() * 1000 * 1000 * 1000);
    let res = (await recipe_collection.insertOne({
        recipe_id: recipe_id,
        user_id: user_id,
        recipe_name: recipe_name,
        recipe_img: recipe_img,
        contents: contents,
        datetime: Number.parseInt(datetime),
        amount_time: amount_time,
        view_count: 0,
        rating: 0,
        ingredients: ingredients,
        tags: tags,
        phase: phases,
    })) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? recipe_id.toString() : "ERROR");
};

export const updateRecipe = async (
    recipe_id: any,
    recipe_name: any,
    recipe_img: any,
    contents: any,
    amount_time: any,
    ingredients: any,
    tags: any,
    phases: any
): Promise<string> => {
    let res = (await recipe_collection.updateOne(
        {
            recipe_id: recipe_id,
        },
        {
            $set: {
                recipe_name: recipe_name,
                recipe_img: recipe_img,
                contents: contents,
                amount_time: amount_time,
                ingredients: ingredients,
                tags: tags,
                phase: phases,
            },
        }
    )) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};

export const deleteRecipe = async (recipe_id: any): Promise<string> => {
    let res = (await recipe_collection.deleteOne({
        recipe_id: Number.parseInt(recipe_id),
    })) as any;

    let res2 = (await review_collection.deleteMany({
        recipe_id: Number.parseInt(recipe_id),
    })) as any;
    console.log(res2.result);

    return Promise.resolve(res2.result.ok == 1 ? "OK" : "ERROR");
};

export const setLikeRecipe = async (recipe_id: any, user_id: any, like: any): Promise<string> => {
    let res;
    if (like == -1) {
        res = (await recipe_collection.updateOne(
            {
                recipe_id: Number.parseInt(recipe_id),
            },
            {
                $pull: {
                    likes: user_id,
                },
            }
        )) as any;
    } else {
        res = (await recipe_collection.updateOne(
            {
                recipe_id: Number.parseInt(recipe_id),
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

export const addCountRecipe = async (recipe_id: any): Promise<string> => {
    let res = (await recipe_collection.updateOne(
        {
            recipe_id: Number.parseInt(recipe_id),
        },
        {
            $inc: {
                view_count: 1,
            },
        }
    )) as any;
    console.log(res.result);

    return Promise.resolve(res.result.ok == 1 ? "OK" : "ERROR");
};

// ========= Review
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
    try {
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
                        user_profile_img: 1,
                    },
                }
            )) as any;

            item.nickname = user_data["nickname"];
            item.user_profile_img = user_data["user_profile_img"];

            res.push(item);
        }
    } catch (error) {
        logger.error(error);
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
