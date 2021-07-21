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
    likes: String[];
    ingredients: Ingredient[];
    tags: String[];
    phase: PhaseItem[];
    // 얘네는 따로간다
    // user
    nickname: string;
    user_profile_img: string;
    // review
    rating: number;
}

export class Ingredient {
    name: string; //재료이름
    amount: string; //양
}

export class PhaseItem {
    phase_type: number;
    recipe_img: string;
    contents: string;
    time_amount: string;
    ingredients: Ingredient[];
    tips: string[];
}
