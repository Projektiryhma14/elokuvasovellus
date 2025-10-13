import React from 'react'
import { NavLink, } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../pics/logo_versio2.png'
import SettingsLogo from '../../pics/SettingsLogo.png'
import styles from "./Navbar.module.css"
import { useAuth } from '../../context/AuthContext.jsx'
import { useEffect, useState } from 'react';

export default function Navbar() {
    const { status, signOut, user } = useAuth(); // 👈 saadaan tila + logout
    const navigate = useNavigate()
    const location = useLocation()

    // Drawerin tila (mobiili sivupaneeli)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);



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

        // Jos poistutaan menusta, sulje paneeli
        setIsOpen(false)
    };

    // Avaa/sulje napista
    const toggleMenu = () => setIsOpen((v) => !v)
    const closeMenu = () => setIsOpen(false)

    return (
        <nav className={styles.nav}>
            {/* Logo vasemmalle */}
            <NavLink to="/" className={styles.brand} onClick={closeMenu}>
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
                    <HashLink smooth to="/#sharedFavourites" className={styles.link}>
                        Shared Favourites
                    </HashLink>
                </li>
                <li>
                    <HashLink smooth to="/#popular_movies" className={styles.link}>
                        Popular movies
                    </HashLink>
                </li>
                <li>
                    <NavLink to="/reviews" className={styles.link}>Reviews</NavLink>
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
                                to={`/profile/${user?.username ?? ""}`}
                                className={({ isActive }) =>
                                    `${styles.link} ${isActive ? styles.active : ""}`
                                }
                            >
                                My Profile

                                {/*Jos on erikoismerkkejä niin käytä tätä
                                to={`/profile/${encodeURIComponent(user?.username || "")}`}*/}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/profileSettings"
                                className={({ isActive }) =>
                                    `${styles.link} ${isActive ? styles.active : ""}`
                                }
                            >
                                My Profile Settings

                                {/*to="/profileSettings" className={styles.brand}>
                                <img src={SettingsLogo} alt="SettingsLogo.png" className={styles.logo} />*/}
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
                                className={({ isActive }) =>
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

            {/* Hamburger-nappi (näkyy vain mobiilissa CSS:llä)*/}
            <button
                type='button'
                className={styles.menuButton}
                onClick={toggleMenu}
            >
                {/*Yksinkertainen "hamburger"-ikonin korvike (3 viivaa)*/}
                <span className={styles.menuBar} />
                <span className={styles.menuBar} />
                <span className={styles.menuBar} />
            </button>

            {/* Taustapeite, klikkaus sulkee menun*/}
            {isOpen && <div className={styles.backdrop} onClick={closeMenu} />}

            {/*Off-canvas drawer (mobiili) -roolit selkeyden vuoksi*/}
            <aside
                id='mobile-drawer'
                className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
            >
                {/* Logo + sulkunappi rivi ylös*/}
                <div className={styles.drawerHeader}>
                    <NavLink to="/" className={styles.brand} onClick={closeMenu}>
                        <img src={logo} alt="MovieGeegs_logo" className={styles.logoSmall} />
                    </NavLink>
                    <button
                        type='button'
                        className={styles.menuButton}
                        onClick={closeMenu}
                    >
                        X
                    </button>
                </div>

                {/* Julkiset linkit */}
                <nav className={styles.drawerSection}>
                    <div className={styles.drawerTitle}>Navigation</div>
                    <ul className={styles.drawerList} onClick={closeMenu}>
                        <li><HashLink smooth to="/#movie_search" className={styles.drawerLink}>Movie Search</HashLink></li>
                        <li><HashLink smooth to="/#finnkino" className={styles.drawerLink}>Finnkino showtimes</HashLink></li>
                        <li><HashLink to="/#sharedFavourites" className={styles.drawerLink}>Shared Favourites</HashLink></li>
                        <li><HashLink smooth to="/#popular_movies" className={styles.drawerLink}>Popular movies</HashLink></li>
                        <li><NavLink to="/reviews" className={styles.drawerLink}>Reviews</NavLink></li>
                    </ul>
                </nav>

                {/* Auth-ryhmä tilan mukaan */}
                <nav className={styles.drawerSection}>
                    <div className={styles.drawerTitle}>Account</div>

                    {status === "SKELETON" && <div className={styles.drawerNote}>...</div>}

                    {status === "GUEST" && (
                        <ul className={styles.drawerList} onClick={closeMenu}>
                            <li><NavLink to="/signin" className={styles.drawerLink}>Sign in</NavLink></li>
                            <li><NavLink to="/signup" className={styles.drawerLink}>Sign up</NavLink></li>
                        </ul>
                    )}

                    {status === "USER" && (
                        <ul className={styles.drawerList} onClick={closeMenu}>
                            <li><NavLink to={`/profile/${user?.username ?? ""}`} className={styles.drawerLink}>My Profile</NavLink></li>
                            <li><NavLink to="/profileSettings" className={styles.drawerLink}>My Profile Settings</NavLink></li>
                            <li><NavLink to="/group" className={styles.drawerLink}>Group Page</NavLink></li>
                            {location.pathname === "/group" && (
                                <li><NavLink to="/group/create" className={styles.drawerLink}>Create Group</NavLink></li>
                            )}
                            <li>
                                <button type="button" onClick={handleLogout} className={styles.drawerLinkBtn}>
                                    Log out
                                </button>
                            </li>
                        </ul>
                    )}
                </nav>

            </aside>
        </nav>
    );
}
