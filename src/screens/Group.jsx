import React, { useEffect, useState } from 'react'
import styles from './Group.module.css'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Group() {

    const [groups, setGroups] = useState([])
    const url = import.meta.env.VITE_API_BASE_URL

    
    


    useEffect(() => {
        axios.get(url + "/group")
        .then(response => {
            setGroups(response.data)
            
        })
        .catch(err => {
            console.error('Virhe ryhmien haussa:', err)
        })

    }, [])


    return (
        <div>
        <h1>Group</h1>

        <ul>
            {
                groups.map(group => (           
                    <li key={group.group_id}>
                        <Link to={`/group/${group.group_id}`}>
                        {group.group_name}
                        </Link>
                    </li>
                ))
            }
        </ul>
        
        

        </div>
    )
}
