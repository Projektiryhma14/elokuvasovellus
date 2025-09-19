import express from 'express'
import cors from 'cors'
import pkg from 'pg'
import dotenv from 'dotenv'
import { compare, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'

const { sign } = jwt

dotenv.config()

const port = 3001
const { Pool } = pkg

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const openDb = () => {
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    })
    return pool
}

app.get('/', (req, res) => {
    const pool = openDb()

    pool.query('SELECT * FROM users', (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }
        res.status(200).json(result.rows)
    })
})

app.post('/signup', (req, res, next) => {
    const pool = openDb()
    //const { user } = req.body
    const user = req.body

    if (!user || !user.username || !user.email || !user.password) {
        const error = new Error('Email, username & password are required')
        return next(error)
    }

    hash(user.password, 10, (err, hashedPassword) => {
        if (err) return next(err)

        pool.query('INSERT INTO users (user_name, email, password_hash) VALUES ($1, $2, $3) RETURNING *', [user.username, user.email, hashedPassword],
            (err, result) => {
                if (err) {
                    return next(err)
                }
                res.status(201).json({ id: result.rows[0].id, email: user.email })
            })
    })
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})