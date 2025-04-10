/**
 * API Specification Analyzer Utility Functions
 * 
 * This file contains the core logic for analyzing OpenAPI/Swagger specifications
 * and calculating quality scores.
 */

interface Finding {
  severity: 'error' | 'warning' | 'info';
  message: string;
  path: string[];
}

export interface AnalysisResult {
  fileName: string;
  specVersion: string;
  scores: {
    documentation: {
      score: number;
      weight: number;
      findings: Finding[];
    };
    syntax: {
      score: number;
      weight: number;
      findings: Finding[];
    };
    bestPractices: {
      score: number;
      weight: number;
      findings: Finding[];
    };
    security: {
      score: number;
      weight: number;
      findings: Finding[];
    };
    usability: {
      score: number;
      weight: number;
      findings: Finding[];
    };
  };
  overallScore: number;
  timestamp: string;
}

/**
 * Analyzes an API specification and returns detailed quality metrics
 */
export async function analyzeApiSpec(spec: Record<string, any>, fileName: string): Promise<AnalysisResult> {
  // Determine the spec version
  const specVersion = spec.swagger ? `Swagger ${spec.swagger}` : `OpenAPI ${spec.openapi}`;
  
  // Calculate scores for different categories
  const documentationScore = calculateDocumentationScore(spec);
  const syntaxScore = calculateSyntaxScore(spec);
  const bestPracticesScore = calculateBestPracticesScore(spec);
  const securityScore = calculateSecurityScore(spec);
  const usabilityScore = calculateUsabilityScore(spec);
  
  // Calculate weighted overall score
  const overallScore = (
    documentationScore * 0.3 +  // 30% weight
    syntaxScore * 0.2 +         // 20% weight
    bestPracticesScore * 0.25 + // 25% weight
    securityScore * 0.15 +      // 15% weight
    usabilityScore * 0.1        // 10% weight
  );
  
  return {
    fileName,
    specVersion,
    scores: {
      documentation: {
        score: documentationScore,
        weight: 0.3,
        findings: getDocumentationFindings(spec),
      },
      syntax: {
        score: syntaxScore,
        weight: 0.2,
        findings: getSyntaxFindings(spec),
      },
      bestPractices: {
        score: bestPracticesScore,
        weight: 0.25,
        findings: getBestPracticesFindings(spec),
      },
      security: {
        score: securityScore,
        weight: 0.15, 
        findings: getSecurityFindings(spec),
      },
      usability: {
        score: usabilityScore,
        weight: 0.1,
        findings: getUsabilityFindings(spec),
      },
    },
    overallScore: Math.round(overallScore * 100) / 100, // Round to 2 decimal places
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculates a score for documentation completeness
 */
function calculateDocumentationScore(spec: Record<string, any>): number {
  let score = 0;
  
  // Check if API has a title and description
  if (spec.info?.title) score += 0.1;
  if (spec.info?.description) score += 0.1;
  
  // Check if API has version information
  if (spec.info?.version) score += 0.1;
  
  // Check endpoints documentation
  const paths = spec.paths || {};
  let pathsWithDescription = 0;
  let pathsWithOperationId = 0;
  let pathsWithResponses = 0;
  let pathsWithParameters = 0;
  
  const totalPaths = Object.keys(paths).length;
  if (totalPaths > 0) {
    for (const path in paths) {
      const methods = paths[path];
      for (const method in methods) {
        if (method === 'parameters') continue;
        
        const operation = methods[method];
        if (operation.description || operation.summary) pathsWithDescription++;
        if (operation.operationId) pathsWithOperationId++;
        if (operation.responses && Object.keys(operation.responses).length > 0) pathsWithResponses++;
        if (operation.parameters && operation.parameters.length > 0) pathsWithParameters++;
      }
    }
    
    score += (pathsWithDescription / totalPaths) * 0.2;
    score += (pathsWithOperationId / totalPaths) * 0.1;
    score += (pathsWithResponses / totalPaths) * 0.2;
    score += (pathsWithParameters / totalPaths) * 0.2;
  }
  
  return Math.min(1, score);
}

/**
 * Calculates a score for syntax validity
 */
function calculateSyntaxScore(spec: Record<string, any>): number {
  // This would normally involve a proper validation against the schema
  // For now, we'll use a simplified approach
  let score = 0.8; // Assume mostly valid
  
  // Basic validation
  if (!spec.paths) score -= 0.2;
  if (!spec.info) score -= 0.2;
  if (!spec.info?.title) score -= 0.1;
  if (spec.swagger && spec.swagger !== '2.0') score -= 0.2;
  if (spec.openapi && !spec.openapi.match(/^3\.\d+\.\d+$/)) score -= 0.2;
  
  return Math.max(0, score);
}

/**
 * Calculates a score for adherence to best practices
 */
function calculateBestPracticesScore(spec: Record<string, any>): number {
  let score = 0;
  
  // Check for tags
  if (spec.tags && spec.tags.length > 0) score += 0.2;
  
  // Check for consistent naming
  score += 0.3; // Simplified for now
  
  // Check for examples
  let hasExamples = false;
  const paths = spec.paths || {};
  for (const path in paths) {
    const methods = paths[path];
    for (const method in methods) {
      if (method === 'parameters') continue;
      
      const operation = methods[method];
      if (operation.responses) {
        for (const code in operation.responses) {
          if (operation.responses[code].examples || operation.responses[code].example) {
            hasExamples = true;
            break;
          }
        }
      }
      if (hasExamples) break;
    }
    if (hasExamples) break;
  }
  if (hasExamples) score += 0.3;
  
  // Check for pagination patterns
  score += 0.2; // Simplified for now
  
  return Math.min(1, score);
}

/**
 * Calculates a score for security configurations
 */
function calculateSecurityScore(spec: Record<string, any>): number {
  let score = 0;
  
  // Check for security definitions
  if (spec.securityDefinitions || spec.components?.securitySchemes) score += 0.5;
  
  // Check for security requirements
  if (spec.security && spec.security.length > 0) score += 0.3;
  
  // Check for HTTPS usage
  const servers = spec.servers || [];
  let hasHttps = false;
  if (servers.length > 0) {
    for (const server of servers) {
      if (server.url && server.url.startsWith('https://')) {
        hasHttps = true;
        break;
      }
    }
  } else if (spec.host) {
    // Swagger 2.0
    const schemes = spec.schemes || [];
    hasHttps = schemes.includes('https');
  }
  if (hasHttps) score += 0.2;
  
  return Math.min(1, score);
}

/**
 * Calculates a score for API usability
 */
function calculateUsabilityScore(spec: Record<string, any>): number {
  let score = 0;
  
  // Check for consistent responses
  score += 0.3; // Simplified for now
  
  // Check for descriptive error responses
  let hasErrorDescriptions = false;
  const paths = spec.paths || {};
  for (const path in paths) {
    const methods = paths[path];
    for (const method in methods) {
      if (method === 'parameters') continue;
      
      const operation = methods[method];
      if (operation.responses) {
        for (const code in operation.responses) {
          if (code.startsWith('4') || code.startsWith('5')) {
            if (operation.responses[code].description) {
              hasErrorDescriptions = true;
              break;
            }
          }
        }
      }
      if (hasErrorDescriptions) break;
    }
    if (hasErrorDescriptions) break;
  }
  if (hasErrorDescriptions) score += 0.3;
  
  // Check for consistent naming
  score += 0.4; // Simplified for now
  
  return Math.min(1, score);
}

/**
 * Generates findings for documentation issues
 */
function getDocumentationFindings(spec: Record<string, any>): Finding[] {
  const findings: Finding[] = [];
  
  if (!spec.info?.title) {
    findings.push({
      severity: 'error',
      message: 'API title is missing',
      path: ['info', 'title'],
    });
  }
  
  if (!spec.info?.description) {
    findings.push({
      severity: 'warning',
      message: 'API description is missing',
      path: ['info', 'description'],
    });
  }
  
  const paths = spec.paths || {};
  for (const path in paths) {
    const methods = paths[path];
    for (const method in methods) {
      if (method === 'parameters') continue;
      
      const operation = methods[method];
      if (!operation.description && !operation.summary) {
        findings.push({
          severity: 'warning',
          message: `Operation ${method.toUpperCase()} ${path} is missing a description`,
          path: ['paths', path, method, 'description'],
        });
      }
      
      if (!operation.operationId) {
        findings.push({
          severity: 'warning',
          message: `Operation ${method.toUpperCase()} ${path} is missing an operationId`,
          path: ['paths', path, method, 'operationId'],
        });
      }
    }
  }
  
  return findings;
}

/**
 * Generates findings for syntax issues
 */
function getSyntaxFindings(spec: Record<string, any>): Finding[] {
  const findings: Finding[] = [];
  
  // Check for required fields
  if (!spec.paths) {
    findings.push({
      severity: 'error',
      message: 'API paths are missing',
      path: ['paths'],
    });
  }
  
  if (!spec.info) {
    findings.push({
      severity: 'error',
      message: 'API info object is missing',
      path: ['info'],
    });
  }
  
  return findings;
}

/**
 * Generates findings for best practices issues
 */
function getBestPracticesFindings(spec: Record<string, any>): Finding[] {
  const findings: Finding[] = [];
  
  if (!spec.tags || spec.tags.length === 0) {
    findings.push({
      severity: 'warning',
      message: 'API does not define tags for organizing operations',
      path: ['tags'],
    });
  }
  
  // Check for response examples
  const paths = spec.paths || {};
  for (const path in paths) {
    const methods = paths[path];
    for (const method in methods) {
      if (method === 'parameters') continue;
      
      const operation = methods[method];
      if (operation.responses) {
        for (const code in operation.responses) {
          const response = operation.responses[code];
          if (code === '200' || code === '201') {
            if (!response.examples && !response.example) {
              findings.push({
                severity: 'info',
                message: `Response ${code} for ${method.toUpperCase()} ${path} does not have examples`,
                path: ['paths', path, method, 'responses', code],
              });
            }
          }
        }
      }
    }
  }
  
  return findings;
}

/**
 * Generates findings for security issues
 */
function getSecurityFindings(spec: Record<string, any>): Finding[] {
  const findings: Finding[] = [];
  
  if (!spec.securityDefinitions && !spec.components?.securitySchemes) {
    findings.push({
      severity: 'warning',
      message: 'API does not define any security schemes',
      path: spec.openapi ? ['components', 'securitySchemes'] : ['securityDefinitions'],
    });
  }
  
  const servers = spec.servers || [];
  let hasHttps = false;
  if (servers.length > 0) {
    for (const server of servers) {
      if (server.url && server.url.startsWith('https://')) {
        hasHttps = true;
        break;
      }
    }
  } else if (spec.host) {
    // Swagger 2.0
    const schemes = spec.schemes || [];
    hasHttps = schemes.includes('https');
  }
  
  if (!hasHttps) {
    findings.push({
      severity: 'warning',
      message: 'API does not enforce HTTPS',
      path: spec.openapi ? ['servers'] : ['schemes'],
    });
  }
  
  return findings;
}

/**
 * Generates findings for usability issues
 */
function getUsabilityFindings(spec: Record<string, any>): Finding[] {
  const findings: Finding[] = [];
  
  // Check for error responses
  const paths = spec.paths || {};
  for (const path in paths) {
    const methods = paths[path];
    for (const method in methods) {
      if (method === 'parameters') continue;
      
      const operation = methods[method];
      if (operation.responses) {
        let has4xx = false;
        for (const code in operation.responses) {
          if (code.startsWith('4')) {
            has4xx = true;
            break;
          }
        }
        
        if (!has4xx) {
          findings.push({
            severity: 'info',
            message: `Operation ${method.toUpperCase()} ${path} does not define any 4xx error responses`,
            path: ['paths', path, method, 'responses'],
          });
        }
      }
    }
  }
  
  return findings;
} 