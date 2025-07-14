

// Raid-List/data-parser.js - Web Worker for parsing large data files
// Version: 20250713.1
console.log('data-parser.js: Version 20250713.1 loaded.');

self.onmessage = async (event) => {
    const { version, scarletFiles, violetFiles } = event.data;

    const filesToLoad = version === "Scarlet" ? scarletFiles : violetFiles;
    const folderPath = `data/${version}/`;
    let raidData = [];

    for (const file of filesToLoad) {
        try {
            console.log(`Worker: Starting to load file: ${folderPath}${file}`);
            const response = await fetch(`${folderPath}${file}`);
            if (!response.ok) {
                console.warn(`Worker: Failed to fetch ${folderPath}${file}: ${response.status} ${response.statusText}`);
                continue;
            }
            const data = await response.text();
            const lines = data
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(line => line !== '');

            if (lines.length < 2) {
                console.warn(`Worker: Skipping empty or malformed file: ${folderPath}${file}`);
                continue;
            }

            const headers = lines[0].split("\t");
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split("\t");
                try {
                    if (values.length === headers.length) {
                        const raid = {};
                        headers.forEach((header, index) => {
                            raid[header] = values[index];
                        });
                        raidData.push(raid);
                    } else if (values.length === headers.length - 1 && headers[headers.length - 1] === 'Mark') {
                        // If 'Mark' column is missing, assume it's empty
                        const raid = {};
                        headers.forEach((header, index) => {
                            raid[header] = values[index] || ''; // Use empty string if value is undefined
                        });
                        raidData.push(raid);
                    } else {
                        // This warning will now appear in the worker's console, not the main thread's
                        console.warn(`Worker: Skipping malformed line in ${folderPath}${file}. Expected ${headers.length} columns, got ${values.length}. Line: "${lines[i]}"\nRaw Line Char Codes: [${lines[i].split('').map(c => c.charCodeAt(0)).join(', ')}]\nHeaders: ${JSON.stringify(headers)}\nValues: ${JSON.stringify(values)}`);
                    }
                } catch (parseError) {
                    console.error(`Worker: Error parsing line in ${folderPath}${file}: ${lines[i]}`, parseError);
                }
            }
            console.log(`Worker: Finished loading ${folderPath}${file}. Current total raidData length: ${raidData.length}`);
        } catch (error) {
            console.error(`Worker: Error loading file: ${folderPath}${file}`, error);
        }
    }

    // Send the parsed data back to the main thread
    self.postMessage({ raidData });
};

