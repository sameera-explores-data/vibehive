"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { Filter } from "bad-words"

const filter = new Filter()

export default function Home() {

  const [questions, setQuestions] = useState<any[]>([])
  const [questionText, setQuestionText] = useState("")

  async function loadQuestions() {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false })

    setQuestions(data || [])
  }

  useEffect(() => {
    loadQuestions()
  }, [])

  async function submitQuestion() {

    if (filter.isProfane(questionText)) {
      alert("Inappropriate language detected")
      return
    }

    await supabase.from("questions").insert({
      author_name: "Student",
      class_details: "Class",
      subject: "Computer Science",
      lesson_name: "Lesson",
      question_text: questionText,
      ai_guidance: "Think about the core concept behind this question. Break the problem into smaller steps and review your lesson notes."
    })

    setQuestionText("")
    loadQuestions()
  }

  return (
    <main style={{ maxWidth: "700px", margin: "auto", padding: "40px" }}>

      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "30px" }}>
        VibeHive
      </h1>

      <div style={{
        border: "4px solid black",
        padding: "20px",
        marginBottom: "40px"
      }}>

        <textarea
          style={{ width: "100%", height: "100px", marginBottom: "10px" }}
          placeholder="Ask an academic question..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />

        <button
          onClick={submitQuestion}
          style={{
            background: "#8B5CF6",
            color: "white",
            padding: "10px 20px",
            border: "3px solid black"
          }}
        >
          Submit Question
        </button>

      </div>

      {questions.map((q) => (

        <div key={q.id}
          style={{
            border: "4px solid black",
            padding: "20px",
            marginBottom: "20px"
          }}>

          <p style={{ fontWeight: "bold" }}>
            {q.subject} — {q.lesson_name}
          </p>

          <p style={{ marginTop: "10px" }}>
            {q.question_text}
          </p>

          <details style={{ marginTop: "15px" }}>
            <summary style={{ fontWeight: "bold", cursor: "pointer" }}>
              AI Guidance
            </summary>

            <p style={{ marginTop: "10px" }}>
              {q.ai_guidance}
            </p>
          </details>

        </div>

      ))}

    </main>
  )
}