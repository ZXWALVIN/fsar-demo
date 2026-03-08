// Extract and check JavaScript from HTML
const fs = require('fs');

const html = fs.readFileSync('fsar-demo-hightech.html', 'utf8');

// Extract script content
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.log('No script tag found');
    process.exit(1);
}

const jsCode = scriptMatch[1];

// Try to parse it
try {
    new Function(jsCode);
    console.log('✅ JavaScript syntax is valid');
} catch (e) {
    console.log('❌ JavaScript syntax error:');
    console.log(e.message);
    console.log('\nError location:');
    const lines = jsCode.split('\n');
    const errorLine = parseInt(e.message.match(/line (\d+)/)?.[1] || 0);
    if (errorLine > 0) {
        console.log(`Line ${errorLine}: ${lines[errorLine - 1]}`);
    }
}
