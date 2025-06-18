# Linear File Sync

A TypeScript application that synchronizes Linear.app issues with a text file. It allows you to manage your Linear issues through simple text file edits.

## Features

- Fetches all issues from your default Linear team
- Stores issues in a text file with a clear format
- Monitors the file for changes and syncs them back to Linear
- Validates changes to prevent inconsistencies
- Supports adding comments, updating issue details, and creating new issues

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the application:
   - Copy `config.json` and fill in your Linear API key and default team ID
   - You can get your API key from Linear's settings
   - The team ID can be found in the URL when viewing your team in Linear

3. Build the application:
   ```bash
   npm run build
   ```

4. Run the application:
   ```bash
   npm start
   ```

## File Format

The issues are stored in a text file with the following format:

```
===== Issue Title =====
ID: issue-id
State: state-name
Assignee: assignee-name
Project: project-name

Description text here

---------
Comment 1
---------
Comment 2
```

## Usage

1. The application will create and populate the issues file on first run
2. You can edit the file to:
   - Add comments by adding new sections after the last comment
   - Update issue details by modifying the parameters section
   - Create new issues by adding new sections with the same format
3. The application will validate your changes and sync them to Linear
4. If there are any inconsistencies, the application will show the differences and exit

## Development

- Source code is in the `src` directory
- Built files will be in the `dist` directory
- Use `npm run build` to compile TypeScript to JavaScript
- Use `npm start` to run the application 