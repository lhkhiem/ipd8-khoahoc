#!/usr/bin/env ts-node
/**
 * Security Check Script
 * 
 * Chạy script này để kiểm tra các vấn đề bảo mật phổ biến:
 * - Exposed secrets
 * - Vulnerable dependencies
 * - Missing security configurations
 * - Security best practices
 * 
 * Usage: npm run security:check
 *        hoặc: ts-node scripts/security-check.ts
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface SecurityIssue {
  level: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  file?: string;
  line?: number;
  fix?: string;
}

const issues: SecurityIssue[] = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
};

function log(level: string, message: string) {
  const color = level === 'critical' ? colors.red : 
                level === 'high' ? colors.yellow : 
                level === 'medium' ? colors.blue : colors.green;
  console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${message}`);
}

// Check 1: Environment variables
function checkEnvironmentVariables() {
  log('info', 'Checking environment variables...');
  
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV',
  ];
  
  const missing: string[] = [];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    issues.push({
      level: 'critical',
      category: 'Environment Variables',
      message: `Missing required environment variables: ${missing.join(', ')}`,
      fix: 'Add missing variables to .env file',
    });
  }
  
  // Check JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    issues.push({
      level: 'critical',
      category: 'Environment Variables',
      message: 'JWT_SECRET must be at least 32 characters long',
      fix: 'Generate a stronger JWT_SECRET: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    });
  }
}

// Check 2: Exposed secrets in code
function checkExposedSecrets() {
  log('info', 'Checking for exposed secrets in code...');
  
  try {
    const srcPath = join(process.cwd(), 'src');
    const result = execSync(
      `grep -r "password\\|secret\\|key\\|token" --include="*.ts" --include="*.js" ${srcPath} | grep -v "process.env" | grep -v "password_hash" | grep -v "//" | head -20`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    if (result.trim()) {
      const lines = result.trim().split('\n').slice(0, 10);
      issues.push({
        level: 'high',
        category: 'Exposed Secrets',
        message: `Found potential hardcoded secrets in code (${lines.length} instances)`,
        fix: 'Review and move all secrets to environment variables',
      });
    }
  } catch (error) {
    // No matches found, which is good
  }
}

// Check 3: Dangerous functions
function checkDangerousFunctions() {
  log('info', 'Checking for dangerous functions...');
  
  try {
    const srcPath = join(process.cwd(), 'src');
    const result = execSync(
      `grep -r "eval\\|Function\\|innerHTML\\|dangerouslySetInnerHTML" --include="*.ts" --include="*.tsx" ${srcPath} | head -20`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    if (result.trim()) {
      const lines = result.trim().split('\n').slice(0, 10);
      issues.push({
        level: 'high',
        category: 'Dangerous Functions',
        message: `Found dangerous functions: eval, Function, innerHTML (${lines.length} instances)`,
        fix: 'Review and replace with safer alternatives',
      });
    }
  } catch (error) {
    // No matches found, which is good
  }
}

// Check 4: SQL injection risks
function checkSQLInjectionRisks() {
  log('info', 'Checking for SQL injection risks...');
  
  try {
    const srcPath = join(process.cwd(), 'src');
    const result = execSync(
      `grep -r "sequelize.query\\|pool.query" --include="*.ts" ${srcPath} | grep -v "replacements" | grep -v "bind" | head -20`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    if (result.trim()) {
      const lines = result.trim().split('\n').slice(0, 10);
      issues.push({
        level: 'high',
        category: 'SQL Injection',
        message: `Found potential SQL injection risks (${lines.length} instances)`,
        fix: 'Use parameterized queries with replacements or bind parameters',
      });
    }
  } catch (error) {
    // No matches found, which is good
  }
}

// Check 5: .env file in git
function checkEnvInGit() {
  log('info', 'Checking if .env files are in git...');
  
  try {
    const result = execSync(
      'git ls-files | grep -E "\\.env$|\\.env\\.local$|\\.env\\.production$"',
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    if (result.trim()) {
      const files = result.trim().split('\n');
      issues.push({
        level: 'critical',
        category: 'Git Security',
        message: `.env files found in git: ${files.join(', ')}`,
        fix: 'Remove .env files from git: git rm --cached .env && echo ".env" >> .gitignore',
      });
    }
  } catch (error) {
    // No matches found, which is good
  }
}

// Check 6: Dependencies vulnerabilities
async function checkDependencies() {
  log('info', 'Checking for vulnerable dependencies...');
  
  try {
    const result = execSync('npm audit --json', { encoding: 'utf-8', stdio: 'pipe' });
    const audit = JSON.parse(result);
    
    if (audit.metadata?.vulnerabilities) {
      const vulns = audit.metadata.vulnerabilities;
      const critical = vulns.critical || 0;
      const high = vulns.high || 0;
      const moderate = vulns.moderate || 0;
      
      if (critical > 0) {
        issues.push({
          level: 'critical',
          category: 'Dependencies',
          message: `Found ${critical} critical vulnerabilities in dependencies`,
          fix: 'Run: npm audit fix',
        });
      }
      
      if (high > 0) {
        issues.push({
          level: 'high',
          category: 'Dependencies',
          message: `Found ${high} high vulnerabilities in dependencies`,
          fix: 'Run: npm audit fix',
        });
      }
      
      if (moderate > 0) {
        issues.push({
          level: 'medium',
          category: 'Dependencies',
          message: `Found ${moderate} moderate vulnerabilities in dependencies`,
          fix: 'Run: npm audit fix',
        });
      }
    }
  } catch (error: any) {
    if (error.message && !error.message.includes('Found 0 vulnerabilities')) {
      log('warning', 'Could not run npm audit. Make sure npm is available.');
    }
  }
}

// Check 7: Helmet.js
function checkHelmet() {
  log('info', 'Checking for Helmet.js...');
  
  const packageJsonPath = join(process.cwd(), 'package.json');
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (!deps.helmet) {
      issues.push({
        level: 'high',
        category: 'Security Headers',
        message: 'Helmet.js is not installed',
        fix: 'Install: npm install helmet && configure in app.ts',
      });
    }
  }
}

// Check 8: CSRF protection
function checkCSRF() {
  log('info', 'Checking for CSRF protection...');
  
  const appTsPath = join(process.cwd(), 'src', 'app.ts');
  if (existsSync(appTsPath)) {
    const appTs = readFileSync(appTsPath, 'utf-8');
    
    if (!appTs.includes('csrf') && !appTs.includes('csurf')) {
      issues.push({
        level: 'critical',
        category: 'CSRF Protection',
        message: 'CSRF protection is not implemented',
        fix: 'Install and configure: npm install csurf && add CSRF middleware',
      });
    }
  }
}

// Check 9: Rate limiting
function checkRateLimiting() {
  log('info', 'Checking for rate limiting...');
  
  const appTsPath = join(process.cwd(), 'src', 'app.ts');
  if (existsSync(appTsPath)) {
    const appTs = readFileSync(appTsPath, 'utf-8');
    
    if (!appTs.includes('rateLimit') && !appTs.includes('rate-limit')) {
      issues.push({
        level: 'high',
        category: 'Rate Limiting',
        message: 'Rate limiting may not be properly configured',
        fix: 'Review rate limiting implementation in app.ts',
      });
    }
  }
}

// Main function
async function main() {
  console.log('\n🔒 Security Check Script\n');
  console.log('='.repeat(50));
  
  // Run all checks
  checkEnvironmentVariables();
  checkExposedSecrets();
  checkDangerousFunctions();
  checkSQLInjectionRisks();
  checkEnvInGit();
  await checkDependencies();
  checkHelmet();
  checkCSRF();
  checkRateLimiting();
  
  // Print results
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Security Check Results:\n');
  
  if (issues.length === 0) {
    console.log(`${colors.green}✅ No security issues found!${colors.reset}\n`);
    process.exit(0);
  }
  
  // Group by level
  const critical = issues.filter(i => i.level === 'critical');
  const high = issues.filter(i => i.level === 'high');
  const medium = issues.filter(i => i.level === 'medium');
  const low = issues.filter(i => i.level === 'low');
  
  console.log(`Found ${issues.length} security issues:\n`);
  console.log(`${colors.red}🔴 Critical: ${critical.length}${colors.reset}`);
  console.log(`${colors.yellow}🟡 High: ${high.length}${colors.reset}`);
  console.log(`${colors.blue}🔵 Medium: ${medium.length}${colors.reset}`);
  console.log(`${colors.green}🟢 Low: ${low.length}${colors.reset}\n`);
  
  // Print issues
  if (critical.length > 0) {
    console.log(`${colors.red}🔴 CRITICAL ISSUES:${colors.reset}\n`);
    critical.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.category}] ${issue.message}`);
      if (issue.fix) {
        console.log(`   Fix: ${issue.fix}`);
      }
      console.log('');
    });
  }
  
  if (high.length > 0) {
    console.log(`${colors.yellow}🟡 HIGH PRIORITY ISSUES:${colors.reset}\n`);
    high.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.category}] ${issue.message}`);
      if (issue.fix) {
        console.log(`   Fix: ${issue.fix}`);
      }
      console.log('');
    });
  }
  
  if (medium.length > 0) {
    console.log(`${colors.blue}🔵 MEDIUM PRIORITY ISSUES:${colors.reset}\n`);
    medium.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.category}] ${issue.message}`);
      if (issue.fix) {
        console.log(`   Fix: ${issue.fix}`);
      }
      console.log('');
    });
  }
  
  // Exit with error code if critical or high issues found
  if (critical.length > 0 || high.length > 0) {
    console.log(`${colors.red}❌ Security check failed. Please fix critical and high priority issues before deploying.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ No critical or high priority issues found.${colors.reset}\n`);
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error running security check:', error);
    process.exit(1);
  });
}

export { main as securityCheck };











