const BE_URL = import.meta.env.BE_URL || "http://localhost:3007/Analyze";

export interface MoodResult {
  mood: string;
  confidence: number;
  allScores: { label: string; score: number }[];
}

export async function analyzeMood(text: string): Promise<MoodResult> {
  if (!text.trim()) {
    return { mood: "neutral", confidence: 0.5, allScores: [] };
  }

  try {
    const response = await fetch(`${BE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

//check if response is ok
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`);
    }

    // ✅ Backend already returns { mood, confidence, allScores }
    const result: MoodResult = await response.json();
    return result;
  } catch (error) {
    console.error("Error analyzing mood:", error);
    return { mood: "neutral", confidence: 0.5, allScores: [] };
  }
}
