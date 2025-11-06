import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt)
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    const response = await fetch(
      "https://pollo.ai/api/platform/generation/pollo/pollo-v1-6",
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.POLLO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            prompt,               // Text-to-Video
            resolution: "480p",  
            mode: "basic",
            length: 5,            // only 5 or 10 allowed
            aspectRatio: "16:9",
            seed: Math.floor(Math.random() * 2147483647), // valid range
          },
          webhookUrl: ""          // optional
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Pollo API Error:", data);
      return NextResponse.json(
        { error: data?.message || "Video generation failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Video generation started. Check Pollo dashboard for results.",
      task: data,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
