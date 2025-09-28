import express from 'express'
import cors from 'cors'
import pkg from 'pg'
import dotenv from 'dotenv'
import { compare, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { authenticateToken } from './middleware/authenticateToken.js'

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




app.post('/signin', (req, res, next) => {
    const pool = openDb()
    //const user = req.body
    const { username, password } = req.body
    if (!username || !password) {
        const error = new Error('Username & password are required')
        error.status = 400
        return next(error)
    }
    pool.query('SELECT * FROM users WHERE user_name = $1', [username], (err, result) => {
        if (err) return next(err)

        if (result.rows.length === 0) {
            const error = new Error('User not found')
            error.status = 404
            return next(error)
        }

        const dbUser = result.rows[0]

        compare(password, dbUser.password, (err, isMatch) => {
            if (err) return next(err)

            if (!isMatch) {
                const error = new Error('Invalid password')
                error.status = 401
                return next(error)
            }
        })

        const token = jwt.sign(
            { id: dbUser.user_id, email: dbUser.email, username: dbUser.user_name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        return res.status(200).json({
            id: dbUser.user_id,
            email: dbUser.email,
            username: dbUser.user_name,
            token,
        })

        {/*
        const token = sign({ user: dbUser.email }, process.env.JWT_SECRET)
        res.status(200).json({
            id: dbUser.user_id,
            email: dbUser.email,
            username: dbUser.user_name,
            token
        })
        */}

    })
})


app.delete('/deleteuser/:id', (req, res, next) => {
    /*
    const pool = openDb()
    */
    const pool = openDb()
    const userId = req.params.id
    console.log(req.params.id)
    //console.log(req.params)
    //(salasanan vahvistusta tms?)

    pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message })

        if (result.length === 0) {
            console.log('Tiliä ei löydy')
            return res.status(404).json({ error: `Tiliä ei löytynyt id:llä ${userId}` })
        }
        console.log(`Poistettu tili jonka id on ${userId}`)
        return res.status(200).json(result.rows[0])
    })
})



app.post("/reviews", authenticateToken, async (req, res) => {
    const pool = openDb()

    console.log("post /reviews body:", req.body)
    console.log("post /reviews user:", req.user)

    try {
        // Poimitaan kentät bodystä
        const { movie_name, movie_rating, movie_review, movie_id } = req.body

        // Haetaan käyttäjän id tokenista (asetettu middlewaressa)
        const user_id = req.user.id;

        // perusvalidointi
        if (!movie_name ||
            movie_rating == null ||
            !movie_review ||
            !movie_id ||
            !user_id
        ) {
            return res.status(400).json({ error: "All fields are required" })
        }

        // Varmistetaan, että arvosana on välillä 1 -5
        const rating = Number(movie_rating)
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {         // .isFinite -> Palauttaa false jos ei ole numero
            return res.status(400).json({ error: "Rating must be 1 - 5" })
        }

        // SQL-kysely: lisätään arvostelu ja palautetaan luodun rivin id + aikaleima
        const query = `
            INSERT INTO reviews (movie_name, movie_rating, movie_review, user_id, movie_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING review_id, created_at
        `;

        // Parametrit turvallisesti taulukossa (estää SQL-injektiot)
        const values = [movie_name, rating, movie_review, user_id, movie_id];

        // Suoritetaan kysely tietokantaan
        const result = await pool.query(query, values)

        // Palautetaan 201 Created + pätkä luodusta rivistä
        return res.status(201).json({
            message: "Review created",
            review: result.rows[0],                 // {review_id, created_id}
        })
    } catch (err) {
        console.error("Error creating review:", err)
        return res.status(500).json({ error: "Sisäinen server error" })
    }
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})