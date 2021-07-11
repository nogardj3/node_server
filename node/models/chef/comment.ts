export const COLLECTION_COMMENT: string = "comment";

export class Comment {
    comment_id: number; // random
    post_id: number;
    user_id: string;
    contents: string;
    datetime: number;
    // 얘네는 따로간다
    nickname: string;
    profile_img_url: string;
}
