import simpleGit from 'simple-git';
import { logInfo, logError } from '../utils/logger.js';

const git = simpleGit();

export async function checkForCommits(localPath, branch) {
    try {
        await git.cwd(localPath);

        // Fetch the latest changes from the remote repository
        await git.fetch('origin');

        // Compare remote and local branch hashes
        const remoteHash = await git.revParse([`origin/${branch}`]);
        const localHash = await git.revParse([branch]);

        if (remoteHash !== localHash) {
            logInfo(`New commits found for branch ${branch}`);
            return true;
        }

        logInfo(`No new commits for ${branch}`);
        return false;
    } catch (error) {
        logError(`Error checking for new commits: ${error}`);
        return false;
    }
}