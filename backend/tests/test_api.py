from conftest import login, new_ticket


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_login_ok_wrong_locked(client, H):
    assert client.post("/api/auth/login", json={"username": "user1", "password": "sai"}).status_code == 401
    assert client.post("/api/auth/login", json={"username": "anh.pm@a4.edu.vn", "password": "123456"}).status_code == 200  # dang nhap bang email
    uid = [u for u in client.get("/api/users", headers=H["admin"]).json() if u["username"] == "user2"][0]["id"]
    assert client.post(f"/api/users/{uid}/toggle-lock", headers=H["admin"]).json()["is_active"] is False
    assert client.post("/api/auth/login", json={"username": "user2", "password": "123456"}).status_code == 403
    assert client.get("/api/auth/me", headers=H["user2"]).status_code == 403   # token cu cung bi chan


def test_auth_required_and_rbac(client, H):
    assert client.get("/api/tickets").status_code == 401
    assert client.get("/api/users", headers=H["user1"]).status_code == 403
    assert client.get("/api/dashboard/by-tech", headers=H["ktv1"]).status_code == 403
    assert client.put("/api/settings", json={"sla_low": 1, "sla_mid": 1, "sla_high": 1, "sla_urgent": 1, "auto_assign": True}, headers=H["user1"]).status_code == 403
    assert client.post("/api/tickets", json={"title": "x", "type": "Wi-Fi", "description": "d", "location": "l"}, headers=H["ktv1"]).status_code == 403  # KTV/Admin khong tao phieu


def test_create_ticket_autoassign_by_skill_and_load(client, H):
    t1 = new_ticket(client, H)                       # Wi-Fi -> ktv1 hoac ktv3 (ktv2 khong co Wi-Fi)
    assert t1["code"] == "HD-0001" and t1["status"] == "new" and t1["tech"]["name"] != "Trần Thị Mai"
    t2 = new_ticket(client, H, "user2")              # nguoi con lai (it phieu hon)
    assert t2["tech"]["id"] != t1["tech"]["id"]
    t3 = new_ticket(client, H, title="Máy chiếu hỏng", type="Thiết bị")
    assert t3["tech"]["name"] in ("Trần Thị Mai", "Lê Quốc Bảo")
    assert any("Tự động phân công" in h["action"] for h in t1["history"])


def test_no_matching_tech_waits_for_admin(client, H):
    # khoa het KTV co chuyen mon Internet (chi ktv1)
    uid = [u for u in client.get("/api/users", headers=H["admin"]).json() if u["username"] == "ktv1"][0]["id"]
    client.post(f"/api/users/{uid}/toggle-lock", headers=H["admin"])
    t = new_ticket(client, H, type="Internet")
    assert t["tech"] is None
    notes = client.get("/api/notifications", headers=H["admin"]).json()
    assert any("chưa có KTV phù hợp" in n["message"] for n in notes)


def test_auto_assign_off(client, H):
    cfg = client.get("/api/settings", headers=H["admin"]).json(); cfg["auto_assign"] = False
    assert client.put("/api/settings", json=cfg, headers=H["admin"]).json()["auto_assign"] is False
    t = new_ticket(client, H)
    assert t["tech"] is None
    r = client.post(f"/api/tickets/{t['id']}/auto-assign", headers=H["admin"])
    assert r.status_code == 200 and r.json()["tech"]
    t2 = new_ticket(client, H, "user2")
    r = client.post("/api/tickets/auto-assign-all", headers=H["admin"])
    assert r.json()["assigned"] == 1


def test_unavailable_tech_skipped(client, H):
    client.put("/api/auth/profile", json={"is_available": False}, headers=H["ktv1"])
    client.put("/api/auth/profile", json={"is_available": False}, headers=H["ktv3"])
    t = new_ticket(client, H)
    assert t["tech"] is None                         # khong con KTV Wi-Fi nao san sang


