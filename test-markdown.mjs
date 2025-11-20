---
// Diagnostic script to test markdown-it rendering
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
});

const testCases = [
    { input: '**bold**', expected: '<p><strong>bold</strong></p>' },
    { input: '*italic*', expected: '<p><em>italic</em></p>' },
    { input: '[link](https://example.com)', expected: '<p><a href="https://example.com">link</a></p>' },
    { input: '- item 1\n- item 2', expected: '<ul>\n<li>item 1</li>\n<li>item 2</li>\n</ul>' },
];

console.log('=== Markdown-it Diagnostic ===\n');

testCases.forEach(({ input, expected }) => {
    const output = md.render(input).trim();
    const passed = output === expected.trim();
    console.log(`Input: ${input}`);
    console.log(`Output: ${output}`);
    console.log(`Expected: ${expected.trim()}`);
    console.log(`Status: ${passed ? '✓ PASS' : '✗ FAIL'}\n`);
});
