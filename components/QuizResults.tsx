import React, { useState } from 'react';
import { RefreshCcw, Trophy, Award, Target, Home, ChevronDown, ChevronUp, BookOpen, Lightbulb, FileDown, Download, CheckCircle2, History } from 'lucide-react';
import { Question } from '../types';
import { jsPDF } from 'jspdf';
import * as docx from 'docx';

interface Props {
  score: number;
  total: number;
  onReset: () => void;
  questions: Question[];
  answers: Record<string, number>;
  images?: Record<string, string>;
}

const QuizResults: React.FC<Props> = ({ score, total, onReset, questions, answers, images = {} }) => {
  const percentage = Math.round((score / total) * 100);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'word'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  
  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.text('AP DSC PERFORMANCE REPORT', 20, 20);
        
        doc.setFontSize(14);
        doc.setTextColor(51, 65, 85); // Slate-700
        doc.text(`Score: ${score} / ${total} (${percentage}%)`, 20, 32);
        
        let y = 50;
        questions.forEach((q, i) => {
          if (y > 240) { doc.addPage(); y = 20; }
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          const sourceText = q.sourceExam ? ` [SOURCE: ${q.sourceExam} ${q.sourceYear}]` : "";
          const splitQuestion = doc.splitTextToSize(`${i + 1}. ${q.text}${sourceText}`, 170);
          doc.setTextColor(51, 65, 85);
          doc.text(splitQuestion, 20, y);
          y += (splitQuestion.length * 7);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(22, 163, 74); // Green-600
          doc.text(`Correct: ${q.options[q.correctAnswerIndex]}`, 25, y);
          y += 7;

          const userAns = q.options[answers[q.id]] || 'Not Answered';
          const isUserCorrect = answers[q.id] === q.correctAnswerIndex;
          doc.setTextColor(isUserCorrect ? 22 : 220, isUserCorrect ? 163 : 38, isUserCorrect ? 74 : 38);
          doc.text(`Your Choice: ${userAns}`, 25, y);
          y += 10;
          
          if (images[q.id]) {
            try {
              doc.addImage(images[q.id], 'PNG', 25, y, 60, 45);
              y += 55;
            } catch (e) { console.error("PDF Image add failed", e); }
          }
          
          y += 5;
        });
        doc.save(`AP_DSC_Report_${Date.now()}.pdf`);
      } else {
        // Word Doc Export
        const sections = questions.map((q, i) => {
          const elements: any[] = [
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: `${i + 1}. ${q.text}`, bold: true, size: 28 }),
                ...(q.sourceExam ? [new docx.TextRun({ text: ` [${q.sourceExam} ${q.sourceYear}]`, color: "94a3b8", size: 22, bold: true })] : [])
              ],
              spacing: { before: 400, after: 120 },
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: "Correct Answer: ", bold: true }),
                new docx.TextRun({ text: q.options[q.correctAnswerIndex], color: "2e7d32", bold: true })
              ],
            }),
            new docx.Paragraph({
               children: [new docx.TextRun({ text: `Explanation: ${q.explanation}`, italics: true, color: "64748b" })],
               spacing: { after: 200 }
            })
          ];

          if (images[q.id]) {
            try {
                const base64Data = images[q.id].split(',')[1];
                const image = new docx.ImageRun({
                  data: Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)),
                  transformation: { width: 400, height: 300 },
                });
                elements.push(new docx.Paragraph({ children: [image], alignment: docx.AlignmentType.CENTER, spacing: { after: 200 } }));
            } catch (e) { console.error("Docx Image failed", e); }
          }

          return elements;
        }).flat();

        const doc = new docx.Document({
          sections: [{
            properties: {},
            children: [
              new docx.Paragraph({
                children: [new docx.TextRun({ text: "AP DSC PERFORMANCE REPORT", bold: true, size: 40, color: "4f46e5" })],
                alignment: docx.AlignmentType.CENTER,
                spacing: { after: 400 }
              }),
              new docx.Paragraph({
                children: [new docx.TextRun({ text: `Final Score: ${score} / ${total} (${percentage}%)`, size: 28, bold: true })],
                alignment: docx.AlignmentType.CENTER,
                spacing: { after: 800 }
              }),
              ...sections
            ],
          }],
        });

        const blob = await docx.Packer.toBlob(doc);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `AP_DSC_Report_${Date.now()}.docx`;
        link.click();
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export. Ensure all visuals are loaded.");
    } finally {
      setIsExporting(false);
    }
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
    <div className="max-w-4xl mx-auto w-full animate-in fade-in zoom-in duration-700">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden mb-12 border border-slate-100">
        <div className="bg-slate-900 p-12 text-center text-white relative overflow-hidden">
             <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-600 rounded-full opacity-30 blur-3xl"></div>
             <div className="absolute top-20 right-10 w-40 h-40 bg-purple-600 rounded-full opacity-30 blur-3xl"></div>
            <div className={`inline-flex items-center justify-center p-6 rounded-3xl mb-8 ${colorClass} shadow-lg ring-8 ring-white/5 relative z-10`}>
              <ColorIcon size={64} />
            </div>
            <h2 className="text-6xl font-black mb-4 relative z-10">{score} <span className="text-slate-500 text-3xl font-medium">/ {total}</span></h2>
            <p className="text-indigo-300 font-black text-xl uppercase tracking-[0.2em] relative z-10">{message}</p>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
             <div className="p-6 bg-slate-50 rounded-2xl text-center border-2 border-slate-100 transition-hover hover:border-indigo-100">
                <span className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Accuracy</span>
                <span className="block text-3xl font-black text-slate-800">{percentage}%</span>
             </div>
             <div className="p-6 bg-green-50 rounded-2xl text-center border-2 border-green-100">
                <span className="block text-green-600/60 text-xs font-black uppercase tracking-widest mb-2">Correct</span>
                <span className="block text-3xl font-black text-green-700">{score}</span>
             </div>
             <div className="p-6 bg-red-50 rounded-2xl text-center border-2 border-red-100">
                <span className="block text-red-600/60 text-xs font-black uppercase tracking-widest mb-2">Incorrect</span>
                <span className="block text-3xl font-black text-red-700">{total - score}</span>
             </div>
          </div>

          <div className="bg-indigo-50/40 rounded-3xl p-8 border-2 border-indigo-50 mb-12">
            <h3 className="text-indigo-900 font-black flex items-center gap-3 mb-6 uppercase tracking-tight">
              <FileDown size={24} /> Export Detailed Report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <label className={`flex items-center gap-4 p-5 rounded-2xl border-4 cursor-pointer transition-all ${exportFormat === 'pdf' ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100' : 'border-slate-100 bg-slate-50/50 grayscale hover:grayscale-0'}`}>
                <input type="radio" name="format" checked={exportFormat === 'pdf'} onChange={() => setExportFormat('pdf')} className="w-5 h-5 accent-indigo-600" />
                <div className="flex-1">
                  <p className="font-black text-slate-800 text-base">PDF Document</p>
                  <p className="text-xs text-slate-500 font-semibold">Print ready</p>
                </div>
              </label>
              <label className={`flex items-center gap-4 p-5 rounded-2xl border-4 cursor-pointer transition-all ${exportFormat === 'word' ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100' : 'border-slate-100 bg-slate-50/50 grayscale hover:grayscale-0'}`}>
                <input type="radio" name="format" checked={exportFormat === 'word'} onChange={() => setExportFormat('word')} className="w-5 h-5 accent-indigo-600" />
                <div className="flex-1">
                  <p className="font-black text-slate-800 text-base">Word Document</p>
                  <p className="text-xs text-slate-500 font-semibold">Editable .docx</p>
                </div>
              </label>
            </div>
            
            <button onClick={handleExport} disabled={isExporting} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {isExporting ? <RefreshCcw className="animate-spin" /> : <Download size={24} />}
              {isExporting ? 'PREPARING...' : `DOWNLOAD ${exportFormat.toUpperCase()} REPORT`}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onReset} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2">
              <RefreshCcw size={20} /> START NEW SESSION
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-20">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-xl uppercase tracking-tight">Question Review</h3>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tap to view sources & details</span>
        </div>
        <div className="divide-y divide-slate-100">
            {questions.map((q, idx) => {
                const isCorrect = answers[q.id] === q.correctAnswerIndex;
                const isExpanded = expandedId === q.id;
                return (
                    <div key={q.id} className={`transition-colors cursor-pointer ${isExpanded ? 'bg-indigo-50/20' : 'hover:bg-slate-50'}`} onClick={() => toggleExpand(q.id)}>
                        <div className="p-8">
                            <div className="flex items-start gap-6">
                                <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black mt-0.5 ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {idx + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-6">
                                        <div>
                                          {q.sourceExam && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-black uppercase tracking-tighter border border-amber-100 mb-2 w-fit">
                                              <History size={10}/> {q.sourceExam} {q.sourceYear}
                                            </div>
                                          )}
                                          <p className="text-slate-900 font-bold text-xl leading-snug whitespace-pre-wrap">{q.text}</p>
                                        </div>
                                        <div className="text-slate-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                                            <ChevronDown size={24}/>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className={`p-4 rounded-xl border-2 flex flex-col ${answers[q.id] === q.correctAnswerIndex ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                                            <span className="font-black text-[10px] opacity-60 uppercase tracking-widest mb-1">Your Choice</span>
                                            <span className="font-bold text-lg">{q.options[answers[q.id]] || 'Skipped'}</span>
                                        </div>
                                        <div className="p-4 rounded-xl border-2 border-indigo-100 bg-white text-indigo-900 shadow-sm flex flex-col">
                                             <span className="font-black text-[10px] opacity-60 uppercase tracking-widest mb-1">Answer Key</span>
                                             <span className="font-bold text-lg text-indigo-700">{q.options[q.correctAnswerIndex]}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="mt-8 ml-16 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    {images[q.id] && (
                                        <div className="rounded-2xl overflow-hidden border-2 border-slate-100 mb-6 bg-white max-w-md shadow-lg">
                                            <img src={images[q.id]} alt="Review visual" className="w-full h-auto" />
                                        </div>
                                    )}
                                    <div className="p-6 bg-white rounded-2xl border-2 border-indigo-50 shadow-sm">
                                        <div className="flex items-start gap-4">
                                            <BookOpen className="text-indigo-600 shrink-0 mt-0.5" size={24} />
                                            <div>
                                                <h5 className="font-black text-indigo-900 text-xs uppercase tracking-widest mb-2">Detailed Analysis</h5>
                                                <p className="text-slate-600 leading-relaxed font-medium">{q.explanation}</p>
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