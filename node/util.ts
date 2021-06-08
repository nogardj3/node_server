import * as fs from "fs"
import * as yaml from "yaml"

export const PREFERENCES = yaml.parse(fs.readFileSync('./preferences.yaml', "utf8"));

export const print = (sentence: string) =>{
    console.log(sentence)
}
