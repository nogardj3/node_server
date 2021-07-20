import { logger } from "../../../logging";
import * as util from "../../../util";
import { Collection, Db, MongoClient } from "mongodb";
import axios from "axios";
import * as querystring from "querystring";
import moment from "moment";
import isEmpty from "is-empty";

import { COLLECTION_UPDATE_INTERVAL, COLLECTION_METADATA } from "../../models/corona/metadata";
import { COLLECTION_WEATHER, corona_weather_mapper } from "../../models/corona/weather";
import { COLLECTION_NEWS } from "../../models/corona/news";
import { COLLECTION_STATE, corona_state_mapper } from "../../models/corona/state";
import { COLLECTION_CITY, corona_city_mapper } from "../../models/corona/city";
import { COLLECTION_VACCINE, corona_vaccine_mapper } from "../../models/corona/vaccine";

const DB_URL: string = "mongodb://localhost:27017";
const DB_NAME: string = "corona";

let data_collection: Collection;
let weather_collection: Collection;
let news_collection: Collection;
let state_collection: Collection;
let city_collection: Collection;
let vaccine_collection: Collection;

export const init_db = async () => {
    let connection;
    try {
        connection = await MongoClient.connect(DB_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        logger.info("$$ Connected successfully to mongodb server : ", DB_NAME, __filename);
        let mongo_db: Db = await connection.db(DB_NAME);

        data_collection = mongo_db.collection(COLLECTION_METADATA);
        weather_collection = mongo_db.collection(COLLECTION_WEATHER);
        news_collection = mongo_db.collection(COLLECTION_NEWS);
        state_collection = mongo_db.collection(COLLECTION_STATE);
        city_collection = mongo_db.collection(COLLECTION_CITY);
        vaccine_collection = mongo_db.collection(COLLECTION_VACCINE);
    } catch (error) {
        if (connection != null) {
            logger.error(error);
            connection.close();
        }
    }
};

async function metadata_update(param: string, data: number) {
    await data_collection
        .updateOne(
            { name: "metadata" },
            {
                $set: {
                    [param]: data,
                },
            },
            {
                upsert: true,
            }
        )
        .catch((err) => {
            logger.error(err);
        });
}

async function metadata_get(param: string): Promise<number> {
    return Promise.resolve(
        await data_collection
            .findOne({ name: "metadata" })
            .then((data) => {
                return Promise.resolve(data[param]);
            })
            .catch((err) => {
                logger.error("MONGODB error", err);
                return Promise.reject(0);
            })
    );
}

export async function clearDB(collection_name: string): Promise<boolean> {
    let cleared = false;
    switch (collection_name) {
        case COLLECTION_WEATHER:
            weather_collection.remove({});
            cleared = true;
        case COLLECTION_NEWS:
            news_collection.remove({});
            cleared = true;
        case COLLECTION_CITY:
            city_collection.remove({});
            cleared = true;
        case COLLECTION_STATE:
            state_collection.remove({});
            cleared = true;
        case COLLECTION_VACCINE:
            vaccine_collection.remove({});
            cleared = true;
    }

    if (cleared) return Promise.resolve(true);
    else return Promise.resolve(false);
}

export const getCachedWeather = async (cities: string[]): Promise<object[]> => {
    logger.info("getCachedWeather", cities);

    let update_time = await metadata_get("weather_last_update");
    if ((update_time as number) + COLLECTION_UPDATE_INTERVAL < Date.now()) {
        update_time = Date.now();
        await cachingWeather(update_time);
    }

    let query = {};
    if (isEmpty(cities)) {
        query = { last_update_time: update_time };
    } else {
        query = {
            name: { $in: cities },
            last_update_time: update_time,
        };
    }

    return Promise.resolve(
        await weather_collection
            .find(query)
            .project({
                _id: 0,
            })
            .toArray()
    );
};

const cachingWeather = async (update_time: number) => {
    logger.info("cachingWeather");

    let big_cities = util.CITIES;

    let requests: any[] = [];

    for (let key in big_cities) {
        let api_url =
            util.PREFERENCES.URL_WEATHER +
            querystring.stringify({
                appid: util.PREFERENCES.KEY_WEATHER,
                units: "metric",
                lang: "kr",
                id: key,
            });
        requests.push(axios.get(api_url));
    }

    await axios.all(requests).then(
        axios.spread((...resp) => {
            resp.forEach((ele: any) => {
                let data = corona_weather_mapper(
                    ele.data,
                    big_cities[ele.data.id]["name_kor"],
                    update_time
                );

                let query = {
                    name: data["name"],
                };
                weather_collection
                    .updateOne(
                        query,
                        {
                            $set: data,
                        },
                        {
                            upsert: true,
                        }
                    )
                    .catch((err) => {
                        console.log(err);
                        logger.error(err);
                    });
            });
        })
    );

    await metadata_update("weather_last_update", update_time);
};

export const getCachedNews = async (page: number, page_count: number): Promise<object[]> => {
    logger.info("getCachedNews", page, page_count);

    let update_time = await metadata_get("news_last_update");
    if ((update_time as number) + COLLECTION_UPDATE_INTERVAL < Date.now()) {
        update_time = Date.now();
        await cachingNews(update_time);
    }

    let query = { last_update_time: update_time };
    let skip_page = page <= 1 ? 0 : (page - 1) * page_count;

    return Promise.resolve(
        await news_collection
            .find(query)
            .skip(skip_page)
            .limit(page_count)
            .project({
                _id: 0,
            })
            .toArray()
    );
};

const cachingNews = async (update_time: number) => {
    logger.info("cachingNews");

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
                "X-Naver-Client-Secret": util.PREFERENCES.KEY_NAVER_CLIENT_SECRET,
            },
        })
        .then(async (resp) => {
            let data = resp.data.items;

            data.map((obj: any) => {
                obj["last_update_time"] = update_time;
            });

            await news_collection.insertMany(data);
            await metadata_update("news_last_update", update_time);
        });
};

