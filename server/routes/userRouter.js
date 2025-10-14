import { Router } from 'express'

import { getUsers, signIn, deleteUser, signUp, checkEmail, checkUsername, getUserById } from '../controllers/userController.js'

const router = Router()

router.get('/', getUsers)

router.post('/signin', signIn)

router.delete('/deleteuser/:id', deleteUser)

// SIGN UP //
router.post('/signup', signUp)

// GET /CHECK-EMAIL (duplikaatit)
router.get('/check-email', checkEmail)

// GET /CHECK-USERNAME (duplikaatit)
router.get('/check-username', checkUsername)

//Haetaan yksittäisen käyttäjän tiedot id:n perusteella
router.get('/users/:id', getUserById)

export default router