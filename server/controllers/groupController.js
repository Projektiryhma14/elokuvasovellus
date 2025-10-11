import { pool } from "../helper/db.js";
import {
    selectUsersGroup, selectAllGroups, selectGroupInfo, selectActiveRequestAndGroupid,
    updateRequestToJoin, updateCancelRequestToJoin, updateActiveRequestFalse, updateGroupIdNull,
    insertGroup, updateGroupId, updateAllMembersNull, updateDeleteGroup} from '../models/groupModel.js'


const getGroups = async (req, res, next) => {
    try {
        const userid = req.headers['userid']
        const userGroupResult = await selectUsersGroup(userid)
        const userGroupId = userGroupResult.rows[0].groupid
        const allGroupsResult = await selectAllGroups()
        const allGroups = allGroupsResult.rows
        const groupsWithFlag = allGroups.map(group => ({
            ...group,
            isUserGroup: group.group_id === userGroupId
        }))

        res.status(200).json(groupsWithFlag)

    } catch (err) {
        console.error("Error with getting groups")
        return next(err)
    }
}

// Haetaan ryhmän tiedot ID:n perusteella
const getGroupInfo = async (req, res, next) => {
    try {
        // Otetaan ryhmän id vastaan frontista
        const groupId = req.params.id
        // Haetaan kaikki tarvittava data tietokannasta ja lisätään se result-muuttujaan
        const result = await selectGroupInfo(groupId)

        // Luodaan taulukko johon tallennetaan tietokantakyselyn kaikki rivit
        const rows = result.rows

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' })
            return next(err)
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
    }
    catch (err) {
        next(err)
    }
}

// Käyttäjä on lähettänyt liittymispyynnön ryhmään
const requestToJoin = async (req, res, next) => {

    // Luodaan yksittäinen tietokantayhteys transaktioita varten
    const client = await pool.connect()

    // Tehdään transaktio try-catch-lohkossa
    try {
        // Tuodaan muuttujat frontista
        const { userid, groupId, } = req.body

        if (!userid || !groupId) {
            const error = new Error('User, group or id missing')
            return next(error)
        }
        await client.query('BEGIN')

        // Haetaan käyttäjän hasActiveGroupRequest ja groupID:n arvot
        const activeRequestAndGroupid = await selectActiveRequestAndGroupid(userid)

        // Tallennetaan saatu data muuttujiin
        const hasActiveGroupRequest = activeRequestAndGroupid.rows[0].hasactivegrouprequest
        const requestedgroupid = activeRequestAndGroupid.rows[0].groupid



        // Jos groupID ei ole null TAI hasActiveGroupRequest on true niin käyttäjä on jo ryhmässä tai käyttäjällä on jo aktiivinen liittymispyyntö ja tehdään rollback
        if (requestedgroupid !== null || hasActiveGroupRequest !== false) {
            console.log('User has already requested to join in another group')
            await client.query('ROLLBACK')
            return res.status(400).json({ error: 'Cant request to join in group because you are already in another group or you have active join request' })
        }


        // Päivitetään hasActiveGroupRequest trueksi ja groupID
        await updateRequestToJoin(groupId, userid)
        res.status(200).json({ message: 'Join request successful' })

        await client.query('COMMIT')
    }
    catch (err) {
        await client.query('ROLLBACK')
        console.error('Transaktio epäonnistui', err)
        next(err)
    } finally {
        // Palautetaan yhteys takaisin pooliin
        client.release()
    }

}

// Käyttäjä peruu liittymispyynnön
const cancelJoinRequest = async (req, res, next) => {
    try {
        const userid = req.body.userid
        if (!userid) {
            const error = new Error('User is missing')
            return next(error)
        }
        await updateCancelRequestToJoin(userid)
        return res.status(200).json({ message: 'You have cancelled the join request' })

    } catch (err) {
        console.error(err)
        next(err)
    }
}

// Omistaja hyväksyy liittymispyynnön ryhmään
const acceptRequest = async (req, res, next) => {
    try {
        // Otetaan muuttujat vastaan frontista
        const { userId, groupId } = req.body
        // Päivitetään hasActiveGroupRequest falseksi
        const result = await updateActiveRequestFalse(userId, groupId)

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.status(200).json({ message: 'Join request accepted' })
    } catch (err) {
        next(err)
    }
}