export const getCachedCoronaState = async (): Promise<object[]> => {
    logger.info("getCachedCoronaState");

    let update_time = await metadata_get("state_last_update");
    if ((update_time as number) + COLLECTION_UPDATE_INTERVAL < Date.now()) {
        update_time = Date.now();
        await cachingCoronaState(update_time);
    }

    let query = { last_update_time: update_time };

    return Promise.resolve(
        await state_collection
            .find(query)
            .project({
                _id: 0,
            })
            .toArray()
    );
};

const cachingCoronaState = async (update_time: number) => {
    logger.info("cachingCoronaState");

    var api_url =
        util.PREFERENCES.URL_CORONA_STATE +
        querystring.stringify({
            ServiceKey: util.PREFERENCES.KEY_CORONA_STATE,
            pageNo: 1,
            numOfRows: 50,
            startCreateDt: moment().subtract(5, "days").format("YYYYMMDD"), // 5일 전
            endCreateDt: moment().format("YYYYMMDD"), // 오늘
        });

    await axios.get(api_url).then(async (resp) => {
        let data = resp.data.response.body.items.item;

        data.forEach((ele: any) => {
            let obj = corona_state_mapper(ele, update_time);
            let query = {
                date: obj["date"],
            };
            state_collection
                .updateOne(
                    query,
                    {
                        $set: obj,
                    },
                    {
                        upsert: true,
                    }
                )
                .catch((err) => {
                    console.log(err);
                    logger.error(err);
                });
        });
        await metadata_update("state_last_update", update_time);
    });
};

export const getCachedCoronaCity = async (cities: string[]): Promise<object[]> => {
    logger.info("getCachedCoronaCity", cities);

    let update_time = await metadata_get("city_last_update");
    if ((update_time as number) + COLLECTION_UPDATE_INTERVAL < Date.now()) {
        update_time = Date.now();
        await cachingCoronaCity(update_time);
    }

    let query = {};
    if (isEmpty(cities)) {
        query = { last_update_time: update_time };
    } else {
        query = {
            name: { $in: cities },
            last_update_time: update_time,
        };
    }

    return Promise.resolve(
        await city_collection
            .find(query)
            .project({
                _id: 0,
            })
            .toArray()
    );
};

const cachingCoronaCity = async (update_time: number) => {
    logger.info("cachingCoronaCity");

    var api_url =
        util.PREFERENCES.URL_CORONA_CITY +
        querystring.stringify({
            ServiceKey: util.PREFERENCES.KEY_CORONA_CITY,
            pageNo: 1,
            numOfRows: 200,
            startCreateDt: moment().subtract(5, "days").format("YYYYMMDD"), // 5일 전
            endCreateDt: moment().format("YYYYMMDD"), // 오늘
        });

    await axios.get(api_url).then(async (resp) => {
        let data = resp.data.response.body.items.item;
        data.forEach((ele: any, idx: number, arr: object[]) => {
            if (ele["gubun"] == "검역") arr.splice(idx, 1);
            else {
                let item = corona_city_mapper(ele, update_time);

                let query = {
                    name: item["name"],
                    date: item["date"],
                };
                city_collection
                    .updateOne(
                        query,
                        {
                            $set: item,
                        },
                        {
                            upsert: true,
                        }
                    )
                    .catch((err) => {
                        console.log(err);
                        logger.error(err);
                    });
            }
        });

        await metadata_update("city_last_update", update_time);
    });
};

export const getCachedCoronaVaccine = async (
    lat: number,
    lon: number,
    within: number
): Promise<object[]> => {
    logger.info("getCachedCoronaVaccine", lat, lon, within);

    let update_time = await metadata_get("vaccine_last_update");

    if ((update_time as number) + COLLECTION_UPDATE_INTERVAL < Date.now()) {
        await cachingCoronaVaccine(update_time);
    }

    let query = {
        coord: {
            $geoWithin: {
                $centerSphere: [[lon, lat], within / 6378.1],
            },
        },
    };

    return Promise.resolve(
        await vaccine_collection
            .find(query)
            .project({
                _id: 0,
            })
            .toArray()
    );
};

const cachingCoronaVaccine = async (update_time: number) => {
    logger.info("cachingCoronaCity");

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
        data.forEach((ele: any) => {
            let item = corona_vaccine_mapper(ele, update_time);

            let query = {
                name: item["name"],
            };
            vaccine_collection
                .updateOne(
                    query,
                    {
                        $set: item,
                    },
                    {
                        upsert: true,
                    }
                )
                .catch((err) => {
                    console.log(err);
                    logger.error(err);
                });
        });

        await metadata_update("vaccine_last_update", update_time);
    });
};
