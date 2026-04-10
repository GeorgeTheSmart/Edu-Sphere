import { NextResponse } from 'next/server';

const categoriesData = [
  { id: 1, name: "General Discussion", description: "Talk about anything related to learning." },
  { id: 2, name: "Tech & Development", description: "Discuss coding, frameworks, and projects." },
  { id: 3, name: "Study Resources", description: "Share books, tutorials, and guides." },
  { id: 4, name: "Career Advice", description: "Get guidance on jobs, internships, and skills." },
];

export async function GET() {
  return NextResponse.json(categoriesData);
}
