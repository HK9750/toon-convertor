// ToonDecoder - Parses TOON format back into standard JSON

import {
    JsonValue,
    ToonPrimitive,
    ToonDecodeOptions,
} from '../@types';

// Parses TOON format back to JSON (handles all formats: primitives, objects, arrays, delimiters)
export function toonToJson(toon: string, options: ToonDecodeOptions = {}): JsonValue {
    const decoder = new ToonDecoder(options);
    return decoder.decode(toon);
}

// Alias for toonToJson
export const decode = toonToJson;

// Decoder class that parses TOON using line-based parsing with indentation tracking
export class ToonDecoder {
    private strict: boolean;
    private lines: string[];
    private currentIndex: number;

    constructor(options: ToonDecodeOptions) {
        this.strict = options.strict || false;
        this.lines = [];
        this.currentIndex = 0;
    }

    // Main decode entry: splits into lines and parses from root
    decode(toon: string): JsonValue {
        if (!toon || !toon.trim()) {
            return null;
        }

        this.lines = toon.split('\n');
        this.currentIndex = 0;

        return this.parseValue(0);
    }

    // Parses value at current position (dispatches to object/array/primitive parser)
    private parseValue(expectedIndent: number): JsonValue {
        while (this.currentIndex < this.lines.length && !this.lines[this.currentIndex].trim()) {
            this.currentIndex++;
        }

        if (this.currentIndex >= this.lines.length) {
            return null;
        }

        const line = this.lines[this.currentIndex];
        const indent = this.getIndent(line);

        if (indent < expectedIndent) {
            return null;
        }

        const trimmed = line.trim();

        // Array header: [N]:, [N\t]:, [N|]:, [N]{fields}:
        const arrayMatch = trimmed.match(/^\[(\d+)([^\]]*)\](?:\{([^}]+)\})?:\s*(.*)$/);
        if (arrayMatch) {
            return this.parseArrayFromHeader(arrayMatch, expectedIndent + this.getIndentSize());
        }

        // Object or key-value pair
        if (trimmed.includes(':')) {
            return this.parseObject(expectedIndent);
        }

        return this.parsePrimitive(trimmed);
    }

    // Parses object from key-value lines at same indentation level
    private parseObject(expectedIndent: number): Record<string, JsonValue> {
        const result: Record<string, JsonValue> = {};

        while (this.currentIndex < this.lines.length) {
            const line = this.lines[this.currentIndex];

            if (!line.trim()) {
                this.currentIndex++;
                continue;
            }

            const indent = this.getIndent(line);

            if (indent < expectedIndent) {
                break;
            }

            if (indent === expectedIndent) {
                const parsed = this.parseKeyValueLine(line, expectedIndent);
                if (parsed) {
                    result[parsed.key] = parsed.value;
                }
            } else {
                break;
            }
        }

        return result;
    }

    // Parses a single key-value line (handles primitives, arrays, nested objects)
    private parseKeyValueLine(line: string, indent: number): { key: string; value: JsonValue } | null {
        const trimmed = line.trim();

        const match = trimmed.match(/^([^:]+?)(\[.*?\](?:\{.*?\})?)?:\s*(.*)$/);
        if (!match) {
            return null;
        }

        const [, rawKey, arrayPart, valuePart] = match;
        const key = this.parseKey(rawKey);

        // Array property
        if (arrayPart) {
            const arrayMatch = arrayPart.match(/^\[(\d+)([^\]]*)\](?:\{([^}]+)\})?$/);
            if (arrayMatch) {
                const value = this.parseArrayFromHeader(
                    [arrayPart, arrayMatch[1], arrayMatch[2], arrayMatch[3], valuePart],
                    indent + this.getIndentSize()
                );
                return { key, value };
            }
        }

        // Nested value on following lines
        if (!valuePart) {
            this.currentIndex++;
            const value = this.parseValue(indent + this.getIndentSize());
            return { key, value };
        }

        // Simple primitive value
        const value = this.parsePrimitive(valuePart);
        this.currentIndex++;
        return { key, value };
    }

    // Detects array format and routes to appropriate parser
    private parseArrayFromHeader(match: RegExpMatchArray, contentIndent: number): JsonValue[] {
        const [, countStr, delimiterPart, fieldsPart, valuePart] = match;
        const count = parseInt(countStr, 10);

        const delimiter = this.detectDelimiter(delimiterPart);

        // Empty array
        if (count === 0) {
            this.currentIndex++;
            return [];
        }

        // Inline: [3]: 1,2,3
        if (valuePart && valuePart.trim()) {
            this.currentIndex++;
            return this.parseInlineArray(valuePart, delimiter);
        }

        // Tabular: [2]{id,name}:
        if (fieldsPart) {
            this.currentIndex++;
            return this.parseTabularArray(count, fieldsPart, delimiter, contentIndent);
        }

        // Expanded list
        this.currentIndex++;
        return this.parseExpandedList(count, contentIndent);
    }

    // Parses inline array by splitting on delimiter
    private parseInlineArray(values: string, delimiter: string): JsonValue[] {
        const parts = values.split(delimiter);
        return parts.map(part => this.parsePrimitive(part.trim()));
    }

    // Parses tabular array: extracts field names, then parses each row as object
    private parseTabularArray(count: number, fieldsPart: string, delimiter: string, indent: number): JsonValue[] {
        const fields = fieldsPart.split(delimiter).map(f => this.parseKey(f.trim()));
        const result: Record<string, JsonValue>[] = [];

        for (let i = 0; i < count; i++) {
            while (this.currentIndex < this.lines.length && !this.lines[this.currentIndex].trim()) {
                this.currentIndex++;
            }

            if (this.currentIndex >= this.lines.length) {
                break;
            }

            const line = this.lines[this.currentIndex];
            const lineIndent = this.getIndent(line);

            if (lineIndent !== indent) {
                if (this.strict) {
                    throw new Error(`Expected indentation ${indent} but got ${lineIndent} at line ${this.currentIndex + 1}`);
                }
                break;
            }

            const values = line.trim().split(delimiter).map(v => this.parsePrimitive(v.trim()));
            const obj: Record<string, JsonValue> = {};

            for (let j = 0; j < fields.length; j++) {
                obj[fields[j]] = values[j] !== undefined ? values[j] : null;
            }

            result.push(obj);
            this.currentIndex++;
        }

        return result;
    }

    // Parses expanded list: each item starts with dash, can be primitive/object/array
    private parseExpandedList(count: number, indent: number): JsonValue[] {
        const result: JsonValue[] = [];

        for (let i = 0; i < count; i++) {
            while (this.currentIndex < this.lines.length && !this.lines[this.currentIndex].trim()) {
                this.currentIndex++;
            }

            if (this.currentIndex >= this.lines.length) {
                break;
            }

            const line = this.lines[this.currentIndex];
            const trimmed = line.trim();

            if (!trimmed.startsWith('-')) {
                if (this.strict) {
                    throw new Error(`Expected list item marker '-' at line ${this.currentIndex + 1}`);
                }
                break;
            }

            const afterDash = trimmed.substring(1).trim();

            if (!afterDash) {
                // Nested content on following lines
                this.currentIndex++;
                const value = this.parseValue(indent + this.getIndentSize());
                result.push(value || {});
            } else if (afterDash.startsWith('[')) {
                // Nested array
                const arrayMatch = afterDash.match(/^\[(\d+)([^\]]*)\](?:\{([^}]+)\})?:\s*(.*)$/);
                if (arrayMatch) {
                    this.currentIndex++;
                    const nested = this.parseArrayFromHeader(
                        [afterDash, arrayMatch[1], arrayMatch[2], arrayMatch[3], arrayMatch[4]],
                        indent + this.getIndentSize()
                    );
                    result.push(nested);
                } else {
                    this.currentIndex++;
                    result.push(this.parsePrimitive(afterDash));
                }
            } else {
                // Simple primitive
                this.currentIndex++;
                result.push(this.parsePrimitive(afterDash));
            }
        }

        return result;
    }

    // Parses primitive: null, true, false, numbers, quoted strings, unquoted strings
    private parsePrimitive(value: string): ToonPrimitive {
        const trimmed = value.trim();

        if (trimmed === 'null') return null;
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;

        // Number detection
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
            const num = Number(trimmed);
            if (!isNaN(num)) {
                return num;
            }
        }

        // Quoted string
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return this.unescapeString(trimmed.slice(1, -1));
        }

        return trimmed;
    }

    // Parses key (removes quotes if present)
    private parseKey(key: string): string {
        const trimmed = key.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return this.unescapeString(trimmed.slice(1, -1));
        }
        return trimmed;
    }

    // Converts escape sequences back to characters
    private unescapeString(str: string): string {
        return str
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
    }

    // Detects delimiter from array header
    private detectDelimiter(delimiterPart: string): string {
        if (delimiterPart === '\t') return '\t';
        if (delimiterPart === '|') return '|';
        return ',';
    }

    // Calculates indentation from leading whitespace
    private getIndent(line: string): number {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }

    // Returns standard indent size (2 spaces)
    private getIndentSize(): number {
        return 2;
    }
}
