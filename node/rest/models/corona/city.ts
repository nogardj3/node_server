import moment from "moment";

export const COLLECTION_CITY: string = "city";

/* 기준데이터
=======================
"createDt": "2020-04-10 11:17:34.589",
"deathCnt": "0",
"defCnt": "352",
"gubun": "검역",
"incDec": "4",
"isolClearCnt": "3",
"isolIngCnt": "349",
"localOccCnt": "0",
"overFlowCnt": "4",
"qurRate": "-",
*/

export class coronaCityItem {
    name: string;
    date: string;
    datetime: number;
    count: CoronaCityCount;
    inc_or_dec: number;
    rate_thousand: string;
    last_update_time: number;
}

class CoronaCityCount {
    decide: number; //확진자
    clear: number; //격리해제
    death: number; //사망자
    isol: number; //격리중
    oversea: number; //해외유입
    local: number; //지역감염
}

export function corona_city_mapper(data: any, update_time: number): any {
    let res: any = {};

    res["name"] = data["gubun"];
    res["date"] = moment(data["createDt"]).format("YYYYMMDD");
    res["datetime"] = moment(data["createDt"]).valueOf();
    res["count"] = {
        decide: data["defCnt"],
        clear: data["clearCnt"],
        death: data["deathCnt"],
        isol: data["isolIngCnt"],
        oversea: data["overFlowCnt"],
        local: data["localOccCnt"],
    };

    res["inc_or_dec"] = data["incDec"];
    res["rate_thousand"] = data["qurRate"];

    res["last_update_time"] = update_time;

    return res;
}
