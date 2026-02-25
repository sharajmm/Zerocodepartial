const fs = require('fs');
const path = require('path');

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const f = path.join(dir, file);
        if (fs.statSync(f).isDirectory()) walk(f);
        else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            let c = fs.readFileSync(f, 'utf8');
            if (c.includes("import React from 'react';")) {
                fs.writeFileSync(f, c.replace(/import React from 'react';\r?\n/, ''));
            }
        }
    });
}

walk('src');
