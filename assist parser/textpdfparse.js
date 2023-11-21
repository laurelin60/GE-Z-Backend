import fs from "fs";
import path from "path"
import PDFParser from "pdf2json";
import pLimit from "p-limit"
import cluster from "cluster"
import os from "os"

// WARNING : any changes to the file will take effect the next time a thread starts, even if the script is already running! 

const MAX_WORKER_THREADS = os.cpus().length;

function processPdfData(pdfData, file) {
    //fs.writeFileSync("./debug.json", JSON.stringify(pdfData));

    // code is not super great but it also has debugging stuff which is part of it so there's that 

    let articulations = []; // All raw articulations on each page (filtered afterwards)
    let arrowYs = []; // Y levels of all arrows on each page 

    
    let comboMarkers = []; // Extra thicc text (the 25 font size ones) in the middle of the page (ANDs and ORs) (other ANDs and ORs are also 25 but we don't need these here)
    // (the PDFs don't draw these combo markers sequentially with everything else which is why we have to process these, but they do draw them in relative order to other combo markers on the same page)

    let pageNum = 0;

    let string = pdfData.Pages.map(e => {
        pageNum++;

        let pageArticulations = [];
        let pageArrowYs = [];
        let pageComboMarkers = [];

        let previousY = null; // To track the previous y level
        let addBracket = true; // Flag to check if "[" should be added
        let braceOpened = false; // Flag to check if "{" is open

        let processingLeft = true; // Flag to check whether or not we are processing the left side (brackets) and it's still valid 
        let processingRight =  true; // Flag to check whether or not we are processing the right side (braces/curly brackets) and it's still valid 

        let prevLeft = "";
        let currLeft = "";
        let currRight = "";
        let currArrowY = 0;

        let currExtraComboMarkerText = "";
        let currExtraComboMarkerY = 0;

        let pageRes = e.Texts.map(t => {
            let lastWasArrow = false;
            let text = t.R.map(r => {
                if (r.T == "%E2%80%8B") return ""; // Get rid of zero-width spaces 

                if (r.T == "%E2%86%90") { // left arrow thingy 
                    addBracket = !braceOpened;
                    processingLeft = false;
                    braceOpened = false; 
                    currArrowY = t.y;
                    pageArrowYs.push(t.y);
                    if (lastWasArrow == true) { // Two arrows in a row is impossible, the second one is 100% bad
                        currLeft = "";
                    }
                    lastWasArrow = true;

                    // Check if brace has to be processed 
                    if (!addBracket) { // This is like doing if braceOpened at the top because we set addBracket to the opposite of braceOpened 
                        if (prevLeft.trim().length >= 3 && currRight.trim().length >= 3) {
                            pageArticulations.push([prevLeft, currRight, currArrowY, pageNum])
                            prevLeft = "";
                            currRight = "";
                        }
                        return "}";
                    }
                    return "]←";
                }
                if (r.TS.toString() !== [2, 23, 1, 0].toString() && r.TS[1] != 25) return "";
                lastWasArrow = false;
                if (r.TS[1] == 25 && t.x > 16 && t.x < 22) {
                    if (currExtraComboMarkerText == "---%20And%20--" || currExtraComboMarkerText == "---%20Or%20--") {
                        pageComboMarkers.push([currExtraComboMarkerText.replaceAll("%20", ' ') + '-', currExtraComboMarkerY])
                    }
                    if (previousY != null && Math.abs(previousY - t.y) > 0.2) {
                        currExtraComboMarkerText = "";
                        currExtraComboMarkerY = t.y;
                    }
                    currExtraComboMarkerText += r.T;
                }


                if (r.T == "%3A") { // Filter out unrelated text 
                    processingLeft = false;
                    currLeft = "";
                }

                // Not going to use decodeURIComponent here (at least for now) so we kind of document the other chars and stuff 
                if (r.T == "%20") return " ";
                if (r.T == "%26") return "&";
                if (r.T == "%2B") return "+";
                if (r.T == "%2F") return "/";
                if (r.T.length > 3) r.T = r.T.replaceAll("%3A", ":")
    
                // Check if "[" should be added
                if (addBracket && t.x < 16) {
                    addBracket = false; // Set the flag to false after adding "["
                    prevLeft = currLeft;
                    processingLeft = true
                    currLeft = "";
                    return "[" + r.T.replaceAll('%20', ' ').trim();
                }
    
                if (t.x < 18) {
                    processingRight = false;
                    currRight = "";
                }

                // Check if "{" should be added
                if (!braceOpened && t.x >= 18 && r.TS[1] == 23) {
                    processingLeft = false;
                    braceOpened = true; // Set the flag to true after adding "{"
                    processingRight = true;
                    return "{" + r.T.replaceAll('%20', ' ').trim();
                }
    
                return r.T.replaceAll('%20', ' ').trim();
            }).join('');
            
            if (!text.length) return text;

            if (processingLeft) currLeft += text.replaceAll('[', '');
            else if (processingRight) {
                let add = text.replaceAll(']←', '').replaceAll('{', '');
                if (currRight.length && currRight.split(-1) != " " && previousY !== null && Math.abs(previousY - t.y) > 0.2) {
                    add = " | " + add;
                }
                currRight += add;
            }

            // Close "{" when x is less than 18
            if (braceOpened && t.x < 18) {
                text = "}\n" + text;
                braceOpened = false; // Reset the flag after closing "{"
                // Check if we should push data to big array 
                if (prevLeft.trim().length >= 3 && currRight.trim().length >= 3) {
                    pageArticulations.push([prevLeft, currRight, currArrowY, pageNum])
                    prevLeft = "";
                    currRight = "";
                }
            }
            else {
                // Only check if else because we are already adding newline above 
                // Add newline character if y level changes
                if (previousY !== null && Math.abs(previousY - t.y) > 0.2) text = '\n' + text;
            }
    
            // Update previousY
            previousY = t.y;
    
            return text;
        }).join('');

        articulations.push(pageArticulations);
        arrowYs.push(pageArrowYs);
        comboMarkers.push(pageComboMarkers);

        return pageRes;
    }).join('');

    //console.log(articulations);
    //console.log(arrowYs);
    //console.log(comboMarkers);

    // Post-process articulation ANDs (not doing it in the loop so we can still debug check and stuff) (we are removing the stuff that the big ANDs handle because realistically nobody's taking multiple courses for a GE)
    for (let i = 0; i < comboMarkers.length; i++) {
        comboMarkers[i].forEach(c => { // Loop through the current page 
            if (c[0] == "--- And ---") {
                // Get the arrows above and below 
                let prevArrowY = 0;
                arrowYs[i].forEach(a => {
                    if (a > c[1]) {
                        let removeFromArticulations = [ a ];
                        if (prevArrowY != 0) removeFromArticulations.push(prevArrowY);
                        let oldSize = articulations[i].length;
                        articulations[i] = articulations[i].filter(e => !removeFromArticulations.includes(e[2]));
                        // console.log(`Removed ${oldSize - articulations[i].length} bad elements!`);
                        prevArrowY = 0; // reset so we don't try to remove the same element twice 
                    }
                    else {
                        prevArrowY = a;
                    }
                });
            }
        });
    }

    // console.log(articulations)
    
    // Convert articulations to final output form 
    articulations = articulations
        .map(p => p.map(e => [e[0], e[1]])).flat() // Get rid of info we no longer need 
        .filter(e => !e[1].includes("--- And ---")) // Get rid of articulations where you have to take multiple courses because nobody will take those for GEs 
        .map(e => [e[0].replaceAll("--- And ---", ", "), e[1]]) // Convert left side to a list if it counts for both 
        .map(e => e[0].split("--- Or ---").map(c => [c, e[1]])).flat() // If left side has OR then we need to split it into multiple entries 
        .map(e => e[1].split(" | --- Or --- | ").map(c => [e[0], c])).flat() // If right side has OR then we need to split it into multiple entries 
        .map(e => e[1].split(" | ").map(c => [e[0], c])).flat() // If right side has implicit OR (just listing a shit ton of classes, I'm pretty sure this is OR) we also need to split 
        .filter(e => e[1].toLowerCase() != "or" && e[1].toLowerCase() != "and"); // Filter out bad edge cases 
    
    let jsonObject = {
        pdfId: file.split('---')[1].split('.pdf')[0],
        sendingInstitution: file.split('\\')[3].replaceAll('_', ' '),
        articulations: articulations.map(e => ({to: e[0], from: e[1]}))
    }

    // Print the info 
    console.log(`Processed ${file.split('\\').slice(3).join('/')}`, jsonObject);
    //console.log(string)
    //fs.writeFileSync("./debug.txt", string); 
}

