import { pool } from "../helper/db.js"

const selectUserFavourites = async(user_id) => {
    return await pool.query('SELECT * FROM favourites WHERE user_id = $1', [user_id])
}

const insertFavourites = async(movie_name, user_id) => {
    return await pool.query('INSERT INTO favourites (movie_name, user_id) VALUES ($1, $2) RETURNING *', [movie_name, user_id])
}

const deleteUserFavourite = async (favId, user_id) => {
    return await pool.query('DELETE FROM favourites WHERE favourites_id = $1 AND user_id = $2 RETURNING*', [favId, user_id])
}

const select1FromFavourite = async(user_id) => {
    return await pool.query(`SELECT 1 FROM favourites WHERE user_id = $1`, [user_id])
}

const selectSharedFavourites = async(user_id) => {
    return await pool.query("SELECT favourites_is_shared FROM users WHERE user_id = $1", [user_id])
}

const setFavouritesIsShared = async(user_id) => {
    return await pool.query(`UPDATE users SET favourites_is_shared = true, 
            favourites_shared_at = NOW() WHERE user_id = $1`, [user_id])
}

const resetFavouritesIsShared = async(user_id) => {
    return await pool.query(`UPDATE users SET favourites_is_shared = false, 
            favourites_shared_at = NULL WHERE user_id = $1 
            AND favourites_is_shared = true`, [user_id])
}

const selectAllShared = async() => {
    return await pool.query(`SELECT user_id, user_name
            FROM users
            WHERE favourites_is_shared = true
            ORDER BY favourites_shared_at DESC`)
}


export { selectUserFavourites, insertFavourites, deleteUserFavourite, select1FromFavourite,
selectSharedFavourites, setFavouritesIsShared, resetFavouritesIsShared, selectAllShared }