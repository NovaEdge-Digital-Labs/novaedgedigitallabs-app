exports.generateId = () => Math.random().toString(36).substr(2, 9);
exports.formatResponse = (data, message = 'Success') => ({ success: true, message, data });
