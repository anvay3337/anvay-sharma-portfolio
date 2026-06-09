import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all incoming origins

# Read configuration from environment variables
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
RECEIVER_EMAIL = os.environ.get("RECEIVER_EMAIL", "anvay3337@gmail.com")

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "healthy", "service": "portfolio-mailer"}), 200

@app.route("/api/enquiry", methods=["POST"])
def enquiry():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "Missing JSON request body."}), 400

        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        query_type = data.get("type", "").strip()
        message = data.get("msg", "").strip()

        # Simple input validation
        if not name or not email or not message:
            return jsonify({"status": "error", "message": "Name, email, and message are required fields."}), 400

        # Construct Email
        subject = f"AI Portfolio Enquiry — {query_type} from {name}"
        
        # HTML template matching portfolio acid/dark aesthetic
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #09090b; color: #ECEAE3; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: auto; background-color: #121215; border: 1px solid rgba(236,234,227,0.1); border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                <h2 style="color: #CCFF00; border-bottom: 1px solid rgba(236,234,227,0.1); padding-bottom: 10px; margin-top: 0;">
                    New Portfolio Enquiry
                </h2>
                
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid rgba(236,234,227,0.05);">
                        <td style="padding: 10px 0; color: #8c8c84; width: 120px; font-weight: bold;">Name:</td>
                        <td style="padding: 10px 0; color: #ECEAE3;">{name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(236,234,227,0.05);">
                        <td style="padding: 10px 0; color: #8c8c84; font-weight: bold;">Email:</td>
                        <td style="padding: 10px 0; color: #ECEAE3;">
                            <a href="mailto:{email}" style="color: #CCFF00; text-decoration: none;">{email}</a>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(236,234,227,0.05);">
                        <td style="padding: 10px 0; color: #8c8c84; font-weight: bold;">Project Need:</td>
                        <td style="padding: 10px 0; color: #CCFF00; font-weight: bold;">{query_type}</td>
                    </tr>
                </table>
                
                <div style="margin-top: 25px;">
                    <h4 style="color: #8c8c84; margin-bottom: 10px;">Message:</h4>
                    <div style="background-color: #0f0f12; border: 1px solid rgba(236,234,227,0.05); padding: 15px; border-radius: 8px; color: #ECEAE3; white-space: pre-wrap; line-height: 1.5;">{message}</div>
                </div>
                
                <div style="margin-top: 30px; font-size: 11px; color: #5d5d57; text-align: center; border-top: 1px solid rgba(236,234,227,0.1); padding-top: 15px;">
                    Sent automatically from your portfolio static app.
                </div>
            </div>
        </body>
        </html>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = RECEIVER_EMAIL
        msg.attach(MIMEText(body, "html"))

        # Verify SMTP configurations
        if not SMTP_USER or not SMTP_PASSWORD:
            print("WARNING: SMTP credentials are not set. Logging email to stdout.")
            print(f"--- EMAIL TO {RECEIVER_EMAIL} ---")
            print(f"Subject: {subject}")
            print(body)
            print("---------------------------------")
            return jsonify({"status": "success", "message": "Enquiry received (Console log capture, SMTP config missing)."}), 200

        # Send Email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, RECEIVER_EMAIL, msg.as_string())

        return jsonify({"status": "success", "message": "Enquiry sent successfully!"}), 200

    except Exception as e:
        print(f"ERROR sending email: {str(e)}")
        return jsonify({"status": "error", "message": "An error occurred while sending the email."}), 500

if __name__ == "__main__":
    # Render sets PORT environment variable, default to 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
