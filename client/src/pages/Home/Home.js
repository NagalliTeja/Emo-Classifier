import React, { useEffect, useState } from 'react';
import { BookList, BookDetailsModal } from '../Books/BooksHome';
import { MovieList, MovieDetailsModal } from '../Movies/MoviesHome';
import { MusicList, MusicDetailsModal } from '../Music/MusicHome';
import Navbar from '../../components/Navbar/Navbar';
import { FaCameraRetro } from "react-icons/fa";
import { FaFileUpload } from "react-icons/fa";
import './Home.css';

const mood = {
    'surprise': ['Mystery',28, 'avant-garde'],
    'sad': ['Tragedy', 18,'sadcore'],
    'neutral': ['General Fiction',878,'instrumental'],
    'happy': ['Romance',35,'pop'],
    'fear': ['Horror',53,'dark ambient'],
    'disgust': ['Crime',80,'death metal'],
    'angry': ['Social Justice',27,'rap']
};

const genre_desc = {
    28: 'Action', 12: 'Adventure', 16: 'Animation',
    35: 'Comedy', 80: 'Crime', 18: 'Drama',
    10751: 'Family', 14: 'Fantasy', 27: 'Horror',
    10749: 'Romance', 878: 'Science Fiction', 53: 'Thriller',
    9648: 'Mystery'
};

const tmdbApiKey = '82fabe812ffe723bcb0ebe47b122a0eb';

const Home = () => {
    const [file, setFile] = useState(null);
    const [previewURL, setPreviewURL] = useState('');
    const [predictionAlert, setPredictionAlert] = useState('');
    const [emotionbook, setEmotionBook] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [emotionmovie, setEmotionMovie] = useState([]);
    const [selectMovie, setSelectedMovie] = useState(null);
    const [emotionmusic, setEmotionMusic] = useState([]);
    const [selectedSong, setSelectedMusic] = useState(null);
    const [spotifyAccessToken, setSpotifyAccessToken] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        setFile(selectedFile);

        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewURL(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreviewURL('');
        }
    };

    const handleCameraCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            const mediaStreamTrack = stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(mediaStreamTrack);

            const blob = await imageCapture.takePhoto();
            setFile(blob);

            const previewBlobURL = URL.createObjectURL(blob);
            setPreviewURL(previewBlobURL);

            mediaStreamTrack.stop();
        } catch (error) {
            console.error('Error capturing image:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            alert('Please select a file');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('http://127.0.0.1:8000/classify', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setPredictionAlert(data.prediction);
                handleBookMoodSearch(data.prediction);
                handleMovieMoodSearch(data.prediction);
                handleMusicMoodSearch(data.prediction);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleBookMoodSearch = async (emotion) => {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject=${mood[emotion][0]}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setEmotionBook(data.items);
        } catch (error) {
            console.error("Error fetching books:", error.message);
        }
    };

    const handleMovieMoodSearch = async (emotion) => {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${mood[emotion][1]}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setEmotionMovie(data.results);
        } catch (error) {
            console.error("Error fetching movies:", error.message);
        }
    };

    const getAccessToken = async () => {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa('f4daa209a2964f88a0eb786e8db59348:562285a328f742d0b241c9820e3de614') // Replace with your client ID and client secret
                },
                body: 'grant_type=client_credentials'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch access token: ${response.statusText}`);
            }

            const data = await response.json();
            setSpotifyAccessToken(data.access_token);
        } catch (error) {
            console.error('Error getting access token:', error.message);
        }
    };

    useEffect(() => {
        getAccessToken();
    }, []);

    const handleMusicMoodSearch = async (emotion) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=genre:${mood[emotion][2]}&type=track`,
            { headers: { 'Authorization': `Bearer ${spotifyAccessToken}` } });
            
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setEmotionMusic(data.tracks.items);
        } catch (error) {
            console.error("Error fetching music:", error.message);
        }
    };

    const openBookDetailsModal = (book) => {
        setSelectedBook(book);
    };

    const closeBookDetailsModal = () => {
        setSelectedBook(null);
    };

    const openMovieDetailsModal = (movie) => {
        setSelectedMovie(movie);
    };

    const closeMovieDetailsModal = () => {
        setSelectedMovie(null);
    };

    const openMusicDetailsModal = (song) => {
        setSelectedMusic(song);
    };

    const closeMusicDetailsModal = () => {
        setSelectedMusic(null);
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="left-partition">
                    <div className="button-container">
                        <image onClick={handleCameraCapture} className='camerabutoon'><FaCameraRetro/></image>
                    </div>
                    <input type="file" onChange={handleFileChange} className='inputtag'/>
                    <form onSubmit={handleSubmit} >
                        <br></br>
                        <button type="submit" className='uploadbutton'>Upload<FaFileUpload/></button>
                    </form>
                </div>
                <div className="right-partition">
                    <center className="image-preview">
                        {previewURL && <img src={previewURL} alt="Preview" className="image-preview" />}
                    </center>
                </div>
            </div>
            <div className="page-container">
                {predictionAlert && <BookList books={emotionbook} openBookDetailsModal={openBookDetailsModal} screen={predictionAlert.toUpperCase()} />}
                {selectedBook && <BookDetailsModal isOpen={!!selectedBook} closeModal={closeBookDetailsModal} bookDetails={selectedBook} />}

                {predictionAlert && <MovieList movies={emotionmovie} openMovieDetailsModal={openMovieDetailsModal} screen={predictionAlert.toUpperCase()} />}
                {selectMovie && <MovieDetailsModal isOpen={!!selectMovie} closeModal={closeMovieDetailsModal} movieDetails={selectMovie} />}
                
                {predictionAlert && <MusicList music={emotionmusic} openMusicDetailsModal={openMusicDetailsModal} screen={predictionAlert.toUpperCase()} />}
                {selectedSong && <MusicDetailsModal isOpen={!!selectedSong} closeModal={closeMusicDetailsModal} musicDetails={selectedSong}/>}
            </div>
        </>
    );
};

export default Home;