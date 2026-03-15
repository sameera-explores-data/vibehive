"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { Filter } from "bad-words"

const filter = new Filter()

export default function Home() {

  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<any[]>([])

  const [name, setName] = useState("")
  const [classDetails, setClassDetails] = useState("")
  const [subject, setSubject] = useState("Computer Science")
  const [lesson, setLesson] = useState("")
  const [questionText, setQuestionText] = useState("")

  const [answerInputs, setAnswerInputs] = useState<any>({})

  async function loadData() {

    const { data: q } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false })

    const { data: a } = await supabase
      .from("answers")
      .select("*")

    setQuestions(q || [])
    setAnswers(a || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  async function submitQuestion() {

    if (!name || !questionText) {
      alert("Please fill required fields")
      return
    }

    if (filter.isProfane(questionText)) {
      alert("Inappropriate language detected")
      return
    }

    await supabase.from("questions").insert({
      author_name: name,
      class_details: classDetails,
      subject: subject,
      lesson_name: lesson,
      question_text: questionText,
      ai_guidance:
        "Break the problem into smaller parts and review the key concept behind the question."
    })

    setQuestionText("")
    loadData()
  }

  async function submitAnswer(questionId: string) {

    const text = answerInputs[questionId]

    if (!text) return

    await supabase.from("answers").insert({
      question_id: questionId,
      author_name: "Student",
      answer_text: text
    })

    setAnswerInputs({ ...answerInputs, [questionId]: "" })

    loadData()
  }

  async function verifyAnswer(answerId: string) {

    const code = prompt("Enter code to verify:")

    if (code === "63681726") {

      await supabase
        .from("answers")
        .update({ is_verified: true })
        .eq("id", answerId)

      loadData()

    } else {

      alert("Code failed the vibe check! Try again.")

    }
  }

  return (
    <main style={{ maxWidth: 800, margin: "auto", padding: 40 }}>

      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
        VibeHive
      </h1>

      <div style={{
        border: "4px solid black",
        padding: 20,
        marginBottom: 40
      }}>

        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          placeholder="Class details"
          value={classDetails}
          onChange={(e) => setClassDetails(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        >
          <option>Computer Science</option>
          <option>Math</option>
          <option>Physics</option>
        </select>

        <input
          placeholder="Lesson name"
          value={lesson}
          onChange={(e) => setLesson(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <textarea
          placeholder="Ask your academic question..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          style={{ width: "100%", height: 80 }}
        />

        <button
          onClick={submitQuestion}
          style={{
            marginTop: 10,
            padding: "10px 20px",
            background: "#8B5CF6",
            color: "white",
            border: "3px solid black"
          }}
        >
          Submit Question
        </button>

      </div>

      {questions.map((q) => (

        <div
          key={q.id}
          style={{
            border: "4px solid black",
            padding: 20,
            marginBottom: 20
          }}
        >

          <p style={{ fontWeight: "bold" }}>
            {q.subject} — {q.lesson_name}
          </p>

          <p>
            {q.question_text}
          </p>

          <details>

            <summary>
              AI Guidance
            </summary>

            <p>
              {q.ai_guidance}
            </p>

          </details>

          <div style={{ marginTop: 20 }}>

            <input
              placeholder="Write an answer..."
              value={answerInputs[q.id] || ""}
              onChange={(e) =>
                setAnswerInputs({
                  ...answerInputs,
                  [q.id]: e.target.value
                })
              }
              style={{ width: "70%", marginRight: 10 }}
            />

            <button
              onClick={() => submitAnswer(q.id)}
            >
              Answer
            </button>

          </div>

          <div style={{ marginTop: 15 }}>

            {answers
              .filter(a => a.question_id === q.id)
              .map(a => (

                <div key={a.id} style={{ marginTop: 10 }}>

                  <b>{a.author_name}</b>: {a.answer_text}

                  {a.is_verified && (
                    <span style={{ color: "green", marginLeft: 10 }}>
                      ✔ Verified
                    </span>
                  )}

                  <button
                    style={{ marginLeft: 10 }}
                    onClick={() => verifyAnswer(a.id)}
                  >
                    Verify
                  </button>

                </div>

              ))}

          </div>

        </div>

      ))}

    </main>
  )
}