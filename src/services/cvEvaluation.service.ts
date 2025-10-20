import { generateText } from '@config/gemini';
import ragService from './rag.service';
import {
  CVEvaluationResult,
  CVScoreBreakdown,
  CV_WEIGHTS,
  SCORING_SCALE,
} from '../types/evaluation.types';
import { InternalServerError } from '../utils/errors';

export class CVEvaluationService {
  async evaluateCV(cvText: string, jobTitle: string): Promise<CVEvaluationResult> {
    try {
      const ragResult = await ragService.retrieveContexts(
        `CV evaluation for ${jobTitle} position`,
        2,
        'job-description'
      );

      const rubricResult = await ragService.retrieveContexts(
        'CV scoring rubric criteria',
        2,
        'scoring-rubric'
      );

      const contexts = [...ragResult.contexts, ...rubricResult.contexts];

      const prompt = this.buildCVEvaluationPrompt(cvText, jobTitle, contexts);

      const llmResponse = await generateText(prompt);

      const result = this.parseCVEvaluationResponse(llmResponse);

      return result;
    } catch (error: any) {
      throw new InternalServerError(`CV evaluation failed: ${error.message}`);
    }
  }

  private buildCVEvaluationPrompt(
    cvText: string,
    jobTitle: string,
    contexts: any[]
  ): string {
    const contextText = contexts
      .map((ctx) => `Source: ${ctx.filename}\n${ctx.content}`)
      .join('\n\n---\n\n');

    return `You are an expert HR recruiter evaluating a candidate's CV for a ${jobTitle} position.

CONTEXT (Job Description and Scoring Rubric):
${contextText}

CANDIDATE CV:
${cvText}

TASK:
Evaluate the candidate's CV based on the following criteria (scale 1-5):

1. Technical Skills Match (40% weight): Alignment with job requirements (backend, databases, APIs, cloud, AI/LLM)
   - 1 = Irrelevant skills
   - 2 = Few overlaps
   - 3 = Partial match
   - 4 = Strong match
   - 5 = Excellent match + AI/LLM exposure

2. Experience Level (25% weight): Years of experience and project complexity
   - 1 = <1 yr / trivial projects
   - 2 = 1-2 yrs
   - 3 = 2-3 yrs with mid-scale projects
   - 4 = 3-4 yrs solid track record
   - 5 = 5+ yrs / high-impact projects

3. Relevant Achievements (20% weight): Impact of past work (scaling, performance, adoption)
   - 1 = No clear achievements
   - 2 = Minimal improvements
   - 3 = Some measurable outcomes
   - 4 = Significant contributions
   - 5 = Major measurable impact

4. Cultural/Collaboration Fit (15% weight): Communication, learning mindset, teamwork/leadership
   - 1 = Not demonstrated
   - 2 = Minimal
   - 3 = Average
   - 4 = Good
   - 5 = Excellent and well-demonstrated

RESPONSE FORMAT:
Return ONLY a raw JSON object (no markdown, no code blocks, no explanations).

{
  "technical_skills_match": <number 1-5>,
  "experience_level": <number 1-5>,
  "relevant_achievements": <number 1-5>,
  "cultural_fit": <number 1-5>,
  "feedback": "<detailed 3-5 sentences explaining the scores, highlighting strengths and gaps>"
}

IMPORTANT: Return ONLY the JSON object above, nothing else.`;
  }

  private parseCVEvaluationResponse(llmResponse: string): CVEvaluationResult {
    try {
      // Remove markdown code blocks if present
      let cleanResponse = llmResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('[CV Evaluation] LLM Response:', llmResponse);
        throw new Error('No JSON found in LLM response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const breakdown: CVScoreBreakdown = {
        technical_skills_match: this.clampScore(parsed.technical_skills_match),
        experience_level: this.clampScore(parsed.experience_level),
        relevant_achievements: this.clampScore(parsed.relevant_achievements),
        cultural_fit: this.clampScore(parsed.cultural_fit),
      };

      const cv_match_rate = this.calculateCVMatchRate(breakdown);

      return {
        cv_match_rate,
        cv_feedback: parsed.feedback || 'No feedback provided',
        breakdown,
      };
    } catch (error: any) {
      throw new InternalServerError(`Failed to parse CV evaluation response: ${error.message}`);
    }
  }

  private calculateCVMatchRate(breakdown: CVScoreBreakdown): number {
    const weightedScore =
      breakdown.technical_skills_match * CV_WEIGHTS.technical_skills_weight +
      breakdown.experience_level * CV_WEIGHTS.experience_weight +
      breakdown.relevant_achievements * CV_WEIGHTS.achievements_weight +
      breakdown.cultural_fit * CV_WEIGHTS.cultural_fit_weight;

    const matchRate = (weightedScore - SCORING_SCALE.MIN) / (SCORING_SCALE.MAX - SCORING_SCALE.MIN);

    return Math.round(matchRate * 100) / 100;
  }

  private clampScore(score: number): number {
    return Math.max(SCORING_SCALE.MIN, Math.min(SCORING_SCALE.MAX, score));
  }
}

export default new CVEvaluationService();
