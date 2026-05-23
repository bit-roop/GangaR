"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import type { KnowledgeAnswer, KnowledgeCategory, KnowledgeQuestion } from "@/components/knowledge/types";
import { ecosystemSignals } from "@/data/mock";
import { useOperationalStore } from "@/lib/state/useOperationalStore";

type KnowledgeExchangeProps = {
  mode?: "full" | "compact";
};

const categories: Array<KnowledgeCategory | "All"> = [
  "All",
  "Floods",
  "River Ecology",
  "Biodiversity",
  "Fishing & Livelihood",
  "Wetlands",
  "Water Quality",
  "Pollution",
  "Conservation",
  "Traditional Knowledge",
  "Disaster Preparedness"
];

const initialQuestions: KnowledgeQuestion[] = [
  {
    id: "flood-signs",
    title: "Which traditional signs reliably precede lowland flooding near Munger?",
    preview: "Elders report seepage, hyacinth drift, and ant movement before the river overtops old footpaths.",
    category: "Floods",
    district: "Munger",
    author: "Dev Kumar",
    role: "Volunteer",
    timestamp: "Today, 9:10 AM",
    state: "Community Verified",
    tags: ["Field Verified", "Traditional Insight", "High Confidence Pattern"],
    signal: "Floodplain memory",
    thumbnail: "≈",
    confidence: "High confidence pattern",
    insights: ["Research linked: Munger lowland flood watch", "Scientific correlation: seepage + upstream discharge rise"],
    answers: [
      {
        id: "flood-signs-a1",
        author: "Noor Alam",
        role: "Local Expert",
        designation: "Community Elder",
        avatar: "NA",
        timestamp: "Today, 10:04 AM",
        trustSignal: "Local Ecological Expert",
        body: "The strongest signal is a cluster: seepage on old cattle paths, fast hyacinth drift, and a sour river smell after midnight. Ant movement alone is weak, but the cluster has matched several past floods.",
        upvotes: 42,
        verified: true,
        adminHighlighted: true,
        state: "Verified",
        confidence: "Observed across seasons",
        badges: ["Traditional Insight", "Field Verified"]
      },
      {
        id: "flood-signs-a2",
        author: "Ananya Sen",
        role: "Analyst",
        designation: "Hydrology Analyst",
        avatar: "AS",
        timestamp: "Today, 10:26 AM",
        trustSignal: "Research Linked",
        body: "The local signs become operationally useful when paired with 24-hour rainfall and discharge trend. Smell alone can be misleading after dredging, but seepage plus hyacinth speed is a strong early-warning pattern.",
        upvotes: 27,
        verified: true,
        state: "Verified",
        confidence: "Scientific correlation",
        badges: ["Research Linked", "Scientific Correlation"]
      }
    ]
  },
  {
    id: "dolphin-channel",
    title: "Why did dolphin surfacing shift away from the Bhagalpur ferry bend?",
    preview: "Boat observers logged morning surfacing farther inside the quieter Vikramshila channel.",
    category: "Biodiversity",
    district: "Bhagalpur",
    author: "Rafiq Ansari",
    role: "Fisherman",
    timestamp: "Today, 7:45 AM",
    state: "Verified",
    tags: ["Research Linked", "Field Verified", "Dolphin Movement"],
    signal: "Acoustic disturbance",
    thumbnail: "◒",
    confidence: "Research linked",
    insights: ["Similar observation: Vikramshila dolphin corridor", "Related alert: low-disturbance channel active"],
    answers: [
      {
        id: "dolphin-channel-a1",
        author: "Dr. Kavya Rao",
        role: "Researcher",
        designation: "River Ecologist",
        avatar: "KR",
        timestamp: "Today, 8:18 AM",
        trustSignal: "Verified Researcher",
        body: "Short-term avoidance is plausible when engine noise repeats at one bend. The most useful field note is surfacing direction and ferry density, not count alone.",
        upvotes: 36,
        verified: true,
        adminHighlighted: true,
        state: "Verified",
        confidence: "High confidence pattern",
        badges: ["Research Linked", "Field Verified"]
      }
    ]
  },
  {
    id: "wetland-reed",
    title: "Which reed patterns indicate wetland recovery instead of seasonal drying?",
    preview: "Hajipur observers see new reed strips, but outer pools remain fragmented after heat stress.",
    category: "Wetlands",
    district: "Hajipur",
    author: "Meera Sinha",
    role: "Conservationist",
    timestamp: "Yesterday, 5:30 PM",
    state: "Under Review",
    tags: ["Wetland Drying", "Field Verified", "Restoration"],
    signal: "Wetland edge health",
    thumbnail: "◌",
    confidence: "Under review",
    insights: ["Related restoration drive: Konhara wetland edge", "Linked observation: reed cover thinning watch"],
    answers: [
      {
        id: "wetland-reed-a1",
        author: "Isha Verma",
        role: "Volunteer",
        designation: "Wetland Researcher",
        avatar: "IV",
        timestamp: "Yesterday, 6:05 PM",
        trustSignal: "Trusted Contributor",
        body: "Recovery usually appears as connected reed strips with small water pockets between them. Isolated clumps around trash piles can look green but still signal stress.",
        upvotes: 19,
        verified: false,
        state: "Community Verified",
        confidence: "Field verified",
        badges: ["Field Verified", "Observed Across Seasons"]
      }
    ]
  },
  {
    id: "foam-ghat",
    title: "Can recurring foam and river smell help detect pollution near ghats?",
    preview: "Patna citizens notice white foam after morning discharge and a sharp smell near the steps.",
    category: "Pollution",
    district: "Patna",
    author: "Prakash",
    role: "Citizen",
    timestamp: "22 May, 6:20 PM",
    state: "Under Review",
    tags: ["Pollution Signal", "Scientific Correlation", "Water Quality"],
    signal: "Pollution observation",
    thumbnail: "◍",
    confidence: "Needs sample correlation",
    insights: ["Related incident: sewage discharge under review", "Linked water-quality station: Patna Main"],
    answers: [
      {
        id: "foam-ghat-a1",
        author: "Sana Qureshi",
        role: "Analyst",
        designation: "Water Quality Analyst",
        avatar: "SQ",
        timestamp: "22 May, 7:02 PM",
        trustSignal: "Trusted Contributor",
        body: "Foam is useful as an observation, not proof. Record photo, location, time, smell, and whether it persists after 20 minutes, then link it to a station reading or sample request.",
        upvotes: 31,
        verified: true,
        state: "Verified",
        confidence: "Scientific correlation",
        badges: ["Scientific Correlation", "Water Quality"]
      }
    ]
  },
  {
    id: "fish-migration",
    title: "What changes in fishing behavior signal incoming fish migration?",
    preview: "Fishermen report smaller nets filling near the inner bend two nights after rainfall pulses.",
    category: "Fishing & Livelihood",
    district: "Bhagalpur",
    author: "Rafiq Ansari",
    role: "Fisherman",
    timestamp: "21 May, 8:40 PM",
    state: "Verified",
    tags: ["Fish Migration", "Traditional Insight", "Observed Across Seasons"],
    signal: "Livelihood pattern",
    thumbnail: "∿",
    confidence: "Observed across seasons",
    insights: ["Linked biodiversity observation: migratory fish pulse", "Research linked: dissolved oxygen improvement"],
    answers: [
      {
        id: "fish-migration-a1",
        author: "Dr. Neel Patel",
        role: "Researcher",
        designation: "Fisheries Scientist",
        avatar: "NP",
        timestamp: "21 May, 9:15 PM",
        trustSignal: "Verified Researcher",
        body: "A short migration pulse often follows rain-cooled flow and better dissolved oxygen. Net location changes are useful when logged with water clarity and current direction.",
        upvotes: 24,
        verified: true,
        adminHighlighted: true,
        state: "Verified",
        confidence: "Research linked",
        badges: ["Research Linked", "Traditional Insight"]
      }
    ]
  },
  {
    id: "bird-timing",
    title: "Are wetland bird arrivals shifting with early summer drying?",
    preview: "Hajipur bird watchers report earlier movement toward deeper reed pockets this season.",
    category: "Biodiversity",
    district: "Hajipur",
    author: "Lata Mishra",
    role: "Conservationist",
    timestamp: "20 May, 6:55 AM",
    state: "Community Verified",
    tags: ["Bird Migration", "Wetland Drying", "Field Verified"],
    signal: "Seasonal timing",
    thumbnail: "◒",
    confidence: "Field verified",
    insights: ["Similar biodiversity observation: wetland bird redistribution", "Linked field note: reed cover thinning"],
    answers: [
      {
        id: "bird-timing-a1",
        author: "Dr. Farah Khan",
        role: "Researcher",
        designation: "Bird Migration Researcher",
        avatar: "FK",
        timestamp: "20 May, 9:30 AM",
        trustSignal: "Verified Researcher",
        body: "Earlier clustering around deeper reed pockets can indicate drying pressure. The strongest evidence is repeated arrival timing across two or more seasons.",
        upvotes: 29,
        verified: true,
        state: "Verified",
        confidence: "Observed across seasons",
        badges: ["Observed Across Seasons", "Research Linked"]
      }
    ]
  }
];

function makeQuestionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 42) || "new-question";
}

function sortAnswers(answers: KnowledgeAnswer[]) {
  return [...answers].sort((a, b) => {
    if (a.adminHighlighted !== b.adminHighlighted) return a.adminHighlighted ? -1 : 1;
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    return b.upvotes - a.upvotes;
  });
}

export function KnowledgeExchange({ mode = "full" }: KnowledgeExchangeProps) {
  const isCompact = mode === "compact";
  const activeRole = useOperationalStore((state) => state.activeRole);
  const [hasMounted, setHasMounted] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions);
  const [selectedId, setSelectedId] = useState(initialQuestions[0].id);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(initialQuestions[0].id);
  const [expandedAnswerIds, setExpandedAnswerIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | "All">("All");
  const [search, setSearch] = useState("");
  const [questionTitle, setQuestionTitle] = useState("");
  const [answerDraft, setAnswerDraft] = useState("");
  const [authorizationNotice, setAuthorizationNotice] = useState<string | null>(null);
  const canAdministerKnowledge = activeRole === "Admin";
  const canAnalyzeKnowledge = activeRole === "Analyst" || activeRole === "Admin";

  const visibleQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return questions
      .filter((question) => question.state !== "Removed")
      .filter((question) => activeCategory === "All" || question.category === activeCategory)
      .filter((question) => {
        if (!query) return true;
        return [question.title, question.preview, question.category, question.district, ...question.tags]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .slice(0, isCompact ? 3 : 4);
  }, [activeCategory, isCompact, questions, search]);

  const selectedQuestion = questions.find((question) => question.id === selectedId && question.state !== "Removed") ?? visibleQuestions[0];
  const selectedAnswers = useMemo(
    () => (selectedQuestion ? sortAnswers(selectedQuestion.answers).filter((answer) => answer.state !== "Removed") : []),
    [selectedQuestion]
  );
  const selectedLinkedSignals = useMemo(
    () => ecosystemSignals.filter((signal) => signal.district === selectedQuestion?.district).slice(0, 3),
    [selectedQuestion?.district]
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  function handleAskQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = questionTitle.trim();
    if (!trimmedTitle) return;

    const nextQuestion: KnowledgeQuestion = {
      id: `${makeQuestionId(trimmedTitle)}-${Date.now()}`,
      title: trimmedTitle,
      preview: "New community question awaiting contributor answers and moderator review.",
      category: activeCategory === "All" ? "Traditional Knowledge" : activeCategory,
      district: "Community archive",
      author: "You",
      role: "Citizen",
      timestamp: "Just now",
      state: "Under Review",
      tags: ["community question", "awaiting answer"],
      signal: "Community field question",
      thumbnail: "✦",
      confidence: "Awaiting review",
      insights: ["AI will surface linked reports after moderator approval."],
      answers: []
    };

    setQuestions((current) => [nextQuestion, ...current]);
    setSelectedId(nextQuestion.id);
    setExpandedQuestionId(nextQuestion.id);
    setQuestionTitle("");
  }

  function handleAddAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedAnswer = answerDraft.trim();
    if (!trimmedAnswer || !selectedQuestion) return;

    setQuestions((current) =>
      current.map((question) =>
        question.id === selectedQuestion.id
          ? {
              ...question,
              answers: [
                {
                  id: `${question.id}-answer-${Date.now()}`,
                  author: "You",
                  role: activeRole === "Analyst" ? "Analyst" : "Citizen",
                  designation: activeRole === "Analyst" ? "Hydrology Analyst" : "Community Contributor",
                  avatar: activeRole === "Analyst" ? "AN" : "YU",
                  timestamp: "Just now",
                  trustSignal: activeRole === "Analyst" ? "Operational Note" : "Community Contributor",
                  body: trimmedAnswer,
                  upvotes: 0,
                  verified: false,
                  state: "Under Review",
                  confidence: "Awaiting review",
                  badges: activeRole === "Analyst" ? ["Operational Note"] : ["Community Answer"]
                },
                ...question.answers
              ]
            }
          : question
      )
    );
    setAnswerDraft("");
  }

  function upvoteAnswer(questionId: string, answerId: string) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: question.answers.map((answer) =>
                answer.id === answerId ? { ...answer, upvotes: answer.upvotes + 1 } : answer
              )
            }
          : question
      )
    );
  }

  function updateQuestionState(questionId: string, state: KnowledgeQuestion["state"]) {
    if (!canAdministerKnowledge) {
      setAuthorizationNotice("Admin moderation tools are restricted to admins.");
      return;
    }

    setQuestions((current) => current.map((question) => (question.id === questionId ? { ...question, state } : question)));
  }

  function updateAnswerState(questionId: string, answerId: string, state: KnowledgeAnswer["state"]) {
    if (!canAdministerKnowledge) {
      setAuthorizationNotice("Admin moderation tools are restricted to admins.");
      return;
    }

    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: question.answers.map((answer) => (answer.id === answerId ? { ...answer, state } : answer))
            }
          : question
      )
    );
  }

  function ecologicalIcon(category: KnowledgeCategory) {
    if (category === "Floods" || category === "Disaster Preparedness") return "≈";
    if (category === "Biodiversity") return "◒";
    if (category === "Wetlands") return "◌";
    if (category === "Water Quality" || category === "Pollution") return "◍";
    if (category === "Fishing & Livelihood") return "∿";
    return "✦";
  }

  function questionVisual(question: KnowledgeQuestion) {
    return question.thumbnail || ecologicalIcon(question.category);
  }

  function compactPreview(text: string, maxLength = 92) {
    return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
  }

  function toggleAnswer(answerId: string) {
    setExpandedAnswerIds((current) => {
      const next = new Set(current);
      if (next.has(answerId)) {
        next.delete(answerId);
      } else {
        next.add(answerId);
      }
      return next;
    });
  }

  if (!hasMounted) {
    const staticQuestions = initialQuestions.slice(0, isCompact ? 3 : initialQuestions.length);
    const staticSelected = initialQuestions[0];

    return (
      <section className={`knowledge-exchange ${isCompact ? "compact" : ""}`} aria-hidden="true">
        {!isCompact ? (
          <div className="knowledge-live-strip">
            <div><i>●</i><span>Active now</span><strong>18 field contributors</strong></div>
            <div><i>◒</i><span>Expert reply</span><strong>Dolphin channel question</strong></div>
            <div><i>≈</i><span>Trending</span><strong>Flood warning signs</strong></div>
          </div>
        ) : null}

        <div className="knowledge-toolbar">
          <div className="knowledge-search">
            <span>Search</span>
            <div className="knowledge-static-input">Search floods, wetlands, pollution, local signs...</div>
          </div>
          <div className="knowledge-category-pills">
            {categories.slice(0, isCompact ? 6 : categories.length).map((category) => (
              <span className={category === "All" ? "active" : ""} key={category}>{category}</span>
            ))}
          </div>
        </div>

        <div className="knowledge-grid">
          <article className="knowledge-panel knowledge-question-panel">
            <div className="knowledge-panel-head">
              <div>
                <span>Moderated Q&A</span>
                <h2>Field questions</h2>
              </div>
              <p>{staticQuestions.length} active threads</p>
            </div>
            <div className="knowledge-ask-form">
              <div className="knowledge-static-input">Ask about local ecology, flood signs, pollution, wetlands...</div>
              <span className="knowledge-static-action">Ask</span>
            </div>
            <div className="knowledge-question-list">
              {staticQuestions.map((question) => (
                <article
                  className={`knowledge-question-card ${question.id === staticSelected.id ? "active expanded" : ""}`}
                  key={question.id}
                >
                  <span className="knowledge-card-icon">{questionVisual(question)}</span>
                  <div className="knowledge-card-main">
                    <div className="knowledge-question-title-row">
                      <strong>{question.title}</strong>
                      <span className="knowledge-state">{question.state}</span>
                    </div>
                    <p>{compactPreview(question.preview)}</p>
                  </div>
                  <div className="knowledge-question-meta">
                    {question.tags.slice(0, 2).map((tag, index) => <span key={`${tag}-${index}`}>{tag}</span>)}
                    <span>{question.district}</span>
                  </div>
                  <div className="knowledge-signal-row">
                    <span>{question.role}</span>
                    <span>{question.answers.length} answers</span>
                    <span>{question.timestamp}</span>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="knowledge-panel knowledge-answer-panel">
            <div className="knowledge-panel-head">
              <div>
                <span>Selected discussion</span>
                <h2>{staticSelected.title}</h2>
              </div>
              <p>{staticSelected.district} • {staticSelected.state}</p>
            </div>
            <div className="knowledge-discussion-hero">
              <div className="knowledge-discussion-icon">{questionVisual(staticSelected)}</div>
              <div>
                <p>{staticSelected.preview}</p>
                <div className="knowledge-selected-meta">
                  {staticSelected.tags.slice(0, 3).map((tag, index) => <span key={`${tag}-${index}`}>{tag}</span>)}
                  <span>{staticSelected.role}</span>
                  <span>{staticSelected.timestamp}</span>
                </div>
              </div>
            </div>
            <div className="knowledge-answer-list">
              {sortAnswers(staticSelected.answers).map((answer) => (
                <article className={`knowledge-answer-card ${answer.adminHighlighted ? "best" : ""}`} key={answer.id}>
                  <div className="knowledge-answer-top">
                    <i className="knowledge-answer-avatar">{answer.avatar}</i>
                    <div>
                      <strong>{answer.author}</strong>
                      <span>{answer.designation} • {answer.timestamp}</span>
                    </div>
                    <em>{answer.adminHighlighted ? "Best answer" : answer.state}</em>
                  </div>
                  <p>{compactPreview(answer.body, 150)}</p>
                  <div className="knowledge-answer-badges">
                    {(answer.badges ?? [answer.trustSignal]).slice(0, 3).map((badge) => <span key={badge}>{badge}</span>)}
                    {answer.confidence ? <span>{answer.confidence}</span> : null}
                  </div>
                  <div className="knowledge-answer-actions">
                    <span className="knowledge-static-action">▲ {answer.upvotes}</span>
                    <span className="knowledge-static-action">Expand</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="knowledge-answer-form">
              <div className="knowledge-static-input">Share a concise observation, practice, or field-tested answer...</div>
              <span className="knowledge-static-action">Answer</span>
            </div>
            <div className="knowledge-insight-card">
              <span>Related environmental insights</span>
              {staticSelected.insights.map((insight) => <p key={insight}>{insight}</p>)}
            </div>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className={`knowledge-exchange ${isCompact ? "compact" : ""}`}>
      {!isCompact ? (
        <div className="knowledge-live-strip" aria-label="Knowledge network highlights">
          <div><i>●</i><span>Active now</span><strong>18 field contributors</strong></div>
          <div><i>◒</i><span>Expert reply</span><strong>Dolphin channel question</strong></div>
          <div><i>≈</i><span>Trending</span><strong>Flood warning signs</strong></div>
        </div>
      ) : null}

      <div className="knowledge-toolbar">
        <div className="knowledge-search">
          <span>Search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search floods, wetlands, pollution, local signs..."
            aria-label="Search environmental discussions"
          />
        </div>
        <div className="knowledge-category-pills" aria-label="Knowledge categories">
          {categories.slice(0, isCompact ? 6 : categories.length).map((category) => (
            <button
              className={activeCategory === category ? "active" : ""}
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="knowledge-grid">
        <article className="knowledge-panel knowledge-question-panel">
          <div className="knowledge-panel-head">
            <div>
              <span>Moderated Q&A</span>
              <h2>Field questions</h2>
            </div>
            <p>{visibleQuestions.length} active threads</p>
          </div>

          <form className="knowledge-ask-form" onSubmit={handleAskQuestion}>
            <input
              value={questionTitle}
              onChange={(event) => setQuestionTitle(event.target.value)}
              placeholder="Ask about local ecology, flood signs, pollution, wetlands..."
              aria-label="Ask a question"
            />
            <button type="submit">Ask</button>
          </form>

          <div className="knowledge-question-list">
            {visibleQuestions.map((question) => (
              <article
                className={`knowledge-question-card ${selectedQuestion?.id === question.id ? "active" : ""} ${expandedQuestionId === question.id ? "expanded" : ""}`}
                key={question.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedId(question.id);
                  setExpandedQuestionId((current) => (current === question.id ? null : question.id));
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(question.id);
                    setExpandedQuestionId((current) => (current === question.id ? null : question.id));
                  }
                }}
              >
                <span className="knowledge-card-icon" aria-hidden="true">{questionVisual(question)}</span>
                <div className="knowledge-card-main">
                  <div className="knowledge-question-title-row">
                    <strong>{question.title}</strong>
                    <span className="knowledge-state">{question.state}</span>
                  </div>
                  <p>{expandedQuestionId === question.id ? question.preview : compactPreview(question.preview)}</p>
                </div>
                <div className="knowledge-question-meta">
                  {question.tags.slice(0, 2).map((tag, index) => <span key={`${tag}-${index}`}>{tag}</span>)}
                  <span>{question.district}</span>
                </div>
                <div className="knowledge-signal-row">
                  <span>{question.role}</span>
                  <span>{question.answers.length} answers</span>
                  <span>{question.timestamp}</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        {selectedQuestion ? (
          <article className="knowledge-panel knowledge-answer-panel">
            <div className="knowledge-panel-head">
              <div>
                <span>Selected discussion</span>
                <h2>{selectedQuestion.title}</h2>
              </div>
              <p>{selectedQuestion.district} • {selectedQuestion.state}</p>
            </div>

            <div className="knowledge-discussion-hero">
              <div className="knowledge-discussion-icon" aria-hidden="true">{questionVisual(selectedQuestion)}</div>
              <div>
                <p>{selectedQuestion.preview}</p>
                <div className="knowledge-selected-meta">
                  {selectedQuestion.tags.slice(0, 3).map((tag, index) => (
                    <span key={`${tag}-${index}`}>{tag}</span>
                  ))}
                  <span>{selectedQuestion.role}</span>
                  <span>{selectedQuestion.timestamp}</span>
                </div>
              </div>
            </div>

            {canAnalyzeKnowledge ? (
              <details className="knowledge-moderation-panel">
                <summary>Analyst notes</summary>
                <div className="knowledge-moderation-row">
                  <button type="button" onClick={() => setAuthorizationNotice("Environmental relevance marked for analyst review.")}>Review</button>
                  <button type="button" onClick={() => setAuthorizationNotice("Environmental relevance verified.")}>Verify relevance</button>
                  <button type="button" onClick={() => setAuthorizationNotice("Operational note added to this discussion.")}>Add note</button>
                  {canAdministerKnowledge ? null : <span>Admin-only removal controls are hidden.</span>}
                </div>
              </details>
            ) : null}

            {canAdministerKnowledge ? (
              <details className="knowledge-moderation-panel">
                <summary>Admin tools</summary>
                <div className="knowledge-moderation-row">
                  <button type="button" onClick={() => updateQuestionState(selectedQuestion.id, "Verified")}>Verify</button>
                  <button type="button" onClick={() => updateQuestionState(selectedQuestion.id, "Under Review")}>Review</button>
                  <button type="button" onClick={() => updateQuestionState(selectedQuestion.id, "Removed")}>Delete</button>
                  <button type="button">Warn</button>
                  <button type="button">Mute</button>
                  <button type="button">Ban</button>
                  <button type="button">Flag misinformation</button>
                </div>
              </details>
            ) : null}

            {authorizationNotice ? <div className="knowledge-auth-notice" role="status">{authorizationNotice}</div> : null}

            <div className="knowledge-answer-list">
              {selectedAnswers.map((answer) => (
                  <article className={`knowledge-answer-card ${answer.adminHighlighted ? "best" : ""} ${expandedAnswerIds.has(answer.id) ? "expanded" : ""}`} key={answer.id}>
                    <div className="knowledge-answer-top">
                      <i className="knowledge-answer-avatar">{answer.avatar}</i>
                      <div>
                        <strong>{answer.author}</strong>
                        <span>{answer.designation} • {answer.timestamp}</span>
                      </div>
                      <em>{answer.adminHighlighted ? "Best answer" : answer.state}</em>
                    </div>
                    <p>{expandedAnswerIds.has(answer.id) ? answer.body : compactPreview(answer.body, 150)}</p>
                    <div className="knowledge-answer-badges">
                      {(answer.badges ?? [answer.trustSignal]).slice(0, 3).map((badge) => <span key={badge}>{badge}</span>)}
                      {answer.confidence ? <span>{answer.confidence}</span> : null}
                    </div>
                    <div className="knowledge-answer-actions">
                      <button type="button" onClick={() => upvoteAnswer(selectedQuestion.id, answer.id)}>
                        ▲ {answer.upvotes}
                      </button>
                      <button type="button" onClick={() => toggleAnswer(answer.id)}>
                        {expandedAnswerIds.has(answer.id) ? "Collapse" : "Expand"}
                      </button>
                      {canAdministerKnowledge ? (
                        <details className="knowledge-answer-admin">
                          <summary>Mod</summary>
                          <div>
                            <button type="button" onClick={() => updateAnswerState(selectedQuestion.id, answer.id, "Verified")}>
                              Verify
                            </button>
                            <button type="button" onClick={() => updateAnswerState(selectedQuestion.id, answer.id, "Removed")}>
                              Delete
                            </button>
                          </div>
                        </details>
                      ) : null}
                    </div>
                  </article>
                ))}
            </div>

            <form className="knowledge-answer-form" onSubmit={handleAddAnswer}>
              <textarea
                value={answerDraft}
                onChange={(event) => setAnswerDraft(event.target.value)}
                placeholder="Share a concise observation, practice, or field-tested answer..."
                aria-label="Add an answer"
              />
              <button type="submit">Answer</button>
            </form>

            <div className="knowledge-insight-card">
              <span>Related environmental insights</span>
              {selectedQuestion.insights.map((insight) => (
                <p key={insight}>{insight}</p>
              ))}
              {selectedLinkedSignals.map((signal) => (
                <p key={signal.id}>{signal.category}: {signal.title}</p>
              ))}
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
