import { PostType, Language, Difficulty } from './types';

export const DIFFICULTIES = [
  Difficulty.Easy,
  Difficulty.Medium,
  Difficulty.Hard,
];

export const LANGUAGES = [
  Language.English,
  Language.Telugu,
  Language.Hindi,
  Language.Urdu,
  Language.Kannada,
  Language.Tamil,
  Language.Odiya,
  Language.Sanskrit,
];

export const POSTS = [
  PostType.SGT,
  PostType.SA,
  PostType.TGT,
  PostType.PGT,
  PostType.Principal,
  PostType.PET,
  PostType.SpecialEducationTeacher,
];

// Mapping subjects available for each post based on the PDF
export const SUBJECTS_BY_POST: Record<PostType, string[]> = {
  [PostType.SGT]: [
    'General Knowledge & Current Affairs',
    'Perspectives in Education',
    'Educational Psychology',
    'Language-I (Optional)',
    'Language-II (English)',
    'Mathematics',
    'Science',
    'Social Studies'
  ],
  [PostType.SA]: [
    'General Knowledge & Current Affairs',
    'Perspectives in Education',
    'Classroom Implications of Educational Psychology',
    'Mathematics',
    'Physical Science',
    'Biological Science',
    'Social Studies',
    'English',
    'Telugu',
    'Hindi',
    'Urdu',
    'Odiya',
    'Tamil',
    'Kannada',
    'Sanskrit'
  ],
  [PostType.TGT]: [
    'General Knowledge & Current Affairs',
    'Perspectives in Education',
    'Educational Psychology',
    'Content & Methodology (Specific Subject)'
  ],
  [PostType.PGT]: [
    'General Knowledge & Current Affairs',
    'Perspectives in Education',
    'Educational Psychology',
    'English (Content & Methodology)',
    'Telugu (Content & Methodology)',
    'Hindi (Content & Methodology)',
    'Mathematics (Content & Methodology)',
    'Physical Science (Content & Methodology)',
    'Biological Science (Content & Methodology)',
    'Social Studies (Content & Methodology)',
    'Commerce',
    'Economics',
    'Civics'
  ],
  [PostType.Principal]: [
    'General Knowledge & Current Affairs',
    'Perspectives in Education',
    'Educational Psychology',
    'Contemporary Social, Economic and Cultural Issues',
    'School Administration & Management',
    'Financial Management',
    'Acts / Rights (RTE, RTI, Child Rights)'
  ],
  [PostType.PET]: [
    'General Knowledge & Current Affairs',
    'Perspectives in Education',
    'Physical Education Pedagogy',
    'Physical Education Content'
  ],
  [PostType.SpecialEducationTeacher]: [
    'General Knowledge & Current Affairs',
    'Perspectives in Education',
    'Educational Psychology',
    'Special Education Content',
    'Rehabilitation Psychology',
    'Inclusive Education Practices'
  ]
};

// Exam Patterns: Defines the ratio of questions for a full mock test
// Based on typical AP DSC weightage (Total usually 160 questions for 80 marks)
// We define the relative weights here.
export const EXAM_PATTERNS: Record<PostType, { section: string; weight: number; isContent?: boolean; isMethodology?: boolean }[]> = {
    [PostType.SGT]: [
        { section: 'General Knowledge & Current Affairs', weight: 16 },
        { section: 'Perspectives in Education', weight: 8 },
        { section: 'Educational Psychology', weight: 16 },
        { section: 'Language-I (Telugu/General)', weight: 16 },
        { section: 'Language-II (English)', weight: 16 },
        { section: 'Mathematics', weight: 24 },
        { section: 'Science', weight: 24 },
        { section: 'Social Studies', weight: 24 } // Total ~144 (scaled to 160 usually in older patterns, but these are relative weights)
    ],
    [PostType.SA]: [
        { section: 'General Knowledge & Current Affairs', weight: 16 }, // 8 Marks
        { section: 'Perspectives in Education', weight: 8 }, // 4 Marks
        { section: 'Classroom Implications of Educational Psychology', weight: 16 }, // 8 Marks
        { section: 'Content (Selected Subject)', weight: 80, isContent: true }, // 40 Marks
        { section: 'Methodology (Selected Subject)', weight: 40, isMethodology: true } // 20 Marks
    ],
    [PostType.TGT]: [
        { section: 'General Knowledge & Current Affairs', weight: 20 },
        { section: 'Perspectives in Education', weight: 10 },
        { section: 'Educational Psychology', weight: 10 },
        { section: 'Content & Methodology', weight: 120, isContent: true }
    ],
    [PostType.PGT]: [
        { section: 'General Knowledge & Current Affairs', weight: 20 },
        { section: 'Perspectives in Education', weight: 10 },
        { section: 'Educational Psychology', weight: 10 },
        { section: 'Content & Methodology', weight: 120, isContent: true }
    ],
    [PostType.Principal]: [
        { section: 'GK & Current Affairs', weight: 15 },
        { section: 'Perspectives in Education', weight: 15 },
        { section: 'Ed. Psychology', weight: 15 },
        { section: 'School Admin', weight: 20 },
        { section: 'Contemporary Issues', weight: 15 },
        { section: 'Acts/Rights', weight: 20 }
    ],
    [PostType.PET]: [
        { section: 'GK & Current Affairs', weight: 20 },
        { section: 'Perspectives', weight: 10 },
        { section: 'Physical Ed. Pedagogy', weight: 40 },
        { section: 'Physical Ed. Content', weight: 90 }
    ],
    [PostType.SpecialEducationTeacher]: [
        { section: 'GK & Current Affairs', weight: 16 },
        { section: 'Perspectives', weight: 8 },
        { section: 'Ed. Psychology', weight: 16 },
        { section: 'Special Ed. Content', weight: 80 },
        { section: 'Inclusive Practices', weight: 40 }
    ]
};


