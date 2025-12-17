import React from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">AP DSC Prep AI</h1>
            <p className="text-xs text-slate-500 font-medium">Teacher Recruitment Test Helper</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
          <span className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer transition-colors">
            <BookOpen size={16} /> Syllabus Focus
          </span>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
            Powered by Gemini
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
