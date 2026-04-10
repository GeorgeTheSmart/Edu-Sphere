"use client";
import React, { useState } from 'react';
import { Check, Bell, Shield, Palette, Save, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'light',
    emailNotifications: true,
    pushNotifications: true,
    browserNotifications: false,
    showPassword: false
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
    setSaveStatus('');
  };

  const handleSave = () => {
    setSaveStatus('saving');
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  const handleChangePassword = () => {
    alert('Password change functionality would open a modal or redirect to a secure form');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Customize your experience and manage your preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Theme Settings Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Theme</h2>
                <p className="text-sm text-gray-500">Choose your preferred appearance</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {['light', 'dark', 'system'].map((theme) => (
                <label key={theme} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={settings.theme === theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 capitalize">{theme}</span>
                    <p className="text-sm text-gray-500">
                      {theme === 'light' && 'Clean, bright interface'}
                      {theme === 'dark' && 'Easy on the eyes in low light'}
                      {theme === 'system' && 'Matches your device settings'}
                    </p>
                  </div>
                  {settings.theme === theme && (
                    <Check className="w-5 h-5 text-indigo-600" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Notification Settings Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-500">Manage how you receive updates</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Mobile and desktop alerts' },
                { key: 'browserNotifications', label: 'Browser Notifications', desc: 'In-browser popup alerts' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <label className="font-medium text-gray-900 cursor-pointer">{label}</label>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => handleSettingChange(key, e.target.checked)}
                      className="sr-only"
                    />
                    <button
                      onClick={() => handleSettingChange(key, !settings[key])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        settings[key] ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                          settings[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                <p className="text-sm text-gray-500">Manage your account security settings</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Password</h3>
                  <p className="text-sm text-gray-600 mb-3">Last changed 2 months ago</p>
                  <button
                    onClick={handleChangePassword}
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Change Password
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 mb-3">Add an extra layer of security</p>
                  <button className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors">
                    <Check className="w-4 h-4" />
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Changes Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Save Your Changes</h3>
              <p className="text-sm text-gray-600">
                {hasUnsavedChanges 
                  ? 'You have unsaved changes that will be lost if you navigate away.'
                  : 'All your settings are up to date.'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Saved successfully</span>
                </div>
              )}
              
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saveStatus === 'saving'}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  hasUnsavedChanges && saveStatus !== 'saving'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}