import { Router } from 'express'

import { addSharedMovie, getGroupMovies, deleteSharedMovie } from '../controllers/sharedMoviesController.js'

const router = Router()

router.post('/sharedmovies', addSharedMovie)

router.get('/sharedmovies/group/:id', getGroupMovies)

router.delete('/sharedmovies/:id', deleteSharedMovie)

export default router