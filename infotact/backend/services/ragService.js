import "dotenv/config";
import DocumentVector from "../models/DocumentVector.js";
import { generateEmbedding } from "./embeddingService.js";
import { cosineSimilarity } from "../utils/similarity.js";
import Groq from "groq-sdk";

const GROQ_KEY = process.env.GROQ_API_KEY;
console.log("RAGSERVICE GROQ KEY:", process.env.GROQ_API_KEY ? "YES" : "NO");

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const groq = GROQ_KEY ? new Groq({ apiKey: GROQ_KEY }) : null;

// ---------- helpers ----------
function cleanText(t = "") {
  return String(t).replace(/\s+/g, " ").replace(/refun\s+d/gi, "refund").trim();
}

function dedupeByNormalizedText(arr = []) {
  const seen = new Set();
  const out = [];
  for (const raw of arr) {
    const t = cleanText(raw);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function buildAnswerFromContext(query, chunks) {
  const q = (query || "").toLowerCase();
  const keywords = q
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => w.length >= 3)
    .slice(0, 10);

  const sentences = dedupeByNormalizedText(
    chunks.map(cleanText).join(" ").split(/(?<=[.?!])\s+/)
  );

  const scored = sentences
    .map((s) => {
      const sl = s.toLowerCase();
      let score = 0;
      for (const k of keywords) if (sl.includes(k)) score++;
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 3).map((x) => x.s);

  if (!top.length) {
    const best = cleanText(chunks[0] || "");
    return best.length > 350 ? best.slice(0, 350) + "..." : best;
  }

  return top.join(" ");
}

// ---------- 1) Vector search ----------
export async function vectorSearch(query, topK = 5, userId = null) {
  const queryEmbedding = await generateEmbedding(query);

  const filter = userId ? { userId } : {};
  const docs = await DocumentVector.find(
    filter,
    { fileName: 1, chunkIndex: 1, content: 1, embedding: 1 }
  ).lean();

  const scored = docs.map((d) => ({
    _id: d._id,
    fileName: d.fileName,
    chunkIndex: d.chunkIndex,
    content: d.content,
    score: cosineSimilarity(queryEmbedding, d.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  // dedupe same content
  const out = [];
  const seen = new Set();
  for (const m of scored) {
    const key = cleanText(m.content).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(m);
    if (out.length >= Number(topK)) break;
  }

  return out;
}

// ---------- 2) RAG Answer (Groq if available else rule-based) ----------
export async function answerWithRAG(query, topK = 5, userId = null) {
  const matches = await vectorSearch(query, topK, userId);

  if (!matches.length) {
    return { answer: "No related content found in the PDF.", matches: [] };
  }

  const contextChunks = dedupeByNormalizedText(matches.map((m) => m.content));

  // ✅ If no Groq key -> fallback
  if (!groq) {
    const answer = buildAnswerFromContext(query, contextChunks);
    return {
      answer:
        answer +
        "\n\n(Note: Groq disabled. This answer is generated from retrieved PDF chunks.)",
      matches,
    };
  }

  try {
    const context = matches
      .map(
        (m) =>
          `File: ${m.fileName} | Chunk: ${m.chunkIndex}\nContent: ${cleanText(
            m.content
          )}`
      )
      .join("\n\n---\n\n");

    const system = `You are a helpful assistant. Answer ONLY using the given CONTEXT.
- Do not repeat sentences.
- Keep it short and clear.
- If not found, say exactly: "Not found in the PDF".`;

    const userPrompt = `CONTEXT:\n${context}\n\nQUESTION:\n${query}\n\nAnswer:`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 400,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
    });

    let answer = completion.choices?.[0]?.message?.content || "";

    // final cleanup (remove repeated lines)
    answer = dedupeByNormalizedText(answer.split(/\n+|(?<=[.?!])\s+/)).join("\n");

    return { answer, matches };
  } catch (err) {
    console.error("GROQ ERROR:", err?.message || err);

    // fallback
    const answer = buildAnswerFromContext(query, contextChunks);
    return {
      answer:
        answer +
        "\n\n(Note: Groq failed. This answer is generated from retrieved PDF chunks.)",
      matches,
    };
  }
}