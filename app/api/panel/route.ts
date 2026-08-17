import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getVisa } from "@/lib/visas";
import { runPanel } from "@/lib/agents/panel";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { evidence, visaId } = await req.json();
  const visa = getVisa(visaId);
  if (!visa) {
    return NextResponse.json({ error: "unknown visa" }, { status: 400 });
  }

  try {
    const result = await runPanel(evidence ?? [], visa);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
