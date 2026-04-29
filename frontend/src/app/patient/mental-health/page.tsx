"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Brain,
  Heart,
  Shield,
  Phone,
  BookOpen,
  Play,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  Headphones,
  Wind,
} from "lucide-react"

const phq9Questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly, or being fidgety/restless",
  "Thoughts that you would be better off dead or of hurting yourself",
]

const answerOptions = [
  { value: "0", label: "Not at all" },
  { value: "1", label: "Several days" },
  { value: "2", label: "More than half the days" },
  { value: "3", label: "Nearly every day" },
]

const therapists = [
  {
    name: "Dr. Amanda Foster",
    specialty: "Clinical Psychologist",
    avatar: "AF",
    rating: 4.9,
    availability: "Next: Tomorrow, 2:00 PM",
    focus: ["Anxiety", "Depression", "Stress Management"],
  },
  {
    name: "Dr. Robert Kim",
    specialty: "Psychiatrist",
    avatar: "RK",
    rating: 4.8,
    availability: "Next: Jan 20, 10:00 AM",
    focus: ["Medication Management", "Mood Disorders"],
  },
  {
    name: "Lisa Thompson, LCSW",
    specialty: "Licensed Clinical Social Worker",
    avatar: "LT",
    rating: 4.7,
    availability: "Next: Today, 5:00 PM",
    focus: ["CBT", "Mindfulness", "Life Transitions"],
  },
]

const resources = [
  {
    title: "Understanding Anxiety",
    type: "Article",
    icon: BookOpen,
    duration: "5 min read",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Guided Breathing Exercise",
    type: "Audio",
    icon: Wind,
    duration: "10 min",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Progressive Muscle Relaxation",
    type: "Audio",
    icon: Headphones,
    duration: "15 min",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Coping with Stress",
    type: "Article",
    icon: BookOpen,
    duration: "8 min read",
    color: "bg-amber-500/10 text-amber-600",
  },
]

type ScreeningState = "intro" | "questions" | "results"

export default function MentalHealthPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const [screeningState, setScreeningState] = useState<ScreeningState>("intro")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace("/auth/sign-in?redirect_url=/patient/mental-health")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) {
    return null
  }

  const totalScore = Object.values(answers).reduce(
    (sum, val) => sum + parseInt(val || "0"),
    0
  )

  const getSeverity = (score: number) => {
    if (score <= 4) return { level: "Minimal", color: "text-emerald-600", bg: "bg-emerald-500/10", description: "Your responses suggest minimal symptoms. Continue maintaining your mental wellness habits." }
    if (score <= 9) return { level: "Mild", color: "text-blue-600", bg: "bg-blue-500/10", description: "Your responses suggest mild symptoms. Consider implementing self-care strategies and monitoring how you feel over the next few weeks." }
    if (score <= 14) return { level: "Moderate", color: "text-amber-600", bg: "bg-amber-500/10", description: "Your responses suggest moderate symptoms. We recommend speaking with a mental health professional for personalized support." }
    return { level: "Severe", color: "text-destructive", bg: "bg-destructive/10", description: "Your responses suggest significant symptoms. We strongly recommend connecting with a mental health professional as soon as possible." }
  }

  const severity = getSeverity(totalScore)
  const progressPercent = ((currentQuestion + 1) / phq9Questions.length) * 100

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Mental Health & Wellness
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-powered mental health screening and resources
        </p>
      </div>

      {screeningState === "intro" && (
        <>
          {/* Hero Section */}
          <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="flex flex-col items-center text-center py-10 gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  AI Mental Health Screening
                </h2>
                <p className="mt-2 max-w-lg text-sm text-muted-foreground leading-relaxed">
                  Take a confidential, evidence-based screening to understand your mental
                  health. This assessment uses the PHQ-9, a clinically validated
                  questionnaire used by healthcare professionals worldwide.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Your responses are confidential and protected by HIPAA</span>
              </div>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-2"
                onClick={() => setScreeningState("questions")}
              >
                <Sparkles className="h-4 w-4" />
                Start AI Screening
              </Button>
            </CardContent>
          </Card>

          {/* Resources */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">
              Wellness Resources
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {resources.map((resource, idx) => (
                <Card key={idx} className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${resource.color}`}>
                      <resource.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 font-semibold text-sm text-card-foreground">
                      {resource.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
                      <span>{resource.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Crisis Resources */}
          <Card className="border border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <Phone className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">
                  Need Immediate Help?
                </h3>
                <p className="text-sm text-muted-foreground">
                  If you are in crisis, please reach out to these resources immediately.
                </p>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-sm font-bold text-destructive">988 Suicide & Crisis Lifeline</span>
                <span className="text-xs text-muted-foreground">Call or text 988</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {screeningState === "questions" && (
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-card-foreground">
                PHQ-9 Screening
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {phq9Questions.length}
              </span>
            </div>
            <Progress value={progressPercent} className="mt-2 h-2" />
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-2">
                Over the last 2 weeks, how often have you been bothered by:
              </p>
              <h3 className="text-lg font-semibold text-card-foreground">
                {phq9Questions[currentQuestion]}
              </h3>
            </div>

            <RadioGroup
              value={answers[currentQuestion] || ""}
              onValueChange={(value) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion]: value }))
              }
              className="flex flex-col gap-3"
            >
              {answerOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <RadioGroupItem value={option.value} id={`q${currentQuestion}-${option.value}`} />
                  <Label
                    htmlFor={`q${currentQuestion}-${option.value}`}
                    className="flex-1 cursor-pointer text-sm text-card-foreground"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="gap-1 border-border text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              {currentQuestion < phq9Questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  disabled={!answers[currentQuestion]}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setScreeningState("results")}
                  disabled={!answers[currentQuestion]}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                >
                  <Sparkles className="h-4 w-4" />
                  View Results
                </Button>
              )}
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground rounded-lg bg-muted/30 p-3">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Your responses are kept confidential. This screening is not a diagnosis.
                Please consult a mental health professional for clinical assessment.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {screeningState === "results" && (
        <>
          <Card className="border border-border bg-card shadow-sm">
            <CardContent className="py-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${severity.bg}`}>
                  {totalScore <= 9 ? (
                    <CheckCircle2 className={`h-8 w-8 ${severity.color}`} />
                  ) : (
                    <AlertTriangle className={`h-8 w-8 ${severity.color}`} />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Score</p>
                  <p className="text-4xl font-bold text-foreground mt-1">
                    {totalScore}
                    <span className="text-lg text-muted-foreground"> / 27</span>
                  </p>
                  <Badge className={`${severity.bg} ${severity.color} border-0 mt-2 text-sm`}>
                    {severity.level} Symptoms
                  </Badge>
                </div>
                <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
                  {severity.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Therapists */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">
              Recommended Professionals
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {therapists.map((therapist, idx) => (
                <Card key={idx} className="border border-border bg-card shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {therapist.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-card-foreground text-sm">
                          {therapist.name}
                        </h3>
                        <p className="text-xs text-primary">{therapist.specialty}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {therapist.focus.map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {therapist.availability}
                    </p>
                    <Button className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                      Book Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setScreeningState("intro")
                setCurrentQuestion(0)
                setAnswers({})
              }}
              className="border-border text-foreground"
            >
              Take Again
            </Button>
            <Button variant="outline" className="border-border text-foreground">
              Download Report
            </Button>
          </div>

          {/* Crisis Resources */}
          <Card className="border border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                <Phone className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">Crisis Resources</h3>
                <div className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
                  <span>988 Suicide & Crisis Lifeline: Call or text 988</span>
                  <span>Crisis Text Line: Text HOME to 741741</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
