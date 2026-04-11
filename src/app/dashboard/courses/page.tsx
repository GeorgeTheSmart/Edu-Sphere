// src/app/dashboard/courses/page.tsx
// Enhanced courses page with improved UI/UX and scalability
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiBase';

interface Course {
  id: string | number;
  title: string;
  description: string;
  progress: number;
  category?: string;
  duration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  instructor?: string;
  thumbnail?: string;
  enrolledStudents?: number;
}

function normalizeCourseText(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getCourseNameKey(course: Course): string {
  return normalizeCourseText(course.title);
}

function getCourseContentKey(course: Course): string {
  // Prefer real id when present, but also guard against duplicate titles/descriptions
  // coming from different API sources with different ids.
  const idPart = normalizeCourseText(String(course.id));
  const titlePart = normalizeCourseText(course.title);
  const descriptionPart = normalizeCourseText(course.description);
  return `${idPart}|${titlePart}|${descriptionPart}`;
}

/** Backend shape from POST /course/create */
interface BackendCoursePayload {
  id: string;
  user_id: string;
  title: string;
  description: string;
  estimated_duration: number;
  modules?: unknown[];
}

function coerceId(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

/** Handles multiple API variants: nested course, course_id, numeric id, data.course, bare course body. */
function extractCreatedCourseFromResponse(
  raw: unknown,
  fallbackTopic: Course,
  userId: string | null
): { id: string; course: BackendCoursePayload } | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;

  const nestedData = d.data && typeof d.data === 'object' ? (d.data as Record<string, unknown>) : null;

  const courseObj =
    (d.course && typeof d.course === 'object' ? (d.course as Record<string, unknown>) : null) ??
    (nestedData?.course && typeof nestedData.course === 'object'
      ? (nestedData.course as Record<string, unknown>)
      : null);

  const topCourseId = coerceId(d.course_id ?? d.courseId ?? nestedData?.course_id);

  if (courseObj) {
    const innerId = coerceId(
      courseObj.id ?? courseObj.course_id ?? (courseObj as { courseId?: unknown }).courseId
    );
    const id = innerId ?? topCourseId;
    if (id) {
      const est = courseObj.estimated_duration;
      const hours =
        typeof est === 'number' && !Number.isNaN(est)
          ? est
          : typeof est === 'string'
            ? parseFloat(est)
            : NaN;
      return {
        id,
        course: {
          id,
          user_id: coerceId(courseObj.user_id ?? d.user_id ?? userId) ?? '',
          title: String(courseObj.title ?? fallbackTopic.title),
          description: String(courseObj.description ?? fallbackTopic.description),
          estimated_duration: Number.isFinite(hours) ? hours : 12,
          modules: Array.isArray(courseObj.modules) ? courseObj.modules : undefined,
        },
      };
    }
  }

  if (topCourseId) {
    return {
      id: topCourseId,
      course: {
        id: topCourseId,
        user_id: coerceId(d.user_id ?? userId) ?? '',
        title: typeof d.title === 'string' ? d.title : fallbackTopic.title,
        description: typeof d.description === 'string' ? d.description : fallbackTopic.description,
        estimated_duration: typeof d.total_hours === 'number' ? d.total_hours : 12,
        modules: Array.isArray(d.modules) ? d.modules : undefined,
      },
    };
  }

  // Some APIs return the course as the root object (no wrapper).
  if (typeof d.title === 'string' && (d.modules !== undefined || d.id !== undefined || d.course_id !== undefined)) {
    const id = coerceId(d.id ?? d.course_id ?? (d as { courseId?: unknown }).courseId);
    if (id) {
      const est = d.estimated_duration;
      const hours =
        typeof est === 'number' && !Number.isNaN(est)
          ? est
          : typeof est === 'string'
            ? parseFloat(est)
            : NaN;
      return {
        id,
        course: {
          id,
          user_id: coerceId(d.user_id ?? userId) ?? '',
          title: String(d.title),
          description: String(d.description ?? fallbackTopic.description),
          estimated_duration: Number.isFinite(hours) ? hours : 12,
          modules: Array.isArray(d.modules) ? d.modules : undefined,
        },
      };
    }
  }

  return null;
}

function mapBackendCourseToCard(c: BackendCoursePayload): Course {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    progress: 0,
    category: 'AI & Data Science',
    duration: `${c.estimated_duration} hours`,
    difficulty: 'Intermediate',
    instructor: 'LearnSphere AI',
    enrolledStudents: 0,
  };
}

