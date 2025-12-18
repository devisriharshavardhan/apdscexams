import React, { useState } from 'react';
import Header from './components/Header';
import QuizConfigForm from './components/QuizConfigForm';
import QuizPlayer from './components/QuizPlayer';
import QuizResults from './components/QuizResults';
import Testimonials from './components/Testimonials';
import { QuizConfig, QuizState } from './types';
import { generateQuizQuestions } from './services/geminiService';
import { BrainCircuit, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<QuizState>({
    status: 'idle',
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    score: 0,
  });

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full flex justify-end mb-4">
           <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-indigo-200">
              <Sparkles size={12} /> AI Powered Excellence
           </div>
        </div>

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
                Generate unlimited AI-powered practice questions for Teacher Recruitment Tests (TRT), TET, and DSC. Tailored to the 2024 syllabus.
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

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} AP DSC Prep AI • Empowering Future Educators</p>
        </div>
      </footer>
    </div>
  );
};

export default App;