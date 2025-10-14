import { Router } from 'express'

import { getAllReviews, getReviewedMovies, getReviewsForOneMovie, postReview } from '../controllers/reviewController.js'

import { authenticateToken } from '../middleware/authenticateToken.js'

const router = Router()

router.get('/reviews', getAllReviews)

//haetaan reviews-sivun dropdown-valikkoon elokuvat
router.get('/reviews/movies', getReviewedMovies)

/*
tätä endpointtia kutsutaan, kun halutaan näyttää
arvostelusivulla vain yhden elokuvan arvostelut
*/
router.get('/reviews/:id', getReviewsForOneMovie)

router.post('/reviews', authenticateToken, postReview)

export default router