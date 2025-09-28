export default function FavouritesList({ item, deleteFavourite }) {
    return (
        <li>
            {item.movie_name}
            <button className='delete-button' onClick={() => deleteFavourite(item.favourites_id)}>Delete</button>
        </li >
    )
}