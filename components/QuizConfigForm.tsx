import React, { useState, useEffect } from 'react';
import { Difficulty, QuizConfig, PostType, Language } from '../types';
import { POSTS, LANGUAGES, SUBJECTS_BY_POST, SYLLABUS_TOPICS, DIFFICULTIES } from '../constants';
import { BrainCircuit, Loader2, Sparkles, AlertCircle, Languages, BookOpen, History, Clock, FileText, Layout, Layers } from 'lucide-react';

interface Props {
  onStartQuiz: (config: QuizConfig) => void;
  isLoading: boolean;
  error?: string;
}

const STORAGE_KEY = 'ap_dsc_quiz_config_v2'; // Version bumped for new schema

const QuizConfigForm: React.FC<Props> = ({ onStartQuiz, isLoading, error }) => {
  // Helper to load from storage
  const loadSavedConfig = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };

  const savedConfig = loadSavedConfig();

  // Lazy initialization of state
  const [mode, setMode] = useState<'practice' | 'exam'>(() => savedConfig?.mode || 'practice');
  const [post, setPost] = useState<PostType>(() => savedConfig?.post || PostType.SGT);
  const [language, setLanguage] = useState<Language>(() => savedConfig?.language || Language.English);
  
  const [subject, setSubject] = useState<string>(() => {
    // If exam mode and SGT, subject isn't really used by user but we need a default
    const validSubjects = SUBJECTS_BY_POST[savedConfig?.post || PostType.SGT] || [];
    if (savedConfig?.subject && validSubjects.includes(savedConfig.subject)) {
        return savedConfig.subject;
    }
    return validSubjects[0];
  });

  const [difficulty, setDifficulty] = useState<Difficulty>(() => savedConfig?.difficulty || Difficulty.Medium);
  const [topic, setTopic] = useState<string>(() => savedConfig?.topic || '');
  const [questionCount, setQuestionCount] = useState<number>(() => savedConfig?.questionCount || 10);
  const [isPYQ, setIsPYQ] = useState<boolean>(() => savedConfig?.isPYQ || false);
  const [timeLimit, setTimeLimit] = useState<number>(() => savedConfig?.timeLimit || 15);

  // Update subject list when Post changes (User Action)
  useEffect(() => {
    const availableSubjects = SUBJECTS_BY_POST[post];
    if (!availableSubjects.includes(subject)) {
        setSubject(availableSubjects[0]);
        setTopic('');
    }
  }, [post, subject]);

  const handleSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
  };

  const handleQuickSubjectSelect = (shortCode: string) => {
      // Force practice mode for quick select
      setMode('practice');
      
      const availableSubjects = SUBJECTS_BY_POST[post];
      let match = "";
      
      switch(shortCode) {
          case 'GK':
              match = availableSubjects.find(s => s.includes("General Knowledge")) || "";
              break;
          case 'PIE':
              match = availableSubjects.find(s => s.includes("Perspectives")) || "";
              break;
          case 'Psy':
              match = availableSubjects.find(s => s.includes("Psychology")) || "";
              break;
          case 'Con':
               match = availableSubjects.find(s => 
                   !s.includes("General Knowledge") && 
                   !s.includes("Perspectives") && 
                   !s.includes("Psychology")
               ) || "";
              break;
      }

      if (match) {
          setSubject(match);
          setTopic('');
      } else {
          alert(`This subject category might not be available for ${post}`);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to local storage
    const configToSave = { mode, post, language, subject, difficulty, topic, questionCount, isPYQ, timeLimit };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));

    onStartQuiz(configToSave);
  };

  // Logic to filter subjects based on mode
  const getDisplaySubjects = () => {
      if (mode === 'exam') {
          // In exam mode for SA/TGT/PGT, we only want the 'Stream' (Methodology/Content subject), not GK/Perspectives
          // For SGT, it's a fixed general paper, so maybe no dropdown needed, or just "General"
          if (post === PostType.SGT) return [];
          
          return SUBJECTS_BY_POST[post].filter(s => 
              !s.includes("General Knowledge") && 
              !s.includes("Perspectives") && 
              !s.includes("Educational Psychology") &&
              !s.includes("School Administration") // Principal
          );
      }
      return SUBJECTS_BY_POST[post];
  };

  const displaySubjects = getDisplaySubjects();
  const showSubjectDropdown = displaySubjects.length > 0;

  // Get suggestions based on selected subject (fuzzy match or direct map)
  const getSuggestions = () => {
    if (SYLLABUS_TOPICS[subject]) return SYLLABUS_TOPICS[subject];
    const keys = Object.keys(SYLLABUS_TOPICS);
    const foundKey = keys.find(k => subject.includes(k));
    return foundKey ? SYLLABUS_TOPICS[foundKey] : [];
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <h2 className="text-2xl font-bold relative z-10">Configure AP DSC Practice</h2>
          <p className="text-indigo-100 mt-2 relative z-10">Tailored to the 2024 Syllabus & Teaching Posts</p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex border-b border-slate-200">
            <button
                type="button"
                onClick={() => setMode('practice')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${mode === 'practice' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
                <BookOpen size={18} /> Subject Practice
            </button>
            <button
                type="button"
                onClick={() => setMode('exam')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${mode === 'exam' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
                <FileText size={18} /> Full Mock Pattern
            </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Post Selection */}
            <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Teaching Post</label>
            <select
                value={post}
                onChange={(e) => setPost(e.target.value as PostType)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 bg-slate-50 hover:bg-white"
            >
                {POSTS.map((p) => (
                <option key={p} value={p}>{p}</option>
                ))}
            </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Languages size={16} /> Medium / Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 bg-slate-50 hover:bg-white"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
                <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        difficulty === d
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject Selection - Conditional based on Mode */}
            {showSubjectDropdown && (
                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    {mode === 'exam' ? <Layers size={16} /> : <BookOpen size={16} />} 
                    {mode === 'exam' ? 'Select Stream / Content Subject' : 'Select Subject'}
                </label>
                <select
                    value={subject}
                    onChange={(e) => {
                    setSubject(e.target.value);
                    setTopic('');
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 bg-slate-50 hover:bg-white"
                >
                    {displaySubjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                </div>
            )}

            {/* Exam Mode Info Box */}
            {mode === 'exam' && post === PostType.SGT && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-sm flex items-start gap-3">
                    <Layout className="shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="font-semibold">Full SGT Exam Pattern</p>
                        <p className="opacity-80 mt-1">Includes GK, Perspectives, Psychology, Language I & II, Maths, Science, and Social Studies weighted according to syllabus.</p>
                    </div>
                </div>
            )}

            {/* Topic Input (Only in Practice Mode) */}
            {mode === 'practice' && (
                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Specific Topic <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Harappan Civilization, Child Development, Grammar..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                />
                
                <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                    {getSuggestions().length > 0 && getSuggestions().map((sug) => (
                        <button
                            key={sug}
                            type="button"
                            onClick={() => handleSuggestionClick(sug)}
                            className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-md transition-colors border border-slate-200"
                        >
                            {sug}
                        </button>
                    ))}
                    </div>
                </div>
                </div>
            )}

            {/* PYQ Toggle */}
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl cursor-pointer" onClick={() => setIsPYQ(!isPYQ)}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isPYQ ? 'bg-amber-500 text-white' : 'bg-amber-200 text-amber-700'}`}>
                  <History size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Previous Year Questions</p>
                  <p className="text-xs text-slate-500">Prioritize authentic questions from past exams</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isPYQ ? 'bg-amber-500' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isPYQ ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Question Count / Exam Size */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                    {mode === 'exam' ? 'Mock Test Size' : 'Number of Questions'}
                </label>
                <div className="flex flex-wrap gap-2">
                    {mode === 'practice' ? (
                        [5, 10, 15, 20].map((count) => (
                            <button
                            key={count}
                            type="button"
                            onClick={() => setQuestionCount(count)}
                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                                questionCount === count
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                            }`}
                            >
                            {count}
                            </button>
                        ))
                    ) : (
                        // Exam Mode Counts (Mini vs Standard)
                        [20, 40, 60].map((count) => (
                            <button
                            key={count}
                            type="button"
                            onClick={() => {
                                setQuestionCount(count);
                                setTimeLimit(count === 20 ? 30 : count === 40 ? 60 : 90);
                            }}
                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                                questionCount === count
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                            }`}
                            >
                            {count === 20 ? 'Mini (20)' : count === 40 ? 'Std (40)' : 'Long (60)'}
                            </button>
                        ))
                    )}
                </div>
              </div>

              {/* Time Limit */}
              <div className="space-y-2">
                 <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1"><Clock size={14}/> Time Limit (Minutes)</label>
                 <input 
                    type="number" 
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-slate-800"
                    min={5}
                    max={180}
                 />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Generating Exam...
                </>
              ) : (
                <>
                  <BrainCircuit /> {mode === 'exam' ? 'Start Mock Test' : 'Start Practice'}
                </>
              )}
            </button>
            
            {!isLoading && mode === 'practice' && (
               <div className="mt-8 border-t border-slate-100 pt-6">
                 <p className="text-center text-xs text-slate-400 font-semibold uppercase tracking-wider mb-4">Quick Select Subject</p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button type="button" onClick={() => handleQuickSubjectSelect('GK')} className="p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-100 rounded-lg text-center transition-all">
                        <div className="text-lg font-bold text-indigo-600">GK</div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">General Knowledge</div>
                    </button>
                    <button type="button" onClick={() => handleQuickSubjectSelect('PIE')} className="p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-100 rounded-lg text-center transition-all">
                        <div className="text-lg font-bold text-indigo-600">PIE</div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Perspectives</div>
                    </button>
                    <button type="button" onClick={() => handleQuickSubjectSelect('Psy')} className="p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-100 rounded-lg text-center transition-all">
                        <div className="text-lg font-bold text-indigo-600">Psy</div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Psychology</div>
                    </button>
                    <button type="button" onClick={() => handleQuickSubjectSelect('Con')} className="p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-100 rounded-lg text-center transition-all">
                        <div className="text-lg font-bold text-indigo-600">Con</div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Content</div>
                    </button>
                 </div>
               </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizConfigForm;