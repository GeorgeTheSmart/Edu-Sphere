"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChatTutor from "@/components/ChatTutor";
import { apiFetch } from "@/lib/apiBase";
import { BrainCircuit, Target, Flame, Clock, BookOpen, TrendingUp, Bot, CheckCircle, Circle, Play, Award } from "lucide-react";

export default function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [availableTopics, setAvailableTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseTab, setCourseTab] = useState<"inProgress" | "completed">("inProgress");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const dash = apiFetch(`/dashboard/${userId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setDashboardData(data);
        })
        .catch(() => {});

      const topics = apiFetch("/topics/available")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.data?.available_topics) {
            setAvailableTopics(data.data.available_topics);
          }
        })
        .catch(() => {});

      await Promise.allSettled([dash, topics]);
      setLoading(false);
    };

    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <BrainCircuit className="w-12 h-12 text-indigo-600 animate-pulse" />
          <p className="text-slate-500 font-medium animate-pulse">Loading your learning workspace...</p>
        </div>
      </div>
    );
  }

  const userName = dashboardData?.user?.name || "Student";
  const profile = dashboardData?.profile ?? {};
  const streak = Number(profile?.learning_streak ?? 0);
  const studyTime = Number(profile?.total_study_time ?? 0);
  let dashboardCoursesRaw: any[] = [];
  try {
    const localCourses = localStorage.getItem('learnsphere_my_courses');
    if (localCourses) {
       const parsedLocal = JSON.parse(localCourses);
       if (Array.isArray(parsedLocal)) {
          dashboardCoursesRaw = parsedLocal;
       }
    }
  } catch {}

  const uniqueDashboardCoursesRaw: any[] = [];
  const seenCourseIds = new Set();
  const seenNames = new Set();
  dashboardCoursesRaw.forEach(c => {
    const id = String(c?.id ?? c?.course_id);
    const titleKey = String(c?.title || "").toLowerCase().trim();
    if (!seenCourseIds.has(id) && !seenNames.has(titleKey)) {
      seenCourseIds.add(id);
      seenNames.add(titleKey);
      uniqueDashboardCoursesRaw.push(c);
    }
  });

  const dashboardCourses = uniqueDashboardCoursesRaw.map((c) => {
    let p = Number(c?.progress ?? 0);
    try {
      const stored = localStorage.getItem(`learnsphere_progress_pct_${c.id ?? c.course_id}`);
      if (stored !== null) {
        p = parseInt(stored, 10);
      }
    } catch {}
    return { ...c, progress: p };
  });

  const completedCoursesFromPayload = dashboardCourses.filter((c) => c.progress >= 100).length;
  const coursesCompleted = Math.max(Number(profile?.courses_completed ?? 0), completedCoursesFromPayload);
  const inProgressCourses = dashboardCourses.filter((c) => c.progress >= 0 && c.progress < 100);
  const averageProgress =
    dashboardCourses.length > 0
      ? Math.round(
          dashboardCourses.reduce((acc, c) => acc + c.progress, 0) / dashboardCourses.length
        )
      : 0;

  const completedActivitiesRaw: any[] = Array.isArray(dashboardData?.completed_activities)
    ? dashboardData.completed_activities
    : Array.isArray(dashboardData?.activities)
      ? dashboardData.activities.filter((a: any) => {
          const status = String(a?.status ?? "").toLowerCase();
          return status === "completed" || status === "done" || status === "finished";
        })
      : Array.isArray(dashboardData?.recent_activity)
        ? dashboardData.recent_activity.filter((a: any) => {
            const status = String(a?.status ?? "").toLowerCase();
            return status === "completed" || status === "done" || status === "finished";
          })
        : [];

  const completedActivities = completedActivitiesRaw.slice(0, 8).map((item: any, idx: number) => ({
    id: String(item?.id ?? idx),
    title: String(
      item?.title ??
        item?.activity ??
        item?.name ??
        item?.description ??
        `Completed activity ${idx + 1}`
    ),
    when: String(item?.completed_at ?? item?.timestamp ?? item?.time_ago ?? "Recently"),
    kind: String(item?.type ?? item?.category ?? "activity"),
  }));

  const completedCourses = dashboardCourses.filter((c) => c.progress >= 100);
  const visibleCourses = courseTab === "inProgress" ? inProgressCourses : completedCourses;
  const todaysGoals = [
    {
      id: "goal-1",
      label: "Complete any 3 learning items",
      done: Math.min(completedActivitiesRaw.length, 3),
      total: 3,
    },
    {
      id: "goal-2",
      label: "Keep your learning streak active",
      done: streak > 0 ? 1 : 0,
      total: 1,
    },
    {
      id: "goal-3",
      label: "Continue one in-progress course",
      done: inProgressCourses.length > 0 ? 1 : 0,
      total: 1,
    },
  ];
  const allGoalsCompleted = todaysGoals.every((g) => g.done >= g.total);

  return (
    <div className="flex">
      <main className="flex-1 min-h-screen bg-slate-50 font-sans w-full">
        {/* Modern Header */}
        <header className="bg-white border-b border-slate-200/80 sticky top-[64px] z-10 shadow-sm backdrop-blur-sm bg-white/90">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight">
                  Welcome back, {userName}
                </h1>
                <p className="text-slate-500 font-medium mt-1">Ready to expand your knowledge today?</p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 shadow-sm">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </header>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area (Now on the Left) */}
            <section className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Courses Section */}
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                  <h2 className="text-xl font-bold text-slate-800">My Learning Journey</h2>
                  <div className="inline-flex bg-slate-200/60 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCourseTab("inProgress")}
                      className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${courseTab === "inProgress" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseTab("completed")}
                      className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${courseTab === "completed" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {visibleCourses.length === 0 ? (
                    <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        No {courseTab === "inProgress" ? "courses in progress" : "completed courses"}
                      </h3>
                      <p className="text-slate-500 max-w-sm mx-auto text-sm">
                        Ready to start learning? Explore new topics and build your skills today.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {visibleCourses.map((course: any, idx: number) => {
                        const progress = Math.max(0, Math.min(100, Number(course?.progress ?? 0)));
                        const isCompleted = progress >= 100;
                        return (
                          <div key={String(course?.id ?? idx)} className="group flex flex-col bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                  {isCompleted ? <Award className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </div>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                                  {isCompleted ? 'Done' : 'Active'}
                                </span>
                              </div>
                              <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {String(course?.title ?? "Untitled learning path")}
                              </h3>
                              <p className="text-sm text-slate-500 line-clamp-2 mb-6">
                                {String(course?.description ?? "Continue your personalized learning path and build your skills.")}
                              </p>
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-slate-700">{progress}%</span>
                                <Link href={`/dashboard/courses/${course?.id ?? course?.course_id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                  {isCompleted ? "Review Material →" : "Resume Learning →"}
                                </Link>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`} 
                                  style={{ width: `${progress}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Assistant Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden mt-2">
                <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 sm:p-8 relative overflow-hidden">
                  {/* Decorative faint background shapes */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl">
                      <Bot className="w-10 h-10 text-indigo-100" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-white mb-2">AI Learning Assistant</h2>
                      <p className="text-indigo-200 text-sm max-w-md font-medium">
                        Stuck on a problem or need something explained differently? Your AI tutor is here to help 24/7.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50/30">
                  <div className="max-w-4xl mx-auto">
                    <ChatTutor />
                  </div>
                </div>
              </div>

            </section>

            {/* Right Sidebar Layout (Stats, Goals, etc.) */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Learning Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Flame className="w-5 h-5" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Streak</p>
                  <p className="text-2xl font-bold text-slate-800 tracking-tight">{streak} <span className="text-base font-medium text-slate-500">days</span></p>
                </div>
                
                <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Study Time</p>
                  <p className="text-2xl font-bold text-slate-800 tracking-tight">{studyTime} <span className="text-base font-medium text-slate-500">hrs</span></p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-slate-800 tracking-tight">{coursesCompleted} <span className="text-base font-medium text-slate-500">courses</span></p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Avg Progress</p>
                  <p className="text-2xl font-bold text-slate-800 tracking-tight">{averageProgress}%</p>
                </div>
              </div>

              {/* Today's Goals */}
              <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Target className="w-24 h-24" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" /> Today's Goals
                </h3>
                <div className="space-y-4 relative z-10">
                  {todaysGoals.map((goal) => {
                    const isDone = goal.done >= goal.total;
                    return (
                      <div key={goal.id} className={`flex items-center gap-4 p-3 rounded-xl border ${isDone ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/50 border-slate-100'} transition-colors`}>
                        {isDone ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-300 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isDone ? 'text-slate-700' : 'text-slate-600'}`}>{goal.label}</p>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${Math.min(100, (goal.done / goal.total) * 100)}%` }}
                           />
                          </div>
                        </div>
                        <span className={`text-xs font-bold ${isDone ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {goal.done}/{goal.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className={`mt-5 text-sm font-semibold text-center py-2 rounded-lg ${allGoalsCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                  {allGoalsCompleted ? "🎉 All daily goals completed!" : "Keep going to crush today's goals!"}
                </div>
              </div>

              {/* Completed Activities */}
              <div className="bg-white rounded-2xl border border-slate-200/70 flex flex-col shadow-sm max-h-[400px]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" /> Recent Activity
                  </h3>
                </div>
                <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-1">
                  {completedActivities.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-3">
                      <BookOpen className="w-8 h-8 opacity-20" />
                      <p className="text-sm font-medium">No completed activities yet.</p>
                    </div>
                  ) : (
                    completedActivities.map((activity) => (
                      <div key={activity.id} className="group relative flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="mt-1 bg-indigo-100 text-indigo-600 p-2 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 leading-snug">{activity.title}</p>
                          <p className="text-xs font-medium text-slate-400 mt-1 capitalize">{activity.kind} • {activity.when}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

