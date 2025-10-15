import React from 'react'
import gitlogo from '../../pics/github-mark.png'
import styles from "./Footer.module.css"

export default function Footer() {
    return (
        <footer className={styles.footer}>

            <div className={styles.headline}>
                <p>MovieGeegs</p>
            </div>
            <div className={styles.project_name}>
                <p className={styles.firstPara}>Movie App, Web Programming App Project TVT24KMO</p>
                <p>Made By: Timo, Mikko, Ville & Sari</p>
            </div>
            <div className={styles.repoAddress}>
                <ul>
                    <li><a href="https://github.com/Projektiryhma14/elokuvasovellus" target="_blank">Project repository</a></li>
                </ul>
            </div>

        </footer >
    )
}
