import fs from "fs"
import { getSignedCookies } from 'aws-cloudfront-sign';
import { basedomain } from "./variableExports";

const privateKey = fs.readFileSync(process.env.CLOUDFRONT_SECRET_PATH as string , 'utf-8')

export const getCookie = (s3object:string)=>{
    const cookies = getSignedCookies(
      `https://${basedomain}/videos/${s3object}/**/*`, // wildcard path for the whole folder
      {
        keypairId:process.env.CLOUDFRONT_KEY_PAIRID as string,
        privateKeyString:privateKey
      }
    );
    return cookies
}

