// NOTE: THIS FILE IS NOT AFFECTED BY COMMIT AUTO RUN THINGY, ONLY THE ACTUAL INDEX.TS STUFF IS

import { simpleGit, SimpleGit } from 'simple-git';
import { spawn, ChildProcess, exec } from 'child_process';

const git: SimpleGit = simpleGit('./');

let childProcess: ChildProcess | null = null;

function startScript() {
    // Ensure only one instance of the script is running
    if (childProcess) {
        childProcess.kill();
        childProcess = null;
    }

    // Start the script with 'ts-node', adjust command as necessary for your environment
    childProcess = spawn('npm', ['run', 'start', '--', '-ssl'], { shell: true, stdio: 'inherit' });

    // Listen for unexpected exit (crash)
    childProcess.on('exit', (code, signal: number) => {
        if (signal != 999) {
            console.log(`Child process exited with code ${code} and signal ${signal}, restarting`);
            // Restart the script if it crashes
            startScript();
        }
    });
}

async function runBuildCommand() {
    return new Promise<void>((resolve, reject) => {
        console.log('Running npm run build...');
        const buildProcess = exec('npm run build', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return reject(error);
            }
            //console.log(`stdout: ${stdout}`);
            console.log("Build complete");
            //console.error(`stderr: ${stderr}`);
            resolve();
        });
    });
}

async function repoUpdateLoop() {
    while (true) {
        const pullSummary = await git.pull('origin', 'main');
        if (pullSummary.files.length > 0) { // Adjusted to check for file changes directly
            console.log('Changes detected, running build and restarting script');

            // Kill the child process if it's running
            if (childProcess) {
                childProcess.kill(999);
                childProcess = null;
            }

            // Run the build command
            await runBuildCommand();
            
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            
            startScript();
        }
        await new Promise(resolve => setTimeout(resolve, 30000));
    }
}

async function main() {
    await runBuildCommand();
    startScript();
    await repoUpdateLoop();
}

main();