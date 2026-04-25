/**
 * Reads a File object and returns its base64 representation via callback.
 */
export function readFileAsBase64(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
}