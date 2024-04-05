import React, { useState, useEffect } from "react";
import "./BooksHome.css";
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

const BookDetailsModal = ({ isOpen, closeModal, bookDetails }) => {
    const redirectToPurchase = () => {
        const purchaseLink = bookDetails.saleInfo.buyLink;
        window.open(purchaseLink, '_blank');
    };

    const redirectToRead = () => {
        const readLink = bookDetails.volumeInfo.previewLink;
        window.open(readLink, '_blank');
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Book Details"
            className="book-details-modal"
        >
            {bookDetails && (
                <>
                    <div className="modal-header">
                        <h1>{bookDetails.volumeInfo.title}</h1>
                        <button onClick={closeModal} className="close-button">
                            <MdClose />
                        </button>
                    </div>
                    <div className="modal-content">
                        <div className="modal-left">
                            <img src={bookDetails.volumeInfo.imageLinks ? bookDetails.volumeInfo.imageLinks.thumbnail : myImage}
                            alt={bookDetails.volumeInfo.title} className="book-cover"/>
                        </div>
                        <div className="modal-right">
                            <p className="authors">Authors: {bookDetails.volumeInfo.authors.join(', ')}</p>
                            {bookDetails.volumeInfo.averageRating && <div className="rating">
                                <span>{bookDetails.volumeInfo.averageRating}</span>
                                <span role="img" aria-label="star">⭐</span>
                            </div>}
                            <p className="description">{truncateTitle(bookDetails.volumeInfo.description, 500)}</p>
                            <div className="buttons-container">
                                <button className="order-button" onClick={redirectToPurchase}><MdShoppingCart /> Purchase</button>
                                <button className="read-button" onClick={redirectToRead}><MdBook /> Read Now</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Modal>
    );
};

const BookList = ({ books, openBookDetailsModal, screen }) => {
    const [isBookListVisible, setBookListVisible] = useState(true);

    const toggleBookList = () => {
        setBookListVisible(!isBookListVisible);
    };

    return (
        <div className="book_list">
            <div className="list-header">
                <h1>{screen} Books</h1>
                <button className="toggle-button" onClick={toggleBookList}>
                    {isBookListVisible ? <IoIosArrowDropupCircle /> : <IoIosArrowDropdownCircle />}
                </button>
            </div>
            {isBookListVisible && (
                <div className="horizontal-scroll-list">
                    {books.map((book) => (
                        <div key={book.id} className="horizontal-book-item" onClick={() => openBookDetailsModal(book)}>
                            <img
                                src={book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : myImage}
                                alt={book.volumeInfo.title}
                                className="book-image"
                            />
                            <p className="book-title">{truncateTitle(book.volumeInfo.title, 20)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const BooksHome = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [books, setBooks] = useState([]);
    const [recentbooks, setRecentBooks] = useState([]);
    const [emotionbook, setEmotionBook] = useState({});
    const [selectedBook, setSelectedBook] = useState(null);
    const [emotion, setEmotion] = useState("");

    const mood = {
        'Surprise': ['Mystery', 'Thriller', 'Suspense'],
        'Sad': ['Tragedy', 'Grief', 'Loss'],
        'Neutral': ['General Fiction', 'Non-Fiction', 'Historical Fiction'],
        'Happy': ['Romance', 'Comedy', 'Adventure'],
        'Fear': ['Horror', 'Supernatural'],
        'Disgust': ['Crime', 'True Crime', 'Dark Themes'],
        'Angry': ['Social Justice', 'Political']
    };

    const openBookDetailsModal = (book) => {
        setSelectedBook(book);
    };

    const closeBookDetailsModal = () => {
        setSelectedBook(null);
    };

    const handleMoodSearch = async () => {
        setEmotionBook({});
        let a = {};
        for (let i of mood[emotion]) {
            try {
                const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject=${i}`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                a[i] = data.items;
            } catch (error) {
                console.error("Error fetching books:", error.message);
            }
        }
        setEmotionBook(a);
    };

    const handleSearch = async () => {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchTerm}`);

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setBooks(data.items || []);
        } catch (error) {
            console.error("Error fetching books:", error.message);
        }
    };
    
    const fetchRecentlyReleasedBooks = async () => {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=newest`);

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setRecentBooks(data.items || []);
        } catch (error) {
            console.error("Error fetching recently released books:", error.message);
        }
    };

    useEffect(() => {
        fetchRecentlyReleasedBooks();
    }, []);

    return (
        <>
            <Navbar />
            <div className="page-container">
                <h1 className="page-header">Emotion Based Books</h1>
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

                {searchTerm && <BookList books={books} openBookDetailsModal={openBookDetailsModal} screen={'Search'} />}
                
                {emotionbook && Object.keys(emotionbook).map((emo) => (
                    <BookList books={emotionbook[emo]} openBookDetailsModal={openBookDetailsModal} screen={emo} />  
                ))}

                {selectedBook && <BookDetailsModal isOpen={!!selectedBook} closeModal={closeBookDetailsModal} bookDetails={selectedBook}/>}

                {<BookList books={recentbooks} openBookDetailsModal={openBookDetailsModal} screen={"Recent Released"} />}
            </div>
        </>
    );
};

export { BooksHome, BookList, BookDetailsModal };