import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

// Configure pdfjs-dist worker (required for v5.x)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 50000;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.json', '.csv', '.pdf', '.docx', '.doc'];
const SUPPORTED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

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
    return SUPPORTED_EXTENSIONS.includes(ext) || SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
}

export function isImageFile(filename: string): boolean {
    const ext = getFileExtension(filename);
    return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
}

export function isFileSizeValid(size: number, isImage = false): boolean {
    return size <= (isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE);
}

async function parseImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            if (base64) {
                resolve(base64);
            } else {
                reject(new Error('Failed to read image'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
    });
}

export async function extractText(file: File): Promise<string> {
    const ext = getFileExtension(file.name);
    const isImage = SUPPORTED_IMAGE_EXTENSIONS.includes(ext);

    if (!isFileSizeValid(file.size, isImage)) {
        const maxSize = isImage ? '10MB' : '5MB';
        throw new Error(`File too large (${formatSize(file.size)}). Maximum size is ${maxSize}.`);
    }

    // Handle images - return base64 data URL
    if (isImage) {
        return await parseImage(file);
    }

    // Handle text-based files
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
