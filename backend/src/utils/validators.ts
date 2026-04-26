exports.isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
exports.isNotEmpty = (val: string) => val && val.trim().length > 0;
