import path from "path";
import apiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { deleteLocalFile, deleteLocalFolder, uploadHLSFolder, uploadPublicThumbnail } from "../utils/uploadToS3";
import { videoTransformation } from "../utils/videoTransformation";
import fs from "fs"
import { videoModel } from "../models/videoModel";
import apiResponse from "../utils/ApiResponse";
import { getCookie } from "../utils/generateSignedCookie";
import { basedomain } from "../utils/variableExports";


export const uploadVideoController = asyncHandler(async(req,res,next)=>{
    try {
        const title = req.body.title;
        const description = req.body.description;
        
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const videoFile = files.movie?.[0];
        const thumbnailFile = files.thumbnail?.[0];
        console.log(thumbnailFile)
        
        let error = false
        let errorMessage : string|null = null
        if (!videoFile || !thumbnailFile) {
            error=true
            errorMessage="Both video and thumbnail files are required"
        }
        if(!description || !title){
            error=true
            errorMessage="Description and title are required"
        }
        
        try {
            if(error){
                throw new apiError(400,errorMessage as string)
            }
            const id = videoFile.filename.replace(/\.(mp4|avi|mkv)$/i, "");
            // ✅ Upload thumbnail first (smaller, faster)
            const thumbnailUrl = await uploadPublicThumbnail(thumbnailFile.path, id);
            console.log('✅ Thumbnail uploaded:', thumbnailUrl);
            
            // Process and upload video
            const outdir = await videoTransformation(videoFile.originalname, videoFile.path);
            await uploadHLSFolder(outdir, id);
            
            // ✅ Save record with public thumbnail URL
            const record = await videoModel.create({
                objectKey: id,
                title,
                description,
                thumbnailUrl 
            });
            
            // ✅ Cleanup all local files
            deleteLocalFolder(outdir);
            deleteLocalFile(videoFile.path);
            deleteLocalFile(thumbnailFile.path);
            
            res.json(new apiResponse(200, {
                title: record.title,
                id: record._id,
                thumbnail: record.thumbnailUrl,
                description:record.description
            }, "Upload successful"));
            
        } catch (uploadError:any) {
            // ✅ Cleanup on error
            console.error('❌ Upload process failed:', uploadError.message);
            if(typeof(videoFile) === undefined || videoFile?.path !== undefined)deleteLocalFile(videoFile.path);
            if(typeof(thumbnailFile) === undefined || thumbnailFile?.path !== undefined) deleteLocalFile(thumbnailFile.path);
            next(new apiError(400,uploadError.message))
        }
        
    } catch (error) {
        next(new apiError(500, "Error in uploading"));
    }
});
export const getAllVideos = asyncHandler(async(req, res, next) => {
    // Extract page and limit from query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Validate page and limit
    if (page < 1) {
        throw new apiError(400, "Page number must be greater than 0");
    }
    
    if (limit < 1 || limit > 100) {
        throw new apiError(400, "Limit must be between 1 and 100");
    }
    
    try {
        // Fetch videos with pagination - only select id and title
        const allVideos = await videoModel
            .find()
            .select('_id title thumbnailUrl')
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 }) // Optional: sort by newest first
        
        // Get total count for pagination info
        const totalVideos = await videoModel.countDocuments();
        const totalPages = Math.ceil(totalVideos / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        // Handle no videos case
        if (allVideos.length === 0 && page > 1) {
            next(new apiError(404, "No more videos available"));
        }
        
        if (allVideos.length === 0 && page === 1) {
            next(new apiError(404, "No videos found"));
        }
        
        // Transform videos to return id instead of _id
        const transformedVideos = allVideos.map(video => ({
            id: video._id,
            title: video.title,
            thumbnailUrl:video.thumbnailUrl
        }));
        
        // Prepare response data
        const responseData = {
            videos: transformedVideos,
            pagination: {
                currentPage: page,
                totalPages,
                totalVideos,
                hasNextPage,
                hasPrevPage,
                limit
            }
        };
        
        res.json(new apiResponse(200, responseData, "Videos fetched successfully"));
        
    } catch (error) {
        next(new apiError(500, "Failed to fetch videos"));
    }
});

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
        domain: ".rotflix.xyz",
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none' as 'none',
        maxAge: 30 * 60 * 1000 // 30 mins
        };
        console.log(cookies);
        
        res.cookie('CloudFront-Policy', cookies['CloudFront-Policy'], cookieOptions);
        res.cookie('CloudFront-Signature', cookies['CloudFront-Signature'], cookieOptions);
        res.cookie('CloudFront-Key-Pair-Id', cookies['CloudFront-Key-Pair-Id'], cookieOptions);

        res.json(new apiResponse(200,{url:`https://${basedomain}/videos/${record?.objectKey}/index.m3u8` , title:record?.title , description:record?.description},"fetch successfull"))
    } catch (error) {
        next(new apiError(500,"database error"))
    }
})

export const searchVideo = asyncHandler(async(req , res , next)=>{
    try {
        const term : string = req.query.search as string
        const searchTerms = term.split("-").filter((str)=>str)
        
        const allVideos = await videoModel.find({
            $or:searchTerms.map(term=>({
                title: { $regex: term, $options: 'i' }
            }))
        }).select('_id title thumbnailUrl')
        
        const transformedVideos = allVideos.map(video => ({
            id: video._id,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl
        }));
        
        res.json(new apiResponse(200,{videos:transformedVideos} , "Successfully fetched"))
    } catch (error) {
        next(new apiError(400,"DB error"))
    }

})