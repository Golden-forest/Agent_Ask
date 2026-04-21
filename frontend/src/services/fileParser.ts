import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 50000;

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.json', '.csv', '.pdf', '.docx', '.doc'];

function getFileExtension(filename: string): string {
    const idx = filename.lastIndexOf('.');
    return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

async function readAsText(file: File): Promise<string> {
    return file.text();
}

async function parsePDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        textParts.push(pageText);
    }

    return textParts.join('\n');
}

async function parseDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

export function isSupportedFile(filename: string): boolean {
    const ext = getFileExtension(filename);
    return SUPPORTED_EXTENSIONS.includes(ext);
}

export function isFileSizeValid(size: number): boolean {
    return size <= MAX_FILE_SIZE;
}

export async function extractText(file: File): Promise<string> {
    if (!isFileSizeValid(file.size)) {
        throw new Error(`File too large (${formatSize(file.size)}). Maximum size is 5MB.`);
    }

    const ext = getFileExtension(file.name);

    let text: string;
    switch (ext) {
        case '.txt':
        case '.md':
        case '.json':
        case '.csv':
            text = await readAsText(file);
            break;
        case '.pdf':
            text = await parsePDF(file);
            break;
        case '.docx':
        case '.doc':
            text = await parseDocx(file);
            break;
        default:
            throw new Error(`Unsupported file type: ${ext}`);
    }

    if (text.length > MAX_TEXT_LENGTH) {
        text = text.slice(0, MAX_TEXT_LENGTH) + '\n\n[... content truncated]';
    }

    if (!text.trim()) {
        throw new Error('Could not extract any text from the file.');
    }

    return text;
}

export function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
