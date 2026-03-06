"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Generate a stable browser fingerprint stored in localStorage
function getFingerprint() {
  const key = "son_fp";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem(key, fp);
  }
  return fp;
}

const VERDICTS = [
  {
    id: "sweetie",
    label: "Sweetie",
    img: "/sweetie-sticker.svg",
    color: "#c4607e",
    hoverBg: "rgba(196,96,126,0.08)",
  },
  {
    id: "penitent",
    label: "Penitent",
    img: "/penitent-sticker.svg",
    color: "#756374",
    hoverBg: "rgba(117,99,116,0.08)",
  },
  {
    id: "not_a_sweetie",
    label: "Not a Sweetie",
    img: "/not-a-sweetie-sticker.svg",
    color: "#888888",
    hoverBg: "rgba(136,136,136,0.08)",
  },
];

export default function SweetieVote({ episodeSlug, compact = false }) {
  const [tally, setTally] = useState({ sweetie: 0, penitent: 0, not_a_sweetie: 0 });
  const [myVote, setMyVote] = useState(null);
  const [reasoning, setReasoning] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fp = getFingerprint();
    fetchTally();
    checkExistingVote(fp);
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [episodeSlug]);

  async function fetchTally() {
    const { data, error } = await supabase
      .from("sweetie_votes")
      .select("verdict")
      .eq("episode_slug", episodeSlug);

    if (error) { setLoading(false); return; }

    const counts = { sweetie: 0, penitent: 0, not_a_sweetie: 0 };
    data.forEach((row) => { if (counts[row.verdict] !== undefined) counts[row.verdict]++; });
    setTally(counts);
    setLoading(false);
  }

  async function checkExistingVote(fp) {
    // Check by user_id first if logged in
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;

    if (uid) {
      const { data } = await supabase
        .from("sweetie_votes")
        .select("verdict")
        .eq("episode_slug", episodeSlug)
        .eq("user_id", uid)
        .maybeSingle();
      if (data) { setMyVote(data.verdict); setSubmitted(true); return; }
    }

    // Fall back to fingerprint
    const { data } = await supabase
      .from("sweetie_votes")
      .select("verdict")
      .eq("episode_slug", episodeSlug)
      .eq("fingerprint", fp)
      .maybeSingle();

    if (data) { setMyVote(data.verdict); setSubmitted(true); }
  }

  async function handleVote(verdictId) {
    if (submitted) return;
    setMyVote(verdictId);
  }

  async function handleSubmit() {
    if (!myVote || submitting) return;
    setSubmitting(true);
    setError(null);

    const fp = getFingerprint();

    const { error } = await supabase.from("sweetie_votes").insert({
      episode_slug: episodeSlug,
      verdict: myVote,
      fingerprint: fp,
      user_id: userId || null,
      reasoning: reasoning.trim() || null,
    });

    if (error) {
      if (error.code === "23505") {
        // Unique violation — already voted
        setSubmitted(true);
        setError("You already voted on this one.");
      } else {
        setError("Something went wrong. Try again.");
      }
      setSubmitting(false);
      return;
    }

    await fetchTally();
    setSubmitted(true);
    setSubmitting(false);
  }

  const total = tally.sweetie + tally.penitent + tally.not_a_sweetie;

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(242,234,216,0.1)",
      padding: compact ? "1.25rem" : "2.5rem",
      marginTop: compact ? 0 : "3rem",
      fontFamily: "'Crimson Pro', Georgia, serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#8a7f72",
          marginBottom: "0.75rem",
        }}>
          The People's Verdict
        </div>
        <p style={{
          fontStyle: "italic",
          fontSize: "1.15rem",
          color: "rgba(242,234,216,0.7)",
          lineHeight: 1.5,
        }}>
          Elliott remains unconvinced. What do you think?
        </p>
      </div>

      {/* Verdict buttons */}
      <div style={{
        display: "grid",
        gridTemplateColumns: compact ? "1fr" : "repeat(3, 1fr)",
        gap: compact ? "0.5rem" : "1rem",
        marginBottom: "1.5rem",
      }}>
        {VERDICTS.map((v) => {
          const isSelected = myVote === v.id;
          const isWinner = submitted && tally[v.id] === Math.max(...Object.values(tally)) && tally[v.id] > 0;
          return (
            <button
              key={v.id}
              onClick={() => handleVote(v.id)}
              disabled={submitted}
              style={{
                background: isSelected ? v.hoverBg : "transparent",
                border: `1px solid ${isSelected ? v.color : "rgba(242,234,216,0.12)"}`,
                padding: compact ? "0.75rem 1rem" : "1.25rem 0.75rem",
                cursor: submitted ? "default" : "pointer",
                display: "flex",
                flexDirection: compact ? "row" : "column",
                alignItems: "center",
                gap: "0.75rem",
                transition: "all 0.2s",
                position: "relative",
              }}
            >
              <img
                src={v.img}
                alt={v.label}
                style={{ width: compact ? "110px" : "70px", height: compact ? "110px" : "70px", objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: isSelected ? v.color : "rgba(242,234,216,0.5)",
              }}>
                {v.label}
              </span>
              {submitted && (
                <span style={{
                  fontFamily: "'Permanent Marker', cursive",
                  fontSize: "1.4rem",
                  color: v.color,
                  lineHeight: 1,
                }}>
                  {tally[v.id]}
                </span>
              )}
              {isWinner && (
                <span style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-6px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.5rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: v.color,
                  color: "#0d0b0a",
                  padding: "2px 5px",
                }}>
                  leading
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Reasoning field — only before submit */}
      {!submitted && myVote && (
        <div style={{ marginBottom: "1.5rem" }}>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Your reasoning. Optional. Elliott might read it."
            maxLength={280}
            rows={3}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(242,234,216,0.12)",
              color: "rgba(242,234,216,0.8)",
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontStyle: "italic",
              fontSize: "1rem",
              padding: "0.75rem 1rem",
              resize: "vertical",
              outline: "none",
            }}
          />
        </div>
      )}

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!myVote || submitting}
          style={{
            background: myVote ? "#c8382a" : "transparent",
            border: "1px solid rgba(242,234,216,0.15)",
            color: myVote ? "#faf6ee" : "rgba(242,234,216,0.3)",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            padding: "0.85rem 2rem",
            cursor: myVote ? "pointer" : "default",
            transition: "all 0.2s",
            width: "100%",
          }}
        >
          {submitting ? "Submitting..." : "Submit Verdict"}
        </button>
      )}

      {/* Post-vote tally summary */}
      {submitted && total > 0 && (
        <div style={{
          marginTop: "1rem",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#8a7f72",
        }}>
          {total} {total === 1 ? "verdict" : "verdicts"} cast
          {myVote && (
            <span style={{ marginLeft: "1rem", color: VERDICTS.find(v => v.id === myVote)?.color }}>
              — you said {VERDICTS.find(v => v.id === myVote)?.label}
            </span>
          )}
        </div>
      )}

      {error && (
        <div style={{
          marginTop: "1rem",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.6rem",
          color: "#c8382a",
          letterSpacing: "0.1em",
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