function getAllFilesInDir(directoryPath, filesArray) {
    let res = filesArray || [];

    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        if (fs.statSync(filePath).isDirectory()) { // If it's a directory we do epic recursive call 
            getAllFilesInDir(filePath, res);
        } 
        else { // If it's a file we just push the path into res 
            res.push(filePath); 
        }
    });

    return res;
}

async function main() {
    const allFiles = getAllFilesInDir("../scrapers/assist-pdfs"); // Implement your logic to retrieve files
    console.log(`Found ${allFiles.length} files!`);

    console.log(`Starting ${Math.min(allFiles.length, MAX_WORKER_THREADS)} threads!`)

    let activeThreads = 0;

    cluster.on('exit', (worker, code, signal) => {
        //console.log(`Worker ${worker.process.pid} exited with code ${code}`);
        activeThreads--;
    });

    for (let i = 0; i < allFiles.length; i++) {
        // Not crazy efficient because it keeps starting and stopping workers but it's fine :+1:
        while (activeThreads >= MAX_WORKER_THREADS) await new Promise(t => setTimeout(t, 100));
        activeThreads++;
        const worker = cluster.fork();
        worker.on('message', async (file) => {
            worker.send(allFiles[i]);
        });
    }
    while (activeThreads > 0) await new Promise(t => setTimeout(t, 100));

} 

if (cluster.isPrimary) {
    let startTime = Date.now()
    await main();
    console.log(`Processing completed in ${(Date.now() - startTime) / 1000} seconds`);
} 
else {
    process.send("a"); // worker is ready 
    process.on('message', async (file) => {
        // Process file 
        const result = await new Promise((resolve, reject) => {
            const pdfParser = new PDFParser(undefined, 1);
            pdfParser.on('pdfParser_dataError', errData => {
                console.log(`ERROR processing ${file.split('\\').slice(3).join('/')}`);
                console.error(errData.parserError);
                reject(errData);
            });
            pdfParser.on('pdfParser_dataReady', pdfData => {
                processPdfData(pdfData, file);
                resolve(pdfData);
            });
            pdfParser.loadPDF(file);
        });
        process.exit(0);
    });
}