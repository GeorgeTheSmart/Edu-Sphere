"use client";

import dynamic from "next/dynamic";
import { Star, Quote } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Dynamically import react-slick (client-side only)
const Slider = dynamic(() => import("react-slick"), { ssr: false });

const testimonials = [
  {
    name: "Aarav Kumar",
    feedback:
      "LearnSphere transformed the way I study! The AI tutor is like having a personal teacher 24/7. The personalized learning paths helped me improve my grades significantly.",
    role: "Student",
    grade: "Class 12",
    rating: 5,
    avatar: "AK",
  },
  {
    name: "Priya Mehta",
    feedback:
      "The adaptive quizzes helped me focus on my weak areas. Highly recommend for exam prep! The detailed analytics showed me exactly where I needed to improve.",
    role: "College Aspirant",
    grade: "JEE Preparation",
    rating: 5,
    avatar: "PM",
  },
  {
    name: "Rahul Verma",
    feedback:
      "As a parent, I love tracking my child's progress. The reports are clear and actionable. It's wonderful to see how engaged my daughter has become with learning.",
    role: "Parent",
    grade: "Parent of Class 10 student",
    rating: 5,
    avatar: "RV",
  },
  {
    name: "Sneha Patel",
    feedback:
      "The gamification elements make learning so much fun! I actually look forward to completing my daily challenges and earning badges.",
    role: "Student",
    grade: "Class 9",
    rating: 5,
    avatar: "SP",
  },
  {
    name: "Dr. Amit Sharma",
    feedback:
      "As an educator, I'm impressed by the quality of content and the adaptive learning technology. It's a valuable supplement to classroom teaching.",
    role: "Teacher",
    grade: "Mathematics Faculty",
    rating: 5,
    avatar: "AS",
  },
];

export default function Testimonials() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 3,
    slidesToScroll: 1,
    pauseOnHover: true,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerMode: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false,
        },
      },
    ],
  };

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex justify-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Header Section */}
        <div className="mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-6">
            <Quote className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
            What Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Learners Say
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of students, parents, and educators who have transformed their learning journey with LearnSphere
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="testimonials-slider">
          <style jsx>{`
            .testimonials-slider .slick-dots {
              bottom: -50px;
            }
            .testimonials-slider .slick-dots li button:before {
              font-size: 12px;
              color: #6366f1;
              opacity: 0.4;
            }
            .testimonials-slider .slick-dots li.slick-active button:before {
              opacity: 1;
              color: #4f46e5;
            }
            .testimonials-slider .slick-slide > div {
              padding: 0 12px;
            }
          `}</style>
          
          <Slider {...settings}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="focus:outline-none">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 mx-3 h-full border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1">
                  {/* Avatar and Rating */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <StarRating rating={testimonial.rating} />
                  </div>

                  {/* Quote */}
                  <div className="relative mb-8">
                    <Quote className="w-8 h-8 text-indigo-200 absolute -top-2 -left-2" />
                    <p className="text-gray-700 text-lg leading-relaxed italic pl-6">
                      {testimonial.feedback}
                    </p>
                  </div>

                  {/* User Info */}
                  <div className="text-center border-t border-gray-100 pt-6">
                    <h4 className="font-bold text-xl text-gray-900 mb-1">
                      {testimonial.name}
                    </h4>
                    <p className="text-indigo-600 font-medium text-sm mb-1">
                      {testimonial.role}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {testimonial.grade}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">50,000+</div>
              <p className="text-gray-600">Active Learners</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">4.9/5</div>
              <p className="text-gray-600">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">95%</div>
              <p className="text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}