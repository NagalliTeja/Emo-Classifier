import React, { useState, useEffect } from "react";
import "./MoviesHome.css";
import Navbar from "../../components/Navbar/Navbar";
import myImage from '../../components/no-image-available.jpg';
import { FiSearch } from "react-icons/fi";
import Modal from 'react-modal';
import { MdClose, MdShoppingCart, MdBook } from 'react-icons/md';
import { IoIosArrowDropdownCircle, IoIosArrowDropupCircle } from "react-icons/io";

const truncateTitle = (title, maxLength) => {
    if (title.length > maxLength) {
        return title.substring(0, maxLength) + "...";
    }
    return title;
};

const MovieDetailsModal = ({ isOpen, closeModal, movieDetails }) => {

    return (
        <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        contentLabel="Movie Details"
        className="book-details-modal"
        // overlayClassName="modal-overlay"
        >
        {movieDetails && (
            <>
            <div className="modal-header">
                <h1>{movieDetails.title}</h1>                
                <button onClick={closeModal} className="close-button">
                <MdClose />
                </button>
            </div>
            <div className="modal-content">
                <div className="modal-left">
                <img
                src={movieDetails.poster_path? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`: myImage}
                alt={movieDetails.title}
                className="book-cover"
                />
                <div className="rating">
                    <>
                        <span>{movieDetails.popularity}</span>
                        <span role="img" aria-label="star">⭐</span>
                    </>
                </div>
                </div>
                <div className="modal-right">
                <p className="authors">
                    Language: {movieDetails.original_language} <br></br><br></br>
                    Release Date: { movieDetails.release_date }            
                </p>
                <br></br><br></br>
                <p className="description">{truncateTitle(movieDetails.overview, 500)}</p>
                </div>
            </div>
            </>
        )}
        </Modal>
    );
};

const MovieList = ({ movies, openMovieDetailsModal, screen }) => {
    const [isMovieListVisible, setMovieListVisible] = useState(true);

    const toggleBookList = () => {
        setMovieListVisible(!isMovieListVisible);
    };

    return (
        <div className="book_list">
            <div className="list-header">
                <h1>{screen} Movies</h1>
                <button className="toggle-button" onClick={toggleBookList}>{ isMovieListVisible? <IoIosArrowDropupCircle/>: <IoIosArrowDropdownCircle/>}</button>
            </div>
            {isMovieListVisible && (
                <div className="horizontal-scroll-list">
                    {movies.map((movie) => (
                        <div key={movie.id} className="horizontal-book-item" onClick={() => openMovieDetailsModal(movie)}>
                            <img
                                src={movie.poster_path? `https://image.tmdb.org/t/p/w500${movie.poster_path}`: myImage}
                                alt={movie.title}
                                className="book-image"
                            />
                            <p className="book-title">{truncateTitle(movie.title, 20)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MoviesHome = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [movies, setMovies] = useState([]);
    const [recentmovies, setRecentMovies] = useState([]);
    const [emotionmovie, setEmotionMovie] = useState({});
    const [selectMovie, setSelectedMovie] = useState(null);
    const [emotion, setEmotion] = useState("");
    const tmdbApiKey = '82fabe812ffe723bcb0ebe47b122a0eb';

    const mood = {
        'Surprise': [28, 14, 9648, 878],
        'Sad': [18, 16],
        'Neutral': [18, 35, 878],
        'Happy': [12, 35, 10751],
        'Fear': [53, 9648],
        'Disgust': [80],
        'Angry': [27]
    };

    const genre_desc = {
        28: 'Action', 12: 'Adventure', 16: 'Animation',
        35: 'Comedy', 80: 'Crime', 18: 'Drama',
        10751: 'Family', 14: 'Fantasy', 27: 'Horror',
        10749: 'Romance', 878: 'Science Fiction', 53: 'Thriller',
        9648: 'Mystery'
    };

    const openMovieDetailsModal = (movie) => {
        setSelectedMovie(movie);
    };

    const closeMovieDetailsModal = () => {
        setSelectedMovie(null);
    };

    const handleMoodSearch = async () => {
        setEmotionMovie({});
        let a = {};
        for (let i of mood[emotion]) {
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${i}`
                );

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                a["genre"+i] = data.results;
            } catch (error) {
                console.error("Error fetching books:", error.message);
            }
        }
        setEmotionMovie(a);
    };

    const handleSearch = async () => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${searchTerm}`
            );

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setMovies(data.results || []);
        } catch (error) {
            console.error("Error fetching books:", error.message);
        }
    };

    useEffect(() => {
        const fetchRecentlyReleasedMovies = async () => {
            try {
                const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&sort_by=release_date.desc`);

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                setRecentMovies(data.results || []);
            } catch (error) {
                console.error("Error fetching recently released books:", error.message);
            }
        };
        fetchRecentlyReleasedMovies();
    }, []);

    return (
        <>
            <Navbar />
            <div className="page-container">
                <h1 className="page-header">Emotion Based Movies</h1>
                <div className="search-container">
                    <select value={emotion} onChange={(e) => setEmotion(e.target.value)} className="search-input">
                        <option value="Select">Select</option>
                        <option value="Happy">Happy</option>
                        <option value="Sad">Sad</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Surprise">Surprise</option>
                        <option value="Fear">Fear</option>
                        <option value="Disgust">Disgust</option>
                        <option value="Angry">Angry</option>
                    </select>
                    <button onClick={handleMoodSearch} className="search-button">
                        <FiSearch className="search-icon" />
                    </button>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        placeholder="Search..."    
                    />
                    <button onClick={handleSearch} className="search-button">
                        <FiSearch className="search-icon" />
                    </button>
                </div>

                {searchTerm && <MovieList movies={movies} openMovieDetailsModal={openMovieDetailsModal} screen={'Search'} />}
                
                {emotionmovie && Object.keys(emotionmovie).map((emo) => (
                    <MovieList movies={emotionmovie[emo]} openMovieDetailsModal={openMovieDetailsModal} screen={genre_desc[emo]} />  
                ))}

                {selectMovie &&
                    <MovieDetailsModal isOpen={!!selectMovie} closeModal={closeMovieDetailsModal} movieDetails={selectMovie}/>
                }

                {<MovieList movies={recentmovies} openMovieDetailsModal={openMovieDetailsModal} screen={"Recent Released"} />}
            </div>
        </>
    );
};

export default MoviesHome;