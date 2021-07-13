export const COLLECTION_RECIPE: string = "recipe";

export class Recipe {
    recipe_id: number; // random
    user_id: string;
    recipe_name: string;
    recipe_img: string;
    contents: string;
    datetime: number;
    amount_time: number;
    view_count: number;
    ingredients: Ingredients[];
    tags: String[];
    phase: PhaseItem[];
    // 얘네는 따로간다
    // user
    nickname: string;
    profile_img_url: string;
    // review
    rating: number;
}

export class Ingredients {
    name: string; //재료이름
    amount: number; //양
    units: string;
}

export class PhaseItem {
    phase_type: number;
    recipe_img: string;
    contents: string;
    time_amount: string;
    ingredients: Ingredients[];
    tips: string[];
}
