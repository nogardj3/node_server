import * as fs from "fs";
import * as yaml from "yaml";
import puppeteer from "puppeteer";
import axios from "axios";
import serviceAccount from "../serviceAccountKey.json";
import { google } from "googleapis";

var MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
var SCOPES = [MESSAGING_SCOPE];

export const PREFERENCES = yaml.parse(fs.readFileSync("./preferences.yaml", "utf8"));

export const CITIES = yaml.parse(fs.readFileSync("./node/res/big_cities.yaml", "utf8"));

export const CHEF_TOS = fs.readFileSync("./node/res/tos_sample.txt", "utf8");

export const NOTI_TYPE_ADMIN = "0";
export const NOTI_TYPE_ADD_SUB_USER_RECIPE = "1";
export const NOTI_TYPE_ADD_REVIEW = "2";
export const NOTI_TYPE_ADD_COMMENT = "3";
export const NOTI_TYPE_SUB_USER = "4";

interface INaverCredential {
    id: string;
    password: string;
}

interface IQrResult {
    isSuccess: boolean;
    result: string;
}

const MOBILE_VERIFICATION_REQUIRED = "네이버 휴대전화 인증";
const POLICY_AGREEMENT_REQUIRED = "집합시설 출입을 위한 QR 체크인";

export async function getQrCode(credential: INaverCredential): Promise<IQrResult> {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();

    const { id, password } = credential;

    await page.goto("https://nid.naver.com/nidlogin.login");

    await page.evaluate(
        (id: string, password: string) => {
            (<HTMLInputElement>document.querySelector("#id")).value = id;
            (<HTMLInputElement>document.querySelector("#pw")).value = password;
        },
        id,
        password
    );

    await page.click(".btn_global");
    await page.waitForNavigation();
    await page.goto("https://nid.naver.com/login/privacyQR?term=on");

    const actionRequiredTextElement = await page.$("#content > .top_copy > .title");
    if (actionRequiredTextElement) {
        const actionRequiredText = await page.evaluate(
            (element) => element.textContent,
            actionRequiredTextElement
        );
        if (actionRequiredText === POLICY_AGREEMENT_REQUIRED) {
            await page.evaluate(() => {
                (<HTMLInputElement>document.getElementById("check1")).click();
                (<HTMLButtonElement>document.getElementById("done")).click();
            });
            await page.waitForNavigation();
        } else if (actionRequiredText === MOBILE_VERIFICATION_REQUIRED) {
            return {
                isSuccess: false,
                result: "Mobile Verification Is Required. Check Via Browser.",
            };
        }
    }

    try {
        await page.waitForSelector("#qrImage", { timeout: 5000 });
        const qrImageElement = await page.$("#qrImage");

        const qrImage = qrImageElement
            ? await qrImageElement.screenshot({ encoding: "base64" })
            : null;

        await browser.close();

        return {
            isSuccess: !!qrImage,
            result: !!qrImage ? (qrImage as string) : "Unknown Error",
        };
    } catch (error) {
        return {
            isSuccess: false,
            result: "Unknown Error",
        };
    }
}

function getAccessToken() {
    return new Promise(function (resolve, reject) {
        const jwtClient = new google.auth.JWT(
            serviceAccount.client_email,
            undefined,
            serviceAccount.private_key,
            SCOPES,
            undefined
        );
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            if (tokens != undefined) resolve(tokens.access_token);
        });
    });
}

function getRegistrationIds(tokens: string[]) {
    let headers = {
        "Content-Type": "application/json",
        Authorization: "key=" + PREFERENCES.CHEF_FCM_KEY,
        project_id: PREFERENCES.CHEF_FCM_ID,
    };

    let message: any = {
        operation: "create",
        notification_key_name: "follower " + Date.now(),
        registration_ids: tokens,
    };

    return axios.post(PREFERENCES.CHEF_FCM_REGISTRATION_URL, message, {
        headers: headers,
    });
}

export async function sendChefFCM(
    target: any,
    title: string,
    body: string,
    data: any
): Promise<String> {
    console.log(target);
    console.log(data);

    let accessToken = await getAccessToken();

    let headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
    };

    let message: any = {
        notification: {
            title: title,
            body: body,
        },
        data: data,
    };

    if (data["type"] == NOTI_TYPE_ADMIN) message["topic"] = "admin";
    else if (data["type"] == NOTI_TYPE_ADD_SUB_USER_RECIPE) {
        let resres = await getRegistrationIds(target);
        let token = resres["data"]["notification_key"];
        console.log(token);
        message["token"] = token;
    } else message["token"] = target;

    let send_data = {
        message: message,
    };

    console.log(send_data);
    let res = await axios
        .post(PREFERENCES.CHEF_FCM_URL, send_data, {
            headers: headers,
        })
        .then(async (resp) => {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(resp.data);

            return "OK";
        })
        .catch(async (err) => {
            console.log("======================================");
            console.log(err.response.data);
            console.log(err.response.data.details);

            return "FAILED";
        });

    return Promise.resolve(res);
}
