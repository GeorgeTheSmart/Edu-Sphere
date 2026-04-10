"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiBase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Play, Pause, RotateCcw, Lightbulb, Check, X, Trophy, Target, Clock, TrendingUp } from "lucide-react";

export default function PracticePage() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Dynamic Content States
  const [questionData, setQuestionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Enhanced performance data
  const [performanceData, setPerformanceData] = useState([
    { attempt: 1, accuracy: 60, time: 45 },
    { attempt: 2, accuracy: 75, time: 38 },
  ]);

  const [statsData, setStatsData] = useState([
    { name: 'Correct', value: 85, color: '#10b981' },
    { name: 'Incorrect', value: 15, color: '#ef4444' }
  ]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
       apiFetch(`/user/${userId}/progress-history`)
       .then((r) => (r.ok ? r.json() : null))
       .then((data) => {
          if (data && data.history && data.history.length > 0) {
             setPerformanceData(data.history);
          }
          if (data && data.stats) {
             setStatsData(data.stats);
          }
       })
       .catch(() => {});
    }
  }, []);

  // Fetch the dynamic problem
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    setLoading(true);
    apiFetch(`/test-understanding/start?user_id=${userId}&topic=general`, {
      method: "POST",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setQuestionData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId || !questionData?.id) return;

    try {
      const res = await apiFetch(`/test-understanding/submit?user_id=${userId}&question_id=${questionData.id}&answer=${encodeURIComponent(answer.trim())}&total_questions=5`, {
        method: "POST",
      });
      const data = await res.json();
      
      const isAnswerCorrect = data?.is_correct || data?.score >= 70 || false; // Adapt mapping depending on actual endpoint schema
      setIsCorrect(isAnswerCorrect);
      setSubmitted(true);
      setIsRunning(false);
      
      if (isAnswerCorrect) {
        setShowCelebration(true);
      }
    } catch {
      /* network or parse error */
    }
  };

  const resetProblem = () => {
    setTime(0);
    setIsRunning(false);
    setAnswer("");
    setSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);
  };

  const startTimer = () => {
    if (!submitted && !loading) {
      setIsRunning(!isRunning);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce">
            <div className="bg-green-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center space-x-2">
              <Trophy className="w-6 h-6" />
              <span className="text-lg font-bold">Excellent!</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row">
        {/* Main Problem Section */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Practice Session</h1>
              <p className="text-gray-600">Master your skills with interactive problem solving</p>
            </div>

            {/* Problem Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Function Evaluation</h2>
                <p className="text-indigo-100">Level: Intermediate</p>
              </div>
              
              <div className="p-8">
                <div className="mb-8">
                  {loading ? (
                    <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-indigo-500 flex justify-center items-center h-24">
                       <span className="text-gray-600 font-medium">Loading next question...</span>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-indigo-500">
                      <p className="text-xl text-gray-800 mb-4">
                        <strong>Problem:</strong> {questionData?.question || "If f(x) = 2x + 3, find f(5)."}
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center text-sm text-gray-600 gap-4">
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{questionData?.topic || "Function substitution"}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                          <span className="font-semibold">{questionData?.difficulty || "Medium"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timer Section */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <span className="text-2xl font-mono font-bold text-gray-800">
                          {formatTime(time)}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-gray-300"></div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={startTimer}
                          disabled={submitted}
                          className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-all ${
                            submitted 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : isRunning 
                                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span>{isRunning ? "Pause" : "Start"}</span>
                        </button>
                        <button
                          onClick={resetProblem}
                          className="flex items-center space-x-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hint Section */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium transition-colors border border-yellow-300"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
                  </button>
                  
                  {showHint && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-in slide-in-from-top duration-300">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 font-medium">Hint:</p>
                          <p className="text-yellow-700 mt-1">
                            To find f(5), substitute x = 5 into the function f(x) = 2x + 3.
                            So f(5) = 2(5) + 3 = 10 + 3 = 13
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Answer Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer:
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Enter your answer here..."
                        disabled={submitted}
                        className={`flex-1 px-4 py-3 border rounded-lg text-lg transition-all ${
                          submitted
                            ? isCorrect
                              ? 'border-green-500 bg-green-50 text-green-800'
                              : 'border-red-500 bg-red-50 text-red-800'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                        } ${submitted ? 'cursor-not-allowed' : ''}`}
                        onKeyPress={(e) => e.key === 'Enter' && !submitted && handleSubmit()}
                      />
                      <button
                        onClick={handleSubmit}
                        disabled={submitted || !answer.trim()}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          submitted || !answer.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                        }`}
                      >
                        Submit
                      </button>
                    </div>
                  </div>

                  {/* Result Feedback */}
                  {submitted && (
                    <div className={`p-4 rounded-lg flex items-center space-x-3 animate-in slide-in-from-bottom duration-500 ${
                      isCorrect 
                        ? 'bg-green-100 border border-green-300' 
                        : 'bg-red-100 border border-red-300'
                    }`}>
                      {isCorrect ? (
                        <>
                          <Check className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-800">Correct!</p>
                            <p className="text-green-700">Great job! You solved it in {formatTime(time)}.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <X className="w-6 h-6 text-red-600" />
                          <div>
                            <p className="font-semibold text-red-800">Not quite right.</p>
                            <p className="text-red-700">The correct answer is 13. Review the hint and try again!</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="xl:w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Stats Overview */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                Performance Analytics
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-700">95%</div>
                  <div className="text-sm text-green-600">Accuracy</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">25s</div>
                  <div className="text-sm text-blue-600">Avg Time</div>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Progress Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="attempt" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#9ca3af' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Accuracy Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Success Rate</h3>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={statsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-2">
                {statsData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{entry.name}: {entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {[
                  { problem: "Linear Functions", time: "2m 15s", status: "correct" },
                  { problem: "Quadratic Equations", time: "3m 42s", status: "correct" },
                  { problem: "Polynomial Division", time: "4m 18s", status: "incorrect" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{activity.problem}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'correct' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}