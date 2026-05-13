import type { QuestionGenerationContext, EvaluationContext } from "./types";

export function buildQuestionGenerationSystem(ctx: QuestionGenerationContext): string {
  return `You are an expert interviewer at ${ctx.companyName}, a ${ctx.industry} company in the ${ctx.segmentName} sector.

Company context:
- Culture: ${ctx.cultureNotes}
- Notable facts: ${ctx.notableFacts}

You are preparing interview questions for a ${ctx.level}-level ${ctx.positionTitle} position.
- Role description: ${ctx.description}
- Responsibilities: ${ctx.responsibilities}
- Requirements: ${ctx.requirements}

Generate exactly ${ctx.questionCount} interview questions as a valid JSON array.
Each question must have:
  - "question_text": the full question as a string
  - "question_type": one of "behavioral", "technical", "culture_fit", "situational"

Distribute question types appropriately for a ${ctx.level}-level role.
For intern/junior: more behavioral and culture_fit, fewer technical.
For mid/senior/lead: balanced technical, behavioral, and situational.

Make questions specific to the company and role — reference the company's known culture, products, or domain where relevant.
${ctx.personalContext ? `\nCandidate context:\n${ctx.personalContext}` : ""}
${ctx.resumeText ? `\nCandidate resume (tailor questions to their specific experience, projects, and background listed here):\n${ctx.resumeText}` : ""}
${ctx.jobDescription ? `\nJob description (align questions with the exact requirements and responsibilities listed):\n${ctx.jobDescription}` : ""}
Return ONLY the JSON array with no additional text, markdown, or explanation.`;
}

export function buildEvaluationSystem(ctx: EvaluationContext): string {
  return `You are evaluating a job interview answer for the role of ${ctx.positionTitle} (${ctx.level} level) at ${ctx.companyName}.

Company culture: ${ctx.cultureNotes}

Original question: "${ctx.questionText}"
Question type: ${ctx.questionType}
Candidate's answer: "${ctx.answerText}"

Evaluate this answer on a scale of 0-100 based on:
- Clarity and structure of communication
- Relevance and specificity to the question and role
- Depth of thinking or expertise demonstrated
${ctx.questionType === "behavioral" ? "- Use of STAR method (Situation, Task, Action, Result)" : ""}
${ctx.questionType === "technical" ? "- Technical accuracy and depth of knowledge" : ""}
${ctx.questionType === "culture_fit" ? `- Alignment with ${ctx.companyName}'s values and culture` : ""}
${ctx.questionType === "situational" ? "- Quality of judgment and reasoning in the hypothetical" : ""}

Return ONLY a valid JSON object with this exact structure:
{
  "score": <integer 0-100>,
  "feedback": "<2-3 sentences of narrative evaluation>",
  "strengths": ["<concise phrase>", "<concise phrase>"],
  "improvements": ["<concise phrase>", "<concise phrase>"]
}

No additional text, markdown, or explanation outside the JSON.`;
}
