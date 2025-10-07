import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import styles from './GroupProfile.module.css'
import GroupShowtimes from '../assets/components/GroupShowtimes.jsx'
import GroupMovies from '../assets/components/GroupMovies.jsx'

export default function GroupProfile() {
  // Haetaan ryhmän ID parametreistä
  const { id } = useParams()

  // Tilamuuttujat
  const [group, setGroup] = useState(null)
  //const [description, setDescription] = useState(null)
  const url = import.meta.env.VITE_API_BASE_URL
  const [members, setMembers] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const userid = sessionStorage.getItem("user_id")
  const navigate = useNavigate()

  // Haetaan ryhmän tiedot kun sivu avataan
  useEffect(() => {
    fetchGroup()
    axios.get(`${url}/group/${id}`)
      .then(response => {
        setGroup(response.data)

        // Haetaan liittymispyynnöt eli ne käyttäjät joiden GroupID täsmää ja hasActiveGroupRequest on true
        const joinRequests = response.data.members.filter(m => m.hasactivegrouprequest === true)

        // Ryhmän jäseniä ovat ne joiden GroupID täsmää ja hasActiveGroupRequest on false
        const confirmedMembers = response.data.members.filter(m => m.hasactivegrouprequest === false)

        // Asetetaan jäsenet ja liittymispyynnöt
        setMembers(confirmedMembers)
        setPendingRequests(joinRequests)
      })

      .catch(err => {
        console.error('Virhe ryhmän haussa:', err)
      })
  }, [id])

  // Haetaan ryhmän tiedot uudestaan aina kun liittymispyyntö on lähetetty tai se perutaan
  const fetchGroup = async () => {
  try {
    const response = await axios.get(`${url}/group/${id}`)
    setGroup(response.data)

    const joinRequests = response.data.members.filter(m => m.hasactivegrouprequest === true)
    const confirmedMembers = response.data.members.filter(m => m.hasactivegrouprequest === false)

    setMembers(confirmedMembers)
    setPendingRequests(joinRequests)
  } catch (err) {
    console.error('Virhe ryhmän haussa:', err)
  }
}

  // Vieras-käyttäjä lähettää liittymispyynnön
  const handleClick = async (e) => {
    e.preventDefault()

    axios.post(`${url}/group/joinrequest`, {
      // Välitetään käyttäjän userID ja groupID backendille
      userid,
      groupId: id
    })
      .then(response => {
        setStatusMessage(response.data.message)
        fetchGroup()
      })
      .catch(err => {
        const error = err.response.data.error
        setStatusMessage(error)
        console.error(err)
      })
  }

  // Käyttäjä peruu liittymispyynnön
  const handleCancelJoinRequest = async (e) => {
    e.preventDefault()

    axios.post(`${url}/group/canceljoinrequest`, {
      // Välitetään käyttäjän userID backendille
      userid
    })
      .then(response => {
        setStatusMessage(response.data.message)
        fetchGroup()
      })
      .catch(err => {
        const error = err.response.data.error
        setStatusMessage(error)
        console.error(err)
      })
  }

  // Omistaja hyväksyy liittymispyynnön
  const acceptRequest = async (memberId) => {

    try {
      const response = await axios.post(`${url}/group/acceptrequest`, {
        userId: memberId,
        groupId: id
      })
      // Poistetaan käyttäjä liittymispyynnöt-listasta ja lisätään jäsen-listaan
      setPendingRequests(prev => prev.filter(m => m.member_id !== memberId))
      const acceptedMember = pendingRequests.find(m => m.member_id === memberId)
      setMembers(prev => [...prev, { ...acceptedMember, hasactivegrouprequest: false }])
    } catch (err) {
      const error = err.response?.data?.error
      console.error(err)
    }

  }
  // Omistaja hylkää liittymispyynnön
  const rejectRequest = async (memberId) => {

    try {
      const response = await axios.post(`${url}/group/rejectrequest`, {
        userId: memberId,
        groupId: id
      })
      // Poistetaan käyttäjä liittymispyynnöt-listasta
      setPendingRequests(prev => prev.filter(m => m.member_id !== memberId))
    } catch (err) {
      const error = err.response?.data?.error
      console.error(err)
    }

  }
  // Omistaja poistaa käyttäjän ryhmästä
  const removeMember = async (memberId) => {

    try {
      const response = await axios.post(`${url}/group/removemember`, {
        userId: memberId,
        groupId: id
      })
      // Poistetaan käyttäjä jäsen-listasta
      setMembers(prev => prev.filter(m => m.member_id !== memberId))
    } catch (err) {
      const error = err.response?.data?.error
      console.error(err)
    }

  }


    // Käyttäjä poistuu ryhmästä (Käytetään samaa endpointtia kuin Omistaja poistaa käyttäjän ryhmästä)
  const handleLeaveGroup = async (e) => {
    e.preventDefault()

    axios.post(`${url}/group/removemember`, {
      userId: userid,
      groupId: id
    })
    .then(response => {
      setStatusMessage(response.data.message)
      // Ohjataan käyttäjä pois ryhmän sivulta jotta käyttäjä ei enää näe käyttäjille tarkoitettua sisältöä
      navigate("/group", { replace: true, state: { flash: "You have left from the group", from: "group" } });
    })
    .catch(err => {
      const error = err.response.data.error
      setStatusMessage(error)
      console.error(err)
    })
  }


  // Omistaja poistaa ryhmän
  const deleteGroup = async () => {
  
    const confirmed = window.confirm("Do you really want to delete the group?")
    if(!confirmed) return
    
    axios.put(`${url}/group/${id}`, {
      
      
    })
      .then(response => {
        // Ohjataan omistaja pois ryhmän sivulta
        navigate("/group", { replace: true, state: { flash: "The group has been deleted", from: "group" } });
      })
      .catch(err => {
        const error = err.response.data.error
        setStatusMessage(error)
      })
  }

  // Käyttäjien roolit 
  const isOwner = group && userid === String(group.owner_id)
  const isMember = !isOwner && group && group.members.some(m => String(m.member_id) === userid && m.hasactivegrouprequest === false)
  const hasJoinRequest = !isOwner && group && group.members.some(m => String(m.member_id) === userid && m.hasactivegrouprequest === true)
  const isGuest = !isOwner && !isMember && !hasJoinRequest

  if (!group) {
  return <p>Ladataan ryhmän tiedot...</p>
}

  return (
    <div>
     
      <h1 className={styles.title}>{group.group_name}</h1>
      <div className={styles.description}>
        <h4>Group description:</h4>
      <h5>{group.group_description}</h5>
      </div>
      {/*<p className={styles.p}>Group owner: {group.owner_name}</p>*/}
      


      {isOwner && ( // Ryhmän omistajan näkymä
        <div>
          <div className={styles.deleteAndJoin}>
          <button onClick={() => deleteGroup()}>Delete group</button>
          </div>
          <div>
            <div className={styles.membersAndRequests}>
              <div className={styles.members}>
                <h3>Group members:</h3>
            <ul>  
              {
                members.map(member => ( // Listataan ryhmän jäsenet
                  <li key={member.member_name}>        
                    <Link to={`/profile/${member.member_name}`} >{member.member_name}</Link>
                    {member.member_name === group.owner_name && <span> (Owner)</span>}
                    {String(member.member_id) === userid && <span> (You)</span>}  
                    {member.member_name !== group.owner_name && ( // Lisätään käyttäjän poisto-nappi JOS se ei ole ryhmän omistaja
                      <button onClick={() => removeMember(member.member_id)}>Remove member</button>)}
                  </li>
                ))
              }
            </ul>
              </div>
              

            <div className={styles.requests}>
            <h3>Join requests</h3>
            <ul>
              {pendingRequests.map((member, index) => ( // Listataan liittymispyynnöt
                <li key={index}>
                  {member.member_name}
                  <button onClick={() => acceptRequest(member.member_id)}>Accept</button>
                  <button onClick={() => rejectRequest(member.member_id)}>Reject</button>
                </li>
              ))}
            </ul>
            </div>
              </div>
          </div>
          <GroupShowtimes members={members} group={group} />
          <GroupMovies members={members} group={group} />

        </div>
      )}

      {isGuest && ( // Vieraan näkymä
        <div>
          <div className={styles.deleteAndJoin}>
          <button onClick={e => { handleClick(e) }}>Request to join in group</button>
          <p>{statusMessage}</p>
          </div>
          <div className={styles.membersAndRequests}>
              <div className={styles.members}>
                <h3>Group members:</h3>
          <ul>
            {
              members.map(member => ( // Listataan ryhmän jäsenet
                <li key={member.member_name}>
                  <Link to={`/profile/${member.member_name}`} >{member.member_name}</Link>
                  {member.member_name === group.owner_name && <span> (Owner)</span>}
                </li>
              ))
            }
          </ul>
          </div>
          </div>

        </div>
      )}

      {isMember && ( // Ryhmän jäsenen näkymä
        <div>
          <div className={styles.deleteAndJoin}>
          <button onClick={e => { handleLeaveGroup(e) }}>Leave group</button>
          </div>
          <div className={styles.membersAndRequests}>
            <div className={styles.members}>
              <h3>Group members:</h3>
          <ul>
            {
              members.map(member => ( // Listataan ryhmän jäsenet
                <li key={member.member_name}>
                  <Link to={`/profile/${member.member_name}`} >{member.member_name}</Link>
                  {member.member_name === group.owner_name && <span> (Owner)</span>}
                  {String(member.member_id) === userid && <span> (You)</span>}  
                </li>
              ))
            }
          </ul>
          </div>
          </div>
          <GroupShowtimes members={members} group={group} />
          <GroupMovies members={members} group={group} />
          
        </div>
      )}

      {hasJoinRequest && ( // Liittymispyynnön lähettäneen näkymä
        <div>
          <div className={styles.deleteAndJoin}>
          <button onClick={e => { handleCancelJoinRequest(e) }}>Cancel join request</button>
          <p>{statusMessage}</p>
          </div>
          <div className={styles.membersAndRequests}>
              <div className={styles.members}>
                <h3>Group members:</h3>
          <ul>
            {
              members.map(member => ( // Listataan ryhmän jäsenet
                <li key={member.member_name}>
                  <Link to={`/profile/${member.member_name}`} >{member.member_name}</Link>
                  {member.member_name === group.owner_name && <span> (Owner)</span>}
                </li>
              ))
            }
          </ul>
          </div>
          </div>
          
        </div>
      )}



    </div>




  )
}
