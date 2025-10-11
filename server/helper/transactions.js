import {pool} from './db.js'

const beginTransaction = async (client) => {
    //console.log("begintransaction")
    return await client.query('BEGIN')
}

const commitTransaction = async (client) => {
    return await client.query('COMMIT')
}

const rollbackTransaction = async (client) => {
    return await client.query('ROLLBACK')
}

const connectClient = async () => {
    //console.log("Mentiin connectClienttiin")
    return await pool.connect()
}

const releaseClient = async (client) => {
    return client.release()
}

//const connectClient = await pool.connect()
//const releaseClient = connectClient.release()

export {connectClient, releaseClient, beginTransaction, commitTransaction, rollbackTransaction}