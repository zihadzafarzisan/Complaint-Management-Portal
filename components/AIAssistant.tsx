
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const askAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResponse(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `তুমি একজন দক্ষ সরকারি কর্মকর্তা হিসেবে আমাকে সাহায্য করো। আমি আমার এলাকার একটি সমস্যা নিয়ে সংসদ সদস্যকে চিঠি লিখতে চাই। আমার সমস্যাটি হলো: "${prompt}"। আমাকে একটি সুন্দর বিষয় এবং বিস্তারিত অভিযোগের খসড়া লিখে দাও বাংলায়।`,
        config: { temperature: 0.7 }
      });
      setResponse(result.text || "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।");
    } catch (err) {
      setResponse("AI এই মুহূর্তে কাজ করছে না। অনুগ্রহ করে সরাসরি অভিযোগ লিখুন।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen ? (
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-80 md:w-96 overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="bg-gov-green p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              <h3 className="font-black text-sm uppercase tracking-widest">AI অভিযোগ সহকারী</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-2xl hover:scale-110 transition-transform">&times;</button>
          </div>
          
          <div className="p-6 h-96 overflow-y-auto custom-scrollbar flex flex-col">
            {!response && !isLoading ? (
              <p className="text-slate-500 text-sm font-medium leading-relaxed font-hind mb-4">
                আপনার সমস্যাটি সংক্ষেপে নিচে লিখুন, AI আপনাকে একটি প্রফেশনাল অভিযোগের খসড়া তৈরি করে দেবে।
              </p>
            ) : null}

            {isLoading && (
              <div className="flex-grow flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gov-green border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {response && (
              <div className="flex-grow">
                <div className="bg-gov-green/5 p-4 rounded-2xl border border-gov-green/10 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-hind">
                  {response}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(response);
                    alert('খসড়া কপি হয়েছে! এবার মূল ফর্মে পেস্ট করুন।');
                  }}
                  className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest"
                >
                  Copy Assistant Text
                </button>
              </div>
            )}
          </div>

          <form onSubmit={askAI} className="p-6 border-t bg-slate-50">
            <div className="relative">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="আপনার সমস্যাটি লিখুন..." 
                className="w-full pr-12 pl-4 py-4 rounded-xl border border-slate-200 focus:border-gov-green outline-none text-sm font-hind"
              />
              <button disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gov-green text-white rounded-lg flex items-center justify-center shadow-lg shadow-green-100 active:scale-95 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 bg-gov-green text-white rounded-full shadow-[0_20px_50px_rgba(0,106,78,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative"
        >
          <div className="absolute -top-2 -right-2 bg-gov-red text-white text-[10px] px-2 py-1 rounded-full font-black animate-bounce shadow-lg">New</div>
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        </button>
      )}
    </div>
  );
};
