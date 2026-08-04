from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from io import BytesIO
import re
import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()
gemini_client=Groq(
    api_key=os.getenv("GROQ_API_KEY")
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ai-resume-analyzer-xi-indol.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"message": "ResumeAI Backend is running"}
def analyze_resume_with_gemini(resume_text: str, job_description: str):
    prompt = f"""
You are an expert ATS Resume Analyzer, Career Coach, and Recruiter.

Your job is to analyze resumes for ANY profession including:
Software Engineering, Data Science, AI, Cybersecurity,
Mechanical Engineering, Civil Engineering, Electrical Engineering,
Marketing, Sales, Finance, HR, Teacher, Doctor, Nurse,
Lawyer, Graphic Designer, UI/UX Designer, Product Manager,
Business Analyst, Accountant and every other profession.

Analyze the resume professionally.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description if job_description else "Not Provided"}

Provide your response in Markdown with the following sections:

# Overall ATS Score (/100)

# Resume Summary

# Detected Profession

# Key Strengths

# Missing Skills

# Missing Keywords

# Resume Formatting Review

# Grammar & Language Review

# Experience Review

# Projects Review

# Education Review

# Certifications Review

# ATS Optimization Suggestions

# Career Growth Suggestions

# Interview Readiness

# Final Verdict

Rules:
- If no job description is provided, analyze the resume generally.
- If a job description is provided, compare the resume with it.
- Give profession-specific suggestions.
- Never give generic advice.
- Keep the response clear and professional.
"""

    response = gemini_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content

def analyze_resume_text(text: str):
    text_lower = text.lower()

    skills_list = [
        "python",
        "java",
        "c++",
        "javascript",
        "typescript",
        "react",
        "next.js",
        "node.js",
        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "power bi",
        "tableau",
        "excel",
        "pandas",
        "numpy",
        "scikit-learn",
        "machine learning",
        "data analysis",
        "data engineering",
        "apache spark",
        "airflow",
        "git",
        "github",
        "docker",
        "aws",
        "autocad",
        "solidworks",
        "catia",
        "revit",
        "sap",
        "tally",
        "quickbooks",
        "digital marketing",
        "seo",
        "sem",
        "content writing",
        "copywriting",
        "canva",
        "figma",
        "photoshop",
        "illustrator",
        "teaching",
        "classroom management",
        "patient care",
        "clinical research",
        "pharmacology",
        "nursing",
        "accounting",
        "financial analysis",
        "excel advanced",
        "communication",
        "leadership",
        "problem solving",
        "teamwork",
        "project management",
        "agile",
        "scrum"
    ]

    detected_skills = []

    for skill in skills_list:
        if skill in text_lower:
            detected_skills.append(skill)

    important_sections = [
    "summary",
    "objective",
    "experience",
    "internship",
    "education",
    "skills",
    "projects",
    "certifications",
    "achievements",
    "languages",
    "publications",
    "research",
    "volunteer"
]
    detected_sections = []

    for section in important_sections:
        if section in text_lower:
            detected_sections.append(section)

    score = 0

    # Resume sections score
    score += len(detected_sections) * 8

    # Skills score
    score += min(len(detected_skills) * 3, 30)

    # Resume length score
    word_count = len(text.split())

    if 250 <= word_count <= 800:
        score += 15
    elif word_count >= 150:
        score += 8

    # Contact information
    email_found = bool(
        re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    )

    phone_found = bool(
        re.search(r"\+?\d[\d\s\-]{8,}\d", text)
    )

    if email_found:
        score += 5

    if phone_found:
        score += 5

    score = min(score, 100)

    suggestions = []

    if "summary" not in detected_sections:
        suggestions.append(
            "Add a professional summary section."
        )

    if "projects" not in detected_sections:
        suggestions.append(
            "Add a projects section with measurable results."
        )

    if "experience" not in detected_sections:
        suggestions.append(
            "Add relevant work or internship experience."
        )

    if len(detected_skills) < 5:
        suggestions.append(
            "Add more role-specific technical skills."
        )

    if word_count < 250:
        suggestions.append(
            "Add more detail to your resume."
        )

    if word_count > 800:
        suggestions.append(
            "Reduce resume length and keep content concise."
        )

    if not suggestions:
        suggestions.append(
            "Your resume has a strong basic ATS structure."
        )

    return {
        "ats_score": score,
        "skills": detected_skills,
        "sections": detected_sections,
        "word_count": word_count,
        "suggestions": suggestions,
    }


