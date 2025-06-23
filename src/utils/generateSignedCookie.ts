import fs from "fs";
import { getSignedCookies } from "@aws-sdk/cloudfront-signer";
import { basedomain } from "./variableExports";

const privateKey = fs.readFileSync(process.env.CLOUDFRONT_SECRET_PATH as string, 'utf-8');

export const getCookie = (s3object: string) => {
  // ✅ Create custom policy for more flexibility
  const policy = JSON.stringify({
    Statement: [
      {
        Resource: `https://${basedomain}/videos/${s3object}/*`,
        Condition: {
          DateLessThan: {
            'AWS:EpochTime': Math.floor((Date.now() + 3600000) / 1000) // 1 hour
          }
        }
      }
    ]
  });
  
  console.log('🔑 Custom policy:', policy);
  
  // ✅ Use custom policy instead of URL + dateLessThan
  const cookies = getSignedCookies({
    policy,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIRID as string,
    privateKey,
  });
  
  console.log('🍪 Generated cookies with custom policy:', Object.keys(cookies));
  return cookies;
}