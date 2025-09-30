import React from 'react'
import styles from './CreateGroup.module.css'
import { useState } from 'react'
import axios from 'axios'

export default function CreateGroup() {


    const [group, setGroup] = useState('')
    const [groupDescription, setGroupDescription] = useState('')
    const [statusMessage, setStatusMessage] = useState('')
    const userId = sessionStorage.getItem("user_id");

const handleSubmit = async (e) => {
e.preventDefault()
const url = "http://localhost:3001/group"


if(!group) {
    setStatusMessage('Ryhmän nimeä ei ole annettu')
    console.log("Ryhmän nimeä ei ole annettu")
    return
}

//axios.post(url, group)
axios.post(url, { groupname: group, username: userId, description: groupDescription })
.then(response => {
    
    
    console.log(`Ryhmän luonti onnistui. Luodun ryhmän id: ${response.data.group_id}, ja nimi: ${response.data.group_name}`)
    setStatusMessage('Ryhmän luonti onnistui')
    e.target.reset()
})
.catch(err => {
   const errorMessage = err.response?.data?.error || 'Ryhmän luonti epäonnistui'
   setStatusMessage(errorMessage)
})

}

  return (
      <div className='creategroup_container'>

          <form className="Create-group-form" onSubmit={e => { handleSubmit(e) }}>
              <h1>Create group</h1>

            <div>
            <label>Insert group name:</label>
            <input type="text" required onChange={e => setGroup(e.target.value)} ></input>
            </div>

            <div>
            <label>Insert group description:</label>
            <input type="text" required onChange={e => setGroupDescription(e.target.value)} ></input>
            </div>

            <div>
            <button className='submit_button' type='submit'>Create group</button>
            <p>{statusMessage}</p>
            </div>

          </form>
      </div>
  )
}
