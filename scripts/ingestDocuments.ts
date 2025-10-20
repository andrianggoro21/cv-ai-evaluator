import 'dotenv/config';
import { connect } from '@lancedb/lancedb';
import * as path from 'path';
import * as fs from 'fs/promises';
import embeddingService from '../src/services/embedding.service';
import pdfService from '../src/services/pdf.service';

interface Document {
  id: string;
  content: string;
  embedding: number[];
  source: 'job-description' | 'case-study-brief' | 'scoring-rubric';
  filename: string;
  chunk_index: number;
  [key: string]: any;
}

const VECTOR_DB_PATH = process.env.VECTOR_DB_PATH || './data/vectordb';
const DOCS_PATH = './docs';
const CHUNK_SIZE = 1000;

async function ingestJobDescriptions() {
  console.log('\n[Ingest] Processing Multiple Job Descriptions...');

  const jobDescriptions = [
    {
      filename: 'job_desc_backend_ai.txt',
      content: `# Backend Engineer Position - AI/LLM Automation

## Role Overview
We are seeking a Backend Engineer to join our AI automation team. The role focuses on building scalable backend systems that leverage Large Language Models (LLMs) and AI technologies.

## Required Skills
- Strong proficiency in backend development (Node.js, Express, Python, or similar)
- Experience with RESTful API design and implementation
- Database expertise (SQL and NoSQL)
- Knowledge of AI/LLM integration (OpenAI, Gemini, Claude, etc.)
- Understanding of RAG (Retrieval-Augmented Generation) systems
- Experience with vector databases (LanceDB, Pinecone, Chroma, etc.)
- Familiarity with cloud platforms (AWS, GCP, Azure)
- Queue/job processing systems (BullMQ, RabbitMQ, etc.)

## Desired Experience
- 3-5 years of backend development experience
- Previous work with LLM-based applications
- Experience building production-grade AI systems
- Strong problem-solving and system design skills

## Key Responsibilities
- Design and implement AI-powered backend services
- Build RAG pipelines for context-aware AI responses
- Optimize LLM prompts and chaining strategies
- Ensure system resilience and error handling
- Write clean, maintainable, and well-tested code
- Document technical decisions and architecture`,
    },
    {
      filename: 'job_desc_product_engineer.txt',
      content: `# Product Engineer (Backend) - Rakamin 2025

## About the Role
Building new product features alongside frontend engineer and product manager using Agile methodology. Write clean, efficient code to enhance product codebase. This role touches on building AI-powered systems, designing and orchestrating how LLMs integrate into product ecosystem.

## Key Responsibilities
- Collaborate with frontend engineers and 3rd parties for robust backend solutions
- Develop and maintain server-side logic for central database
- Design and fine-tune AI prompts aligned with product requirements
- Build LLM chaining flows with reliable output passing
- Implement RAG by embedding and retrieving context from vector databases
- Handle long-running AI processes with job orchestration and async workers
- Design safeguards for 3rd party API failures and LLM nondeterminism
- Write reusable, testable, and efficient code
- Conduct full product lifecycles from idea to deployment

## Required Skills
- Backend languages: Node.js, Django, Rails
- Database management: MySQL, PostgreSQL, MongoDB
- RESTful APIs and security compliance
- Cloud technologies: AWS, Google Cloud, Azure
- User authentication and authorization
- Scalable application design
- Automated testing platforms
- Familiarity with LLM APIs, embeddings, vector databases`,
    },
    {
      filename: 'job_desc_senior_backend.txt',
      content: `# Senior Backend Developer - AI Platform

## Position Overview
Lead backend development for AI-powered platform. Focus on scalability, performance, and integration of machine learning models into production systems.

## Technical Requirements
- 5+ years backend development experience
- Expert in Node.js, Python, or Go
- Deep understanding of microservices architecture
- Experience with Kubernetes and Docker
- Strong database design skills (SQL and NoSQL)
- API design and implementation expertise
- Knowledge of AI/ML model deployment
- Vector database experience (Pinecone, Weaviate, LanceDB)
- Message queue systems (Kafka, RabbitMQ, Redis)

## AI/ML Integration Skills
- LLM API integration (OpenAI, Anthropic, Google)
- Prompt engineering and optimization
- RAG system implementation
- Embedding generation and semantic search
- Context injection strategies
- Model chaining and orchestration

## Responsibilities
- Architect scalable backend services
- Implement AI model serving infrastructure
- Design data pipelines for ML workflows
- Optimize system performance and reliability
- Mentor junior developers
- Technical documentation and knowledge sharing`,
    },
  ];

  const allDocuments: Document[] = [];
  let totalChunks = 0;

  for (const jobDesc of jobDescriptions) {
    const chunks = embeddingService.chunkText(jobDesc.content, CHUNK_SIZE);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embeddingService.generateEmbedding(chunks[i]);
      allDocuments.push({
        id: `job-desc-${totalChunks}`,
        content: chunks[i],
        embedding,
        source: 'job-description',
        filename: jobDesc.filename,
        chunk_index: i,
      });
      totalChunks++;
      console.log(`  ✓ ${jobDesc.filename} - Chunk ${i + 1}/${chunks.length} embedded`);
    }
  }

  console.log(`  Total job description chunks: ${totalChunks}`);
  return allDocuments;
}

