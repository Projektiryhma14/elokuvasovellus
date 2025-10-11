import { selectUserFavourites, insertFavourites, deleteUserFavourite,
    select1FromFavourite, selectSharedFavourites, setFavouritesIsShared,
    resetFavouritesIsShared, selectAllShared } from '../models/favouritesModel.js'

//HAETAAN KÄYTTÄJÄN SUOSIKIT
const getUserFavourites = async (req, res, next) => {
    try {
        const { user_id } = req.query
        if (!user_id)
            return res.status(400).json({ error: 'User_id not found' })

        const result = await selectUserFavourites(user_id)

        res.status(200).json(result.rows)

    }
    catch (err) {
        console.error("Error with getting users favourites")
        return next(err)
    }
}

//LISÄÄ UUSI SUOSIKKI
const addNewFavourite = async (req, res) => {
    try {
        const { movie_name, user_id } = req.body
        if (!movie_name) {
            return res.status(400).json({ error: 'Movie name missing!' })
        }

        const result = await insertFavourites(movie_name, user_id)
        res.status(201).json(result.rows[0])
    }
    catch (err) {
        console.error("Error with inserting new favourite")
        next(err)
    }
}

//POISTA SUOSIKKI
const deleteFavourite = async (req, res, next) => {

    try {
        const favId = req.params.id
        console.log(req.params.id)
        const { user_id } = req.query

        const result = await deleteUserFavourite(favId, user_id)

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Favourite not found by id: ${favId}` })
        }
        res.status(200).json(result.rows[0])


    }
    catch (err) {
        console.error("Error with deleting favourite")
        return next(err)
    }
}

//JAA SUOSIKKI
const shareFavourite = async (req, res, next) => {
    try {
        const { user_id } = req.body
        if (!user_id)
            return res.status(400).json({ error: "user_id not found" })

        //Tarkistetaan että käyttäjällä on vähintään yksi suosikki
        const { rows } = await select1FromFavourite(user_id)

        if (rows.length === 0) {
            return res.status(400).json({ error: "Add atleast one favourite movie before sharing your favourites list" })
        }

        //Estetään että jakoa ei voi tehdä useampaa kertaa
        const alreadyShared = await selectSharedFavourites(user_id)

        if (alreadyShared.rows[0].favourites_is_shared) {
            return res.status(409).json({ error: "Favourite list is already shared" })
        }

        //Ilmoita kun jaettu ja tallenna aikeleima
        await setFavouritesIsShared(user_id)
        return res.status(200).json({ message: "Favourite list is now shared!" })

    } catch (err) {
        console.error("Error with sharing favourites list")
        next(err)
    }
}

//PERU SUOSIKKILISTAN JAKO
const unshareFavourite = async (req, res, next) => {
    //Nollaa favourites_is_shared ja aikaleima
    try {
        const { user_id } = req.body
        if (!user_id)
            return res.status(400).json({ error: "user_id not found" })
        const result = await resetFavouritesIsShared(user_id)

        if (result.rowCount === 0) {
            return res.status(409).json({ error: "Favourites list is not shared" })
        }

        return res.status(200).json({ message: "Favourites unshared!" })
    } catch (err) {
        console.error(err)
        next(err)
    }
}

//HAE JAETTUJEN SUOSIKKILISTOJEN KÄYTTÄJÄNIMET LISTAAN UUSIMMASTA VANHIMPAAN
const getAllShared = async (req, res, next) => {
    try {
        const sharedList = await selectAllShared()
        return res.json(sharedList.rows)
    } catch (err) {
        console.error(err)
        next(err)
    }
}


export { getUserFavourites, addNewFavourite, deleteFavourite, shareFavourite, unshareFavourite, getAllShared }