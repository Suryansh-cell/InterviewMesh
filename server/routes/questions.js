const express = require('express');
const axios = require('axios');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Cache questions in memory to avoid re-generating same topic
const questionCache = new Map();

router.post('/generate', auth, async (req, res) => {
  const { topic, difficulty, userSkills, voidSkills } = req.body;

  const cacheKey = `${topic}-${difficulty}`;
  if (questionCache.has(cacheKey)) {
    const cached = questionCache.get(cacheKey);
    const random = cached[Math.floor(Math.random() * cached.length)];
    return res.json(random);
  }

  const prompt = `Generate 3 technical interview questions for the topic "${topic}" at "${difficulty}" difficulty level.
  
  The questions should be suitable for a mock interview between two engineering students.
  The candidate has these skills: ${userSkills?.join(', ') || 'general CS'}.
  They are weak in: ${voidSkills?.join(', ') || 'not specified'}.
  
  Return ONLY a JSON array with this exact format, no other text:
  [
    {
      "topic": "${topic}",
      "difficulty": "${difficulty}",
      "question": "The interview question here",
      "hint": "A small hint if they're stuck",
      "expectedAnswer": "Brief expected answer outline"
    }
  ]`;

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    const text = response.data.candidates[0].content.parts[0].text;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleaned);

    questionCache.set(cacheKey, questions);
    res.json(questions[0]);
  } catch (err) {
    console.error('Gemini error:', err.message);
    const fallback = getFallbackQuestion(topic, difficulty);
    res.json(fallback);
  }
});

// Get multiple questions for a topic
router.post('/batch', auth, async (req, res) => {
  const { topic, difficulty, count } = req.body;
  const cacheKey = `${topic}-${difficulty}`;
  
  if (questionCache.has(cacheKey)) {
    return res.json(questionCache.get(cacheKey));
  }

  // Return fallback batch
  const questions = [];
  const allFallbacks = getAllFallbacks(topic);
  for (let i = 0; i < (count || 3); i++) {
    questions.push(allFallbacks[i % allFallbacks.length]);
  }
  res.json(questions);
});