// Suggestions extracted from the PDF syllabus content
export const SYLLABUS_TOPICS: Record<string, string[]> = {
  'General Knowledge & Current Affairs': [
    'Latest Current Affairs',
    'General Knowledge',
    'International Relations'
  ],
  'Perspectives in Education': [
    'History of Education in India',
    'Teacher Empowerment',
    'Educational Concerns in Contemporary India',
    'Acts / Rights (RTE 2009, RTI 2005)',
    'National Curriculum Framework (NCF) 2005',
    'National Education Policy (NEP) 2020',
    'Inclusive Education'
  ],
  'Educational Psychology': [
    'Development of Child',
    'Understanding Learning',
    'Pedagogical Concerns',
    'Individual Differences',
    'Personality',
    'Mental Health & Adjustment'
  ],
  'Classroom Implications of Educational Psychology': [
    'Individual Differences',
    'Learning Theories',
    'Personality & Assessment'
  ],
  'Language-I (Optional)': [
    'Reading Comprehension',
    'Vocabulary',
    'Grammar',
    'Methodology'
  ],
  'Language-II (English)': [
    'Poets, Essayists, Novelists',
    'Parts of Speech',
    'Tenses & Voice',
    'Articles & Prepositions',
    'Degrees of Comparison',
    'Clauses',
    'Methodology of Teaching English'
  ],
  'Mathematics': [
    'Number System',
    'Arithmetic',
    'Geometry',
    'Mensuration',
    'Algebra',
    'Statistics & Probability',
    'Trigonometry',
    'Coordinate Geometry',
    'Calculus (Intermediate Level)'
  ],
  'Physical Science': [
    'Measurement',
    'Motion',
    'Force, Friction & Pressure',
    'Work, Energy, Power',
    'Heat & Light',
    'Electricity & Magnetism',
    'Structure of Atom',
    'Chemical Bonding',
    'Carbon & its Compounds',
    'Metallurgy'
  ],
  'Biological Science': [
    'Living World',
    'Life Processes',
    'Transportation & Excretion',
    'Coordination',
    'Reproduction',
    'Heredity & Evolution',
    'Ecology & Environment',
    'Cell Biology',
    'Botany & Zoology (Intermediate Level)'
  ],
  'Social Studies': [
    'Diversity on the Earth',
    'Production Exchange and Livelihoods',
    'Political Systems and Governance',
    'Social Organization and Inequities',
    'Religion and Society',
    'Culture and Communication',
    'Disaster Management'
  ],
  'Physical Education Content': [
    'History of Physical Education',
    'Anatomy & Physiology',
    'Kinesiology & Biomechanics',
    'Health Education',
    'Yoga',
    'Sports Training',
    'Officiating and Coaching',
    'Sports Management'
  ],
  'School Administration & Management': [
    'Institutional Planning',
    'Leadership Qualities',
    'School Organization',
    'Monitoring & Supervision'
  ],
  'Commerce': [
    'Business Studies & Management',
    'Financial Accounting',
    'Financial Statement Analysis',
    'Business Services'
  ],
  'Economics': [
    'Consumer Behaviour',
    'Production & Cost',
    'Market Structures',
    'National Income',
    'Money & Banking',
    'Indian Economy'
  ],
  'Civics': [
    'Concepts & Theories (State, Law, Liberty)',
    'Indian Government & Policies',
    'Indian Constitution',
    'Local Government',
    'Political Thought'
  ],
  'Special Education Content': [
    'Visual Impairment',
    'Hearing Impairment',
    'Mental Retardation / Intellectual Disability',
    'Learning Disabilities',
    'Autism Spectrum Disorder',
    'Rights of Persons with Disabilities Act, 2016'
  ],
  'Inclusive Education Practices': [
    'Curriculum Adaptation',
    'Assistive Devices & Technology',
    'Teaching Strategies for Special Needs',
    'Evaluation in Inclusive Setting'
  ]
};