import { NextResponse } from 'next/server';

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

export async function GET() {
  return NextResponse.json(recentPostsData);
}
