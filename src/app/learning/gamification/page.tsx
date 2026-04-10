"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { 
  Trophy, 
  Flame, 
  Target, 
  Award, 
  TrendingUp, 
  Calendar,
  Star,
  Lock,
  CheckCircle,
  Zap,
  Medal,
  Crown
} from "lucide-react";

export default function GamificationPage() {
  const comparisonData = [
    { day: "Mon", lastWeek: 4, thisWeek: 9 },
    { day: "Tue", lastWeek: 5, thisWeek: 7 },
    { day: "Wed", lastWeek: 6, thisWeek: 8 },
    { day: "Thu", lastWeek: 3, thisWeek: 5 },
    { day: "Fri", lastWeek: 4, thisWeek: 7 },
    { day: "Sat", lastWeek: 7, thisWeek: 9 },
    { day: "Sun", lastWeek: 2, thisWeek: 4 },
  ];

  const badges = [
    { 
      title: "Quiz Master", 
      description: "Complete 50 quizzes",
      unlocked: true,
      icon: Trophy,
      color: "from-yellow-400 to-orange-500"
    },
    { 
      title: "7-Day Streak", 
      description: "Study for 7 days in a row",
      unlocked: false,
      icon: Calendar,
      color: "from-blue-400 to-blue-600"
    },
    { 
      title: "Accuracy Expert", 
      description: "Achieve 90% accuracy",
      unlocked: true,
      icon: Target,
      color: "from-green-400 to-emerald-500"
    },
    { 
      title: "Speed Demon", 
      description: "Complete quiz under 5 minutes",
      unlocked: false,
      icon: Zap,
      color: "from-purple-400 to-purple-600"
    },
    { 
      title: "Top Performer", 
      description: "Rank in top 10%",
      unlocked: true,
      icon: Crown,
      color: "from-pink-400 to-rose-500"
    },
    { 
      title: "Consistency King", 
      description: "Study 30 days this month",
      unlocked: false,
      icon: Medal,
      color: "from-indigo-400 to-indigo-600"
    },
  ];

  const stats = [
    {
      label: "Total Points",
      value: "2,847",
      icon: Star,
      change: "+12%",
      changeType: "positive"
    },
    {
      label: "Current Level",
      value: "15",
      icon: TrendingUp,
      change: "+2",
      changeType: "positive"
    },
    {
      label: "Quizzes Completed",
      value: "127",
      icon: CheckCircle,
      change: "+8",
      changeType: "positive"
    }
  ];

  const streakDays = [
    { day: 'M', active: true, completed: true },
    { day: 'T', active: true, completed: true },
    { day: 'W', active: true, completed: true },
    { day: 'T', active: true, completed: true },
    { day: 'F', active: true, completed: true },
    { day: 'S', active: false, completed: false },
    { day: 'S', active: false, completed: false },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value} activities`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Achievements & Progress</h1>
          <p className="text-gray-600">Track your learning journey and unlock new milestones</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">this week</span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <stat.icon className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Streak Tracker */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Current Streak</h2>
                <p className="text-gray-600">Keep the momentum going!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-orange-500">5</p>
              <p className="text-sm text-gray-500">days in a row</p>
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            {streakDays.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  day.completed 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : day.active 
                    ? 'bg-orange-100 text-orange-600 border-2 border-orange-200' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {day.completed && <CheckCircle className="h-5 w-5" />}
                  {!day.completed && day.day}
                </div>
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Achievement Badges</h2>
              <p className="text-gray-600">Unlock badges by reaching milestones</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <div
                  key={index}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                    badge.unlocked 
                      ? 'border-transparent bg-gradient-to-br ' + badge.color + ' text-white shadow-lg hover:shadow-xl' 
                      : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`p-3 rounded-full ${
                      badge.unlocked ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {badge.unlocked ? (
                        <IconComponent className="h-8 w-8" />
                      ) : (
                        <Lock className="h-8 w-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{badge.title}</h3>
                      <p className={`text-sm mt-1 ${
                        badge.unlocked ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {badge.description}
                      </p>
                    </div>
                    <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                      badge.unlocked 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {badge.unlocked ? 'Unlocked' : 'Locked'}
                    </div>
                  </div>
                  
                  {badge.unlocked && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Comparison Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Weekly Performance</h2>
              <p className="text-gray-600">Compare your activity between last week and this week</p>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="roundRect"
                />
                <Bar 
                  dataKey="lastWeek" 
                  fill="#e0e7ff" 
                  name="Last Week"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="thisWeek" 
                  fill="#4f46e5" 
                  name="This Week"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}