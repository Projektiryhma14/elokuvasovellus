import express from 'express'
import cors from 'cors'
import pkg from 'pg'
import dotenv from 'dotenv'
import { compare, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'

import { authenticateToken } from './middleware/authenticateToken.js'

import { use } from 'react'

const { sign } = jwt

dotenv.config()

const port = 3001
const { Pool } = pkg

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const openDb = () => {
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    })
    return pool
}

app.get('/', (req, res) => {
    const pool = openDb()

    pool.query('SELECT * FROM users', (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }
        res.status(200).json(result.rows)
    })
})

app.get('/group', async (req, res) => {
    const pool = openDb()
    const userid = req.headers['userid']

    try{
        const userGroupResult = await pool.query(
            `SELECT groupid FROM users WHERE user_id=$1`, [userid]
        )

        const userGroupId = userGroupResult.rows[0].groupid

        const allGroupsResult = await pool.query(`SELECT * FROM groups`)
        const allGroups = allGroupsResult.rows

        const groupsWithFlag = allGroups.map(group => ({
            ...group,
            isUserGroup: group.group_id === userGroupId
        }))

        res.status(200).json(groupsWithFlag)

} catch(err) {
    console.error("Error with getting groups")
    res.status(500).json({error: err.message})
}
})

// Haetaan ryhmän tiedot ID:n perusteella
app.get('/group/:id', async (req, res, next) => {

    // Avataan tietokantayhteys ja otetaan ryhmän id vastaan frontista
    const pool = openDb()
    const groupId = req.params.id

    try {
        // Haetaan kaikki tarvittava data tietokannasta ja lisätään se result-muuttujaan
        const result = await pool.query(
            `SELECT 
        g.group_name, 
        g.group_description, 
        owner.user_id AS owner_id,
        owner.user_name AS owner_name, 
        member.user_name AS member_name,
        member.hasactivegrouprequest,
        member.groupid AS member_groupid,
        member.user_id
        FROM groups g
        JOIN users owner ON g.owner_id = owner.user_id
        JOIN users member ON g.group_id = member.groupid
        WHERE g.group_id = $1`, [groupId]
        )

        // Luodaan taulukko johon tallennetaan tietokantakyselyn kaikki rivit
        const rows = result.rows

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' })
        }

        // Luodaan group-olio 
        const group = {
            group_name: rows[0].group_name,
            group_description: rows[0].group_description,
            owner_id: rows[0].owner_id,
            owner_name: rows[0].owner_name,
            members: rows.map(r => ({ // Käydään kaikki jäsenet läpi
                member_name: r.member_name,
                hasactivegrouprequest: r.hasactivegrouprequest,
                member_groupid: r.member_groupid,
                member_id: r.user_id
            }))
        }
        res.status(200).json(group)

    } catch (err) {
        next(err)
    }
})

// SIGN UP //
app.post('/signup', (req, res, next) => {
    const pool = openDb()
    const user = req.body

    if (!user || !user.username || !user.email || !user.password) {
        return res.status(400).json({ error: "Email, username & password are required" })
    }

    const password = String(user.password)

    // Password: 8+merkkiä, 1 iso, 1 numero, 1 erikoismerkki
    const hasMinLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasDigit = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password);

    if (!(hasMinLength && hasUpper && hasDigit && hasSpecial)) {
        return res.status(400).json({
            error: 'Password must be at least 8 chars and include an uppercase letter, a digit, and special character'
        })
    }

    hash(user.password, 10, (err, hashedPassword) => {
        if (err) return next(err)

        pool.query(
            'INSERT INTO users (user_name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id AS id, email',
            [user.username.trim(), user.email.trim(), hashedPassword],
            (err, result) => {
                if (err) {
                    // Postgres unique violation
                    if (err.code === '23505') {
                        return res.status(409).json({ error: "Username or email already in use" })
                    }
                    return next(err)
                }
                const row = result.rows[0];
                console.log('RETURNED ROW:', result.rows[0])
                res.status(201).json({ id: row.id, email: row.email });

            }
        );
    });
});


