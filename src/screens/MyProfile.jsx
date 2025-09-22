import React from 'react'
import axios from 'axios'
import { useAuth } from "../context/AuthContext.jsx"
import { useNavigate } from 'react-router-dom'
import { useMemo } from "react";

export default function MyProfile() {

    const navigate = useNavigate()

    const { user, status, signOut } = useAuth();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    const deleteUser = async () => {
        try {
            const userId = sessionStorage.getItem("user_id");
            const response = await axios.delete(`${API_BASE_URL}/deleteuser/${userId}`)
            alert("Käyttäjä poistettu")
            signOut()
            navigate("/", { replace: true, state: { flash: "User has been deleted", from: "profile" } });


        }
        catch (err) {
            console.error(err)
        }

    }


    return (
        <div>
            <div>

                <p>My profile</p>
                <p>Käyttäjä: {user?.username}</p>
                <p>Email: {user?.email}</p>
            </div>
            <button type="button" id="delete_account" onClick={() => deleteUser()}>Delete account</button>
        </div>
    )
}
