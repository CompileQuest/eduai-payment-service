const nodemon = require('nodemon');
const { spawn } = require('child_process');
let tunnelProcess = null;

function startTunnel() {
    // Kill existing tunnel process if it exists
    if (tunnelProcess) {
        try {
            tunnelProcess.kill();
        } catch (err) {
            console.log('Error killing tunnel process:', err);
        }
    }
    
    // Start new tunnel process with specific subdomain
    console.log('Starting new tunnel...');
    tunnelProcess = spawn('lt', ['--port', '8000', '--subdomain', 'mywebhookeduai'], {
        stdio: 'inherit',
        shell: true
    });

    tunnelProcess.on('error', (err) => {
        console.error('Tunnel process error:', err);
    });
}

nodemon({
    script: 'src/index.js',
    ext: 'js json',
    ignore: ['node_modules/*'],
    delay: 1000 // Add small delay to ensure clean restart
})
.on('start', () => {
    console.log('Server starting...');
    startTunnel();
})
.on('restart', () => {
    console.log('Server restarting...');
    startTunnel();
})
.on('quit', () => {
    console.log('Cleaning up...');
    if (tunnelProcess) {
        tunnelProcess.kill();
    }
    process.exit();
}); 