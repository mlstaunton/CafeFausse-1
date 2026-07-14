import { useState } from "react";
import { apiUrl } from "../lib/api";

const initialState = {
  reservation_date: "",
  reservation_time: "",
  guests: 2,
  customer_name: "",
  email_address: "",
  phone_number: "",
};

function toMinutes(clockValue) {
  const [hours, minutes] = clockValue.split(":").map(Number);
  return hours * 60 + minutes;
}

function toDisplayTime(clockValue) {
  const [hoursRaw, minutesRaw] = clockValue.split(":").map(Number);
  const meridiem = hoursRaw >= 12 ? "PM" : "AM";
  const hours12 = ((hoursRaw + 11) % 12) + 1;
  const minutes = minutesRaw.toString().padStart(2, "0");
  return `${hours12}:${minutes} ${meridiem}`;
}

function buildTimeSlots(dateValue) {
  if (!dateValue) return [];

  const selected = new Date(`${dateValue}T12:00:00`);
  const isSunday = selected.getDay() === 0;
  const opening = "17:00";
  const closing = isSunday ? "21:00" : "23:00";
  const slots = [];

  for (let minute = toMinutes(opening); minute <= toMinutes(closing); minute += 30) {
    const hh = String(Math.floor(minute / 60)).padStart(2, "0");
    const mm = String(minute % 60).padStart(2, "0");
    const value = `${hh}:${mm}`;
    slots.push({ value, label: toDisplayTime(value) });
  }

  return slots;
}

export default function Reservations() {
  const [formData, setFormData] = useState(initialState);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const availableTimes = buildTimeSlots(formData.reservation_date);

  function onChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuggestions([]);
  }

  function addDays(dateValue, amount) {
    const date = new Date(`${dateValue}T12:00:00`);
    date.setDate(date.getDate() + amount);
    return date.toISOString().slice(0, 10);
  }

  async function checkAvailability(dateValue, timeValue) {
    const response = await fetch(
      `${apiUrl("/api/reservations/availability")}?time_slot=${encodeURIComponent(
        `${dateValue}T${timeValue}`
      )}`
    );
    if (!response.ok) return false;
    const payload = await response.json();
    return payload.is_available;
  }

  async function suggestAlternatives(dateValue, timeValue) {
    const nextOptions = [];

    for (let dayOffset = 0; dayOffset <= 3; dayOffset += 1) {
      const candidateDate = addDays(dateValue, dayOffset);
      const slots = buildTimeSlots(candidateDate);
      const filteredSlots =
        dayOffset === 0
          ? slots.filter((slot) => toMinutes(slot.value) > toMinutes(timeValue))
          : slots;

      for (const slot of filteredSlots) {
        // Only check as many slots as needed for user-friendly alternatives.
        const isAvailable = await checkAvailability(candidateDate, slot.value);
        if (isAvailable) {
          nextOptions.push({
            date: candidateDate,
            time: slot.value,
            label: `${candidateDate} at ${slot.label}`,
          });
        }
        if (nextOptions.length >= 4) {
          setSuggestions(nextOptions);
          return;
        }
      }
    }

    setSuggestions(nextOptions);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSuggestions([]);

    if (!formData.reservation_date || !formData.reservation_time) {
      setError("Please select both a date and time.");
      return;
    }

    const payloadBody = {
      ...formData,
      time_slot: `${formData.reservation_date}T${formData.reservation_time}`,
    };

    try {
      const response = await fetch(apiUrl("/api/reservations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBody),
      });

      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          await suggestAlternatives(formData.reservation_date, formData.reservation_time);
        }
        throw new Error(payload.error || "Reservation failed");
      }

      setMessage(
        `Reservation confirmed. Table ${payload.table_number} booked for ${payload.time_slot}.`
      );
      setFormData(initialState);
      setSuggestions([]);
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <main className="page reservations-page">
      <section className="section-intro">
        <p className="section-kicker">Book Your Evening</p>
        <h2>Reservations</h2>
        <p className="section-copy">
          Reserve your preferred time and we will confirm your table instantly when available.
        </p>
      </section>

      <section className="reservation-layout">
        <form className="form-card reservation-form" onSubmit={onSubmit}>
          <div className="field-row">
            <label>
              Date
              <input
                type="date"
                name="reservation_date"
                value={formData.reservation_date}
                onChange={(event) => {
                  onChange(event);
                  setFormData((prev) => ({ ...prev, reservation_time: "" }));
                }}
                required
              />
            </label>
            <label>
              Time
              <select
                name="reservation_time"
                value={formData.reservation_time}
                onChange={onChange}
                required
                disabled={!formData.reservation_date}
              >
                <option value="">
                  {formData.reservation_date ? "Select a time" : "Select a date first"}
                </option>
                {availableTimes.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Number of Guests
            <input
              type="number"
              name="guests"
              min="1"
              max="12"
              value={formData.guests}
              onChange={onChange}
              required
            />
          </label>
          <label>
            Customer Name
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={onChange}
              required
            />
          </label>
          <label>
            Email Address
            <input
              type="email"
              name="email_address"
              value={formData.email_address}
              onChange={onChange}
              required
            />
          </label>
          <label>
            Phone Number (optional)
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={onChange}
            />
          </label>
          <button type="submit" className="reservation-submit">
            Book Table
          </button>
        </form>

        <aside className="reservation-notes card">
          <h3>Reservation Notes</h3>
          <ul>
            <li>Tables are held for 15 minutes beyond reservation time.</li>
            <li>Please contact us for parties larger than 12 guests.</li>
            <li>Private dining requests are available with advance notice.</li>
          </ul>
        </aside>
      </section>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {suggestions.length > 0 && (
        <section className="reservation-suggestions card">
          <h3>Next Available Times</h3>
          <p>The selected slot is full. Choose one of these available options:</p>
          <div className="suggestion-list">
            {suggestions.map((option) => (
              <button
                key={`${option.date}-${option.time}`}
                type="button"
                className="suggestion-chip"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    reservation_date: option.date,
                    reservation_time: option.time,
                  }))
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
