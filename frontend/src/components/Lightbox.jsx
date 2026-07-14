import { useEffect } from "react";

export default function Lightbox({ image, onClose, onPrev, onNext }) {
  if (!image) return null;

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="presentation">
      <div className="lightbox-card" onClick={(event) => event.stopPropagation()}>
        <button className="lightbox-nav lightbox-prev" onClick={onPrev} type="button">
          &#10094;
        </button>
        <button className="close-btn" onClick={onClose} type="button">
          Close
        </button>
        <img src={image.src} alt={image.alt} />
        <button className="lightbox-nav lightbox-next" onClick={onNext} type="button">
          &#10095;
        </button>
      </div>
    </div>
  );
}
