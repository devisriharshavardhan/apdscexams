import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QuizConfigForm from './components/QuizConfigForm';
import QuizPlayer from './components/QuizPlayer';
import QuizResults from './components/QuizResults';
import Testimonials from './components/Testimonials';
import { QuizConfig, QuizState } from './types';
import { generateQuizQuestions } from './services/geminiService';
import { ShieldCheck, Key, Lock, Zap, Award, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState<boolean>(true);
  const [gameState, setGameState] = useState<QuizState>({
    status: 'idle',
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    score: 0,
  });

  useEffect(() => {
    const verifySubscription = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsSubscribed(hasKey);
      }
      setIsCheckingSubscription(false);
    };
    verifySubscription();
  }, []);

  const handleSubscribe = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success as per race condition instructions
      setIsSubscribed(true);
    }
  };

  const handleStartQuiz = async (config: QuizConfig) => {
    setGameState((prev) => ({ ...prev, status: 'generating', errorMessage: undefined }));
    
    try {
      const questions = await generateQuizQuestions(config);
      setGameState({
        status: 'active',
        questions,
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
        timeLimit: config.timeLimit,
        language: config.language,
      });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      setGameState((prev) => ({ ...prev, status: 'error', errorMessage: message }));
      
      if (message.includes("Subscriber session expired")) {
        setIsSubscribed(false);
      }
    }
  };

  const handleFinishQuiz = (score: number, answers: Record<string, number>) => {
    setGameState((prev) => ({
      ...prev,
      status: 'completed',
      score,
      answers,
    }));
  };

  const handleReset = () => {
    setGameState({
      status: 'idle',
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
    });
  };

  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-indigo-600 font-bold">Verifying Subscription...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      {!isSubscribed ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-8 text-center text-white">
              <div className="inline-flex p-4 bg-indigo-600 rounded-2xl mb-6 shadow-lg shadow-indigo-500/30">
                <ShieldCheck size={40} />
              </div>
              <h1 className="text-3xl font-bold mb-2">Subscriber Access</h1>
              <p className="text-slate-400 text-sm">Exclusive Portal for AP DSC Premium Prep</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><Zap size={20} /></div>
                  <div>
                    <h3 className="font-bold text-slate-800">Gemini 3 Pro Intelligence</h3>
                    <p className="text-xs text-slate-500">Access the most accurate syllabus-aligned reasoning.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><Award size={20} /></div>
                  <div>
                    <h3 className="font-bold text-slate-800">HD Educational Diagrams</h3>
                    <p className="text-xs text-slate-500">Professional visual aids generated in 1K resolution.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 text-green-700 rounded-lg"><BookOpen size={20} /></div>
                  <div>
                    <h3 className="font-bold text-slate-800">Unlimited Practice</h3>
                    <p className="text-xs text-slate-500">Generate thousands of unique questions for every post.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 mb-4 leading-tight text-center">
                  Subscriber access requires a paid Google Cloud Project API Key. 
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-indigo-600 underline ml-1">View Billing Docs</a>.
                </p>
                <button 
                  onClick={handleSubscribe}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Key size={20} /> Verify Subscription
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 text-slate-400 text-xs flex items-center gap-2">
            <Lock size={12} /> Encrypted & Secure Subscriber Session
          </div>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center">
          <div className="w-full flex justify-end mb-4">
             <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-green-200">
                <ShieldCheck size={12} /> Subscriber Active (Pro 3.0)
             </div>
          </div>

          {(gameState.status === 'idle' || gameState.status === 'error' || gameState.status === 'generating') && (
            <>
              <div className="text-center mb-10 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  Master the <span className="text-indigo-600">AP DSC</span> Exam
                </h1>
                <p className="text-lg text-slate-600">
                  Generate unlimited AI-powered practice questions for Teacher Recruitment Tests (TRT), TET, and DSC.
                </p>
              </div>
              
              <QuizConfigForm 
                onStartQuiz={handleStartQuiz} 
                isLoading={gameState.status === 'generating'}
                error={gameState.errorMessage}
              />

              {gameState.status !== 'generating' && <Testimonials />}
            </>
          )}

          {gameState.status === 'active' && (
            <QuizPlayer 
              questions={gameState.questions}
              onFinish={handleFinishQuiz}
              timeLimit={gameState.timeLimit}
              language={gameState.language}
            />
          )}

          {gameState.status === 'completed' && (
            <QuizResults 
              score={gameState.score}
              total={gameState.questions.length}
              questions={gameState.questions}
              answers={gameState.answers}
              onReset={handleReset}
            />
          )}
        </main>
      )}

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} AP DSC Prep AI • Subscriber Edition</p>
        </div>
      </footer>
    </div>
  );
};

export default App;