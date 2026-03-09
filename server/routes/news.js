import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Data directory for news config & results
const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_PATH = path.join(DATA_DIR, 'news-config.json');
const RESULTS_PATH = path.join(DATA_DIR, 'news-results.json');
const SKILLS_DIR = path.join(__dirname, '..', '..', 'skills');

const DEFAULT_CONFIG = {
  research_domains: {
    'Large Language Models': {
      keywords: ['large language model', 'LLM', 'transformer', 'foundation model'],
      arxiv_categories: ['cs.AI', 'cs.LG', 'cs.CL'],
      priority: 5,
    },
    'Multimodal': {
      keywords: ['vision-language', 'multimodal', 'image-text', 'visual'],
      arxiv_categories: ['cs.CV', 'cs.MM', 'cs.CL'],
      priority: 4,
    },
    'AI Agents': {
      keywords: ['agent', 'multi-agent', 'orchestration', 'autonomous', 'planning'],
      arxiv_categories: ['cs.AI', 'cs.MA', 'cs.RO'],
      priority: 4,
    },
  },
  top_n: 10,
  max_results: 200,
  categories: 'cs.AI,cs.LG,cs.CL,cs.CV,cs.MM,cs.MA,cs.RO',
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// GET /api/news/config — read research interests config
router.get('/config', async (req, res) => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CONFIG_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Return default config if none saved yet
      res.json(DEFAULT_CONFIG);
    } else {
      res.status(500).json({ error: 'Failed to read config', details: err.message });
    }
  }
});

// PUT /api/news/config — save research interests config
router.put('/config', async (req, res) => {
  try {
    await ensureDataDir();
    const config = req.body;
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save config', details: err.message });
  }
});

// POST /api/news/search — execute paper search
router.post('/search', async (req, res) => {
  try {
    await ensureDataDir();

    // Read current config
    let config;
    try {
      config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
    } catch {
      config = DEFAULT_CONFIG;
    }

    // Write a temporary YAML config for the Python script
    const yamlConfig = buildYamlConfig(config);
    const tmpConfigPath = path.join(DATA_DIR, 'research_interests.yaml');
    await fs.writeFile(tmpConfigPath, yamlConfig, 'utf8');

    const scriptPath = path.join(SKILLS_DIR, 'research-news', 'scripts', 'search_arxiv.py');

    // Check if script exists
    try {
      await fs.access(scriptPath);
    } catch {
      return res.status(404).json({ error: 'research-news skill not installed. Search script not found.' });
    }

    const topN = config.top_n || 10;
    const maxResults = config.max_results || 200;
    const categories = config.categories || 'cs.AI,cs.LG,cs.CL,cs.CV,cs.MM,cs.MA,cs.RO';

    const args = [
      scriptPath,
      '--config', tmpConfigPath,
      '--output', RESULTS_PATH,
      '--max-results', String(maxResults),
      '--top-n', String(topN),
      '--categories', categories,
    ];

    const child = spawn('python3', args, {
      cwd: path.join(SKILLS_DIR, 'research-news'),
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', async (code) => {
      if (code !== 0) {
        console.error('[news] search_arxiv.py failed:', stderr);
        return res.status(500).json({
          error: 'Paper search failed',
          details: stderr || stdout,
          exitCode: code,
        });
      }

      // Read results
      try {
        const results = JSON.parse(await fs.readFile(RESULTS_PATH, 'utf8'));
        res.json(results);
      } catch (readErr) {
        res.status(500).json({ error: 'Failed to read search results', details: readErr.message });
      }
    });

    child.on('error', (err) => {
      console.error('[news] Failed to spawn search script:', err);
      res.status(500).json({ error: 'Failed to execute search script', details: err.message });
    });
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

// GET /api/news/results — get cached results
router.get('/results', async (req, res) => {
  try {
    const data = await fs.readFile(RESULTS_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.json({ top_papers: [], total_found: 0, total_filtered: 0 });
    } else {
      res.status(500).json({ error: 'Failed to read results', details: err.message });
    }
  }
});

function buildYamlConfig(config) {
  let yaml = '# Auto-generated from VibeLab News Dashboard config\n\n';
  yaml += 'research_domains:\n';

  const domains = config.research_domains || {};
  for (const [name, domain] of Object.entries(domains)) {
    yaml += `  "${name}":\n`;
    yaml += `    keywords:\n`;
    for (const kw of domain.keywords || []) {
      yaml += `      - "${kw}"\n`;
    }
    if (domain.arxiv_categories?.length) {
      yaml += `    arxiv_categories:\n`;
      for (const cat of domain.arxiv_categories) {
        yaml += `      - "${cat}"\n`;
      }
    }
    if (domain.priority) {
      yaml += `    priority: ${domain.priority}\n`;
    }
  }

  return yaml;
}

export default router;
