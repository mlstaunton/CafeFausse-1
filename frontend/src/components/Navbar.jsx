import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/reservations", label: "Reservations" },
  { to: "/about", label: "About Us" },
  { to: "/gallery", label: "Gallery" },
  { to: "/admin", label: "Admin" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header premium-nav">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          CF
        </span>
        <div>
          <h1>Cafe Fausse</h1>
          <p>Washington, DC</p>
        </div>
      </div>

      <button
        type="button"
        className="nav-toggle"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        Menu
      </button>

      <nav className={menuOpen ? "nav-panel open" : "nav-panel"}>
        <ul className="nav-list premium-links">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <NavLink to="/reservations" className="reserve-cta">
        Reserve a Table
      </NavLink>
    </header>
  );
}
