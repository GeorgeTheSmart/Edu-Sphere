export const courses = [
  {
    id: '1',
    title: 'React for Beginners',
    description: 'Learn the basics of React, including components, props, and state.',
    overview: `This course introduces you to React's fundamentals, helping you build dynamic user interfaces.`,
    lessons: [
      'Introduction to React',
      'Components and Props',
      'State and Lifecycle',
      'Handling Events',
      'Conditional Rendering'
    ],
    resources: [
      { name: 'React Docs', link: 'https://react.dev/' },
      { name: 'React Cheatsheet', link: 'https://reactcheatsheet.com/' }
    ]
  },
  {
    id: '2',
    title: 'Next.js Crash Course',
    description: 'Master server-side rendering and static site generation with Next.js.',
    overview: `This course covers the essentials of Next.js for building fast, SEO-friendly websites.`,
    lessons: [
      'Introduction to Next.js',
      'Pages and Routing',
      'Data Fetching (SSR, SSG)',
      'API Routes',
      'Deploying Next.js Apps'
    ],
    resources: [
      { name: 'Next.js Docs', link: 'https://nextjs.org/docs' }
    ]
  },
  {
    id: '3',
    title: 'Tailwind CSS Mastery',
    description: 'Design beautiful UIs faster with Tailwind CSS.',
    overview: `Learn how to use Tailwind's utility-first classes to create responsive designs quickly.`,
    lessons: [
      'Tailwind Setup',
      'Utility Classes',
      'Responsive Design',
      'Custom Themes',
      'Dark Mode'
    ],
    resources: [
      { name: 'Tailwind Docs', link: 'https://tailwindcss.com/docs' }
    ]
  }
];
