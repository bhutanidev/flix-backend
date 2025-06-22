import express from "express"
import { adminSignupController, authController, logoutController, signinController, signupController } from "../controller/auth.controller"
import {allowAllRoles, attachUserId} from "../middleware/auth.middleware"

const authRouter = express.Router()

authRouter.get('/test',(req,res)=>{
    res.send("test")
})
authRouter.get('/protected' , attachUserId , (req,res)=>{
    res.send("protected")
})

authRouter.get('/auth' , attachUserId , allowAllRoles , authController)
authRouter.post('/signup',signupController)
authRouter.post('/signin',signinController)
authRouter.post('/signup-admin',adminSignupController)
authRouter.post('/logout',logoutController)



export default authRouter