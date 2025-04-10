import { NextRequest, NextResponse } from 'next/server';

// This would typically be imported from a shared location or database module
// For simplicity, we're referencing it here (it's defined in ../route.ts)
// In a real app, we'd use a database or persistent storage
const analysisResults = new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!analysisResults.has(id)) {
    return NextResponse.json(
      { error: 'Analysis not found' },
      { status: 404 }
    );
  }

  const analysis = analysisResults.get(id);
  return NextResponse.json(analysis);
} 