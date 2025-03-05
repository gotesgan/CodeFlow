import { validateConfigFile } from './utils/validation.js';
import { Worker } from 'worker_threads';
import { logInfo, logError } from './utils/logger.js';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
            logInfo('Sleeping for 30 seconds...');
            await sleep(30000); // Sleep for 1 minute
        }
    } catch (e) {
        logError(`Main function error: ${e}`);
    }
}

main();