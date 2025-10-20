import { generateText } from '@config/gemini';
import ragService from './rag.service';
import {
  CVEvaluationResult,
  ProjectEvaluationResult,
  FinalAnalysisResult,
} from '../types/evaluation.types';
import { InternalServerError } from '../utils/errors';

export class FinalAnalysisService {
  async generateFinalAnalysis(
    cvEvaluation: CVEvaluationResult,
    projectEvaluation: ProjectEvaluationResult,
    jobTitle: string
  ): Promise<FinalAnalysisResult> {
    try {
      const ragResult = await ragService.retrieveContexts(
        `Final candidate evaluation for ${jobTitle}`,
        1
      );

      const prompt = this.buildFinalAnalysisPrompt(
        cvEvaluation,
        projectEvaluation,
        jobTitle,
        ragResult.contexts
      );

      const llmResponse = await generateText(prompt);

      const result = this.parseFinalAnalysisResponse(
        llmResponse,
        cvEvaluation,
        projectEvaluation
      );

      return result;
    } catch (error: any) {
      throw new InternalServerError(`Final analysis failed: ${error.message}`);
    }
  }

  private buildFinalAnalysisPrompt(
    cvEvaluation: CVEvaluationResult,
    projectEvaluation: ProjectEvaluationResult,
    jobTitle: string,
    contexts: any[]
  ): string {
    const contextText = contexts
      .map((ctx) => `Source: ${ctx.filename}\n${ctx.content}`)
      .join('\n\n---\n\n');

    return `You are an expert hiring manager making the final decision on a candidate for a ${jobTitle} position.

CONTEXT:
${contextText}

CV EVALUATION RESULTS:
- Match Rate: ${cvEvaluation.cv_match_rate.toFixed(2)} (0-1 scale)
- Technical Skills: ${cvEvaluation.breakdown.technical_skills_match}/5
- Experience: ${cvEvaluation.breakdown.experience_level}/5
- Achievements: ${cvEvaluation.breakdown.relevant_achievements}/5
- Cultural Fit: ${cvEvaluation.breakdown.cultural_fit}/5
- Feedback: ${cvEvaluation.cv_feedback}

PROJECT EVALUATION RESULTS:
- Overall Score: ${projectEvaluation.project_score.toFixed(2)}/5
- Correctness: ${projectEvaluation.breakdown.correctness}/5
- Code Quality: ${projectEvaluation.breakdown.code_quality}/5
- Resilience: ${projectEvaluation.breakdown.resilience_error_handling}/5
- Documentation: ${projectEvaluation.breakdown.documentation}/5
- Creativity: ${projectEvaluation.breakdown.creativity_bonus}/5
- Feedback: ${projectEvaluation.project_feedback}

TASK:
Based on the CV and project evaluations, provide a final hiring recommendation.

RESPONSE FORMAT:
Return ONLY a raw JSON object (no markdown, no code blocks, no explanations).

{
  "overall_summary": "<3-5 sentences synthesizing both evaluations, providing clear hiring recommendation>",
  "recommendation": "<one of: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended'>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"]
}

Guidelines for recommendation:
- "Highly Recommended": CV match > 0.75 AND project score > 4.0
- "Recommended": CV match > 0.65 AND project score > 3.5
- "Consider": CV match > 0.50 OR project score > 3.0
- "Not Recommended": Below thresholds

IMPORTANT: Return ONLY the JSON object above, nothing else.`;
  }

  private parseFinalAnalysisResponse(
    llmResponse: string,
    cvEvaluation: CVEvaluationResult,
    projectEvaluation: ProjectEvaluationResult
  ): FinalAnalysisResult {
    try {
      // Remove markdown code blocks if present
      let cleanResponse = llmResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('[Final Analysis] LLM Response:', llmResponse);
        throw new Error('No JSON found in LLM response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const validRecommendations = [
        'Highly Recommended',
        'Recommended',
        'Consider',
        'Not Recommended',
      ];

      const recommendation = validRecommendations.includes(parsed.recommendation)
        ? parsed.recommendation
        : this.determineRecommendation(cvEvaluation.cv_match_rate, projectEvaluation.project_score);

      const final_score = this.calculateFinalScore(
        cvEvaluation.cv_match_rate,
        projectEvaluation.project_score
      );

      return {
        overall_summary: parsed.overall_summary || 'No summary provided',
        recommendation,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        final_score,
      };
    } catch (error: any) {
      throw new InternalServerError(
        `Failed to parse final analysis response: ${error.message}`
      );
    }
  }

  private determineRecommendation(
    cvMatchRate: number,
    projectScore: number
  ): 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended' {
    if (cvMatchRate > 0.75 && projectScore > 4.0) {
      return 'Highly Recommended';
    }
    if (cvMatchRate > 0.65 && projectScore > 3.5) {
      return 'Recommended';
    }
    if (cvMatchRate > 0.5 || projectScore > 3.0) {
      return 'Consider';
    }
    return 'Not Recommended';
  }

  private calculateFinalScore(cvMatchRate: number, projectScore: number): number {
    const cvWeight = 0.4;
    const projectWeight = 0.6;

    const normalizedCVScore = cvMatchRate * 5;
    const finalScore = normalizedCVScore * cvWeight + projectScore * projectWeight;

    return Math.round(finalScore * 100) / 100;
  }
}

export default new FinalAnalysisService();
