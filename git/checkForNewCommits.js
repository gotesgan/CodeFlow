import simpleGit from 'simple-git';
import { logInfo, logError } from '../utils/logger.js'; // Import logger functions

const git = simpleGit();

// Function to resolve conflicts automatically with retry logic
async function resolveConflictAndRetry(git, localPath, branch, retries = 3) {
    let attempts = 0;
    while (attempts < retries) {
        try {
            logInfo(`Attempt ${attempts + 1} to resolve conflict`);
            // Pull with a strategy that resolves conflicts automatically by favoring remote changes
            await git.pull('origin', branch, { '--strategy': 'recursive', '--strategy-option': 'theirs' });
            logInfo('Conflict resolved successfully!');
            return true;
        } catch (error) {
            logError(`Conflict resolution failed: ${error}`);
            attempts++;
            if (attempts < retries) {
                logInfo(`Retrying... (${attempts} of ${retries})`);
            } else {
                logError(`All ${retries} attempts to resolve the conflict have failed.`);
                return false; // No email notification, just log the error
            }
        }
    }
}

// Function to check if there are new commits on a given branch.
export async function checkForCommits(localPath, branch) {
    try {
        // Change to the specified local repository directory
        await git.cwd(localPath);

        // Fetch the latest changes from the remote repository
        await git.fetch('origin');

        // Get the latest commit log for both local and remote branches
        const remoteLog = await git.log([`origin/${branch}`, '-n', '1']);
        const localLog = await git.log([branch, '-n', '1']);

        // If commit hashes are different, there are new commits on the remote branch
        if (remoteLog.latest.hash !== localLog.latest.hash) {
            logInfo(`New commits found on branch ${branch}!`);

            // Resolve conflicts with retry logic
            const conflictResolved = await resolveConflictAndRetry(git, localPath, branch);
            if (!conflictResolved) {
                return false; // If conflict resolution fails, skip further processing
            }
            return true; // New commits detected and conflicts resolved
        }

        logInfo(`No new commits on branch ${branch}.`);
        return false; // No new commits
    } catch (error) {
        logError(`Error checking commits for branch ${branch}: ${error}`);
        return false;
    }
}