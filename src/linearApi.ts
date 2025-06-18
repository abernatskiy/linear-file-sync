import { LinearClient } from '@linear/sdk';
import { Issue } from './issueFormat';
import { hardcodedStates, hardcodedTeams, hardcodedUsers } from './hardcodedUuids';

const gql = String.raw;

interface TeamIssuesResponse {
  team: {
    issues: {
      nodes: Array<{
        id: string;
        title: string;
        description: string | null;
        state: {
          id: string;
          name: string;
        } | null;
        assignee: {
          id: string;
          name: string;
        } | null;
        project: {
          id: string;
          name: string;
        } | null;
        comments: {
          nodes: Array<{
            id: string;
            body: string;
          }>;
        };
      }>;
    };
  };
}

interface TeamIssuesVariables extends Record<string, unknown> {
  teamId: string;
  first: number;
}

const teamIssuesQuery = gql`
  query teamIssues($teamId: String!, $first: Int!) {
    team(id: $teamId) {
      issues(
        first: $first, 
        orderBy: createdAt,
        filter: {
          state: { name: { nin: ["Done", "Triage"] } }
        }
      ) {
        nodes {
          id
          title
          description
          state {
            id
            name
          }
          assignee {
            id
            name
          }
          project {
            id
            name
          }
          comments {
            nodes {
              id
              body
            }
          }
        }
      }
    }
  }
`;

export class LinearApi {
  private client: LinearClient;

  constructor(apiKey: string) {
    this.client = new LinearClient({ apiKey });
  }

  async fetchTeamIssues(teamId: string): Promise<Issue[]> {
    const { data } = await this.client.client.rawRequest<TeamIssuesResponse, TeamIssuesVariables>(teamIssuesQuery, {
      teamId,
      first: 100,
    });

    if (!data?.team?.issues?.nodes) {
      throw new Error('No data returned from Linear');
    }

    return data.team.issues.nodes.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description || '',
      state: { 
        id: issue.state?.id || '', 
        name: issue.state?.name || 'Unknown' 
      },
      assignee: issue.assignee ? { 
        id: issue.assignee.id, 
        name: issue.assignee.name 
      } : undefined,
      project: issue.project ? { 
        id: issue.project.id, 
        name: issue.project.name 
      } : undefined,
      comments: issue.comments.nodes.map(c => ({ 
        id: c.id, 
        body: c.body 
      }))
    }));
  }

  async createIssue(issue: Issue): Promise<void> {
    const createIssueMutation = gql`
      mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
          }
        }
      }
    `;

    // Get team ID from hardcoded values
    const teamId = hardcodedTeams.get('ENG');
    if (!teamId) {
      throw new Error('ENG team ID not found in hardcoded values');
    }

    // Get state ID from hardcoded values
    const stateId = hardcodedStates.get('New');
    if (!stateId) {
      throw new Error('New state ID not found in hardcoded values');
    }

    // Get assignee ID from hardcoded values if assignee is specified
    let assigneeId: string | undefined;
    if (issue.assignee?.name) {
      assigneeId = hardcodedUsers.get(issue.assignee.name);
      if (!assigneeId) {
        throw new Error(`Assignee ID not found for name: ${issue.assignee.name}`);
      }
    }

    await this.client.client.rawRequest(createIssueMutation, {
      input: {
        title: issue.title,
        description: issue.description,
        stateId,
        teamId,
        assigneeId,
        projectId: issue.project?.id,
      }
    });
  }

  async updateIssue(issueId: string, issue: Issue): Promise<void> {
    const updateIssueMutation = gql`
      mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
          }
        }
      }
    `;

    // Get state ID from hardcoded values
    const stateId = hardcodedStates.get(issue.state.name);
    if (!stateId) {
      throw new Error(`State ID not found for name: ${issue.state.name}`);
    }

    // Get assignee ID from hardcoded values if assignee is specified
    let assigneeId: string | undefined;
    if (issue.assignee?.name) {
      assigneeId = hardcodedUsers.get(issue.assignee.name);
      if (!assigneeId) {
        throw new Error(`Assignee ID not found for name: ${issue.assignee.name}`);
      }
    }

    await this.client.client.rawRequest(updateIssueMutation, {
      id: issueId,
      input: {
        title: issue.title,
        description: issue.description,
        stateId,
        assigneeId,
        projectId: issue.project?.id,
      }
    });
  }
} 