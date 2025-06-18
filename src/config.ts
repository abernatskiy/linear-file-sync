export interface Config {
  apiKey: string;
  issuesFilePath: string;
  defaultTeamId?: string;
}

export function loadConfig(): Config {
  try {
    const configPath = process.env.LINEAR_CONFIG_PATH || '/tmp/config-tst.json';
    const config = require(configPath);
    
    if (!config.apiKey) {
      throw new Error('Linear API key is required in config');
    }
    if (!config.issuesFilePath) {
      throw new Error('Issues file path is required in config');
    }
    
    return config;
  } catch (error) {
    console.error('Failed to load config:', error);
    process.exit(1);
  }
} 