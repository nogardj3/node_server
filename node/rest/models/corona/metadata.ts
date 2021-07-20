export const COLLECTION_METADATA: string = "metadata";
export const COLLECTION_UPDATE_INTERVAL = 60 * 1000;

class metadataItem {
    name: string;
    weather_last_update: number;
    news_last_update: number;
    state_last_update: number;
    city_last_update: number;
    vaccine_last_update: number;
}

export function metadata_mapper(data: any, name: number): any {
    let res: any = Object;

    return res;
}
