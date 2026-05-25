export interface RotationStep {
  order: number;
  description: string;
  verified: boolean;
  notes: string;
}

export interface RotationChecklistData {
  secretType: string;
  title: string;
  steps: RotationStep[];
}

const checklists: Record<string, RotationChecklistData> = {
  'aws-access-key': {
    secretType: 'aws-access-key',
    title: 'AWS Access Key Rotation',
    steps: [
      { order: 1, description: 'Log in to AWS IAM Console', verified: false, notes: '' },
      { order: 2, description: 'Identify the affected IAM user', verified: false, notes: '' },
      { order: 3, description: 'Create a new access key for the user', verified: false, notes: '' },
      { order: 4, description: 'Update the application/configuration with the new key', verified: false, notes: '' },
      { order: 5, description: 'Verify the application works with the new key', verified: false, notes: '' },
      { order: 6, description: 'Deactivate the old access key', verified: false, notes: '' },
      { order: 7, description: 'Delete the old access key after verification period', verified: false, notes: '' },
      { order: 8, description: 'Remove the old key from git history using git filter-repo', verified: false, notes: '' },
    ],
  },
  'github-pat': {
    secretType: 'github-pat',
    title: 'GitHub Personal Access Token Rotation',
    steps: [
      { order: 1, description: 'Go to GitHub Settings > Developer settings > Personal access tokens', verified: false, notes: '' },
      { order: 2, description: 'Delete the compromised token', verified: false, notes: '' },
      { order: 3, description: 'Generate a new token with the minimal required scopes', verified: false, notes: '' },
      { order: 4, description: 'Update the application/configuration with the new token', verified: false, notes: '' },
      { order: 5, description: 'Verify the application works with the new token', verified: false, notes: '' },
      { order: 6, description: 'Remove the old token from git history', verified: false, notes: '' },
    ],
  },
  'stripe-key': {
    secretType: 'stripe-key',
    title: 'Stripe Secret Key Rotation',
    steps: [
      { order: 1, description: 'Log in to the Stripe Dashboard', verified: false, notes: '' },
      { order: 2, description: 'Go to Developers > API Keys', verified: false, notes: '' },
      { order: 3, description: 'Roll the compromised secret key', verified: false, notes: '' },
      { order: 4, description: 'Update the application with the new key', verified: false, notes: '' },
      { order: 5, description: 'Verify payment operations work correctly', verified: false, notes: '' },
      { order: 6, description: 'Remove the old key from git history', verified: false, notes: '' },
    ],
  },
  'openai-key': {
    secretType: 'openai-key',
    title: 'OpenAI API Key Rotation',
    steps: [
      { order: 1, description: 'Log in to the OpenAI Platform', verified: false, notes: '' },
      { order: 2, description: 'Go to API Keys section', verified: false, notes: '' },
      { order: 3, description: 'Revoke the compromised key', verified: false, notes: '' },
      { order: 4, description: 'Create a new API key', verified: false, notes: '' },
      { order: 5, description: 'Update the application with the new key', verified: false, notes: '' },
      { order: 6, description: 'Verify API calls succeed with the new key', verified: false, notes: '' },
      { order: 7, description: 'Remove the old key from git history', verified: false, notes: '' },
    ],
  },
  'generic-api-key': {
    secretType: 'generic-api-key',
    title: 'Generic API Key Rotation',
    steps: [
      { order: 1, description: 'Identify the service provider for the API key', verified: false, notes: '' },
      { order: 2, description: 'Log in to the service provider dashboard', verified: false, notes: '' },
      { order: 3, description: 'Generate a new API key', verified: false, notes: '' },
      { order: 4, description: 'Update the application configuration with the new key', verified: false, notes: '' },
      { order: 5, description: 'Verify the application works with the new key', verified: false, notes: '' },
      { order: 6, description: 'Revoke/delete the old API key', verified: false, notes: '' },
      { order: 7, description: 'Remove the old key from git history', verified: false, notes: '' },
    ],
  },
  'private-key': {
    secretType: 'private-key',
    title: 'Private Key Rotation',
    steps: [
      { order: 1, description: 'Generate a new key pair (ssh-keygen or openssl)', verified: false, notes: '' },
      { order: 2, description: 'Deploy the new public key to all servers/services', verified: false, notes: '' },
      { order: 3, description: 'Update the application with the new private key', verified: false, notes: '' },
      { order: 4, description: 'Verify SSH/SSL connectivity with the new key', verified: false, notes: '' },
      { order: 5, description: 'Remove the old private key from all systems', verified: false, notes: '' },
      { order: 6, description: 'Remove the old key from git history', verified: false, notes: '' },
    ],
  },
};

export function getRotationChecklist(secretType: string): RotationChecklistData | null {
  return checklists[secretType] || null;
}

export function getAllRotationTypes(): string[] {
  return Object.keys(checklists);
}
