import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=os.getenv("MAIL_PORT"),
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


async def send_verification_code(email: EmailStr, code: str):
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #2B2D42;;
                background: #f5f5dc;
                padding: 20px;
                border-radius: 10px;
            }}
            .code {{
                font-size: 32px;
                font-weight: bold;
                color: #2B2D42;
                background: white;
                padding: 14px;
                text-align: center;
                border-radius: 8px;
                margin: 20px 0;
                letter-spacing: 5px;
            }}
            .footer {{
                color: #666;
                font-size: 12px;
                margin-top: 20px;
                text-align: center;
            }}
            .text{{
                color: #666;
                font-size: 16px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <h2>Добро пожаловать в WordEater!</h2>
            <p class="text">Ваш код подтверждения:</p>
            <div class="code">{code}</div>
            <p class="text">Код действителен в течение <strong>10 минут</strong>.</p>
            <p class="text">Вставьте его в форму подтверждения в приложении.</p>
            <div class="footer">
                <p>Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
            </div>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="Подтверждение регистрации WordEater",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)
