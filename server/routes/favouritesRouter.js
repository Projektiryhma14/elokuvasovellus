import { Router } from "express";
import { getUserFavourites, addNewFavourite, deleteFavourite, shareFavourite, unshareFavourite, getAllShared } from "../controllers/favouritesController.js";


const router = Router()

router.get('/favourites', getUserFavourites)
router.post('/favourites/create', addNewFavourite)
router.delete('/favourites/delete/:id', deleteFavourite)
router.post('/favourites/share', shareFavourite)
router.post('/favourites/unshare', unshareFavourite)
router.get('/favourites/shared', getAllShared)


export default router