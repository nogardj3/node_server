import { plainToClass, Type, Transform, Exclude } from "class-transformer";

//TODO class-transformer 정리
export class coronaStateItem {
    city?: string;
    peoples?: number;
    time?: number;
}
