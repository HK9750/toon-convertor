"use strict";
// Type definitions for TOON (Token-Oriented Object Notation)
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrimitive = isPrimitive;
exports.isObject = isObject;
exports.isArray = isArray;
// Type guard: checks if value is a primitive (null, boolean, number, or string)
function isPrimitive(value) {
    return (value === null ||
        typeof value === 'boolean' ||
        typeof value === 'number' ||
        typeof value === 'string');
}
// Type guard: checks if value is a plain object (not null or array)
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
// Type guard: checks if value is an array
function isArray(value) {
    return Array.isArray(value);
}
