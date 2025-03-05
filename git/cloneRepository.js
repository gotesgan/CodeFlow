import simpleGit from 'simple-git';
import fs from 'fs';
import { logInfo, logError } from '../utils/logger.js';

const git = simpleGit();

// Function to safely pull changes with conflict resolution
async function safePull(git, branch, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await git.pull('origin', branch);
            return true;
        } catch (error) {
            if (i === retries - 1) throw error; // Throw error if all retries fail
            await git.merge(['--abort']).catch(() => {}); // Abort merge on failure
            await git.reset(['--hard', `origin/${branch}`]); // Reset to remote branch
        }
    }
}

export async function cloneRepository(remoteUrl, localPath, branch) {
    try {
        if (fs.existsSync(localPath)) {
            logInfo(`Repository already exists at ${localPath}, pulling latest changes...`);
            await git.cwd(localPath);

            // Ensure the local branch matches the config
            const isRepo = await git.checkIsRepo();
            if (!isRepo) throw new Error('Not a git repository');

            await git.checkout(branch).catch(() => git.checkoutLocalBranch(branch));
            await safePull(git, branch);
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