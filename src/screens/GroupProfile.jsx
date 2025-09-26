import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useAuth } from "../context/AuthContext.jsx"

export default function GroupProfile() {
  // Haetaan ryhmän ID parametreistä
  const { id } = useParams()

  // Tilamuuttujat
  const [group, setGroup] = useState(null)
  const url = import.meta.env.VITE_API_BASE_URL
  const [members, setMembers] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const userid = sessionStorage.getItem("user_id")

  // Haetaan ryhmän tiedot kun sivu avataan
  useEffect(() => {
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

  // Käyttäjien roolit 
  const isOwner = group && userid === String(group.owner_id)
  const isMember = !isOwner && group && group.members.some(m => String(m.member_id) === userid && m.hasactivegrouprequest === false)
  const isGuest = !isOwner && !isMember

  if (!group) {
  return <p>Ladataan ryhmän tiedot...</p>
}

  return (
    <div>
      <h1>{group.group_name}</h1>
      <p>Group owner: {group.owner_name}</p>
      <p>Group members:</p>


      {isOwner && ( // Ryhmän omistajan näkymä
        <div>
          <p>Olet ryhmän omistaja</p>
          <div>
            <ul>
              {
                members.map(member => ( // Listataan ryhmän jäsenet
                  <li key={member.member_name}>
                    {member.member_name}
                    {member.member_name !== group.owner_name && ( // Lisätään käyttäjän poisto-nappi JOS se ei ole ryhmän omistaja
                      <button onClick={() => removeMember(member.member_id)}>Remove member</button>)}
                  </li>
                ))
              }
            </ul>
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
      )}

      {isGuest && ( // Vieraan näkymä
        <div>
          <p>Olet vieras</p>
          <ul>
            {
              members.map(member => ( // Listataan ryhmän jäsenet
                <li key={member.member_name}>
                  {member.member_name}
                </li>
              ))
            }
          </ul>
          <button onClick={e => { handleClick(e) }}>Request to join in group</button>
          <p>{statusMessage}</p>
        </div>
      )}

      {isMember && ( // Ryhmän jäsenen näkymä
        <div>
          <p>Olet ryhmän jäsen</p>
          <ul>
            {
              members.map(member => ( // Listataan ryhmän jäsenet
                <li key={member.member_name}>
                  {member.member_name}
                </li>
              ))
            }
          </ul>
        </div>
      )}



    </div>




  )
}
