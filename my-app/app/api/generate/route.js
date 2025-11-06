// app/api/generate/route.js

import { NextResponse } from "next/server";
import { Buffer } from "buffer"; // Still needed to handle the binary image data

const CLIPDROP_URL = 'https://clipdrop-api.co/text-to-image/v1';

export async function POST(req) {
  // 1. Get prompt from the request body
  const { prompt } = await req.json();
  
  // 2. Construct the multipart/form-data body
  const formData = new FormData();
  formData.append('prompt', prompt || 'a horse running on a beach, cinematic');

  try {
    // 3. Call the Clipdrop API
    const response = await fetch(CLIPDROP_URL, {
      method: 'POST',
      headers: {
        // --- AUTHENTICATION ---
        'x-api-key': process.env.CLIPDROP_API_KEY, 
        // DO NOT set 'Content-Type': 'multipart/form-data'. 
        // The browser/runtime sets it automatically with the boundary when using FormData.
      },
      body: formData,
    });

    // 4. Handle API Errors (e.g., status 400, 401, 500)
    if (!response.ok) {
      // API error responses are application/json
      const errorJson = await response.json();
      const errorMessage = `Clipdrop API Error: ${errorJson.error || 'Unknown error'}`;
      
      console.error("Clipdrop Error Details:", errorMessage);
      return NextResponse.json(
        { error: "Image generation failed. Check API key/credits." }, 
        { status: response.status }
      );
    }
    
    // 5. Handle Success (Response is raw image/png binary data)
    // The response body is the raw image data (PNG bytes)
    const arrayBuffer = await response.arrayBuffer(); 

    // Convert the raw binary data to a base64 string
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = response.headers.get('content-type') || 'image/png'; // Use header type for robustness

    // Check for credits in headers (Optional, but useful for debugging)
    const remainingCredits = response.headers.get('x-remaining-credits');
    const consumedCredits = response.headers.get('x-credits-consumed');
    console.log(`Credits: Remaining=${remainingCredits}, Consumed=${consumedCredits}`);

    // Return the image data as a base64 URL
    return NextResponse.json({ image: `data:${mime};base64,${base64}` });

  } catch (err) {
    console.error("Server processing error:", err);
    return NextResponse.json(
      { 
        error: "Server processing failed. Ensure environment variables are set."
      },
      { status: 500 }
    );
  }
}