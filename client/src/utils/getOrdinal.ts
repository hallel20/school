export const getOrdinal = (n: number): string => {
    if (n <= 0) return n.toString(); // Handle non-positive numbers

    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100; // Look at the last two digits

    // Determine the suffix based on the last digit, with special cases for 11, 12, 13
    return n + (s[(v - 20) % 10] || s[v] || s[0] || 'th');
};
