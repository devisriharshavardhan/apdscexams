import React, { useState } from 'react';
import { RefreshCcw, Trophy, Award, Target, Home, ChevronDown, ChevronUp, BookOpen, Lightbulb } from 'lucide-react';
import { Question } from '../types';

interface Props {
  score: number;
  total: number;
  onReset: () => void;
  questions: Question[];
  answers: Record<string, number>;
}

const QuizResults: React.FC<Props> = ({ score, total, onReset, questions, answers }) => {
  const percentage = Math.round((score / total) * 100);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  let message = "Keep Practicing!";
  let ColorIcon = Target;
  let colorClass = "text-orange-500 bg-orange-100";

  if (percentage >= 90) {
    message = "Outstanding! DSC Ready!";
    ColorIcon = Trophy;
    colorClass = "text-yellow-500 bg-yellow-100";
  } else if (percentage >= 70) {
    message = "Great Job!";
    ColorIcon = Award;
    colorClass = "text-indigo-500 bg-indigo-100";
  }

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in zoom-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
        <div className="bg-slate-900 p-10 text-center text-white relative overflow-hidden">
             {/* Decorative Background Circles */}
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600 rounded-full opacity-20 blur-2xl"></div>
             <div className="absolute top-20 right-10 w-32 h-32 bg-purple-600 rounded-full opacity-20 blur-2xl"></div>

            <div className={`inline-flex items-center justify-center p-4 rounded-full mb-6 ${colorClass} shadow-lg ring-4 ring-white/10`}>
              <ColorIcon size={48} />
            </div>
            
            <h2 className="text-4xl font-bold mb-2">{score} / {total}</h2>
            <p className="text-slate-300 font-medium text-lg uppercase tracking-wider">{message}</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
             <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wide">Accuracy</span>
                <span className="block text-2xl font-bold text-slate-800 mt-1">{percentage}%</span>
             </div>
             <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wide">Correct</span>
                <span className="block text-2xl font-bold text-green-600 mt-1">{score}</span>
             </div>
             <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wide">Incorrect</span>
                <span className="block text-2xl font-bold text-red-500 mt-1">{total - score}</span>
             </div>
          </div>

          <div className="flex gap-4 justify-center">
             <button
              onClick={onReset}
              className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2"
            >
              <Home size={20} /> Home
            </button>
            <button
              onClick={onReset}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center gap-2"
            >
              <RefreshCcw size={20} /> Take Another Test
            </button>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 text-lg">Detailed Analysis</h3>
            <span className="text-xs text-slate-400 font-medium">Click on a question to see explanation</span>
        </div>
        <div className="divide-y divide-slate-100">
            {questions.map((q, idx) => {
                const isCorrect = answers[q.id] === q.correctAnswerIndex;
                const isExpanded = expandedId === q.id;
                
                return (
                    <div 
                        key={q.id} 
                        className={`transition-colors cursor-pointer ${isExpanded ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                        onClick={() => toggleExpand(q.id)}
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {idx + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-4">
                                        <p className="text-slate-800 font-medium text-lg leading-snug whitespace-pre-wrap">{q.text}</p>
                                        <div className="text-slate-400">
                                            {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                                        <div className={`p-3 rounded-lg border flex flex-col ${answers[q.id] === q.correctAnswerIndex ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                                            <span className="font-bold text-xs opacity-70 uppercase mb-1">Your Answer</span>
                                            <span className="font-semibold">{q.options[answers[q.id]] || 'Skipped'}</span>
                                        </div>
                                        <div className="p-3 rounded-lg border border-indigo-100 bg-white text-indigo-900 shadow-sm flex flex-col">
                                             <span className="font-bold text-xs opacity-70 uppercase mb-1">Correct Answer</span>
                                             <span className="font-semibold text-indigo-700">{q.options[q.correctAnswerIndex]}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="mt-6 ml-12 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="p-5 bg-white rounded-xl border border-indigo-100 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <BookOpen className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                                            <div>
                                                <h5 className="font-bold text-indigo-900 text-sm mb-1">Explanation</h5>
                                                <p className="text-slate-600 leading-relaxed text-sm">{q.explanation}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-amber-50 rounded-xl border border-amber-100">
                                        <div className="flex items-start gap-3">
                                            <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={20} />
                                            <div>
                                                <h5 className="font-bold text-amber-800 text-sm mb-1">Did you know?</h5>
                                                <p className="text-slate-600 leading-relaxed text-sm">{q.additionalInfo}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;