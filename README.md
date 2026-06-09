# Anvay Sharma — AI Engineer Portfolio

A premium, high-fidelity developer portfolio website showcasing custom AI agents, production machine learning pipelines, and full-stack software development. Features a dark/light responsive interface, a mouse-reactive neural network interactive background, and a dedicated Flask-based SMTP enquiry mailer.

---

## 🚀 Features

* **Interactive Neural Canvas:** High-performance HTML5 canvas animation representing anatomical brain paths and synaptic networks that respond to cursor movement and click bursts.
* **Modern Typography & Layout:** Styled using curated Google Fonts (*Bricolage Grotesque*, *JetBrains Mono*, *Hanken Grotesk*) and a fluid CSS grid design.
* **Premium Micro-interactions:** Smooth magnetic button tracking, custom vector cursor ring, and 3D card tilt/spotlight effects.
* **Dual Themes:** Clean toggling between signature acid-dark mode and high-contrast light mode.
* **SMTP Contact Mailer:** Dedicated backend routing form submissions directly to your inbox via a secure Python SMTP API.

---

## 🛠️ Tech Stack

### Frontend
* **Core:** HTML5, CSS3 (Vanilla), JavaScript (ES6)
* **Animation:** HTML5 Canvas, 2D Context API

### Backend (Enquiry Service)
* **Core:** Flask (Python)
* **Email Dispatch:** Python `smtplib`, `email.mime`
* **Configuration:** `python-dotenv` for secure environment variable isolation
* **CORS Management:** `Flask-CORS` for cross-origin frontend communication

---

## 💻 Local Setup & Execution

### 1. Backend Server Setup
Navigate to the repository folder and configure the Python virtual environment:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (if not already existing)
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file inside the `backend` directory (matching the configuration in `.env.template`):

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
RECEIVER_EMAIL=your-destination-email@gmail.com
```

> ⚠️ **Security Note:** Never commit `.env` containing credentials to version control. It is explicitly ignored via `.gitignore`.

### 3. Run the Servers

#### Start the Flask Backend
From the root of the project, activate the environment and run:
```bash
python backend/app.py
```
*The mailer API will run on **`http://localhost:5000`**.*

#### Start the Frontend Site
To run the static files locally, host them via any HTTP server (e.g. Python's built-in utility):
```bash
python -m http.server 8000 --directory anvay-portfolio
```
*Open **`http://localhost:8000`** in your browser to view the portfolio.*
