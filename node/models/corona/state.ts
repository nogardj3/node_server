import moment from "moment";

export const COLLECTION_STATE: string = "state";

/* 기준데이터
=======================
accDefRate: 1.5036429184,
accExamCnt: 10614317,
accExamCompCnt: 10489392,
careCnt: 7678,
clearCnt: 148024,
createDt: '2021-07-01 09:42:01.927',
deathCnt: 2021,
decideCnt: 157723,
examCnt: 124925,
resutlNegCnt: 10331669,
seq: 559,
stateDt: 20210701,
stateTime: '00:00',
updateDt: 'null'
*/

export class coronaStateItem {
    date: string;
    datetime: number;
    count: CoronaStateCount;
    acc: CoronaAccumulate;
    last_update_time: number;
}

class CoronaStateCount {
    decide: number; //확진자
    clear: number; //격리해제
    exam: number; //검사진행
    care: number; //치료중
    death: number; //사망자
    negative: number; //음성
}

class CoronaAccumulate {
    count_exam: number; //확진자
    count_clear: number; //격리해제
    rate: number; //검사진행
}

export function corona_state_mapper(data: any, update_time: number): any {
    let res: any = {};

    res["date"] = data["stateDt"];
    res["datetime"] = moment(data["createDt"]).valueOf();
    res["count"] = {
        decide: data["decideCnt"],
        clear: data["clearCnt"],
        exam: data["examCnt"],
        care: data["careCnt"],
        death: data["deathCnt"],
        negative: data["resutlNegCnt"],
    };
    res["acc"] = {
        count_exam: data["accExamCnt"],
        count_clear: data["accExamCompCnt"],
        rate: data["accDefRate"],
    };

    res["last_update_time"] = update_time;

    return res;
}
