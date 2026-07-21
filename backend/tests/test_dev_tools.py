def test_admin_dev_batch_booking_and_clear_day(client):
  login = client.post("/api/admin/login", json={"username": "manager", "password": "manager-pass"})
  assert login.status_code == 200

  batch = client.post(
      "/api/admin/dev/book-batch",
      json={"date": "2026-07-03", "time": "18:00", "quantity": 4},
  )
  assert batch.status_code == 201
  payload = batch.get_json()
  assert payload["created"] == 4

  clear = client.delete("/api/admin/reservations/by-date?date=2026-07-03")
  assert clear.status_code == 200
  assert clear.get_json()["deleted_count"] == 4
