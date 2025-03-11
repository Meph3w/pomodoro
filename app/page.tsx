"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import Head from "next/head"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

export default function PomodoroTimer() {
  const [sessionLength, setSessionLength] = useState(25)
  const [breakLength, setBreakLength] = useState(5)
  const [timeLeft, setTimeLeft] = useState(sessionLength * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isSession, setIsSession] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "default">("default")
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { language } = useLanguage()
  const t = translations[language]

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "denied" && Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission)
        })
      } else {
        setNotificationPermission(Notification.permission)
      }
    }
  }, [])

  // Reset timer when session or break length changes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(sessionLength * 60)
    }
  }, [sessionLength, isRunning])

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Switch between session and break
            const newIsSession = !isSession
            const newTimeLeft = newIsSession ? sessionLength * 60 : breakLength * 60
            setIsSession(newIsSession)

            // Send notification if permission is granted
            if (notificationPermission === "granted") {
              const notificationTitle = newIsSession ? t.sessionStarted : t.breakStarted
              const notificationBody = newIsSession ? t.timeToFocus : t.timeToRest

              new Notification(notificationTitle, {
                body: notificationBody,
                icon: newIsSession
                  ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ALARMEVERMELHO-XAfCNsHBhbml97ZqHiXPmonFvz8VPM.png"
                  : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ALARMEVERDE-vRhi5bGh3gbkbOP3saHU3zkVZ2O8v1.png",
              })
            }

            return newTimeLeft
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, isSession, sessionLength, breakLength, notificationPermission, t])

  // Update favicon based on current mode
  useEffect(() => {
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement
    if (link) {
      link.href = isSession
        ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ALARMEVERMELHO-XAfCNsHBhbml97ZqHiXPmonFvz8VPM.png" // Red icon for session
        : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ALARMEVERDE-vRhi5bGh3gbkbOP3saHU3zkVZ2O8v1.png" // Green icon for break
    }
  }, [isSession])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle start/stop
  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  // Handle reset
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsRunning(false)
    setIsSession(true)
    setTimeLeft(sessionLength * 60)
  }

  // Handle session length change
  const handleSessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= 60) {
      setSessionLength(value)
    }
  }

  // Handle break length change
  const handleBreakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= 60) {
      setBreakLength(value)
    }
  }

  // Split time for flip clock
  const timeString = formatTime(timeLeft)
  const [minutes, seconds] = timeString.split(":")

  return (
    <>
      <Head>
        <title>Pomodoro Clock</title>
        <link
          rel="icon"
          href={
            isSession
              ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ALARMEVERMELHO-XAfCNsHBhbml97ZqHiXPmonFvz8VPM.png"
              : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ALARMEVERDE-vRhi5bGh3gbkbOP3saHU3zkVZ2O8v1.png"
          }
        />
      </Head>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-[#161616] py-4 px-6 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-white text-2xl font-bold">Pomodoro Clock</h1>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ALARMEVERDE-vRhi5bGh3gbkbOP3saHU3zkVZ2O8v1.png"
              alt="Pomodoro Clock Icon"
              width={24}
              height={24}
              className="ml-2"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="p-1 h-8 w-8"
              onClick={() => window.dispatchEvent(new CustomEvent("changeLanguage", { detail: "pt" }))}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BRASIL-cnLDWQjpBh5sqi7G6DnVFU0lI64cC9.png"
                alt="Brazil"
                width={24}
                height={24}
                className="rounded-sm"
              />
            </Button>
            <Button
              variant="ghost"
              className="p-1 h-8 w-8"
              onClick={() => window.dispatchEvent(new CustomEvent("changeLanguage", { detail: "en" }))}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EUA-yPaJk27bMwsT85yQSCXIzSFhcqkvAV.png"
                alt="USA"
                width={24}
                height={24}
                className="rounded-sm"
              />
            </Button>
            <Button
              variant="ghost"
              className="p-1 h-8 w-8"
              onClick={() => window.dispatchEvent(new CustomEvent("changeLanguage", { detail: "es" }))}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ESPANHA-bGHfN5hEHXRg4UGGJoR9buTBdDQEM7.png"
                alt="Spain"
                width={24}
                height={24}
                className="rounded-sm"
              />
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col">
          {/* Timer section */}
          <div
            className={cn(
              "flex-1 flex flex-col items-center justify-center p-6 transition-colors duration-500",
              isSession ? "bg-[#161616]" : "bg-[#46d460]",
            )}
          >
            <div className="mb-8 flex gap-8 flex-wrap justify-center">
              <div className="flex flex-col items-center">
                <Label htmlFor="session-length" className={cn("mb-2 text-lg", isSession ? "text-white" : "text-black")}>
                  {t.sessionLength}
                </Label>
                <Input
                  id="session-length"
                  type="number"
                  min="1"
                  max="60"
                  value={sessionLength}
                  onChange={handleSessionChange}
                  className="w-20 text-center"
                  disabled={isRunning}
                />
              </div>
              <div className="flex flex-col items-center">
                <Label htmlFor="break-length" className={cn("mb-2 text-lg", isSession ? "text-white" : "text-black")}>
                  {t.breakLength}
                </Label>
                <Input
                  id="break-length"
                  type="number"
                  min="1"
                  max="60"
                  value={breakLength}
                  onChange={handleBreakChange}
                  className="w-20 text-center"
                  disabled={isRunning}
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className={cn("text-xl mb-4 text-center", isSession ? "text-white" : "text-black")}>
                {isSession ? t.session : t.break}
              </h2>
              <div className="flip-clock">
                <FlipClockDisplay value={minutes + seconds} isSession={isSession} />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={toggleTimer}
                className={cn(
                  "px-8 font-medium",
                  isRunning ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white",
                )}
              >
                {isRunning ? t.stop : t.start}
              </Button>
              <Button onClick={resetTimer} className={cn("px-8 font-medium bg-blue-600 hover:bg-blue-700 text-white")}>
                {t.reset}
              </Button>
            </div>
          </div>

          {/* SEO Text section */}
          <div className="bg-white p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">{t.articleTitle}</h2>

              <div dangerouslySetInnerHTML={{ __html: t.articleContent }} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#161616] py-4 px-6 text-white text-center">
          <p>
            Pomodoro Clock, by{" "}
            <a href="https://www.blog.eidoc.com.br/" className="underline hover:text-primary">
              Ei, Doc!
            </a>
            . All rights reserved.
          </p>
        </footer>
      </div>
    </>
  )
}

// Flip Clock Display Component
function FlipClockDisplay({ value, isSession }: { value: string; isSession: boolean }) {
  return (
    <div className="flex justify-center">
      {value.split("").map((digit, index) => (
        <div
          key={index}
          className={cn(
            "flip-card relative mx-1 w-16 h-24 md:w-20 md:h-28 rounded-md overflow-hidden shadow-lg",
            isSession ? "bg-black text-white" : "bg-white text-black",
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl font-bold">
            {digit}
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gray-600 opacity-30"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-600 opacity-30"></div>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gray-600 opacity-50"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

