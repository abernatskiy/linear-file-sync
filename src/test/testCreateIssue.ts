import { Config, loadConfig } from '../config';
import { LinearApi } from '../linearApi';
import { Issue } from '../issueFormat';

async function testCreateIssue() {
  try {
    const config = loadConfig();
    if (!config.defaultTeamId) {
      throw new Error('Default team ID is required');
    }
    const api = new LinearApi(config.apiKey);

    const testIssue: Issue = {
      id: '', // This will be assigned by Linear
      title: 'Test Issue',
      description: 'This is a test issue created by the test script',
      state: {
        id: '', // This will be replaced with the correct UUID
        name: 'New'
      },
      comments: []
    };

    console.log('Creating test issue...');
    await api.createIssue(testIssue);
    console.log('Test issue created successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testCreateIssue().catch(console.error); 