def test_full_workflow_and_metrics(client, H):
    t = new_ticket(client, H); tid = t["id"]; tech = "ktv1" if t["tech"]["name"].endswith("Hùng") else "ktv3"
    other = "ktv3" if tech == "ktv1" else "ktv1"
    assert client.post(f"/api/tickets/{tid}/start", headers=H[other]).status_code == 404   # KTV khac khong thay phieu
    assert client.post(f"/api/tickets/{tid}/resolve", json={"cause": "a", "action": "b", "outcome": "c"}, headers=H[tech]).status_code == 409  # chua start
    r = client.post(f"/api/tickets/{tid}/start", headers=H[tech]); assert r.status_code == 200 and r.json()["status"] == "doing"
    assert client.post(f"/api/tickets/{tid}/start", headers=H[tech]).status_code == 409
    r = client.post(f"/api/tickets/{tid}/resolve", json={"cause": "AP treo", "action": "Khởi động lại", "outcome": "OK"}, headers=H[tech])
    assert r.json()["status"] == "done" and r.json()["result_cause"] == "AP treo"
    assert client.post(f"/api/tickets/{tid}/reopen", headers=H["user1"]).json()["status"] == "doing"   # yeu cau xu ly lai
    client.post(f"/api/tickets/{tid}/resolve", json={"cause": "x", "action": "y", "outcome": "z"}, headers=H[tech])
    assert client.post(f"/api/tickets/{tid}/rate", json={"rating": 6}, headers=H["user1"]).status_code == 422
    assert client.post(f"/api/tickets/{tid}/rate", json={"rating": 5, "comment": "Tốt"}, headers=H["user2"]).status_code == 404
    r = client.post(f"/api/tickets/{tid}/rate", json={"rating": 5, "comment": "Tốt"}, headers=H["user1"])
    assert r.json()["status"] == "closed" and r.json()["rating"] == 5
    assert client.post(f"/api/tickets/{tid}/rate", json={"rating": 4}, headers=H["user1"]).status_code == 409
    s = client.get("/api/dashboard/overview", headers=H["admin"]).json()
    assert s["total"] == 1 and s["by_status"]["closed"] == 1 and s["avg_rating"] == 5 and s["avg_resolve_seconds"] is not None


def test_visibility(client, H):
    t = new_ticket(client, H, "user1")
    assert client.get(f"/api/tickets/{t['id']}", headers=H["user2"]).status_code == 404
    assert len(client.get("/api/tickets", headers=H["user2"]).json()) == 0
    assert len(client.get("/api/tickets", headers=H["user1"]).json()) == 1
    assert len(client.get("/api/tickets", headers=H["admin"]).json()) == 1
    assert client.get(f"/api/tickets/{t['id']}", headers=H["admin"]).status_code == 200


def test_manual_assign_close_note_comment(client, H):
    t = new_ticket(client, H, type="Thiết bị"); tid = t["id"]
    ktv3 = [u for u in client.get("/api/users?role=tech", headers=H["admin"]).json() if u["username"] == "ktv3"][0]["id"]
    r = client.post(f"/api/tickets/{tid}/assign", json={"tech_id": ktv3}, headers=H["admin"]); assert r.json()["tech"]["id"] == ktv3
    assert client.post(f"/api/tickets/{tid}/assign", json={"tech_id": 1}, headers=H["admin"]).status_code == 422   # admin khong phai KTV
    assert client.post(f"/api/tickets/{tid}/assign", json={"tech_id": ktv3}, headers=H["ktv1"]).status_code == 403
    assert client.post(f"/api/tickets/{tid}/note", json={"text": "Đang chờ linh kiện"}, headers=H["ktv3"]).status_code == 200
    assert client.post(f"/api/tickets/{tid}/note", json={"text": "x"}, headers=H["user1"]).status_code == 403
    r = client.post(f"/api/tickets/{tid}/comments", json={"text": "Khi nào xong ạ?"}, headers=H["user1"])
    assert r.json()["comments"][0]["by"] == "Phạm Minh Anh"
    assert any("trao đổi" in n["message"] for n in client.get("/api/notifications", headers=H["ktv3"]).json())
    assert client.post(f"/api/tickets/{tid}/close", headers=H["ktv3"]).status_code == 403
    assert client.post(f"/api/tickets/{tid}/close", headers=H["admin"]).json()["status"] == "closed"
    assert client.post(f"/api/tickets/{tid}/close", headers=H["admin"]).status_code == 409
    assert client.post(f"/api/tickets/{tid}/assign", json={"tech_id": ktv3}, headers=H["admin"]).status_code == 409


