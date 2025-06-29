import { Issue as LinearIssue, WorkflowState, User, Project } from '@linear/sdk';

export interface Issue {
  id: string;
  title: string;
  description: string;
  state: { id: string; name: string };
  assignee?: { id: string; name: string };
  project?: { id: string; name: string };
  comments: { id: string; body: string }[];
}

export function formatIssue(issue: Issue): string {
  const params = [
    `ID: ${issue.id}`,
    `State: ${issue.state.name}`,
    issue.assignee ? `Assignee: ${issue.assignee.name}` : '',
    issue.project ? `Project: ${issue.project.name}` : ''
  ].filter(Boolean).join('\n');

  const comments = issue.comments.map(c => `--------- ${c.id}\n${c.body}`).join('\n');
  
  return `===== ${issue.title} =====\n${params}\n\n${issue.description}\n\n${comments}`;
}

export function parseIssuesFromFile(content: string): Issue[] {
  const issues: Issue[] = [];
  // Split by header lines
  const regex = /^===== (.*?) =====$/gm;
  let match: RegExpExecArray | null;
  const indices: { index: number; title: string }[] = [];
  while ((match = regex.exec(content)) !== null) {
    indices.push({ index: match.index, title: match[1] });
  }
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].index;
    const end = i + 1 < indices.length ? indices[i + 1].index : content.length;
    const block = content.slice(start, end).trim();
    const lines = block.split('\n');
    const header = lines[0];
    const title = header.replace(/^===== /, '').replace(/ =====$/, '').trim();
    // Find params (until first empty line)
    let paramsEnd = 1;
    while (paramsEnd < lines.length && lines[paramsEnd].trim() !== '') {
      paramsEnd++;
    }
    const paramsLines = lines.slice(1, paramsEnd);
    const paramsObj: Record<string, string> = {};
    paramsLines.forEach(line => {
      const [key, value] = line.split(': ').map(s => s.trim());
      if (key && value) paramsObj[key] = value;
    });
    // Description is after paramsEnd+1, until the next empty line
    let descStart = paramsEnd + 1;
    let descEnd = descStart;
    while (descEnd < lines.length && lines[descEnd].trim() !== '') {
      descEnd++;
    }
    const description = lines.slice(descStart, descEnd).join('\n').trim();
    // Comments are after descEnd+1, joined by '--------- <comment-id>' or '---------\n' (empty id)
    const commentsBlock = lines.slice(descEnd + 1).join('\n');
    const comments = commentsBlock
      ? commentsBlock.split(/\n--------- ?/).filter(Boolean).map(commentBlock => {
          const lines = commentBlock.split('\n');
          let commentId = '';
          let body = '';
          if (lines.length > 1 && lines[0].trim() !== '') {
            commentId = lines[0].replace(/^[- ]+/, '').trim();
            body = lines.slice(1).join('\n').trim();
          } else {
            // No ID, treat the whole block as body
            body = lines.join('\n').trim();
          }
          return { id: commentId, body };
        })
      : [];
    issues.push({
      id: paramsObj.ID,
      title,
      description,
      state: { id: '', name: paramsObj.State },
      assignee: paramsObj.Assignee ? { id: '', name: paramsObj.Assignee } : undefined,
      project: paramsObj.Project ? { id: '', name: paramsObj.Project } : undefined,
      comments
    });
  }
  return issues;
}

export function formatIssuesToString(issues: Issue[]): string {
  return issues.map(issue => formatIssue(issue)).join('\n\n');
} 