app.post('/signin', (req, res, next) => {
    const pool = openDb()
    //const user = req.body
    const { username, password } = req.body
    if (!username || !password) {
        const error = new Error('Username & password are required')
        error.status = 400
        return next(error)
    }
    pool.query('SELECT * FROM users WHERE user_name = $1', [username], (err, result) => {
        if (err) return next(err)

        if (result.rows.length === 0) {
            const error = new Error('User not found')
            error.status = 404
            return next(error)
        }

        const dbUser = result.rows[0]

        compare(password, dbUser.password, (err, isMatch) => {
            if (err) return next(err)

            if (!isMatch) {
                const error = new Error('Invalid password')
                error.status = 401
                return next(error)
            }
        })

        const token = jwt.sign(
            { id: dbUser.user_id, email: dbUser.email, username: dbUser.user_name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        return res.status(200).json({
            id: dbUser.user_id,
            email: dbUser.email,
            username: dbUser.user_name,
            token,
        })

        {/*
        const token = sign({ user: dbUser.email }, process.env.JWT_SECRET)
        res.status(200).json({
            id: dbUser.user_id,
            email: dbUser.email,
            username: dbUser.user_name,
            token
        })
        */}

    })
})

// Käyttäjä on lähettänyt liittymispyynnön ryhmään
app.post('/group/joinrequest', async (req, res, next) => {

    // Avataan tietokantayhteys, luodaan yksittäinen tietokantayhteys transaktioita varten ja tuodaan muuttujat frontista
    const pool = openDb()
    const client = await pool.connect()
    const { userid, groupId, } = req.body

    if (!userid || !groupId) {
        const error = new Error('User, group or id missing')
        return next(error)
    }
    // Tehdään transaktio try-catch-lohkossa
    try {
        await client.query('BEGIN')

        // Haetaan käyttäjän hasActiveGroupRequest ja groupID:n arvot
        const activeRequestAndGroupid = await client.query(`SELECT hasactivegrouprequest, groupid FROM users WHERE user_id = $1`, [userid])

        // Tallennetaan saatu data muuttujiin
        const hasActiveGroupRequest = activeRequestAndGroupid.rows[0].hasactivegrouprequest
        const requestedgroupid = activeRequestAndGroupid.rows[0].groupid


      
    // Jos groupID ei ole null TAI hasActiveGroupRequest on true niin käyttäjä on jo ryhmässä tai käyttäjällä on jo aktiivinen liittymispyyntö ja tehdään rollback
    if(requestedgroupid !== null || hasActiveGroupRequest !== false) {
        console.log('User has already requested to join in another group')
        await client.query('ROLLBACK')
        return res.status(400).json({ error: 'Cant request to join in group because you are already in another group or you have active join request' }) 
    }


    // Päivitetään hasActiveGroupRequest trueksi ja groupID
    await client.query(`UPDATE users SET hasactivegrouprequest=true, groupid=$1 WHERE user_id=$2`, [groupId, userid])
    res.status(200).json({ message: 'Join request successful' })

    await client.query('COMMIT')    
}
catch(err) {
    await client.query('ROLLBACK')
    console.error('Transaktio epäonnistui', err)
    next(err)
} finally {
    // Palautetaan yhteys takaisin pooliin
    client.release()
}

})

// Käyttäjä peruu liittymispyynnön
app.post('/group/canceljoinrequest', (req, res, next) => {
    const pool = openDb()
    const userid = req.body.userid

        if(!userid) {
        const error = new Error('User is missing')
        return next(error)
    }
    try {
    pool.query(`UPDATE users SET groupid=null, hasactivegrouprequest=false WHERE user_id=$1`, [userid])
    return res.status(200).json({message: 'You have cancelled the join request'})

    } catch(err) {
    console.error(err)
    next(err)
    }
})


// Omistaja hyväksyy liittymispyynnön ryhmään
app.post('/group/acceptrequest', async (req, res, next) => {

    // Avataan tietokantayhteys ja otetaan muuttujat vastaan frontista
    const pool = openDb()
    const { userId, groupId } = req.body

    try {
        // Päivitetään hasActiveGroupRequest falseksi
        const result = await pool.query(
            `UPDATE users SET hasactivegrouprequest=false WHERE user_id=$1 AND groupid=$2`, [userId, groupId]
        )
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.status(200).json({ message: 'Join request accepted' })
    } catch (err) {
        next(err)
    }
})

// Omistaja hylkää liittymispyynnön ryhmään
app.post('/group/rejectrequest', async (req, res, next) => {

    // Avataan tietokantayhteys ja otetaan muuttujat vastaan frontista
    const pool = openDb()
    const { userId, groupId } = req.body

    try {
        // Päivitetään hasActiveGroupRequest falseksi ja groupID nulliksi
        const result = await pool.query(
            `UPDATE users SET hasactivegrouprequest=false, groupid=null WHERE user_id=$1 AND groupid=$2`, [userId, groupId]
        )
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.status(200).json({ message: 'Join request rejected' })
    } catch (err) {
        next(err)
    }
})


// Omistaja poistaa käyttäjän ryhmästä JA KÄYTTÄJÄ POISTUU RYHMÄSTÄ
app.post('/group/removemember', async (req,res,next) => {

    // Avataan tietokantayhteys ja otetaan muuttujat vastaan frontista
    const pool = openDb()
    const { userId, groupId } = req.body

    try {
        // Päivitetään groupID nulliksi
        const result = await pool.query(
            `UPDATE users SET groupid=null WHERE user_id=$1 AND groupid=$2`, [userId, groupId]
        )
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.status(200).json({message: 'User removed from the group'})
    } catch(err) {
        
    next(err)

    }
})



app.delete('/deleteuser/:id', async (req, res, next) => {
   
    const pool = openDb()
    const client = await pool.connect()
    const userId = req.params.id

    try {

        await client.query('BEGIN')

        // Katsotaan onko poistettava käyttäjä ryhmän omistaja
        const ownedGroupResult = await pool.query(
            `SELECT group_id FROM groups WHERE owner_id=$1`, [userId]
        )

        if(ownedGroupResult.rows.length !== 0){
            const groupId = ownedGroupResult.rows[0].group_id

            await pool.query(`UPDATE users SET groupid=null, hasactivegrouprequest=false WHERE groupid=$1`, [groupId])
        }

        await pool.query(
            `UPDATE users SET groupid=null WHERE user_id=$1`, [userId]
        )

        await pool.query(
            `DELETE FROM users WHERE user_id=$1`, [userId]
        )
        res.status(200).json({ message: 'User deleted' })
        await client.query('COMMIT')

        
    } catch (err) {
        await client.query('ROLLBACK')
        console.error('Transaktio epäonnistui', err)
        next(err)
    } finally {
        client.release()
    }

})

app.get('/reviews', (req, res) => {
    const pool = openDb()

    pool.query(
        `
        SELECT reviews.review_id, 
        reviews.movie_name,
        reviews.movie_id,
        reviews.movie_rating,
        reviews.movie_review,
        TO_CHAR(reviews.created_at, 'YYYY/MM/DD HH:MI') AS created_at,
        users.email FROM reviews 
        JOIN users ON reviews.user_id = users.user_id;
        `,
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.status(200).json(result.rows)

        })
})

//haetaan reviews-sivun dropdown-valikkoon elokuvat
app.get('/reviews/movies', (req, res) => {
    const pool = openDb()

    pool.query(
        `
        SELECT DISTINCT ON (movie_name) 
        movie_name, movie_id FROM reviews;
        `,
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.status(200).json(result.rows)
        }
    )
})

