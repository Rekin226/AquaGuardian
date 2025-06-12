#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * AquaGuardian Submission Validator
 * Validates all external links and generates submission checklist
 */

const SUBMISSION_FILE = path.join(__dirname, '..', 'SUBMISSION.md');
const CHECKLIST_FILE = path.join(__dirname, '..', 'submission_checklist.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Links to validate
const EXTERNAL_LINKS = {
  'Live Demo': 'https://aquaguardian.green',
  'GitHub Repository': 'https://github.com/aquaguardian/platform',
  'Video Demo': 'https://youtube.com/watch?v=demo',
  'Algorand Explorer': 'https://testnet.algoexplorer.io',
  'Technical Documentation': 'https://docs.aquaguardian.green',
  'Netlify Deployment': 'https://app.netlify.com/sites/aquaguardian'
};

// Required screenshots
const REQUIRED_SCREENSHOTS = [
  'wizard-interface.png',
  'simulation-dashboard.png',
  'analytics-charts.png',
  'tokenization-features.png',
  'marketplace-designs.png',
  'pro-subscription.png'
];

// Submission checklist template
const CHECKLIST_TEMPLATE = {
  submission_complete: false,
  sections: {
    inspiration_problem: false,
    what_it_does: false,
    tech_stack_architecture: false,
    algorand_challenge_fit: false,
    screenshots_embedded: false
  },
  technical_requirements: {
    mermaid_diagrams: false,
    external_links_validated: false,
    screenshots_exist: false,
    submission_md_exists: false
  },
  algorand_integration: {
    blockchain_features_described: false,
    sustainability_impact: false,
    financial_inclusion: false,
    technical_innovation: false
  },
  deployment: {
    live_demo_accessible: false,
    github_repo_public: false,
    video_demo_available: false,
    documentation_complete: false
  }
};

/**
 * Check if URL is accessible
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    const request = protocol.get(url, (response) => {
      resolve({
        url,
        status: response.statusCode,
        accessible: response.statusCode >= 200 && response.statusCode < 400
      });
    });
    
    request.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        accessible: false,
        error: error.message
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        accessible: false,
        error: 'Request timeout'
      });
    });
  });
}

/**
 * Validate submission file exists and has required content
 */
function validateSubmissionFile() {
  console.log('📄 Validating SUBMISSION.md...');
  
  if (!fs.existsSync(SUBMISSION_FILE)) {
    console.error('❌ SUBMISSION.md not found');
    return false;
  }
  
  const content = fs.readFileSync(SUBMISSION_FILE, 'utf8');
  
  // Check for required sections
  const requiredSections = [
    'Inspiration / Problem',
    'What It Does',
    'Tech Stack & Architecture',
    'Algorand Challenge Fit',
    'Screenshots'
  ];
  
  const sectionResults = {};
  requiredSections.forEach(section => {
    const hasSection = content.includes(section);
    sectionResults[section] = hasSection;
    console.log(`${hasSection ? '✅' : '❌'} ${section}`);
  });
  
  // Check for Mermaid diagrams
  const hasMermaid = content.includes('```mermaid');
  console.log(`${hasMermaid ? '✅' : '❌'} Mermaid diagrams`);
  
  return {
    exists: true,
    sections: sectionResults,
    hasMermaid,
    content
  };
}

/**
 * Validate screenshots exist in public directory
 */
function validateScreenshots() {
  console.log('\n📸 Validating screenshots...');
  
  const screenshotResults = {};
  REQUIRED_SCREENSHOTS.forEach(screenshot => {
    const screenshotPath = path.join(PUBLIC_DIR, screenshot);
    const exists = fs.existsSync(screenshotPath);
    screenshotResults[screenshot] = exists;
    console.log(`${exists ? '✅' : '❌'} ${screenshot}`);
  });
  
  return screenshotResults;
}

/**
 * Validate external links
 */
async function validateExternalLinks() {
  console.log('\n🔗 Validating external links...');
  
  const linkResults = {};
  
  for (const [name, url] of Object.entries(EXTERNAL_LINKS)) {
    console.log(`Checking ${name}...`);
    const result = await checkUrl(url);
    linkResults[name] = result;
    
    const status = result.accessible ? '✅' : '❌';
    const statusText = result.status === 'ERROR' ? result.error : result.status;
    console.log(`${status} ${name}: ${statusText}`);
  }
  
  return linkResults;
}

/**
 * Generate submission checklist
 */
function generateChecklist(submissionValidation, screenshotValidation, linkValidation) {
  console.log('\n📋 Generating submission checklist...');
  
  const checklist = { ...CHECKLIST_TEMPLATE };
  
  // Update sections
  checklist.sections.inspiration_problem = submissionValidation.sections['Inspiration / Problem'] || false;
  checklist.sections.what_it_does = submissionValidation.sections['What It Does'] || false;
  checklist.sections.tech_stack_architecture = submissionValidation.sections['Tech Stack & Architecture'] || false;
  checklist.sections.algorand_challenge_fit = submissionValidation.sections['Algorand Challenge Fit'] || false;
  checklist.sections.screenshots_embedded = submissionValidation.sections['Screenshots'] || false;
  
  // Update technical requirements
  checklist.technical_requirements.mermaid_diagrams = submissionValidation.hasMermaid;
  checklist.technical_requirements.submission_md_exists = submissionValidation.exists;
  checklist.technical_requirements.screenshots_exist = Object.values(screenshotValidation).every(exists => exists);
  checklist.technical_requirements.external_links_validated = Object.values(linkValidation).every(result => result.accessible);
  
  // Update Algorand integration (based on content analysis)
  const content = submissionValidation.content || '';
  checklist.algorand_integration.blockchain_features_described = content.includes('Asset Tokenization');
  checklist.algorand_integration.sustainability_impact = content.includes('Carbon-Negative');
  checklist.algorand_integration.financial_inclusion = content.includes('Fractional Ownership');
  checklist.algorand_integration.technical_innovation = content.includes('Smart Contracts');
  
  // Update deployment status
  checklist.deployment.live_demo_accessible = linkValidation['Live Demo']?.accessible || false;
  checklist.deployment.github_repo_public = linkValidation['GitHub Repository']?.accessible || false;
  checklist.deployment.video_demo_available = linkValidation['Video Demo']?.accessible || false;
  checklist.deployment.documentation_complete = linkValidation['Technical Documentation']?.accessible || false;
  
  // Calculate overall completion
  const allChecks = [
    ...Object.values(checklist.sections),
    ...Object.values(checklist.technical_requirements),
    ...Object.values(checklist.algorand_integration),
    ...Object.values(checklist.deployment)
  ];
  
  const completedChecks = allChecks.filter(check => check).length;
  const totalChecks = allChecks.length;
  const completionPercentage = Math.round((completedChecks / totalChecks) * 100);
  
  checklist.submission_complete = completionPercentage >= 90;
  checklist.completion_percentage = completionPercentage;
  checklist.completed_checks = completedChecks;
  checklist.total_checks = totalChecks;
  
  // Add metadata
  checklist.generated_at = new Date().toISOString();
  checklist.validation_results = {
    links: linkValidation,
    screenshots: screenshotValidation
  };
  
  return checklist;
}

/**
 * Main validation function
 */
async function validateSubmission() {
  console.log('🚀 AquaGuardian Submission Validator\n');
  console.log('==========================================\n');
  
  try {
    // Validate submission file
    const submissionValidation = validateSubmissionFile();
    
    // Validate screenshots
    const screenshotValidation = validateScreenshots();
    
    // Validate external links
    const linkValidation = await validateExternalLinks();
    
    // Generate checklist
    const checklist = generateChecklist(submissionValidation, screenshotValidation, linkValidation);
    
    // Save checklist
    fs.writeFileSync(CHECKLIST_FILE, JSON.stringify(checklist, null, 2));
    
    // Display summary
    console.log('\n📊 Validation Summary');
    console.log('==========================================');
    console.log(`Overall Completion: ${checklist.completion_percentage}%`);
    console.log(`Checks Passed: ${checklist.completed_checks}/${checklist.total_checks}`);
    console.log(`Submission Ready: ${checklist.submission_complete ? '✅ YES' : '❌ NO'}`);
    
    if (!checklist.submission_complete) {
      console.log('\n⚠️  Issues to resolve:');
      
      // List failed sections
      Object.entries(checklist.sections).forEach(([key, value]) => {
        if (!value) {
          console.log(`   - Missing section: ${key.replace(/_/g, ' ')}`);
        }
      });
      
      // List failed technical requirements
      Object.entries(checklist.technical_requirements).forEach(([key, value]) => {
        if (!value) {
          console.log(`   - Technical requirement: ${key.replace(/_/g, ' ')}`);
        }
      });
      
      // List failed links
      Object.entries(linkValidation).forEach(([name, result]) => {
        if (!result.accessible) {
          console.log(`   - Inaccessible link: ${name}`);
        }
      });
    }
    
    console.log(`\n📋 Checklist saved to: ${CHECKLIST_FILE}`);
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateSubmission();
}

module.exports = { validateSubmission, checkUrl };