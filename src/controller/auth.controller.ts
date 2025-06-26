import ApiError from "../utils/ApiError";
import apiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { userModel , User } from "../models/userModel";
import jwt from "jsonwebtoken"
import { comparePassword , hashPassword } from "../utils/encrypt"; 
import { NextFunction } from "express";
import { CreateUserSchema, SigninUserSchema } from "../types/zodSchema";
const JWT_SECRET = process.env.JWT_SECRET as string


export const signupController=asyncHandler(async(req,res,next)=>{
    const psdata = CreateUserSchema.safeParse(req.body)
    
    if(!psdata.success){
        next(new ApiError(400,psdata.error.issues[0].message))
        return
    }
    const {password, email , name}=psdata.data
    try {
        const hashedpw = await hashPassword(password)
        const newentry = await userModel.create({email,password:hashedpw as string , name})
        if(!newentry){
            next(new ApiError(500,"Database error"))
            return
        }
        res.status(200).json(new apiResponse(200,{email:newentry.email,name:newentry.name},"User created succsessfully"))
    } catch (error) {
        console.log(error);   
        next(new ApiError(400,"Email already exists"))
        return;
    }
})
//protect this route with admin access only
export const adminSignupController=asyncHandler(async(req,res,next)=>{
    const psdata = CreateUserSchema.safeParse(req.body)
    if(!psdata.success){
        next(new ApiError(400,psdata.error.issues[0].message))
        return
    }
    const {password, email , name}=psdata.data
    try {
        const hashedpw = await hashPassword(password)
        const newentry = await userModel.create({email,password:hashedpw as string , name , role:'admin'})
        if(!newentry){
            next(new ApiError(500,"Database error"))
            return
        }
        res.status(200).json(new apiResponse(200,{email:newentry.email,name:newentry.name},"User created succsessfully"))
    } catch (error) {
        console.log(error);   
        next(new ApiError(400,"Email already exists"))
        return;
    }
})

export const signinController=asyncHandler(async(req,res,next)=>{
    const psdata = SigninUserSchema.safeParse(req.body)
    if(!psdata.success){
        next(new ApiError(400,psdata.error.issues[0].message))
        return
    }
    const {password, email }=psdata.data
    const found = await userModel.findOne({
        email
    })
    if(!found){
        next(new ApiError(400,"Email does not exist"))
        return;
    }
    const match = await comparePassword(password,found.password)
    if(!match){
        next(new ApiError(400,"Incorrect Password"))
        return
    }
    const token = jwt.sign({id:found.id,email:found.email,name:found.name, role:found.role},JWT_SECRET)
    res.cookie("token",token,{httpOnly:true}).status(200).json(new apiResponse(200,{id:found.id,email:found.email,name:found.name},"User logged in"))
})

export const logoutController=asyncHandler(async(req,res,next)=>{
    const cookies = req.cookies
    for(let cookie in cookies)
        res.clearCookie(cookie)
    res.json(new apiResponse(200,{},"Logged Out successfully"))
})

export const  authController =(asyncHandler(async(req,res,next)=>{
    res.json(new apiResponse(200,{},"Already logged in"))
}))