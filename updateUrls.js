const fs = require('fs');
const path = require('path');

const directory = 'd:/MERN LAB/uyir/Frontend/src';
const oldUrl = 'http://localhost:5000';
const newUrl = 'https://uyir-animal-rescue-system.onrender.com';

function replaceInFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInFiles(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(oldUrl)) {
                content = content.replace(new RegExp(oldUrl, 'g'), newUrl);
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}
replaceInFiles(directory);
