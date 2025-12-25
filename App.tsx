import React, { useState } from 'react';
import Header from './components/Header';
import QuizConfigForm from './components/QuizConfigForm';
import QuizPlayer from './components/QuizPlayer';
import QuizResults from './components/QuizResults';
import Testimonials from './components/Testimonials';
import SubscriptionPlans from './components/SubscriptionPlans';
import { QuizConfig, QuizState } from './types';
import { generateQuizQuestions } from './services/geminiService';
import { BrainCircuit, Sparkles, CreditCard } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<QuizState & { questionImages?: Record<string, string>, showPricing?: boolean }>({
    status: 'idle',
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    score: 0,
    questionImages: {},
    showPricing: false
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const handleStartQuiz = async (config: QuizConfig) => {
    // Basic limit check for free users
    if (!isSubscribed && config.questionCount > 10) {
      alert("ఉచిత ప్లాన్‌లో గరిష్టంగా 10 ప్రశ్నలు మాత్రమే అనుమతించబడతాయి. అపరిమిత ప్రశ్నల కోసం Pro కి మారండి!");
      return;
    }

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
        questionImages: {},
        showPricing: false
      });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      setGameState((prev) => ({ ...prev, status: 'error', errorMessage: message }));
    }
  };

  const handlePlanSelection = (planId: string) => {
    setIsPaymentProcessing(true);
    // Simulate Razorpay Payment Flow
    setTimeout(() => {
      alert(`చెల్లింపు విజయవంతమైంది! మీరు ఇప్పుడు ${planId === 'pro_monthly' ? 'Monthly' : 'Yearly'} Pro మెంబర్.`);
      setIsSubscribed(true);
      setIsPaymentProcessing(false);
      setGameState(prev => ({ ...prev, showPricing: false }));
    }, 2000);
  };

  const handleFinishQuiz = (score: number, answers: Record<string, number>, images?: Record<string, string>) => {
    setGameState((prev) => ({
      ...prev,
      status: 'completed',
      score,
      answers,
      questionImages: images || prev.questionImages
    }));
  };

  const handleReset = () => {
    setGameState({
      status: 'idle',
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      questionImages: {},
      showPricing: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6">
           <button 
             onClick={() => setGameState(prev => ({ ...prev, showPricing: !prev.showPricing }))}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${isSubscribed ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'}`}
           >
             <CreditCard size={18} /> {isSubscribed ? 'PRO ACTIVE' : 'UPGRADE TO PRO'}
           </button>
           <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-indigo-200 shadow-sm">
              <Sparkles size={12} /> AI Powered Excellence
           </div>
        </div>

        {gameState.showPricing ? (
          <SubscriptionPlans onSelectPlan={handlePlanSelection} isProcessing={isPaymentProcessing} />
        ) : (
          <>
            {(gameState.status === 'idle' || gameState.status === 'error' || gameState.status === 'generating') && (
              <>
                <div className="text-center mb-10 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="inline-flex p-3 bg-indigo-600 rounded-2xl text-white mb-6 shadow-xl shadow-indigo-200">
                    <BrainCircuit size={32} />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Master the <span className="text-indigo-600">AP DSC</span> Exam
                  </h1>
                  <p className="text-lg text-slate-600">
                    అపరిమిత AI ప్రశ్నలతో మీ ప్రిపరేషన్‌ను సులభతరం చేసుకోండి. 2024 సిలబస్ ప్రకారం రూపొందించబడింది.
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
                onCancel={handleReset}
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
                images={gameState.questionImages}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} AP DSC Prep AI • Empowering Future Educators</p>
        </div>
      </footer>
    </div>
  );
};

export default App;