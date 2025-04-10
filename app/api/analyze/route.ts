import { NextRequest, NextResponse } from 'next/server';
import * as yaml from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { analyzeApiSpec as analyzeSpec } from '../../utils/analyzer';

// In-memory store for analysis results (in production, use a database)
const analysisResults = new Map();

// Get configuration from environment variables
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate a unique ID for this analysis
    const analysisId = uuidv4();
    
    // Create a directory to store temporary files if needed
    const uploadDir = path.join(process.cwd(), UPLOAD_DIR, analysisId);
    await mkdir(uploadDir, { recursive: true });

    // Get file content
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const fileExtension = path.extname(fileName).toLowerCase();

    // Process based on file type
    let apiSpec;
    const extractedSpecs = [];

    if (fileExtension === '.jar') {
      // Handle JAR file
      const zip = new AdmZip(fileBuffer);
      const zipEntries = zip.getEntries();
      
      // Extract files from the 'api-docs' folder
      for (const entry of zipEntries) {
        if (entry.entryName.includes('api-docs') && 
            (entry.entryName.endsWith('.json') || 
             entry.entryName.endsWith('.yaml') || 
             entry.entryName.endsWith('.yml'))) {
          
          const content = entry.getData().toString('utf8');
          extractedSpecs.push({
            name: entry.entryName,
            content,
            format: entry.entryName.endsWith('.json') ? 'json' : 'yaml'
          });
          
          // Save the extracted file
          await writeFile(path.join(uploadDir, path.basename(entry.entryName)), content);
        }
      }

      if (extractedSpecs.length === 0) {
        return NextResponse.json(
          { error: 'No API specification files found in the JAR file' },
          { status: 400 }
        );
      }

      // Use the first spec for now, can be enhanced to handle multiple specs
      apiSpec = extractedSpecs[0];
    } else if (fileExtension === '.json') {
      // Handle JSON file
      const content = fileBuffer.toString('utf8');
      apiSpec = {
        name: fileName,
        content,
        format: 'json'
      };
      
      await writeFile(path.join(uploadDir, fileName), content);
    } else if (fileExtension === '.yaml' || fileExtension === '.yml') {
      // Handle YAML file
      const content = fileBuffer.toString('utf8');
      apiSpec = {
        name: fileName,
        content,
        format: 'yaml'
      };
      
      await writeFile(path.join(uploadDir, fileName), content);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format' },
        { status: 400 }
      );
    }

    // Parse and validate the API spec
    let parsedSpec;
    try {
      if (apiSpec.format === 'json') {
        parsedSpec = JSON.parse(apiSpec.content);
      } else {
        parsedSpec = yaml.load(apiSpec.content);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      return NextResponse.json(
        { error: 'Failed to parse API specification. Invalid format.' },
        { status: 400 }
      );
    }

    // Use our analyzer utility to analyze the API specification
    const analysisResult = await analyzeSpec(parsedSpec, apiSpec.name);
    
    // Store the result
    analysisResults.set(analysisId, {
      result: analysisResult,
      spec: parsedSpec,
      originalSpec: apiSpec,
      extractedSpecs
    });

    // Save the analysis result to a file for retrieval by the GET handler
    try {
      const resultData = {
        result: analysisResult,
        spec: parsedSpec,
        originalSpec: apiSpec,
        extractedSpecs
      };
      
      await writeFile(
        path.join(uploadDir, 'analysis-result.json'),
        JSON.stringify(resultData, null, 2)
      );
    } catch (error) {
      console.error('Error saving analysis result:', error);
      // Continue even if saving fails as we still have the in-memory result
    }

    return NextResponse.json({ analysisId });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process the file' },
      { status: 500 }
    );
  }
}

// Function to analyze API specification - REMOVED
// Duplicate implementation of the function imported from ../../utils/analyzer