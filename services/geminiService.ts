
import { GoogleGenAI } from "@google/genai";
import { PerformanceEntry } from '../types';

export async function analyzePerformanceData(
  data: PerformanceEntry[],
  thinkingMode: boolean
): Promise<string> {
  if (!process.env.API_KEY) {
    return "API_KEY is not configured. Please set the API_KEY environment variable.";
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const model = thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const config = thinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

  const prompt = `
    Analyze the following player performance data and provide a detailed summary.
    The data is in JSON format.

    Data:
    ${JSON.stringify(data, null, 2)}

    Please provide the following:
    1.  A high-level overview of the team's performance.
    2.  Identify the top 3 standout performers across all drills and explain why.
    3.  For each drill, identify the player with the highest score.
    4.  Suggest potential areas for team-wide improvement based on the data.
    5.  Format the output in clear, readable markdown.
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config,
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing performance data:", error);
    if (error instanceof Error) {
        return `An error occurred while analyzing the data: ${error.message}`;
    }
    return "An unknown error occurred while analyzing the data.";
  }
}
