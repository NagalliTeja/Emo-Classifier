import { Route, Routes, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { BooksHome } from "./pages/Books/BooksHome";
import MoviesHome from "./pages/Movies/MoviesHome";
import MusicHome from "./pages/Music/MusicHome";
import Home from "./pages/Home/Home";

function App() {
	const user = localStorage.getItem('token');
	return (
		<>
			<Routes>
				<Route path="/signup" exact element={<Signup />} />
				<Route path="/login" exact element={<Login />} />
				{user && <Route path="/" exact element={<Home />} />}
				{user && <Route path="/music" exact element={<MusicHome />} />}
				{user && <Route path="/movies" exact element={<MoviesHome />} />}
				{user && <Route path="/books" exact element={<BooksHome />} />}
				<Route path="/" element={<Navigate replace to="/" />} />
			</Routes>
		</>
	);
}

export default App;