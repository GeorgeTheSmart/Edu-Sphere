'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef, type MouseEvent as ReactMouseEvent, type WheelEvent as ReactWheelEvent } from 'react';
import { BookOpen, Clock, Users, Star, Play, FileText, ExternalLink, Layers, ClipboardList, CheckCircle, ChevronRight, ChevronLeft, ChevronDown, Sparkles, HelpCircle, ListChecks, Network, Loader2, Upload } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';

/** Nested course shape from POST /course/create or GET /course/:id/view */
interface BackendLesson {
  id: string;
  title: string;
  duration_minutes: number;
  content: string;
}

interface BackendQuiz {
  id: string;
  type: string;
  question: string;
  options: string[];
  answer: string;
  weight: number;
}

interface BackendProject {
  id: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  estimated_hours: number;
}

interface BackendModule {
  id: string;
  title: string;
  goal: string;
  estimated_hours: number;
  lessons: BackendLesson[];
  quizzes: BackendQuiz[];
  project?: BackendProject;
}

interface BackendCourse {
  id: string;
  user_id: string;
  title: string;
  description: string;
  estimated_duration: number;
  modules: BackendModule[];
}

/** Unified shape for the detail UI (mock + API) */
interface DisplayCourse {
  id: string;
  title: string;
  description: string;
  overview: string;
  image?: string;
  rating: number;
  students: number;
  duration: string;
  level: string;
  category: string;
  instructor: string;
  /** Flat lesson titles for overview snippets / fallback curriculum */
  lessons: string[];
  modules?: BackendModule[];
  resources: { name: string; link: string }[];
}

interface FlashcardItem {
  question: string;
  answer: string;
}

interface QuizItem {
  question: string;
  options: string[];
  answer?: string;
}

interface ActivityItem {
  title: string;
  type?: string;
  materials?: string[];
  instructions?: string;
  learning_outcome?: string;
}

interface MindmapNode {
  name: string;
  children?: MindmapNode[];
}

interface ParsedContentSection {
  title: string;
  body: string;
}

