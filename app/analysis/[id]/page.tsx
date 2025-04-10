'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ApiSpecEditor from '../../components/ApiSpecEditor';
import CircularProgress from '../../components/CircularProgress';
import SeverityBadge from '../../components/SeverityBadge';
import Layout from '../../components/Layout';

interface Finding {
  severity: 'error' | 'warning' | 'info';
  message: string;
  path: string[];
}

interface ScoreCategory {
  score: number;
  weight: number;
  findings: Finding[];
}

interface AnalysisResult {
  fileName: string;
  specVersion: string;
  scores: {
    documentation: ScoreCategory;
    syntax: ScoreCategory;
    bestPractices: ScoreCategory;
    security: ScoreCategory;
    usability: ScoreCategory;
  };
  overallScore: number;
  timestamp: string;
}

interface AnalysisData {
  result: AnalysisResult;
  spec: Record<string, unknown>;
  originalSpec: {
    name: string;
    content: string;
    format: string;
  };
  extractedSpecs: unknown[];
}

export default function AnalysisPage() {
  const params = useParams();
  const analysisId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const response = await fetch(`/api/analyze/${analysisId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analysis results');
        }
        
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalysis();
  }, [analysisId]);

  if (loading) {
    return (
      <Layout subtitle="Analyzing your API specification...">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analysis results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !analysis) {
    return (
      <Layout subtitle="Something went wrong">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold mb-4">Error Loading Analysis</h2>
            <p className="text-gray-600 mb-6">{error || 'Failed to load analysis results'}</p>
            <Link href="/" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300">
              Back to Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const { result, originalSpec } = analysis;
  const { scores, overallScore, fileName, specVersion } = result;

  // Get total findings count
  const totalFindings = Object.values(scores).reduce(
    (count, category) => count + category.findings.length, 
    0
  );

  // Count findings by severity
  const findingsBySeverity = Object.values(scores).reduce(
    (acc, category) => {
      category.findings.forEach(finding => {
        acc[finding.severity]++;
      });
      return acc;
    }, 
    { error: 0, warning: 0, info: 0 }
  );

  // Format score as percentage
  const formatScore = (score: number) => `${Math.round(score * 100)}%`;

  // Get appropriate color class based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get letter grade based on score
  const getGrade = (score: number) => {
    if (score >= 0.9) return 'A';
    if (score >= 0.8) return 'B';
    if (score >= 0.7) return 'C';
    if (score >= 0.6) return 'D';
    return 'F';
  };

  return (
    <Layout subtitle={`Analysis results for ${fileName}`}>
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </Link>
      </div>
      
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{fileName}</h2>
            <p className="text-gray-600 mt-1">{specVersion}</p>
            <p className="text-gray-500 text-sm mt-1">
              Analyzed on {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <div className={`text-5xl font-bold ${getScoreColorClass(overallScore)}`}>
              {getGrade(overallScore)}
            </div>
            <div className="ml-4">
              <div className="text-xl font-semibold">
                {formatScore(overallScore)}
              </div>
              <div className="text-gray-500 text-sm">Overall Score</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-gray-500 text-sm mb-1">Findings</div>
              <div className="flex items-center">
                <span className="text-xl font-semibold">{totalFindings}</span>
                <div className="ml-2 flex">
                  <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 mr-1">
                    {findingsBySeverity.error} Errors
                  </span>
                  <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 mr-1">
                    {findingsBySeverity.warning} Warnings
                  </span>
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                    {findingsBySeverity.info} Info
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-gray-500 text-sm mb-1">Specification Type</div>
              <div className="text-xl font-semibold">{specVersion}</div>
            </div>
            
            <div>
              <div className="text-gray-500 text-sm mb-1">File Size</div>
              <div className="text-xl font-semibold">
                {Math.round(originalSpec.content.length / 1024)} KB
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-6 py-3 font-medium border-b-2 ${
              activeTab === 'findings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('findings')}
          >
            Findings
          </button>
          <button
            className={`px-6 py-3 font-medium border-b-2 ${
              activeTab === 'spec'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('spec')}
          >
            API Spec
          </button>
        </div>
        
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Overall Score</h3>
              
              <div className="flex justify-center mb-8">
                <CircularProgress 
                  percentage={Math.round(overallScore * 100)} 
                  size={180}
                  strokeWidth={15}
                  grade={getGrade(overallScore)}
                  label="Overall Quality"
                />
              </div>
              
              <h3 className="text-xl font-bold mb-4">Score Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Object.entries(scores).map(([category, data]) => (
                  <div key={category} className="border rounded-lg p-4 flex flex-col items-center">
                    <h4 className="font-medium capitalize mb-3">{category}</h4>
                    
                    <CircularProgress 
                      percentage={Math.round(data.score * 100)} 
                      size={100}
                      strokeWidth={8}
                    />
                    
                    <p className="text-sm text-gray-500 mt-3">
                      Weight: {Math.round(data.weight * 100)}%
                    </p>
                    
                    <p className="text-sm mt-2">
                      <span className="font-medium">{data.findings.length}</span> findings
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Recommendations</h3>
                
                <div className="space-y-4">
                  {Object.entries(scores).filter(([, data]) => data.findings.length > 0).map(([category, data]) => (
                    <div key={`rec-${category}`} className="border rounded-lg p-4">
                      <h4 className="font-medium capitalize mb-2">{category} Improvements</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {data.findings.slice(0, 3).map((finding, index) => (
                          <li key={index} className="text-gray-700">
                            {finding.message}
                          </li>
                        ))}
                        {data.findings.length > 3 && (
                          <li className="text-blue-600 cursor-pointer" onClick={() => setActiveTab('findings')}>
                            View {data.findings.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Findings Tab */}
          {activeTab === 'findings' && (
            <div>
              <h3 className="text-xl font-bold mb-4">All Findings</h3>
              
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  className="px-3 py-1 border rounded-full text-sm hover:bg-gray-50"
                  onClick={() => {/* Filter logic */}}
                >
                  All ({totalFindings})
                </button>
                <button
                  className="px-3 py-1 border rounded-full text-sm hover:bg-gray-50 flex items-center"
                  onClick={() => {/* Filter logic */}}
                >
                  <SeverityBadge severity="error" size="sm" showText={false} />
                  <span className="ml-1">Errors ({findingsBySeverity.error})</span>
                </button>
                <button
                  className="px-3 py-1 border rounded-full text-sm hover:bg-gray-50 flex items-center"
                  onClick={() => {/* Filter logic */}}
                >
                  <SeverityBadge severity="warning" size="sm" showText={false} />
                  <span className="ml-1">Warnings ({findingsBySeverity.warning})</span>
                </button>
                <button
                  className="px-3 py-1 border rounded-full text-sm hover:bg-gray-50 flex items-center"
                  onClick={() => {/* Filter logic */}}
                >
                  <SeverityBadge severity="info" size="sm" showText={false} />
                  <span className="ml-1">Info ({findingsBySeverity.info})</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {Object.entries(scores).map(([category, data]) => (
                  <div key={`findings-${category}`}>
                    {data.findings.length > 0 && (
                      <>
                        <h4 className="font-medium capitalize mt-6 mb-3">{category}</h4>
                        <div className="space-y-3">
                          {data.findings.map((finding, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-start">
                                <SeverityBadge severity={finding.severity} />
                                <div className="ml-3">
                                  <p className="font-medium">{finding.message}</p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Path: {finding.path.join('.')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* API Spec Tab */}
          {activeTab === 'spec' && (
            <div>
              <h3 className="text-xl font-bold mb-4">API Specification</h3>
              
              <ApiSpecEditor
                content={originalSpec.content}
                language={originalSpec.format === 'json' ? 'json' : 'yaml'}
                readOnly={true}
                height="500px"
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 