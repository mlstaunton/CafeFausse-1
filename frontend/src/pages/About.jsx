import { aboutText } from "../data/content";

export default function About() {
  return (
    <main className="page about-page">
      <section className="section-intro">
        <p className="section-kicker">Our Story</p>
        <h2>About Us</h2>
        <p className="section-copy">
          Heritage, hospitality, and modern Italian craft define every guest experience.
        </p>
      </section>

      <section className="about-story card">
        <p>{aboutText}</p>
      </section>

      <section className="about-founders card-grid">
        <article className="card profile-card">
          <h3>Chef Antonio Rossi</h3>
          <p>
            Chef Antonio combines classic Italian techniques with modern
            presentation to create rich, memorable dining experiences.
          </p>
        </article>
        <article className="card profile-card">
          <h3>Maria Lopez</h3>
          <p>
            Maria leads service and sourcing with a focus on local ingredients,
            hospitality excellence, and a warm guest experience.
          </p>
        </article>
      </section>
    </main>
  );
}
