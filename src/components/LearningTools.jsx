import { useState } from 'react';
import { BookMarked, Layers, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { vocabularyWords, grammarTopics } from '../data/siteData';

const tabs = [
  { id: 'vocab', label: 'Vocabulary Builder', icon: BookMarked },
  { id: 'grammar', label: 'Grammar Practice', icon: Layers },
  { id: 'materials', label: 'Study Materials', icon: FileText },
];

function VocabBuilder() {
  const [flipped, setFlipped] = useState(null);
  return (
    <div>
      <p className="text-gray-400 text-sm mb-6">Click a card to reveal the definition and example sentence.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vocabularyWords.map((item, i) => (
          <button
            key={i}
            onClick={() => setFlipped(flipped === i ? null : i)}
            className={`text-left p-5 rounded-xl border transition-all duration-200 ${
              flipped === i
                ? 'border-[#0ea5e9]/50 bg-[#0ea5e9]/10'
                : 'border-white/10 bg-[#030712]/60 hover:border-[#0ea5e9]/25 hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold">{item.word || item}</span>
              {flipped === i ? <ChevronUp className="w-4 h-4 text-[#0ea5e9]" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
            {flipped === i && (
              <div className="space-y-2">
                <p className="text-gray-300 text-sm">{item.definition || 'A useful CEFR vocabulary item for precise academic communication.'}</p>
                <p className="text-gray-400 text-xs italic">"{item.example || `Use "${item.word || item}" in a clear, confident sentence.`}"</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function GrammarPractice() {
  const levelColor = {
    'Intermediate': 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20',
    'Upper-Intermediate': 'text-[#0ea5e9] bg-[#0ea5e9]/20 border-[#0ea5e9]/30',
  };
  return (
    <div className="space-y-3">
      {grammarTopics.map((topic, i) => (
        <div
          key={i}
          className="group flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-[#030712]/60 p-5 transition-all hover:border-[#0ea5e9]/25 hover:bg-white/[0.06]"
        >
          <div>
            <h4 className="text-sm font-semibold text-white transition-colors group-hover:text-[#0ea5e9]">{topic.title || topic}</h4>
            <p className="mt-0.5 text-xs text-gray-400">{topic.lessons || 8} lessons</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${levelColor[topic.level] || 'border-[#0ea5e9]/30 bg-[#0ea5e9]/20 text-[#0ea5e9]'}`}>
            {topic.level || 'Intermediate'}
          </span>
        </div>
      ))}
    </div>
  );
}

function StudyMaterials() {
  const materials = [
    { title: 'CEFR Writing Task 1 - Sample Answers', type: 'PDF', size: '2.4 MB' },
    { title: 'CEFR Writing Task 2 - Essay Templates', type: 'PDF', size: '1.8 MB' },
    { title: 'Academic Word List (570 words)', type: 'PDF', size: '0.9 MB' },
    { title: 'Speaking - Part 2 Cue Cards (200+)', type: 'PDF', size: '3.1 MB' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {materials.map((m, i) => (
        <div key={i} className="group flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-[#030712]/60 p-5 transition-all hover:border-[#0ea5e9]/25 hover:bg-white/[0.06]">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6] text-xs font-bold text-white">
            {m.type}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white transition-colors group-hover:text-[#0ea5e9]">{m.title}</p>
            <p className="text-gray-400 text-xs mt-0.5">{m.size}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const tabContent = { vocab: VocabBuilder, grammar: GrammarPractice, materials: StudyMaterials };

export default function LearningTools() {
  const [activeTab, setActiveTab] = useState('vocab');
  const Content = tabContent[activeTab];

  return (
    <section id="tools" className="section-panel py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="gold-badge mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
            <span>Learning Tools</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Tools that{' '}
            <span className="gradient-text">
              accelerate learning
            </span>
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            From vocabulary flashcards to grammar drills — all the study tools you need in one place.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white shadow-lg shadow-[#0ea5e9]/20'
                    : 'border border-white/10 bg-white/[0.055] text-gray-400 hover:border-[#0ea5e9]/25 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="premium-card rounded-3xl p-6 sm:p-8 animate-scale-in">
          <Content />
        </div>
      </div>
    </section>
  );
}