/*
tätä endpointtia kutsutaan, kun halutaan näyttää
arvostelusivulla vain yhden elokuvan arvostelut
*/
app.get('/reviews/:id', (req, res) => {
    const pool = openDb()
    const movieId = req.params.id

    pool.query(
        `
        SELECT reviews.review_id, 
        reviews.movie_name,
        reviews.movie_id,
        reviews.movie_rating,
        reviews.movie_review,
        TO_CHAR(reviews.created_at, 'YYYY/MM/DD HH:MI') AS created_at,
        users.email FROM reviews 
        JOIN users ON reviews.user_id = users.user_id
        WHERE reviews.movie_id = $1;
        `, [movieId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.status(200).json(result.rows)

        })
})


app.post("/reviews", authenticateToken, async (req, res) => {
    const pool = openDb()

    console.log("post /reviews body:", req.body)
    console.log("post /reviews user:", req.user)

    try {
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

        // SQL-kysely: lisätään arvostelu ja palautetaan luodun rivin id + aikaleima
        const query = `
            INSERT INTO reviews (movie_name, movie_rating, movie_review, user_id, movie_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING review_id, created_at
        `;

        // Parametrit turvallisesti taulukossa (estää SQL-injektiot)
        const values = [movie_name, rating, movie_review, user_id, movie_id];

        // Suoritetaan kysely tietokantaan
        const result = await pool.query(query, values)

        // Palautetaan 201 Created + pätkä luodusta rivistä
        return res.status(201).json({
            message: "Review created",
            review: result.rows[0],                 // {review_id, created_id}
        })
    } catch (err) {
        console.error("Error creating review:", err)
        return res.status(500).json({ error: "Sisäinen server error" })
    }
})

