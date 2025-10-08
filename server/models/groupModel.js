import {pool} from '../helper/db.js'

const selectOwner = async (userId) => {
    return await pool.query('SELECT group_id FROM groups WHERE owner_id=$1', [userId])
}

export {selectOwner}