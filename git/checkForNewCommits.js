import simpleGit from 'simple-git';
import { logInfo, logError } from '../utils/logger.js';

export async function checkForCommits(localPath, branch) {
    try {
        const git = simpleGit(localPath);
        await git.fetch();
        const status = await git.status();
        if (status.behind > 0) {
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
