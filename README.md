# Movie App Project

Welcome to the Movie App project repository.

This movie app was created by a four-person team and is made for movie fans. It uses open data from TMDB and Finnkino to help you discover films and browse local showtimes. Additionally, you can create groups, share favourites, and write reviews.
Key features include sign up and login, multi-criteria search, showtimes, groups, shared favourites, and reviews.

---

## Project Features

### User Features

- **Responsive UI**  
  Layout scales gracefully across screen sizes.

- **Sign Up**  
  Register with email + password (min. 8 chars, ≥1 uppercase letter, and ≥1 number).

- **Sign In / Sign Out**  
  Authenticate using your registered credentials.

- **Account Deletion**  
  Remove your account; associated user-generated data is also removed (reviews, favourites, shares).

- **Search**  
  Multi-criteria movie search (genre, release year, and language).

- **Showtimes**  
  Browse movies’ screening times by theatre, movie name, and date.

- **Groups**  
  Create groups, view all groups, open a group page. Only members can view group details. Owners can delete their group.

- **Membership Management**  
  Request to join a group; owners can accept or decline. Members can leave; owners can remove members.

- **Group Page Customization**  
  Group members can add movies and showtimes to the group page.

- **Reviews**  
  Logged-in users can add reviews with text and star rating (1–5). Review displays reviewer email and timestamp.

- **Browse Reviews**  
  Public review listing with links to the reviewed movie info.

- **Favourites**  
  Logged-in users maintain a personal favourites list on their profile.

- **Share Favourites**  
  Share your favourites via a public URI visible to all users.

---

## Data Sources

- **The Movie Database (TMDB)** Open movie data (API key/token required).  
  Used for displaying details about movies and listing popular movies.

- **Finnkino API** Public XML endpoints for theatre schedules.

---

## Technology Stack

- **Frontend:** React (Vite)  
- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL  
- **Testing:** Mocha and Chai  
- **Tools:** Visual Studio Code, pgAdmin, Git, Render, Postman, Moqups

---

## Authors

Timo Tikkanen, Mikko Haapea, Ville Kähkönen, and Sari Ervasti

_Oulu University of Applied Sciences (TVT24KMO)_