import { insertShowtime, selectShowtimesByGroupId, deleteShowtime } from '../models/sharedShowtimesModel.js'

const addSharedShowtime = async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Missing request body' })
        }
        //console.log(req.body)
        const { theatre, movieName, startTime, groupId, sharerId } = req.body

        if (!theatre || !movieName || !startTime || !groupId || !sharerId) {
            return res.status(400).json({ error: 'Request is missing necessary parameters' })
        }

        const params = [theatre, movieName, startTime, groupId, sharerId]

        const result = await insertShowtime(params)
        res.status(201).json(result.rows[0])
    }
    catch (err) {
        return next(err)
    }
}

const getShowtimesForGroup = async (req, res, next) => {
    try {
        const groupId = req.params.id

        if (!groupId) {
            return res.status(400).json({ error: 'Request is missing necessary parameters' })
        }

        const result = await selectShowtimesByGroupId(groupId)
        res.status(201).json(result.rows)
    }
    catch (err) {
        return next(err)
    }
}

const deleteSharedShowtime = async (req, res, next) => {
    try {
        const showtimeId = req.params.id

        if (!showtimeId) {
            return res.status(400).json({ error: 'Request is missing necessary parameters' })
        }

        const result = await deleteShowtime(showtimeId)
        res.status(201).json(result.rows[0])
    }
    catch (err) {
        return next(err)
    }
}

export { addSharedShowtime, getShowtimesForGroup, deleteSharedShowtime }