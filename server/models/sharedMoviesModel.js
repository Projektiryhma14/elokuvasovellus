import { pool } from '../helper/db.js'

const insertMovie = async (params) => {
    return await pool.query(
        `
        INSERT INTO sharedMovies 
        (movie_name, group_id, sharer_id) 
        VALUES ($1, $2, $3) 
        RETURNING *
        `, params
    )
}

const selectMoviesByGroupId = async (groupId) => {
    return await pool.query('SELECT * FROM sharedmovies WHERE group_id=$1', [groupId])
}

const deleteMovie = async (sharedMovieId) => {
    return await pool.query('DELETE FROM sharedMovies WHERE shared_movie_id=$1 RETURNING *', [sharedMovieId])
}

export { insertMovie, selectMoviesByGroupId, deleteMovie }