import simpleGit from 'simple-git';
import fs from 'fs';
import { logInfo, logError } from '../utils/logger.js';

const git = simpleGit();

export async function cloneRepository(remoteUrl, localPath, branch) {
    try {
        if (fs.existsSync(localPath)) {
            logInfo(`Repository already exists at ${localPath}, pulling latest changes...`);
            await git.cwd(localPath);
            await git.pull('origin', branch);
        } else {
            logInfo(`Cloning repository from ${remoteUrl}...`);
            await git.clone(remoteUrl, localPath);
            await git.cwd(localPath);
            await git.checkout(branch);
        }
        logInfo(`Repository ready at ${localPath}`);
    } catch (error) {
        logError(`Error cloning repository: ${error}`);
    }
}
