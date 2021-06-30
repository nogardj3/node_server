export const COLLECTION_CORONA_STATE: string = "corona_state";

export class coronaStateItem {
    city?: string;
    peoples?: number;
    time?: number;
}

export function corona_state_mapper(data: any, update_time: number): any {
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

    return res;
}