def test_sla_overdue(client, H):
    from datetime import timedelta
    from app.database import SessionLocal
    from app.models import Ticket
    t = new_ticket(client, H, priority="urgent")
    assert client.get(f"/api/tickets/{t['id']}", headers=H["admin"]).json()["overdue"] is False
    with SessionLocal() as db:
        x = db.get(Ticket, t["id"]); x.created_at = x.created_at - timedelta(hours=3); db.commit()
    assert client.get(f"/api/tickets/{t['id']}", headers=H["admin"]).json()["overdue"] is True
    assert client.get("/api/dashboard/overview", headers=H["admin"]).json()["overdue_open"] == 1


def test_accounts_admin_flow(client, H):
    r = client.post("/api/users", json={"username": "ktv9", "email": "ktv9@a4.edu.vn", "full_name": "Hoàng Văn Chín", "role": "tech", "skills": ["Wi-Fi"]}, headers=H["admin"])
    assert r.status_code == 201 and r.json()["skills"] == ["Wi-Fi"]
    assert client.post("/api/users", json={"username": "KTV9", "email": "z@a4.edu.vn", "full_name": "Trùng"}, headers=H["admin"]).status_code == 409
    assert client.post("/api/users", json={"username": "ab", "email": "bad", "full_name": "x"}, headers=H["admin"]).status_code == 422
    uid = r.json()["id"]
    assert client.put(f"/api/users/{uid}", json={"skills": ["Wi-Fi", "Internet"]}, headers=H["admin"]).json()["skills"] == ["Wi-Fi", "Internet"]
    assert client.put(f"/api/users/{uid}", json={"skills": ["Khong co"]}, headers=H["admin"]).status_code == 422
    assert client.post("/api/auth/login", json={"username": "ktv9", "password": "123456"}).status_code == 200
    # yeu cau cap tai khoan (khong can dang nhap)
    q = client.post("/api/account-requests", json={"full_name": "Hoàng Gia Bảo", "email": "bao.hg@a4.edu.vn"})
    assert q.status_code == 201
    u = client.post(f"/api/account-requests/{q.json()['id']}/approve", headers=H["admin"]).json()
    assert u["username"] == "bao.hg" and client.post("/api/auth/login", json={"username": "bao.hg", "password": "123456"}).status_code == 200
    assert client.post(f"/api/account-requests/{q.json()['id']}/approve", headers=H["admin"]).status_code == 409
    me_id = client.get("/api/auth/me", headers=H["admin"]).json()["id"]
    assert client.post(f"/api/users/{me_id}/toggle-lock", headers=H["admin"]).status_code == 400   # khong tu khoa minh


def test_password_flows(client, H):
    assert client.post("/api/auth/change-password", json={"old_password": "sai", "new_password": "moi123"}, headers=H["user1"]).status_code == 400
    assert client.post("/api/auth/change-password", json={"old_password": "123456", "new_password": "moi123"}, headers=H["user1"]).status_code == 200
    assert client.post("/api/auth/login", json={"username": "user1", "password": "moi123"}).status_code == 200
    r = client.post("/api/auth/forgot-password", json={"email": "khong.co@a4.edu.vn"}); assert r.status_code == 200      # khong lo email
    assert client.post("/api/auth/forgot-password", json={"email": "anh.pm@a4.edu.vn"}).status_code == 200
    assert client.post("/api/auth/login", json={"username": "user1", "password": "moi123"}).status_code == 401           # mat khau da bi thay bang mat khau tam


