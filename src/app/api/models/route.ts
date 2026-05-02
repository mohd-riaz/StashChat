const MODELS_URL = 'https://openrouter.ai/api/v1/models';

export async function GET(request: Request): Promise<Response> {
  try {
    const upstream = await fetch(MODELS_URL, {
      headers: { 'Accept': 'application/json' },
      signal: request.signal,
    });
    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: 'upstream_error', status: upstream.status }),
        { status: 502, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
      );
    }
    const body = await upstream.text();
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'unreachable' }),
      { status: 502, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
    );
  }
}
