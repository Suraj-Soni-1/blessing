import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const workflowId = params.id;
  const authHeader = req.headers.get('x-blessing-key');

  let body = {};
  try {
    body = await req.json();
  } catch {
    // Empty or non-json body
  }

  const runId = `run_wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return NextResponse.json({
    success: true,
    workflowId,
    runId,
    status: 'QUEUED',
    authenticated: Boolean(authHeader),
    receivedAt: new Date().toISOString(),
    payloadSummary: body,
    message: 'Blessing background job worker has scheduled execution.'
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    success: true,
    workflowId: params.id,
    status: 'READY_TO_RECEIVE',
    webhookUrl: req.url,
    acceptedMethods: ['POST'],
    expectedHeaders: {
      'Content-Type': 'application/json',
      'x-blessing-key': 'REQUIRED_IF_PROTECTED'
    }
  });
}