function mapDashboardCourseLikeAnyToCard(c: any): Course | null {
  const id = coerceId(c?.id ?? c?.course_id ?? c?.course?.id);
  if (!id) return null;

  const estimatedDuration = c?.estimated_duration ?? c?.estimatedDuration ?? c?.estimated_hours ?? c?.estimatedHours;
  const duration =
    typeof estimatedDuration === "number" && Number.isFinite(estimatedDuration)
      ? `${estimatedDuration} hours`
      : c?.duration
        ? String(c.duration)
        : "";

  return {
    id,
    title: String(c?.title ?? c?.name ?? "Untitled course"),
    description: String(c?.description ?? ""),
    progress: typeof c?.progress === "number" ? c.progress : 0,
    category: c?.category ? String(c.category) : "AI & Data Science",
    duration: duration || "—",
    difficulty: c?.difficulty ? String(c.difficulty) : c?.level ? String(c.level) : "Intermediate",
    instructor: c?.instructor ? String(c.instructor) : "LearnSphere AI",
    enrolledStudents:
      typeof c?.enrolled_students === "number"
        ? c.enrolled_students
        : typeof c?.enrolledStudents === "number"
          ? c.enrolledStudents
          : 0,
  };
}

const CREATED_COURSES_STORAGE_KEY = 'learnsphere_my_courses';
const TOPICS_CACHE_KEY_PREFIX = 'learnsphere_topics_cache_';
const TOPICS_CACHE_VERSION = 'v1';

