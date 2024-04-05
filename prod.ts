// NOTE: THIS FILE IS NOT AFFECTED BY COMMIT AUTO RUN THINGY, ONLY THE ACTUAL INDEX.TS STUFF IS

import { simpleGit, SimpleGit } from 'simple-git';
import { spawn, ChildProcess, exec } from 'child_process';

const git: SimpleGit = simpleGit('./');

let childProcess: ChildProcess | null = null;

function startScript() {
    // Ensure only one instance of the script is running
    if (childProcess) {
        childProcess.on('exit', (code, signal) => {});
        childProcess.kill();
        childProcess = null;
        return;
    }

    childProcess = spawn('node', ['dist/src/index.js', '-ssl'], { stdio: 'inherit' });

    // Listen for unexpected exit (crash)
    childProcess.on('exit', (code, signal) => {
        if (signal != 'SIGINT') {
            console.log(`Child process exited with code ${code} and signal ${signal}, restarting`);
            // Restart the script if it crashes
            childProcess = null;
            startScript();
        }
    });
}

async function runInstallCommand() {
    return new Promise<void>((resolve, reject) => {
        console.log('Running npm install...');
        const installProcess = exec('npm install', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return reject(error);
            }
            //console.log(`stdout: ${stdout}`);
            console.log("Install complete");
            //console.error(`stderr: ${stderr}`);
            resolve();
        });
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
        if (pullSummary.files.length > 0) {
            console.log('Changes detected, running build and restarting script');
            await runInstallCommand();
            await runBuildCommand();
            await new Promise<void>(resolve => {
                if (childProcess) { // ig I have to check again 
                    childProcess.on('exit', () => {
                        console.log('Child process exited, continuing...');
                        resolve();
                    });
                    childProcess.kill("SIGINT");
                    childProcess = null;
                }
            });

            await new Promise(resolve => setTimeout(resolve, 200));

            startScript();
        }
        await new Promise(resolve => setTimeout(resolve, 30000));
    }
}


async function main() {
    await runInstallCommand();
    await runBuildCommand();
    startScript();
    await repoUpdateLoop();
}

main();