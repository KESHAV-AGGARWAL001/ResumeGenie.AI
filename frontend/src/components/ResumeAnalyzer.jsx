import React, { useRef, useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, Cpu } from 'lucide-react';
import { apiGet, apiPost, apiPostFile } from '../utils/api';

// --- Inline UI Components (Tailwind) ---
const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }) => (
    <div className={`p-6 pb-2 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-base font-bold flex items-center gap-2 ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const Alert = ({ children, variant, className = '' }) => (
    <div className={`p-3 rounded-lg flex items-center text-sm ${variant === 'destructive' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-800'} ${className}`}>
        {children}
    </div>
);
const Badge = ({ children, variant, className = '' }) => {
    let style = "bg-gray-100 text-gray-800 border-gray-200";
    if (variant === 'destructive') style = "bg-red-100 text-red-700 border-red-200";
    if (variant === 'outline') style = "bg-transparent border border-gray-300 text-gray-600";
    if (variant === 'secondary') style = "bg-purple-100 text-purple-700 border-purple-200";
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}>{children}</span>;
}



function ScoreRing({ score, label, color }) {
    const r = 38;
    const circ = 2 * Math.PI * r;
    const filled = (score / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-1">
            <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200" />
                <circle
                    cx="48" cy="48" r={r} fill="none"
                    stroke={color} strokeWidth="8"
                    strokeDasharray={`${filled} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 48 48)"
                    className="transition-all duration-1000"
                />
                <text x="48" y="53" textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>{score}</text>
            </svg>
            <span className="text-xs font-medium text-gray-600">{label}</span>
        </div>
    );
}

export default function ResumeAnalyzer() {
    const [resumeFile, setResumeFile] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [jobDescContent, setJobDescContent] = useState('');

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState(null);

    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    const [analysisStarted, setAnalysisStarted] = useState(false);
    const [activeTab, setActiveTab] = useState('summary');

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const handleResumeUpload = async (file) => {
        setUploadError(null);
        setExtractError(null);
        setExtractedText('');
        setResumeFile(null);
        setAiResult(null);
        setAiError(null);
        setAnalysisStarted(false);

        if (!file) return;
        if (file.type !== 'application/pdf') {
            setUploadError('Please select a PDF file only.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setUploadError('File size must be 2MB or less.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await apiPostFile('/upload', formData);
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error || 'Failed to upload file');
            }
            const data = await res.json();
            setResumeFile(file);
            setIsUploading(false);

            // Extract text
            setIsExtracting(true);
            const filename = data.url.split('/').pop();
            const extractRes = await apiGet(`/upload/extract?filename=${encodeURIComponent(filename)}`);
            if (!extractRes.ok) {
                const ed = await extractRes.json().catch(() => ({}));
                throw new Error(ed.error || 'Failed to extract PDF text');
            }
            const extractData = await extractRes.json();
            setExtractedText(extractData.text || '');
        } catch (err) {
            setUploadError(err.message || 'Failed to upload file');
            setResumeFile(null);
            setExtractedText('');
        } finally {
            setIsUploading(false);
            setIsExtracting(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] || null;
        handleResumeUpload(file);
    };

    const handleAnalyze = async () => {
        if (!extractedText.trim()) return;
        setAiLoading(true);
        setAiError(null);
        setAiResult(null);
        setAnalysisStarted(true);
        setActiveTab('summary');

        try {
            const res = await apiPost('/ai/analyze', {
                resumeText: extractedText,
                jobDescription: jobDescContent || '',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'AI analysis failed');
            setAiResult(data);
        } catch (err) {
            setAiError(err.message || 'AI analysis failed');
        } finally {
            setAiLoading(false);
        }
    };

    const readyToAnalyze = Boolean(extractedText.trim()) && !isUploading && !isExtracting;

    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* Hero */}
            <div className="w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-900 py-6 px-4 text-center border-b border-gray-200">
                <h2 className="text-2xl font-black text-slate-900 dark:text-gray-100 flex items-center justify-center gap-2">
                    <FileText className="text-purple-600" /> Resume PDF Analyzer
                </h2>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-2">
                    Upload your PDF, paste a job description, and get instant AI-powered analysis.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
                {/* LEFT */}
                <div className="flex-1 flex flex-col gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-purple-600"><Upload className="w-4 h-4" /> Upload Resume (PDF, max 2MB)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={e => handleResumeUpload(e.target.files?.[0] || null)}
                                disabled={isUploading || isExtracting}
                            />
                            <div
                                ref={dropZoneRef}
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${resumeFile
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-slate-300 hover:border-purple-400 bg-slate-50'
                                    }`}
                            >
                                {isUploading || isExtracting ? (
                                    <div className="flex flex-col items-center gap-2 text-purple-600 animate-pulse">
                                        <Upload className="w-8 h-8" />
                                        <span className="text-sm font-medium">{isUploading ? 'Uploading...' : 'Extracting text from PDF...'}</span>
                                    </div>
                                ) : resumeFile ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                        <span className="font-semibold text-green-700 text-sm">{resumeFile.name}</span>
                                        <span className="text-xs text-gray-500">
                                            {extractedText ? `✓ Text extracted — ${extractedText.split(/\s+/).length} words` : 'Processing...'}
                                        </span>
                                        <button
                                            className="mt-1 text-xs text-red-500 hover:underline"
                                            onClick={e => {
                                                e.stopPropagation();
                                                setResumeFile(null);
                                                setExtractedText('');
                                                setAiResult(null);
                                                setAnalysisStarted(false);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        <FileText className="w-10 h-10 opacity-40" />
                                        <span className="text-sm font-medium">Drag & drop your PDF here, or <span className="text-purple-500 underline">click to browse</span></span>
                                    </div>
                                )}
                            </div>
                            {uploadError && <Alert variant="destructive" className="mt-2"><AlertCircle className="w-4 h-4 mr-1" />{uploadError}</Alert>}
                            {extractError && <Alert variant="destructive" className="mt-2"><AlertCircle className="w-4 h-4 mr-1" />{extractError}</Alert>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-purple-600"><FileText className="w-4 h-4" /> Job Description (Optional)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                value={jobDescContent}
                                onChange={e => setJobDescContent(e.target.value)}
                                placeholder="Paste the job description here..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </CardContent>
                    </Card>

                    <button
                        onClick={handleAnalyze}
                        disabled={!readyToAnalyze || aiLoading}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {aiLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><Cpu className="w-5 h-5" /> {analysisStarted ? 'Re-Analyze' : 'Analyze Resume'}</>
                        )}
                    </button>
                </div>

                {/* RIGHT */}
                <div className="flex-1 flex flex-col gap-4">
                    {!analysisStarted && !aiLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center bg-white text-gray-400">
                            <Cpu className="w-16 h-16 mb-4 opacity-50" />
                            <p>Upload your resume and click analyze to see AI-powered insights.</p>
                        </div>
                    )}
                    {aiLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center border border-gray-200 rounded-2xl p-12 text-center bg-white animate-pulse text-purple-600">
                            <Cpu className="w-16 h-16 mb-4" />
                            <p className="font-medium">AI is analyzing your resume...</p>
                        </div>
                    )}
                    {aiError && !aiLoading && (
                        <Alert variant="destructive"><AlertCircle className="w-5 h-5 mr-2" />{aiError}</Alert>
                    )}

                    {aiResult && !aiLoading && (
                        <Card className="flex-1 flex flex-col h-full bg-white">
                            <CardHeader className="border-b border-gray-100 pb-4">
                                <CardTitle className="text-purple-600"><Cpu className="w-5 h-5" /> Analysis Results</CardTitle>
                                <div className="flex flex-wrap justify-center gap-6 mt-4">
                                    <ScoreRing score={aiResult.overall_score} label="Overall Score" color="#9333ea" />
                                    {aiResult.similarity_score !== null && (
                                        <ScoreRing score={aiResult.similarity_score} label="JD Match %" color="#0ea5e9" />
                                    )}
                                    <ScoreRing score={aiResult.predicted_score_after_fixes} label="After Fixes" color="#10b981" />
                                </div>
                            </CardHeader>

                            {/* Tabs Navigation */}
                            <div className="flex gap-2 p-4 bg-slate-50 border-b border-gray-100 overflow-x-auto">
                                {['summary', 'scores', 'issues', 'bullets'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {tab}
                                        {tab === 'issues' && aiResult.issues?.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">{aiResult.issues.length}</span>}
                                    </button>
                                ))}
                            </div>

                            <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {activeTab === 'summary' && (
                                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{aiResult.summary_comment}</p>
                                )}

                                {activeTab === 'scores' && (
                                    <div className="space-y-4">
                                        {Object.entries(aiResult.score_breakdown).map(([k, v]) => (
                                            <div key={k}>
                                                <div className="flex justify-between text-xs font-bold mb-1 text-slate-700">
                                                    <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                                                    <span>{v}/20</span>
                                                </div>
                                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500" style={{ width: `${(v / 20) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'issues' && (
                                    <div className="space-y-4">
                                        {!aiResult.issues?.length ? (
                                            <p className="text-green-600 text-sm">No major issues found!</p>
                                        ) : aiResult.issues.map((iss, i) => (
                                            <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-xl">
                                                <div className="flex gap-2 mb-2">
                                                    <Badge variant="outline">{iss.section}</Badge>
                                                    <Badge variant="destructive">{iss.type}</Badge>
                                                </div>
                                                <p className="text-xs text-red-800 font-bold mb-1">{iss.detail}</p>
                                                <p className="text-xs text-green-700 bg-green-50 p-2 rounded-lg mt-2">💡 {iss.suggested_fix}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'bullets' && (
                                    <div className="space-y-4">
                                        {!aiResult.rewritten_bullets?.length ? (
                                            <p className="text-slate-500 text-sm">No improvements needed.</p>
                                        ) : aiResult.rewritten_bullets.map((b, i) => (
                                            <div key={i} className="p-3 border border-slate-200 rounded-xl space-y-2 bg-slate-50">
                                                <div className="text-xs">
                                                    <span className="font-black text-slate-500 block">Original</span>
                                                    <span className="text-slate-600">"{b.original}"</span>
                                                </div>
                                                <div className="text-xs bg-purple-50 p-2 rounded-lg border border-purple-100">
                                                    <span className="font-black text-purple-700 block gap-1 flex items-center"><Cpu className="w-3 h-3" /> Improved</span>
                                                    <span className="text-purple-900 font-medium">{b.improved}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
