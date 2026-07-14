import { useState } from "react";
import { apiUrl } from "../lib/api";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(apiUrl("/api/newsletter"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_address: email }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Signup failed");
      }
      setMessage("Subscribed successfully.");
      setEmail("");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <section className="newsletter card">
      <p className="newsletter-kicker">Cafe Fausse Journal</p>
      <h3>Join Our Newsletter</h3>
      <p className="newsletter-copy">
        Seasonal menus, private dining announcements, and curated event invitations.
      </p>
      <form className="newsletter-form" onSubmit={submit}>
        <input
          className="newsletter-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
        <button type="submit" className="newsletter-submit">
          Subscribe
        </button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
