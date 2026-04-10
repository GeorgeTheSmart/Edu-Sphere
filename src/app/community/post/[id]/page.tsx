"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Comment {
  id: number;
  author: string;
  text: string;
}

interface Post {
  id: number;
  title: string;
  author: string;
  category: string;
  date: string;
  content: string;
  comments: Comment[];
}

const mockPosts: Post[] = [
  {
    id: 101,
    title: "Best resources to learn TypeScript?",
    author: "Alex",
    category: "Tech & Development",
    date: "2025-08-12",
    content:
      "I’m looking for the best beginner-friendly and advanced resources to learn TypeScript. Suggestions?",
    comments: [
      { id: 1, author: "Maya", text: "I recommend the official docs + TypeScript Deep Dive book." },
      { id: 2, author: "Ravi", text: "Check out YouTube tutorials by 'Basarat' and freeCodeCamp." },
    ],
  },
  {
    id: 102,
    title: "Share your favorite productivity hacks",
    author: "Maya",
    category: "General Discussion",
    date: "2025-08-11",
    content: "What are your best tips for staying productive while studying online?",
    comments: [
      { id: 1, author: "Alex", text: "Pomodoro technique + Notion for task tracking!" },
      { id: 2, author: "Ravi", text: "Turn off all notifications when studying." },
    ],
  },
];

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const foundPost = mockPosts.find((p) => p.id === Number(id)) || null;
    setPost(foundPost);
  }, [id]);

  if (!post) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-gray-500">Post not found.</p>
        <Link href="/community" className="text-blue-600 underline">
          ← Back to Community
        </Link>
      </div>
    );
  }

  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;
    const newCommentObj: Comment = {
      id: post.comments.length + 1,
      author: "You", // Replace with logged-in user later
      text: newComment,
    };
    setPost({ ...post, comments: [...post.comments, newCommentObj] });
    setNewComment("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back link */}
      <Link href="/community" className="text-blue-600 underline mb-4 inline-block">
        ← Back to Community
      </Link>

      {/* Post details */}
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-500 text-sm mb-4">
        By {post.author} • {post.category} • {post.date}
      </p>
      <p className="mb-6">{post.content}</p>

      {/* Comments */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        <div className="space-y-4 mb-6">
          {post.comments.map((comment) => (
            <div key={comment.id} className="border rounded p-3">
              <p className="font-medium">{comment.author}</p>
              <p className="text-gray-700">{comment.text}</p>
            </div>
          ))}
        </div>

        {/* Add comment form */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post
          </button>
        </form>
      </section>
    </div>
  );
}
