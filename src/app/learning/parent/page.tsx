"use client";

import { useState } from "react";
import { Download, FileText, BarChart3, Clock, Target, BookOpen } from "lucide-react";

export default function ParentView() {
  const [isGenerating, setIsGenerating] = useState({ csv: false, pdf: false });

  const studentData = [
    { subject: "Math", quizzes: 10, accuracy: "85%", timeSpent: "6h", grade: "B+", color: "bg-blue-500" },
    { subject: "Science", quizzes: 8, accuracy: "78%", timeSpent: "5h", grade: "B", color: "bg-green-500" },
    { subject: "English", quizzes: 12, accuracy: "92%", timeSpent: "7h", grade: "A-", color: "bg-purple-500" },
  ];

  const totalQuizzes = studentData.reduce((sum, item) => sum + item.quizzes, 0);
  const avgAccuracy = Math.round(studentData.reduce((sum, item) => sum + parseInt(item.accuracy), 0) / studentData.length);
  const totalTime = studentData.reduce((sum, item) => sum + parseInt(item.timeSpent), 0);

  const downloadCSV = async () => {
    setIsGenerating(prev => ({ ...prev, csv: true }));
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const csvContent = [
      ['Subject', 'Quizzes Completed', 'Accuracy', 'Time Spent', 'Grade'],
      ...studentData.map(row => [row.subject, row.quizzes, row.accuracy, row.timeSpent, row.grade])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_performance_report.csv";
    a.click();
    URL.revokeObjectURL(url);
    
    setIsGenerating(prev => ({ ...prev, csv: false }));
  };

  const downloadPDF = async () => {
    setIsGenerating(prev => ({ ...prev, pdf: true }));
    
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, you would use jsPDF here
    console.log("PDF would be generated here");
    
    setIsGenerating(prev => ({ ...prev, pdf: false }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-800">Student Performance Dashboard</h1>
          <p className="text-slate-600 text-lg">Track progress and download comprehensive reports</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Quizzes</p>
                <p className="text-3xl font-bold text-slate-800">{totalQuizzes}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Average Accuracy</p>
                <p className="text-3xl font-bold text-slate-800">{avgAccuracy}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Study Time</p>
                <p className="text-3xl font-bold text-slate-800">{totalTime}h</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subject Performance Details
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Quizzes Completed</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Accuracy</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Time Spent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Grade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentData.map((row, index) => (
                  <tr key={row.subject} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${row.color}`}></div>
                        <span className="font-medium text-slate-800">{row.subject}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.quizzes}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                        parseInt(row.accuracy) >= 90 ? 'bg-green-100 text-green-800' :
                        parseInt(row.accuracy) >= 80 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {row.accuracy}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.timeSpent}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {row.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${row.color}`}
                          style={{ width: row.accuracy }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-slate-800">Download Reports</h3>
            <p className="text-slate-600">Export student performance data for your records</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={downloadCSV}
                disabled={isGenerating.csv}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isGenerating.csv 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg transform hover:scale-105'
                } text-white min-w-40`}
              >
                {isGenerating.csv ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download CSV
                  </>
                )}
              </button>
              
              <button
                onClick={downloadPDF}
                disabled={isGenerating.pdf}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isGenerating.pdf 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-lg transform hover:scale-105'
                } text-white min-w-40`}
              >
                {isGenerating.pdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}