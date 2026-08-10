import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import { getFileExtension, isImageFile, formatSize } from './fileUtils';

// Re-export 纯函数，保持现有调用方无需改动
export { isSupportedFile, isImageFile, formatSize } from './fileUtils';

// Configure pdfjs-dist worker (required for v5.x)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 50000;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images

function isFileSizeValid(size: number, isImage = false): boolean {
    return size <= (isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE);
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
    const isImage = isImageFile(file.name);

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
