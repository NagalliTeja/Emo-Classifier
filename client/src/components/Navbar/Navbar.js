import React, { useState } from "react";
import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { GiHamburgerMenu, GiBookshelf } from "react-icons/gi";
import { MdHomeFilled, MdMovie } from "react-icons/md";
import { IoMusicalNotesSharp, IoLogOutSharp } from "react-icons/io5";

const Navbar = () => {
    const [showMediaIcons, setShowMediaIcons] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => {
		localStorage.removeItem("token");
        navigate('/login');
	};
    
    return (
        <nav className="main-nav">
            <div className="logo"><h2>Emo-Classifier</h2></div>

            <div className={showMediaIcons ? "menu-link mobile-menu-link" : "menu-link"}>
                <ul>
                    <li><NavLink to="/"><MdHomeFilled/> Home</NavLink></li>
                    <li><NavLink to="/music"><IoMusicalNotesSharp/> Music</NavLink></li>
                    <li><NavLink to="/movies"><MdMovie/> Movies</NavLink></li>
                    <li><NavLink to="/books"><GiBookshelf/> Books</NavLink></li>
                    <li><button className='white_btn' onClick={handleLogout}>Logout <IoLogOutSharp/></button></li>
                </ul>
            </div>

            <div className="social-media">
                <div className="hamburger-menu">
                    <a href="#" onClick={() => setShowMediaIcons(!showMediaIcons)}><GiHamburgerMenu /></a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
