import React from 'react'
import { NavLink } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link';
import logo from '../../pics/logo2.png'
import styles from "./Navbar.module.css"

export default function Navbar() {
    return (
        <nav className={styles.nav}>
            {/* Logo */}
            <NavLink to="/" className={styles.brand}>
                <img src={logo} alt="MovieGeegs_logo" className={styles.logo} />
            </NavLink>

            {/* Keskilinkit */}
            <ul className={`${styles.links} ${styles.center}`}>
                <li><HashLink smooth to="/#search" className={styles.link}>Movie Search</HashLink></li>
                <li><HashLink smooth to="/#finnkino" className={styles.link}>Finnkino showtimes</HashLink></li>
                <li><HashLink smooth to="/#extra" className={styles.link}>Jotain muuta</HashLink></li>
            </ul>

            {/* Auth-linkit */}
            <ul className={`${styles.links} ${styles.auth}`}>
                <li>
                    <NavLink
                        to="/signin"
                        className={({ isActive }) =>
                            `${styles.link} ${isActive ? styles.active : ""}`
                        }
                    >
                        Sign in
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/signup"
                        className={({ isActive }) =>
                            `${styles.link} ${isActive ? styles.active : ""}`
                        }
                    >
                        Sign Up
                    </NavLink>
                </li>
            </ul>
        </nav>
    )
}
