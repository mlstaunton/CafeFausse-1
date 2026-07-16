import { useEffect, useState } from "react";
import { apiOriginLabel, apiUrl } from "../lib/api";

const API_BASE = apiUrl("/api/admin");
const emptyMenu = { category: "Main Courses", name: "", description: "", price: "" };

export default function Admin() {
  const [menuItem, setMenuItem] = useState(emptyMenu);
  const [menuItems, setMenuItems] = useState([]);
  const [newsletter, setNewsletter] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [auth, setAuth] = useState({ authenticated: false, username: "" });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  useEffect(() => {
    checkAuth();
  }, []);

  async function adminFetch(path, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        credentials: "include",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(payload.error || "Request failed.");
      }

      // Clear stale UI errors once a request succeeds.
      setError("");
      return payload;
    } catch (requestError) {
      if (requestError?.message === "Failed to fetch") {
        throw new Error(`Cannot reach backend API at ${apiOriginLabel()}.`);
      }
      throw requestError;
    }
  }

  async function checkAuth() {
    try {
      const payload = await adminFetch("/me", { method: "GET" });
      setAuth(payload);
      if (payload.authenticated) {
        await Promise.all([loadMenuItems(), loadNewsletter(), loadReservations(dateFilter)]);
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function updateMenuField(event) {
    const { name, value } = event.target;
    setMenuItem((prev) => ({ ...prev, [name]: value }));
  }

  function updateLoginField(event) {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  async function login(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = await adminFetch("/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      setAuth({ authenticated: true, username: payload.username || loginForm.username });
      setLoginForm({ username: "", password: "" });
      setMessage("Signed in to manager dashboard.");
      await Promise.all([loadMenuItems(), loadNewsletter(), loadReservations(dateFilter)]);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function logout() {
    setMessage("");
    setError("");
    try {
      await adminFetch("/logout", { method: "POST" });
      setAuth({ authenticated: false, username: "" });
      setMenuItems([]);
      setNewsletter([]);
      setReservations([]);
      setMessage("Signed out.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveMenuItem(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await adminFetch("/menu-items", {
        method: "POST",
        body: JSON.stringify(menuItem),
      });
      setMessage("Menu item saved successfully.");
      setMenuItem(emptyMenu);
      await loadMenuItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function loadMenuItems() {
    const payload = await adminFetch("/menu-items", { method: "GET" });
    setMenuItems(payload.data || []);
  }

  async function deleteMenuItem(menuItemId, name) {
    setMessage("");
    setError("");
    try {
      await adminFetch(`/menu-items/${menuItemId}`, { method: "DELETE" });
      setMessage(`Deleted menu item: ${name}.`);
      await loadMenuItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function loadNewsletter() {
    const payload = await adminFetch("/newsletter", { method: "GET" });
    setNewsletter(payload.data || []);
  }

  async function loadReservations(date = "") {
    const query = date ? `?date=${date}` : "";
    const payload = await adminFetch(`/reservations${query}`, { method: "GET" });
    setReservations(payload.data || []);
  }

  async function cancelReservation(reservationId) {
    setMessage("");
    setError("");
    try {
      await adminFetch(`/reservations/${reservationId}`, { method: "DELETE" });
      setMessage(`Reservation ${reservationId} canceled.`);
      await loadReservations(dateFilter);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function applyFilter(event) {
    event.preventDefault();
    setError("");
    try {
      await loadReservations(dateFilter);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (!auth.authenticated) {
    return (
      <main className="page">
        <h2>Manager Admin</h2>
        <section className="card">
          <h3>Sign In</h3>
          <form className="form-card" onSubmit={login}>
            <label>
              Username
              <input
                name="username"
                value={loginForm.username}
                onChange={updateLoginField}
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={loginForm.password}
                onChange={updateLoginField}
                required
              />
            </label>
            <button type="submit">Sign In</button>
          </form>
        </section>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
      </main>
    );
  }

  return (
    <main className="page">
      <h2>Manager Admin</h2>
      <p>Signed in as {auth.username}.</p>
      <button type="button" onClick={logout}>
        Sign Out
      </button>

      <section className="card">
        <h3>Add Menu Item</h3>
        <form className="form-card" onSubmit={saveMenuItem}>
          <label>
            Category
            <select name="category" value={menuItem.category} onChange={updateMenuField}>
              <option>Starters</option>
              <option>Main Courses</option>
              <option>Desserts</option>
              <option>Beverages</option>
            </select>
          </label>
          <label>
            Name
            <input name="name" value={menuItem.name} onChange={updateMenuField} required />
          </label>
          <label>
            Description
            <input
              name="description"
              value={menuItem.description}
              onChange={updateMenuField}
              required
            />
          </label>
          <label>
            Price
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={menuItem.price}
              onChange={updateMenuField}
              required
            />
          </label>
          <button type="submit">Save Item</button>
        </form>
      </section>

      <section className="card">
        <h3>Saved Menu Items</h3>
        <button type="button" onClick={loadMenuItems}>
          Refresh Menu Items
        </button>
        <ul className="admin-list">
          {menuItems.map((entry) => (
            <li key={entry.menu_item_id}>
              <div>
                <strong>{entry.name}</strong> ({entry.category}) - ${entry.price.toFixed(2)}
                <br />
                <span>{entry.description}</span>
              </div>
              <button
                type="button"
                onClick={() => deleteMenuItem(entry.menu_item_id, entry.name)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Reservations Dashboard</h3>
        <form className="newsletter-form" onSubmit={applyFilter}>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
          <button type="submit">Apply Date Filter</button>
          <button
            type="button"
            onClick={() => {
              setDateFilter("");
              loadReservations("");
            }}
          >
            Clear
          </button>
        </form>
        <ul className="admin-list">
          {reservations.map((entry) => (
            <li key={entry.reservation_id}>
              <div>
                <strong>{entry.customer_name}</strong> ({entry.email_address}) - Table{" "}
                {entry.table_number}, Guests {entry.guests}, {entry.time_slot}
              </div>
              <button type="button" onClick={() => cancelReservation(entry.reservation_id)}>
                Cancel
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Newsletter Subscribers</h3>
        <button type="button" onClick={loadNewsletter}>
          Refresh Subscribers
        </button>
        <ul className="admin-list">
          {newsletter.map((entry) => (
            <li key={entry.email_address}>{entry.email_address}</li>
          ))}
        </ul>
      </section>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
    </main>
  );
}
