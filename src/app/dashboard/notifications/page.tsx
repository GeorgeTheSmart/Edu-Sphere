"use client";
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiBase';
import { Bell, BookOpen, Trophy, Flame, X, Check, Clock, Star, Target } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeCourses: 0, streak: 0, completed: 0 });

  const [currentGoal, setCurrentGoal] = useState<any>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [isSettingGoal, setIsSettingGoal] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    apiFetch(`/dashboard/${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        
        const profile = data.profile || {};
        const streak = Number(profile.learning_streak || 0);
        const courses = data.courses || [];
        
        let completedCount = 0;
        let activeCount = 0;
        const generated: any[] = [];
        let notifId = 1;

        courses.forEach((course: any) => {
          const progress = Number(course.progress || 0);
          if (progress >= 100) {
            completedCount++;
            generated.push({
              id: notifId++,
              type: 'achievement',
              title: "Course Completed!",
              message: `You completed the ${course.title} course. Amazing work!`,
              time: "Recently",
              unread: true,
              icon: Trophy,
              color: "yellow",
              action: "View Certificate"
            });
          } else if (progress > 0) {
            activeCount++;
            generated.push({
              id: notifId++,
              type: 'course',
              title: "Keep Going",
              message: `You are ${progress}% through ${course.title || 'a course'}. Continue learning!`,
              time: "Recent",
              unread: true,
              icon: BookOpen,
              color: "blue",
              action: "Start Learning"
            });
          }
        });

        if (streak > 0) {
          generated.push({
            id: notifId++,
            type: 'streak',
            title: "Streak Milestone",
            message: `Your learning streak is now ${streak} days long. Keep the momentum going!`,
            time: "Today",
            unread: false,
            icon: Flame,
            color: "orange",
            action: "Continue"
          });
        }

        generated.push({
            id: notifId++,
            type: 'reminder',
            title: "Study Reminder",
            message: "Don't forget to check your daily learning goals!",
            time: "Today",
            unread: false,
            icon: Clock,
            color: "purple",
            action: "View Tasks"
        });

        setStats({ activeCourses: activeCount, streak, completed: completedCount });
        setNotifications(generated);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n: any) => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n: any) =>
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n: any) => ({ ...n, unread: false })));
  };

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter((n: any) => n.id !== id));
  };

  const getIconColor = (color: string, unread: boolean) => {
    const colors: Record<string, string> = {
      blue: unread ? 'text-blue-600 bg-blue-100' : 'text-blue-400 bg-blue-50',
      yellow: unread ? 'text-yellow-600 bg-yellow-100' : 'text-yellow-400 bg-yellow-50',
      orange: unread ? 'text-orange-600 bg-orange-100' : 'text-orange-400 bg-orange-50',
      purple: unread ? 'text-purple-600 bg-purple-100' : 'text-purple-400 bg-purple-50',
    };
    return colors[color];
  };

  const getActionColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      yellow: 'bg-yellow-600 hover:bg-yellow-700',
      orange: 'bg-orange-600 hover:bg-orange-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
    };
    return colors[color];
  };

  const handleSetGoal = async () => {
    if (!newGoal || !goalDescription) return;

    setIsSettingGoal(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setIsSettingGoal(false);
        return;
      }
      
      const response = await apiFetch('/learning/set-goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          goal: newGoal,
          description: goalDescription
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentGoal({
          goal: data.goal,
          description: goalDescription
        });
        setShowGoalModal(false);
      }
    } catch {
      /* network or parse error */
    } finally {
      setIsSettingGoal(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <Bell className="w-12 h-12 text-blue-500/50 mb-4" />
              <p className="text-slate-500 font-medium">Loading notifications...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-8 h-8 text-slate-700" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {unreadCount}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Active Courses</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-slate-900">{stats.streak} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          {/* Goal Card */}
          <div
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setShowGoalModal(true)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Learning Goal</p>
                <p className="text-2xl font-bold text-slate-900 truncate">
                  {currentGoal ? currentGoal.goal : "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Setting Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">Set Learning Goal</h3>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Goal</label>
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="e.g. career, certification, skill"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    placeholder="Describe your learning goal"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowGoalModal(false)}
                    className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSetGoal}
                    disabled={isSettingGoal || !newGoal || !goalDescription}
                    className={`px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium ${(isSettingGoal || !newGoal || !goalDescription) ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                  >
                    {isSettingGoal ? 'Setting...' : 'Set Goal'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications</h3>
              <p className="text-slate-600">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${notification.unread
                      ? 'border-l-4 border-l-blue-500 border-slate-200'
                      : 'border-slate-200'
                    }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-full ${getIconColor(notification.color, notification.unread)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-slate-600 mb-2">{notification.message}</p>
                            <p className="text-sm text-slate-500">{notification.time}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {notification.unread && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove notification"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4">
                          <button className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${getActionColor(notification.color)}`}>
                            {notification.action}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
          </>
        )}
      </div>
    </main>
  );
}
