import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CausalNode {
  type: "cause" | "condition" | "effect" | "truth";
  title: string;
  description: string;
  intensity: number; // 1-10
}

export interface CausalInsight {
  summary: string;
  nodes: CausalNode[];
  hiddenTruth: string;
  futureTrajectory: string;
}

export async function analyzeCausality(input: string): Promise<CausalInsight> {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [{
      parts: [{
        text: `你是一个洞察世间万物因果真相的智者。请分析以下现象或问题，揭示其背后的深层因果关系。
        
输入: "${input}"

请以JSON格式返回分析结果，包含以下字段：
1. summary: 对该现象的简要因果总结。
2. nodes: 一个包含因果节点的数组，每个节点包含：
   - type: "cause" (原因), "condition" (助缘/条件), "effect" (结果), "truth" (核心本质)。
   - title: 节点的简短标题。
   - description: 详细解释。
   - intensity: 该节点的影响强度 (1-10)。
3. hiddenTruth: 隐藏在表象之下的、最深刻的真相。
4. futureTrajectory: 基于当前因果链，未来的可能走向。

确保分析深刻、客观、具有洞察力。`
      }]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["cause", "condition", "effect", "truth"] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                intensity: { type: Type.NUMBER }
              },
              required: ["type", "title", "description", "intensity"]
            }
          },
          hiddenTruth: { type: Type.STRING },
          futureTrajectory: { type: Type.STRING }
        },
        required: ["summary", "nodes", "hiddenTruth", "futureTrajectory"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("无法解析因果分析结果");
  }
}