async function ingestCVScoringRubric() {
  console.log('\n[Ingest] Processing CV Scoring Rubric...');

  const cvScoringRubric = `
# CV Evaluation Scoring Rubric

## CV Evaluation Criteria (40% total weight)

### 1. Technical Skills Match (40% of CV score)
**Scale: 1-5**
- **5 - Excellent**: All required skills + AI/LLM experience + advanced backend expertise
- **4 - Strong**: Most required skills + some AI exposure + solid backend experience
- **3 - Partial**: Core backend skills present, limited AI/LLM experience
- **2 - Weak**: Few relevant skills, gaps in backend fundamentals
- **1 - Irrelevant**: Skills not aligned with role requirements

### 2. Experience Level (25% of CV score)
**Scale: 1-5**
- **5 - Senior (5+ years)**: Extensive experience with high-impact projects
- **4 - Mid-Senior (3-4 years)**: Strong track record with complex systems
- **3 - Mid-level (2-3 years)**: Moderate experience with production systems
- **2 - Junior (1-2 years)**: Limited professional experience
- **1 - Entry (< 1 year)**: Minimal or no professional experience

### 3. Relevant Achievements (20% of CV score)
**Scale: 1-5**
- **5 - Outstanding**: Major measurable impact (e.g., 10x performance, $M savings)
- **4 - Significant**: Clear quantifiable contributions to business/product
- **3 - Moderate**: Some measurable outcomes demonstrated
- **2 - Minimal**: Few or vague achievements mentioned
- **1 - None**: No clear achievements or impact stated

### 4. Cultural/Collaboration Fit (15% of CV score)
**Scale: 1-5**
- **5 - Excellent**: Strong communication, leadership, learning mindset demonstrated
- **4 - Good**: Clear collaboration and communication skills
- **3 - Average**: Basic teamwork indicators present
- **2 - Minimal**: Little evidence of soft skills
- **1 - Poor**: No collaboration or communication indicators

## Weight Distribution
- Technical Skills Match: 40%
- Experience Level: 25%
- Relevant Achievements: 20%
- Cultural/Collaboration Fit: 15%
- Total: 100% → Convert to 0-1 decimal scale for cv_match_rate
`;

  const chunks = embeddingService.chunkText(cvScoringRubric, CHUNK_SIZE);
  const documents: Document[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embeddingService.generateEmbedding(chunks[i]);
    documents.push({
      id: `cv-rubric-${i}`,
      content: chunks[i],
      embedding,
      source: 'scoring-rubric',
      filename: 'cv_scoring_rubric.txt',
      chunk_index: i,
    });
    console.log(`  ✓ Chunk ${i + 1}/${chunks.length} embedded`);
  }

  return documents;
}

