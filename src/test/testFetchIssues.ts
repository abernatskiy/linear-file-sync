import { LinearApi } from '../linearApi';
import { formatIssuesToString } from '../issueFormat';
import { loadConfig } from '../config';

async function main() {
  try {
    const config = loadConfig();
    if (!config.defaultTeamId) {
      console.error('Default team ID is required in config');
      process.exit(1);
    }

    const api = new LinearApi(config.apiKey);
    console.log('Fetching issues from Linear...');
    const issues = await api.fetchTeamIssues(config.defaultTeamId);
    
    console.log('\nFetched issues:');
    console.log(formatIssuesToString(issues));
    
    console.log(`\nTotal issues: ${issues.length}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 