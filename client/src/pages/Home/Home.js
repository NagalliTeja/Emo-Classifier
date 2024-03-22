import React, { useState } from 'react';
import { BookList, BookDetailsModal } from '../Books/BooksHome';
import Navbar from '../../components/Navbar/Navbar';
import './Home.css';

const book_mood = {
    'surprise': 'Mystery',
    'sad': 'Tragedy',
    'neutral': 'General Fiction',
    'happy': 'Romance',
    'fear': 'Horror',
    'disgust': 'Crime',
    'angry': 'Social Justice'
};

const Home = () => {
    const [file, setFile] = useState(null);
    const [previewURL, setPreviewURL] = useState('');
    const [predictionAlert, setPredictionAlert] = useState('');
    const [emotionbook, setEmotionBook] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);

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
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleBookMoodSearch = async (emotion) => {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject=${book_mood[emotion]}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setEmotionBook(data.items);
        } catch (error) {
            console.error("Error fetching books:", error.message);
        }
    };

    const openBookDetailsModal = (book) => {
        setSelectedBook(book);
    };

    const closeBookDetailsModal = () => {
        setSelectedBook(null);
    };

    return (
        <>
            <Navbar />
            <div className='form-container'>
                <h1>Upload Image</h1>
                <button onClick={handleCameraCapture}>Capture from Camera</button>
                <form onSubmit={handleSubmit}>
                    <input type="file" onChange={handleFileChange} />
                    {previewURL && <img src={previewURL} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px' }} />}
                    <button type="submit">Upload</button>
                </form>
                {predictionAlert && <div className="prediction-alert">{predictionAlert}</div>}

                <div className="page-container">
                    {predictionAlert && <BookList books={emotionbook} openBookDetailsModal={openBookDetailsModal} screen={predictionAlert.toUpperCase()} />}
                    {selectedBook && <BookDetailsModal isOpen={!!selectedBook} closeModal={closeBookDetailsModal} bookDetails={selectedBook}/>}
                </div>
            </div>
        </>
    );
};

export default Home;