def test_admin_route_requires_auth(client):
  response = client.get("/api/admin/newsletter")
  assert response.status_code == 401


def test_admin_login_and_session_me(client):
  login = client.post(
      "/api/admin/login", json={"username": "manager", "password": "manager-pass"}
  )
  assert login.status_code == 200

  me = client.get("/api/admin/me")
  payload = me.get_json()
  assert me.status_code == 200
  assert payload["authenticated"] is True
  assert payload["username"] == "manager"


def test_admin_can_create_menu_item_after_login(client):
  client.post("/api/admin/login", json={"username": "manager", "password": "manager-pass"})
  response = client.post(
      "/api/admin/menu-items",
      json={
          "category": "Main Courses",
          "name": "Duck Confit",
          "description": "Duck leg with herbed jus",
          "price": "29.00",
      },
  )
  assert response.status_code == 201
