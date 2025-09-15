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
HasActiveGroupRequest BOOLEAN NOT NULL
); 

create table reviews ( 
review_id SERIAL PRIMARY KEY, 
/*user_id INT NOT NULL REFERENCES users(user_id),*/
movie_name VARCHAR(50) NOT NULL,
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



ALTER TABLE users ADD groupID INT REFERENCES groups(group_id);
ALTER TABLE reviews ADD user_id INT NOT NULL REFERENCES users(user_id);
ALTER TABLE favourites ADD user_id INT NOT NULL REFERENCES users(user_id);
ALTER TABLE groups ADD owner_id INT NOT NULL REFERENCES users(user_id);
ALTER TABLE sharedMovies ADD group_id INT NOT NULL REFERENCES groups(group_id);
ALTER TABLE sharedMovies ADD sharer_id INT NOT NULL REFERENCES users(user_id);
ALTER TABLE sharedShowtimes ADD group_id INT NOT NULL REFERENCES groups(group_id);
ALTER TABLE sharedShowtimes ADD sharer_id INT NOT NULL REFERENCES users(user_id);