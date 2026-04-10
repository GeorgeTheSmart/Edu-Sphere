import { useState } from 'react';
import { BookOpen, Trophy, Clock, Flame, MessageCircle, ChevronRight, Play, Star, Target } from 'lucide-react';

export default function Dashboard() {
  const [chatMessage, setChatMessage] = useState('');
  
  const recentActivities = [
    { type: 'quiz', title: 'JavaScript Fundamentals Quiz', score: '95%', time: '2 hours ago' },
    { type: 'lesson', title: 'React Hooks Deep Dive', progress: '100%', time: '1 day ago' },
    { type: 'project', title: 'Todo App Project', status: 'In Progress', time: '2 days ago' }
  ];

  const upcomingTasks = [
    { title: 'Complete CSS Grid Module', due: 'Today', priority: 'high' },
    { title: 'Review Array Methods', due: 'Tomorrow', priority: 'medium' },
    { title: 'Start Final Project', due: 'This Week', priority: 'low' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Alex! 👋</h1>
              <p className="text-blue-100 text-lg">Ready to continue your learning journey?</p>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold">65%</div>
                <div className="text-sm text-blue-100">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center">
                  <Flame className="w-6 h-6 mr-1 text-orange-400" />
                  5
                </div>
                <div className="text-sm text-blue-100">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 -mt-4 relative">
        {/* Progress Overview Card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border-0 backdrop-blur-sm bg-white/95">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo-600" />
              Current Learning Path: Full-Stack JavaScript
            </h2>
            <button className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition-colors">
              View Details <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: "65%" }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>13 of 20 modules completed</span>
              <span className="font-medium">65% Complete</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Stats Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Enhanced Stats Cards */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Streak</p>
                  <p className="text-3xl font-bold text-gray-900">5 Days</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Flame className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-orange-600 font-medium mt-2">🔥 On fire! Keep it up</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quizzes Completed</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 font-medium mt-2">Average score: 94%</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Time</p>
                  <p className="text-3xl font-bold text-gray-900">14 hrs</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-blue-600 font-medium mt-2">This week</p>
            </div>
          </div>

          {/* Upcoming Tasks Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Upcoming Tasks</h3>
              <div className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.due}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                View All Tasks
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'quiz' ? 'bg-green-100' :
                        activity.type === 'lesson' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {activity.type === 'quiz' ? <Trophy className="w-4 h-4 text-green-600" /> :
                         activity.type === 'lesson' ? <Play className="w-4 h-4 text-blue-600" /> :
                         <Star className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">
                        {activity.score || activity.progress || activity.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced AI Chat Tutor */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-indigo-600" />
                AI Study Assistant
              </h3>
              <div className="bg-white rounded-lg p-4 mb-4 h-40 overflow-y-auto">
                <div className="space-y-3">
                  <div className="bg-indigo-100 rounded-lg p-3 text-sm">
                    <p className="font-medium text-indigo-800">AI Tutor:</p>
                    <p className="text-indigo-700">Hi Alex! I noticed you're doing great with JavaScript fundamentals. Want to practice some advanced concepts?</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm ml-8">
                    <p className="font-medium text-gray-800">You:</p>
                    <p className="text-gray-700">Yes, I'd like to work on async/await!</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all">
              <Play className="w-8 h-8 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">Continue Learning</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all">
              <Trophy className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">Take Quiz</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all">
              <Star className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">View Progress</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all">
              <BookOpen className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">Study Materials</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}