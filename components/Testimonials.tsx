import React, { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Ravi Kumar",
    role: "SGT Aspirant",
    quote: "The detailed explanations for the assertion-reason questions changed my preparation strategy completely. I feel much more confident for the DSC now.",
    rating: 5,
    location: "Vijayawada"
  },
  {
    id: 2,
    name: "Lakshmi P.",
    role: "School Assistant (Bio-Science)",
    quote: "I was struggling with the Psychology syllabus. This AI tool generates questions that are exactly at the difficulty level of the real exam. Highly recommended!",
    rating: 5,
    location: "Visakhapatnam"
  },
  {
    id: 3,
    name: "Srinivas Rao",
    role: "PGT English",
    quote: "The ability to choose specific topics like 'Methods of Teaching' helped me focus on my weak areas. It's like having a personal tutor.",
    rating: 4,
    location: "Guntur"
  },
  {
    id: 4,
    name: "Anitha Reddy",
    role: "TGT Social",
    quote: "The image generation for geography questions is a game changer. Visualizing the concepts helps me remember them much better than just reading.",
    rating: 5,
    location: "Tirupati"
  }
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="w-full max-w-4xl mx-auto mt-20 mb-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900">Success Stories</h2>
        <p className="text-slate-500">Join thousands of teachers preparing smarter</p>
      </div>

      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
        <div className="absolute top-6 left-8 text-indigo-100">
          <Quote size={64} fill="currentColor" />
        </div>

        <div className="relative z-10 min-h-[180px] flex flex-col justify-center items-center text-center">
            <div className="flex gap-1 mb-6 text-amber-400">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                ))}
            </div>
            
            <p className="text-xl md:text-2xl text-slate-700 font-medium italic mb-8 leading-relaxed">
            "{testimonials[currentIndex].quote}"
            </p>

            <div>
                <h4 className="font-bold text-indigo-900 text-lg">{testimonials[currentIndex].name}</h4>
                <p className="text-sm text-slate-500">{testimonials[currentIndex].role} • {testimonials[currentIndex].location}</p>
            </div>
        </div>

        {/* Controls */}
        <button 
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors border border-slate-200"
            aria-label="Previous testimonial"
        >
            <ChevronLeft size={24} />
        </button>
        <button 
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors border border-slate-200"
            aria-label="Next testimonial"
        >
            <ChevronRight size={24} />
        </button>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex ? 'bg-indigo-600 w-6' : 'bg-slate-300'
                    }`}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;