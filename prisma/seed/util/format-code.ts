export default function formatCode(inputString: string): string {
    return inputString.toUpperCase().replace(/[^A-Z0-9&]/g, "");
}
