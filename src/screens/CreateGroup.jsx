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
        const url = import.meta.env.VITE_API_BASE_URL + "/group"


        if (!group) {
            setStatusMessage('Group name missing')
            console.log("Ryhmän nimeä ei ole annettu")
            return
        }

        axios.post(url, { groupName: group, userId: userId, description: groupDescription })
            .then(response => {


                console.log(`Ryhmän luonti onnistui. Luodun ryhmän id: ${response.data.group_id}, ja nimi: ${response.data.group_name}`)
                setStatusMessage('Group created')
                e.target.reset()
            })
            .catch(err => {
                const errorMessage = err.response?.data?.error || 'Creating group failed'
                setStatusMessage(errorMessage)
            })

    }

    return (
        <div>
            <h1 className={styles.title}>Create group</h1>
            <div className={styles.createGroup}>


                <form className={styles.createGroupForm} onSubmit={e => { handleSubmit(e) }}>


                    <div>
                        <label>Insert group name:</label>
                        <input type="text" required onChange={e => setGroup(e.target.value)} ></input>
                    </div>

                    <div>
                        <label>Insert group description:</label>
                        <textarea
                            rows={4}
                            onChange={e => setGroupDescription(e.target.value)}

                        />
                    </div>

                    <div>
                        <button className='submit_button' type='submit'>Create group</button>
                        <p>{statusMessage}</p>
                    </div>

                </form>
            </div>
        </div>
    )
}
