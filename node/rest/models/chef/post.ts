export const COLLECTION_POST: string = "post";

export class Post {
    post_id: number; // random
    user_id: string;
    post_img: string;
    contents: string;
    datetime: number;
    tags: string[];
    comments: number[];
    likes: string[];
    // 얘네는 따로간다
    nickname: string;
    user_profile_img: string;
}
