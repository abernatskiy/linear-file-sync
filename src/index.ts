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
      // Lock file disappeared - resume updates
      console.log('Lock file removed, resuming updates...');
      this.isLocked = false;
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

      console.log('Application started. Updates every 5 minutes. Watching for lock file...');
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