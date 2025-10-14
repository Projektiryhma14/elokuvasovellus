import React, { useEffect, useState } from 'react'
import styles from './Group.module.css'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Group() {

    const [groups, setGroups] = useState([])
    const [userGroup, setUserGroup] = useState()
    const url = import.meta.env.VITE_API_BASE_URL
    const Currentuserid = sessionStorage.getItem("user_id")





    useEffect(() => {
        axios.get(`${url}/group`, {
            headers: {
                'userid': Currentuserid
            }
        })
            .then(response => {
                setGroups(response.data)


            })
            .catch(err => {
                console.error('Virhe ryhmien haussa:', err)
            })

    }, [])


    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Groups</h2>
            <div className={styles.groupList}>
                <ul>
                    {
                        groups.map(group => (
                            <li key={group.group_id}>
                                <Link to={`/group/${group.group_id}`}>
                                    {group.group_name}
                                </Link>
                                {group.isUserGroup && <span>(Your group)</span>}

                            </li>
                        ))
                    }
                </ul>
            </div>



        </div>
    )
}
