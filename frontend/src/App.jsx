import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import NewsletterSignup from "./components/NewsletterSignup";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Reservations from "./pages/Reservations";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <NewsletterSignup />
    </div>
  );
}
