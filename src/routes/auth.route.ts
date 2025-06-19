import express from "express"
import { signinController, signupController } from "../controller/auth.controller"
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

export default authRouter