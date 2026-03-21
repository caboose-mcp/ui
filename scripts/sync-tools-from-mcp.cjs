#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the tools JSON from stdin or file argument
const toolsJsonPath = process.argv[2] || '/tmp/tools.json';

if (!fs.existsSync(toolsJsonPath)) {
  console.error(`Error: tools.json not found at ${toolsJsonPath}`);
  process.exit(1);
}

const toolsData = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));

// Map Go category names to UI category IDs
const categoryMap = {
  'Agency': 'agency',
  'Audit': 'audit',
  'Auth': 'auth',
  'Bambu': 'printing',
  'Blender': 'blender',
  'Calendar': 'calendar',
  'Chezmoi': 'chezmoi',
  'Claude': 'claude',
  'CloudSync': 'cloudsync',
  'Database': 'database',
  'Discord': 'discord',
  'Docker': 'docker',
  'Environment': 'env',
  'Execute': 'system',
  'Files': 'claude',
  'Focus': 'focus',
  'Gamma': 'misc',
  'GitHub': 'github',
  'Greptile': 'misc',
  'Health': 'health',
  'Jokes': 'misc',
  'Learning': 'learning',
  'Mermaid': 'misc',
  'Notes': 'notes',
  'Persona': 'misc',
  'Repository': 'misc',
  'Sandbox': 'sandbox',
  'Secrets': 'misc',
  'Self-Improve': 'selfimprove',
  'Setup': 'misc',
  'Slack': 'slack',
  'Sources': 'sources',
  'Toolsmith': 'toolsmith',
};

// Convert extracted tools to UI format
function convertTool(tool) {
  return {
    name: tool.name,
    category: categoryMap[tool.category] || 'misc',
    description: tool.description || '',
    params: (tool.parameters || [])
      .filter(p => p.name && p.name !== p.description) // Skip malformed params
      .map(p => ({
        name: p.name,
        type: p.type || 'string',
        required: p.required || false,
        description: p.description || '',
      })),
    tier: tool.tier || 'hosted',
    tags: tool.tags || [],
    highlighted: false,
  };
}

// Generate TypeScript code for tools array
function generateToolsTS(tools) {
  const sortedTools = tools.sort((a, b) => a.name.localeCompare(b.name));

  let code = `export type ParamDef = {
  name: string
  type: 'string' | 'number' | 'boolean'
  required: boolean
  description: string
  default?: string
}

export type ToolDef = {
  name: string
  category: string
  description: string
  params: ParamDef[]
  example?: { input: Record<string, unknown>; output: string }
  sandboxable?: boolean
  tier: 'hosted' | 'local' | 'both'
  tags?: string[]
  highlighted?: boolean
}

export const CATEGORIES = [
  { id: 'all', label: 'All Tools', color: 'text-text-secondary' },
  { id: 'calendar', label: 'Calendar', color: 'text-blue-400' },
  { id: 'notes', label: 'Notes', color: 'text-yellow-400' },
  { id: 'focus', label: 'Focus', color: 'text-purple-400' },
  { id: 'learning', label: 'Learning', color: 'text-cyan-400' },
  { id: 'sources', label: 'Sources', color: 'text-amber-400' },
  { id: 'auth', label: 'Auth & RBAC', color: 'text-green-400' },
  { id: 'github', label: 'GitHub', color: 'text-slate-300' },
  { id: 'slack', label: 'Slack', color: 'text-green-300' },
  { id: 'discord', label: 'Discord', color: 'text-indigo-400' },
  { id: 'database', label: 'Database', color: 'text-orange-400' },
  { id: 'docker', label: 'Docker', color: 'text-blue-300' },
  { id: 'system', label: 'System', color: 'text-red-400' },
  { id: 'printing', label: '3D Printing', color: 'text-pink-400' },
  { id: 'selfimprove', label: 'Self-Improve', color: 'text-emerald-400' },
  { id: 'health', label: 'Health', color: 'text-teal-400' },
  { id: 'cloudsync', label: 'Cloud Sync', color: 'text-sky-400' },
  { id: 'chezmoi', label: 'Chezmoi', color: 'text-violet-400' },
  { id: 'toolsmith', label: 'Toolsmith', color: 'text-rose-400' },
  { id: 'sandbox', label: 'Sandbox', color: 'text-lime-400' },
  { id: 'audit', label: 'Audit', color: 'text-orange-300' },
  { id: 'env', label: 'Environment', color: 'text-lime-300' },
  { id: 'agency', label: 'Agency', color: 'text-fuchsia-400' },
  { id: 'claude', label: 'Claude Files', color: 'text-amber-300' },
  { id: 'blender', label: 'Blender', color: 'text-orange-500' },
  { id: 'misc', label: 'Misc', color: 'text-slate-400' },
]

export const TOOLS: ToolDef[] = [\n`;

  sortedTools.forEach((tool, index) => {
    code += `  {\n`;
    code += `    name: '${tool.name}',\n`;
    code += `    category: '${tool.category}',\n`;
    code += `    description: \`${tool.description.replace(/`/g, '\\`')}\`,\n`;
    code += `    params: [\n`;

    tool.params.forEach(param => {
      code += `      {\n`;
      code += `        name: '${param.name}',\n`;
      code += `        type: '${param.type}',\n`;
      code += `        required: ${param.required},\n`;
      code += `        description: \`${param.description.replace(/`/g, '\\`')}\`,\n`;
      code += `      },\n`;
    });

    code += `    ],\n`;
    code += `    tier: '${tool.tier}',\n`;
    code += `    tags: [${tool.tags.map(t => `'${t}'`).join(', ')}],\n`;
    code += `  },\n`;
  });

  code += `]\n`;
  return code;
}

// Main sync logic
function sync() {
  try {
    // Convert tools to UI format
    const uiTools = toolsData.map(convertTool);

    // Generate TypeScript code
    const toolsTs = generateToolsTS(uiTools);

    // Write to tools.ts
    const toolsPath = path.join(__dirname, '../src/data/tools.ts');
    fs.writeFileSync(toolsPath, toolsTs, 'utf8');
    console.log(`✅ Updated ${toolsPath} with ${uiTools.length} tools`);

    // Update README.md tool count
    const readmePath = path.join(__dirname, '../README.md');
    let readme = fs.readFileSync(readmePath, 'utf8');

    // Replace tool count in README
    const hostedCount = uiTools.filter(t => t.tier === 'hosted').length;
    const localCount = uiTools.filter(t => t.tier === 'local').length;
    const totalCount = uiTools.length;

    readme = readme.replace(/Browse \d+ MCP tools/, `Browse ${totalCount} MCP tools`);
    readme = readme.replace(/\*\*Features:\*\*.*?Browse \d+ MCP tools/, `**Features:** Browse ${totalCount} MCP tools`);

    fs.writeFileSync(readmePath, readme, 'utf8');
    console.log(`✅ Updated ${readmePath} with tool counts (${totalCount} total)`);

    // Check for changes
    try {
      const diff = execSync('git diff --stat', { encoding: 'utf8' });
      if (diff) {
        console.log('\n📊 Changes detected:');
        console.log(diff);
        process.exit(0);
      }
    } catch (e) {
      // Not a git repo, that's fine
    }

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

sync();