// Ryhmän luonti
app.post('/group/', async (req, res, next) => {

    // Avataan tietokantayhteys
    const pool = openDb()

    // Luodaan yksittäinen tietokantayhteys joka antaa täyden kontrollin transaktioihin ja kyselyihin
    const client = await pool.connect()

    // Tuodaan muuttujat axios-pyynnöstä

    const { groupname, username, description } = req.body
    
    // username on string joten luodaan muuttuja joka on INT
    const userId = Number(username)


    // Tarkistetaan, että groupname löytyy
    if (!groupname) {
        const error = new Error('Group name is required')
        return next(error)
    }

    // Tehdään transaktio try-catch-lohkossa
    try {
        await client.query('BEGIN')

        // Tehdään ensin kysely, jossa haetaan käyttäjän groupID
        const ownerGroupId = await client.query(
            'SELECT groupID FROM users WHERE user_id = $1', [userId]
        )


        // Otetaan datasta talteen käyttäjän groupID
        const currentGroupId = ownerGroupId.rows[0]?.groupid

        console.log(currentGroupId)
        console.log(ownerGroupId.rows[0]?.groupID)



        // Jos groupID ei ole null niin perutaan transaktio koska käyttäjä voi olla vain yhdessä ryhmässä
        if (currentGroupId !== null) {
            console.log('User is already in group')
            await client.query('ROLLBACK')
            // Lähetetään virheilmoitus fronttiin       

            return res.status(400).json({ error: 'Creating a group failed because you are already in another group or you have active join request' })        

        }

        // Luodaan muuttuja johon tallennetaan kyselyn vastaus
        const groupResult = await client.query(
            'INSERT INTO groups (group_name, owner_id, group_description) VALUES ($1, $2, $3) RETURNING *', [groupname, userId, description]
        )

        // Otetaan datasta talteen luodun ryhmän groupID
        const groupId = groupResult.rows[0].group_id
        console.log(groupId)

        // Päivitetään käyttäjän groupID
        await client.query(
            'UPDATE users SET groupID = $1 WHERE user_id = $2', [groupId, userId]
        )

        await client.query('COMMIT')
        res.status(201).json({ groupID: groupId, groupname: groupResult.rows[0].group_name })


    } catch (err) {
        // Jos jokin transaktion toimista epäonnistui niin tehdään rollback eli perutaan kaikki muutokset
        await client.query('ROLLBACK')
        console.error('Transaktio epäonnistui', err)
        next(err)
    } finally {
        // Palautetaan yhteys takaisin pooliin
        client.release()
    }
})

// Ryhmän poisto *TÄTÄ EI OLE VIELÄ KEHITETTY FRONTISSA*
app.delete('/group/:id', (req, res, next) => {
    const pool = openDb()
    const groupId = req.params.id


    pool.query('DELETE FROM groups WHERE group_id = $1 RETURNING *', [groupId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message })

        if (result.length === 0) {
            console.log('Ryhmää ei löydy')
            return res.status(404).json({ error: `Ryhmää ei löytynyt id:llä ${groupId}` })
        }
        console.log(`Poistettu Ryhmä jonka id on ${groupId}`)
        return res.status(200).json(result.rows[0])
    })
})

//HAETAAN KÄYTTÄJÄN SUOSIKIT
app.get('/favourites', (req, res) => {

    const pool = openDb()
    const { user_id } = req.query

    if (!user_id)
        return res.status(400).json({ error: 'User_id:tä ei löytynyt' })

    pool.query('SELECT * FROM favourites WHERE user_id = $1', [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }
        res.status(200).json(result.rows)
    })
})

