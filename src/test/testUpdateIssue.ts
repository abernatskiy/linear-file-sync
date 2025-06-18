import { Config, loadConfig } from '../config';
import { LinearApi } from '../linearApi';
import { Issue } from '../issueFormat';

async function testUpdateIssue() {
  try {
    const config = loadConfig();
    if (!config.defaultTeamId) {
      throw new Error('Default team ID is required');
    }
    const api = new LinearApi(config.apiKey);

    // First fetch issues to get a valid issue
    const issues = await api.fetchTeamIssues(config.defaultTeamId);
    if (issues.length === 0) {
      throw new Error('No issues found to update');
    }

    const issueToUpdate = issues[0];
    console.log('Updating issue:', issueToUpdate.title);

    const updatedIssue: Issue = {
      ...issueToUpdate,
      state: {
        id: '', // This will be replaced with the correct UUID
        name: 'Active' // Change to a different state
      }
    };

    await api.updateIssue(issueToUpdate.id, updatedIssue);
    console.log('Issue updated successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testUpdateIssue().catch(console.error); 