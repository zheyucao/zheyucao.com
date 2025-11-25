import sanitizeHtml from "sanitize-html";

const STRICT_ALLOWED_TAGS = ["em", "strong", "span", "br", "code"];
const STRICT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {};

const RICH_ALLOWED_TAGS = [
    "em",
    "strong",
    "span",
    "br",
    "code",
    "pre",
    "p",
    "ul",
    "ol",
    "li",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "a",
    "img",
];

const RICH_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    "*": ["class"],
};

export function sanitizeStrict(value: string): string {
    return sanitizeHtml(value || "", {
        allowedTags: STRICT_ALLOWED_TAGS,
        allowedAttributes: STRICT_ALLOWED_ATTRIBUTES,
    });
}

export function sanitizeRich(value: string): string {
    return sanitizeHtml(value || "", {
        allowedTags: RICH_ALLOWED_TAGS,
        allowedAttributes: RICH_ALLOWED_ATTRIBUTES,
    });
}
