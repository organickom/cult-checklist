import React, { useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw, Printer, Info } from 'lucide-react'

const SCALE = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral / Unsure' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
]

const QUESTIONS = [
  { category: 'A. Leadership & Authority', items: [
    'The leader is always right and cannot be questioned.',
    'Disagreeing with the leader is treated as rebelling against God (or truth).',
    'The leader demands personal recognition in speeches, prayers, or rituals.',
    'The leader controls access to sacred space, rituals, or knowledge.',
    "The leader surrounds themselves with unquestioning followers ('yes-men').",
  ]},
  { category: 'B. Information & Teaching', items: [
    'Members are discouraged from reading or listening to outside viewpoints.',
    'Critical media, books, or websites about the group are forbidden or demonized.',
    'Scripture or doctrine is reinterpreted to always support the leader.',
    'History is rewritten to show the leader/group was always correct.',
    'Dissenters are labeled as traitors, evil, or deceived.',
  ]},
  { category: 'C. Community & Relationships', items: [
    'Members are pressured to cut off relationships with outsiders (family/friends).',
    'Loyalty to the group is valued more than loyalty to truth or justice.',
    'When a member is punished, others stay silent out of fear.',
    'Members are encouraged to report on each other’s behavior or doubts.',
    'People who leave are shunned, slandered, or spiritually condemned.',
  ]},
  { category: 'D. Emotional & Psychological Control', items: [
    'Members must apologize for things they did not do, to please leadership.',
    'Guilt, shame, or fear are used to keep members in line.',
    'Members feel God’s love and forgiveness are only available through the group.',
    '“Love bombing” (excessive praise) is given to new or favored members, then withdrawn as punishment.',
    'Leaders portray themselves as victims if challenged.',
  ]},
  { category: 'E. Behavior & Finances', items: [
    'Members are told how to dress, eat, or manage family decisions.',
    'Attendance at meetings/events is expected regardless of personal cost.',
    'Members are pressured to give financially beyond their means.',
    'Finances are not transparent; money is controlled by leadership.',
    'Members’ time, energy, and resources are expected to serve the group first.',
  ]},
  { category: 'F. Spiritual Claims', items: [
    'The leader is treated as God’s unique representative on earth.',
    'Members are told salvation, enlightenment, or blessing exists only inside the group.',
    'Disagreement is equated with sin, evil spirits, or demonic influence.',
    'Outsiders are portrayed as enemies who want to destroy the truth.',
    'The group claims to be the only true way, church, or chosen people.',
  ]},
  { category: 'G. Sexual & Family Control', items: [
    'Relationships or marriages are arranged, approved, or broken up by leadership.',
    'Sexuality is tightly controlled (forbidden, shamed, or exploited).',
    'Children are raised primarily for the group’s benefit rather than their family’s.',
  ]},
  { category: 'H. Isolation & Time Control', items: [
    'Members have little free time outside of group activities.',
    'Vacations, hobbies, or personal downtime are discouraged.',
    'Members live communally or relocate to be closer to the group.',
  ]},
  { category: 'I. End-Times or Doomsday Thinking', items: [
    'The group strongly emphasizes apocalyptic events or urgent end-times prophecy.',
    'The group claims only its members will survive or be saved.',
  ]},
  { category: 'J. Recruitment & Retention', items: [
    "New members are 'love-bombed' (excessive welcome, praise, gifts).",
    'Commitments of time, money, or loyalty are escalated gradually.',
    'Outsiders are demonized to make leaving feel terrifying.',
  ]},
  { category: 'K. Psychological Red Flags', items: [
    'Members feel guilty or afraid if they think about leaving.',
    'Doubt is reframed as spiritual failure rather than normal questioning.',
    "Members feel like they are 'walking on eggshells' around leadership.",
  ]},
]

const ALL_QUESTIONS = QUESTIONS.flatMap((g, gi) => g.items.map((text, qi) => ({ id: `${gi+1}-${qi+1}`, category: g.category, text })))
const TOTAL = ALL_QUESTIONS.length

function rangeColor(score) {
  if (score <= 80) return 'text-emerald-700'
  if (score <= 120) return 'text-yellow-700'
  if (score <= 160) return 'text-orange-700'
  return 'text-red-700'
}

