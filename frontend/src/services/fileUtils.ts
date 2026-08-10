// 轻量纯函数模块：不依赖 pdfjs/mammoth，可安全静态导入
// 重依赖的解析逻辑（extractText）仍在 fileParser.ts 中，由调用方动态 import

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.json', '.csv', '.pdf', '.docx', '.doc'];
const SUPPORTED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

export function getFileExtension(filename: string): string {
    const idx = filename.lastIndexOf('.');
    return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

export function isSupportedFile(filename: string): boolean {
    const ext = getFileExtension(filename);
    return SUPPORTED_EXTENSIONS.includes(ext) || SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
}

export function isImageFile(filename: string): boolean {
    const ext = getFileExtension(filename);
    return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
}

export function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