async function ingestProjectScoringRubric() {
  console.log('\n[Ingest] Processing Project Scoring Rubric...');

  const projectScoringRubric = `
# Project Deliverable Evaluation Scoring Rubric

## Project Evaluation Criteria (60% total weight)

### 1. Correctness - Prompt & Chaining (30% of project score)
**Scale: 1-5**
- **5 - Excellent**: Perfect implementation of prompt design, LLM chaining, RAG context injection
- **4 - Strong**: Correct implementation with minor issues
- **3 - Adequate**: Core functionality works, some logic gaps
- **2 - Weak**: Partial implementation, significant issues
- **1 - Poor**: Not implemented or fundamentally broken

### 2. Code Quality & Structure (25% of project score)
**Scale: 1-5**
- **5 - Excellent**: Clean architecture, modular design, comprehensive tests, best practices
- **4 - Strong**: Good structure, some tests, follows conventions
- **3 - Adequate**: Decent organization, minimal tests
- **2 - Weak**: Poor structure, hard to maintain
- **1 - Poor**: Unorganized, no tests, anti-patterns

### 3. Resilience & Error Handling (20% of project score)
**Scale: 1-5**
- **5 - Production-ready**: Robust error handling, retries, graceful degradation
- **4 - Strong**: Good error handling for common scenarios
- **3 - Adequate**: Basic error handling present
- **2 - Weak**: Minimal error handling
- **1 - None**: No error handling, fragile system

### 4. Documentation & Explanation (15% of project score)
**Scale: 1-5**
- **5 - Excellent**: Comprehensive README, clear setup, architecture explanations, trade-offs discussed
- **4 - Strong**: Good documentation, clear instructions
- **3 - Adequate**: Basic README, setup works
- **2 - Weak**: Minimal documentation
- **1 - None**: No documentation

### 5. Creativity/Bonus (10% of project score)
**Scale: 1-5**
- **5 - Outstanding**: Multiple innovative features beyond requirements
- **4 - Strong**: Meaningful enhancements
- **3 - Good**: Some useful extras
- **2 - Minimal**: Very basic additions
- **1 - None**: No extras

## Weight Distribution
- Correctness: 30%
- Code Quality: 25%
- Resilience & Error Handling: 20%
- Documentation: 15%
- Creativity/Bonus: 10%
- Total: 100% → Weighted average 1-5 scale for project_score

## Final Hiring Recommendation Guidelines
- **Highly Recommended**: CV match > 0.75 AND project score > 4.0
- **Recommended**: CV match > 0.65 AND project score > 3.5
- **Consider**: CV match > 0.50 OR project score > 3.0
- **Not Recommended**: Below thresholds
`;

  const chunks = embeddingService.chunkText(projectScoringRubric, CHUNK_SIZE);
  const documents: Document[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embeddingService.generateEmbedding(chunks[i]);
    documents.push({
      id: `project-rubric-${i}`,
      content: chunks[i],
      embedding,
      source: 'scoring-rubric',
      filename: 'project_scoring_rubric.txt',
      chunk_index: i,
    });
    console.log(`  ✓ Chunk ${i + 1}/${chunks.length} embedded`);
  }

  return documents;
}

async function ingestCaseStudyBrief() {
  console.log('\n[Ingest] Processing Case Study Brief PDF...');

  const pdfPath = path.join(DOCS_PATH, 'Case Study Brief - Backend.pdf');

  try {
    await fs.access(pdfPath);
  } catch (error) {
    console.log('  ⚠ Case Study Brief PDF not found, skipping...');
    return [];
  }

  const text = await pdfService.extractText(pdfPath);
  const chunks = embeddingService.chunkText(text, CHUNK_SIZE);
  const documents: Document[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embeddingService.generateEmbedding(chunks[i]);
    documents.push({
      id: `case-study-${i}`,
      content: chunks[i],
      embedding,
      source: 'case-study-brief',
      filename: 'Case Study Brief - Backend.pdf',
      chunk_index: i,
    });
    console.log(`  ✓ Chunk ${i + 1}/${chunks.length} embedded`);
  }

  return documents;
}

async function main() {
  console.log('=== Document Ingestion Script ===\n');
  console.log(`Vector DB Path: ${VECTOR_DB_PATH}`);
  console.log(`Chunk Size: ${CHUNK_SIZE} characters (smart chunking by sentences)\n`);

  try {
    const allDocuments: Document[] = [];

    const jobDescDocs = await ingestJobDescriptions();
    allDocuments.push(...jobDescDocs);

    const cvRubricDocs = await ingestCVScoringRubric();
    allDocuments.push(...cvRubricDocs);

    const projectRubricDocs = await ingestProjectScoringRubric();
    allDocuments.push(...projectRubricDocs);

    const caseStudyDocs = await ingestCaseStudyBrief();
    allDocuments.push(...caseStudyDocs);

    console.log(`\n[Ingest] Total documents to store: ${allDocuments.length}`);

    console.log('\n[VectorDB] Connecting to LanceDB...');
    const db = await connect(VECTOR_DB_PATH);

    console.log('[VectorDB] Creating table...');
    const table = await db.createTable('documents', allDocuments, {
      mode: 'overwrite',
    });

    console.log('[VectorDB] Verifying ingestion...');
    const count = await table.countRows();
    console.log(`[VectorDB] ✓ Successfully stored ${count} document chunks`);

    console.log('\n[Ingest] Document summary:');
    console.log(`  - Job Descriptions (multiple): ${jobDescDocs.length} chunks`);
    console.log(`  - CV Scoring Rubric: ${cvRubricDocs.length} chunks`);
    console.log(`  - Project Scoring Rubric: ${projectRubricDocs.length} chunks`);
    console.log(`  - Case Study Brief: ${caseStudyDocs.length} chunks`);

    console.log('\n✅ Document ingestion completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Ingestion failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
