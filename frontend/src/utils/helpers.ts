export const formatDate = (date: Date) => {
    return date.toLocaleDateString();
};

export const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