function CodeSnippet({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlight = (text: string) => {
    const tokens = [];
    const regex = /((?:#|\/\/).*?$)|(["'](?:(?=(\\?))\3.)*?\2)|(\b(?:def|class|if|else|elif|for|while|return|import|from|as|try|except|with|pass|break|continue|let|const|var|function|async|await|switch|case|true|false|None|null|undefined)\b)|(\b(?:print|console|log|len|range|map|filter|str|int|float)\b)|(\b\d+(?:\.\d+)?\b)/gm;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      const [fullMatch, comment, str, keyword, builtin, number] = match;
      if (comment) tokens.push(<span key={`tok-${match.index}`} className="text-[#6A9955] italic">{fullMatch}</span>);
      else if (str) tokens.push(<span key={`tok-${match.index}`} className="text-[#CE9178]">{fullMatch}</span>);
      else if (keyword) tokens.push(<span key={`tok-${match.index}`} className="text-[#C586C0] font-medium">{fullMatch}</span>);
      else if (builtin) tokens.push(<span key={`tok-${match.index}`} className="text-[#DCDCAA]">{fullMatch}</span>);
      else if (number) tokens.push(<span key={`tok-${match.index}`} className="text-[#B5CEA8]">{fullMatch}</span>);

      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      tokens.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }
    return tokens;
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden shadow-sm border border-slate-700 bg-[#1e1e1e]">
      <div className="flex items-center justify-between bg-[#2d2d2d] text-slate-300 text-xs px-4 py-2 border-b border-slate-700 font-mono">
        <span>{lang || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none"
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardList className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[#D4D4D4] font-mono text-sm leading-relaxed whitespace-pre" tabIndex={0}>
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}

function isBackendCoursePayload(x: unknown): x is BackendCourse {
  return (
    typeof x === 'object' &&
    x !== null &&
    'modules' in x &&
    Array.isArray((x as BackendCourse).modules) &&
    (typeof (x as BackendCourse).title === 'string' ||
      typeof (x as Record<string,unknown>).id === 'string')
  );
}

function normalizeApiCourse(raw: unknown): DisplayCourse | null {
  if (!raw || typeof raw !== 'object') return null;

  let payload = raw as Record<string, unknown>;

  // Unwrap {success: true, course: {...}}
  if (payload.success === true && payload.course && typeof payload.course === 'object') {
    payload = payload.course as Record<string, unknown>;
  }

  // Also handle root-level responses that have modules directly
  if (!isBackendCoursePayload(payload)) {
    // Try to get title from course_id responses
    if (!Array.isArray((payload as any).modules) || (payload as any).modules.length === 0) {
      return null;
    }
  }

  // Ensure we have a title
  const title = String(payload.title ?? payload.course_id ?? 'Untitled Course');
  const id = String(payload.id ?? payload.course_id ?? '');
  const description = String(payload.description ?? '');
  const estimated_duration = Number(payload.estimated_duration ?? payload.total_hours ?? 0);
  const rawModules = Array.isArray(payload.modules) ? payload.modules : [];

  // Normalize modules to ensure they always have the expected shape
  const modules: BackendModule[] = rawModules.map((m: any, mi: number) => ({
    id: String(m.id ?? `module-${mi}`),
    title: String(m.title ?? `Module ${mi + 1}`),
    goal: String(m.goal ?? m.description ?? ''),
    estimated_hours: Number(m.estimated_hours ?? 1),
    lessons: Array.isArray(m.lessons)
      ? m.lessons.map((l: any, li: number) => ({
          id: String(l.id ?? `lesson-${mi}-${li}`),
          title: String(l.title ?? `Lesson ${li + 1}`),
          duration_minutes: Number(l.duration_minutes ?? 30),
          content: String(l.content ?? ''),
        }))
      : [],
    quizzes: Array.isArray(m.quizzes)
      ? m.quizzes
      : Array.isArray(m.puzzles)
      ? m.puzzles
      : [],
    project: m.project ?? undefined,
  }));

  const flatLessonTitles = modules.flatMap((m) =>
    m.lessons.map((l) => `${m.title}: ${l.title}`)
  );

  const resourceRows: { name: string; link: string }[] = [];
  modules.forEach((m, mi) => {
    m.project?.requirements?.forEach((req) => {
      resourceRows.push({ name: `Module ${mi + 1} — ${req}`, link: '#' });
    });
  });

  return {
    id,
    title,
    description,
    overview: description,
    rating: 4.9,
    students: 1,
    duration: `${estimated_duration} hours`,
    level: 'Structured path',
    category: 'AI & Data Science',
    instructor: 'LearnSphere AI',
    lessons: flatLessonTitles.length ? flatLessonTitles : [description.slice(0, 120) + '…'],
    modules,
    resources: resourceRows.length
      ? resourceRows
      : [{ name: 'Course materials', link: '#' }],
  };
}

// Mock data - replace with your actual courses data
const courses = [
  {
    id: '1',
    title: 'Advanced React Development',
    description: 'Master advanced React concepts and build production-ready applications',
    overview:
      "This comprehensive course covers advanced React patterns, performance optimization, state management, and modern development practices. You'll learn to build scalable applications using the latest React features and best practices.",
    instructor: 'Sarah Johnson',
    rating: 4.8,
    students: 1240,
    duration: '12 hours',
    level: 'Advanced',
    category: 'Web Development',
    image:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    lessons: [
      'Advanced React Hooks and Custom Hooks',
      'Context API and State Management',
      'Performance Optimization Techniques',
      'Server-Side Rendering with Next.js',
      'Testing React Applications',
      'Deployment and CI/CD Pipeline',
    ],
    resources: [
      { name: 'React Documentation', link: 'https://react.dev' },
      {
        name: 'Course GitHub Repository',
        link: 'https://github.com/example/react-course',
      },
      {
        name: 'Supplementary Reading Materials',
        link: 'https://example.com/reading',
      },
      {
        name: 'Community Discord Server',
        link: 'https://discord.gg/example',
      },
    ],
  },
  {
    id: '2',
    title: 'React for Beginners',
    description:
      'Learn the fundamentals of React and start building interactive user interfaces.',
    overview:
      "This beginner-friendly course introduces you to React's core concepts, including components, props, state, and event handling. You will build your first React application step-by-step and gain confidence in creating dynamic web apps.",
    instructor: 'Michael Brown',
    rating: 4.6,
    students: 2100,
    duration: '8 hours',
    level: 'Beginner',
    category: 'Web Development',
    image:
      'https://images.unsplash.com/photo-1581276879432-15a19d654956?w=800&h=400&fit=crop',
    lessons: [
      'Introduction to React',
      'Creating Components',
      'Props and State Basics',
      'Handling Events',
      'Conditional Rendering',
      'Project: Simple To-Do App',
    ],
    resources: [
      { name: 'React Official Docs', link: 'https://react.dev' },
      {
        name: 'Beginner React GitHub Repo',
        link: 'https://github.com/example/react-beginner',
      },
      { name: 'JavaScript Basics Guide', link: 'https://example.com/js-basics' },
    ],
  },
  {
    id: '3',
    title: 'Tailwind CSS Mastery',
    description:
      'Master utility-first CSS with Tailwind and build modern, responsive designs.',
    overview:
      'This course will teach you everything from Tailwind basics to advanced responsive design, animations, and component styling. Learn to create professional-looking websites with minimal custom CSS.',
    instructor: 'Emma Wilson',
    rating: 4.9,
    students: 1560,
    duration: '6 hours',
    level: 'Intermediate',
    category: 'UI/UX Design',
    image:
      'https://images.unsplash.com/photo-1504691342899-9d7eea6fcf38?w=800&h=400&fit=crop',
    lessons: [
      'Getting Started with Tailwind',
      'Responsive Design Principles',
      'Flexbox and Grid Layouts',
      'Customizing Themes',
      'Animations and Transitions',
      'Building a Landing Page',
    ],
    resources: [
      { name: 'Tailwind Documentation', link: 'https://tailwindcss.com/docs' },
      {
        name: 'Tailwind UI Kit',
        link: 'https://tailwindui.com/',
      },
      {
        name: 'Component Examples',
        link: 'https://tailwindcomponents.com/',
      },
    ],
  },
  {
    id: '4',
    title: 'Node.js Backend Development',
    description:
      'Learn to build scalable backend applications with Node.js and Express.',
    overview:
      'This course covers the essentials of backend development using Node.js. You will learn how to set up servers, create REST APIs, manage databases, and implement authentication.',
    instructor: 'David Martinez',
    rating: 4.7,
    students: 1800,
    duration: '10 hours',
    level: 'Intermediate',
    category: 'Backend Development',
    image:
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=400&fit=crop',
    lessons: [
      'Introduction to Node.js',
      'Setting Up Express Server',
      'Routing and Middleware',
      'Working with Databases',
      'User Authentication',
      'Deploying Node.js Apps',
    ],
    resources: [
      { name: 'Node.js Docs', link: 'https://nodejs.org/en/docs/' },
      { name: 'Express Docs', link: 'https://expressjs.com/' },
      {
        name: 'Backend Project Repository',
        link: 'https://github.com/example/node-backend',
      },
    ],
  },
  {
    id: '5',
    title: 'Python for Data Science',
    description:
      'Learn Python programming and its powerful libraries for data analysis and visualization.',
    overview:
      'This course will take you from Python basics to data analysis and visualization using libraries like Pandas, NumPy, and Matplotlib. You will work on real datasets to develop your skills.',
    instructor: 'Sophia Lee',
    rating: 4.8,
    students: 2300,
    duration: '14 hours',
    level: 'Beginner to Intermediate',
    category: 'Data Science',
    image:
      'https://images.unsplash.com/photo-1581090700227-4c4f50b0ec5a?w=800&h=400&fit=crop',
    lessons: [
      'Python Basics',
      'Working with Data in Pandas',
      'Numerical Computing with NumPy',
      'Data Visualization with Matplotlib',
      'Exploratory Data Analysis',
      'Mini Project: Data Insights Dashboard',
    ],
    resources: [
      { name: 'Python Docs', link: 'https://docs.python.org/3/' },
      { name: 'Pandas Docs', link: 'https://pandas.pydata.org/docs/' },
      { name: 'NumPy Docs', link: 'https://numpy.org/doc/' },
    ],
  },
];

function mockToDisplay(c: (typeof courses)[0]): DisplayCourse {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    overview: c.overview,
    image: c.image,
    rating: c.rating,
    students: c.students,
    duration: c.duration,
    level: c.level,
    category: c.category,
    instructor: c.instructor,
    lessons: c.lessons,
    resources: c.resources,
  };
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [displayCourse, setDisplayCourse] = useState<DisplayCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeLearningTab, setActiveLearningTab] = useState<'content' | 'flashcards' | 'quiz' | 'activities' | 'mindmap'>('content');
  const [sectionLoading, setSectionLoading] = useState<Record<string, boolean>>({});
  const [sectionErrors, setSectionErrors] = useState<Record<string, string | null>>({});
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [mindmapRoot, setMindmapRoot] = useState<MindmapNode | null>(null);
  const [openMindmapNodes, setOpenMindmapNodes] = useState<Record<string, boolean>>({});
  const [revealedFlashcards, setRevealedFlashcards] = useState<Record<number, boolean>>({});
  const [quizSelections, setQuizSelections] = useState<Record<number, number>>({});
  const [highlightLearningTools, setHighlightLearningTools] = useState(false);
  const [mindmapZoom, setMindmapZoom] = useState(1);
  const [mindmapOffset, setMindmapOffset] = useState({ x: 0, y: 0 });
  const [isPanningMindmap, setIsPanningMindmap] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const mindmapViewportRef = useRef<HTMLDivElement | null>(null);
  const [projectUploads, setProjectUploads] = useState<Record<string, { name: string; size: number }>>({}); // moduleId -> file info
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const sid = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
    if (sid) {
      try {
        const stored = localStorage.getItem(`learnsphere_progress_${sid}`);
        if (stored) {
          setCompletedLessons(new Set(JSON.parse(stored)));
        }
      } catch {}
      try {
        const storedUploads = localStorage.getItem(`learnsphere_project_uploads_${sid}`);
        if (storedUploads) setProjectUploads(JSON.parse(storedUploads));
      } catch {}
      try {
        const storedSections = localStorage.getItem(`learnsphere_sections_${sid}`);
        if (storedSections) setCompletedSections(JSON.parse(storedSections));
      } catch {}
    }
  }, [id]);

  useEffect(() => {
    const sid = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
    if (!sid) {
      setLoading(false);
      return;
    }

    // --- Stale-while-revalidate ---
    // 1. Show cached data immediately so there is no blank loading screen.
    // 2. ALWAYS fetch from the API to get the authoritative AI-generated content.
    // 3. Update the display (and cache) with whatever the API returns.
    //    This ensures the offline-fallback course is replaced as soon as the
    //    real content arrives from the backend.

    let hasCached = false;
    try {
      const cached = localStorage.getItem(`learnsphere_course_${sid}`);
      if (cached) {
        const parsed = JSON.parse(cached) as unknown;
        const normalized = normalizeApiCourse(parsed);
        if (normalized) {
          setDisplayCourse(normalized);
          setLoading(false); // show cached UI instantly
          hasCached = true;
        }
      }
    } catch {
      /* continue to fetch */
    }

    // Always hit the API – this is the source of truth for module content
    apiFetch(`/course/${sid}/view`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.detail) {
          const normalized = normalizeApiCourse(data);
          if (normalized) {
            setDisplayCourse(normalized); // replace cached/offline content
            try {
              const raw =
                data && typeof data === 'object' && 'course' in data && (data as { course?: unknown }).course
                  ? (data as { course: unknown }).course
                  : data;
              localStorage.setItem(`learnsphere_course_${sid}`, JSON.stringify(raw));
            } catch {
              /* ignore */
            }
          } else if (!hasCached) {
            setDisplayCourse(null);
          }
        } else if (!hasCached) {
          setDisplayCourse(null);
        }
        setLoading(false);
      })
      .catch(() => {
        // API failed — keep showing the cached version if we have one
        if (!hasCached) setDisplayCourse(null);
        setLoading(false);
      });
  }, [id]);

  const idStr = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const mockMatch = courses.find((c) => c.id === idStr);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading course...</p>
      </div>
    );
  }

  const course: DisplayCourse | null =
    displayCourse ?? (mockMatch ? mockToDisplay(mockMatch) : null);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  /** Recalculate overall progress from all completion criteria.
   *  Weights:
   *    Lessons (play buttons):      20%  — supplementary, NOT sufficient alone
   *    Content viewed:              20%  — MANDATORY
   *    Activities viewed:           20%  — MANDATORY
   *    Project .zip uploaded:       20%  — MANDATORY
   *    Flashcards viewed:            7%
   *    Quiz viewed:                  7%
   *    Mindmap viewed:               6%
   */
  const recalcProgress = (
    lessonArr: string[],
    sections: Record<string, boolean>,
    uploads: Record<string, { name: string; size: number }>
  ) => {
    // 1. Lesson completion (20%)
    let totalLessons = 0;
    if (course?.modules?.length) {
      totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    } else if (course?.lessons) {
      totalLessons = course.lessons.length;
    }
    const lessonPct = totalLessons > 0 ? (lessonArr.length / totalLessons) : 0;

    // 2. Mandatory sections
    const contentDone = sections['content'] ? 1 : 0;
    const activitiesDone = sections['activities'] ? 1 : 0;

    // 3. Bonus sections
    const flashcardsDone = sections['flashcards'] ? 1 : 0;
    const quizDone = sections['quiz'] ? 1 : 0;
    const mindmapDone = sections['mindmap'] ? 1 : 0;

    // 4. Project uploads (20%) — MANDATORY
    let projectTotal = 0;
    let projectDone = 0;
    if (course?.modules?.length) {
      course.modules.forEach((m) => {
        if (m.project) {
          projectTotal++;
          if (uploads[m.id]) projectDone++;
        }
      });
    }
    const projectPct = projectTotal > 0 ? (projectDone / projectTotal) : 1;

    const overallPct = Math.round(
      lessonPct * 20 +
      contentDone * 20 +
      activitiesDone * 20 +
      projectPct * 20 +
      flashcardsDone * 7 +
      quizDone * 7 +
      mindmapDone * 6
    );
    localStorage.setItem(`learnsphere_progress_pct_${idStr}`, String(overallPct));
    return overallPct;
  };

  const markSectionComplete = (section: string) => {
    setCompletedSections((prev) => {
      const next = { ...prev, [section]: true };
      localStorage.setItem(`learnsphere_sections_${idStr}`, JSON.stringify(next));
      recalcProgress(Array.from(completedLessons), next, projectUploads);
      return next;
    });
  };

  const handleProjectUpload = (moduleId: string, file: File) => {
    if (!file.name.endsWith('.zip')) {
      alert('Please upload a .zip file only.');
      return;
    }
    setProjectUploads((prev) => {
      const next = { ...prev, [moduleId]: { name: file.name, size: file.size } };
      localStorage.setItem(`learnsphere_project_uploads_${idStr}`, JSON.stringify(next));
      recalcProgress(Array.from(completedLessons), completedSections, next);
      return next;
    });
  };

  const removeProjectUpload = (moduleId: string) => {
    setProjectUploads((prev) => {
      const next = { ...prev };
      delete next[moduleId];
      localStorage.setItem(`learnsphere_project_uploads_${idStr}`, JSON.stringify(next));
      recalcProgress(Array.from(completedLessons), completedSections, next);
      return next;
    });
  };

  const toggleLesson = (lessonId: string) => {
    setCompletedLessons(prev => {
      const next = new Set(prev);
      const isCompleted = !next.has(lessonId);
      if (!isCompleted) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      
      const arr = Array.from(next);
      localStorage.setItem(`learnsphere_progress_${idStr}`, JSON.stringify(arr));
      recalcProgress(arr, completedSections, projectUploads);

      const userId = localStorage.getItem("userId");
      if (userId && isCompleted) {
        apiFetch("/update-level", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            lesson_id: lessonId,
            course_id: idStr,
            score: 100
          })
        }).catch(() => {});
      }

      return next;
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'lessons', label: 'Curriculum', icon: Play },
    { id: 'resources', label: 'Resources', icon: FileText }
  ];

  const learningTabs: { id: 'content' | 'flashcards' | 'quiz' | 'activities' | 'mindmap'; label: string; icon: typeof BookOpen }[] = [
    { id: 'content', label: 'Content', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Sparkles },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    { id: 'activities', label: 'Activities', icon: ListChecks },
    { id: 'mindmap', label: 'Mindmap', icon: Network },
  ];

  const ensureSectionData = async (section: 'flashcards' | 'quiz' | 'activities' | 'mindmap') => {
    const alreadyLoaded =
      (section === 'flashcards' && flashcards.length > 0) ||
      (section === 'quiz' && quizItems.length > 0) ||
      (section === 'activities' && activities.length > 0) ||
      (section === 'mindmap' && !!mindmapRoot);
    if (alreadyLoaded) return;

    const endpointMap = {
      flashcards: '/learning/generate-flashcards',
      quiz: '/learning/generate-quiz',
      activities: '/learning/generate-activities',
      mindmap: '/learning/generate-mindmap',
    } as const;

    setSectionLoading((prev) => ({ ...prev, [section]: true }));
    setSectionErrors((prev) => ({ ...prev, [section]: null }));
    try {
      const response = await apiFetch(endpointMap[section], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: course.title,
          level: 'beginner',
        }),
      });
      const text = await response.text();
      const payload = text ? JSON.parse(text) : {};
      if (!response.ok) {
        const msg = payload?.detail ? String(payload.detail) : `Failed (${response.status})`;
        throw new Error(msg);
      }

      if (section === 'flashcards') {
        const cards = payload?.data?.flashcards;
        setFlashcards(Array.isArray(cards) ? cards : []);
      } else if (section === 'quiz') {
        const q = payload?.data?.quiz;
        setQuizItems(Array.isArray(q) ? q : []);
      } else if (section === 'activities') {
        const a = payload?.data?.activities;
        setActivities(Array.isArray(a) ? a : []);
      } else if (section === 'mindmap') {
        const root = payload?.data?.mindmap;
        if (root && typeof root === 'object' && typeof root.name === 'string') {
          setMindmapRoot(root as MindmapNode);
          setOpenMindmapNodes({ [root.name]: true });
          setMindmapZoom(1);
          setMindmapOffset({ x: 0, y: 0 });
        } else {
          setMindmapRoot(null);
        }
      }
    } catch (e) {
      setSectionErrors((prev) => ({
        ...prev,
        [section]: e instanceof Error ? e.message : 'Failed to generate section',
      }));
    } finally {
      setSectionLoading((prev) => ({ ...prev, [section]: false }));
    }
  };

  const handleLearningTabClick = (tab: 'content' | 'flashcards' | 'quiz' | 'activities' | 'mindmap') => {
    setActiveLearningTab(tab);
    if (tab !== 'content') {
      void ensureSectionData(tab);
    }
    // Mark this section as visited/completed for progress tracking
    if (!completedSections[tab]) {
      markSectionComplete(tab);
    }
  };

  const handleStartLearningClick = () => {
    setActiveTab('lessons');
    setActiveLearningTab('content');
    setHighlightLearningTools(true);

    window.setTimeout(() => {
      const el = document.getElementById('learning-tools-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    window.setTimeout(() => {
      setHighlightLearningTools(false);
    }, 1800);
  };

  const getMindmapNodePaths = (node: MindmapNode, basePath: string): string[] => {
    const paths = [basePath];
    (node.children ?? []).forEach((child, i) => {
      paths.push(...getMindmapNodePaths(child, `${basePath}.${i}.${child.name}`));
    });
    return paths;
  };

  const setMindmapZoomClamped = (value: number) => {
    const clamped = Math.max(0.6, Math.min(2.2, value));
    setMindmapZoom(clamped);
  };

  const handleMindmapMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsPanningMindmap(true);
    setPanStart({ x: e.clientX - mindmapOffset.x, y: e.clientY - mindmapOffset.y });
  };

  const handleMindmapMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isPanningMindmap) return;
    setMindmapOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const stopMindmapPanning = () => {
    setIsPanningMindmap(false);
  };

  const handleMindmapWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setMindmapZoomClamped(mindmapZoom + delta);
  };

  const renderMindmapNode = (node: MindmapNode, nodePath: string, depth = 0) => {
    const children = Array.isArray(node.children) ? node.children : [];
    const hasChildren = children.length > 0;
    const isOpen = !!openMindmapNodes[nodePath];

    return (
      <div key={nodePath} className="flex items-center gap-0 select-none shrink-0 w-max h-max">
        <div className="relative flex items-center shrink-0">
          {/* Node Block */}
          <div
            className={`min-w-[180px] w-max max-w-[320px] z-10 shrink-0 flex items-center px-4 py-3 rounded-lg shadow-sm border ${
              depth === 0
                ? 'bg-[#4b5066] border-slate-500 text-slate-100 font-semibold'
                : 'bg-[#3b4053] border-slate-600 text-slate-200 font-medium'
            }`}
          >
            <span className="text-sm leading-snug">{node.name}</span>
          </div>

          {/* Expand/Collapse Button (positioned perfectly on the right edge) */}
          {hasChildren && (
            <div className="absolute right-0 translate-x-1/2 z-20">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() =>
                  setOpenMindmapNodes((prev) => ({
                    ...prev,
                    [nodePath]: !prev[nodePath],
                  }))
                }
                className="w-6 h-6 flex items-center justify-center rounded-full bg-[#34384a] border border-slate-500 text-slate-300 hover:text-white hover:bg-[#404559] transition-colors"
                aria-label={isOpen ? 'Collapse node' : 'Expand node'}
              >
                {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {hasChildren && isOpen && (
          <div className="relative pl-12 flex flex-col py-1">
            {/* Horizontal line extending from the button to the Trunk */}
            <div className="absolute left-0 top-1/2 w-6 h-[2px] bg-[#718096] -translate-y-1/2" />

            {children.map((child, i) => {
              const isFirst = i === 0;
              const isLast = i === children.length - 1;
              const isOnly = children.length === 1;

              return (
                <div key={`${nodePath}.${i}.${child.name}`} className="relative flex items-center py-2">
                  {!isOnly && isFirst && (
                    <div className="absolute -left-6 top-1/2 w-6 h-1/2 border-t-[2px] border-l-[2px] border-[#718096] rounded-tl-xl" />
                  )}
                  {!isOnly && isLast && (
                    <div className="absolute -left-6 bottom-1/2 w-6 h-1/2 border-b-[2px] border-l-[2px] border-[#718096] rounded-bl-xl" />
                  )}
                  {!isOnly && !isFirst && !isLast && (
                    <>
                      <div className="absolute -left-6 top-0 w-[2px] h-full bg-[#718096]" />
                      <div className="absolute -left-6 top-1/2 w-6 h-[2px] bg-[#718096] -translate-y-1/2" />
                    </>
                  )}
                  {isOnly && (
                    <div className="absolute -left-6 top-1/2 w-6 h-[2px] bg-[#718096] -translate-y-1/2" />
                  )}

                  {renderMindmapNode(child, `${nodePath}.${i}.${child.name}`, depth + 1)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const parseLessonContent = (content: string): ParsedContentSection[] => {
    if (!content?.trim()) return [];
    const lines = content.split('\n');
    const sections: ParsedContentSection[] = [];
    let currentTitle = 'Overview';
    let currentBody: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('###')) {
        if (currentBody.length > 0) {
          sections.push({ title: currentTitle, body: currentBody.join('\n').trim() });
          currentBody = [];
        }
        currentTitle = trimmed.replace(/^#{1,6}\s*/, '') || 'Section';
      } else {
        currentBody.push(line);
      }
    });

    if (currentBody.length > 0) {
      sections.push({ title: currentTitle, body: currentBody.join('\n').trim() });
    }

    return sections.filter((s) => s.body.length > 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Course Image */}
              <div className="lg:col-span-1">
                <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg relative">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white/95">
                      <span className="text-lg font-semibold leading-snug">{course.title}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Info */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-3">
                    {course.category}
                  </span>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{course.title}</h1>
                  <p className="text-lg text-gray-600 mb-6">{course.description}</p>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{course.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{course.level}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {course.instructor
                        .split(' ')
                        .filter(Boolean)
                        .map((n: string) => n[0])
                        .join('') || 'LS'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instructor</p>
                    <p className="font-medium text-gray-900">{course.instructor}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartLearningClick}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Learning</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Tools Section */}
      <div id="learning-tools-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-500 ${
            highlightLearningTools ? 'border-indigo-400 ring-4 ring-indigo-100' : 'border-gray-200'
          }`}
        >
          <div className="px-6 pt-6">
            <h2 className="text-2xl font-bold text-gray-900">Learning Tools</h2>
            <p className="text-sm text-gray-600 mt-1">
              Explore content, generate flashcards, quiz yourself, practice with activities, and expand the mindmap.
            </p>
          </div>
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {learningTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeLearningTab === tab.id;
                const done = !!completedSections[tab.id];
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleLearningTabClick(tab.id)}
                    className={`relative rounded-xl border px-3 py-3 text-sm font-medium flex items-center justify-center gap-2 transition ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {done && (
                      <CheckCircle className={`w-3.5 h-3.5 ${active ? 'text-emerald-300' : 'text-emerald-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeLearningTab === 'content' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
                {course.modules?.length ? (
                  <div className="space-y-4">
                    {course.modules.map((mod, i) => (
                      <div key={mod.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <p className="font-semibold text-gray-900">Module {i + 1}: {mod.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{mod.goal}</p>
                        </div>
                        <div className="p-4 space-y-3">
                          {mod.lessons.map((lesson) => (
                            <div key={lesson.id} className="rounded-lg border border-gray-100 bg-white p-3">
                              <p className="font-medium text-gray-900">{lesson.title}</p>
                              <p className="text-sm text-gray-500 mb-1">{lesson.duration_minutes} min</p>
                              {(() => {
                                const sections = parseLessonContent(lesson.content ?? '');
                                if (sections.length === 0) {
                                  return <p className="text-sm text-gray-700 leading-relaxed">{lesson.content}</p>;
                                }
                                return (
                                  <div className="mt-3 grid gap-3">
                                    {sections.map((section, sectionIdx) => (
                                      <div
                                        key={`${lesson.id}-section-${sectionIdx}`}
                                        className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-4"
                                      >
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
                                          <h5 className="text-sm font-semibold text-indigo-900">{section.title}</h5>
                                        </div>
                                        <div className="text-sm leading-7 text-gray-700">
                                          {!section.body.includes('```') ? (
                                            <span className="whitespace-pre-wrap">{section.body}</span>
                                          ) : (
                                            section.body.split('```').map((part, pIdx) => {
                                              if (pIdx % 2 !== 0) {
                                                const firstNewline = part.indexOf('\n');
                                                const lang = firstNewline !== -1 ? part.substring(0, firstNewline).trim() : '';
                                                const code = firstNewline !== -1 ? part.substring(firstNewline + 1) : part;
                                                return <CodeSnippet key={pIdx} lang={lang} code={code} />;
                                              }
                                              return <span key={pIdx} className="whitespace-pre-wrap">{part}</span>;
                                            })
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No structured module content is available for this course yet.</p>
                )}
              </div>
            )}

            {activeLearningTab === 'flashcards' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Flashcards</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setFlashcards([]);
                      setRevealedFlashcards({});
                      void ensureSectionData('flashcards');
                    }}
                    className="text-sm px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    Regenerate
                  </button>
                </div>
                {sectionLoading.flashcards ? (
                  <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Generating flashcards...</div>
                ) : sectionErrors.flashcards ? (
                  <p className="text-red-600 text-sm">{sectionErrors.flashcards}</p>
                ) : flashcards.length === 0 ? (
                  <p className="text-gray-600">Click the Flashcards tab to generate cards for this course.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {flashcards.map((card, i) => {
                      const revealed = !!revealedFlashcards[i];
                      return (
                        <button
                          type="button"
                          key={`${card.question}-${i}`}
                          onClick={() => setRevealedFlashcards((prev) => ({ ...prev, [i]: !prev[i] }))}
                          className={`text-left rounded-2xl p-5 min-h-[220px] shadow-lg border transition-all duration-300 ${
                            revealed
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400'
                              : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white border-indigo-400 hover:-translate-y-1'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-wide font-semibold opacity-90">
                              {revealed ? 'Answer' : 'Question'}
                            </span>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Card {i + 1}</span>
                          </div>
                          <p className="font-semibold leading-relaxed">
                            {revealed ? card.answer : card.question}
                          </p>
                          <p className="mt-6 text-xs opacity-90">
                            {revealed ? 'Tap to view question' : 'Tap to reveal answer'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeLearningTab === 'quiz' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quiz</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizItems([]);
                      setQuizSelections({});
                      void ensureSectionData('quiz');
                    }}
                    className="text-sm px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    Regenerate
                  </button>
                </div>
                {sectionLoading.quiz ? (
                  <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Generating quiz...</div>
                ) : sectionErrors.quiz ? (
                  <p className="text-red-600 text-sm">{sectionErrors.quiz}</p>
                ) : quizItems.length === 0 ? (
                  <p className="text-gray-600">Click the Quiz tab to generate questions.</p>
                ) : (
                  <div className="space-y-4">
                    {quizItems.map((q, i) => (
                      <div key={`${q.question}-${i}`} className="border border-gray-200 rounded-xl p-4">
                        <p className="font-semibold text-gray-900 mb-3">{i + 1}. {q.question}</p>
                        <div className="grid gap-2">
                          {(q.options || []).map((opt, oi) => (
                            <button
                              type="button"
                              key={`${opt}-${oi}`}
                              onClick={() =>
                                setQuizSelections((prev) => ({
                                  ...prev,
                                  [i]: oi,
                                }))
                              }
                              className={`text-left rounded-lg border px-3 py-2 text-sm transition ${
                                quizSelections[i] === oi
                                  ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
                                  : 'border-gray-100 text-gray-700 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/60'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {quizSelections[i] !== undefined && q.answer ? (
                          <div className="mt-3">
                            {q.options?.[quizSelections[i]] === q.answer ? (
                              <p className="text-xs text-green-700 font-medium">Correct! Great job.</p>
                            ) : (
                              <p className="text-xs text-red-700 font-medium">
                                Not quite. Correct answer: {q.answer}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-gray-500">Pick an option to check your answer.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeLearningTab === 'activities' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setActivities([]);
                      void ensureSectionData('activities');
                    }}
                    className="text-sm px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    Regenerate
                  </button>
                </div>
                {sectionLoading.activities ? (
                  <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Generating activities...</div>
                ) : sectionErrors.activities ? (
                  <p className="text-red-600 text-sm">{sectionErrors.activities}</p>
                ) : activities.length === 0 ? (
                  <p className="text-gray-600">Click the Activities tab to generate practical tasks.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {activities.map((activity, i) => (
                      <div key={`${activity.title}-${i}`} className="rounded-xl border border-gray-200 p-4 bg-white">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="font-semibold text-gray-900">{activity.title}</p>
                          {activity.type && <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">{activity.type}</span>}
                        </div>
                        {activity.materials?.length ? (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Materials:</span> {activity.materials.join(', ')}
                          </p>
                        ) : null}
                        {activity.instructions ? (
                          <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Instructions:</span> {activity.instructions}</p>
                        ) : null}
                        {activity.learning_outcome ? (
                          <p className="text-sm text-emerald-700"><span className="font-medium">Outcome:</span> {activity.learning_outcome}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeLearningTab === 'mindmap' && (
              <div className="w-full min-w-0 max-w-full overflow-hidden relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Mindmap</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setMindmapRoot(null);
                      setOpenMindmapNodes({});
                      void ensureSectionData('mindmap');
                    }}
                    className="text-sm px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    Regenerate
                  </button>
                </div>
                {sectionLoading.mindmap ? (
                  <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Generating mindmap...</div>
                ) : sectionErrors.mindmap ? (
                  <p className="text-red-600 text-sm">{sectionErrors.mindmap}</p>
                ) : !mindmapRoot ? (
                  <p className="text-gray-600">Click the Mindmap tab to generate a concept tree.</p>
                ) : (
                  <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden w-full min-w-0">
                    <div className="flex flex-wrap gap-2 items-center justify-between px-4 py-3 border-b border-slate-700">
                      <p className="text-xs text-slate-300">Use {'>'} to expand nodes. Drag to pan. Scroll to zoom.</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMindmapZoomClamped(mindmapZoom - 0.1)}
                          className="px-2 py-1 rounded border border-slate-600 text-slate-100 hover:bg-slate-800 text-sm"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMindmapZoom(1);
                            setMindmapOffset({ x: 0, y: 0 });
                          }}
                          className="px-2 py-1 rounded border border-slate-600 text-slate-100 hover:bg-slate-800 text-xs"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => setMindmapZoomClamped(mindmapZoom + 0.1)}
                          className="px-2 py-1 rounded border border-slate-600 text-slate-100 hover:bg-slate-800 text-sm"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const allPaths = getMindmapNodePaths(mindmapRoot, mindmapRoot.name);
                            const next: Record<string, boolean> = {};
                            allPaths.forEach((p) => {
                              next[p] = true;
                            });
                            setOpenMindmapNodes(next);
                          }}
                          className="px-2 py-1 rounded border border-slate-600 text-slate-100 hover:bg-slate-800 text-xs"
                        >
                          Maximize
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenMindmapNodes({ [mindmapRoot.name]: true })}
                          className="px-2 py-1 rounded border border-slate-600 text-slate-100 hover:bg-slate-800 text-xs"
                        >
                          Minimize
                        </button>
                      </div>
                    </div>
                    <div
                      ref={mindmapViewportRef}
                      onMouseDown={handleMindmapMouseDown}
                      onMouseMove={handleMindmapMouseMove}
                      onMouseUp={stopMindmapPanning}
                      onMouseLeave={stopMindmapPanning}
                      onWheel={handleMindmapWheel}
                      className={`h-[540px] w-full relative overflow-hidden ${isPanningMindmap ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                      <div
                        className="absolute left-0 top-0 w-max h-max min-w-max min-h-max p-12 origin-top-left transition-transform duration-75"
                        style={{
                          transform: `translate(${mindmapOffset.x}px, ${mindmapOffset.y}px) scale(${mindmapZoom})`,
                        }}
                      >
                        {renderMindmapNode(mindmapRoot, mindmapRoot.name, 0)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Course</h3>
                <p className="text-gray-700 leading-relaxed">{course.overview}</p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">What You'll Learn</h4>
                    <ul className="space-y-2">
                      {course.lessons.slice(0, 3).map((lesson: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {course.modules?.length ? 'Course structure' : 'Prerequisites'}
                    </h4>
                    {course.modules?.length ? (
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {course.modules.length} modules covering lessons, quizzes, and hands-on projects
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          Estimated {course.duration} total
                        </li>
                      </ul>
                    ) : (
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          Basic React knowledge
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          JavaScript ES6+ proficiency
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          HTML & CSS fundamentals
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div>
                {course.modules?.length ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Course Curriculum</h3>
                      <span className="text-sm text-gray-500">
                        {course.modules.length} modules · {course.lessons.length} lessons
                      </span>
                    </div>
                    <div className="space-y-8">
                      {course.modules.map((mod, mi) => (
                        <div
                          key={mod.id}
                          className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
                        >
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-4 border-b border-gray-200">
                            <div className="flex items-start gap-3">
                              <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <h4 className="font-semibold text-gray-900">
                                  Module {mi + 1}: {mod.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{mod.goal}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  ~{mod.estimated_hours}h · {mod.lessons.length} lessons · {mod.quizzes.length} quizzes
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {mod.lessons.map((lesson, li) => (
                              <div key={lesson.id} className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center space-x-4 min-w-0">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium shrink-0">
                                    {li + 1}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                    <p className="text-sm text-gray-500">
                                      Duration: {lesson.duration_minutes} minutes
                                    </p>
                                  </div>
                                </div>
                                <button onClick={() => toggleLesson(lesson.id)} className="focus:outline-none shrink-0 transition-colors">
                                  {completedLessons.has(lesson.id) ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                  ) : (
                                    <Play className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                          {mod.project && (
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-amber-50 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                  <ClipboardList className="w-4 h-4" />
                                  Project
                                </div>
                                {projectUploads[mod.id] && (
                                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Submitted
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mt-2">{mod.project.description}</p>
                              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="text-gray-500">Est. {mod.project.estimated_hours}h</span>
                                {(mod.project.requirements ?? []).map((req, ri) => (
                                  <span
                                    key={`${mod.id}-req-${ri}`}
                                    className="px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-700"
                                  >
                                    {req}
                                  </span>
                                ))}
                              </div>
                              {(mod.project.deliverables ?? []).length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium text-gray-600 mb-1">Deliverables:</p>
                                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                                    {mod.project.deliverables.map((d, di) => (
                                      <li key={`${mod.id}-del-${di}`}>{d}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Upload Section */}
                              <div className="mt-4 p-3 rounded-lg border-2 border-dashed border-gray-300 bg-white">
                                {!projectUploads[mod.id] ? (
                                  <label className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg py-3">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">Upload your project (.zip)</span>
                                    <span className="text-xs text-gray-500">Click to browse or drag & drop</span>
                                    <input
                                      type="file"
                                      accept=".zip,application/zip,application/x-zip-compressed"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleProjectUpload(mod.id, file);
                                        e.target.value = '';
                                      }}
                                    />
                                  </label>
                                ) : (
                                  <div className="flex items-center justify-between py-1">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-emerald-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{projectUploads[mod.id].name}</p>
                                        <p className="text-xs text-gray-500">{(projectUploads[mod.id].size / 1024).toFixed(1)} KB</p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeProjectUpload(mod.id)}
                                      className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Course Curriculum</h3>
                      <span className="text-sm text-gray-500">{course.lessons.length} lessons</span>
                    </div>
                    <div className="space-y-3">
                      {course.lessons.map((lesson: string, i: number) => (
                        <div
                          key={i}
                          className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
                        >
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                                {i + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{lesson}</h4>
                                <p className="text-sm text-gray-500">
                                  Duration: {Math.floor(Math.random() * 20 + 10)} minutes
                                </p>
                              </div>
                            </div>
                            <button onClick={() => toggleLesson(`lesson_${i}`)} className="focus:outline-none shrink-0 transition-colors">
                              {completedLessons.has(`lesson_${i}`) ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              ) : (
                                <Play className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Additional Resources</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.resources.map((resource: { name: string; link: string }, i: number) =>
                    resource.link === '#' ? (
                      <div
                        key={i}
                        className="block p-4 border border-gray-200 rounded-lg bg-gray-50/80"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{resource.name}</h4>
                              <p className="text-sm text-gray-500">From your generated course</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <a
                        key={i}
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                                {resource.name}
                              </h4>
                              <p className="text-sm text-gray-500">External Resource</p>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </div>
                      </a>
                    )
                  )}
                </div>
                
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
                  <p className="text-gray-700 mb-4">
                    Join our community of learners and get support from instructors and peers.
                  </p>
                  <button className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition-colors duration-200">
                    Join Community
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}