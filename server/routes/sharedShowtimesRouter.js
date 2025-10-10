import { Router } from 'express'

import { addSharedShowtime, getGroupShowtimes, deleteSharedShowtime } from '../controllers/sharedShowtimesController.js'

const router = Router()

router.post('/sharedshowtimes', addSharedShowtime)

router.get('/sharedshowtimes/group/:id', getGroupShowtimes)

router.delete('/sharedshowtimes/:id', deleteSharedShowtime)

export default router