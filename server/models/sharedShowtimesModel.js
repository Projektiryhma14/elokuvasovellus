import { pool } from '../helper/db.js'

const insertShowtime = async (params) => {
    
    return await pool.query(
        `
        INSERT INTO sharedShowtimes 
        (theatre, movie_name, dateandtime, group_id, sharer_id) 
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING *
        `, params)
}

const selectShowtimesByGroupId = async (groupId) => {
    return await pool.query('SELECT * FROM sharedshowtimes WHERE group_id=$1', [groupId])
}

const deleteShowtime = async (showtimeId) => {
    return await pool.query('DELETE FROM sharedShowtimes WHERE shared_showtime_id=$1 RETURNING *', [showtimeId])
}

export { insertShowtime, selectShowtimesByGroupId, deleteShowtime }