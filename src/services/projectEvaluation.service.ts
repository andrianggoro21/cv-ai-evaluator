import { generateText } from '@config/gemini';
import ragService from './rag.service';
import {
  ProjectEvaluationResult,
  ProjectScoreBreakdown,
  PROJECT_WEIGHTS,
  SCORING_SCALE,
} from '../types/evaluation.types';
import { InternalServerError } from '../utils/errors';

export class ProjectEvaluationService {
  async evaluateProject(
    projectText: string,
    jobTitle: string,
    cvScore: number
  ): Promise<ProjectEvaluationResult> {
    try {
      const caseStudyResult = await ragService.retrieveContexts(
        'Case study brief requirements',
        2,
        'case-study-brief'
      );

      const rubricResult = await ragService.retrieveContexts(
        'Project deliverable scoring rubric',
        2,
        'scoring-rubric'
      );

      const contexts = [...caseStudyResult.contexts, ...rubricResult.contexts];

      const prompt = this.buildProjectEvaluationPrompt(
        projectText,
        jobTitle,
        cvScore,
        contexts
      );

      const llmResponse = await generateText(prompt);

      const result = this.parseProjectEvaluationResponse(llmResponse);

      return result;
    } catch (error: any) {
      throw new InternalServerError(`Project evaluation failed: ${error.message}`);
    }
  }

  private buildProjectEvaluationPrompt(
    projectText: string,
    jobTitle: string,
    cvScore: number,
    contexts: any[]
  ): string {
    const contextText = contexts
      .map((ctx) => `Source: ${ctx.filename}\n${ctx.content}`)
      .join('\n\n---\n\n');

    return `You are an expert technical reviewer evaluating a candidate's project report for a ${jobTitle} position.

The candidate's CV match rate was ${cvScore.toFixed(2)} (0-1 scale).

CONTEXT (Case Study Brief and Scoring Rubric):
${contextText}

CANDIDATE PROJECT REPORT:
${projectText}

TASK:
Evaluate the project deliverable based on the following criteria (scale 1-5):

1. Correctness (Prompt & Chaining) (30% weight): Implements prompt design, LLM chaining, RAG context injection
   - 1 = Not implemented
   - 2 = Minimal attempt
   - 3 = Works partially
   - 4 = Works correctly
   - 5 = Fully correct + thoughtful

2. Code Quality & Structure (25% weight): Clean, modular, reusable, tested
   - 1 = Poor
   - 2 = Some structure
   - 3 = Decent modularity
   - 4 = Good structure + some tests
   - 5 = Excellent quality + strong tests

3. Resilience & Error Handling (20% weight): Handles long jobs, retries, randomness, API failures
   - 1 = Missing
   - 2 = Minimal
   - 3 = Partial handling
   - 4 = Solid handling
   - 5 = Robust, production-ready

4. Documentation & Explanation (15% weight): README clarity, setup instructions, trade-off explanations
   - 1 = Missing
   - 2 = Minimal
   - 3 = Adequate
   - 4 = Clear
   - 5 = Excellent + insightful

5. Creativity/Bonus (10% weight): Extra features beyond requirements
   - 1 = None
   - 2 = Very basic
   - 3 = Useful extras
   - 4 = Strong enhancements
   - 5 = Outstanding creativity

RESPONSE FORMAT:
Return ONLY a raw JSON object (no markdown, no code blocks, no explanations).

{
  "correctness": <number 1-5>,
  "code_quality": <number 1-5>,
  "resilience_error_handling": <number 1-5>,
  "documentation": <number 1-5>,
  "creativity_bonus": <number 1-5>,
  "feedback": "<detailed 3-5 sentences explaining the scores, highlighting what works well and what could be improved>"
}

IMPORTANT: Return ONLY the JSON object above, nothing else.`;
  }

  private parseProjectEvaluationResponse(llmResponse: string): ProjectEvaluationResult {
    try {
      // Remove markdown code blocks if present
      let cleanResponse = llmResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('[Project Evaluation] LLM Response:', llmResponse);
        throw new Error('No JSON found in LLM response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const breakdown: ProjectScoreBreakdown = {
        correctness: this.clampScore(parsed.correctness),
        code_quality: this.clampScore(parsed.code_quality),
        resilience_error_handling: this.clampScore(parsed.resilience_error_handling),
        documentation: this.clampScore(parsed.documentation),
        creativity_bonus: this.clampScore(parsed.creativity_bonus),
      };

      const project_score = this.calculateProjectScore(breakdown);

      return {
        project_score,
        project_feedback: parsed.feedback || 'No feedback provided',
        breakdown,
      };
    } catch (error: any) {
      throw new InternalServerError(
        `Failed to parse project evaluation response: ${error.message}`
      );
    }
  }

  private calculateProjectScore(breakdown: ProjectScoreBreakdown): number {
    const weightedScore =
      breakdown.correctness * PROJECT_WEIGHTS.correctness_weight +
      breakdown.code_quality * PROJECT_WEIGHTS.code_quality_weight +
      breakdown.resilience_error_handling * PROJECT_WEIGHTS.resilience_weight +
      breakdown.documentation * PROJECT_WEIGHTS.documentation_weight +
      breakdown.creativity_bonus * PROJECT_WEIGHTS.creativity_weight;

    return Math.round(weightedScore * 100) / 100;
  }

  private clampScore(score: number): number {
    return Math.max(SCORING_SCALE.MIN, Math.min(SCORING_SCALE.MAX, score));
  }
}

export default new ProjectEvaluationService();
