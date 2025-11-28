#!/usr/bin/env node

/**
 * Migration script to convert date fields to startDate/endDate
 * 
 * Handles:
 * - Timeline: date: "YYYY-MM" → startDate: "YYYY-MM"
 * - Awards: date: "Month YYYY" → startDate: "YYYY-MM"
 * - Education/Experience: date: "Month YYYY – Month YYYY" → startDate/endDate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const monthMap = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04',
    'May': '05', 'June': '06', 'July': '07', 'August': '08',
    'September': '09', 'October': '10', 'November': '11', 'December': '12'
};

function convertMonthYearToYYYYMM(dateStr) {
    // Handle "Month YYYY" format
    const match = dateStr.match(/^(\w+)\s+(\d{4})$/);
    if (match) {
        const [, month, year] = match;
        const monthNum = monthMap[month];
        if (monthNum) {
            return `${year}-${monthNum}`;
        }
    }
    // Already in YYYY-MM format or other format
    return dateStr;
}

function parseDateRange(dateStr) {
    // Check if it's already in YYYY-MM format (don't split on hyphen)
    if (/^\d{4}-\d{2}$/.test(dateStr.trim())) {
        return {
            startDate: dateStr.trim(),
            endDate: null
        };
    }

    // Handle "Month YYYY – Month YYYY" or "Month YYYY – Present"
    const rangeSeparators = ['–', '—'];
    let separator = rangeSeparators.find(sep => dateStr.includes(sep));

    if (!separator) {
        // Single date
        return {
            startDate: convertMonthYearToYYYYMM(dateStr.trim()),
            endDate: null
        };
    }

    const parts = dateStr.split(separator).map(s => s.trim());
    if (parts.length !== 2) {
        console.warn(`Unexpected date range format: ${dateStr}`);
        return { startDate: dateStr, endDate: null };
    }

    let [start, end] = parts;

    // Handle "Present" or "(Expected)" etc
    if (end.toLowerCase().includes('present')) {
        end = 'present';
    } else if (end.match(/\(.*\)/)) {
        // Handle "(Expected)" - treat as single date
        return {
            startDate: convertMonthYearToYYYYMM(start),
            endDate: null
        };
    } else {
        end = convertMonthYearToYYYYMM(end);
    }

    return {
        startDate: convertMonthYearToYYYYMM(start),
        endDate: end
    };
}

function migrateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Match frontmatter date field
    const dateMatch = content.match(/^date:\s*"([^"]+)"/m);

    if (!dateMatch) {
        return; // No date field
    }

    const originalDate = dateMatch[1];
    const { startDate, endDate } = parseDateRange(originalDate);

    let newContent = content;

    // Replace date field with startDate (and optionally endDate)
    if (endDate) {
        newContent = newContent.replace(
            /^date:\s*"[^"]+"/m,
            `startDate: "${startDate}"\nendDate: "${endDate}"`
        );
    } else {
        newContent = newContent.replace(
            /^date:\s*"[^"]+"/m,
            `startDate: "${startDate}"`
        );
    }

    // Remove dateRange field if it exists (timeline only)
    newContent = newContent.replace(/^dateRange:\s*"[^"]+"\n/m, '');

    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✓ Migrated: ${path.relative(process.cwd(), filePath)}`);
    console.log(`  ${originalDate} → startDate: "${startDate}"${endDate ? `, endDate: "${endDate}"` : ''}`);
}

function migrateDirectory(dirPath) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
            migrateDirectory(fullPath);
        } else if (file.name.endsWith('.mdx') || file.name.endsWith('.md')) {
            try {
                migrateFile(fullPath);
            } catch (error) {
                console.error(`✗ Error migrating ${fullPath}:`, error.message);
            }
        }
    }
}

// Run migration
const contentDir = path.join(__dirname, '../src/content');
const dirsToMigrate = ['timeline', 'projects', 'resume'];

console.log('Starting date field migration...\n');

for (const dir of dirsToMigrate) {
    const fullPath = path.join(contentDir, dir);
    if (fs.existsSync(fullPath)) {
        console.log(`\nMigrating ${dir}/...`);
        migrateDirectory(fullPath);
    }
}

console.log('\n✓ Migration complete!');
