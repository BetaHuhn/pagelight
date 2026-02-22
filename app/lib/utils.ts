export const ease = (p: number) => 1 - Math.pow(1 - Math.min(p, 1), 3);

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
