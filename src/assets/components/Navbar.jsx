import React from 'react'
import { NavLink, } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../pics/logo2.png'
import styles from "./Navbar.module.css"
import { useAuth } from '../../context/AuthContext.jsx'

export default function Navbar() {
    const { status, signOut } = useAuth(); // 👈 saadaan tila + logout
    const navigate = useNavigate()
    const location = useLocation()


    const handleLogout = () => {
        // 1) nollaa auth-tila
        signOut();
        // 2) siivoa paluuosoite
        //sessionStorage.removeItem("returnTo");
        // 3) ohjaa julkiselle reitille JA vie flash location state:ssa
        navigate("/", { replace: true, state: { flash: "You have been logged out.", from: "logout" } });

        // 2) Sitten vasta tyhjätään auth-tila microtaskissa
        setTimeout(() => {
            signOut();
            sessionStorage.removeItem("returnTo");
        }, 0);
    };

    return (
        <nav className={styles.nav}>
            {/* Logo vasemmalle */}
            <NavLink to="/" className={styles.brand}>
                <img src={logo} alt="MovieGeegs_logo" className={styles.logo} />
            </NavLink>

            {/* Keskilinkit */}
            <ul className={`${styles.links} ${styles.center}`}>
                <li>
                    <HashLink smooth to="/#movie_search" className={styles.link}>
                        Movie Search
                    </HashLink>
                </li>
                <li>
                    <HashLink smooth to="/#finnkino" className={styles.link}>
                        Finnkino showtimes
                    </HashLink>
                </li>
                <li>
                    <HashLink smooth to="/#extra" className={styles.link}>
                        Jotain muuta
                    </HashLink>
                </li>
            </ul>

            {/* Oikea laita: auth-linkit riippuvat statuksesta */}
            <ul className={`${styles.links} ${styles.auth}`}>
                {status === "SKELETON" && (
                    <li><span className={styles.link}>...</span></li>
                )}

                {status === "GUEST" && (
                    <>
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
                    </>
                )}

                {status === "USER" && (
                    <>
                        <li>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) =>
                                    `${styles.link} ${isActive ? styles.active : ""}`
                                }
                            >
                                My Profile
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/group"
                                className={({ isActive }) =>
                                    `${styles.link} ${isActive ? styles.active : ""}`
                                }
                            >
                                Group Page
                            </NavLink>
                        </li>

                        {location.pathname === "/group" && (
                            <li><NavLink
                             to="/group/create"
                              className={({isActive}) =>
                            `${styles.link} ${isActive ? styles.active : ""}`
                            }
                            >
                                Create Group
                                </NavLink>
                                </li>
                        )}

                        <li>
                            {/* Logout napiksi mutta samaan tyyliin */}
                            {/* Huom! type="button" varmuuden vuoksi, ettei nappi koskaan subitoi mahdollisessa <form>-kontekstissa */}
                            <button type="button" onClick={handleLogout} className={styles.link}>
                                Log out
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}
