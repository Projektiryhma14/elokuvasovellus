import { Router } from 'express'

import { addSharedShowtime, getShowtimesForGroup, deleteSharedShowtime } from '../controllers/sharedShowtimesController.js'

const router = Router()

router.post('/sharedshowtimes', addSharedShowtime)

router.get('/sharedshowtimes/group/:id', getShowtimesForGroup)

router.delete('/sharedshowtimes/:id', deleteSharedShowtime)

export default router