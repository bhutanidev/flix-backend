import path from "path";
import apiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { deleteLocalFolder, uploadHLSFolder } from "../utils/uploadToS3";
import { videoTransformation } from "../utils/videoTransformation";
import fs from "fs"
import { videoModel } from "../models/videoModel";
import apiResponse from "../utils/ApiResponse";
import { getCookie } from "../utils/generateSignedCookie";
import { basedomain } from "../utils/variableExports";


export const uploadVideoController = asyncHandler(async(req,res,next)=>{
    try {
        console.log("hello");
        const title = req.body.title
        const name = req.file?.originalname
        const filepath = req.file?.path
        const newname = req.file?.filename
        if(!title){
            next(new apiError(400,"Tittle is required"))
        }
        // const baseName = path.parse(name).name;
        console.log(req.file)
        console.log(filepath)
        if(!name || !filepath || !newname){
            next(new apiError(500,"No file or path name found"))
            return
        }
        const outdir = await videoTransformation(name,filepath)
        console.log(outdir)
        const id = newname.replace(".mp4","")
        const originalpath = path.resolve("uploads",newname)
        await uploadHLSFolder(outdir,id)
        deleteLocalFolder(outdir)
        deleteLocalFolder(originalpath)
        const record  = await videoModel.create({
            objectKey:id,
            title
        })
        res.json(new apiResponse(200,{title:record.title , id:record._id},"Upload successfull"))
    } catch (error) {
        next(new apiError(500,"error in uploading"))
        console.log(error)
    }
})
export const getAllVideos = asyncHandler(async(req,res,next)=>{
    const allVideos = await videoModel.find();
    res.json(new apiResponse(200,{videos:allVideos},"all videos"))
})

export const getSignedCookies = asyncHandler(async(req,res,next)=>{
    const id = req.query.id
    try {
        const record = await videoModel.findById(id)
        if(!record){
            next(new apiError(400,"No such file found"))
            return
        }
        const cookies = getCookie(record?.objectKey)
        const cookieOptions = {
        // domain: basedomain,
        path: '/',
        httpOnly: true,
        secure: true,
        maxAge: 30 * 60 * 1000 // 30 mins
        };
        console.log(cookies) 
        res.cookie('CloudFront-Policy', cookies['CloudFront-Policy'], cookieOptions);
        res.cookie('CloudFront-Signature', cookies['CloudFront-Signature'], cookieOptions);
        res.cookie('CloudFront-Key-Pair-Id', cookies['CloudFront-Key-Pair-Id'], cookieOptions);

        res.json(new apiResponse(200,{url:`https://${basedomain}/videos/${record?.objectKey}/index.m3u8`},"fetch successfull"))
    } catch (error) {
        next(new apiError(500,"database error"))
    }
})

export const testVideoAccess = asyncHandler(async(req,res,next)=>{
    const { videoUrl } = req.body;
    
    // Get cookies from the request (set by your auth endpoint)
    const cookies = req.cookies;
    
    try {
        // Make request to CloudFront with cookies
        const response = await fetch(videoUrl, {
            headers: {
                'Cookie': Object.entries(cookies)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('; ')
            }
        });
        
        if (response.ok) {
            const content = await response.text();
            res.json({
                success: true,
                status: response.status,
                content: content.substring(0, 500) + '...', // First 500 chars
                contentLength: content.length
            });
        } else {
            res.json({
                success: false,
                status: response.status,
                error: await response.text()
            });
        }
    } catch (error) {
        res.json({
            success: false,
        });
        console.log(error)
    }
});