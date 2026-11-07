"""Gui email. Neu chua cau hinh SMTP thi chi ghi ra console (dung khi phat trien)."""
import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

log = logging.getLogger("a4.mail")


def send_mail(to: str, subject: str, body: str) -> bool:
    if not settings.SMTP_HOST:
        log.warning("[MAIL gia lap] To=%s | %s | %s", to, subject, body)
        return False
    msg = EmailMessage()
    msg["From"], msg["To"], msg["Subject"] = settings.SMTP_FROM, to, subject
    msg.set_content(body)
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as s:
            s.starttls()
            if settings.SMTP_USER:
                s.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            s.send_message(msg)
        return True
    except Exception as e:  # noqa: BLE001
        log.error("Gui mail that bai: %s", e)
        return False
