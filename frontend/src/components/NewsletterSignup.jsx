import { useState } from "react";
import { apiUrl } from "../lib/api";

const EMAIL_PATTERN = "^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+$";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const normalized = email.trim().toLowerCase();
    if (!new RegExp(EMAIL_PATTERN).test(normalized) || normalized.includes("..")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/newsletter"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_address: normalized }),
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
          pattern={EMAIL_PATTERN}
          title="Enter a valid email like name@example.com"
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
