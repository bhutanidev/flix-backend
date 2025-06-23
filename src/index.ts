import express from 'express'
import 'dotenv/config'
import connectMongo from './utils/db'
import authRouter from './routes/auth.route'
import cookieParser from 'cookie-parser'
import videoRouter from './routes/video.route'
import errorHandler from './middleware/errorHandler'
import cors from 'cors'
import helmet from 'helmet'

const app =  express()
connectMongo()
const mode = process.env.MODE
const corsOptions = {
  origin: mode==='production'?['https://rotflix.xyz','https://www.rotflix.xyz']:['http://localhost:3000'],
  optionsSuccessStatus: 200 ,
  credentials:true
}

app.use(helmet())

app.use(cors(corsOptions))


app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cookieParser())
app.use('/api',authRouter)
app.use('/api',videoRouter)

app.use(errorHandler)
app.listen(3000,()=>console.log("app running on 3000"))