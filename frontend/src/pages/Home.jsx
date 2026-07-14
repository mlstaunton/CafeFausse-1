import { imageMap } from "../data/content";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero-premium">
        <img src={imageMap.homeHero} alt="Cafe Fausse dining room" className="hero-image" />
        <div className="hero-overlay" />
        <div className="hero-copy premium-copy">
          <p className="hero-kicker">Fine Dining Since 2010</p>
          <h2>A Refined Evening at Cafe Fausse</h2>
          <p>
            Seasonal Italian-inspired tasting menus, candlelit ambiance, and attentive service
            designed for memorable occasions.
          </p>
          <div className="hero-actions">
            <Link to="/reservations" className="btn-primary">
              Reserve a Table
            </Link>
            <Link to="/menu" className="btn-secondary">
              View Menu
            </Link>
          </div>
        </div>
      </section>

      <section className="home-details">
        <article className="detail-card">
          <h3>Visit Us</h3>
          <p>1234 Culinary Ave, Suite 100, Washington, DC 20002</p>
          <p>(202) 555-4567</p>
        </article>
        <article className="detail-card">
          <h3>Hours</h3>
          <p>Monday-Saturday: 5:00 PM-11:00 PM</p>
          <p>Sunday: 5:00 PM-9:00 PM</p>
        </article>
        <article className="detail-card">
          <h3>Dress Code</h3>
          <p>Elegant evening attire recommended.</p>
          <p>Private dining available on request.</p>
        </article>
      </section>

      <section className="signature-grid">
        <article className="signature-card">
          <img src={imageMap.specialEvent} alt="Signature event dining room setup" />
          <div>
            <h3>Celebrations & Private Events</h3>
            <p>
              Host intimate gatherings and milestone dinners in a setting designed for elevated
              hospitality.
            </p>
          </div>
        </article>
        <article className="signature-card">
          <img src={imageMap.ribeye} alt="Chef's ribeye presentation" />
          <div>
            <h3>Chef-Driven Cuisine</h3>
            <p>
              Our kitchen highlights premium ingredients, seasonal produce, and expressive plating
              in every course.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
