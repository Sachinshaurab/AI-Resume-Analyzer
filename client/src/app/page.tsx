"use client";

import { useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from
"react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import jsPDF from "jspdf"; 

type Analysis = {
  ats_score: number;
  skills: string[];
  sections: string[];
  word_count: number;
  suggestions: string[];
};

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [aiAnalysis, setAiAnalysis]=useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobDescription, setJobDescription] = useState("");
const [jobMatch, setJobMatch] = useState<{
  job_match_score: number;
  required_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
} | null>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setAnalysis(null);
      setError("");
    }
  };

  const analyzeResume = async () => {
    if (!selectedFile) {
      alert("Please upload your resume first");
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "https://ai-resume-analyzer-eapw.onrender.com/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Resume analysis failed");
        return;
      }

      setAnalysis(data.analysis);
      setAiAnalysis(data.ai_analysis);
    } catch (error) {
      console.error(error);
      setError("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  const matchJobDescription = async () => {
  if (!selectedFile) {
    alert("Please upload your resume first");
    return;
  }

  if (!jobDescription.trim()) {
    alert("Please enter a job description");
    return;
  }

  const formData = new FormData();

  formData.append("file", selectedFile);
  formData.append("job_description", jobDescription);

  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      "https://ai-resume-analyzer-eapw.onrender.com/match-job",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      setError(data.error || "Job matching failed");
      return;
    }

    setJobMatch(data);
  } catch (error) {
    console.error(error);
    setError("Backend connection failed");
  } finally {
    setLoading(false);
  }
};
const downloadPDF = () => {
  if (!analysis) return;

  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Resume Analysis Report", 20, 20);

  doc.setFontSize(14);
  doc.text(`ATS Score: ${analysis.ats_score}/100`, 20, 40);
  doc.text(`Word Count: ${analysis.word_count}`, 20, 50);

  doc.text("Skills:", 20, 70);
  analysis.skills.forEach((skill, index) => {
    doc.text(`• ${skill}`, 25, 80 + index * 8);
  });

  const y = 90 + analysis.skills.length * 8;

  doc.text("Suggestions:", 20, y);
  analysis.suggestions.forEach((item, index) => {
    doc.text(`• ${item}`, 25, y + 10 + index * 8);
  });

  doc.save("Resume_Analysis_Report.pdf");
};

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-10 py-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">
          Resume
          <span className="text-blue-500">AI</span>
        </h1>

        <button
          onClick={analyzeResume}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-5 py-2 rounded-lg"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </nav>

      <section className="flex flex-col items-center text-center px-6 py-20">
        <h2 className="text-5xl font-bold max-w-3xl">
          Improve Your Resume With
          <span className="text-blue-500">
            {" "}Artificial Intelligence
          </span>
        </h2>

        <p className="text-gray-400 mt-6 text-lg max-w-2xl">
          Upload your resume and get ATS score, skill analysis,
          and personalized suggestions.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={openFilePicker}
          className="mt-8 bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold"
        >
          Upload Resume
        </button>

        {selectedFile && (
          <div className="mt-6 border border-blue-500 rounded-lg px-8 py-4">
            <p className="text-gray-400">Selected Resume</p>

            <p className="font-bold mt-1">
              {selectedFile.name}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 bg-red-950 border border-red-700 rounded-xl p-5 text-red-300">
            {error}
          </div>
        )}
{analysis && (
  <div className="mt-12 max-w-5xl w-full text-left">
    <h3 className="text-3xl font-bold text-center mb-6">
      Job Description Match
    </h3>

    <textarea
      value={jobDescription}
      onChange={(e) => setJobDescription(e.target.value)}
      placeholder="Paste the job description here..."
      className="w-full min-h-48 bg-gray-900 border border-gray-700 rounded-xl p-5 text-white outline-none focus:border-blue-500"
    />

    <button
      onClick={matchJobDescription}
      className="mt-4 bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold"
    >
      Match Job Description
    </button>

    {jobMatch && (
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h4 className="text-2xl font-bold text-blue-500">
          Job Match Score
        </h4>

        <p className="text-5xl font-bold mt-4">
          {jobMatch.job_match_score}
          <span className="text-xl text-gray-400">/100</span>
        </p>

        <div className="mt-6">
          <h4 className="text-xl font-bold">Matched Skills</h4>

          <div className="flex flex-wrap gap-2 mt-3">
            {jobMatch.matched_skills.map((skill) => (
              <span
                key={skill}
                className="border border-green-500 px-3 py-1 rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-xl font-bold">Missing Skills</h4>

          <div className="flex flex-wrap gap-2 mt-3">
            {jobMatch.missing_skills.map((skill) => (
              <span
                key={skill}
                className="border border-red-500 px-3 py-1 rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-6">
  <h4 className="text-xl font-bold text-blue-400 mb-3">
    Job Match Suggestions
  </h4>

  <ul className="space-y-2">
    {jobMatch.suggestions?.map(
      (suggestion: string, index: number) => (
        <li key={index} className="text-gray-300">
          • {suggestion}
        </li>
      )
    )}
  </ul>
</div>
      </div>
    )}
  </div>
)}
{aiAnalysis && (
  <div className="mt-12 max-w-5xl w-full text-left">
    <h3 className="text-3xl font-bold text-center mb-8">
      AI Resume Analysis
    </h3>

    <div className="bg-gray-900 border border-blue-500 rounded-xl p-6 shadow-lg">
      <h4 className="text-xl font-bold text-cyan-400 mb-4">
        Groq AI Analysis
      </h4>

      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
        {aiAnalysis}
      </div>
    </div>
  </div>
)}
        {analysis && (
          <div className="mt-12 max-w-5xl w-full text-left">
            <h3 className="text-3xl font-bold text-center mb-8">
              Resume Analysis
            </h3>
            <button
  onClick={downloadPDF}
  className="mb-6 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold"
>
  Download PDF
</button>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h4 className="text-xl font-bold text-blue-500">
                  ATS Score
                </h4>

                <p className="text-5xl font-bold mt-4">
                  {analysis.ats_score}
                  <span className="text-xl text-gray-400">
                    /100
                  </span>
                </p>
                <div className="w-40 h-40 mx-auto mt-6">
                  <CircularProgressbar
                  value={analysis.ats_score}
                  text={`${analysis.ats_score}%`}
                  styles={buildStyles({
                    textColor:"#ffffff",
                    pathColor:"#3b82f6",
                    trailColor:"#374151",
                    textSize:"16px",
                  })}
                />
              </div>
              <p className="text-center text-gray-400 mt-4">
              ATS Resume Score
              </p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h4 className="text-xl font-bold text-blue-500">
                  Resume Stats
                </h4>

                <p className="mt-4 text-gray-300">
                  Word Count
                </p>

                <p className="text-4xl font-bold mt-2">
                  {analysis.word_count}
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h4 className="text-xl font-bold text-blue-500">
                  Detected Skills
                </h4>

                <div className="flex flex-wrap gap-3 mt-5">
                  {analysis.skills.length > 0 ? (
                    analysis.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-blue-950 border border-blue-700 px-3 py-2 rounded-lg text-blue-300"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400">
                      No skills detected
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h4 className="text-xl font-bold text-blue-500">
                  Resume Sections
                </h4>

                <div className="mt-5 space-y-3">
                  {analysis.sections.map((section) => (
                    <p
                      key={section}
                      className="text-gray-300 capitalize"
                    >
                      ✓ {section}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-6">
              <h4 className="text-xl font-bold text-blue-500">
                Suggestions
              </h4>

              <ul className="mt-5 space-y-3">
                {analysis.suggestions.map(
                  (suggestion, index) => (
                    <li
                      key={index}
                      className="text-gray-300"
                    >
                      • {suggestion}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}