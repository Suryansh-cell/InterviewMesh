const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { createWorker } = require('tesseract.js');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

router.post('/parse', upload.single('resume'), async (req, res) => {
  const file = req.file;
  console.log('Resume parse request received:', { hasFile: !!file, mimetype: file?.mimetype, filename: file?.originalname });

  if (!file) {
    return res.status(400).json({ error: 'Please upload a PDF or image file.' });
  }

  try {
    const text = await extractText(file);
    const analysis = analyzeResumeText(text);

    res.json({
      filename: file.originalname,
      summary: analysis.summary,
      skills: analysis.skills,
      strongTopics: analysis.strongTopics,
      weakTopics: analysis.weakTopics,
      recommendedFocus: analysis.recommendedFocus,
      excerpt: text.slice(0, 1200),
    });
  } catch (err) {
    console.error('Resume parse failed:', err?.message || err);
    res.status(500).json({ error: 'Resume parsing failed. Please try another file.' });
  }
});

async function extractText(file) {
  if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    return data.text || '';
  }

  if (file.mimetype.startsWith('image/')) {
    return await extractImageText(file.buffer);
  }

  throw new Error('Unsupported resume format. Please upload PDF, PNG, or JPG.');
}

async function extractImageText(buffer) {
  const worker = createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data } = await worker.recognize(buffer);
  await worker.terminate();
  return data.text || '';
}

function analyzeResumeText(rawText) {
  const text = rawText.toLowerCase();
  const topicMap = {
    'Data Structures': ['array', 'graph', 'tree', 'hash', 'stack', 'queue', 'algorithm', 'dynamic programming', 'dp', 'linked list'],
    'System Design': ['microservice', 'scalability', 'api', 'caching', 'load balancer', 'distributed', 'high availability', 'throughput', 'latency'],
    'Low-Level Design': ['oop', 'object oriented', 'class', 'interface', 'inheritance', 'polymorphism', 'design patterns', 'encapsulation'],
    'Machine Learning': ['machine learning', 'neural network', 'deep learning', 'tensorflow', 'pytorch', 'classification', 'regression', 'model'],
    'Web Development': ['react', 'angular', 'vue', 'html', 'css', 'javascript', 'typescript', 'frontend', 'backend', 'node', 'express'],
    'Cloud & DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'terraform', 'serverless'],
  };

  const scores = Object.entries(topicMap).reduce((acc, [topic, keywords]) => {
    const score = keywords.reduce((count, keyword) => (text.includes(keyword) ? count + 1 : count), 0);
    acc[topic] = score;
    return acc;
  }, {});

  const strongTopics = Object.entries(scores)
    .filter(([, score]) => score >= 2)
    .map(([topic]) => topic);
  const weakTopics = Object.entries(scores)
    .filter(([, score]) => score === 1)
    .map(([topic]) => topic);
  const missingTopics = Object.entries(scores)
    .filter(([, score]) => score === 0)
    .map(([topic]) => topic)
    .slice(0, 3);

  const skills = [];
  if (text.includes('javascript')) skills.push('JavaScript');
  if (text.includes('typescript')) skills.push('TypeScript');
  if (text.includes('python')) skills.push('Python');
  if (text.includes('java')) skills.push('Java');
  if (text.includes('c++') || text.includes('cpp')) skills.push('C++');
  if (text.includes('react')) skills.push('React');
  if (text.includes('node')) skills.push('Node.js');
  if (text.includes('docker')) skills.push('Docker');
  if (text.includes('aws')) skills.push('AWS');
  if (text.includes('kubernetes')) skills.push('Kubernetes');
  if (text.includes('tensorflow') || text.includes('pytorch')) skills.push('Machine Learning');

  const summaryParts = [];
  if (strongTopics.length) {
    summaryParts.push(`Notable strength in ${strongTopics.join(', ')}.`);
  }
  if (weakTopics.length) {
    summaryParts.push(`Some exposure to ${weakTopics.join(', ')} but it could be deeper.`);
  }
  if (missingTopics.length) {
    summaryParts.push(`Consider boosting ${missingTopics.join(', ')} for a more balanced profile.`);
  }

  const recommendedFocus = [...weakTopics, ...missingTopics].slice(0, 4).map((topic) => `Level up ${topic} through targeted mock interviews and practical projects.`);

  return {
    summary: summaryParts.length > 0 ? summaryParts.join(' ') : 'Resume content parsed successfully. Strong profile identified; continue building breadth across core engineering domains.',
    skills: skills.length > 0 ? skills : ['Software Engineering Fundamentals'],
    strongTopics: strongTopics.length > 0 ? strongTopics : ['Problem Solving'],
    weakTopics: weakTopics.length > 0 ? weakTopics : ['System Design', 'Cloud & DevOps'],
    recommendedFocus,
  };
}

module.exports = router;
