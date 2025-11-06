import { NextResponse } from "next/server";

const BASE_URL = "https://public-api.beatoven.ai";

export async function POST(req) {
  const { promptText = "30 seconds peaceful lo-fi chill hop track" } =
    await req.json();

  try {
    // 1️⃣ Start the composition task
    const composeRes = await fetch(`${BASE_URL}/api/v1/tracks/compose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BEATOVEN_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: { text: promptText },
        format: "mp3",
        looping: false,
      }),
    });

    if (!composeRes.ok) {
      const err = await composeRes.json().catch(() => ({}));
      console.error("Beatoven compose error:", err);
      return NextResponse.json(
        { error: err.message || "Beatoven compose failed." },
        { status: composeRes.status }
      );
    }

    const { task_id } = await composeRes.json();
    console.log("Started Beatoven task:", task_id);

    // 2️⃣ Poll for task completion
    let status = "composing";
    let trackUrl = null;
    let retries = 0;
    const maxRetries = 60; // wait up to ~2 mins (60 * 2s)

    while (retries < maxRetries && status !== "composed") {
      await new Promise((r) => setTimeout(r, 2000)); // wait 2s
      retries++;

      const statusRes = await fetch(`${BASE_URL}/api/v1/tasks/${task_id}`, {
        headers: {
          Authorization: `Bearer ${process.env.BEATOVEN_API_KEY}`,
        },
      });

      if (!statusRes.ok) {
        console.warn(`Beatoven poll attempt ${retries}: status check failed`);
        continue;
      }

      const statusJson = await statusRes.json();
      status = statusJson.status;

      console.log(`Beatoven status [${retries}]: ${status}`);

      if (status === "composed") {
        trackUrl = statusJson.meta?.track_url;
        break;
      }
    }

    if (!trackUrl) {
      return NextResponse.json(
        {
          error: "Timed out waiting for Beatoven composition.",
        },
        { status: 504 }
      );
    }

    // 3️⃣ Return the final track URL
    return NextResponse.json({ audioUrl: trackUrl });
  } catch (err) {
    console.error("Beatoven server error:", err);
    return NextResponse.json(
      { error: "Server failed to generate music." },
      { status: 500 }
    );
  }
}