@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form("")
):
    if file.content_type != "application/pdf":
        return {"error": "Please upload a PDF file"}

    pdf_data = await file.read()

    reader = PdfReader(BytesIO(pdf_data))

    resume_text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            resume_text += page_text + "\n"

    analysis = analyze_resume_text(resume_text)
    job_match = match_job_description(resume_text, job_description)
    ai_analysis = analyze_resume_with_gemini(
    resume_text,
    job_description
)

    return {
        "filename": file.filename,
        "message": "Resume analyzed successfully",
        "resume_text": resume_text,
        "analysis": analysis,
        "job_match": job_match,
        "ai_analysis": ai_analysis,
    }


def match_job_description(resume_text: str, job_description: str):
    resume_text = resume_text.lower()
    job_description = job_description.lower()

    skills = [
        "python",
        "java",
        "c++",
        "javascript",
        "typescript",
        "react",
        "next.js",
        "node.js",
        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "pandas",
        "numpy",
        "power bi",
        "tableau",
        "excel",
        "data analysis",
        "data engineering",
        "machine learning",
        "apache spark",
        "airflow",
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
        "git",
        "github",
    ]

    required_skills = [
        skill for skill in skills
        if skill in job_description
    ]

    matched_skills = [
        skill for skill in required_skills
        if skill in resume_text
    ]

    missing_skills = [
        skill for skill in required_skills
        if skill not in resume_text
    ]

    if len(required_skills) > 0:
        match_score = round(
            (len(matched_skills) / len(required_skills)) * 100
        )
    else:
        match_score = 0

    job_suggestions = []

    skill_suggestions = {
        "apache spark": (
            "Build an ETL or data processing project using PySpark "
            "and mention it in your resume."
        ),
        "spark": (
            "Add hands-on experience with Apache Spark or PySpark "
            "for large-scale data processing."
        ),
        "aws": (
            "Add hands-on experience with AWS services such as "
            "S3, EC2, Lambda, or AWS Glue."
        ),
        "docker": (
            "Containerize one of your Python projects using Docker "
            "and add it to your resume."
        ),
        "airflow": (
            "Build a data pipeline using Apache Airflow and mention "
            "DAG creation and workflow scheduling."
        ),
        "sql": (
            "Add a SQL project demonstrating joins, CTEs, "
            "window functions, and query optimization."
        ),
        "postgresql": (
            "Build a project using PostgreSQL and demonstrate "
            "database design and query optimization."
        ),
        "python": (
            "Add a Python project that demonstrates automation, "
            "data processing, or backend development."
        ),
        "git": (
            "Mention Git version control experience and provide "
            "GitHub links to your projects."
        ),
    }

    for skill in missing_skills:
        suggestion = skill_suggestions.get(
            skill,
            f"Consider adding {skill.title()} skills or "
            "relevant project experience to your resume."
        )
        job_suggestions.append(suggestion)

    if match_score >= 80:
        job_suggestions.append(
            "Your resume is a strong match for this job."
        )
    elif match_score >= 60:
        job_suggestions.append(
            "Your resume is a moderate match. "
            "Add the missing skills to improve your chances."
        )
    else:
        job_suggestions.append(
            "Your resume needs more job-specific skills for this role."
        )

    return {
        "job_match_score": match_score,
        "required_skills": required_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": job_suggestions,
    }

@app.post("/match-job")
async def match_job(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Please upload a PDF file"}

    pdf_data = await file.read()

    reader = PdfReader(BytesIO(pdf_data))

    resume_text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            resume_text += page_text + "\n"

    result = match_job_description(
    resume_text,
    job_description
)

    ai_analysis = analyze_resume_with_gemini(
        resume_text,
        job_description
    )

    return {
        **result,
        "ai_analysis": ai_analysis
    }