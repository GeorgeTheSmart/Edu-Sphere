"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiBase";

interface Profile {
  name: string;
  email: string;
  // add other fields your API returns
}

export default function DashboardProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("No user ID found in local storage.");
      return;
    }

    apiFetch(`/dashboard/${userId}`)
      .then(async (res) => {
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const data: Profile = await res.json();
          if (!res.ok) {
            throw new Error((data as any).detail || "Error fetching profile");
          }
          return data;
        } else {
          const text = await res.text();
          throw new Error(`Unexpected response: ${text.slice(0, 100)}...`);
        }
      })
      .then((data) => {
        setProfile(data);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      });
  }, []);

  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {profile.name}</h1>
      <p>Email: {profile.email}</p>
    </div>
  );
}
