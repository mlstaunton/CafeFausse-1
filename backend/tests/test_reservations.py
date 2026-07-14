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
