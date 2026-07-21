def test_create_reservation_and_list_and_cancel(client):
  create_response = client.post(
      "/api/reservations",
      json={
          "time_slot": "2026-07-01T18:00",
          "guests": 4,
          "customer_name": "Alex Rivera",
          "email_address": "alex@example.com",
          "phone_number": "202-555-1212",
      },
  )
  assert create_response.status_code == 201
  reservation_payload = create_response.get_json()
  reservation_id = reservation_payload["reservation_id"]

  client.post("/api/admin/login", json={"username": "manager", "password": "manager-pass"})

  list_response = client.get("/api/admin/reservations")
  assert list_response.status_code == 200
  list_payload = list_response.get_json()
  assert len(list_payload["data"]) == 1
  assert list_payload["data"][0]["reservation_id"] == reservation_id

  delete_response = client.delete(f"/api/admin/reservations/{reservation_id}")
  assert delete_response.status_code == 200

  list_after_delete = client.get("/api/admin/reservations")
  assert list_after_delete.status_code == 200
  assert list_after_delete.get_json()["data"] == []


def test_reservation_rejects_invalid_email(client):
  response = client.post(
      "/api/reservations",
      json={
          "time_slot": "2026-07-01T18:00",
          "guests": 2,
          "customer_name": "Invalid Email Guest",
          "email_address": "a@.",
      },
  )
  assert response.status_code == 400
  assert response.get_json()["error"] == "A valid email address is required."


def test_reservation_rejects_outside_opening_hours(client):
  response = client.post(
      "/api/reservations",
      json={
          "time_slot": "2026-07-01T14:00",
          "guests": 2,
          "customer_name": "Too Early Guest",
          "email_address": "early@example.com",
      },
  )
  assert response.status_code == 400
  assert response.get_json()["error"] == "Selected time is outside opening hours."


def test_no_more_than_30_tables_can_be_booked_per_evening(client):
  for index in range(30):
    response = client.post(
        "/api/reservations",
        json={
            "time_slot": f"2026-07-02T{18 + (index % 2):02d}:00",
            "guests": 2,
            "customer_name": f"Guest {index}",
            "email_address": f"guest{index}@example.com",
        },
    )
    assert response.status_code == 201

  overflow = client.post(
      "/api/reservations",
      json={
          "time_slot": "2026-07-02T22:30",
          "guests": 2,
          "customer_name": "Overflow Guest",
          "email_address": "overflow@example.com",
      },
  )
  assert overflow.status_code == 409
  assert overflow.get_json()["error"] == "All 30 tables are fully booked for that evening."
