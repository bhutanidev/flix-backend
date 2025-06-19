import path from "path";
import apiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { deleteLocalFolder, uploadHLSFolder } from "../utils/uploadToS3";
import { videoTransformation } from "../utils/videoTransformation";
import fs from "fs"
export const uploadVideoController = asyncHandler(async(req,res,next)=>{
    console.log("hello");
    
    const name = req.file?.originalname
    const filepath = req.file?.path
    const newname = req.file?.filename
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
    res.json(name)
})