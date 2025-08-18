// utils/formatter.js
export function formatData(dataString) {
    if (!dataString || typeof dataString !== 'string') return 'N/A';
    const parteData = dataString.split(' ')[0];
    if (parteData.length !== 8) return dataString;
    return `${parteData.substring(0, 2)}/${parteData.substring(2, 4)}/${parteData.substring(4, 8)}`;
}