export function GET() {
  return Response.json({ message: 'pong', at: new Date().toISOString() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { count?: number };
  return Response.json({
    received: body.count ?? 0,
    at: new Date().toISOString(),
  });
}
