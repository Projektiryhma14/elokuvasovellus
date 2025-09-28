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

        const token = sign({ user: dbUser.email }, process.env.JWT_SECRET)
        res.status(200).json({
            id: dbUser.user_id,
            email: dbUser.email,
            username: dbUser.user_name,
            token
        })
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

//HAETAAN KÄYTTÄJÄN SUOSIKIT
app.get('/favourites', (req, res) => {
    
  const pool = openDb()
  const { user_id } = req.query

  if (!user_id) 
    return res.status(400).json({ error: 'User_id:tä ei löytynyt' })
  
  pool.query('SELECT * FROM favourites WHERE user_id = $1', [user_id], (err, result) => {
    if (err) {
        return res.status(500).json({ error: err.message })
    }
    res.status(200).json(result.rows)
  })
})

//LISÄÄ UUSI SUOSIKKI
app.post('/favourites/create', (req, res) => {

  const pool = openDb()
  const { movie_name, user_id } = req.body

  if (!movie_name) {
    return res.status(400).json({ error: 'Elokuvan nimi puuttuu' })
  }

  pool.query(
    'INSERT INTO favourites (movie_name, user_id) VALUES ($1, $2) RETURNING *', [movie_name, user_id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.status(201).json(result.rows[0])
    })
})

//POISTA SUOSIKKI
app.delete('/favourites/delete/:id', (req, res) => {

  const pool = openDb()
  const favId = req.params.id
    console.log(req.params.id)
    const { user_id } = req.query

  pool.query('DELETE FROM favourites WHERE favourites_id = $1 AND user_id = $2 RETURNING*', [favId, user_id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message })

      if (result.rows.length === 0) {
        return res.status(404).json({ error: `Suosikkia ei löytynyt id:llä ${favId}` })
      }
      res.status(200).json(result.rows[0])
    }
  )
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})