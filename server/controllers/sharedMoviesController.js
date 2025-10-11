import { insertMovie, selectMoviesByGroupId, deleteMovie } from '../models/sharedMoviesModel.js'

const addSharedMovie = async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Missing request body' })
        }
        //console.log(req.body)
        const { movieName, groupId, sharerId } = req.body
        //console.log("leffan nimi: " + movieName)
        //console.log("ryhmän id: " + groupId)
        //console.log("jakajan id: " + sharerId)
        if (!movieName || !groupId || !sharerId) {
            return res.status(400).json({ error: 'Request is missing necessary parameters' })
        }
        const params = [movieName, groupId, sharerId]
        const result = await insertMovie(params)

        res.status(201).json(result.rows[0])
    }
    catch (err) {
        return next(err)
    }
}

const getGroupMovies = async (req, res, next) => {
    try {
        const groupId = req.params.id
        if (!groupId) {
            return res.status(400).json({ error: 'Request is missing necessary parameters' })
        }

        const result = await selectMoviesByGroupId(groupId)
        res.status(201).json(result.rows)
        /*
        pool.query('SELECT * FROM sharedmovies WHERE group_id=$1', [groupId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.status(201).json(result.rows)
        })
        */
        //console.log(groupId)
    }
    catch (err) {
        return next(err)
    }   
}

const deleteSharedMovie = async (req, res, next) => {
    try {
        const sharedMovieId = req.params.id
        if (!sharedMovieId) {
            return res.status(400).json({ error: 'Request is missing necessary parameters' })
        }
        const result = await deleteMovie(sharedMovieId)
        res.status(201).json(result.rows[0])
        /*
        pool.query('DELETE FROM sharedMovies WHERE shared_movie_id=$1 RETURNING *', [sharedMovieId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.status(201).json(result.rows[0])
        })
        */
    }
    catch (err) {
        return next(err)
    }
}

export { addSharedMovie, getGroupMovies, deleteSharedMovie }