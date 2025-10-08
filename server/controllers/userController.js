import { selectAllUsers, selectByUserName, removeAllUsersFromGroup, setGroupIdToNull, deleteUserById } from '../models/userModel.js'
import { compare, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'
import {selectOwner} from '../models/groupModel.js'
//import {connectClient, releaseClient, beginTransaction, commitTransaction, rollbackTransaction} from '../helper/transactions.js'
import { pool } from '../helper/db.js'

const getUsers = async (req, res, next) => {
    try {
        const result = await selectAllUsers()
        return res.status(200).json(result.rows || [])
    }
    catch (err) {
        return next(err)
    }
}

const signIn = async (req, res, next) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            const error = new Error('Username & password are required')
            error.status = 400
            return next(error)
        }

        const result = await selectByUserName(username)

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

    } catch (err) {
        return next(err)
    }
}

const deleteUser = async (req, res, next) => {
    const client = await pool.connect()
    //const client = connectClient()

    try {

        const userId = req.params.id

        await client.query('BEGIN')
        //beginTransaction(client)
        // Katsotaan onko poistettava käyttäjä ryhmän omistaja
        const ownedGroupResult = await selectOwner(userId)

        if (ownedGroupResult.rows.length !== 0) {
            const groupId = ownedGroupResult.rows[0].group_id

            await removeAllUsersFromGroup(groupId)
        
        }

        await deleteUserById(userId)
        res.status(200).json({ message: 'User deleted' })
        await client.query('COMMIT')
        //commitTransaction(client)
    }
    catch (err) {
        console.log("error haara")
        await client.query('ROLLBACK')
        //rollbackTransaction(client)
        console.error('Transaktio epäonnistui', err)
        next(err)
    }
    finally {
        console.log("finally haara")
        client.release()
        //releaseClient(client)
    }
}



export { getUsers, signIn, deleteUser }