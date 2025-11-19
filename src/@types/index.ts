// Type definitions for TOON (Token-Oriented Object Notation)

// Delimiter options: comma (default), tab (token-saving), or pipe (alternative)
export type ToonDelimiter = ',' | '\t' | '|';

// Configuration options for encoding JSON to TOON
export interface ToonEncodeOptions {
    delimiter?: ToonDelimiter;  // Character to separate array values (default: ',')
    indent?: string;             // String for indenting nested structures (default: '  ')
    keyFolding?: boolean;        // Experimental: flatten nested keys (not implemented)
}

// Configuration options for decoding TOON to JSON
export interface ToonDecodeOptions {
    strict?: boolean;  // When true, throws errors on invalid TOON; when false, attempts best-effort parsing
}

// Any valid JSON value: primitive, array, or object
export type JsonValue =
    | null
    | boolean
    | number
    | string
    | JsonValue[]
    | { [key: string]: JsonValue };

// Primitive types that can be written inline in TOON
export type ToonPrimitive = null | boolean | number | string;

// Type guard: checks if value is a primitive (null, boolean, number, or string)
export function isPrimitive(value: unknown): value is ToonPrimitive {
    return (
        value === null ||
        typeof value === 'boolean' ||
        typeof value === 'number' ||
        typeof value === 'string'
    );
}

// Type guard: checks if value is a plain object (not null or array)
export function isObject(value: unknown): value is Record<string, JsonValue> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Type guard: checks if value is an array
export function isArray(value: unknown): value is JsonValue[] {
    return Array.isArray(value);
}
