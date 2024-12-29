import { cloneRepository } from "./cloneRepository.js";
import { runScript } from "./runScript.js";
import { checkForCommits } from "./checkForNewCommits.js";
import { validateConfigFile } from "./validation.js";
import fs from 'fs';

// Sleep function to pause execution for a given time
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to process repositories
async function processRepositories(configList) {
    for (const config of configList) {
        const { remote_url, local_path, branch } = config.repository;

        try {
            // If repository doesn't exist, clone it
            if (!fs.existsSync(local_path)) {
                await cloneRepository(remote_url, local_path);
                console.log('Repository cloned:', local_path);
            }

            // Check for new commits in the specified branch, resolve conflicts if any
            const newCommits = await checkForCommits(local_path, branch);

            if (newCommits) {
                for (const script of config.scripts) {
                    await runScript(script.command, local_path); // Run script if new commits
                }
                console.log(`CI/CD pipeline completed for ${remote_url}!`);
            }

        } catch (error) {
            console.error('Error processing repository:', error);
        }
    }
}

// Main function
async function main() {
    try {
        const configList = await validateConfigFile(); // Load configuration with multiple repos
        if (!configList || configList.length === 0) {
            console.error("No valid configurations found!");
            return;
        }

        // Infinite loop to run the process indefinitely
        while (true) {
            console.log("Starting new check cycle...");

            // Process each repository based on the loaded config
            await processRepositories(configList);

            // Wait for a specified time (e.g., 10 minutes) before running the next check
            console.log("Sleeping for 10 minutes...");
            await sleep(600000); // 600000 ms = 10 minutes
        }

    } catch (e) {
        console.error("Main function encountered an error:", e);
    }
}

main();