//LISÄÄ UUSI SUOSIKKI
app.post('/favourites/create', (req, res) => {

    const pool = openDb()
    const { movie_name, user_id } = req.body

    if (!movie_name) {
        return res.status(400).json({ error: 'Elokuvan nimi puuttuu' })
    }

    pool.query(
        'INSERT INTO favourites (movie_name, user_id) VALUES ($1, $2) RETURNING *', [movie_name, user_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            }
            res.status(201).json(result.rows[0])
        })
})

//POISTA SUOSIKKI
app.delete('/favourites/delete/:id', (req, res) => {

    const pool = openDb()
    const favId = req.params.id
    console.log(req.params.id)
    const { user_id } = req.query

    pool.query('DELETE FROM favourites WHERE favourites_id = $1 AND user_id = $2 RETURNING*', [favId, user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message })

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Suosikkia ei löytynyt id:llä ${favId}` })
        }
        res.status(200).json(result.rows[0])
    }
    )
})


// GET /CHECK-EMAIL (duplikaatit)

app.get('/check-email', (req, res, next) => {
    const pool = openDb()
    const email = (req.query.email || '').trim()
    if (!email) return res.status(400).json({ error: 'email required' })

    pool.query(
        'SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
        [email],
        (err, result) => {
            if (err) return next(err)
            const exists = result.rowCount > 0
            res.json({ available: !exists })
        }
    )
})

// GET /CHECK-USERNAME (duplikaatit)
app.get('/check-username', (req, res, next) => {
    const pool = openDb()
    const username = (req.query.username || '').trim()
    if (!username) return res.status(400).json({ error: 'username required' })

    pool.query(
        'SELECT 1 FROM users WHERE LOWER(user_name) = LOWER($1) LIMIT 1',
        [username],
        (err, result) => {
            if (err) return next(err)
            const exists = result.rowCount > 0
            res.json({ available: !exists })
        }
    )
})

// RYHMÄN POISTO
app.put('/group/:id', async (req, res, next) => {
    
    const pool = openDb()
    const client = await pool.connect()
    const groupid = req.params.id
    

    try {
        await client.query('BEGIN')

        // Päivitetään ensin ryhmän jäsenien groupid nulliksi
        await client.query(
            `UPDATE users SET groupid=null WHERE groupid=$1`, [groupid]
        )
        
        // Poistetaan ryhmä
        await client.query(
            `DELETE FROM groups WHERE group_id=$1`, [groupid]
        )

        // Kommitoidaan
        await client.query('COMMIT')
        res.status(200).json({ message: "Group was deleted" })
        


    } catch (err) {
        // Jos jompikumpi kyselyistä epäonnistuu niin perutaan kaikki muutokset
        await client.query('ROLLBACK')
        console.error('Ryhmän poisto-transaktio epäonnistui', err)
        
        next(err)
    } finally {
        client.release()
    }
})

//Haetaan yksittäisen käyttäjän tiedot
app.get('/users/:id', (req, res) => {
    const pool = openDb()
    const userId = req.params.id

    pool.query('SELECT * FROM users WHERE user_id = $1', [userId], (err, result) => {
        if (err) return res.status(500).json({error: err.message})

        if (result.length === 0) {
            console.log("Käyttäjää ei löytynyt annetulla id:llä")
            return res.status(404).json({ error: `Käyttäjää ei löytynyt id:llä ${userId}` })
        }

        return res.status(200).json(result.rows[0])
    })

})

app.post('/sharedshowtimes', (req, res) => {

    if (!req.body) {
        return res.status(400).json({ error: 'Missing request body' })
    }

    const pool = openDb()
    console.log(req.body)
    //console.log(req.body.theatre)
    const {theatre, movieName, startTime, groupId, sharerId} = req.body
    /*
    console.log(theatre)
    console.log(movieName)
    console.log(startTime)
    console.log(groupId)
    console.log(sharerId)
    */
    if (!theatre || !movieName || !startTime || !groupId || !sharerId) {
        return res.status(400).json({ error: 'Request is missing necessary parameters' })
    }

    pool.query(
        `
        INSERT INTO sharedShowtimes 
        (theatre, movie_name, dateandtime, group_id, sharer_id) 
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [theatre, movieName, startTime, groupId, sharerId], (err, result) => {
            if (err) {
                return res.status(500).json({error: err.message})
            }
            res.status(201).json(result.rows[0])
        }
    )
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})