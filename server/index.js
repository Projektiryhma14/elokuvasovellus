import express from 'express'
import cors from 'cors'

import dotenv from 'dotenv'

import userRouter from './routes/userRouter.js'
import groupRouter from './routes/groupRouter.js'
import favouritesRouter from './routes/favouritesRouter.js'
import reviewRouter from './routes/reviewRouter.js'
import showtimesRouter from './routes/sharedShowtimesRouter.js'
import moviesRouter from './routes/sharedMoviesRouter.js'

dotenv.config()

const port = process.env.PORT

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', userRouter)
app.use('/', groupRouter)
app.use('/', favouritesRouter)
app.use('/', reviewRouter)
app.use('/', showtimesRouter)
app.use('/', moviesRouter)

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})