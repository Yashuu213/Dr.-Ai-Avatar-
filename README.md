<div align="center">

# 🩺 Dr. AI Avatar
### Your Advanced AI Medical Consultant & Virtual Triage Assistant

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](#)
[![Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](#)

*An empathetic, context-aware, and intelligent medical AI that conducts patient intake, performs diagnostic Q&A, and generates beautifully structured medical reports.*

</div>

---

## ✨ Features

* 🤖 **Smart Medical Triage:** Conducts professional patient intakes using strict diagnostic guidelines.
* 💬 **Natural Multilingual Chat:** Automatically matches the user's language (English, Hindi, Hinglish) for a seamless experience.
* 📝 **Automated Medical Reports:** Generates highly structured, beautiful medical reports (PDF-ready) directly from the consultation context.
* 🎨 **Stunning UI/UX:** Built with React & Tailwind CSS featuring glassmorphism, responsive design, and smooth `framer-motion` animations.
* 🧠 **RAG Powered:** Integrates advanced Retrieval-Augmented Generation (Langchain & TF-IDF) with the Gemini 1.5 Flash model for accurate, context-aware advice.
* 🎥 **Virtual Presence:** Features a webcam feed block and a stylized Avatar interface to simulate a real telemedicine call.

---

## 🛠️ Technology Stack

**Frontend:**
- **React.js (Vite)** for lightning-fast UI rendering.
- **Tailwind CSS** for modern, responsive, and sexy styling.
- **Framer Motion** for buttery-smooth micro-animations.
- **React Markdown** for rich text formatting and bullet points.

**Backend:**
- **Python (Flask)** serving as a robust API layer.
- **LangChain** for chaining prompts and managing chat history.
- **Google Gemini API** (`gemini-1.5-flash-latest`) for state-of-the-art LLM reasoning.
- **TF-IDF & FAISS** for custom Knowledge Base retrieval (RAG).

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/)
* [Python 3.8+](https://www.python.org/)
* A [Google Gemini API Key](https://aistudio.google.com/)

### 2. Backend Setup
Navigate into the backend directory, install the required dependencies, and configure your environment.

```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder and add your Gemini API Key:
```env
GEMINI_API_KEY=your_api_key_here
```

Start the Flask server:
```bash
python app.py
```
*(The backend will typically run on http://127.0.0.1:5000)*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, install packages, and spin up the development server.

```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```
*(The frontend will typically run on http://localhost:5173)*

---

## 💡 Usage

1. **Launch the App:** Open the frontend URL in your browser.
2. **Consultation:** Introduce yourself! The AI will automatically ask for your Name, Age, and Gender before proceeding with diagnostic questions (one at a time).
3. **Medical Report:** Once the diagnosis is complete, click the **Generate Report** button to view a beautifully formatted, structured Markdown report of your session.

---

## ⚠️ Disclaimer

**Dr. AI Avatar is a technology demonstration and is NOT a substitute for professional medical advice, diagnosis, or treatment.** Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

---

<div align="center">
  <b>Built with ❤️ by Yash Sharma</b>
</div>
