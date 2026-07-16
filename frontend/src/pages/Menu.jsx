import { useEffect, useState } from "react";
import { menuByCategory } from "../data/content";
import { apiUrl } from "../lib/api";

const categoryLabels = {
  Beverages: "beverages",
  Starters: "starters",
  "Main Courses": "mains",
  Desserts: "deserts",
};
const categoryOrder = ["Beverages", "Starters", "Main Courses", "Desserts"];

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

export default function Menu() {
  const [menuData, setMenuData] = useState(menuByCategory);
  const orderedCategories = [
    ...categoryOrder.filter((category) => menuData[category]),
    ...Object.keys(menuData).filter((category) => !categoryOrder.includes(category)),
  ];

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
      {orderedCategories.map((category) => (
        <section className="menu-section" key={category}>
          <h3 className="menu-category">{categoryLabels[category] || category.toLowerCase()}</h3>
          <ul className="menu-list">
            {menuData[category].map((item) => (
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
