import * as fs from "fs"
import * as yaml from "yaml"
import { logger } from "./logging"

export const PREFERENCES = yaml.parse(fs.readFileSync('./preferences.yaml', "utf8"));

export const print = (sentence: string) =>{
    console.log(sentence)
}
