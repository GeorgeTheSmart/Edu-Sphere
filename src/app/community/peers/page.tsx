// src/app/community/peers/page.tsx
"use client";

import { useState } from "react";

interface Peer {
  id: number;
  name: string;
  subject: string;
  interests: string[];
  avatar: string;
}

export default function PeersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Dummy data for now
  const peers: Peer[] = [
    {
      id: 1,
      name: "Alice Johnson",
      subject: "Mathematics",
      interests: ["Algebra", "Calculus"],
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 2,
      name: "David Kim",
      subject: "Physics",
      interests: ["Quantum", "Astrophysics"],
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: 3,
      name: "Sophia Lee",
      subject: "Computer Science",
      interests: ["AI", "Web Dev"],
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  ];

  const filteredPeers = peers.filter((peer) => {
    const matchesSearch = peer.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || peer.subject === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Peer Matching</h1>
      <p className="text-gray-600 mb-6">
        Find and connect with learners who share your interests.
      </p>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="All">All Subjects</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Computer Science">Computer Science</option>
        </select>
      </div>

      {/* Peer Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeers.map((peer) => (
          <div
            key={peer.id}
            className="bg-white shadow rounded-lg p-4 flex flex-col items-center text-center"
          >
            <img
              src={peer.avatar}
              alt={peer.name}
              className="w-20 h-20 rounded-full mb-4 object-cover"
            />
            <h2 className="font-semibold text-lg">{peer.name}</h2>
            <p className="text-indigo-500 text-sm">{peer.subject}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {peer.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
