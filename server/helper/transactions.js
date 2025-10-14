import { pool } from './db.js'

const beginTransaction = async (client) => {
    return await client.query('BEGIN')
}

const commitTransaction = async (client) => {
    return await client.query('COMMIT')
}

const rollbackTransaction = async (client) => {
    return await client.query('ROLLBACK')
}

const connectClient = async () => {
    return await pool.connect()
}

const releaseClient = async (client) => {
    return client.release()
}

export { connectClient, releaseClient, beginTransaction, commitTransaction, rollbackTransaction }