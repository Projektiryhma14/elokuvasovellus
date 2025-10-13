import { pool } from '../helper/db.js'

const selectAllReviews = async () => {
    //kellonaika joko 'HH12:MI am/AM' (12-hour clock) tai 'HH24:MI' (24-hour clock)
    return await pool.query(
        `
        SELECT reviews.review_id, 
        reviews.movie_name,
        reviews.movie_id,
        reviews.movie_rating,
        reviews.movie_review,
        TO_CHAR(reviews.created_at, 'YYYY/MM/DD HH24:MI') AS created_at,
        users.email FROM reviews 
        JOIN users ON reviews.user_id = users.user_id;
        `)
}

const selectDistinctMovies = async () => {
    return await pool.query(
            `
        SELECT DISTINCT ON (movie_name) 
        movie_name, movie_id FROM reviews;
        `)
}

const selectReviewsByMovieId = async (movieId) => {
    //kellonaika joko 'HH12:MI am/AM' (12-hour clock) tai 'HH24:MI' (24-hour clock)
    return await pool.query(
        `
        SELECT reviews.review_id, 
        reviews.movie_name,
        reviews.movie_id,
        reviews.movie_rating,
        reviews.movie_review,
        TO_CHAR(reviews.created_at, 'YYYY/MM/DD HH24:MI') AS created_at,
        users.email FROM reviews 
        JOIN users ON reviews.user_id = users.user_id
        WHERE reviews.movie_id = $1;
        `, [movieId])
}

const insertReview = async (values) => {
    const query = `
            INSERT INTO reviews (movie_name, movie_rating, movie_review, user_id, movie_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING review_id, created_at
        `
    return await pool.query(query, values)
}

export { selectAllReviews, selectDistinctMovies, selectReviewsByMovieId, insertReview }