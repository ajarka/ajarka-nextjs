'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Code2, 
  Database, 
  Globe, 
  Smartphone, 
  Server, 
  Cloud,
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronRight,
  Play,
  CheckCircle,
  Circle,
  Target
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const roadmaps = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Menjadi ahli dalam pengembangan antarmuka pengguna yang interaktif',
    icon: Globe,
    color: 'bg-blue-500',
    duration: '4-6 bulan',
    level: 'Beginner to Intermediate',
    students: '2,150',
    rating: 4.8,
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue.js', 'TypeScript'],
    phases: [
      {
        title: 'HTML & CSS Fundamentals',
        duration: '3-4 minggu',
        topics: [
          'HTML5 Semantic Elements',
          'CSS Grid & Flexbox',
          'Responsive Design',
          'CSS Animations',
          'Sass/SCSS'
        ],
        status: 'available'
      },
      {
        title: 'JavaScript Programming',
        duration: '4-5 minggu',
        topics: [
          'ES6+ Features',
          'DOM Manipulation',
          'Async/Await & Promises',
          'API Integration',
          'Error Handling'
        ],
        status: 'available'
      },
      {
        title: 'React Development',
        duration: '6-8 minggu',
        topics: [
          'Components & Props',
          'State Management',
          'React Hooks',
          'Context API',
          'React Router'
        ],
        status: 'available'
      },
      {
        title: 'Advanced Frontend',
        duration: '4-6 minggu',
        topics: [
          'TypeScript',
          'Testing (Jest, Cypress)',
          'Build Tools (Webpack, Vite)',
          'Performance Optimization',
          'PWA Development'
        ],
        status: 'available'
      }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'Bangun sistem server yang robust dan scalable',
    icon: Server,
    color: 'bg-green-500',
    duration: '5-7 bulan',
    level: 'Beginner to Advanced',
    students: '1,890',
    rating: 4.9,
    skills: ['Node.js', 'Python', 'Databases', 'APIs', 'Docker', 'AWS'],
    phases: [
      {
        title: 'Programming Fundamentals',
        duration: '4-5 minggu',
        topics: [
          'JavaScript/Python Basics',
          'Data Structures & Algorithms',
          'Object-Oriented Programming',
          'Design Patterns',
          'Version Control (Git)'
        ],
        status: 'available'
      },
      {
        title: 'Server & Database',
        duration: '5-6 minggu',
        topics: [
          'Node.js/Express.js',
          'SQL & NoSQL Databases',
          'Database Design',
          'Query Optimization',
          'Redis & Caching'
        ],
        status: 'available'
      },
      {
        title: 'API Development',
        duration: '4-5 minggu',
        topics: [
          'RESTful APIs',
          'GraphQL',
          'Authentication & Authorization',
          'API Security',
          'Rate Limiting'
        ],
        status: 'available'
      },
      {
        title: 'DevOps & Deployment',
        duration: '6-8 minggu',
        topics: [
          'Docker & Containers',
          'AWS/GCP Services',
          'CI/CD Pipelines',
          'Monitoring & Logging',
          'Load Balancing'
        ],
        status: 'coming_soon'
      }
    ]
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Developer',
    description: 'Kuasai pengembangan web dari frontend hingga backend',
    icon: Code2,
    color: 'bg-purple-500',
    duration: '8-12 bulan',
    level: 'Intermediate to Advanced',
    students: '3,420',
    rating: 4.9,
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Next.js', 'TypeScript'],
    phases: [
      {
        title: 'Frontend Mastery',
        duration: '6-8 minggu',
        topics: [
          'React Advanced Concepts',
          'Next.js Framework',
          'State Management (Redux/Zustand)',
          'TypeScript Integration',
          'UI/UX Best Practices'
        ],
        status: 'available'
      },
      {
        title: 'Backend Development',
        duration: '6-8 minggu',
        topics: [
          'Node.js & Express.js',
          'Database Integration',
          'API Design & Development',
          'Authentication Systems',
          'Error Handling & Validation'
        ],
        status: 'available'
      },
      {
        title: 'Full-Stack Integration',
        duration: '8-10 minggu',
        topics: [
          'Frontend-Backend Communication',
          'Real-time Features (WebSocket)',
          'File Upload & Processing',
          'Payment Integration',
          'Security Implementation'
        ],
        status: 'available'
      },
      {
        title: 'Production & Scaling',
        duration: '6-8 minggu',
        topics: [
          'Deployment Strategies',
          'Performance Optimization',
          'Monitoring & Analytics',
          'Testing & Quality Assurance',
          'Maintenance & Updates'
        ],
        status: 'available'
      }
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile Developer',
    description: 'Develop aplikasi mobile untuk iOS dan Android',
    icon: Smartphone,
    color: 'bg-orange-500',
    duration: '6-8 bulan',
    level: 'Beginner to Advanced',
    students: '1,650',
    rating: 4.7,
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
    phases: [
      {
        title: 'Mobile Fundamentals',
        duration: '3-4 minggu',
        topics: [
          'Mobile Development Overview',
          'Platform Differences (iOS vs Android)',
          'UI/UX for Mobile',
          'Performance Considerations',
          'App Store Guidelines'
        ],
        status: 'available'
      },
      {
        title: 'React Native Development',
        duration: '8-10 minggu',
        topics: [
          'React Native Basics',
          'Navigation & Routing',
          'State Management',
          'Native Modules',
          'Platform-specific Code'
        ],
        status: 'available'
      },
      {
        title: 'Advanced Mobile Features',
        duration: '6-8 minggu',
        topics: [
          'Push Notifications',
          'Camera & Media',
          'Location Services',
          'Background Tasks',
          'Offline Storage'
        ],
        status: 'coming_soon'
      },
      {
        title: 'Publishing & Maintenance',
        duration: '4-5 minggu',
        topics: [
          'App Store Submission',
          'Testing & Debugging',
          'Performance Monitoring',
          'Update Strategies',
          'User Analytics'
        ],
        status: 'coming_soon'
      }
    ]
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    description: 'Otomatisasi deployment dan infrastruktur cloud',
    icon: Cloud,
    color: 'bg-indigo-500',
    duration: '6-9 bulan',
    level: 'Intermediate to Advanced',
    students: '890',
    rating: 4.8,
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Monitoring'],
    phases: [
      {
        title: 'Infrastructure Basics',
        duration: '4-5 minggu',
        topics: [
          'Linux System Administration',
          'Networking Fundamentals',
          'Security Best Practices',
          'Shell Scripting',
          'Version Control Systems'
        ],
        status: 'coming_soon'
      },
      {
        title: 'Containerization',
        duration: '5-6 minggu',
        topics: [
          'Docker Containers',
          'Docker Compose',
          'Container Orchestration',
          'Kubernetes Basics',
          'Microservices Architecture'
        ],
        status: 'coming_soon'
      },
      {
        title: 'Cloud Platforms',
        duration: '6-8 minggu',
        topics: [
          'AWS Services Overview',
          'EC2, S3, RDS',
          'Auto Scaling & Load Balancing',
          'Infrastructure as Code',
          'Cost Optimization'
        ],
        status: 'coming_soon'
      },
      {
        title: 'CI/CD & Monitoring',
        duration: '6-8 minggu',
        topics: [
          'GitLab/GitHub Actions',
          'Automated Testing',
          'Monitoring & Alerting',
          'Log Management',
          'Performance Tuning'
        ],
        status: 'coming_soon'
      }
    ]
  },
  {
    id: 'data',
    title: 'Data Scientist',
    description: 'Analisis data dan machine learning untuk insights bisnis',
    icon: Database,
    color: 'bg-pink-500',
    duration: '7-10 bulan',
    level: 'Beginner to Advanced',
    students: '1,230',
    rating: 4.6,
    skills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Visualization'],
    phases: [
      {
        title: 'Data Fundamentals',
        duration: '4-5 minggu',
        topics: [
          'Python Programming',
          'Statistics & Probability',
          'Data Types & Structures',
          'SQL for Data Analysis',
          'Data Collection Methods'
        ],
        status: 'coming_soon'
      },
      {
        title: 'Data Processing',
        duration: '6-8 minggu',
        topics: [
          'Pandas & NumPy',
          'Data Cleaning & Preprocessing',
          'Exploratory Data Analysis',
          'Data Visualization',
          'Feature Engineering'
        ],
        status: 'coming_soon'
      },
      {
        title: 'Machine Learning',
        duration: '8-10 minggu',
        topics: [
          'Supervised Learning',
          'Unsupervised Learning',
          'Model Evaluation',
          'Deep Learning Basics',
          'MLOps & Deployment'
        ],
        status: 'coming_soon'
      },
      {
        title: 'Advanced Analytics',
        duration: '6-8 minggu',
        topics: [
          'Time Series Analysis',
          'Natural Language Processing',
          'Computer Vision',
          'Big Data Technologies',
          'Business Intelligence'
        ],
        status: 'coming_soon'
      }
    ]
  }
]

