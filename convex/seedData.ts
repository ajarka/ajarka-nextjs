import { mutation } from "./_generated/server";

export const seedLearningData = mutation({
  args: {},
  handler: async (ctx) => {
    // Create sample learning materials
    const frontendMaterial1 = await ctx.db.insert("learningMaterials", {
      title: "HTML & CSS Fundamentals",
      category: "frontend",
      subcategory: "fundamental",
      level: 1,
      prerequisites: [],
      estimatedHours: 40,
      meetingsRequired: 8,
      description: "Learn the basics of HTML and CSS to create beautiful web pages",
      learningObjectives: [
        "Understand HTML structure and semantics",
        "Master CSS styling and layout",
        "Create responsive designs",
        "Build your first website"
      ],
      resources: [
        {
          type: "video",
          title: "HTML Crash Course",
          url: "https://example.com/html-course",
          duration: 120
        },
        {
          type: "documentation",
          title: "MDN HTML Guide",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
          duration: 0
        }
      ],
      assignments: ["Build a personal portfolio page", "Create a landing page"],
      projects: ["Personal Website Project"],
      skills: ["HTML", "CSS", "Responsive Design", "Web Development"],
      difficulty: "beginner",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const frontendMaterial2 = await ctx.db.insert("learningMaterials", {
      title: "JavaScript Fundamentals",
      category: "frontend",
      subcategory: "fundamental",
      level: 2,
      prerequisites: ["HTML & CSS Fundamentals"],
      estimatedHours: 60,
      meetingsRequired: 12,
      description: "Master JavaScript programming language for web development",
      learningObjectives: [
        "Understand JavaScript syntax and concepts",
        "Work with DOM manipulation",
        "Handle events and user interactions",
        "Build interactive web applications"
      ],
      resources: [
        {
          type: "video",
          title: "JavaScript Complete Course",
          url: "https://example.com/js-course",
          duration: 180
        },
        {
          type: "tool",
          title: "JavaScript Playground",
          url: "https://codepen.io",
          duration: 0
        }
      ],
      assignments: ["Build a calculator", "Create a todo app"],
      projects: ["Interactive Quiz Application"],
      skills: ["JavaScript", "DOM Manipulation", "Event Handling", "ES6+"],
      difficulty: "beginner",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const reactMaterial = await ctx.db.insert("learningMaterials", {
      title: "React.js Framework",
      category: "frontend",
      subcategory: "framework",
      level: 5,
      prerequisites: ["JavaScript Fundamentals"],
      estimatedHours: 80,
      meetingsRequired: 16,
      description: "Learn React.js to build modern, component-based user interfaces",
      learningObjectives: [
        "Understand React components and JSX",
        "Master state management and props",
        "Work with React hooks",
        "Build scalable React applications"
      ],
      resources: [
        {
          type: "video",
          title: "React Complete Guide",
          url: "https://example.com/react-course",
          duration: 240
        },
        {
          type: "documentation",
          title: "React Official Docs",
          url: "https://react.dev",
          duration: 0
        }
      ],
      assignments: ["Build React components", "State management exercises"],
      projects: ["E-commerce Frontend", "Social Media Dashboard"],
      skills: ["React", "JSX", "Hooks", "Component Architecture", "State Management"],
      difficulty: "intermediate",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create sample roadmaps
    const frontendRoadmap = await ctx.db.insert("roadmaps", {
      title: "Frontend Development Mastery",
      description: "Complete path to become a professional frontend developer",
      targetAudience: ["Beginners", "Career Switchers", "Students"],
      estimatedDuration: "6-8 months",
      difficultyLevel: "beginner",
      skills: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Web APIs"],
      prerequisites: ["Basic computer skills", "English proficiency"],
      learningPath: [
        {
          stepNumber: 1,
          title: "Web Fundamentals",
          description: "Learn HTML, CSS, and basic web concepts",
          estimatedHours: 40,
          materials: [frontendMaterial1.toString()],
          courses: [],
          assessments: ["HTML/CSS Project"]
        },
        {
          stepNumber: 2,
          title: "JavaScript Programming",
          description: "Master JavaScript for interactive web development",
          estimatedHours: 60,
          materials: [frontendMaterial2.toString()],
          courses: [],
          assessments: ["JavaScript Quiz App"]
        },
        {
          stepNumber: 3,
          title: "Modern Frameworks",
          description: "Build applications with React.js",
          estimatedHours: 80,
          materials: [reactMaterial.toString()],
          courses: [],
          assessments: ["React Portfolio Project"]
        }
      ],
      createdBy: "admin" as any, // This would be a real user ID in production
      isPublic: true,
      isActive: true,
      tags: ["frontend", "web development", "beginner-friendly"],
      thumbnail: "/roadmaps/frontend-thumbnail.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const fullstackRoadmap = await ctx.db.insert("roadmaps", {
      title: "Full-Stack Development Journey",
      description: "Complete roadmap to become a full-stack developer with modern technologies",
      targetAudience: ["Intermediate Developers", "Frontend Developers", "Backend Developers"],
      estimatedDuration: "12-15 months",
      difficultyLevel: "intermediate",
      skills: ["React", "Node.js", "Database Design", "API Development", "DevOps", "Testing"],
      prerequisites: ["Basic programming knowledge", "HTML/CSS/JavaScript"],
      learningPath: [
        {
          stepNumber: 1,
          title: "Frontend Mastery",
          description: "Advanced frontend development with React ecosystem",
          estimatedHours: 120,
          materials: [reactMaterial.toString()],
          courses: [],
          assessments: ["Advanced React Project"]
        },
        {
          stepNumber: 2,
          title: "Backend Development",
          description: "Server-side development with Node.js and databases",
          estimatedHours: 100,
          materials: [],
          courses: [],
          assessments: ["REST API Project"]
        },
        {
          stepNumber: 3,
          title: "Full-Stack Integration",
          description: "Connect frontend and backend for complete applications",
          estimatedHours: 80,
          materials: [],
          courses: [],
          assessments: ["Full-Stack Capstone Project"]
        }
      ],
      createdBy: "admin" as any,
      isPublic: true,
      isActive: true,
      tags: ["fullstack", "advanced", "professional"],
      thumbnail: "/roadmaps/fullstack-thumbnail.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      message: "Sample learning data created successfully",
      materialsCreated: 3,
      roadmapsCreated: 2,
      materials: [frontendMaterial1, frontendMaterial2, reactMaterial],
      roadmaps: [frontendRoadmap, fullstackRoadmap]
    };
  },
});