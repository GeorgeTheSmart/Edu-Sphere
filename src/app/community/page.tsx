// app/community/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Mock data (replace with API call later)
const categoriesData = [
  { id: 1, name: "General Discussion", description: "Talk about anything related to learning." },
  { id: 2, name: "Tech & Development", description: "Discuss coding, frameworks, and projects." },
  { id: 3, name: "Study Resources", description: "Share books, tutorials, and guides." },
  { id: 4, name: "Career Advice", description: "Get guidance on jobs, internships, and skills." },
];

const recentPostsData = [
  {
    id: 101,
    title: "Best resources to learn TypeScript?",
    author: "Alex",
    category: "Tech & Development",
    date: "2025-08-12",
  },
  {
    id: 102,
    title: "Share your favorite productivity hacks",
    author: "Maya",
    category: "General Discussion",
    date: "2025-08-11",
  },
  {
    id: 103,
    title: "Looking for a study partner in AI/ML",
    author: "Ravi",
    category: "Peers",
    date: "2025-08-10",
  },
];

export default function CommunityPage() {
  const [categories, setCategories] = useState(categoriesData);
  const [recentPosts, setRecentPosts] = useState(recentPostsData);


  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
    fetch("/api/recent-posts")
      .then(res => res.json())
      .then(data => setRecentPosts(data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community</h1>
        <Link
          href="/community/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Create Post
        </Link>
      </div>

      {/* Categories */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <h3 className="text-lg font-bold">{cat.name}</h3>
              <p className="text-gray-600">{cat.description}</p>
              <Link
                href={`/community/category/${cat.id}`}
                className="text-blue-500 mt-2 inline-block"
              >
                View Posts →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Posts */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Posts</h2>
        <div className="space-y-4">
          {recentPosts.map((post) => (
            <div
              key={post.id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <Link
                href={`/community/post/${post.id}`}
                className="text-lg font-bold text-blue-600 hover:underline"
              >
                {post.title}
              </Link>
              <p className="text-sm text-gray-500">
                By {post.author} • {post.category} • {post.date}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
