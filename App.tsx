import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QuizConfigForm from './components/QuizConfigForm';
import QuizPlayer from './components/QuizPlayer';
import QuizResults from './components/QuizResults';
import Testimonials from './components/Testimonials';
import { QuizConfig, QuizState } from './types';
import { generateQuizQuestions } from './services/geminiService';
import { Key } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<QuizState>({
    status: 'idle',
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    score: 0,
  });

  const [hasKey, setHasKey] = useState<boolean>(true);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
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
    } catch (error) {
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
      
      {!hasKey && (
        <div className="bg-amber-100 border-b border-amber-200 p-4 text-center flex items-center justify-center gap-4">
          <p className="text-amber-800 text-sm font-medium">
            High-quality image generation requires a selected API key. 
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1">Learn more about billing.</a>
          </p>
          <button 
            onClick={handleOpenKey}
            className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-amber-700 transition-colors"
          >
            <Key size={16} /> Select API Key
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center">
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

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} AP DSC Prep AI. Built for educational purposes.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;