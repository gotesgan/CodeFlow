import { cloneRepository } from './git/cloneRepository.js';
import { runScript } from './scripts/runScript.js';
import { checkForCommits } from './git/checkForNewCommits.js';
import { validateConfigFile } from './utils/validation.js';
import fs from 'fs';
import { logInfo, logError } from './utils/logger.js';
import { Worker } from 'worker_threads';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function main() {
    try {
        const configList = await validateConfigFile();
        if (!configList.length) {
            logError('No valid configurations found!');
            return;
        }
        while (true) {
            logInfo('Starting new check cycle...');
            const workers = configList.map(config => {
                return new Promise((resolve) => {
                    const worker = new Worker('./worker.js', { workerData: config });
                    worker.on('exit', resolve);
                });
            });
            await Promise.all(workers);
            logInfo('Sleeping for 1 minute...');
            await sleep(45000);
        }
    } catch (e) {
        logError(`Main function error: ${e}`);
    }
}

main();
