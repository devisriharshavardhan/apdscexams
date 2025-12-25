import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, ChevronRight, BarChart2, BookOpen, Lightbulb, Image as ImageIcon, Loader, Clock, AlertTriangle, XCircle as CloseIcon, History } from 'lucide-react';
import { generateIllustrativeImage } from '../services/geminiService';

interface Props {
  questions: Question[];
  timeLimit?: number; 
  language?: string;
  onFinish: (score: number, answers: Record<string, number>, images: Record<string, string>) => void;
  onCancel: () => void;
}

const QuizPlayer: React.FC<Props> = ({ questions, timeLimit, language, onFinish, onCancel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit ? timeLimit * 60 : 0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [questionImages, setQuestionImages] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;
  const timerRef = useRef<number | null>(null);

  const playTickSound = (urgency: 'low' | 'high') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const freq = urgency === 'high' ? 880 : 440; 
      const duration = 0.1;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  useEffect(() => {
    if (!timeLimit) return;
    timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
            const nextTime = prev - 1;
            if (nextTime <= 30 && nextTime > 10) playTickSound('low');
            else if (nextTime <= 10 && nextTime > 0) playTickSound('high');
            if (nextTime <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                handleFinish();
                return 0;
            }
            return nextTime;
        });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLimit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinish = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      let score = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctAnswerIndex) score++;
      });
      onFinish(score, answers, questionImages);
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: idx }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (isLastQuestion) handleFinish();
    else {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setImageUrl(questionImages[questions[currentIdx + 1].id] || null);
    }
  };

  const handleShowVisual = async () => {
    if (imageUrl) return;
    setIsImageLoading(true);
    try {
      const url = await generateIllustrativeImage(currentQuestion.visualPrompt, language);
      setImageUrl(url);
      setQuestionImages(prev => ({ ...prev, [currentQuestion.id]: url }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsImageLoading(false);
    }
  }

  const progress = ((currentIdx + (selectedOption !== null ? 1 : 0)) / questions.length) * 100;

  let timerClasses = "fixed top-20 right-4 z-20 md:absolute md:-right-32 md:top-0 transition-all duration-300 px-3 py-2 rounded-lg border shadow-sm font-mono font-bold flex items-center gap-2 ";
  if (timeLeft <= 10) timerClasses += "bg-red-600 text-white border-red-700 animate-bounce";
  else if (timeLeft <= 30) timerClasses += "bg-red-50 text-red-600 border-red-200 animate-pulse";
  else timerClasses += "bg-white text-slate-600 border-slate-200";

  return (
    <div className="max-w-3xl mx-auto w-full relative">
       <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .animate-pop { animation: pop 0.3s ease-out both; }
      `}</style>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold">Exit Exam?</h3>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to stop? Your progress in this session will be lost.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Continue</button>
              <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-md shadow-red-100">Exit Now</button>
            </div>
          </div>
        </div>
      )}

      {timeLimit && (
          <div className={timerClasses}>
              {timeLeft <= 30 ? <AlertTriangle size={18} /> : <Clock size={18} />}
              {formatTime(timeLeft)}
          </div>
      )}

      <div className="mb-6 flex items-center justify-between text-sm font-medium text-slate-600">
        <div className="flex items-center gap-4">
          <span className="bg-slate-100 px-3 py-1 rounded-md">Q {currentIdx + 1} / {questions.length}</span>
          <button 
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors px-3 py-1 bg-red-50/50 hover:bg-red-100/50 rounded-lg border border-red-100"
          >
            <CloseIcon size={16} /> <span className="hidden sm:inline">Cancel</span>
          </button>
        </div>
        <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-bold">Score: {Object.keys(answers).filter(id => {
           const q = questions.find(q => q.id === id);
           return q && answers[id] === q.correctAnswerIndex;
        }).length}</span>
      </div>
      
      <div className="w-full bg-slate-200 h-2.5 rounded-full mb-8 overflow-hidden">
         <div className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
             {currentQuestion.sourceExam && (
               <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border border-amber-200 animate-in fade-in slide-in-from-left-2">
                 <History size={12} /> {currentQuestion.sourceExam} {currentQuestion.sourceYear}
               </div>
             )}
             {currentQuestion.section && (
               <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-tight">
                 {currentQuestion.section}
               </div>
             )}
          </div>

          <div className="flex justify-between items-start gap-4 mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight whitespace-pre-wrap">
              {currentQuestion.text}
            </h3>
            <button 
              onClick={handleShowVisual}
              disabled={isImageLoading || !!imageUrl}
              className={`shrink-0 p-3 rounded-2xl transition-all border flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                imageUrl 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 active:scale-95'
              }`}
            >
              {isImageLoading ? <Loader className="animate-spin" size={20}/> : <ImageIcon size={20} />}
              Visual
            </button>
          </div>

          {imageUrl && (
            <div className="mb-8 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-inner animate-in fade-in zoom-in duration-500">
              <img src={imageUrl} alt="Visual Aid" className="w-full h-auto max-h-[300px] object-contain mx-auto" />
            </div>
          )}

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = currentQuestion.correctAnswerIndex === idx;
              const isWrong = isSelected && !isCorrect;
              const showResult = selectedOption !== null;
              
              let btnClass = "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group relative overflow-hidden ";
              if (!showResult) btnClass += "border-slate-100 bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-50 cursor-pointer active:scale-[0.98]";
              else {
                if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-900 animate-pop z-10";
                else if (isWrong) btnClass += "border-red-500 bg-red-50 text-red-900 opacity-90 animate-shake";
                else btnClass += "border-slate-100 text-slate-400 opacity-40 grayscale";
              }

              return (
                <button key={idx} onClick={() => handleOptionSelect(idx)} disabled={showResult} className={btnClass}>
                  <span className="flex items-center gap-4 relative z-10">
                    <span className={`flex items-center justify-center w-10 h-10 rounded-xl text-lg font-black border transition-colors ${
                        showResult && isCorrect ? 'bg-green-600 border-green-600 text-white shadow-md' : 
                        showResult && isWrong ? 'bg-red-600 border-red-600 text-white shadow-md' :
                        'bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white'
                    }`}>{String.fromCharCode(65 + idx)}</span>
                    <span className="font-semibold text-lg">{option}</span>
                  </span>
                  {showResult && isCorrect && <CheckCircle className="text-green-600 relative z-10" size={28} />}
                  {showResult && isWrong && <XCircle className="text-red-600 relative z-10" size={28} />}
                </button>
              );
            })}
          </div>
        </div>

        {showExplanation && (
          <div className="bg-slate-50 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 md:p-10 border-b border-slate-200">
              <div className="flex items-start gap-4">
                 <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shrink-0">
                    <BookOpen size={24} />
                 </div>
                 <div>
                   <h4 className="font-black text-indigo-900 mb-2 uppercase tracking-tight text-sm">Explanation</h4>
                   <p className="text-slate-700 leading-relaxed text-lg">{currentQuestion.explanation}</p>
                 </div>
              </div>
            </div>
            <div className="p-8 md:p-10 bg-amber-50/70">
              <div className="flex items-start gap-4">
                 <div className="p-2 bg-amber-100 rounded-lg text-amber-500 shrink-0">
                    <Lightbulb size={24} />
                 </div>
                 <div>
                   <h4 className="font-black text-amber-900 mb-2 uppercase tracking-tight text-sm">Knowledge Insight</h4>
                   <p className="text-slate-700 leading-relaxed text-lg">{currentQuestion.additionalInfo}</p>
                 </div>
              </div>
            </div>
            <div className="p-6 flex justify-end bg-white border-t border-slate-200">
              <button onClick={handleNext} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center gap-3 active:scale-95">
                {isLastQuestion ? <>VIEW RESULTS <BarChart2 size={20} /></> : <>CONTINUE <ChevronRight size={20} /></>}
              </button>
            </div>
          </div>
        )}
        
        {!showExplanation && selectedOption !== null && (
             <div className="p-6 flex justify-end bg-white">
                <button onClick={handleNext} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center gap-3 active:scale-95">
                 {isLastQuestion ? 'FINISH' : 'NEXT'} <ChevronRight size={20} />
              </button>
             </div>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;