def test_skills_and_settings_validation(client, H):
    assert "Wi-Fi" in client.get("/api/categories", headers=H["user1"]).json()
    assert client.post("/api/categories", json={"name": "Camera"}, headers=H["admin"]).status_code == 201
    assert client.post("/api/categories", json={"name": "Camera"}, headers=H["admin"]).status_code == 409
    new_ticket(client, H)
    assert client.delete("/api/categories/Wi-Fi", headers=H["admin"]).status_code == 409   # da co phieu
    assert client.delete("/api/categories/Camera", headers=H["admin"]).status_code == 200
    bad = {"sla_low": 0, "sla_mid": 8, "sla_high": 4, "sla_urgent": 1, "auto_assign": True}
    assert client.put("/api/settings", json=bad, headers=H["admin"]).status_code == 422
    assert client.post("/api/tickets", json={"title": "x", "type": "Khong co", "description": "d", "location": "l"}, headers=H["user1"]).status_code == 422


def test_attachments(client, H):
    t = new_ticket(client, H); tid = t["id"]
    png = b"\x89PNG\r\n\x1a\n" + b"0" * 50
    r = client.post(f"/api/tickets/{tid}/attachments", files=[("files", ("anh.png", png, "image/png")), ("files", ("log.txt", b"hello", "text/plain"))], headers=H["user1"])
    assert r.status_code == 201 and len(r.json()["attachments"]) == 2
    url = r.json()["attachments"][0]["url"]
    assert client.get(url, headers=H["user1"]).content == png
    assert client.get(url, headers=H["user2"]).status_code == 404            # nguoi khac khong tai duoc
    assert client.post(f"/api/tickets/{tid}/attachments", files=[("files", ("a.exe", b"MZ", "application/x-msdownload"))], headers=H["user1"]).status_code == 415
    assert client.post(f"/api/tickets/{tid}/attachments", files=[("files", (f"{i}.txt", b"x", "text/plain")) for i in range(5)], headers=H["user1"]).status_code == 422  # vuot 6 tep


def test_stats_endpoints(client, H):
    for _ in range(3): new_ticket(client, H)
    assert [x["count"] for x in client.get("/api/dashboard/by-type", headers=H["admin"]).json()][0] == 3
    assert client.get("/api/dashboard/daily?days=7", headers=H["admin"]).json()[-1]["count"] == 3
    bt = client.get("/api/dashboard/by-tech", headers=H["admin"]).json()
    assert sum(x["open"] for x in bt) == 3
    assert client.get("/api/dashboard/overview", headers=H["user2"]).json()["total"] == 0     # thong ke chi tinh phieu cua minh
    assert len(client.get("/api/reports/logs", headers=H["admin"]).json()) > 0
    c = client.post("/api/notifications/read-all", headers=H["admin"]); assert c.status_code == 200
    assert client.get("/api/notifications/unread-count", headers=H["admin"]).json()["count"] == 0


def test_reports_csv_and_summary(client, H):
    for _ in range(2): new_ticket(client, H)
    r = client.get("/api/reports/tickets.csv", headers=H["admin"])
    assert r.status_code == 200 and r.text.startswith("﻿Mã,") and r.text.count("HD-000") == 2 and "Wi-Fi" in r.text
    assert client.get("/api/reports/tickets.csv?type=Internet", headers=H["admin"]).text.count("HD-000") == 0
    s = client.get("/api/reports/summary", headers=H["admin"]).json()
    assert s["total"] == 2 and s["by_type"]["Wi-Fi"] == 2
    assert client.get("/api/reports/tickets.csv", headers=H["user1"]).status_code == 403
    assert client.get("/api/reports/summary?date_from=2099-01-01", headers=H["admin"]).json()["total"] == 0
