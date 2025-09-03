# 🚀 Ajarka Learning System - Comprehensive Plan

## 🎯 System Overview

### Core Features:
1. **Structured Learning Journey** - Step-by-step progression system
2. **Material Leveling** - Each material has clear prerequisites and difficulty
3. **Assignment Verification** - Students must complete assignments to progress
4. **Level Matching** - Group classes only for students at same level
5. **Skill Verification** - Project + video submission for level jumping
6. **Admin Control** - Full management of materials, levels, and assignments

## 📊 Database Schema

### 1. Learning Materials
```json
{
  "id": "MAT-FE-HTML-001",
  "title": "HTML5 Semantic Elements",
  "category": "frontend|backend|fullstack|mobile|devops|data",
  "subcategory": "fundamental|framework|advanced|specialization",
  "level": 1-100,
  "prerequisites": ["MAT-FE-HTML-000"], // Array of material IDs
  "estimatedHours": 2,
  "meetingsRequired": 1,
  "description": "Learn modern HTML5 semantic elements",
  "learningObjectives": ["Understand semantic HTML", "Use proper HTML structure"],
  "resources": [
    {
      "type": "video|article|documentation|tool",
      "title": "HTML5 Guide",
      "url": "https://...",
      "duration": 30
    }
  ],
  "assignments": ["ASS-FE-HTML-001"],
  "projects": ["PROJ-FE-HTML-001"],
  "skills": ["HTML", "Semantic Markup", "Web Standards"],
  "difficulty": "beginner|intermediate|advanced|expert",
  "isActive": true,
  "createdAt": "2024-12-23T00:00:00.000Z",
  "updatedAt": "2024-12-23T00:00:00.000Z"
}
```

### 2. Learning Journeys
```json
{
  "id": "JOURNEY-FRONTEND-001",
  "title": "Frontend Developer Journey",
  "description": "Complete path to becoming a Frontend Developer",
  "category": "frontend",
  "totalLevels": 50,
  "estimatedDuration": "4-6 months",
  "phases": [
    {
      "id": "PHASE-1",
      "title": "HTML & CSS Fundamentals",
      "description": "Master the basics of web markup and styling",
      "levels": [1, 10],
      "materials": ["MAT-FE-HTML-001", "MAT-FE-CSS-001"],
      "assignments": ["ASS-FE-FUNDAMENTAL-001"],
      "projects": ["PROJ-FE-PORTFOLIO-001"],
      "estimatedDuration": "3-4 weeks"
    }
  ],
  "prerequisites": [],
  "skills": ["HTML", "CSS", "JavaScript", "React"],
  "certificationProject": "PROJ-FE-CAPSTONE-001",
  "isActive": true
}
```

### 3. Assignments
```json
{
  "id": "ASS-FE-HTML-001",
  "title": "Create Semantic HTML Page",
  "description": "Build a complete webpage using semantic HTML5 elements",
  "materialId": "MAT-FE-HTML-001",
  "journeyId": "JOURNEY-FRONTEND-001",
  "level": 1,
  "type": "coding|quiz|project|essay",
  "instructions": "Create a blog post layout using semantic HTML...",
  "requirements": [
    "Use at least 5 different semantic elements",
    "Include proper meta tags",
    "Validate HTML using W3C validator"
  ],
  "submissionFormat": "github_repo|file_upload|text|video",
  "maxAttempts": 3,
  "passingScore": 80,
  "timeLimit": 7200, // seconds
  "resources": ["https://developer.mozilla.org/..."],
  "rubric": [
    {
      "criteria": "Semantic HTML Usage",
      "points": 40,
      "description": "Proper use of semantic elements"
    }
  ],
  "isActive": true
}
```

### 4. Projects
```json
{
  "id": "PROJ-FE-PORTFOLIO-001",
  "title": "Personal Portfolio Website",
  "description": "Build a complete portfolio website",
  "type": "individual|group|capstone",
  "level": 5,
  "journeyId": "JOURNEY-FRONTEND-001",
  "prerequisites": ["MAT-FE-HTML-001", "MAT-FE-CSS-001"],
  "estimatedHours": 20,
  "requirements": [
    "Responsive design",
    "Modern CSS techniques",
    "GitHub deployment",
    "Video explanation (max 5 minutes)"
  ],
  "submissionRequirements": {
    "githubRepo": true,
    "liveDemo": true,
    "videoExplanation": {
      "required": true,
      "maxDuration": 300, // 5 minutes
      "topics": ["Design decisions", "Technical challenges", "Learning outcomes"]
    },
    "documentation": true
  },
  "evaluationCriteria": [
    {
      "name": "Code Quality",
      "weight": 30,
      "description": "Clean, readable, maintainable code"
    },
    {
      "name": "Design & UX",
      "weight": 25,
      "description": "User experience and visual design"
    },
    {
      "name": "Technical Implementation",
      "weight": 25,
      "description": "Proper use of technologies"
    },
    {
      "name": "Video Explanation",
      "weight": 20,
      "description": "Clear explanation of project"
    }
  ],
  "isActive": true
}
```

