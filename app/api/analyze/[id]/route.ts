import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Import the Map from ../route.ts isn't working because serverless functions don't share memory
// We'll need to use the filesystem or a database to store and retrieve results

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  // Make sure we await params if it's a Promise
  const { id } = params instanceof Promise ? await params : params;
  
  try {
    // Try to read the analysis result from the filesystem
    const analysisDir = path.join(process.cwd(), UPLOAD_DIR, id);
    
    // Check if the analysis-result.json exists
    try {
      const resultPath = path.join(analysisDir, 'analysis-result.json');
      const resultData = await fs.readFile(resultPath, 'utf-8');
      const analysisData = JSON.parse(resultData);
      
      return NextResponse.json(analysisData);
    } catch (error) {
      console.error('Error reading analysis result:', error);
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error retrieving analysis:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analysis' },
      { status: 500 }
    );
  }
} 