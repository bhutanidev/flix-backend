import { getSignedUrl } from "@aws-sdk/cloudfront-signer"
import fs from "fs"
import { basedomain } from "./variableExports"

const secret_key = fs.readFileSync(process.env.CLOUDFRONT_SECRET_PATH as string , 'utf-8')

export const getCloudfrontUrl = ()=>{
    // console.log(secret_key);
    // console.log(process.env.CLOUDFRONT_KEY_PAIRID as string)
    const startdate = new Date()
    const enddate = startdate
    enddate.setMinutes(enddate.getMinutes() + 30)
    const signedUrl = getSignedUrl({
        url:`https://${basedomain}/videos/1750361857880-movie/index.m3u8`,
        keyPairId:process.env.CLOUDFRONT_KEY_PAIRID as string,
        privateKey:secret_key,
        dateLessThan:enddate
    })
    return signedUrl
}