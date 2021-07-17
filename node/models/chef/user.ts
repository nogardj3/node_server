export const COLLECTION_USER: string = "user";

export class User {
    user_token: string;
    user_id: string;
    profile_img_url: string;
    nickname: string;
    bio: string;
    follow: string[];
    // 얘네는 따로간다
    // recipe_count: number;
    // follower_count: number;
    // following_count: number;
}

export function getInitialData(user_token: string, user_id: string, nickname: string): object {
    let data: object = {
        user_token: user_token,
        user_id: user_id,
        profile_img_url: "default",
        nickname: nickname,
        bio: nickname + "의 기본 프로필",
        follow: [],
    };

    return data;
}
