import { getRemainingMessages } from "@/lib/limits";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Use IP address as a simple user fingerprint
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  try {
    const result = await getRemainingMessages(ip);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
