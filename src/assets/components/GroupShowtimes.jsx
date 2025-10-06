import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

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
    <div>
        <h4>Upcoming movie dates!</h4>
        {showtimes.map(showtime => (
            <div key={showtime.shared_showtime_id}>
                {findSharerName(showtime.sharer_id)} is going to watch {showtime.movie_name} in {showtime.theatre} at {formatDatetime(showtime.dateandtime)}
                {(userId === String(showtime.sharer_id) || userId === String(group.owner_id)) ? (<button onClick={() => {deleteShowtime(showtime.shared_showtime_id)}}>Delete</button>) : ""}
            </div>
        ))}
    </div>
  )
}
