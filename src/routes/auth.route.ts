import express from "express"
import { adminSignupController, signinController, signupController } from "../controller/auth.controller"
import {attachUserId} from "../middleware/auth.middleware"

const authRouter = express.Router()

authRouter.get('/test',(req,res)=>{
    res.send("test")
})
authRouter.get('/protected' , attachUserId , (req,res)=>{
    res.send("protected")
})


authRouter.post('/signup',signupController)
authRouter.post('/signin',signinController)
authRouter.post('/signup-admin',adminSignupController)


export default authRouter