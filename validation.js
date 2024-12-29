import { z } from "zod";
import fs from "fs/promises";

// Zod schema for validating the config
const validateConfig = z.object({
    repository: z.object({
        remote_url: z.string().url(), // Valid URL
        local_path: z.string().min(1), // Non-empty string for path
        branch: z.string().min(1) // Validate the branch field
    }),
    scripts: z.array(
        z.object({
            name: z.string().min(1),
            command: z.string().min(1),
            description: z.string().optional()
        })
    ),
});

// Function to validate the config file
export async function validateConfigFile() {
    try {
        // Read the config file asynchronously
        const data = await fs.readFile("config.json", "utf-8");

        // Parse and validate the config
        const config = JSON.parse(data);
        validateConfig.array().parse(config); // Validate array of repository configs
        console.log("Configuration is valid!");

        // Return validated config
        return config;
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.error("Validation failed:", e.errors);
        } else if (e.code === "ENOENT") {
            console.error("Error: Config file not found.");
        } else if (e instanceof SyntaxError) {
            console.error("Error parsing config file: Invalid JSON format.");
        } else {
            console.error("Error:", e);
        }
        throw e;  // Rethrow the error
    }
}
