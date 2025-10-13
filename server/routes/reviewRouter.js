import { Router } from 'express'

import { getAllReviews, getReviewedMovies, getReviewsForOneMovie, postReview } from '../controllers/reviewController.js'

import { authenticateToken } from '../middleware/authenticateToken.js'

const router = Router()

router.get('/reviews', getAllReviews)
/*router.get('/reviews', (req, res) => {
    //const pool = openDb()

    //kellonaika joko 'HH12:MI am/AM' (12-hour clock) tai 'HH24:MI' (24-hour clock)
    pool.query(
        `
        SELECT reviews.review_id, 
        reviews.movie_name,
        reviews.movie_id,
        reviews.movie_rating,
        reviews.movie_review,
        TO_CHAR(reviews.created_at, 'YYYY/MM/DD HH24:MI') AS created_at,
        users.email FROM reviews 
        JOIN users ON reviews.user_id = users.user_id;
        `,
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.status(200).json(result.rows)

        })
})*/

//haetaan reviews-sivun dropdown-valikkoon elokuvat
router.get('/reviews/movies', getReviewedMovies)
/*router.get('/reviews/movies', (req, res) => {
    //const pool = openDb()

    pool.query(
        `
        SELECT DISTINCT ON (movie_name) 
        movie_name, movie_id FROM reviews;
        `,
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.status(200).json(result.rows)
        }
    )
})*/

/*
tätä endpointtia kutsutaan, kun halutaan näyttää
arvostelusivulla vain yhden elokuvan arvostelut
*/
router.get('/reviews/:id', getReviewsForOneMovie)
/*router.get('/reviews/:id', (req, res) => {
    //const pool = openDb()
    const movieId = req.params.id

    pool.query(
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
        `, [movieId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.status(200).json(result.rows)

        })
})*/

router.post('/reviews', authenticateToken, postReview)
/*router.post("/reviews", authenticateToken, async (req, res) => {
    //const pool = openDb()

    console.log("post /reviews body:", req.body)
    console.log("post /reviews user:", req.user)

    try {
        // Poimitaan kentät bodystä
        const { movie_name, movie_rating, movie_review, movie_id } = req.body


        // Haetaan käyttäjän id tokenista (asetettu middlewaressa)
        const user_id = req.user.id


        // perusvalidointi
        if (!movie_name ||
            movie_rating == null ||
            !movie_review ||
            !movie_id ||
            !user_id
        ) {
            return res.status(400).json({ error: "All fields are required" })
        }

        // Varmistetaan, että arvosana on välillä 1 -5
        const rating = Number(movie_rating)
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {         // .isFinite -> Palauttaa false jos ei ole numero
            return res.status(400).json({ error: "Rating must be 1 - 5" })
        }

        // SQL-kysely: lisätään arvostelu ja palautetaan luodun rivin id + aikaleima
        const query = `
            INSERT INTO reviews (movie_name, movie_rating, movie_review, user_id, movie_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING review_id, created_at
        `;

        // Parametrit turvallisesti taulukossa (estää SQL-injektiot)
        const values = [movie_name, rating, movie_review, user_id, movie_id];

        // Suoritetaan kysely tietokantaan
        const result = await pool.query(query, values)

        // Palautetaan 201 Created + pätkä luodusta rivistä
        return res.status(201).json({
            message: "Review created",
            review: result.rows[0],                 // {review_id, created_id}
        })
    } catch (err) {
        console.error("Error creating review:", err)
        return res.status(500).json({ error: "Sisäinen server error" })
    }
})*/

export default router