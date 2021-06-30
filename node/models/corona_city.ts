import { plainToClass, Type, Transform, Exclude } from "class-transformer";

//TODO class-transformer 정리
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
