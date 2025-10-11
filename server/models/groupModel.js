import {pool} from '../helper/db.js'

const selectOwner = async (userId) => {
    return await pool.query('SELECT group_id FROM groups WHERE owner_id=$1', [userId])
}

const selectUsersGroup = async(userId) => {
    return await pool.query(`SELECT groupid FROM users WHERE user_id=$1`, [userId])
}

const selectAllGroups = async () => {
    return await pool.query(`SELECT * FROM groups`)
}

const selectGroupInfo = async (groupId) => {
    return await pool.query(`SELECT 
        g.group_name, 
        g.group_description, 
        owner.user_id AS owner_id,
        owner.user_name AS owner_name, 
        member.user_name AS member_name,
        member.hasactivegrouprequest,
        member.groupid AS member_groupid,
        member.user_id
        FROM groups g
        JOIN users owner ON g.owner_id = owner.user_id
        JOIN users member ON g.group_id = member.groupid
        WHERE g.group_id = $1`, [groupId])
}

const selectActiveRequestAndGroupid = async(userid) => {
    return await pool.query(`SELECT hasactivegrouprequest, groupid FROM users WHERE user_id = $1`, [userid])
}

const updateRequestToJoin = async (groupId, userid) => {
    return await pool.query(`UPDATE users SET hasactivegrouprequest=true, groupid=$1 WHERE user_id=$2`, [groupId, userid])
}

const updateCancelRequestToJoin = async(userid) => {
    return await pool.query(`UPDATE users SET groupid=null, hasactivegrouprequest=false WHERE user_id=$1`, [userid])
}

const updateActiveRequestFalse = async(userId, groupId) => {
    return await pool.query(`UPDATE users SET hasactivegrouprequest=false WHERE user_id=$1 AND groupid=$2`, [userId, groupId])
}

const updateGroupIdNull = async(userId, groupId) => {
    return await pool.query(`UPDATE users SET hasactivegrouprequest=false, groupid=null WHERE user_id=$1 AND groupid=$2`, [userId, groupId])
}

const insertGroup = async(groupname, userId, description) => {
    return await pool.query('INSERT INTO groups (group_name, owner_id, group_description) VALUES ($1, $2, $3) RETURNING *', [groupname, userId, description])
}

const updateGroupId = async(groupId, userId) => {
    return await pool.query('UPDATE users SET groupID = $1 WHERE user_id = $2', [groupId, userId])
}

const updateAllMembersNull = async(groupid) => {
    return await pool.query(`UPDATE users SET groupid=null, hasactivegrouprequest=false WHERE groupid=$1`, [groupid])
}

const updateDeleteGroup = async(groupid) => {
    return await pool.query(`DELETE FROM groups WHERE group_id=$1`, [groupid])
}

export {selectOwner, selectUsersGroup, selectAllGroups, selectGroupInfo,
selectActiveRequestAndGroupid, updateRequestToJoin, updateCancelRequestToJoin,
updateActiveRequestFalse, updateGroupIdNull, insertGroup, updateGroupId, updateAllMembersNull, updateDeleteGroup}