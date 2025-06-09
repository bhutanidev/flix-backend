import mongoose, { model, Schema } from "mongoose"

export interface User{
    email:string,
    password:string,
    name:string,
    isAdmin:boolean
}

const userSchema = new Schema<User>({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    name:{type:String,required:true},
    isAdmin:{type:Boolean,default:false}
})

export const userModel = model("Users",userSchema)

