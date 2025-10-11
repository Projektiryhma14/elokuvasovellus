//import { pool } from '../helper/db.js'
import { Router } from 'express'
//import { compare, hash } from 'bcrypt'
//import jwt from 'jsonwebtoken'

import {getUsers, signIn, deleteUser, signUp, checkEmail, checkUsername, getUserById } from '../controllers/userController.js'

const router = Router()

router.get('/', getUsers)

router.post('/signin', signIn)
/*
router.post('/signin', (req, res, next) => {
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
        console.log(dbUser)

        compare(password, dbUser.password_hash, (err, isMatch) => {
            if (err) return next(err)

            if (!isMatch) {
                const error = new Error('Invalid password')
                error.status = 401
                return next(error)
            }

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
        })
    })
})
*/

router.delete('/deleteuser/:id', deleteUser)
/*
router.delete('/deleteuser/:id', async (req, res, next) => {

    //const pool = openDb()
    const client = await pool.connect()
    const userId = req.params.id

    try {

        await client.query('BEGIN')

        // Katsotaan onko poistettava käyttäjä ryhmän omistaja
        const ownedGroupResult = await pool.query(
            `SELECT group_id FROM groups WHERE owner_id=$1`, [userId] //tämä groupmodeliin?
        )

        if (ownedGroupResult.rows.length !== 0) {
            const groupId = ownedGroupResult.rows[0].group_id

            await pool.query(`UPDATE users SET groupid=null, hasactivegrouprequest=false WHERE groupid=$1`, [groupId])
        }

        await pool.query(
            `UPDATE users SET groupid=null WHERE user_id=$1`, [userId]
        )

        await pool.query(
            `DELETE FROM users WHERE user_id=$1`, [userId]
        )
        res.status(200).json({ message: 'User deleted' })
        await client.query('COMMIT')


    } catch (err) {
        await client.query('ROLLBACK')
        console.error('Transaktio epäonnistui', err)
        next(err)
    } finally {
        client.release()
    }

})
*/

// SIGN UP //
router.post('/signup', signUp)
/*
router.post('/signup', (req, res, next) => {
    const user = req.body

    if (!user || !user.username || !user.email || !user.password) {
        return res.status(400).json({ error: "Email, username & password are required" })
    }

    const password = String(user.password)

    // Password: 8+merkkiä, 1 iso, 1 numero, 1 erikoismerkki
    const hasMinLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasDigit = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password);

    if (!(hasMinLength && hasUpper && hasDigit && hasSpecial)) {
        return res.status(400).json({
            error: 'Password must be at least 8 chars and include an uppercase letter, a digit, and special character'
        })
    }

    hash(user.password, 10, (err, hashedPassword) => {
        if (err) return next(err)

        pool.query(
            'INSERT INTO users (user_name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id AS id, email',
            [user.username.trim(), user.email.trim(), hashedPassword],
            (err, result) => {
                if (err) {
                    // Postgres unique violation
                    if (err.code === '23505') {
                        return res.status(409).json({ error: "Username or email already in use" })
                    }
                    return next(err)
                }
                const row = result.rows[0];
                console.log('RETURNED ROW:', result.rows[0])
                res.status(201).json({ id: row.id, email: row.email });

            }
        );
    });
});
*/

// GET /CHECK-EMAIL (duplikaatit)

router.get('/check-email', checkEmail)
/*
router.get('/check-email', (req, res, next) => {
    //const pool = openDb()
    const email = (req.query.email || '').trim()
    if (!email) return res.status(400).json({ error: 'email required' })

    pool.query(
        'SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
        [email],
        (err, result) => {
            if (err) return next(err)
            const exists = result.rowCount > 0
            res.json({ available: !exists })
        }
    )
})*/

// GET /CHECK-USERNAME (duplikaatit)
router.get('/check-username', checkUsername)
/*
router.get('/check-username', (req, res, next) => {
    //const pool = openDb()
    const username = (req.query.username || '').trim()
    if (!username) return res.status(400).json({ error: 'username required' })

    pool.query(
        'SELECT 1 FROM users WHERE LOWER(user_name) = LOWER($1) LIMIT 1',
        [username],
        (err, result) => {
            if (err) return next(err)
            const exists = result.rowCount > 0
            res.json({ available: !exists })
        }
    )
})*/

//Haetaan yksittäisen käyttäjän tiedot id:n perusteella
router.get('/users/:id', getUserById)
/*
router.get('/users/:id', (req, res) => {
    //const pool = openDb()
    const userId = req.params.id

    pool.query('SELECT * FROM users WHERE user_id = $1', [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message })

        if (result.length === 0) {
            console.log("Käyttäjää ei löytynyt annetulla id:llä")
            return res.status(404).json({ error: `Käyttäjää ei löytynyt id:llä ${userId}` })
        }

        return res.status(200).json(result.rows[0])
    })

})*/

export default router