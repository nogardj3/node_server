export const COLLECTION_WEATHER: string = "weather";

class weatherItem {
    name: string;
    id: string;
    datetime: number;
    last_update_time?: number;

    coord: Coord;
    weather: Weather;
    temperature: Temperature;
}

class Coord {
    lat: number;
    lon: number;
}

class Weather {
    id: number;
    desc: string;
}

class Temperature {
    temp: number;
    feelslike: number;
    min: number;
    max: number;
    humidity: number;
}

export function weather_mapper(data: any, name: number, update_time: number): any {
    let res: any = {};

    res["name"] = name;
    res["id"] = data["id"];
    res["datetime"] = data["dt"] * 1000;

    res["coord"] = data["coord"];
    res["weather"] = {
        id: data["weather"][0]["id"],
        description: data["weather"][0]["main"],
    };
    res["temperature"] = data["main"];
    res["last_update_time"] = update_time;

    return res;
}
