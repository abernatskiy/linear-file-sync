import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import * as diff from 'diff';
import { Config, loadConfig } from './config';
import { Issue, formatIssuesToString, parseIssuesFromFile } from './issueFormat';
import { LinearApi } from './linearApi';

class LinearFileSync {
  private api: LinearApi;
  private config: Config;
  private issues: Map<string, Issue> = new Map();
  private isInitialSync = true;

  constructor(config: Config) {
    this.config = config;
    this.api = new LinearApi(config.apiKey);
  }

  private async fetchIssues(): Promise<Issue[]> {
    const teamId = this.config.defaultTeamId;
    if (!teamId) {
      throw new Error('Default team ID is required');
    }
    return this.api.fetchTeamIssues(teamId);
  }

  private async writeIssuesToFile(issues: Issue[]): Promise<void> {
    const content = formatIssuesToString(issues);
    await fs.promises.writeFile(this.config.issuesFilePath, content, 'utf8');
  }

  private async readIssuesFromFile(): Promise<string> {
    try {
      return await fs.promises.readFile(this.config.issuesFilePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return '';
      }
      throw error;
    }
  }

  private async handleFileChange(): Promise<void> {
    const fileContent = await this.readIssuesFromFile();
    const fileIssues = parseIssuesFromFile(fileContent);
    const apiIssues = await this.fetchIssues();

    // Create maps for easier lookup
    const fileIssuesMap = new Map(fileIssues.map(i => [i.id, i]));
    const apiIssuesMap = new Map(apiIssues.map(i => [i.id, i]));

    // Find issues that exist in file but not in API (new issues)
    const newIssues = fileIssues.filter(issue => !apiIssuesMap.has(issue.id));
    if (newIssues.length > 0) {
      console.log('Creating new issues:', newIssues.map(i => i.title).join(', '));
      for (const issue of newIssues) {
        await this.api.createIssue(issue);
      }
    }

    // Find and update modified issues
    for (const [id, fileIssue] of fileIssuesMap) {
      const apiIssue = apiIssuesMap.get(id);
      if (apiIssue && !this.areIssuesEqual(fileIssue, apiIssue)) {
        console.log('Updating issue:', fileIssue.title);
        await this.api.updateIssue(id, fileIssue);
      }
    }
  }

  private areIssuesEqual(a: Issue, b: Issue): boolean {
    return a.title === b.title &&
           a.description === b.description &&
           a.state.id === b.state.id &&
           (a.assignee?.id === b.assignee?.id) &&
           (a.project?.id === b.project?.id) &&
           this.areCommentsEqual(a.comments, b.comments);
  }

  private areCommentsEqual(a: Array<{ id: string; body: string }>, b: Array<{ id: string; body: string }>): boolean {
    if (a.length !== b.length) return false;
    return a.every((comment, i) => comment.id === b[i].id && comment.body === b[i].body);
  }

  public async start(): Promise<void> {
    try {
      // Check if file exists
      const fileExists = await fs.promises.access(this.config.issuesFilePath)
        .then(() => true)
        .catch(() => false);

      // Fetch current issues from API
      const apiIssues = await this.fetchIssues();

      if (fileExists) {
        // File exists, compare with API state
        const fileContent = await this.readIssuesFromFile();
        const fileIssues = parseIssuesFromFile(fileContent);

        const diffResult = diff.diffArrays(
          fileIssues.map(i => formatIssuesToString([i])),
          apiIssues.map(i => formatIssuesToString([i]))
        );

        if (diffResult.length > 1) {
          console.error('File content differs from Linear API state:');
          diffResult.forEach((part: diff.ArrayChange<string>) => {
            if (part.added) {
              console.error('Added:', part.value);
            } else if (part.removed) {
              console.error('Removed:', part.value);
            }
          });
          process.exit(1);
        }
      } else {
        // File doesn't exist, create it with API issues
        await this.writeIssuesToFile(apiIssues);
      }

      // Start watching for changes
      const watcher = chokidar.watch(this.config.issuesFilePath, {
        persistent: true,
        ignoreInitial: true
      });

      watcher.on('change', async () => {
        await this.handleFileChange();
      });

      console.log('Watching for file changes...');
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  }
}

// Start the application
const config = loadConfig();
const app = new LinearFileSync(config);
app.start().catch(console.error); 