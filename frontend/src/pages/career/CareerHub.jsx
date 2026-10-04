import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  Briefcase,
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  Building,
  MapPin,
  Clock,
  TrendingUp,
  Layers,
  ArrowRight,
  ListTodo
} from 'lucide-react';

export const CareerHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'internships' | 'resume' | 'readiness'
  const [opportunities, setOpportunities] = useState([]);
  const [roleReadiness, setRoleReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'Best Match' | 'Good Match' | 'Stretch Opportunity'

  // Resume State
  const [resumeData, setResumeData] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [todoSuccess, setTodoSuccess] = useState('');

  // Fetch opportunities
  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const type = activeTab === 'internships' ? 'internship' : activeTab === 'jobs' ? 'job' : null;
      const res = await api.getOpportunities({
        type: type || undefined,
        search: searchQuery || undefined
      });
      if (res.success) {
        setOpportunities(res.opportunities || []);
        if (res.roleReadiness) {
          setRoleReadiness(res.roleReadiness);
        }
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch resume data
  const loadResumeData = async () => {
    try {
      const res = await api.getResumeData();
      if (res.success && res.resumeData) {
        setResumeData(res.resumeData);
      }
    } catch (err) {
      console.error('Failed to load resume:', err);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [activeTab, searchQuery]);

  useEffect(() => {
    loadResumeData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('Only valid PDF resumes are accepted.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds the 10MB security limit.');
        setSelectedFile(null);
        return;
      }
      setUploadError('');
      setSelectedFile(file);
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setResumeLoading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const res = await api.uploadResume(formData);
      if (res.success && res.resumeData) {
        setResumeData(res.resumeData);
        setUploadSuccess('Resume successfully parsed and evaluated against ATS benchmarks!');
        setSelectedFile(null);
        loadOpportunities(); // re-recalibrate matches
      } else {
        setUploadError(res.message || 'Resume parsing failed.');
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Error processing resume file.');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleAddToTodo = async (title, company) => {
    try {
      await api.createTodo({
        title: `Prepare application for ${title} at ${company}`,
        category: 'Career',
        priority: 'high',
        daysOffset: 3
      });
      setTodoSuccess(`Added preparation task for ${company} to your Todo Planner!`);
      setTimeout(() => setTodoSuccess(''), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter opportunities by Category
  const filteredOpportunities = opportunities.filter((op) => {
    if (categoryFilter === 'all') return true;
    return op.category === categoryFilter;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-2">
            <Briefcase size={12} />
            Career Intelligence & Opportunities
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Resume → Jobs & Internships
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Deterministic role matching comparing your real GitHub stacks, competitive programming stats, and uploaded resume against verified industry hiring requirements.
          </p>
        </div>

        {/* Global Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'jobs'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Recommended Jobs
          </button>
          <button
            onClick={() => setActiveTab('internships')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'internships'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Internship Matches
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'resume'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Resume Intelligence
          </button>
          <button
            onClick={() => setActiveTab('readiness')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'readiness'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            SDE-1 Gap Matrix
          </button>
        </div>
      </div>

      {todoSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{todoSuccess}</span>
        </div>
      )}

      {/* TAB 1 & 2: JOBS & INTERNSHIPS VIEW */}
      {(activeTab === 'jobs' || activeTab === 'internships') && (
        <div className="space-y-4">
          
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role, company, or required skill (e.g. Amazon, React, Go)..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Category Filter Pills (Section 43) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'Best Match', 'Good Match', 'Stretch Opportunity'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {cat === 'all' ? 'All Opportunities' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"></div>
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No opportunities matched your criteria</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Try clearing filters or search queries to view all verified tech openings.</p>
              <Button onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOpportunities.map((op) => {
                const isBest = op.matchScore >= 75;
                const isGood = op.matchScore >= 55 && op.matchScore < 75;

                return (
                  <Card
                    key={op._id || op.title}
                    className="p-5 border-slate-200/80 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header: Company, Category Badge, Match % */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                            {op.company.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                {op.title}
                              </h3>
                            </div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                              {op.company} • <span className="text-slate-400">{op.experienceLevel}</span>
                            </p>
                          </div>
                        </div>

                        {/* Match Badge (Section 42 & 43) */}
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                              isBest
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                : isGood
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            }`}
                          >
                            <TrendingUp size={12} />
                            {op.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Location & Compensation */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mb-3 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {op.location}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{op.salary}</span>
                        {op.deadline && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock size={12} />
                              Apply before {op.deadline}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Skills breakdown */}
                      <div className="space-y-1.5 mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Skill Compatibility:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(op.matchedSkills || []).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80"
                            >
                              <CheckCircle2 size={10} />
                              {s}
                            </span>
                          ))}
                          {(op.missingSkills || []).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-medium dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Why Matched explanation (Section 42) */}
                      {op.whyMatched?.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 mb-4 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                          {op.whyMatched.map((reason, idx) => (
                            <p key={idx} className="flex items-start gap-1.5">
                              <span className="text-indigo-600 font-bold">•</span>
                              <span>{reason}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleAddToTodo(op.title, op.company)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors"
                      >
                        <ListTodo size={14} />
                        <span>Add to Todo</span>
                      </button>

                      <a
                        href={op.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Apply on Official Portal</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESUME INTELLIGENCE VIEW (Section 38 & 39) */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          
          {/* Upload Card */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Upload Your Technical Resume
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Accepted format: PDF (up to 10MB). Scanned securely in memory with zero public exposure.
            </p>

            <form onSubmit={handleUploadResume} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                <Upload size={32} className="mx-auto text-indigo-500 mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Click to browse PDF resume
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'Strict MIME validation enforced'}
                </p>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-800">
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                  {uploadSuccess}
                </div>
              )}

              <Button
                type="submit"
                disabled={!selectedFile || resumeLoading}
                className="w-full sm:w-auto"
              >
                {resumeLoading ? 'Extracting & Evaluating...' : 'Analyze Resume with ATS Scanner'}
              </Button>
            </form>
          </Card>

          {/* Evaluated Resume Metrics Display */}
          {resumeData?.uploaded && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 border-slate-200/80 dark:border-slate-800 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Overall ATS Score</p>
                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {resumeData.atsScore}/100
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Tier-1 Automated Clearance</p>
              </Card>

              <Card className="p-4 border-slate-200/80 dark:border-slate-800 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Technical Skills</p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {resumeData.skills}/100
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Frameworks & Languages</p>
              </Card>

              <Card className="p-4 border-slate-200/80 dark:border-slate-800 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Projects Depth</p>
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {resumeData.projects}/100
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Full Stack & Production</p>
              </Card>

              <Card className="p-4 border-slate-200/80 dark:border-slate-800 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Formatting & ATS Rules</p>
                <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {resumeData.formatting}/100
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Single-Column Standards</p>
              </Card>
            </div>
          )}

          {/* Missing Skills & Suggestions */}
          {resumeData?.uploaded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5 border-slate-200/80 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                  Identified Keyword & Skill Gaps
                </h4>
                {resumeData.missingSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {resumeData.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No critical keyword deficiencies flagged.</p>
                )}
              </Card>

              <Card className="p-5 border-slate-200/80 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                  ATS Actionable Enhancements
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {(resumeData.suggestions || [
                    'Quantify project outcomes with real telemetry (e.g. reduced load times by 35%)',
                    'Ensure GitHub repositories have clear README setup guides',
                    'Feature competitive programming rating badge under education or achievements'
                  ]).map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold shrink-0">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SDE-1 ROLE READINESS & GAP MATRIX (Section 40) */}
      {activeTab === 'readiness' && roleReadiness && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Target Role Benchmark</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {roleReadiness.targetRole}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {roleReadiness.readinessScore}%
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Readiness Index</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  Strong Competency Areas
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {roleReadiness.strongAreas.map((area, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60">
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  Growth / Gap Domains
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {roleReadiness.growthAreas.map((area, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Recommended Action Sequence
              </h4>
              <div className="space-y-2">
                {roleReadiness.recommendedActions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                    <button
                      onClick={() => handleAddToTodo(action, 'Preparation')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-1"
                    >
                      <ListTodo size={14} />
                      <span>Add Todo</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CareerHub;
