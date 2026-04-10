"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiBase";
import { BookOpen, Brain, Library, Play, Clock, Trophy, Search, Download, ExternalLink, CheckCircle, Star, ArrowRight } from "lucide-react";

export default function SubjectsPage() {
  const tabs = ["Learning Paths", "Quiz", "Resources"];
  const [activeTab, setActiveTab] = useState("Learning Paths");
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      apiFetch(`/dashboard/${userId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setDashboardData(data);
        })
        .catch(() => {});
    }
  }, []);

  
  const learningPaths = [
    {
      title: "Introduction to Subject",
      description: "Foundation concepts and terminology",
      duration: "2-3 weeks",
      difficulty: "Beginner",
      completed: true,
      lessons: 12,
      icon: BookOpen
    },
    {
      title: "Core Concepts & Fundamentals",
      description: "Deep dive into essential principles",
      duration: "4-5 weeks",
      difficulty: "Intermediate",
      completed: false,
      lessons: 18,
      icon: Brain
    },
    {
      title: "Advanced Topics & Projects",
      description: "Hands-on projects and advanced theory",
      duration: "6-8 weeks",
      difficulty: "Advanced",
      completed: false,
      lessons: 24,
      icon: Trophy
    },
    {
      title: "Revision & Final Assessment",
      description: "Comprehensive review and evaluation",
      duration: "2-3 weeks",
      difficulty: "Mixed",
      completed: false,
      lessons: 8,
      icon: CheckCircle
    }
  ];

  
  type QuizColor = "green" | "yellow" | "red" | "purple";

  const quizzes: {
    title: string;
    questions: number;
    duration: string;
    difficulty: string;
    attempts: number;
    bestScore: number | null;
    color: QuizColor;
  }[] = [
    {
      title: "Beginner Quiz",
      questions: 10,
      duration: "15 min",
      difficulty: "Easy",
      attempts: 3,
      bestScore: 85,
      color: "green"
    },
    {
      title: "Intermediate Quiz",
      questions: 20,
      duration: "30 min",
      difficulty: "Medium",
      attempts: 2,
      bestScore: 72,
      color: "yellow"
    },
    {
      title: "Advanced Challenge",
      questions: 15,
      duration: "25 min",
      difficulty: "Hard",
      attempts: 1,
      bestScore: 60,
      color: "red"
    },
    {
      title: "Mixed Assessment",
      questions: 25,
      duration: "40 min",
      difficulty: "Mixed",
      attempts: 0,
      bestScore: null,
      color: "purple"
    }
  ];


  const resources = [
    {
      title: "Complete Lecture Notes",
      type: "PDF",
      size: "2.4 MB",
      downloads: 1240,
      rating: 4.8,
      category: "Notes"
    },
    {
      title: "Interactive Video Tutorial Series",
      type: "Video",
      duration: "3h 45m",
      views: 8520,
      rating: 4.9,
      category: "Videos"
    },
    {
      title: "Practical Example Projects",
      type: "GitHub",
      stars: 156,
      forks: 43,
      rating: 4.7,
      category: "Code"
    },
    {
      title: "Quick Reference Guide",
      type: "PDF",
      size: "800 KB",
      downloads: 2150,
      rating: 4.6,
      category: "Reference"
    },
    {
      title: "Interactive Practice Exercises",
      type: "Web App",
      exercises: 47,
      completed: 23,
      rating: 4.8,
      category: "Practice"
    }
  ];

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

    const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Intermediate":
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  const getQuizColor = (color: "green" | "yellow" | "red" | "purple") => {
  const colors = {
    green: "border-green-200 bg-green-50 hover:bg-green-100",
    yellow: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100",
    red: "border-red-200 bg-red-50 hover:bg-red-100",
    purple: "border-purple-200 bg-purple-50 hover:bg-purple-100"
  };
  return colors[color] || colors.purple;
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Learing</h1>
          <p className="text-indigo-100 text-lg">Master your subjects with AI-powered learning paths, interactive quizzes, and curated resources</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8 max-w-md">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === tab
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === "Learning Paths" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">AI-Generated Learning Paths</h2>
                <div className="text-sm text-gray-500">4 paths • 62 total lessons</div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {(dashboardData?.courses && dashboardData.courses.length > 0 ? dashboardData.courses : learningPaths).map((path: any, index: number) => {
                  const IconComponent = path.icon || BookOpen;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${path.completed ? 'bg-green-100' : 'bg-indigo-100'}`}>
                            <IconComponent className={`h-5 w-5 ${path.completed ? 'text-green-600' : 'text-indigo-600'}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{path.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{path.description}</p>
                          </div>
                        </div>
                        {path.completed && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{path.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{path.lessons} lessons</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                          {path.difficulty}
                        </span>
                        <button className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                          <span>{path.completed ? 'Review' : 'Start'}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "Quiz" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Interactive Quizzes</h2>
                <div className="text-sm text-gray-500">Test your knowledge</div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {quizzes.map((quiz, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${getQuizColor(quiz.color)}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{quiz.questions} questions</span>
                          <span>•</span>
                          <span>{quiz.duration}</span>
                        </div>
                      </div>
                      <Play className="h-6 w-6 text-gray-600" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                      {quiz.bestScore && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-800">{quiz.bestScore}%</div>
                          <div className="text-xs text-gray-500">Best Score</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {quiz.attempts > 0 ? `${quiz.attempts} attempts` : 'Not attempted'}
                      </div>
                      <button className="bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 rounded-lg border shadow-sm transition-colors">
                        {quiz.attempts > 0 ? 'Retake' : 'Start Quiz'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Resources" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Resource Library</h2>
                <div className="text-sm text-gray-500">{resources.length} resources available</div>
              </div>
              
              {/* Enhanced Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources by name or category..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="grid gap-4">
                {filteredResources.map((resource, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Library className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">{resource.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                              {resource.category}
                            </span>
                            <span>{resource.type}</span>
                            {resource.size && <span>{resource.size}</span>}
                            {resource.duration && <span>{resource.duration}</span>}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {resource.downloads && (
                              <span className="flex items-center space-x-1">
                                <Download className="h-4 w-4" />
                                <span>{resource.downloads.toLocaleString()} downloads</span>
                              </span>
                            )}
                            {resource.views && (
                              <span className="flex items-center space-x-1">
                                <Play className="h-4 w-4" />
                                <span>{resource.views.toLocaleString()} views</span>
                              </span>
                            )}
                            {resource.exercises && (
                              <span>{resource.completed}/{resource.exercises} completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="font-medium text-sm">{resource.rating}</span>
                        </div>
                        <button className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                          <span>Access</span>
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <Library className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No resources found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}