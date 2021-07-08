export const COLLECTION_VACCINE: string = "vaccine";

/* 기준데이터
=======================
"_id": "60ddb47e49f86c091cee09c2",
"address": "서울특별시 중구 을지로 39길 29",
"centerName": "코로나19 중앙 예방접종센터",
"centerType": "중앙/권역",
"createdAt": "2021-03-03 07:00:52",
"facilityName": "국립중앙의료원 D동",
"id": 1,
"lat": "37.567817",
"lng": "127.004501",
"org": "국립중앙의료원",
"phoneNumber": "02-2260-7114",
"sido": "서울특별시",
"sigungu": "중구",
"updatedAt": "2021-06-25 00:28:02",
"zipCode": "04562",
"last_update_time": 1625142398325
*/

export class coronaVaccineItem {
    name: string;
    facility_name: string;
    type: string;
    coord: Coord;
    address: Address;
    phonenumber: string;
    last_update_time: number;
}
class Address {
    full: string;
    sido: string;
    sigun: string;
    zip_code: string;
}

class Coord {
    lat: number;
    lon: number;
}

export function corona_vaccine_mapper(data: any, update_time: number): any {
    let res: any = {};

    res["name"] = data["centerName"];
    res["facility_name"] = data["facilityName"];
    res["type"] = data["centerType"];
    res["coord"] = {
        type: "Point",
        coordinates: [Number.parseFloat(data["lng"]), Number.parseFloat(data["lat"])],
    };
    res["address"] = {
        full: data["address"],
        sido: data["sido"],
        sigun: data["sigungu"],
        zip_code: data["zipCode"],
    };
    res["phone_number"] = data["phoneNumber"];

    res["last_update_time"] = update_time;

    return res;
}
