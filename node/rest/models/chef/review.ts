export const COLLECTION_REVIEW: string = "review";

export class Review {
    review_id: number; // random
    recipe_id: number;
    user_id: string;
    contents: string;
    datetime: number;
    rating: number;
    // 얘네는 따로간다
    nickname: string;
    profile_img_url: string;
}
