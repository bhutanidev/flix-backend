import express from 'express'
import 'dotenv/config'
import connectMongo from './utils/db'
import authRouter from './routes/auth.route'
import cookieParser from 'cookie-parser'
import videoRouter from './routes/video.route'
import errorHandler from './middleware/errorHandler'
import cors from 'cors'
import helmet from 'helmet'

const app = express()
connectMongo()

// Fix environment variable check
const mode = process.env.NODE_ENV || process.env.MODE

// Enhanced CORS configuration
const corsOptions = {
  origin: mode === 'production' 
    ? ['https://rotflix.xyz', 'https://www.rotflix.xyz']
    : ['http://localhost:3000', 'http://localhost:3001'],
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization'
  ]
}

// Debug logging
console.log('🌍 Environment:', mode);
console.log('🔗 CORS Origins:', corsOptions.origin);

app.use(helmet())
app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cookieParser())
app.use('/api', authRouter)
app.use('/api', videoRouter)

// Add a test endpoint to verify CORS
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin,
    environment: mode
  });
});

app.use(errorHandler)
app.listen(3000, () => console.log("🚀 App running on port 3000"))