# AI-Resume-Analyzer

An AI-powered Resume Analyzer that evaluates resumes, provides an ATS score, analyzes job descriptions, and suggests improvements to help users create stronger resumes.

## Features

- Upload resume in PDF format
- AI-powered resume analysis
- ATS score generation
- Job description matching
- Personalized improvement suggestions
- Clean and responsive user interface

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- FastAPI
- Python

### AI
- Google Gemini API

## Project Structure

```
ResumeAI/
├── client/
├── server/
└── README.md
```

## Installation

### Clone the repository

```bash
git clone https://github.com/Sachinshaurab/AI-Resume-Analyzer.git
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Future Improvements

- User Authentication
- Resume History
- Multiple Resume Comparison
- Download AI Report
- More ATS Metrics

## Author

**Sachin Kumar**

GitHub:
https://github.com/Sachinshaurab

---

⭐ If you found this project useful, consider giving it a star.
