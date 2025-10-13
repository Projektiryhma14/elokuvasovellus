import { selectAllReviews, selectDistinctMovies, selectReviewsByMovieId, insertReview } from '../models/reviewModel.js'


const getAllReviews = async (req, res, next) => {
    try {
        const result = await selectAllReviews()
        res.status(200).json(result.rows)
    }
    catch (err) {
        return next(err)
    }
}

const getReviewedMovies = async (req, res, next) => {
    try {
        const result = await selectDistinctMovies()
        res.status(200).json(result.rows)
    }
    catch (err) {
        return next(err)
    }
}

const getReviewsForOneMovie = async (req, res, next) => {
    try {
        const movieId = req.params.id
        if (!movieId) {
            console.log("Request missing required id parameter")
            return res.status(400).json({ error: `Request missing required id parameter` })
        }
        const result = await selectReviewsByMovieId(movieId)
        res.status(200).json(result.rows)
    }
    catch (err) {
        return next(err)
    }
}

const postReview = async (req, res) => {

    try {
        console.log("post /reviews body:", req.body)
        console.log("post /reviews user:", req.user)
        
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

        // Parametrit turvallisesti taulukossa (estää SQL-injektiot)
        const values = [movie_name, rating, movie_review, user_id, movie_id];

        // SQL-kysely: lisätään arvostelu ja palautetaan luodun rivin id + aikaleima
        /*const query = `
            INSERT INTO reviews (movie_name, movie_rating, movie_review, user_id, movie_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING review_id, created_at
        `;*/

        // Suoritetaan kysely tietokantaan
        //const result = await pool.query(query, values)
        const result = await insertReview(values)

        // Palautetaan 201 Created + pätkä luodusta rivistä
        return res.status(201).json({
            message: "Review created",
            review: result.rows[0],                 // {review_id, created_id}
        })
    } catch (err) {
        console.error("Error creating review:", err)
        return res.status(500).json({ error: "Internal server error" })
    }
}

export { getAllReviews, getReviewedMovies, getReviewsForOneMovie, postReview }