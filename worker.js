import { workerData } from 'worker_threads';
import { cloneRepository } from './git/cloneRepository.js';
import { runScript } from './scripts/runScript.js';
import { checkForCommits } from './git/checkForNewCommits.js';
import { logInfo, logError } from './utils/logger.js';
import fs from 'fs';

async function processRepository(config) {
    const { remote_url, local_path, branch } = config.repository;

    try {
        if (!fs.existsSync(local_path)) {
            await cloneRepository(remote_url, local_path, branch);
        }
        const newCommits = await checkForCommits(local_path, branch);
        if (newCommits) {
            for (const script of config.scripts) {
                await runScript(script.command, local_path);
            }
            logInfo(`CI/CD pipeline completed for ${remote_url}!`);
        }
    } catch (error) {
        logError(`Error processing repository: ${error}`);
    }
}

processRepository(workerData);
