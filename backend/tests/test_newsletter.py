def test_newsletter_signup_and_admin_view(client):
  signup = client.post("/api/newsletter", json={"email_address": "guest@example.com"})
  assert signup.status_code == 201

  unauthorized = client.get("/api/admin/newsletter")
  assert unauthorized.status_code == 401

  client.post("/api/admin/login", json={"username": "manager", "password": "manager-pass"})
  authorized = client.get("/api/admin/newsletter")
  assert authorized.status_code == 200
  data = authorized.get_json()["data"]
  assert any(item["email_address"] == "guest@example.com" for item in data)
