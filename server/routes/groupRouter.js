import { Router } from "express";
import {getGroups, getGroupInfo, requestToJoin, cancelJoinRequest, acceptRequest, rejectRequest, removeMember, createGroup, deleteGroup} from '../controllers/groupController.js'


const router = Router()

router.get('/group', getGroups)
router.get('/group/:id', getGroupInfo)
router.post('/group/joinrequest', requestToJoin)
router.post('/group/canceljoinrequest', cancelJoinRequest)
router.post('/group/acceptrequest', acceptRequest)
router.post('/group/rejectrequest', rejectRequest)
router.post('/group/removemember', removeMember)
router.post('/group/', createGroup)
router.delete('/group/:id', deleteGroup)


export default router