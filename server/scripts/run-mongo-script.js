const { exec } = require('child_process');
const path = require('path');

// Load environment variables from .env file in the parent directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Get the MongoDB URI from environment variables
const mongoURI = process.env.MONGODB_URI;

// Get the script path from command line arguments
const scriptPath = process.argv[2];

if (!mongoURI) {
  console.error('Error: MONGODB_URI is not defined in your .env file.');
  process.exit(1);
}

if (!scriptPath) {
  console.error('Error: Please provide the path to the MongoDB script to execute.');
  console.error('Usage: node scripts/run-mongo-script.js <path/to/script.js>');
  process.exit(1);
}

// Construct the mongosh command
// Ensure the script path is relative to the server directory
const absoluteScriptPath = path.resolve(__dirname, '..', scriptPath);
const command = `mongosh "${mongoURI}" ${absoluteScriptPath}`;

console.log(`Executing MongoDB script: ${scriptPath}`);
console.log(`Using URI: ${mongoURI}`);
console.log(`Running command: ${command}`);

// Execute the command
const child = exec(command);

// Pipe the output (stdout and stderr) of the child process to the main process
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

// Handle process exit
child.on('exit', (code) => {
  console.log(`\nMongoDB script execution finished with code ${code}.`);
  process.exit(code);
});

// Handle errors during execution (e.g., mongosh not found)
child.on('error', (error) => {
  console.error(`Error executing command: ${error.message}`);
  process.exit(1);
}); 