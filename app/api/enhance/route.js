import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert real estate copywriter in India. Enhance the following raw property description to make it sound highly professional, attractive, and engaging to buyers/renters. Keep it realistic, concise (max 3 short paragraphs), and highlight the best features. Do not use overly heavy words. Here is the draft: "${text}"`;

    const result = await model.generateContent(prompt);
    const enhancedText = result.response.text();

    return NextResponse.json({ enhancedText });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to enhance text" }, { status: 500 });
  }
}