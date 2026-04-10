// app/community/category/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

// Types
interface Category {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  author: string;
  categoryId: number;
  date: string;
}

// Mock categories
const categories: Category[] = [
  { id: 1, name: "General Discussion" },
  { id: 2, name: "Tech & Development" },
  { id: 3, name: "Study Resources" },
  { id: 4, name: "Career Advice" },
];

// Mock posts
const posts: Post[] = [
  {
    id: 101,
    title: "Best resources to learn TypeScript?",
    author: "Alex",
    categoryId: 2,
    date: "2025-08-12",
  },
  {
    id: 102,
    title: "Share your favorite productivity hacks",
    author: "Maya",
    categoryId: 1,
    date: "2025-08-11",
  },
  {
    id: 103,
    title: "Looking for a study partner in AI/ML",
    author: "Ravi",
    categoryId: 2,
    date: "2025-08-10",
  },
  {
    id: 104,
    title: "Best online courses for data science?",
    author: "Priya",
    categoryId: 3,
    date: "2025-08-09",
  },
];

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    const catId = Number(id);
    const foundCategory = categories.find((c) => c.id === catId) || null;
    setCategory(foundCategory);

    const filtered = posts.filter((p) => p.categoryId === catId);
    setFilteredPosts(filtered);
  }, [id]);

  if (!category) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-gray-500">Category not found.</p>
        <Link href="/community" className="text-blue-600 underline">
          ← Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/community" className="text-blue-600 underline mb-4 inline-block">
        ← Back to Community
      </Link>

      <h1 className="text-3xl font-bold mb-4">{category.name}</h1>

      {filteredPosts.length === 0 ? (
        <p className="text-gray-500">No posts in this category yet.</p>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <Link
                href={`/community/post/${post.id}`}
                className="text-lg font-bold text-blue-600 hover:underline"
              >
                {post.title}
              </Link>
              <p className="text-sm text-gray-500">
                By {post.author} • {post.date}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
