/**
 * Reading fill-in-the-blanks test bank — 6 parts, A2 → C1.
 *
 * Segment types inside paragraphs:
 *   { type: 'text',  content: '...' }
 *   { type: 'blank', index: 0 }   ← index matches the answers array
 */

export const readingTests = [
  // ── Part 1 · A2 ────────────────────────────────────────────────────────────
  {
    id: 'tom-barry',
    part: 1,
    title: 'Tom Barry — International Skateboarder!',
    level: 'A2',
    topic: 'Sport & Leisure',
    timeLimit: 15,
    answers: ['magazine', 'videos', 'skateboarding', 'street', 'skate'],
    paragraphs: [
      [
        { type: 'text',  content: 'Tom Barry is 17, and started skateboarding when he was nine. He grew up in New York where he practised hard and won his first competition when he was 14. He was lucky. A writer from SKATE IT! ' },
        { type: 'blank', index: 0 },
        { type: 'text',  content: ' watched him that day, then wrote an article about him.' },
      ],
      [
        { type: 'text',  content: '"They even made some videos of me!" Tom said. "I left school last year and now the magazine is paying me to skate and to skateboard in international competitions. But I\'m not doing this for the money. I\'m doing this because it\'s so much fun! The writer is planning to collect my ' },
        { type: 'blank', index: 1 },
        { type: 'text',  content: ' and make a short film about me."' },
      ],
      [
        { type: 'text',  content: 'Tom has just returned from Japan. ' },
        { type: 'blank', index: 2 },
        { type: 'text',  content: ' is the third most popular sport for boys aged 12–16 in the USA, but in Japan it is less well-known.' },
      ],
      [
        { type: 'text', content: '"I took my skateboard out onto the city street and the traffic stopped as people watched me!" Tom said.' },
      ],
      [
        { type: 'text',  content: '"A problem for skateboarders in Japan is that there aren\'t many places where they can skate outside. Skate parks are usually inside big buildings in large cities, so ' },
        { type: 'blank', index: 3 },
        { type: 'text',  content: ' skating is difficult there. But things are changing. I loved the trip and hope to go back to Japan to ' },
        { type: 'blank', index: 4 },
        { type: 'text',  content: ' there again very soon."' },
      ],
    ],
  },

  // ── Part 2 · B1 ────────────────────────────────────────────────────────────
  {
    id: 'saras-new-job',
    part: 2,
    title: "Sara's New Job",
    level: 'B1',
    topic: 'Work & Career',
    timeLimit: 15,
    answers: ['nervous', 'office', 'friendly', 'lunchtime', 'manager'],
    paragraphs: [
      [
        { type: 'text',  content: 'Sara was feeling very ' },
        { type: 'blank', index: 0 },
        { type: 'text',  content: ' when she arrived at work on her first day. She did not know anyone at the company and was worried about making mistakes.' },
      ],
      [
        { type: 'text',  content: 'The ' },
        { type: 'blank', index: 1 },
        { type: 'text',  content: ' was a large, open-plan building near the city centre. Sara was shown to her desk, given a computer, and introduced to the team she would be working with.' },
      ],
      [
        { type: 'text',  content: 'To her surprise, all her new colleagues were very ' },
        { type: 'blank', index: 2 },
        { type: 'text',  content: ' and helped her whenever she had questions. She had expected the environment to feel more competitive.' },
      ],
      [
        { type: 'text',  content: 'At ' },
        { type: 'blank', index: 3 },
        { type: 'text',  content: ', three people from her team invited her to eat with them in the cafeteria. They told funny stories about the company and made her laugh.' },
      ],
      [
        { type: 'text',  content: 'By the end of the day, her ' },
        { type: 'blank', index: 4 },
        { type: 'text',  content: ' called her into a meeting room and said she had made an excellent start. Sara left the building feeling happy and excited about her new role.' },
      ],
    ],
  },

  // ── Part 3 · B1+ ───────────────────────────────────────────────────────────
  {
    id: 'power-of-music',
    part: 3,
    title: 'The Power of Music',
    level: 'B1+',
    topic: 'Science & Society',
    timeLimit: 15,
    answers: ['mood', 'brain', 'rhythm', 'emotions', 'performance'],
    paragraphs: [
      [
        { type: 'text',  content: 'Most people know that listening to music can change their ' },
        { type: 'blank', index: 0 },
        { type: 'text',  content: ' within seconds. An upbeat track can lift spirits, while a slow melody often brings a sense of calm or sadness.' },
      ],
      [
        { type: 'text',  content: 'Scientists who study the ' },
        { type: 'blank', index: 1 },
        { type: 'text',  content: ' have found that music activates more areas of it than almost any other human activity, involving memory, language, movement, and emotion simultaneously.' },
      ],
      [
        { type: 'text',  content: 'The ' },
        { type: 'blank', index: 2 },
        { type: 'text',  content: ' of a song directly affects the body: fast-tempo music increases heart rate and energy levels, while slower pieces can lower blood pressure and promote relaxation.' },
      ],
      [
        { type: 'text',  content: 'Music also helps people express deep ' },
        { type: 'blank', index: 3 },
        { type: 'text',  content: ' that are difficult to describe in words. Many people reach for music instinctively when grieving, celebrating, or feeling overwhelmed.' },
      ],
      [
        { type: 'text',  content: 'Research shows that students who study with appropriate background music often achieve a better ' },
        { type: 'blank', index: 4 },
        { type: 'text',  content: ' in memory tests, suggesting that music can support — rather than distract from — focused learning.' },
      ],
    ],
  },

  // ── Part 4 · B2 ────────────────────────────────────────────────────────────
  {
    id: 'benefits-of-reading',
    part: 4,
    title: 'The Benefits of Reading',
    level: 'B2',
    topic: 'Education & Wellbeing',
    timeLimit: 20,
    answers: ['vocabulary', 'concentration', 'empathy', 'knowledge', 'reduces'],
    paragraphs: [
      [
        { type: 'text',  content: 'Reading regularly is one of the most effective ways to expand your ' },
        { type: 'blank', index: 0 },
        { type: 'text',  content: ', as encountering words in context helps them embed in memory far more effectively than rote memorisation or word lists.' },
      ],
      [
        { type: 'text',  content: 'Unlike scrolling through social media, reading a sustained text demands continuous ' },
        { type: 'blank', index: 1 },
        { type: 'text',  content: '. Over time, this trains the brain to maintain focus for longer periods, a skill that has broad benefits in work and study.' },
      ],
      [
        { type: 'text',  content: 'Literary fiction, in particular, has been shown to develop ' },
        { type: 'blank', index: 2 },
        { type: 'text',  content: ': because readers must inhabit the perspectives of characters quite different from themselves, they become more skilled at understanding the feelings of real people around them.' },
      ],
      [
        { type: 'text',  content: 'Non-fiction builds factual ' },
        { type: 'blank', index: 3 },
        { type: 'text',  content: ' across an enormous range of subjects. A single well-chosen book can convey years of research, compressed into an accessible and engaging narrative.' },
      ],
      [
        { type: 'text',  content: 'Several studies have confirmed that reading before sleep ' },
        { type: 'blank', index: 4 },
        { type: 'text',  content: ' stress levels more efficiently than watching television or browsing a phone, making it one of the simplest and cheapest wellness tools available.' },
      ],
    ],
  },

  // ── Part 5 · B2+ ───────────────────────────────────────────────────────────
  {
    id: 'deep-ocean',
    part: 5,
    title: 'Secrets of the Deep Ocean',
    level: 'B2+',
    topic: 'Science & Environment',
    timeLimit: 20,
    answers: ['pressure', 'species', 'bioluminescence', 'exploration', 'resources'],
    paragraphs: [
      [
        { type: 'text',  content: 'The deep ocean — defined as water below 200 metres — remains one of Earth\'s least explored environments because the extreme ' },
        { type: 'blank', index: 0 },
        { type: 'text',  content: ' at such depths can crush most conventional equipment within seconds.' },
      ],
      [
        { type: 'text',  content: 'Despite these challenges, scientists have already identified thousands of ' },
        { type: 'blank', index: 1 },
        { type: 'text',  content: ' that survive in total darkness, feeding on organic material — known as marine snow — that drifts down from the sunlit surface far above.' },
      ],
      [
        { type: 'text',  content: 'Many of these creatures produce their own light through a biological process called ' },
        { type: 'blank', index: 2 },
        { type: 'text',  content: ', which they use to attract prey, communicate with potential mates, or confuse predators in the permanent blackness of the abyss.' },
      ],
      [
        { type: 'text',  content: 'Advances in remotely operated vehicles and autonomous submersibles have made deep-sea ' },
        { type: 'blank', index: 3 },
        { type: 'text',  content: ' progressively more practical, allowing researchers to film, sample, and map areas that no human has ever directly witnessed.' },
      ],
      [
        { type: 'text',  content: 'As surface ' },
        { type: 'blank', index: 4 },
        { type: 'text',  content: ' — including rare minerals critical for battery technology — become harder and more costly to access, commercial interest in extracting them from the seabed has grown significantly, raising serious environmental concerns.' },
      ],
    ],
  },

  // ── Part 6 · C1 ────────────────────────────────────────────────────────────
  {
    id: 'ai-in-medicine',
    part: 6,
    title: 'Artificial Intelligence in Medicine',
    level: 'C1',
    topic: 'Technology & Healthcare',
    timeLimit: 20,
    answers: ['diagnose', 'precision', 'algorithms', 'ethical', 'revolutionise'],
    paragraphs: [
      [
        { type: 'text',  content: 'Artificial intelligence is increasingly being deployed to help clinicians ' },
        { type: 'blank', index: 0 },
        { type: 'text',  content: ' diseases at a far earlier stage than was previously possible, particularly in imaging-heavy fields such as radiology, dermatology, and pathology.' },
      ],
      [
        { type: 'text',  content: 'Machine learning models trained on millions of annotated medical images can identify malignant tumours with a level of ' },
        { type: 'blank', index: 1 },
        { type: 'text',  content: ' that routinely matches — and in some landmark studies, surpasses — the diagnostic accuracy of experienced consultant specialists.' },
      ],
      [
        { type: 'text',  content: 'These systems rely on sophisticated ' },
        { type: 'blank', index: 2 },
        { type: 'text',  content: ' capable of detecting subtle statistical patterns distributed across thousands of data points — correlations that the human eye, however expert, would be unlikely to recognise consistently.' },
      ],
      [
        { type: 'text',  content: 'Nevertheless, the integration of AI into clinical decision-making raises profound ' },
        { type: 'blank', index: 3 },
        { type: 'text',  content: ' questions. When an algorithm contributes to a misdiagnosis, it remains deeply unclear whether legal and moral responsibility should lie with the developer, the hospital, or the individual clinician.' },
      ],
      [
        { type: 'text',  content: 'Proponents argue that, deployed responsibly and transparently, AI will ultimately ' },
        { type: 'blank', index: 4 },
        { type: 'text',  content: ' preventive medicine by enabling personalised treatment plans calibrated to a patient\'s unique genetic profile, lifestyle data, and real-time biosignals.' },
      ],
    ],
  },
];

export const getReadingTest    = (id)   => readingTests.find(t => t.id   === id)           ?? readingTests[0];
export const getReadingTestByPart = (part) => readingTests.find(t => t.part === Number(part)) ?? readingTests[0];
