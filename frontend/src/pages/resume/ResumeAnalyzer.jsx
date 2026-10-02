import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Upload, FileText, CheckCircle, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

export const ResumeAnalyzer = () => {
  const [resumeData, setResumeData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    api.getResumeData()
      .then(data => {
        if (data && data.uploaded) {
          setResumeData(data);
        }
      })
      .catch(err => console.error('Failed to load resume details:', err));
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0]);
    }
  };

  const simulateUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(15);
    setUploadStage('Uploading resume to secure server...');

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          return 90;
        }
        
        const next = prev + 10;
        if (next > 70) setUploadStage('Evaluating job keywords and formatting tradeoffs...');
        else if (next > 40) setUploadStage('Parsing text and extracting candidate skills...');
        
        return next;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', ''); 

      const res = await api.uploadResume(formData);
      clearInterval(interval);
      setUploadProgress(100);
      setResumeData(res.resumeData);
    } catch (err) {
      clearInterval(interval);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setResumeData(null);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          AI Resume ATS Analyzer
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Test your resume layout and keywords against automated applicant trackers (ATS). See score breakdowns, missing skills suggestions, and formatting reports.
        </p>
      </div>

      {isUploading && (
        <Card className="flex flex-col items-center justify-center p-12 text-center space-y-6 animate-pulse">
          <RefreshCw size={40} className="text-purple-600 animate-spin" />
          <div className="space-y-2 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{uploadStage}</h3>
            <div className="h-2 w-full bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="text-xs text-slate-400 font-mono font-medium">{uploadProgress}% complete</span>
          </div>
        </Card>
      )}

      {!isUploading && !resumeData && (
        <form
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className="w-full"
        >
          <input
            type="file"
            id="file-upload"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 min-h-[300px] ${
              dragActive
                ? 'border-purple-500 bg-purple-50/20 dark:border-purple-400 dark:bg-purple-950/10'
                : 'border-slate-300 bg-white hover:bg-slate-50/50 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900'
            }`}
          >
            <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-405 flex items-center justify-center mb-4 shadow-inner">
              <Upload size={28} />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">
              Drag & Drop your Resume PDF
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
              Upload PDF format only (Max 5MB). Layout must be clean and parseable.
            </p>
            
            <Button variant="outline" className="pointer-events-none">
              Choose File
            </Button>
          </label>
        </form>
      )}

      {!isUploading && resumeData && (
        <div className="space-y-8 animate-fade-in">
          
          {/* File details banner */}
          <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 rounded-lg flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{resumeData.fileName}</h4>
                <p className="text-xs text-slate-400">PDF Document • 1.2 MB</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} icon={<RefreshCw size={12} />}>
              Re-upload New
            </Button>
          </Card>

          {/* Core Score breakdowns */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* ATS Score Gauge */}
            <Card className="flex flex-col items-center justify-center text-center p-8 bg-purple-50/20 border-purple-200/50 dark:border-purple-900/30 dark:bg-purple-950/10">
              <Sparkles size={36} className="text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Overall ATS Match
              </h3>
              
              {/* Score circle */}
              <div className="relative flex items-center justify-center my-6 h-36 w-36">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={376.8}
                    strokeDashoffset={376.8 - (376.8 * resumeData.atsScore) / 100}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white">
                    {resumeData.atsScore}
                  </h1>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Score</span>
                </div>
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                Placement probability: High
              </span>
            </Card>

            {/* Metrics Breakdowns */}
            <Card className="md:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b pb-2 mb-2 dark:border-slate-800">
                Category Score Analysis
              </h3>
              
              {[
                { label: 'Skills Match', value: resumeData.skills, color: 'bg-purple-600' },
                { label: 'Experience Depth', value: resumeData.experience, color: 'bg-blue-600' },
                { label: 'Project Impact', value: resumeData.projects, color: 'bg-emerald-500' },
                { label: 'Keyword Density', value: resumeData.keywords, color: 'bg-orange-500' },
                { label: 'Layout & Formatting', value: resumeData.formatting, color: 'bg-indigo-500' }
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 dark:text-slate-350">{metric.label}</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono">{metric.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${metric.color} transition-all duration-500`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </Card>

          </div>

          {/* Feedback breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Missing Skills */}
            <Card className="border-l-4 border-l-red-500">
              <h3 className="text-base font-bold text-red-700 dark:text-red-450 mb-3 flex items-center gap-1.5">
                <AlertTriangle size={18} />
                Missing Job Keywords
              </h3>
              <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">
                Automated ATS tests suggest adding these technologies to match top roles:
              </p>
              <div className="flex flex-wrap gap-2">
                {resumeData.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </Card>

            {/* Suggestions list */}
            <Card className="border-l-4 border-l-purple-600">
              <h3 className="text-base font-bold text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-1.5">
                <CheckCircle size={18} />
                Improvement Recommendations
              </h3>
              <ul className="space-y-3 text-xs text-slate-650 dark:text-slate-350">
                {resumeData.suggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </Card>

          </div>

        </div>
      )}

    </div>
  );
};

export default ResumeAnalyzer;
