import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, ChevronRight, BarChart2, BookOpen, Lightbulb, Image as ImageIcon, Loader, Clock, AlertTriangle } from 'lucide-react';
import { generateIllustrativeImage } from '../services/geminiService';

interface Props {
  questions: Question[];
  timeLimit?: number; // Time limit in minutes
  language?: string;
  onFinish: (score: number, answers: Record<string, number>) => void;
}

const QuizPlayer: React.FC<Props> = ({ questions, timeLimit, language, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit ? timeLimit * 60 : 0);
  
  // Image state
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;
  const timerRef = useRef<number | null>(null);

  // Sound effect function using Web Audio API
  const playTickSound = (urgency: 'low' | 'high') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Frequency and duration based on urgency
      const freq = urgency === 'high' ? 880 : 440; // High pitch for very low time
      const duration = 0.1;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime); // Keep volume subtle
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors (e.g. if user hasn't interacted with document yet)
    }
  };

  useEffect(() => {
    if (!timeLimit) return;
    
    // Timer logic
    timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
            const nextTime = prev - 1;

            // Alert logic
            if (nextTime <= 30 && nextTime > 10) {
               playTickSound('low');
            } else if (nextTime <= 10 && nextTime > 0) {
               playTickSound('high');
            }

            if (nextTime <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                handleFinish();
                return 0;
            }
            return nextTime;
        });
    }, 1000);

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLimit]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinish = () => {
      // Calculate score based on current state of answers
      let score = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctAnswerIndex) {
          score++;
        }
      });
      onFinish(score, answers);
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return; // Prevent changing answer
    setSelectedOption(idx);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: idx }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleFinish();
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setImageUrl(null); // Reset image
    }
  };

  const handleShowVisual = async () => {
    if (imageUrl) return; // Already loaded
    setIsImageLoading(true);
    try {
      // Pass language to ensure correct script in image
      const url = await generateIllustrativeImage(currentQuestion.visualPrompt, language);
      setImageUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsImageLoading(false);
    }
  }

  // Progress Bar calculation
  const progress = ((currentIdx + (selectedOption !== null ? 1 : 0)) / questions.length) * 100;

  // Determine timer visual state
  let timerClasses = "fixed top-20 right-4 z-20 md:absolute md:-right-32 md:top-0 transition-all duration-300 px-3 py-2 rounded-lg border shadow-sm font-mono font-bold flex items-center gap-2 ";
  
  if (timeLeft <= 10) {
    timerClasses += "bg-red-600 text-white border-red-700 animate-bounce";
  } else if (timeLeft <= 30) {
    timerClasses += "bg-red-50 text-red-600 border-red-200 animate-pulse";
  } else {
    timerClasses += "bg-white text-slate-600 border-slate-200";
  }

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
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.3s ease-out both;
        }
      `}</style>

      {/* Sticky Timer for Mobile/Desktop */}
      {timeLimit && (
          <div className={timerClasses}>
              {timeLeft <= 30 ? <AlertTriangle size={18} /> : <Clock size={18} />}
              {formatTime(timeLeft)}
          </div>
      )}

      {/* Progress Header */}
      <div className="mb-6 flex items-center justify-between text-sm font-medium text-slate-600">
        <span>Question {currentIdx + 1} of {questions.length}</span>
        <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Score: {Object.keys(answers).filter(id => {
           const q = questions.find(q => q.id === id);
           return q && answers[id] === q.correctAnswerIndex;
        }).length}</span>
      </div>
      
      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
         <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
         ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start gap-4 mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug whitespace-pre-wrap">
              {currentQuestion.text}
            </h3>
            {/* Visual Aid Button */}
            <button 
              onClick={handleShowVisual}
              disabled={isImageLoading || !!imageUrl}
              className="shrink-0 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100 flex flex-col items-center gap-1 text-xs font-semibold"
              title="Generate Visual Aid"
            >
              {isImageLoading ? <Loader className="animate-spin" size={20}/> : <ImageIcon size={20} />}
              Visual
            </button>
          </div>

          {/* Generated Image Area */}
          {imageUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 animate-in fade-in zoom-in duration-300">
              <img src={imageUrl} alt="Visual Aid" className="w-full h-auto max-h-64 object-contain mx-auto" />
              <p className="text-center text-xs text-slate-400 py-1">AI Generated Illustration</p>
            </div>
          )}

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = currentQuestion.correctAnswerIndex === idx;
              const isWrong = isSelected && !isCorrect;
              const showResult = selectedOption !== null;

              let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ";
              
              if (!showResult) {
                btnClass += "border-slate-100 hover:border-indigo-200 hover:bg-slate-50 cursor-pointer active:scale-[0.99]";
              } else {
                if (isCorrect) {
                  btnClass += "border-green-500 bg-green-50 text-green-800 animate-pop shadow-sm";
                } else if (isWrong) {
                  btnClass += "border-red-500 bg-red-50 text-red-800 opacity-80 animate-shake";
                } else {
                  btnClass += "border-slate-100 text-slate-400 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={showResult}
                  className={btnClass}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${
                        showResult && isCorrect ? 'bg-green-600 border-green-600 text-white' : 
                        showResult && isWrong ? 'bg-red-600 border-red-600 text-white' :
                        'bg-white border-slate-300 text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium text-lg">{option}</span>
                  </span>
                  
                  {showResult && isCorrect && <CheckCircle className="text-green-600" />}
                  {showResult && isWrong && <XCircle className="text-red-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation Section */}
        {showExplanation && (
          <div className="bg-slate-50 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Main Explanation */}
            <div className="p-6 md:p-8 border-b border-slate-100">
              <div className="flex items-start gap-3">
                 <BookOpen className="text-indigo-600 shrink-0 mt-1" size={24} />
                 <div>
                   <h4 className="font-bold text-indigo-900 mb-1">Explanation</h4>
                   <p className="text-slate-700 leading-relaxed">{currentQuestion.explanation}</p>
                 </div>
              </div>
            </div>

            {/* Did You Know / Additional Info */}
            <div className="p-6 md:p-8 bg-amber-50/50">
              <div className="flex items-start gap-3">
                 <Lightbulb className="text-amber-500 shrink-0 mt-1" size={24} />
                 <div>
                   <h4 className="font-bold text-amber-900 mb-1">Did you know?</h4>
                   <p className="text-slate-700 leading-relaxed">{currentQuestion.additionalInfo}</p>
                 </div>
              </div>
            </div>
            
            <div className="p-4 flex justify-end bg-white border-t border-slate-100">
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                {isLastQuestion ? (
                    <>Finish Quiz <BarChart2 size={18} /></>
                ) : (
                    <>Next Question <ChevronRight size={18} /></>
                )}
              </button>
            </div>
          </div>
        )}
        
        {!showExplanation && selectedOption !== null && (
             <div className="p-6 flex justify-end">
                <button
                onClick={handleNext}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                 {isLastQuestion ? 'Finish' : 'Next'} <ChevronRight size={18} />
              </button>
             </div>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;