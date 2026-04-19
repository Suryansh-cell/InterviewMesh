const express = require('express');
const axios = require('axios');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/v1/execute';

router.post('/analyze', auth, async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: 'Both code and language are required.' });
  }

  try {
    const analysis = GROQ_API_KEY
      ? await analyzeWithGroq(code, language)
      : analyzeHeuristics(code, language);

    res.json(analysis);
  } catch (err) {
    console.error('Code analysis failed:', err?.message || err);
    res.status(500).json({ error: 'Code analysis failed. Please try again.' });
  }
});

async function analyzeWithGroq(code, language) {
  const prompt = `Analyze the following ${language} code for efficiency, clarity, complexity, and possible improvements. Return ONLY valid JSON with keys: score, strengths, weaknesses, and recommendations. Provide arrays for strengths, weaknesses, and recommendations. Code:\n${code}`;

  const response = await axios.post(
    GROQ_URL,
    {
      model: 'groq-alpha',
      prompt,
      max_output_tokens: 512,
      temperature: 0.3,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
    }
  );

  const raw = response.data?.output?.[0]?.content || response.data?.result || '';
  return parseGroqJson(raw) || analyzeHeuristics(code, language);
}

function parseGroqJson(raw) {
  if (!raw || typeof raw !== 'string') return null;

  const cleaned = raw.replace(/```/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/m);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed && typeof parsed === 'object') {
      return {
        score: parsed.score ?? 72,
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        recommendations: parsed.recommendations || [],
      };
    }
  } catch (e) {
    console.warn('Unable to parse Groq JSON output:', e.message);
  }

  return null;
}

function analyzeHeuristics(code, language) {
  const normalizedCode = code.toLowerCase();
  const lineCount = code.split('\n').length;
  const loopCount = (normalizedCode.match(/\b(for|while|foreach)\b/g) || []).length;
  const nestedLoops = /for\s*\([^)]*\)\s*\{[\s\S]*for\s*\([^)]*\)/.test(code)
    || /while\s*\([^)]*\)\s*\{[\s\S]*while\s*\([^)]*\)/.test(code);
  const recursion = /(function\s+([a-zA-Z0-9_]+)\s*\(|def\s+([a-zA-Z0-9_]+)\s*\(|class\s+([a-zA-Z0-9_]+)\s*)[\s\S]*\b\2\s*\(/.test(code);
  const longLines = code.split('\n').filter((line) => line.length > 110).length;
  const repeatedComputation = /(\bMath\.|\.length\b|\bsize\b).*(\bMath\.|\.length\b|\bsize\b)/.test(normalizedCode);

  const recommendations = [];
  const strengths = [];
  const weaknesses = [];

  strengths.push('Structure is easy to read');
  if (loopCount === 0) strengths.push('Minimal loop-heavy logic');
  if (recursion) strengths.push('Recursive problem-solving approach detected');

  if (nestedLoops) {
    weaknesses.push('Potential nested loops can slow down performance.');
    recommendations.push('Look for ways to simplify nested iterations with hashing or divide-and-conquer.');
  }

  if (longLines > 0) {
    weaknesses.push('Several long lines may reduce readability.');
    recommendations.push('Break complex expressions into smaller helper functions.');
  }

  if (repeatedComputation) {
    weaknesses.push('Repeated calculations might be re-computed unnecessarily.');
    recommendations.push('Cache repeated values or compute them once outside loops.');
  }

  if (lineCount > 120) {
    recommendations.push('Try splitting very large functions into smaller logical units.');
  }

  if (weaknesses.length === 0) {
    strengths.push('The solution appears efficient for the current problem shape.');
  }

  const score = Math.max(55, 90 - nestedLoops * 15 - longLines * 3 - (repeatedComputation ? 8 : 0));

  return {
    score,
    strengths: Array.from(new Set(strengths)).slice(0, 4),
    weaknesses: Array.from(new Set(weaknesses)).slice(0, 4),
    recommendations: Array.from(new Set(recommendations)).slice(0, 4),
  };
}

module.exports = router;
