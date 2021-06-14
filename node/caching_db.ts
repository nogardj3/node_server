import { logger } from "./logging";
import * as util from "./util";
import { MongoClient } from "mongodb";

let mongo_db;

const DB_URL: string = "mongodb://localhost:27017";
const DB_NAME: string = "caching_db";
const DB_COLLECTION_CORONA_STATE: string = "corona_state";
const DB_COLLECTION_NEWS: string = "news";
const DB_COLLECTION_VACCINE: string = "vaccine";
const DB_COLLECTION_QR: string = "qr";
const DB_COLLECTION_WEATHER: string = "weather";

export const init_db = () => {
    logger.info("initializing Database");
    MongoClient.connect(
        DB_URL,
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        },
        function (err: Error, client: any) {
            console.log(
                "$$ Connected successfully to mongodb server : ",
                __filename
            );
            mongo_db = client.db(DB_NAME);
        }
    );
};

export const getCachedState = (sentence: string) => {
    console.log(sentence);
};

export const cachingState = (sentence: string) => {
    console.log(sentence);
};

export const getCachedNews = (sentence: string) => {
    console.log(sentence);
};

export const cachingNews = (sentence: string) => {
    console.log(sentence);
};

export const getCachedCorona = (sentence: string) => {
    console.log(sentence);
};

export const cachingCorona = (sentence: string) => {
    console.log(sentence);
};

export const getCachedWeather = (sentence: string) => {
    console.log(sentence);
};

export const cachingWeather = (sentence: string) => {
    console.log(sentence);
};