### 5. Student Progress
```json
{
  "id": "PROGRESS-STUDENT-3",
  "studentId": 3,
  "journeyId": "JOURNEY-FRONTEND-001",
  "currentLevel": 15,
  "currentPhase": "PHASE-2",
  "status": "active|paused|completed|dropped",
  "startedAt": "2024-12-01T00:00:00.000Z",
  "completedMaterials": ["MAT-FE-HTML-001", "MAT-FE-CSS-001"],
  "completedAssignments": [
    {
      "assignmentId": "ASS-FE-HTML-001",
      "score": 85,
      "attempts": 1,
      "completedAt": "2024-12-05T10:00:00.000Z",
      "feedback": "Great use of semantic elements!"
    }
  ],
  "completedProjects": [
    {
      "projectId": "PROJ-FE-PORTFOLIO-001",
      "score": 88,
      "submissionUrl": "https://github.com/student/portfolio",
      "liveUrl": "https://student.github.io/portfolio",
      "videoUrl": "https://youtube.com/watch?v=...",
      "completedAt": "2024-12-10T15:30:00.000Z",
      "feedback": "Excellent project implementation!"
    }
  ],
  "skillsAcquired": ["HTML", "CSS", "Responsive Design"],
  "certificates": ["CERT-FE-FUNDAMENTAL-001"],
  "nextMaterial": "MAT-FE-JS-001",
  "estimatedCompletion": "2025-04-01T00:00:00.000Z",
  "updatedAt": "2024-12-20T00:00:00.000Z"
}
```

### 6. Level Verification (for Level Jumping)
```json
{
  "id": "VERIFICATION-3-FRONTEND-10",
  "studentId": 3,
  "journeyId": "JOURNEY-FRONTEND-001",
  "targetLevel": 10,
  "type": "level_jump|skill_assessment",
  "status": "pending|in_review|approved|rejected",
  "requirements": [
    {
      "type": "assignment",
      "assignmentId": "ASS-FE-VERIFICATION-001",
      "status": "completed",
      "score": 90
    },
    {
      "type": "project",
      "projectId": "PROJ-FE-VERIFICATION-001",
      "status": "completed",
      "score": 85
    }
  ],
  "submissions": [
    {
      "type": "github_project",
      "url": "https://github.com/student/verification-project",
      "liveUrl": "https://student.github.io/verification",
      "submittedAt": "2024-12-15T10:00:00.000Z"
    },
    {
      "type": "video_explanation",
      "url": "https://youtube.com/watch?v=verification",
      "duration": 280, // 4 minutes 40 seconds
      "submittedAt": "2024-12-15T11:00:00.000Z"
    }
  ],
  "reviewedBy": 1, // admin ID
  "reviewedAt": "2024-12-16T14:00:00.000Z",
  "feedback": "Excellent understanding of concepts. Approved for level 10.",
  "approvedLevel": 10,
  "createdAt": "2024-12-15T09:00:00.000Z"
}
```

### 7. Mentor Schedule Enhancement
```json
{
  // Existing mentor_schedules fields plus:
  "materialId": "MAT-FE-HTML-001",
  "requiredLevel": 1,
  "maxLevelGap": 2, // Students can be max 2 levels apart
  "verificationRequired": true,
  "autoLevelCheck": true,
  "allowLevelJumpers": false
}
```

## 🔧 Admin Management Features

### 1. **Material Management**
- Create/edit learning materials
- Set prerequisites and levels
- Manage assignments and projects
- Configure video duration limits

### 2. **Journey Builder**
- Visual journey editor
- Drag-and-drop material sequencing
- Phase management
- Prerequisites validation

### 3. **Assignment Creator**
- Multiple assignment types
- Rubric builder
- Auto-grading setup
- Resource management

### 4. **Verification System**
- Review student submissions
- Approve/reject level jumps
- Batch evaluation tools
- Feedback management

## 👨‍🎓 Student Experience

### 1. **Journey Dashboard**
- Progress visualization
- Current assignments
- Next materials
- Skill tree view

### 2. **Assignment Workspace**
- Integrated code editor
- Submission tracking
- Feedback display
- Retry management

### 3. **Project Submission**
- GitHub integration
- Video upload/link
- Progress tracking
- Peer review (optional)

### 4. **Level Verification**
- Assessment requests
- Submission portal
- Progress tracking
- Certificate generation

## 🏗️ Implementation Phases

### Phase 1: Core Structure (Week 1-2)
- Database schema setup
- Basic material management
- Journey framework
- Student progress tracking

### Phase 2: Assignment System (Week 3-4)
- Assignment creation/submission
- Auto-grading system
- Feedback mechanism
- Progress updates

### Phase 3: Level Verification (Week 5-6)
- Verification workflow
- Project submission system
- Video upload integration
- Admin review interface

### Phase 4: Advanced Features (Week 7-8)
- GitHub integration
- Certificate generation
- Analytics dashboard
- Mobile optimization

## 🎯 Success Metrics

### Student Metrics
- Completion rates per material
- Assignment success rates
- Time to completion
- Skill acquisition tracking

### System Metrics
- Level jump approval rates
- Mentor satisfaction scores
- Class size optimization
- Learning outcome validation

This comprehensive system ensures structured learning with proper verification and level matching for optimal educational outcomes.