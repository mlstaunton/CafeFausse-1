import { useState } from "react";
import Lightbox from "../components/Lightbox";
import { awards, imageMap, testimonials } from "../data/content";

const galleryImages = [
  { src: imageMap.cafeInterior, alt: "Cafe interior", title: "Interior Ambiance" },
  { src: imageMap.specialEvent, alt: "Special event dining", title: "Special Events" },
  { src: imageMap.ribeye, alt: "Signature ribeye dish", title: "Signature Dishes" },
];

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const selected = selectedIndex === null ? null : galleryImages[selectedIndex];

  function showPrevious() {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + galleryImages.length) % galleryImages.length);
  }

  function showNext() {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % galleryImages.length);
  }

  return (
    <main className="page gallery-page">
      <section className="section-intro">
        <p className="section-kicker">Visual Experience</p>
        <h2>Gallery</h2>
        <p className="section-copy">
          Explore our interiors, signature plates, and memorable evenings at Cafe Fausse.
        </p>
      </section>

      <section className="gallery-grid gallery-grid-premium">
        {galleryImages.map((image, index) => (
          <button
            type="button"
            className="gallery-item"
            key={image.src}
            onClick={() => setSelectedIndex(index)}
          >
            <img src={image.src} alt={image.alt} />
            <span className="gallery-caption">{image.title}</span>
          </button>
        ))}
      </section>

      <section className="card-grid gallery-meta-grid">
        <article className="card gallery-meta-card">
          <h3>Awards</h3>
          <ul className="gallery-meta-list">
            {awards.map((award) => (
              <li key={award}>{award}</li>
            ))}
          </ul>
        </article>
        <article className="card gallery-meta-card">
          <h3>Customer Reviews</h3>
          <ul className="gallery-meta-list">
            {testimonials.map((quote) => (
              <li key={quote}>{quote}</li>
            ))}
          </ul>
        </article>
      </section>

      <Lightbox
        image={selected}
        onClose={() => setSelectedIndex(null)}
        onPrev={showPrevious}
        onNext={showNext}
      />
    </main>
  );
}
