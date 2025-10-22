import 'dotenv/config';
import { connect } from '@lancedb/lancedb';
import * as path from 'path';
import * as fs from 'fs/promises';
import embeddingService from '../src/services/embedding.service';

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
const CHUNK_SIZE = 1000;

async function ingestJobDescriptions() {
  console.log('\n[Ingest] Processing Job Descriptions from files...');

  const jobDescPath = path.join('./data/documents/job-descriptions');
  const allDocuments: Document[] = [];
  let totalChunks = 0;

  try {
    const files = await fs.readdir(jobDescPath);
    const txtFiles = files.filter((f) => f.endsWith('.txt'));

    if (txtFiles.length === 0) {
      console.log('  ⚠ No job description files found, skipping...');
      return [];
    }

    for (const filename of txtFiles) {
      const filePath = path.join(jobDescPath, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const chunks = embeddingService.chunkText(content, CHUNK_SIZE);

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await embeddingService.generateEmbedding(chunks[i]);
        allDocuments.push({
          id: `job-desc-${totalChunks}`,
          content: chunks[i],
          embedding,
          source: 'job-description',
          filename,
          chunk_index: i,
        });
        totalChunks++;
        console.log(`  ✓ ${filename} - Chunk ${i + 1}/${chunks.length} embedded`);
      }
    }

    console.log(`  Total job description chunks: ${totalChunks}`);
    return allDocuments;
  } catch (error: any) {
    console.error('  ❌ Error reading job descriptions:', error.message);
    return [];
  }
}

async function ingestCVScoringRubric() {
  console.log('\n[Ingest] Processing CV Scoring Rubric from file...');

  const rubricPath = path.join('./data/documents/scoring-rubrics/cv-scoring-rubric.txt');

  try {
    await fs.access(rubricPath);
    const content = await fs.readFile(rubricPath, 'utf-8');
    const chunks = embeddingService.chunkText(content, CHUNK_SIZE);
    const documents: Document[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embeddingService.generateEmbedding(chunks[i]);
      documents.push({
        id: `cv-rubric-${i}`,
        content: chunks[i],
        embedding,
        source: 'scoring-rubric',
        filename: 'cv-scoring-rubric.txt',
        chunk_index: i,
      });
      console.log(`  ✓ Chunk ${i + 1}/${chunks.length} embedded`);
    }

    return documents;
  } catch (error: any) {
    console.log('  ⚠ CV Scoring Rubric not found, skipping...');
    return [];
  }
}

async function ingestProjectScoringRubric() {
  console.log('\n[Ingest] Processing Project Scoring Rubric from file...');

  const rubricPath = path.join('./data/documents/scoring-rubrics/project-scoring-rubric.txt');

  try {
    await fs.access(rubricPath);
    const content = await fs.readFile(rubricPath, 'utf-8');
    const chunks = embeddingService.chunkText(content, CHUNK_SIZE);
    const documents: Document[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embeddingService.generateEmbedding(chunks[i]);
      documents.push({
        id: `project-rubric-${i}`,
        content: chunks[i],
        embedding,
        source: 'scoring-rubric',
        filename: 'project-scoring-rubric.txt',
        chunk_index: i,
      });
      console.log(`  ✓ Chunk ${i + 1}/${chunks.length} embedded`);
    }

    return documents;
  } catch (error: any) {
    console.log('  ⚠ Project Scoring Rubric not found, skipping...');
    return [];
  }
}

async function ingestCaseStudyBrief() {
  console.log('\n[Ingest] Processing Case Study Brief (SKIPPED - Confidential)...');
  console.log('  ⚠ Case Study Brief is confidential and should not be included in repository');
  console.log('  ℹ If you need to ingest a case study, add PDF to data/documents/case-study-brief/');
  return [];
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
