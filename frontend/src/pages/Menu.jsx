import { useEffect, useState } from "react";
import { menuByCategory } from "../data/content";
import { apiUrl } from "../lib/api";

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

export default function Menu() {
  const [menuData, setMenuData] = useState(menuByCategory);

  useEffect(() => {
    async function loadMenu() {
      try {
        const response = await fetch(apiUrl("/api/menu-items"));
        if (!response.ok) return;
        const payload = await response.json();
        const data = payload?.data || {};
        if (Object.keys(data).length > 0) {
          setMenuData(data);
        }
      } catch {
        // Keep SRS seed menu as fallback when API is unreachable.
      }
    }

    loadMenu();
  }, []);

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
      {Object.entries(menuData).map(([category, items]) => (
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