export default function RoadmapPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null)
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6 mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full mb-4">
              <Target className="mr-2 h-4 w-4" />
              Learning Roadmaps
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Roadmap Pembelajaran{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Terstruktur
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ikuti jalur pembelajaran yang telah terbukti efektif untuk mencapai karier impian Anda 
              di bidang teknologi. Dari beginner hingga expert level.
            </p>
          </motion.div>

          {/* Roadmap Grid */}
          {!selectedRoadmap ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roadmaps.map((roadmap, index) => (
                <motion.div
                  key={roadmap.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 group hover:scale-105 border-none shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${roadmap.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                          <roadmap.icon className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {roadmap.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {roadmap.title}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {roadmap.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {roadmap.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {roadmap.students}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{roadmap.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({roadmap.students} siswa)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {roadmap.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {roadmap.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{roadmap.skills.length - 4}
                          </Badge>
                        )}
                      </div>

                      <Button 
                        onClick={() => setSelectedRoadmap(roadmap.id)}
                        className="w-full group"
                      >
                        Lihat Detail Roadmap
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Detailed Roadmap View */
            <DetailedRoadmapView 
              roadmap={roadmaps.find(r => r.id === selectedRoadmap)!}
              onBack={() => setSelectedRoadmap(null)}
              expandedPhase={expandedPhase}
              setExpandedPhase={setExpandedPhase}
            />
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!selectedRoadmap && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container px-4 mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-5xl font-bold">
                Siap Memulai Journey Anda?
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Bergabunglah dengan ribuan developer yang telah mencapai karier impian 
                mereka melalui roadmap pembelajaran yang terstruktur.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                  <Link href="/signup">
                    <Play className="mr-2 h-5 w-5" />
                    Mulai Belajar Sekarang
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/hubungi">
                    Konsultasi Gratis
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}

function DetailedRoadmapView({ 
  roadmap, 
  onBack, 
  expandedPhase, 
  setExpandedPhase 
}: { 
  roadmap: any
  onBack: () => void
  expandedPhase: number | null
  setExpandedPhase: (phase: number | null) => void
}) {
  const totalPhases = roadmap.phases.length
  const availablePhases = roadmap.phases.filter((p: any) => p.status === 'available').length
  const progressPercentage = (availablePhases / totalPhases) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Back Button */}
      <Button variant="outline" onClick={onBack} className="mb-6">
        ← Kembali ke Semua Roadmap
      </Button>

      {/* Roadmap Header */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${roadmap.color} text-white`}>
                  <roadmap.icon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{roadmap.title}</h1>
                  <p className="text-muted-foreground">{roadmap.description}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{roadmap.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{roadmap.students} siswa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{roadmap.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {roadmap.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress Roadmap</span>
                  <span className="text-sm text-muted-foreground">{availablePhases}/{totalPhases}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <Button size="lg" className="w-full" asChild>
                <Link href="/signup">
                  <Play className="mr-2 h-5 w-5" />
                  Mulai Roadmap Ini
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Phases */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Fase Pembelajaran</h2>
        
        {roadmap.phases.map((phase: any, index: number) => (
          <Card key={index} className="border-none shadow-md">
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedPhase(expandedPhase === index ? null : index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {phase.status === 'available' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : phase.status === 'coming_soon' ? (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <Circle className="h-6 w-6 text-blue-500" />
                    )}
                    {index < roadmap.phases.length - 1 && (
                      <div className="absolute top-6 left-3 w-0.5 h-8 bg-border" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Fase {index + 1}: {phase.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Durasi: {phase.duration}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {phase.status === 'available' && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Tersedia
                    </Badge>
                  )}
                  {phase.status === 'coming_soon' && (
                    <Badge variant="secondary">
                      Segera Hadir
                    </Badge>
                  )}
                  <ChevronRight className={`h-4 w-4 transition-transform ${
                    expandedPhase === index ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>
            </CardHeader>
            
            {expandedPhase === index && (
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Materi yang akan dipelajari:
                  </h4>
                  <ul className="space-y-2">
                    {phase.topics.map((topic: string, topicIndex: number) => (
                      <li key={topicIndex} className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm">{topic}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {phase.status === 'available' && (
                    <div className="pt-4">
                      <Button className="w-full sm:w-auto" asChild>
                        <Link href="/signup">
                          Mulai Fase Ini
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </motion.div>
  )
}