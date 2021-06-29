import { logger } from "./logging";
import * as util from "./util";
import { Collection, Db, MongoClient, MongoError } from "mongodb";
import axios from "axios";
import * as querystring from "querystring";
import moment from "moment";

const DB_URL: string = "mongodb://localhost:27017";
const DB_NAME: string = "corona_db";

const DB_COLLECTION_METADATA: string = "metadata";
const DB_COLLECTION_WEATHER: string = "weather";
const DB_COLLECTION_NEWS: string = "news";
const DB_COLLECTION_CORONA_STATE: string = "corona_state";
const DB_COLLECTION_CORONA_CITY: string = "corona_city";
const DB_COLLECTION_CORONA_VACCINE: string = "corona_vaccine";

const COLLECTION_UPDATE_INTERVAL = 60 * 1000;

let data_collection: Collection;
let weather_collection: Collection;
let news_collection: Collection;
let corona_state_collection: Collection;
let corona_city_collection: Collection;
let corona_vaccine_collection: Collection;

export const init_db = async () => {
    logger.info("initializing Database");
    let connection;
    try {
        connection = await MongoClient.connect(DB_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log(
            "$$ Connected successfully to mongodb server : ",
            __filename
        );
        let mongo_db: Db = await connection.db(DB_NAME);

        data_collection = mongo_db.collection(DB_COLLECTION_METADATA);
        weather_collection = mongo_db.collection(DB_COLLECTION_WEATHER);
        news_collection = mongo_db.collection(DB_COLLECTION_NEWS);
        corona_state_collection = mongo_db.collection(
            DB_COLLECTION_CORONA_STATE
        );
        corona_city_collection = mongo_db.collection(DB_COLLECTION_CORONA_CITY);
        corona_vaccine_collection = mongo_db.collection(
            DB_COLLECTION_CORONA_VACCINE
        );
    } catch (error) {
        if (connection != null) connection.close();
    }
};

//TODO error 처리
async function data_update(param: string, data: number) {
    let metadata = await data_collection.findOne({});
    metadata[param] = data;
    await data_collection.updateOne(
        { name: "metadata" },
        {
            $set: {
                [param]: data,
            },
        },
        {
            upsert: true,
        }
    );
}

//TODO func 완성
//TODO error 처리
async function data_get_update_time(param: string): Promise<number> {
    try {
        let doc = await data_collection.findOne({});
        return Promise.resolve(doc[param]);
    } catch (err) {
        console.log(err);
        logger.error("MONGODB error");
        return Promise.resolve(0);
    }
}

//TODO class 완성
export class weatherItem {
    name?: string;
    weather?: string;
    temperature?: string;
    humidity?: string;
    time?: number;
}

export class newsItem {
    title: string;
    originallink: string;
    link: string;
    description: string;
    pubDate: string;
}

//TODO class 완성
export class coronaStateItem {
    city?: string;
    peoples?: number;
    time?: number;
}

//TODO class 완성
export class coronaCityItem {
    city?: string;
    peoples?: number;
    time?: number;
}

//TODO class 완성
export class coronaVaccineItem {
    address: string;
    centerName: string;
    centerType: string;
    facilityName: string;
    lat: number;
    lng: number;
    phoneNumber: string;
    sido: string;
    sigungu: string;
}

//TODO async await, error 처리
//주요 도시들만 가져온다
//query sort by last_update_time desc, query cities find -> return
export const getCachedWeather = async (
    cities: string[]
): Promise<weatherItem[]> => {
    console.log("getCachedWeather");
    console.log(cities);

    let weathers: weatherItem[] = [];
    let update_time = await data_get_update_time("weather_last_update");
    if ((update_time as number) + COLLECTION_UPDATE_INTERVAL < Date.now()) {
        await cachingWeather();
    }

    // weathers = await weather_collection.find({
    //     city: { $in: cities },
    // }).toArray();
    weathers = await weather_collection.find({}).toArray();
    return Promise.resolve(weathers);
};

//TODO async await, error 처리
const cachingWeather = async () => {
    console.log("cachingWeather");

    let api_url =
        util.PREFERENCES.URL_WEATHER +
        querystring.stringify({
            ServiceKey: util.PREFERENCES.KEY_WEATHER,
            pageNo: 1,
            numOfRows: 10,
            dataType: "json",
            base_date: moment().format("YYYYMMDD"),
            base_time: "0600",
            nx: 18,
            ny: 1,
        });

    console.log(api_url);
    await axios.get(api_url).then(async (resp) => {
        let data = resp.data.response.body.items.item;
        let update_time = Date.now();

        data.forEach((element: any) => {
            element.last_update_time = update_time;
        });

        await weather_collection.insertMany(data);
        await data_update("weather_last_update", update_time);
    });
};

//TODO async await, error 처리
//page sort by last_update_time desc, query page, pages, 끊어서 find -> return
export const getCachedNews = async (
    page: number,
    pages: number
): Promise<newsItem[]> => {
    console.log("getCachedNews");
    let news: newsItem[] = [];

    let update_time = await data_get_update_time("news_last_update");
    if ((update_time as number) + COLLECTION_UPDATE_INTERVAL < Date.now()) {
        await cachingNews();
    }

    // news = await news_collection.find({
    //     city: { $in: cities },
    // }).toArray();
    news = await news_collection.find({}).toArray();
    return Promise.resolve(news);
};

//TODO async await, error 처리
//db insert + update time 추가해서 넣기
//100개? 200개?
const cachingNews = async () => {
    console.log("cachingNews");

    let api_url =
        util.PREFERENCES.URL_NEWS +
        querystring.stringify({
            query: "코로나",
            display: 100,
            sort: "sim",
        });

    await axios
        .get(api_url, {
            headers: {
                "X-Naver-Client-Id": util.PREFERENCES.KEY_NAVER_CLIENT_ID,
                "X-Naver-Client-Secret":
                    util.PREFERENCES.KEY_NAVER_CLIENT_SECRET,
            },
        })
        .then(async (resp) => {
            let data = resp.data.items;
            let update_time = Date.now();

            data.forEach((element: any) => {
                element.last_update_time = update_time;
            });
            await news_collection.insertMany(data);
            await data_update("news_last_update", update_time);
        });
};

//TODO async await, error 처리
//query sort by last_update_time desc find -> return
export const getCachedCoronaState = async (): Promise<coronaStateItem[]> => {
    console.log("getCachedCoronaState");
    let corona_states: coronaStateItem[] = [];

    let update_time = await data_get_update_time("corona_state_last_update");
    if ((update_time as number) + COLLECTION_UPDATE_INTERVAL < Date.now()) {
        await cachingCoronaState();
    }

    await cachingCoronaState();

    corona_states = await corona_state_collection.find({}).toArray();
    return Promise.resolve(corona_states);
};

//TODO async await, error 처리
// api request, response 명세
const cachingCoronaState = async () => {
    console.log("cachingCoronaState");

    var api_url =
        util.PREFERENCES.URL_CORONA_STATE +
        querystring.stringify({
            ServiceKey: util.PREFERENCES.KEY_CORONA_STATE,
            pageNo: 1,
            numOfRows: 100, //TODO
            startCreateDt: moment().format("YYYYMMDD"),
            endCreateDt: moment().format("YYYYMMDD"),
        });

    await axios.get(api_url).then(async (resp) => {
        let data = resp.data.response.body.items.item;
        let update_time = Date.now();
        data.last_update_time = update_time;

        await corona_state_collection.insertOne(data);
        await data_update("corona_state_last_update", update_time);
    });
};

//TODO async await, error 처리
//query sort by last_update_time desc, query cities find -> return
export const getCachedCoronaCity = async (
    cities: string[]
): Promise<coronaCityItem[]> => {
    console.log("getCachedCoronaCity");
    console.log(cities);

    let corona_cities: coronaCityItem[] = [];

    let update_time = await data_get_update_time("corona_city_last_update");
    if ((update_time as number) + COLLECTION_UPDATE_INTERVAL < Date.now()) {
        await cachingCoronaCity();
    }

    // corona_cities = await weather_collection.find({
    //     city: { $in: cities },
    // }).toArray();
    corona_cities = await corona_city_collection.find({}).toArray();
    return Promise.resolve(corona_cities);
};

//TODO async await, error 처리
// api request, response 명세
const cachingCoronaCity = async () => {
    console.log("cachingCoronaCity");

    var api_url =
        util.PREFERENCES.URL_CORONA_CITY +
        querystring.stringify({
            ServiceKey: util.PREFERENCES.KEY_CORONA_CITY, //TODO
            pageNo: 1,
            numOfRows: 10, //TODO
            startCreateDt: "20210624", //TODO
            endCreateDt: "20210624", //TODO
        });

    await axios.get(api_url).then(async (resp) => {
        let data = resp.data.response.body.items.item;
        let update_time = Date.now();

        data.forEach((element: any) => {
            element.last_update_time = update_time;
        });

        await corona_city_collection.insertMany(data);
        await data_update("corona_city_last_update", update_time);
    });
};

//TODO async await, error 처리
//query sort by last_update_time desc, query cities find -> return
export const getCachedCoronaVaccine = async (
    cities: string[]
): Promise<coronaVaccineItem[]> => {
    console.log("getCachedCoronaVaccine");
    console.log(cities);

    let corona_vaccines: coronaVaccineItem[] = [];

    let update_time = await data_get_update_time("corona_vaccine_last_update");

    if ((update_time as number) + COLLECTION_UPDATE_INTERVAL < Date.now()) {
        await cachingCoronaVaccine();
    }

    await cachingCoronaVaccine();

    // corona_vaccines = await corona_vaccine_collection.find({
    //     city: { $in: cities },
    // }).toArray();
    corona_vaccines = await corona_vaccine_collection.find({}).toArray();

    return Promise.resolve(corona_vaccines);
};

//TODO async await, error 처리
const cachingCoronaVaccine = async () => {
    console.log("cachingCoronaVaccine");

    var api_url =
        util.PREFERENCES.URL_CORONA_VACCINE +
        querystring.stringify({
            page: 1,
            perPage: 500,
            returnType: "json",
            serviceKey: util.PREFERENCES.KEY_CORONA_VACCINE,
        });

    await axios.get(api_url).then(async (resp) => {
        let data = resp.data.data;
        let update_time = Date.now();

        data.forEach((element: any) => {
            element.last_update_time = update_time;
        });

        await corona_vaccine_collection.insertMany(data);
        await data_update("corona_vaccine_last_update", update_time);
    });
};
