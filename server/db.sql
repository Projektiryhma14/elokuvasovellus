/* poista foreign key relaatiot taulujen väliltä ennen taulujen poistamista */
ALTER TABLE IF EXISTS reviews DROP COLUMN IF EXISTS user_id;
ALTER TABLE IF EXISTS favourites DROP COLUMN IF EXISTS user_id;
ALTER TABLE IF EXISTS sharedMovies DROP COLUMN IF EXISTS group_id;
ALTER TABLE IF EXISTS sharedMovies DROP COLUMN IF EXISTS sharer_id;
ALTER TABLE IF EXISTS sharedShowtimes DROP COLUMN IF EXISTS group_id;
ALTER TABLE IF EXISTS sharedShowtimes DROP COLUMN IF EXISTS sharer_id;
ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS groupID;
ALTER TABLE IF EXISTS groups DROP COLUMN IF EXISTS owner_id;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS favourites;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS sharedMovies;
DROP TABLE IF EXISTS sharedShowtimes;


create table users ( 
user_id SERIAL PRIMARY KEY, 
user_name VARCHAR(20) NOT NULL UNIQUE,
email VARCHAR(50) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
/*groupID INT REFERENCES groups(group_id),*/
HasActiveGroupRequest BOOLEAN DEFAULT false,
favourites_is_shared BOOLEAN DEFAULT false,
favourites_shared_at TIMESTAMP
); 

create table reviews ( 
review_id SERIAL PRIMARY KEY, 
/*user_id INT NOT NULL REFERENCES users(user_id),*/
movie_name VARCHAR(50) NOT NULL,
movie_id INT NOT NULL,
movie_rating INT NOT NULL CHECK(movie_rating BETWEEN 1 AND 5),
movie_review VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
); 

create table favourites ( 
favourites_id SERIAL PRIMARY KEY, 
/*user_id INT NOT NULL REFERENCES users(user_id),*/
movie_name VARCHAR(50) NOT NULL
); 


create table groups ( 
group_id SERIAL PRIMARY KEY,
/*owner_id INT NOT NULL REFERENCES users(user_id),*/
group_name VARCHAR(20) NOT NULL UNIQUE,
group_description VARCHAR(255)
); 

create table sharedMovies ( 
shared_movie_id SERIAL PRIMARY KEY,
/*group_id INT NOT NULL REFERENCES groups(group_id),*/
movie_name VARCHAR(50) NOT NULL
/*sharer_id INT NOT NULL REFERENCES users(user_id)*/
); 

create table sharedShowtimes ( 
shared_showtime_id SERIAL PRIMARY KEY,
/*group_id INT NOT NULL REFERENCES groups(group_id),*/
theatre VARCHAR(50) NOT NULL,
movie_name VARCHAR(50) NOT NULL,
dateAndTime TIMESTAMP NOT NULL
/*sharer_id INT NOT NULL REFERENCES users(user_id)*/
); 

ALTER TABLE users ADD groupID INT REFERENCES groups(group_id) ON DELETE CASCADE;
ALTER TABLE reviews ADD user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE favourites ADD user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE groups ADD owner_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE sharedMovies ADD group_id INT NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE;
ALTER TABLE sharedMovies ADD sharer_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE sharedShowtimes ADD group_id INT NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE;
ALTER TABLE sharedShowtimes ADD sharer_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE;

/* ESTETÄÄN DUPLIKAATTIEN NÄYTÖSAIKOJEN LISÄÄMINEN TIETOKANTAAN: */
/* jos unique_showtime rajoitus on jo olemassa, poista se */
ALTER TABLE IF EXISTS sharedShowtimes DROP CONSTRAINT IF EXISTS unique_showtime;
/* lisätään sharedshowtimes tauluun rajoitus, joka estää duplikaatit lisäykset (saman näytösajan lisääminen monta kertaa saman ryhmän sivulle) */
ALTER TABLE IF EXISTS sharedShowtimes ADD CONSTRAINT unique_showtime UNIQUE (theatre, movie_name, dateandtime, group_id);
/* jos rajoituksen lisääminen ei onnistu, tietokannassa on duplikaatteja rivejä, jotka pitää poistaa */

/* ESTETÄÄN DUPLIKAATTIEN ELOKUVIEN LISÄÄMINEN TIETOKANTAAN: */
/* jos unique_movie rajoitus on jo olemassa, poista se */
ALTER TABLE IF EXISTS sharedMovies DROP CONSTRAINT IF EXISTS unique_movie;
/* lisätään sharedmovies tauluun rajoitus, joka estää duplikaatit lisäykset (saman elokuvan lisääminen monta kertaa saman ryhmän sivulle) */
ALTER TABLE IF EXISTS sharedMovies ADD CONSTRAINT unique_movie UNIQUE (movie_name, group_id);
/* jos ylläolevan rajoituksen lisääminen ei onnistu, tietokannassa on duplikaatteja rivejä, jotka pitää poistaa */


/* jos et halua menettää tietokannassa olemassaolevaa dataa, aja koko scriptin sijaan vain allaolevat rivit pgAdminissa */
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS movie_id INT NOT NULL;

/*Muuttaa email ja user_name kentät UNIQUE*/
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (user_name);

/* Users tauluun lisättävät suosikkilistan jakamiseen tarvittavat kentät */
ALTER TABLE users ADD favourites_is_shared BOOLEAN DEFAULT false;
ALTER TABLE users ADD favourites_shared_at TIMESTAMP;


/*ALTER TABLE groups DROP CONSTRAINT group_owner_id_fkey, ADD CONSTRAINT group_owner_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE reviews DROP CONSTRAINT reviews_user_id_fkey, ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE favourites DROP CONSTRAINT favourites_user_id_fkey, ADD CONSTRAINT favourites_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE sharedMovies DROP CONSTRAINT sharedMovies_group_id_fkey, ADD CONSTRAINT sharedMovies_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE;

ALTER TABLE sharedMovies DROP CONSTRAINT sharedMovies_sharer_id_fkey, ADD CONSTRAINT sharedMovies_sharer_id_fkey FOREIGN KEY (sharer_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE sharedShowtimes DROP CONSTRAINT sharedShowtimes_group_id_fkey, ADD CONSTRAINT sharedShowtimes_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE;

ALTER TABLE sharedShowtimes DROP CONSTRAINT sharedShowtimes_sharer_id_fkey, ADD CONSTRAINT sharedShowtimes_sharer_id_fkey FOREIGN KEY (sharer_id) REFERENCES users(user_id) ON DELETE CASCADE;*/
