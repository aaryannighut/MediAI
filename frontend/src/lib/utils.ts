export function formatConfidence(probability: number): string {
    const value = probability > 1 ? probability : probability * 100;
    return parseFloat(value.toFixed(1)).toString();
}
