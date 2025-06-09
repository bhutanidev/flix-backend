import express from "express"
import { signinController, signupController } from "../controller/auth.controller"

const authRouter = express.Router()

authRouter.get('/test',(req,res)=>{
    res.send("test")
})

authRouter.post('/signup',signupController)
authRouter.post('/signin',signinController)

export default authRouter