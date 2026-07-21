import { useState } from "react";
import { apiUrl } from "../lib/api";

const initialBatch = { date: "", time: "18:00", quantity: 5 };

export default function DevTools() {
  const [batchForm, setBatchForm] = useState(initialBatch);
  const [clearDate, setClearDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateBatchField(event) {
    const { name, value } = event.target;
    setBatchForm((prev) => ({ ...prev, [name]: value }));
  }

  async function parseApiResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();
    // Common symptom of stale deploy or routing fallback to index.html.
    if (text.trim().startsWith("<!doctype") || text.trim().startsWith("<html")) {
      return {
        error:
          "Received HTML instead of API JSON. Verify latest backend is deployed and you are signed in via /admin.",
      };
    }
    return { error: text || "Unexpected non-JSON response from API." };
  }

  async function runBatchBooking(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(apiUrl("/api/admin/dev/book-batch"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: batchForm.date,
          time: batchForm.time,
          quantity: Number(batchForm.quantity),
        }),
      });
      const payload = await parseApiResponse(response);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in at /admin before using /dev tools.");
        }
        throw new Error(payload.error || "Batch booking failed.");
      }
      setMessage(
        `Created ${payload.created} reservation(s) for ${payload.service_date}. Tables: ${payload.booked_tables.join(", ")}.`
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function clearDayBookings(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${apiUrl("/api/admin/reservations/by-date")}?date=${encodeURIComponent(clearDate)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const payload = await parseApiResponse(response);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in at /admin before using /dev tools.");
        }
        throw new Error(payload.error || "Unable to clear day bookings.");
      }
      setMessage(`Deleted ${payload.deleted_count} reservation(s) for ${clearDate}.`);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="page">
      <section className="section-intro">
        <p className="section-kicker">Developer Tools</p>
        <h2>Reservation Load Testing</h2>
        <p className="section-copy">
          Hidden utility page for quickly creating and deleting reservation sets. Sign in at
          `/admin` first so your admin session is active.
        </p>
      </section>

      <section className="card">
        <h3>Quick Book Multiple Tables</h3>
        <form className="form-card" onSubmit={runBatchBooking}>
          <label>
            Service Date
            <input
              type="date"
              name="date"
              value={batchForm.date}
              onChange={updateBatchField}
              required
            />
          </label>
          <label>
            Time Slot
            <input
              type="time"
              name="time"
              value={batchForm.time}
              onChange={updateBatchField}
              required
            />
          </label>
          <label>
            Number of Tables to Book
            <input
              type="number"
              name="quantity"
              min="1"
              max="30"
              value={batchForm.quantity}
              onChange={updateBatchField}
              required
            />
          </label>
          <button type="submit">Run Batch Booking</button>
        </form>
      </section>

      <section className="card">
        <h3>Delete Whole Day Bookings</h3>
        <form className="form-card" onSubmit={clearDayBookings}>
          <label>
            Service Date
            <input type="date" value={clearDate} onChange={(event) => setClearDate(event.target.value)} required />
          </label>
          <button type="submit">Delete Day Reservations</button>
        </form>
      </section>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </main>
  );
}
