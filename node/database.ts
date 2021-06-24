import { logger } from "./logging";
import * as util from "./util";
import { Collection, Db, MongoClient, MongoError } from "mongodb";
import axios from "axios";
import * as querystring from "querystring";

const DB_URL: string = "mongodb://localhost:27017";
const DB_NAME: string = "corona_db";

const DB_COLLECTION_METADATA: string = "metadata";
const DB_COLLECTION_WEATHER: string = "weather";
const DB_COLLECTION_NEWS: string = "news";
const DB_COLLECTION_CORONA_STATE: string = "corona_state";
const DB_COLLECTION_CORONA_CITY: string = "vaccine";
const DB_COLLECTION_CORONA_VACCINE: string = "vaccine";

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

async function data_update(param: string) {
    // let update_param: object = {};
    // update_param[param] = Date.now();

    data_collection.update(
        { name: "metadata" },
        {
            [param]: Date.now(),
        },
        {
            upsert: true,
        }
    );
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
    city?: string;
    peoples?: number;
    time?: number;
}

//TODO async await 동기 처리
export const getCachedWeather = async (
    cities: string[]
): Promise<weatherItem[]> => {
    console.log("getCachedWeather");
    console.log(cities);

    let weathers: weatherItem[] = [];

    try {
        let data = await data_collection.findOne({});
        if (
            (data.weather_last_update as number) + COLLECTION_UPDATE_INTERVAL >
            Date.now()
        ) {
            await cachingWeather();
        }
        let weathers = await weather_collection.find({
            city: { $in: cities },
        });
    } catch (err) {
        logger.error("MONGODB error");
    } finally {
        return Promise.resolve(weathers);
    }
};

//TODO async await 동기 처리
export const getCachedNews = async (): Promise<newsItem[]> => {
    console.log("getCachedNews");
    let news: newsItem[] = [];

    try {
        let data = await data_collection.findOne({});
        if (
            (data.news_last_update as number) + COLLECTION_UPDATE_INTERVAL <
            Date.now()
        ) {
            await cachingNews();
        }
        let news = await news_collection.find({}).toArray();
        console.log(news);
        return Promise.resolve(news);
    } catch (err) {
        logger.error("MONGODB error", err);
        return Promise.resolve(news);
    }
};

//TODO async await 동기 처리
export const getCachedCoronaState = async (): Promise<coronaStateItem[]> => {
    console.log("getCachedCoronaState");
    let corona_states: coronaStateItem[] = [];

    try {
        let data = await data_collection.findOne({});
        if (
            (data.corona_state_last_update as number) +
                COLLECTION_UPDATE_INTERVAL <
            Date.now()
        ) {
            await cachingCoronaState();
        }
        let corona_states = await corona_state_collection.find({}).toArray();
        console.log(corona_states);
        return Promise.resolve(corona_states);
    } catch (err) {
        logger.error("MONGODB error", err);
        return Promise.resolve(corona_states);
    }
};

//TODO async await 동기 처리
export const getCachedCoronaCity = (cities: string[]): coronaCityItem[] => {
    console.log("getCachedCoronaCity");
    console.log(cities);

    let corona_cities: coronaCityItem[] = [];

    data_collection.findOne({}, (err: MongoError, data: any) => {
        if (err) {
            logger.error("MONGODB error");
            return;
        } else {
            if (
                (data.corona_city_last_update as number) +
                    COLLECTION_UPDATE_INTERVAL <
                Date.now()
            ) {
                cachingCoronaCity();
            }
            cachingCoronaCity();
            let corona_cities = corona_city_collection.find({
                city: { $in: cities },
            });
        }
    });

    return corona_cities;
};

//TODO async await 동기 처리
export const getCachedCoronaVaccine = (
    cities: string[]
): coronaVaccineItem[] => {
    console.log("getCachedCoronaVaccine");
    console.log(cities);
    let corona_vaccines: coronaVaccineItem[] = [];

    data_collection.findOne({}, (err: MongoError, data: any) => {
        if (err) {
            logger.error("MONGODB error");
            return;
        } else {
            if (
                (data.corona_vaccine_last_update as number) +
                    COLLECTION_UPDATE_INTERVAL <
                Date.now()
            ) {
                cachingCoronaVaccine();
            }
            let corona_vaccines = corona_state_collection.find({
                city: { $in: cities },
            });
        }
    });

    return corona_vaccines;
};

//TODO async await 동기 처리
//이름별로 모아서 쿼리 할 수는 없을까?
//db에 데이터 때려박기
//업데이트 시간 때려박기
const cachingWeather = async () => {
    console.log("cachingWeather");

    let api_url =
        util.PREFERENCES.URL_OPENWEATHER +
        querystring.stringify({
            q: util.WEATHER.WEATHER_INIT[0],
            appid: util.PREFERENCES.KEY_OPENWEATHER,
        });

    await axios.get(api_url).then((resp) => {
        console.log(resp);

        weather_collection.update({}, resp, { upsert: true });
        data_update("weather_last_update");
    });
};

//TODO async await 동기 처리
//이름별로 모아서 쿼리 할 수는 없을까?
//db에 데이터 때려박기
//업데이트 시간 때려박기
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
            console.log(resp.data.items);

            await news_collection.insertMany(resp.data.items);
            await data_update("news_last_update");
        });
};

//TODO async await 동기 처리
//이름별로 모아서 쿼리 할 수는 없을까?
//db에 데이터 때려박기
//업데이트 시간 때려박기
const cachingCoronaState = async () => {
    console.log("cachingCoronaState");

    var api_url =
        util.PREFERENCES.URL_CORONA_STATE +
        querystring.stringify({
            ServiceKey: util.PREFERENCES.KEY_CORONA_STATE, //TODO
            pageNo: 1,
            numOfRows: 10, //TODO
            startCreateDt: "20210624", //TODO
            endCreateDt: "20210624", //TODO
        });

    await axios.get(api_url).then(async (resp) => {
        console.log(resp);
        console.log(resp.data.response.header);

        await corona_state_collection.insertMany(resp.data.items);
        await data_update("corona_state_last_update");
    });
};

//TODO async await 동기 처리
//이름별로 모아서 쿼리 할 수는 없을까?
//db에 데이터 때려박기
//업데이트 시간 때려박기
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

    await axios.get(api_url).then((resp) => {
        console.log(resp);

        corona_city_collection.update({}, resp, { upsert: true });
        data_update("corona_city_last_update");
    });
};

//TODO async await 동기 처리
//이름별로 모아서 쿼리 할 수는 없을까?
//db에 데이터 때려박기
//업데이트 시간 때려박기
const cachingCoronaVaccine = async () => {
    console.log("cachingCoronaVaccine");

    var api_url =
        util.PREFERENCES.URL_CORONA_VACCINE +
        querystring.stringify({
            page: 1, //TODO
            perPage: 10, //TODO
            returnType: "json",
            serviceKey: util.PREFERENCES.KEY_CORONA_VACCINE,
        });

    await axios.get(api_url).then((resp) => {
        console.log(resp);

        corona_vaccine_collection.update({}, resp, { upsert: true });
        data_update("corona_vaccine_last_update");
    });
};
