import {pool} from '../helper/db.js'

const selectAllUsers = async () => {
    return await pool.query('SELECT * FROM users')
}

const selectByUserName = async (username) => {
    return await pool.query('SELECT * FROM users WHERE user_name = $1', [username])
}

const selectById = async (userId) => {
    return await pool.query('SELECT * FROM users WHERE user_id = $1', [userId])
}

const deleteUserById = async (userId) => {
    return await pool.query(`DELETE FROM users WHERE user_id=$1`, [userId])
}

const removeAllUsersFromGroup = async (groupId) => {
    return await pool.query(`UPDATE users SET groupid=null, hasactivegrouprequest=false WHERE groupid=$1`, [groupId])
}

//ALLA OLEVA TURHA???
const setGroupIdToNull = async (userId) => {
    return await pool.query('UPDATE users SET groupid=null WHERE user_id=$1', [userId])
}

const insertUser = async (uname, email, pw_hashed) => {
    return await pool.query(
        `
        INSERT INTO users (user_name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id AS id, email
        `,
        [uname, email, pw_hashed])
}

//returns 1 if user with given email already exists, otherwise returns nothing
const checkEmailAvailability = async (email) => {
    return await pool.query(
        'SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
        [email])
}

//returns 1 if user with given username already exists, otherwise returns nothing
const checkUsernameAvailability = async (username) => {
    return await pool.query(
        'SELECT 1 FROM users WHERE LOWER(user_name) = LOWER($1) LIMIT 1',
        [username])
}

export {
    selectAllUsers, selectByUserName, deleteUserById, removeAllUsersFromGroup,
    setGroupIdToNull, insertUser, checkEmailAvailability, checkUsernameAvailability,
    selectById
}