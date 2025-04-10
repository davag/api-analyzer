'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    
    // Check if file is JSON, YAML, or JAR
    const validExtensions = ['.json', '.yaml', '.yml', '.jar'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Please upload a valid API specification file (JSON, YAML) or a JAR file.');
      return;
    }
    
    setFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Send to API route
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload and analyze the file.');
      }

      clearInterval(interval);
      setUploadProgress(100);
      
      // Get the analysis result ID
      const { analysisId } = await response.json();
      
      // Redirect to the analysis page
      setTimeout(() => {
        router.push(`/analysis/${analysisId}`);
      }, 500);
    } catch (error) {
      clearInterval(interval);
      setError(error instanceof Error ? error.message : 'Failed to upload the file.');
      setIsUploading(false);
    }
  };

  return (
    <Layout subtitle="Upload your API specification file">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mr-2">
            ← Back to Home
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Upload Specification File</h2>
          
          <form onSubmit={handleSubmit}>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center ${
                isDragging ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              
              <p className="mb-2 text-sm text-gray-900">
                <span className="font-medium">Drag and drop</span> your file here or{' '}
                <label className="text-blue-600 hover:text-blue-800 cursor-pointer">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".json,.yaml,.yml,.jar"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              </p>
              
              <p className="text-xs text-gray-700">
                Supported formats: JSON, YAML/YML (OpenAPI/Swagger), JAR (with api-docs folder)
              </p>
            </div>
            
            {file && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-700">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  
                  {!isUploading && (
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg font-medium">
                {error}
              </div>
            )}
            
            {isUploading && (
              <div className="mb-6">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-900 text-center">
                  {uploadProgress < 100
                    ? `Uploading... ${uploadProgress}%`
                    : 'Processing file...'}
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="button"
                className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-900 hover:bg-gray-50 transition duration-300"
                onClick={() => router.push('/')}
                disabled={isUploading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!file || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Analyze'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 