function getFallbackQuestion(topic, difficulty) {
  const fallbacks = {
    'DSA': {
      easy: { topic: 'DSA', difficulty: 'easy', question: 'Explain the difference between a stack and a queue. When would you use each?', hint: 'Think about LIFO vs FIFO', expectedAnswer: 'Stack is LIFO, Queue is FIFO. Stack for DFS/undo, Queue for BFS/scheduling.' },
      medium: { topic: 'DSA', difficulty: 'medium', question: 'Detect a cycle in a linked list. What is your approach and complexity?', hint: 'Think about two pointers moving at different speeds', expectedAnswer: "Floyd's cycle detection: O(n) time, O(1) space" },
      hard: { topic: 'DSA', difficulty: 'hard', question: 'Design an LRU cache with O(1) get and put operations.', hint: 'Combine a hashmap and doubly linked list', expectedAnswer: 'HashMap + DLL: O(1) for both operations' }
    },
    'System Design': {
      easy: { topic: 'System Design', difficulty: 'easy', question: 'Design a URL shortener like bit.ly', hint: 'Think about hashing, redirection, storage', expectedAnswer: 'Hash URL → store mapping → redirect on lookup' },
      medium: { topic: 'System Design', difficulty: 'medium', question: 'Design a rate limiter for an API', hint: 'Consider token bucket or leaky bucket algorithms', expectedAnswer: 'Token bucket: track requests per user in Redis with TTL' },
      hard: { topic: 'System Design', difficulty: 'hard', question: 'Design WhatsApp messaging at scale', hint: 'Consider message storage, delivery, online status', expectedAnswer: 'Websockets for real-time, Cassandra for messages, presence service' }
    },
    'LLD': {
      easy: { topic: 'LLD', difficulty: 'easy', question: 'Design a parking lot system with different vehicle sizes.', hint: 'Think about OOP principles and class hierarchy', expectedAnswer: 'Vehicle base class, ParkingSpot types, ParkingLot manager with slot allocation' },
      medium: { topic: 'LLD', difficulty: 'medium', question: 'Design an elevator system for a building with 50 floors.', hint: 'Think about scheduling algorithms and state machines', expectedAnswer: 'Elevator controller, Request queue with SCAN algorithm, State: IDLE/UP/DOWN' },
      hard: { topic: 'LLD', difficulty: 'hard', question: 'Design a chess game with all pieces and move validation.', hint: 'Think about piece hierarchy, board representation, move strategies', expectedAnswer: 'Piece interface with move validation, Board as 8x8 grid, Game controller with turn management' }
    },
    'OS': {
      easy: { topic: 'OS', difficulty: 'easy', question: 'What is the difference between a process and a thread?', hint: 'Think about memory sharing and isolation', expectedAnswer: 'Process: independent memory space. Thread: shares memory within a process. Threads are lighter.' },
      medium: { topic: 'OS', difficulty: 'medium', question: 'Explain deadlock. What are the four necessary conditions?', hint: 'Think about Coffman conditions', expectedAnswer: 'Mutual exclusion, hold & wait, no preemption, circular wait. All four must hold.' },
      hard: { topic: 'OS', difficulty: 'hard', question: 'Explain virtual memory paging. How does a page fault work end-to-end?', hint: 'Think about page tables, TLB, and disk I/O', expectedAnswer: 'TLB miss → page table walk → page fault → disk read → frame allocation → update PTE → restart instruction' }
    },
    'DBMS': {
      easy: { topic: 'DBMS', difficulty: 'easy', question: 'What is normalization? Explain up to 3NF.', hint: 'Think about reducing redundancy', expectedAnswer: '1NF: atomic values. 2NF: no partial dependencies. 3NF: no transitive dependencies.' },
      medium: { topic: 'DBMS', difficulty: 'medium', question: 'What is the difference between clustered and non-clustered indexes?', hint: 'Think about physical vs logical ordering', expectedAnswer: 'Clustered: one per table, determines physical order. Non-clustered: separate structure with pointers.' },
      hard: { topic: 'DBMS', difficulty: 'hard', question: 'Explain ACID properties and how a database ensures them during concurrent transactions.', hint: 'Think about locks, WAL, and isolation levels', expectedAnswer: 'Atomicity: WAL. Consistency: constraints. Isolation: 2PL/MVCC. Durability: WAL + checkpointing.' }
    },
    'CN': {
      easy: { topic: 'CN', difficulty: 'easy', question: 'Explain the difference between TCP and UDP with use cases.', hint: 'Think about reliability vs speed', expectedAnswer: 'TCP: reliable, ordered, connection-oriented (HTTP, email). UDP: fast, connectionless (gaming, DNS, streaming).' },
      medium: { topic: 'CN', difficulty: 'medium', question: 'What happens when you type a URL and press Enter? Walk through the full network journey.', hint: 'DNS → TCP → HTTP → response', expectedAnswer: 'DNS resolution → TCP 3-way handshake → TLS → HTTP request → server processing → HTTP response → rendering' },
      hard: { topic: 'CN', difficulty: 'hard', question: 'How does TCP congestion control work? Explain slow start and congestion avoidance.', hint: 'Think about cwnd, ssthresh, and AIMD', expectedAnswer: 'Slow start: exponential increase until ssthresh. Congestion avoidance: linear increase. On loss: multiplicative decrease (AIMD).' }
    }
  };

  return fallbacks[topic]?.[difficulty] || fallbacks[topic]?.['medium'] || fallbacks['DSA'][difficulty] || fallbacks['DSA']['medium'];
}

function getAllFallbacks(topic) {
  const q = getFallbackQuestion;
  return [
    q(topic, 'easy'),
    q(topic, 'medium'),
    q(topic, 'hard')
  ];
}

module.exports = router;
