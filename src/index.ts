import express from 'express'
import 'dotenv/config'
import connectMongo from './utils/db'
import authRouter from './routes/auth.route'
import cookieParser from 'cookie-parser'

const app =  express()

connectMongo()

app.use(express.json())
app.use(cookieParser())

app.use('/api',authRouter)

app.listen(3000,()=>console.log("app running on 3000"))