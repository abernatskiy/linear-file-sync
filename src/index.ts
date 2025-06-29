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
  private updateInterval: NodeJS.Timeout | null = null;
  private isLocked = false;

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

  private async readIssuesFromFile(): Promise<Issue[]> {
    try {
      const content = await fs.promises.readFile(this.config.issuesFilePath, 'utf8');
      return parseIssuesFromFile(content);
    } catch (error) {
      console.error('Error reading issues file:', error);
      return [];
    }
  }

  private async checkLockFile(): Promise<boolean> {
    try {
      await fs.promises.access(this.config.issuesFilePath + '.lock');
      return true;
    } catch {
      return false;
    }
  }

  private async performUpdate(): Promise<void> {
    try {
      console.log('Fetching issues from Linear...');
      const issues = await this.fetchIssues();
      await this.writeIssuesToFile(issues);
      console.log(`Updated ${issues.length} issues`);
    } catch (error) {
      console.error('Error during update:', error);
    }
  }

  private async syncFileToLinear(): Promise<void> {
    try {
      console.log('Syncing file changes to Linear...');
      
      // 1. Read the contents of issues.txt and parse it
      const fileIssues = await this.readIssuesFromFile();
      
      // 2. Fetch a fresh list of issues from Linear
      const linearIssues = await this.fetchIssues();
      
      // Create maps for easier lookup
      const fileIssuesMap = new Map(fileIssues.map(i => [i.id, i]));
      const linearIssuesMap = new Map(linearIssues.map(i => [i.id, i]));

      // 3. Compare and update
      
      // Handle new issues (no ID assigned)
      const newIssues = fileIssues.filter(issue => !issue.id || issue.id === '');
      if (newIssues.length > 0) {
        console.log(`Creating ${newIssues.length} new issues...`);
        for (const issue of newIssues) {
          await this.api.createIssue(issue);
        }
      }

      // Handle existing issues
      for (const [id, fileIssue] of fileIssuesMap) {
        if (!id || id === '') continue; // Skip new issues
        
        const linearIssue = linearIssuesMap.get(id);
        if (!linearIssue) continue; // Issue doesn't exist in Linear anymore

        // Check for description changes
        if (fileIssue.description !== linearIssue.description) {
          console.log(`Updating description for issue: ${fileIssue.title}`);
          await this.api.updateIssue(id, fileIssue);
        }

        // Check for comment changes
        if (!this.areCommentsEqual(fileIssue.comments, linearIssue.comments)) {
          console.log(`Updating comments for issue: ${fileIssue.title}`);
          await this.api.updateIssueComments(id, fileIssue.comments);
        }
      }

      console.log('Sync completed');
    } catch (error) {
      console.error('Error during sync:', error);
    }
  }

  private areCommentsEqual(a: Array<{ id: string; body: string }>, b: Array<{ id: string; body: string }>): boolean {
    if (a.length !== b.length) return false;
    return a.every((comment, i) => comment.body === b[i].body);
  }

  private async handleLockFileChange(): Promise<void> {
    const lockExists = await this.checkLockFile();
    
    if (lockExists && !this.isLocked) {
      // Lock file appeared - stop updates
      console.log('Lock file detected, stopping updates...');
      this.isLocked = true;
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    } else if (!lockExists && this.isLocked) {
      // Lock file disappeared - sync changes and resume updates
      console.log('Lock file removed, syncing changes...');
      this.isLocked = false;
      
      // Sync file changes to Linear
      await this.syncFileToLinear();
      
      // Wait 10 seconds before resuming updates
      console.log('Waiting 10 seconds before resuming updates...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Resume updates
      await this.performUpdate(); // Immediate update
      this.startUpdateCycle();
    }
  }

  private startUpdateCycle(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.updateInterval = setInterval(async () => {
      if (!this.isLocked) {
        await this.performUpdate();
      }
    }, 2 * 60 * 1000); // 2 minutes
  }

  public async start(): Promise<void> {
    try {
      // Initial update
      await this.performUpdate();

      // Start the update cycle
      this.startUpdateCycle();

      // Watch for lock file changes
      const lockFilePath = this.config.issuesFilePath + '.lock';
      const watcher = chokidar.watch(lockFilePath, {
        persistent: true,
        ignoreInitial: true
      });

      watcher.on('add', async () => {
        await this.handleLockFileChange();
      });

      watcher.on('unlink', async () => {
        await this.handleLockFileChange();
      });

      console.log('Application started. Updates every 2 minutes. Watching for lock file...');
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