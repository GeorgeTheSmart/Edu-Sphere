import React, { useState } from 'react';
import { Mail, ArrowUp, Heart, Globe, Users, BookOpen, Zap } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900 text-gray-300">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Enhanced Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                LearnSphere
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Your Personalized Learning Universe – AI-powered guidance for every learner's journey to success.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-lg font-bold text-white">50K+</div>
                <div className="text-xs text-gray-400">Learners</div>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-center mb-1">
                  <BookOpen className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-lg font-bold text-white">1000+</div>
                <div className="text-xs text-gray-400">Courses</div>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-center mb-1">
                  <Globe className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-lg font-bold text-white">40+</div>
                <div className="text-xs text-gray-400">Countries</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '#' },
                { name: 'Features', href: '#' },
                { name: 'Subjects', href: '#' },
                { name: 'Community', href: '#' },
                { name: 'Pricing', href: '#' },
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="group flex items-center text-gray-400 hover:text-indigo-400 transition-all duration-200"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-indigo-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-6">Resources</h4>
            <ul className="space-y-3">
              {[
                { name: 'Help Center', href: '#' },
                { name: 'Blog & Articles', href: '#' },
                { name: 'Learning Guides', href: '#' },
                { name: 'Privacy Policy', href: '#' },
                { name: 'Terms of Service', href: '#' },
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="group flex items-center text-gray-400 hover:text-indigo-400 transition-all duration-200"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-indigo-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Enhanced Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Stay Updated
            </h4>
            <p className="text-sm text-gray-400 mb-6">
              Get weekly insights, study tips, and course updates delivered to your inbox.
            </p>
            
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 backdrop-blur-sm"
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <button
                onClick={handleSubscribe}
                disabled={isSubscribed}
                className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isSubscribed 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl hover:shadow-indigo-500/25'
                } transform hover:scale-[1.02] active:scale-[0.98]`}
              >
                {isSubscribed ? '✓ Subscribed!' : 'Subscribe Now'}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              Join 10,000+ learners. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>© {new Date().getFullYear()} LearnSphere. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-400" /> for learners worldwide
              </span>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {['Twitter', 'LinkedIn', 'GitHub', 'Discord'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                    aria-label={social}
                  >
                    <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                  </a>
                ))}
              </div>
              
              {/* Scroll to top button */}
              <button
                onClick={scrollToTop}
                className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}