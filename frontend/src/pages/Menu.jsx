import { menuByCategory } from "../data/content";

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

export default function Menu() {
  return (
    <main className="page menu-page">
      <section className="section-intro">
        <p className="section-kicker">Culinary Program</p>
        <h2>Our Menu</h2>
        <p className="section-copy">
          Seasonal ingredients, contemporary Italian technique, and elegant presentation in every
          course.
        </p>
      </section>
      {Object.entries(menuByCategory).map(([category, items]) => (
        <section className="menu-section" key={category}>
          <h3 className="menu-category">{category}</h3>
          <ul className="menu-list">
            {items.map((item) => (
              <li key={item.name} className="menu-item">
                <div className="menu-item-copy">
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                </div>
                <span className="menu-price">{formatPrice(item.price)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