export default function App() {
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem('cult-checklist-answers')
    return saved ? JSON.parse(saved) : {}
  })
  const [notes, setNotes] = useState(() => localStorage.getItem('cult-checklist-notes') || '')

  useEffect(() => localStorage.setItem('cult-checklist-answers', JSON.stringify(answers)), [answers])
  useEffect(() => localStorage.setItem('cult-checklist-notes', notes), [notes])

  const completed = Object.keys(answers).length
  const totalScore = useMemo(() => Object.values(answers).reduce((a,b) => a + (Number.isFinite(b) ? b : 0), 0), [answers])
  const maxScore = TOTAL * 5
  const progress = (completed / TOTAL) * 100

  const interpretation = useMemo(() => {
    if (totalScore <= 80) return { label: 'Likely a healthy group with normal challenges.', band: '40–80' }
    if (totalScore <= 120) return { label: 'Some warning signs of high control. Watch carefully.', band: '81–120' }
    if (totalScore <= 160) return { label: 'Strong evidence of cult-like tendencies. Proceed with caution.', band: '121–160' }
    return { label: 'You are likely in a cult or high-control group. Consider seeking outside help.', band: '161–200' }
  }, [totalScore])

  function setAnswer(id, value) { setAnswers(prev => ({ ...prev, [id]: value })) }
  function reset() {
    if (confirm('Clear all answers?')) {
      setAnswers({}); setNotes('')
      localStorage.removeItem('cult-checklist-answers'); localStorage.removeItem('cult-checklist-notes')
    }
  }
  function downloadResults() {
    const payload = {
      completed, totalQuestions: TOTAL, totalScore, maxScore,
      average: completed ? Number((totalScore / completed).toFixed(2)) : 0,
      band: interpretation.band, interpretation: interpretation.label,
      answers: ALL_QUESTIONS.map(q => ({ id: q.id, category: q.category, text: q.text, score: answers[q.id] ?? null })),
      notes, generatedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a')
    link.href = url; link.download = 'cult_checklist_results.json'; document.body.appendChild(link); link.click(); link.remove()
  }

  return (
    <div className=\"min-h-screen\">
      <header className=\"sticky top-0 z-10 border-b bg-white/90 backdrop-blur\">
        <div className=\"mx-auto max-w-5xl px-4 py-4 flex items-center justify-between\">
          <h1 className=\"text-xl md:text-2xl font-bold\">How to Know If You’re in a Cult</h1>
          <div className=\"flex gap-2 no-print\">
            <button className=\"inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50\" onClick={() => window.print()}>
              <Printer className=\"h-4 w-4\"/> <span>Print</span>
            </button>
            <button className=\"inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50\" onClick={downloadResults}>
              <Download className=\"h-4 w-4\"/> <span>Download</span>
            </button>
            <button className=\"inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50\" onClick={reset}>
              <RefreshCw className=\"h-4 w-4\"/> <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      <main className=\"mx-auto max-w-5xl px-4 py-6 space-y-6\">
        <section className=\"bg-white border rounded-2xl card\">
          <div className=\"p-4 border-b\">
            <h2 className=\"text-lg font-semibold\">Introduction</h2>
          </div>
          <div className=\"p-4 space-y-3 text-sm leading-6\">
            <p>Throughout history, groups that began with sincere spiritual, social, or cultural goals have sometimes slipped into high-control systems that exploit their members. They often mix truth with manipulation, offering real community or insight while gradually increasing control. Falling into a cult is not a sign of weakness or lack of intelligence—research shows cults often attract bright, committed, idealistic people.</p>
            <p className=\"flex items-start gap-2 text-gray-700\"><Info className=\"h-4 w-4 mt-0.5\"/> This assessment draws on decades of research (Lifton, Singer, Lalich, Hassan). Use the 1–5 scale for each statement; your scores help you gauge overall risk.</p>
            <div className=\"rounded-xl bg-gray-100 p-3\"><strong>Scale:</strong> 1 = Strongly Disagree · 2 = Disagree · 3 = Neutral/Unsure · 4 = Agree · 5 = Strongly Agree</div>
            <div className=\"space-y-1\">
              <div className=\"flex items-center justify-between text-sm\">
                <span>Progress</span><span>{completed}/{TOTAL} answered</span>
              </div>
              <div className=\"h-2 w-full rounded-full bg-gray-200 overflow-hidden\">
                <div className=\"h-2 bg-gray-900\" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </section>

        {QUESTIONS.map((group, gi) => (
          <section key={gi} className=\"bg-white border rounded-2xl card\">
            <div className=\"p-4 border-b\"><h3 className=\"text-base font-semibold\">{group.category}</h3></div>
            <div className=\"p-4 space-y-4\">
              {group.items.map((text, qi) => {
                const id = `${gi + 1}-${qi + 1}`
                const selected = answers[id] ?? 0
                return (
                  <div key={id} className=\"rounded-lg border p-3 md:p-4\">
                    <div className=\"mb-2 font-medium\">{text}</div>
                    <div className=\"grid grid-cols-2 md:flex md:flex-wrap gap-2\" role=\"radiogroup\" aria-label={`Question ${id}`}>
                      {SCALE.map((opt) => (
                        <label key={opt.value} className={`cursor-pointer select-none rounded-lg border px-3 py-2 text-sm md:text-[0.95rem] ${selected === opt.value ? 'border-gray-900 ring-1 ring-gray-900' : 'hover:border-gray-400'}`}>
                          <input type=\"radio\" className=\"sr-only\" name={`q-${id}`} value={opt.value} checked={selected === opt.value} onChange={() => setAnswer(id, opt.value)} />
                          {opt.value}. {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        <section className=\"bg-white border rounded-2xl card\">
          <div className=\"p-4 border-b\"><h3 className=\"text-base font-semibold\">Notes (optional)</h3></div>
          <div className=\"p-4\">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder=\"Record examples, dates, or experiences here for your own reference.\" className=\"w-full min-h-[120px] rounded-lg border p-3\" />
          </div>
        </section>

        <section className=\"bg-white border rounded-2xl card\">
          <div className=\"p-4 border-b\"><h3 className=\"text-base font-semibold\">Results</h3></div>
          <div className=\"p-4 space-y-3\">
            <div className=\"text-sm\">Total questions: <strong>{TOTAL}</strong> · Answered: <strong>{completed}</strong> · Max score: <strong>{maxScore}</strong></div>
            <div className=\"text-2xl font-semibold\">Total Score: <span className={rangeColor(totalScore)}>{totalScore}</span></div>
            <div className=\"text-sm\">Band: <strong>{interpretation.band}</strong></div>
            <p className=\"text-sm text-gray-700\">{interpretation.label}</p>
            <div className=\"flex flex-wrap gap-2 pt-2 no-print\">
              <button onClick={() => window.print()} className=\"inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50\"><Printer className=\"h-4 w-4\"/>Print</button>
              <button onClick={downloadResults} className=\"inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50\"><Download className=\"h-4 w-4\"/>Download JSON</button>
              <button onClick={reset} className=\"inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50\"><RefreshCw className=\"h-4 w-4\"/>Reset</button>
            </div>
          </div>
        </section>

        <section className=\"bg-white border rounded-2xl card\">
          <div className=\"p-4 border-b\"><h3 className=\"text-base font-semibold\">Resources for Help</h3></div>
          <div className=\"p-4 text-sm leading-6\">
            <ul className=\"list-disc pl-6 space-y-1\">
              <li>International Cultic Studies Association (ICSA): <a className=\"underline\" href=\"https://www.icsahome.com\" target=\"_blank\" rel=\"noreferrer\">icsahome.com</a></li>
              <li>Cult Education Institute: <a className=\"underline\" href=\"https://culteducation.com\" target=\"_blank\" rel=\"noreferrer\">culteducation.com</a></li>
              <li>Freedom of Mind (Steven Hassan): <a className=\"underline\" href=\"https://freedomofmind.com\" target=\"_blank\" rel=\"noreferrer\">freedomofmind.com</a></li>
              <li>National Domestic Abuse Hotline: <a className=\"underline\" href=\"tel:18007997233\">1-800-799-7233</a></li>
            </ul>
            <p className=\"mt-3 font-medium\">Resources focused on the Black community:</p>
            <ul className=\"list-disc pl-6 space-y-1\">
              <li>John L. Moore, <em>Saints or Sinners: Black Cults and Sects in America</em></li>
              <li>Dr. Joy DeGruy – lectures on trauma/control in marginalized communities</li>
              <li>YouTube: “Cults and the Black Community” – interviews with survivors and researchers</li>
            </ul>
          </div>
        </section>

        <footer className=\"py-6 text-center text-xs text-gray-500\">© {new Date().getFullYear()} – Educational tool. Not a diagnostic instrument; consider consulting professionals for advice.</footer>
      </main>
    </div>
  )
}
