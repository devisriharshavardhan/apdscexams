import React from 'react';
import { Check, Zap, Crown, ShieldCheck } from 'lucide-react';

interface Props {
  onSelectPlan: (plan: string) => void;
  isProcessing: boolean;
}

const SubscriptionPlans: React.FC<Props> = ({ onSelectPlan, isProcessing }) => {
  const plans = [
    {
      id: 'free',
      name: 'Basic (ఉచితం)',
      price: '₹0',
      period: 'ఎప్పటికీ',
      features: ['రోజుకు 5 AI ప్రశ్నలు', 'సాధారణ వివరణలు', 'కేవలం వెబ్‌లో మాత్రమే'],
      buttonText: 'ప్రస్తుత ప్లాన్',
      recommended: false,
      color: 'slate'
    },
    {
      id: 'pro_monthly',
      name: 'Pro Monthly',
      price: '₹99',
      period: 'నెలకి',
      features: ['అపరిమిత AI ప్రశ్నలు', 'PDF & Word డౌన్‌లోడ్స్', 'అన్ని Visual Aids', 'PYQs కి ప్రాధాన్యత'],
      buttonText: 'Pro కి మారండి',
      recommended: true,
      color: 'indigo'
    },
    {
      id: 'pro_yearly',
      name: 'Success Pack',
      price: '₹499',
      period: 'సంవత్సరానికి',
      features: ['నెలవారీ ప్లాన్ లో ఉన్నవన్నీ', '2 నెలలు ఉచితం', 'డౌన్లోడ్ లిమిట్ లేదు', '24/7 AI సపోర్ట్'],
      buttonText: 'మొత్తం సేవ్ చేయండి',
      recommended: false,
      color: 'purple'
    }
  ];

  return (
    <div className="py-12 w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-900 mb-4">మీ ప్రిపరేషన్ స్థాయిని పెంచుకోండి</h2>
        <p className="text-slate-500">సరైన ప్లాన్‌ను ఎంచుకుని AP DSC లో విజయం సాధించండి</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative bg-white rounded-3xl p-8 border-2 transition-all ${plan.recommended ? 'border-indigo-600 shadow-2xl scale-105 z-10' : 'border-slate-100 shadow-xl'}`}>
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                <Crown size={12} /> అత్యంత ఆదరణ పొందినది
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                <span className="text-slate-400 text-sm">/ {plan.period}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                  <div className={`p-0.5 rounded-full bg-${plan.color}-100 text-${plan.color}-600`}>
                    <Check size={14} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              disabled={plan.id === 'free' || isProcessing}
              onClick={() => onSelectPlan(plan.id)}
              className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                plan.id === 'free' 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : `bg-${plan.color}-600 hover:bg-${plan.color}-700 text-white shadow-lg shadow-${plan.color}-100`
              }`}
            >
              {plan.id !== 'free' && <Zap size={18} />}
              {isProcessing ? 'వేచి ఉండండి...' : plan.buttonText}
            </button>
            
            {plan.id !== 'free' && (
              <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                <ShieldCheck size={12} /> Secure Payment via Razorpay
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;