// Omistaja hylkää liittymispyynnön ryhmään
const rejectRequest = async (req, res, next) => {
    try {
        // Otetaan muuttujat vastaan frontista
        const { userId, groupId } = req.body
        // Päivitetään hasActiveGroupRequest falseksi ja groupID nulliksi
        const result = updateGroupIdNull(userId, groupId)
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.status(200).json({ message: 'Join request rejected' })
    } catch (err) {
        next(err)
    }
}

// Omistaja poistaa käyttäjän ryhmästä TAI KÄYTTÄJÄ POISTUU RYHMÄSTÄ
const removeMember = async (req, res, next) => {
    try {
        // Otetaan muuttujat vastaan frontista
        const { userId, groupId } = req.body
        // Päivitetään groupID nulliksi
        const result = updateGroupIdNull(userId, groupId)
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.status(200).json({ message: 'User removed from the group' })
    } catch (err) {
        next(err)
    }
}

// Ryhmän luonti
const createGroup = async (req, res, next) => {

    // Luodaan yksittäinen tietokantayhteys joka antaa täyden kontrollin transaktioihin ja kyselyihin
    const client = await pool.connect()
    // Tehdään transaktio try-catch-lohkossa
    try {
        // Tuodaan muuttujat axios-pyynnöstä
        const { groupName, userId, description } = req.body

        // Tarkistetaan, että groupname löytyy
        if (!groupName) {
            const error = new Error('Group name is required')
            return next(error)
        }
        await client.query('BEGIN')

        // Tehdään ensin kysely, jossa haetaan käyttäjän groupID
        const result = await selectUsersGroup(userId)

        // Otetaan datasta talteen käyttäjän groupID
        const currentGroupId = result.rows[0]?.groupid

        // Jos groupID ei ole null niin perutaan transaktio koska käyttäjä voi olla vain yhdessä ryhmässä
        if (currentGroupId !== null) {
            console.log('User is already in group')
            await client.query('ROLLBACK')
            // Lähetetään virheilmoitus fronttiin       
            return res.status(400).json({ error: 'Creating a group failed because you are already in another group or you have active join request' })
        }

        // Luodaan muuttuja johon tallennetaan kyselyn vastaus
        const groupResult = await insertGroup(groupName, userId, description)

        // Otetaan datasta talteen luodun ryhmän groupID
        const groupId = groupResult.rows[0].group_id

        // Päivitetään käyttäjän groupID
        await updateGroupId(groupId, userId)

        await client.query('COMMIT')
        res.status(201).json({ groupID: groupId, groupName: groupResult.rows[0].group_name })

    } catch (err) {
        // Jos jokin transaktion toimista epäonnistui niin tehdään rollback eli perutaan kaikki muutokset
        await client.query('ROLLBACK')
        console.error('Transaktio epäonnistui', err)
        next(err)
    } finally {
        // Palautetaan yhteys takaisin pooliin
        client.release()
    }
}

// RYHMÄN POISTO
const deleteGroup = async (req, res, next) => {

    const client = await pool.connect()
    
    try {
        const groupid = req.params.id
        await client.query('BEGIN')

        // Päivitetään ensin ryhmän jäsenien groupid nulliksi
        await updateAllMembersNull(groupid)

        // Poistetaan ryhmä
        await updateDeleteGroup(groupid)

        // Kommitoidaan
        await client.query('COMMIT')
        res.status(200).json({ message: "Group was deleted" })
    } 
    catch (err) {
        // Jos jompikumpi kyselyistä epäonnistuu niin perutaan kaikki muutokset
        await client.query('ROLLBACK')
        console.error('Ryhmän poisto-transaktio epäonnistui', err)

        next(err)
    } finally {
        client.release()
    }
}


export { getGroups, getGroupInfo, requestToJoin, cancelJoinRequest, acceptRequest, rejectRequest, removeMember, createGroup, deleteGroup }

