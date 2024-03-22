import React, { useState, useEffect } from "react";
import "./MusicHome.css";
import Navbar from "../../components/Navbar/Navbar";
import myImage from '../../components/no-image-available.jpg';
import { FiSearch } from "react-icons/fi";
import Modal from 'react-modal';
import { MdClose } from 'react-icons/md';
import { IoIosArrowDropdownCircle, IoIosArrowDropupCircle } from "react-icons/io";

const truncateTitle = (title, maxLength) => {
    if (title.length > maxLength) {
        return title.substring(0, maxLength) + "...";
    }
    return title;
};

const MusicDetailsModal = ({ isOpen, closeModal, musicDetails }) => {
    const redirectToListen = () => {
        const listenLink = musicDetails.external_urls.spotify;
        window.open(listenLink, '_blank');
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Book Details"
            className="book-details-modal"
        >
            {musicDetails && (
                <>
                    <div className="modal-header">
                        <h1>{musicDetails.name}</h1>
                        <button onClick={closeModal} className="close-button"><MdClose /></button>
                    </div>
                    <div className="modal-content">
                        <div className="modal-left">
                            <img src={musicDetails.album.images.length > 0 ? musicDetails.album.images[0].url :myImage}
                            alt={musicDetails.name} className="book-cover" />
                        </div>
                        <div className="modal-right">
                            <p className="authors">
                                Artists: {musicDetails.artists.map(artist => artist.name).join(", ")} <br /><br />
                                Release Date: {musicDetails.album.release_date}
                                {musicDetails.popularity &&
                                    <div className="rating">
                                        <span>{musicDetails.popularity}</span>
                                        <span role="img" aria-label="star">⭐</span>
                                    </div>
                                }
                            </p>
                            <br /><br />
                            <p className="description">{truncateTitle(musicDetails.album.name, 500)}</p>
                            <div className="buttons-container">
                                <button className="order-button" onClick={redirectToListen}>Listen Now</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Modal>
    );
};

const MusicList = ({ music, openMusicDetailsModal, screen }) => {
    const [isMusicListVisible, setMusicListVisible] = useState(true);

    const toggleMusicList = () => {
        setMusicListVisible(!isMusicListVisible);
    };

    return (
        <div className="book_list">
            <div className="list-header">
                <h1>{screen} Music</h1>
                <button className="toggle-button" onClick={toggleMusicList}>{ isMusicListVisible? <IoIosArrowDropupCircle/>: <IoIosArrowDropdownCircle/>}</button>
            </div>
            {isMusicListVisible && (
                <div className="horizontal-scroll-list">
                    {music.map((song) => (
                        <div key={song.id} className="horizontal-book-item" onClick={() => openMusicDetailsModal(song) }>
                            {song.images && <img
                                src={song.images.length > 0 ? song.images[0].url : myImage}
                                alt={song.name}
                                className="book-image"
                            />}
                            {song.album.images && <img
                                src={song.album.images.length > 0 ? song.album.images[0].url : myImage}
                                alt={song.name}
                                className="book-image"
                            />}
                            <p className="book-title">{truncateTitle(song.name, 20)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MusicHome = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [music, setMusic] = useState([]);
    const [recentmusic, setRecentMusic] = useState([]);
    const [emotionmusic, setEmotionMusic] = useState({});
    const [selectedSong, setSelectedMusic] = useState(null);
    const [emotion, setEmotion] = useState("");
    const [spotifyAccessToken, setSpotifyAccessToken] = useState(null);

    const mood = {
        "Angry": ["rock", "metal", "punk", "rap", "heavy metal"],
        "Sad": ["blues", "slow ballad", "sadcore", "country"],
        "Happy": ["pop", "dance-pop", "upbeat", "reggae", "ska"],
        "Neutral": ["ambient", "minimal", "classical", "instrumental"],
        "Disgust": ["grindcore", "death metal", "noise", "experimental"],
        "Fear": ["dark ambient", "industrial", "horrorcore", "doom metal"],
        "Surprise": ["avant-garde", "experimental", "eclectic", "fusion"]
    };

    const openMusicDetailsModal = (song) => {
        setSelectedMusic(song);
    };

    const closeMusicDetailsModal = () => {
        setSelectedMusic(null);
    };

    const handleMoodSearch = async () => {
        setEmotionMusic({});
        let a = {};
        for (let i of mood[emotion]) {
            try {
                const response = await fetch(
                    `https://api.spotify.com/v1/search?q=genre:${i}&type=track`,
                    {
                        headers: {
                            'Authorization': `Bearer ${spotifyAccessToken}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                if (data.tracks.items.length > 0) {
                    a[i] = data.tracks.items;
                }
            } catch (error) {
                console.error("Error fetching songs:", error.message);
            }
        }
        setEmotionMusic(a);
    };

    const handleSearch = async () => {
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${searchTerm}&type=track&limit=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${spotifyAccessToken}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setMusic(data.tracks.items || []);

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
        } catch (error) {
            console.error("Error fetching songs:", error.message);
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

    const fetchRecentlyReleasedMusic = async () => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/browse/new-releases?limit=10`, {
                headers: {
                    'Authorization': `Bearer ${spotifyAccessToken}`
                }
            });
    
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            setRecentMusic(data.albums.items.map(album => ({
                id: album.id,
                name: album.name,
                album: {
                    images: album.images || [myImage],
                    release_date: album.release_date,
                    name: album.name
                },
                artists: album.artists,
                external_urls: album.external_urls
            })) || []);
        } catch (error) {
            console.error("Error fetching recently released music:", error.message);
        }
    };

    useEffect(() => {
        getAccessToken();
    }, []);
    
    useEffect(() => {
        fetchRecentlyReleasedMusic();
    }, [spotifyAccessToken]);

    return (
        <>
            <Navbar />
            <div className="page-container">
                <h1 className="page-header">Emotion Based Music</h1>
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

                {searchTerm && <MusicList music={music} openMusicDetailsModal={openMusicDetailsModal} screen={'Search'} />}
                
                {emotionmusic && Object.keys(emotionmusic).map((emo) => (
                    <MusicList music={emotionmusic[emo]} openMusicDetailsModal={openMusicDetailsModal} screen={emo} />  
                ))}

                {selectedSong &&
                    <MusicDetailsModal isOpen={!!selectedSong} closeModal={closeMusicDetailsModal} musicDetails={selectedSong}/>
                }

                {<MusicList music={recentmusic} openMusicDetailsModal={openMusicDetailsModal} screen={"Recent Released"} />}
            </div>
        </>
    );
};

export default MusicHome;