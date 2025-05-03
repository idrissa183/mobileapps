import smtplib
import logging
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from ..config.settings import get_settings

settings = get_settings()
logger = logging.getLogger("app.utils.email")

EMAIL_TEMPLATES_DIR = Path(__file__).parent.parent / "templates" / "email"

def get_email_template(template_name: str) -> str:
    """Get the HTML template for an email"""
    template_path = EMAIL_TEMPLATES_DIR / f"{template_name}.html"
    try:
        with open(template_path, "r") as f:
            return f.read()
    except FileNotFoundError:
        logger.error(f"Email template {template_name} not found")
        # Fallback template
        return """
        <html>
        <body>
            <h1>{{title}}</h1>
            <p>{{content}}</p>
        </body>
        </html>
        """


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send an email with the given content"""
    try:
        message = MIMEMultipart()
        message["From"] = settings.EMAIL_USERNAME
        message["To"] = to_email
        message["Subject"] = subject

        message.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()  # Enable TLS
            server.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
            server.send_message(message)

        logger.info(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False


def send_otp_email(recipient_email: str, recipient_name: str, otp_code: str) -> bool:
    """Send an email with OTP verification code"""
    try:
        template = get_email_template("otp_verification")
        subject = f"{settings.APP_NAME} - Code de vérification"

        html_content = (
            template
            .replace("{{name}}", recipient_name)
            .replace("{{otp_code}}", otp_code)
            .replace("{{app_name}}", settings.APP_NAME)
            .replace("{{valid_minutes}}", "1")
        )

        return send_email(recipient_email, subject, html_content)
    except Exception as e:
        logger.error(f"Error sending OTP email: {str(e)}")
        return False


def send_password_reset_email(recipient_email: str, recipient_name: str, reset_code: str, reset_url: str) -> bool:
    """Send an email with password reset link"""
    try:
        template = get_email_template("password_reset")
        subject = f"{settings.APP_NAME} - Réinitialisation de mot de passe"

        html_content = (
            template
            .replace("{{name}}", recipient_name)
            .replace("{{reset_url}}", reset_url)
            .replace("{{app_name}}", settings.APP_NAME)
            .replace("{{valid_hours}}", "1")
        )

        return send_email(recipient_email, subject, html_content)
    except Exception as e:
        logger.error(f"Error sending password reset email: {str(e)}")
        return False


def send_transaction_confirmation_email(recipient_email: str, recipient_name: str,
                                        transaction_type: str, amount: float,
                                        currency: str, account_name: str) -> bool:
    """Send an email confirming a transaction"""
    try:
        template = get_email_template("transaction_confirmation")
        subject = f"{settings.APP_NAME} - Confirmation de {transaction_type}"

        formatted_amount = f"{amount:.2f} {currency}"

        html_content = (
            template
            .replace("{{name}}", recipient_name)
            .replace("{{transaction_type}}", transaction_type)
            .replace("{{amount}}", formatted_amount)
            .replace("{{account_name}}", account_name)
            .replace("{{app_name}}", settings.APP_NAME)
            .replace("{{date}}", f"{datetime.now().strftime('%d/%m/%Y à %H:%M')}")
        )

        return send_email(recipient_email, subject, html_content)
    except Exception as e:
        logger.error(f"Error sending transaction confirmation email: {str(e)}")
        return False