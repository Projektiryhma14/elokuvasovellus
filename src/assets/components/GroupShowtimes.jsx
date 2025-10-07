import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styles from './GroupShowtimes.module.css'

export default function GroupShowtimes({ members, group }) {
    const [showtimes, setShowtimes] = useState([])
    const { id } = useParams()

    const userId = sessionStorage.getItem("user_id")

    const fetchGroupShowtimes = async () => {
        const base_url = import.meta.env.VITE_API_BASE_URL
        axios.get(base_url + "/sharedshowtimes/group/" + id)
            .then(response => {
                console.log(response.data)
                setShowtimes(response.data)
            })
            .catch(err => {
                console.error(err)
            })
    }

    const findSharerName = (sharerId) => {
        for (let i=0; i<members.length; i++) {
            if (members[i].member_id === sharerId) {
                return members[i].member_name
            }
        }
    }

    const formatDatetime = (dt) => {
        const formattedDatetime = new Date(dt).toLocaleString("en-US")
        return formattedDatetime
    }

    const deleteShowtime = async (showtimeId) => {
        console.log(showtimeId)
        const base_url = import.meta.env.VITE_API_BASE_URL
        try {
            const response = await axios.delete(base_url + "/sharedshowtimes/" + showtimeId)
            console.log(response)
            fetchGroupShowtimes()
        }
        catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchGroupShowtimes()
        console.log(members)
        console.log(group)
        //console.log(group.owner_id)
    }, [])

  return (
    <div className={styles.movie_dates}>
        {(showtimes.length > 0) ? (<h4 className={styles.shared_showtimes_header}>Upcoming movie dates!</h4>) : ""}
        <ul>
        {showtimes.map(showtime => (
            <li className={styles.shared_showtime_line} key={showtime.shared_showtime_id}>
                <b>{findSharerName(showtime.sharer_id)}</b> is going to watch <b>{showtime.movie_name}</b> in <b>{showtime.theatre}</b> at <b>{formatDatetime(showtime.dateandtime)}</b>
                {(userId === String(showtime.sharer_id) || userId === String(group.owner_id)) ? (<button 
                className={styles.showtimes_delete_button} 
                onClick={() => {deleteShowtime(showtime.shared_showtime_id)}}
                type='button'>Delete</button>) : ""}
            </li>
        ))}
        </ul>
    </div>
  )
}