export default function CoursesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dynamicCourses, setDynamicCourses] = useState<Course[]>([]);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [dashboardCourses, setDashboardCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseForCreation, setSelectedCourseForCreation] = useState<Course | null>(null);
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    const allCourses = [...dynamicCourses, ...createdCourses, ...dashboardCourses];
    allCourses.forEach(c => {
      try {
        const pctStr = localStorage.getItem(`learnsphere_progress_pct_${c.id}`);
        if (pctStr !== null) {
          map[c.id] = parseInt(pctStr, 10);
        } else if (createdCourses.some(cc => cc.id === c.id)) {
          map[c.id] = 1; // It has been generated/enrolled, default to 1 so it doesn't trigger "Start Course" again
        } else {
          map[c.id] = c.progress;
        }
      } catch {}
    });
    setCourseProgressMap(map);
  }, [dynamicCourses, createdCourses, dashboardCourses]);

  // One-time cleanup of local persisted lists to keep only distinct courses by name.
  useEffect(() => {
    const userId = localStorage.getItem("userId") ?? "anonymous";
    const topicsCacheKey = `${TOPICS_CACHE_KEY_PREFIX}${TOPICS_CACHE_VERSION}_${userId}`;

    const dedupeByName = (items: Course[]): Course[] => {
      const seen = new Set<string>();
      return items.filter((course) => {
        const key = getCourseNameKey(course);
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    // Load created courses first so we can filter topics against them
    const enrolledTopicIds = new Set<string>();
    const enrolledNameKeys = new Set<string>();
    try {
      const createdRaw = localStorage.getItem(CREATED_COURSES_STORAGE_KEY);
      if (createdRaw) {
        const createdParsed = JSON.parse(createdRaw) as Course[];
        if (Array.isArray(createdParsed)) {
          const cleaned = dedupeByName(createdParsed);
          localStorage.setItem(CREATED_COURSES_STORAGE_KEY, JSON.stringify(cleaned));
          setCreatedCourses(cleaned);
          // Collect the IDs AND names of topics that have already been enrolled
          cleaned.forEach((c) => {
            enrolledTopicIds.add(String(c.id));
            const nk = getCourseNameKey(c);
            if (nk) enrolledNameKeys.add(nk);
          });
        }
      }
    } catch {
      /* ignore parse/storage issues */
    }

    try {
      const topicsRaw = localStorage.getItem(topicsCacheKey);
      if (topicsRaw) {
        const topicsParsed = JSON.parse(topicsRaw) as Course[];
        if (Array.isArray(topicsParsed)) {
          // Remove topics the user has already enrolled in — match by ID or name
          const withoutEnrolled = topicsParsed.filter(
            (t) =>
              !enrolledTopicIds.has(String(t.id)) &&
              !enrolledNameKeys.has(getCourseNameKey(t) ?? '')
          );
          const cleaned = dedupeByName(withoutEnrolled);
          localStorage.setItem(topicsCacheKey, JSON.stringify(cleaned));
          setDynamicCourses((prev) =>
            prev.length > 0
              ? dedupeByName(
                  prev.filter(
                    (t) =>
                      !enrolledTopicIds.has(String(t.id)) &&
                      !enrolledNameKeys.has(getCourseNameKey(t) ?? '')
                  )
                )
              : cleaned
          );
        }
      }
    } catch {
      /* ignore parse/storage issues */
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId") ?? "anonymous";
    const topicsCacheKey = `${TOPICS_CACHE_KEY_PREFIX}${TOPICS_CACHE_VERSION}_${userId}`;

    const mapTopicsToCards = (topics: any[]): Course[] => {
      const mappedCoursesRaw: Course[] = topics.map((topic: any) => {
        const mappedDifficulty = topic.difficulty_levels?.[0] === 'basic' ? 'Beginner' : 
                                 topic.difficulty_levels?.[0] === 'intermediate' ? 'Intermediate' : 
                                 topic.difficulty_levels?.[0] === 'advanced' ? 'Advanced' : 'Beginner';
        return {
          id: topic.id,
          title: topic.title,
          description: topic.description,
          progress: 0,
          duration: topic.estimated_duration,
          difficulty: mappedDifficulty,
          category: 'AI & Data Science',
          enrolledStudents: Math.floor(Math.random() * 1000) + 100,
          instructor: 'LearnSphere AI'
        };
      });

      // De-duplicate repeated topics from backend payload.
      const seen = new Set<string>();
      return mappedCoursesRaw.filter((course) => {
        const key = getCourseNameKey(course);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    const loadCourses = async () => {
      // Use cached topics first (these are from `/topics/available`).
      try {
        const cached = localStorage.getItem(topicsCacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as Course[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDynamicCourses(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {
        /* ignore cache parse errors */
      }

      // First-time fallback: fetch `/topics/available` once, then cache.
      try {
        const res = await apiFetch('/topics/available');
        const result = res.ok ? await res.json() : null;
        if (result?.data?.available_topics && Array.isArray(result.data.available_topics)) {
          const mappedCourses = mapTopicsToCards(result.data.available_topics);
          setDynamicCourses(mappedCourses);
          try {
            localStorage.setItem(topicsCacheKey, JSON.stringify(mappedCourses));
          } catch {
            /* ignore storage errors */
          }
        }
      } catch {
        /* ignore network errors, fall back to defaults */
      } finally {
        setLoading(false);
      }
    };

    void loadCourses();
  }, []);

  const coursesRaw = [...createdCourses, ...dynamicCourses];

  // Final dedupe across all sources: first by name, then id+content key.
  // Source order ensures user-created and dashboard courses are preferred over topic defaults.
  const byName = new Set<string>();
  const byId = new Set<string>();
  const byFullKey = new Set<string>();
  const byContent = new Set<string>();
  const courses = coursesRaw.filter((course) => {
    const nameKey = getCourseNameKey(course);
    const idKey = String(course.id);
    const fullKey = getCourseContentKey(course);
    const contentKey = `${normalizeCourseText(course.title)}|${normalizeCourseText(course.description)}`;

    if (byName.has(nameKey) || byId.has(idKey) || byFullKey.has(fullKey) || byContent.has(contentKey)) return false;
    byName.add(nameKey);
    byId.add(idKey);
    byFullKey.add(fullKey);
    byContent.add(contentKey);
    return true;
  });

  const categories = ['all', ...new Set(courses.map(course => course.category?.toLowerCase() || 'other'))];
  
  const filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'all' || course.category?.toLowerCase() === filter;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-300';
    if (progress < 30) return 'bg-red-400';
    if (progress < 70) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (progress: number) => {
    if (progress === 0) return 'Not Started';
    if (progress === 100) return 'Completed';
    return 'In Progress';
  };

  const handleUnenroll = (course: Course) => {
    const courseId = String(course.id);
    const courseNameKey = getCourseNameKey(course);
    const userId = localStorage.getItem('userId') ?? 'anonymous';
    const topicsCacheKey = `${TOPICS_CACHE_KEY_PREFIX}${TOPICS_CACHE_VERSION}_${userId}`;

    // Clear all progress data for this course
    try {
      localStorage.removeItem(`learnsphere_course_${courseId}`);
      localStorage.removeItem(`learnsphere_progress_${courseId}`);
      localStorage.removeItem(`learnsphere_progress_pct_${courseId}`);
      localStorage.removeItem(`learnsphere_project_uploads_${courseId}`);
      localStorage.removeItem(`learnsphere_sections_${courseId}`);
    } catch {
      /* ignore storage issues */
    }

    // Remove from enrolled/created courses list
    setCreatedCourses((prev) => {
      const next = prev.filter((c) => getCourseNameKey(c) !== courseNameKey && String(c.id) !== courseId);
      try {
        localStorage.setItem(CREATED_COURSES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore storage issues */
      }
      return next;
    });

    // Restore the course back into dynamicCourses so the user can re-enroll
    const restoredTopic: Course = {
      id: course.id,
      title: course.title,
      description: course.description,
      progress: 0,
      duration: course.duration,
      difficulty: course.difficulty,
      category: course.category ?? 'AI & Data Science',
      enrolledStudents: course.enrolledStudents ?? 0,
      instructor: course.instructor ?? 'LearnSphere AI',
    };

    setDynamicCourses((prev) => {
      const alreadyPresent = prev.some(
        (t) => getCourseNameKey(t) === courseNameKey || String(t.id) === courseId
      );
      if (alreadyPresent) return prev;
      const next = [...prev, restoredTopic];
      try {
        localStorage.setItem(topicsCacheKey, JSON.stringify(next));
      } catch {
        /* ignore storage issues */
      }
      return next;
    });

    setCourseProgressMap((prev) => ({
      ...prev,
      [courseId]: 0,
    }));
  };

  return (
    <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Journey</h1>
          <p className="text-gray-600">Track your progress and continue learning</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{courses.filter(c => (courseProgressMap[c.id] ?? c.progress) >= 100).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{courses.filter(c => {
                  const p = courseProgressMap[c.id] ?? c.progress;
                  return p > 0 && p < 100;
                }).length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-600">
                  {courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + (courseProgressMap[c.id] ?? c.progress), 0) / courses.length) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === category
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const actualProgress = courseProgressMap[course.id] ?? course.progress;
            return (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer"
            >
              {/* Course Thumbnail Placeholder */}
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-200"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                    {course.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-xl font-bold mb-1">{course.title}</h2>
                  <p className="text-sm opacity-90">{course.instructor}</p>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                
                {/* Course Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.duration}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    {course.enrolledStudents?.toLocaleString()} students
                  </span>
                </div>

                {/* Progress Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-gray-900">{actualProgress}%</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        actualProgress === 100 ? 'bg-green-100 text-green-800' :
                        actualProgress > 0 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(actualProgress)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(actualProgress)}`}
                      style={{ width: `${actualProgress}%` }}
                    ></div>
                  </div>
                </div>

                {actualProgress === 0 ? (
                  <button
                    onClick={() => setSelectedCourseForCreation(course)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    Start Course
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      {actualProgress === 100 ? 'Review Course' : 'Continue Learning'}
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleUnenroll(course)}
                      className="border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Unenroll
                    </button>
                  </div>
                )}
</div>
            </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )} 
        {/* Course Creation Modal */}
        {selectedCourseForCreation && (
          <CourseCreationModal 
            course={selectedCourseForCreation} 
            onClose={() => setSelectedCourseForCreation(null)} 
            onSuccess={(courseId, backendCourse) => {
               // Capture the source topic ID before clearing the selection
               const enrolledTopicId = String(selectedCourseForCreation!.id);
               setSelectedCourseForCreation(null);

               // Remove the original topic card so it doesn't duplicate the created course
               setDynamicCourses((prev) => {
                 const next = prev.filter((c) => String(c.id) !== enrolledTopicId);
                 try {
                   const userId = localStorage.getItem('userId') ?? 'anonymous';
                   const topicsCacheKey = `${TOPICS_CACHE_KEY_PREFIX}${TOPICS_CACHE_VERSION}_${userId}`;
                   localStorage.setItem(topicsCacheKey, JSON.stringify(next));
                 } catch {
                   /* ignore */
                 }
                 return next;
               });

               const card = mapBackendCourseToCard(backendCourse);
               const cardNameKey = getCourseNameKey(card);
               setCreatedCourses((prev) => {
                 // Remove old cards by ID *and* by name — old UUID cards with the same
                 // title (e.g. offline fallback from a previous creation) must go so
                 // the user always navigates to the fresh AI-generated course.
                 const staleIds = prev
                   .filter(
                     (c) =>
                       String(c.id) !== String(card.id) &&
                       getCourseNameKey(c) === cardNameKey
                   )
                   .map((c) => String(c.id));

                 // Clear the stale localStorage entries so old offline content
                 // doesn't get served from cache on subsequent visits.
                 staleIds.forEach((staleId) => {
                   try {
                     localStorage.removeItem(`learnsphere_course_${staleId}`);
                     localStorage.removeItem(`learnsphere_progress_${staleId}`);
                     localStorage.removeItem(`learnsphere_progress_pct_${staleId}`);
                   } catch {
                     /* ignore */
                   }
                 });

                 const next = [
                   card,
                   ...prev.filter(
                     (c) =>
                       String(c.id) !== String(card.id) &&
                       getCourseNameKey(c) !== cardNameKey
                   ),
                 ];
                 try {
                   localStorage.setItem(CREATED_COURSES_STORAGE_KEY, JSON.stringify(next));
                 } catch {
                   /* ignore */
                 }
                 return next;
               });
               try {
                 localStorage.setItem(`learnsphere_course_${courseId}`, JSON.stringify(backendCourse));
               } catch {
                 /* ignore */
               }
               router.push(`/dashboard/courses/${courseId}`);
            }} 
          />
        )}
      </div>
    </main>
  );
}

function CourseCreationModal({ course, onClose, onSuccess }: { course: Course, onClose: () => void, onSuccess: (id: string, backendCourse: BackendCoursePayload) => void }) {
  const [level, setLevel] = useState('basic');
  const [pacing, setPacing] = useState('standard');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    const userId = localStorage.getItem("userId");
    try {
      // Parse duration to a number, e.g., '1-2 weeks' -> 2
      let durationWeeks = 4; // default
      if (course.duration) {
        const matches = course.duration.match(/(\d+)/g);
        if (matches && matches.length > 0) {
          durationWeeks = parseInt(matches[matches.length - 1], 10);
        }
      }

      const response = await apiFetch('/course/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          topic: course.id,
          level: level,
          pacing: pacing,
          duration_weeks: durationWeeks
        })
      });

      const text = await response.text();
      let raw: unknown = {};
      try {
        raw = text.trim() ? JSON.parse(text) : {};
      } catch {
        const fallbackMessage = text.trim()
          ? `Server error: ${text.trim()}`
          : 'Could not read the server response. Please try again.';
        alert(fallbackMessage);
        setCreating(false);
        return;
      }

      if (!response.ok) {
        const err = raw as { detail?: unknown };
        const msg =
          typeof err.detail === 'string'
            ? err.detail
            : Array.isArray(err.detail)
              ? JSON.stringify(err.detail)
              : `Request failed (${response.status})`;
        alert(msg);
        setCreating(false);
        return;
      }

      const payload = raw as { success?: boolean };
      if (payload.success === false) {
        alert('Course creation was not successful. Please try again.');
        setCreating(false);
        return;
      }

      const created = extractCreatedCourseFromResponse(raw, course, userId);
      if (created) {
        onSuccess(created.id, created.course);
        return;
      }

      if (response.ok && (!text.trim() || text.trim() === '{}')) {
        alert(
          'The course may have been created, but the server returned an empty response. Refresh the page or check your course list.'
        );
        setCreating(false);
        return;
      }

      console.error('Course creation failed: unrecognized response shape', raw);
      alert('Failed to read the new course from the server response. Please try again.');
      setCreating(false);
    } catch (e) {
      console.error(e);
      alert('Error creating course');
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Start: {course.title}</h3>
        <p className="text-sm text-gray-600 mb-6">Customize your learning experience before generating this course.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-white">
              <option value="basic">Basic (Beginner)</option>
              <option value="intermediate">Intermediate (Some Experience)</option>
              <option value="advanced">Advanced (Deep Dive)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Learning Pacing</label>
            <select value={pacing} onChange={e => setPacing(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-white">
              <option value="slow-paced">Relaxed (Less intensive)</option>
              <option value="fast-paced">Accelerated (Fast track)</option>
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-3">
          <button onClick={onClose} disabled={creating} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={creating} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center">
            {creating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : 'Generate Course'}
          </button>
        </div>
      </div>
    </div>
  );
}