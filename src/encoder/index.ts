// ToonEncoder - Converts JSON to TOON (Token-Oriented Object Notation) format

import {
    JsonValue,
    ToonPrimitive,
    ToonEncodeOptions,
    ToonDelimiter,
    isPrimitive,
    isObject,
    isArray,
} from '../@types';

// Converts JSON to TOON format (removes quotes when safe, uses compact arrays, maintains readability)
export function jsonToToon(value: JsonValue, options: ToonEncodeOptions = {}): string {
    const opts = {
        delimiter: options.delimiter || ',',
        indent: options.indent || '  ',
        keyFolding: options.keyFolding || false,
    };

    const encoder = new ToonEncoder(opts);
    return encoder.encode(value, 0);
}

// Alias for jsonToToon
export const encode = jsonToToon;

// Encoder class that handles JSON → TOON conversion with optimal format selection
export class ToonEncoder {
    private delimiter: ToonDelimiter;
    private indent: string;
    private keyFolding: boolean;

    constructor(options: Required<ToonEncodeOptions>) {
        this.delimiter = options.delimiter;
        this.indent = options.indent;
        this.keyFolding = options.keyFolding;
    }

    // Routes value to appropriate encoder based on type
    encode(value: JsonValue, depth: number): string {
        if (isPrimitive(value)) {
            return this.encodePrimitive(value);
        }

        if (isArray(value)) {
            return this.encodeArray(value, depth, '');
        }

        if (isObject(value)) {
            return this.encodeObject(value, depth);
        }

        throw new Error(`Unsupported value type: ${typeof value}`);
    }

    // Encodes primitives with special handling for NaN, Infinity, and -0
    private encodePrimitive(value: ToonPrimitive): string {
        if (value === null) return 'null';
        if (typeof value === 'boolean') return value.toString();
        if (typeof value === 'number') {
            if (!Number.isFinite(value)) return 'null';  // NaN/Infinity → null
            if (Object.is(value, -0)) return '0';         // -0 → 0
            return value.toString();
        }
        return this.encodeString(value);
    }

    // Encodes strings, adding quotes only when necessary (saves tokens!)
    private encodeString(str: string): string {
        if (this.needsQuoting(str)) {
            return `"${this.escapeString(str)}"`;
        }
        return str;
    }

    // Checks if string needs quotes (empty, whitespace edges, reserved words, looks like number, special chars)
    private needsQuoting(str: string): boolean {
        if (str.length === 0) return true;
        if (str !== str.trim()) return true;
        if (str === 'true' || str === 'false' || str === 'null') return true;
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(str)) return true;
        if (/^0\d/.test(str)) return true;
        if (str === '-' || str.startsWith('- ')) return true;
        if (/[:"\\[\]{}]/.test(str)) return true;
        if (/[\n\r\t]/.test(str)) return true;
        if (str.includes(this.delimiter)) return true;
        return false;
    }

    // Escapes special characters: \\, \", \n, \r, \t
    private escapeString(str: string): string {
        return str
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }

    // Encodes objects as indented key-value pairs
    private encodeObject(obj: Record<string, JsonValue>, depth: number): string {
        const entries = Object.entries(obj);
        if (entries.length === 0) {
            return '';
        }

        const lines: string[] = [];
        const indentation = this.indent.repeat(depth);

        for (const [key, value] of entries) {
            const encodedKey = this.encodeKey(key);

            if (isPrimitive(value)) {
                lines.push(`${indentation}${encodedKey}: ${this.encodePrimitive(value)}`);
            } else if (isArray(value)) {
                const arrayContent = this.encodeArray(value, depth + 1, encodedKey);
                if (arrayContent) {
                    lines.push(`${indentation}${arrayContent}`);
                } else {
                    lines.push(`${indentation}${encodedKey}[0]:`);
                }
            } else if (isObject(value)) {
                lines.push(`${indentation}${encodedKey}:`);
                const nestedContent = this.encodeObject(value, depth + 1);
                if (nestedContent) {
                    lines.push(nestedContent);
                }
            }
        }

        return lines.join('\n');
    }

    // Encodes keys with same quoting rules as strings
    private encodeKey(key: string): string {
        if (this.needsQuoting(key)) {
            return `"${this.escapeString(key)}"`;
        }
        return key;
    }

    // Selects best array format: inline (primitives), tabular (uniform objects), or expanded (mixed)
    private encodeArray(arr: JsonValue[], depth: number, keyPrefix: string): string {
        const length = arr.length;

        if (length === 0) {
            return `${keyPrefix}[0]:`;
        }

        // Inline format for all primitives: nums[3]: 1,2,3
        if (arr.every(isPrimitive)) {
            const delimiterChar = this.getDelimiterChar();
            const values = arr.map((v) => this.encodePrimitive(v as ToonPrimitive)).join(delimiterChar);
            return `${keyPrefix}[${length}${this.getDelimiterHeader()}]: ${values}`;
        }

        // Tabular format for uniform objects: users[2]{id,name}: ...
        if (this.canUseTabular(arr)) {
            return this.encodeTabular(arr as Record<string, ToonPrimitive>[], depth, keyPrefix);
        }

        // Expanded list for mixed content
        return this.encodeExpandedList(arr, depth, keyPrefix);
    }

    // Checks if array qualifies for tabular format (all objects, same keys, all primitive values)
    private canUseTabular(arr: JsonValue[]): boolean {
        if (!arr.every(isObject)) return false;

        const objects = arr as Record<string, JsonValue>[];
        if (objects.length === 0) return false;

        const firstKeys = new Set(Object.keys(objects[0]));

        return objects.every((obj) => {
            const keys = Object.keys(obj);
            if (keys.length !== firstKeys.size) return false;
            if (!keys.every((k) => firstKeys.has(k))) return false;
            return Object.values(obj).every(isPrimitive);
        });
    }

    // Encodes uniform objects as compact table with header and rows
    private encodeTabular(
        arr: Record<string, ToonPrimitive>[],
        depth: number,
        keyPrefix: string
    ): string {
        const fields = Object.keys(arr[0]);
        const delimiterChar = this.getDelimiterChar();
        const delimiterHeader = this.getDelimiterHeader();

        const fieldList = fields.map((f) => this.encodeKey(f)).join(delimiterChar);
        const header = `${keyPrefix}[${arr.length}${delimiterHeader}]{${fieldList}}:`;

        const indentation = this.indent.repeat(depth);
        const rows = arr.map(
            (obj) =>
                indentation +
                fields
                    .map((field) => this.encodePrimitive(obj[field] as ToonPrimitive))
                    .join(delimiterChar)
        );

        return [header, ...rows].join('\n');
    }

    // Encodes mixed arrays with dash markers (YAML-style)
    private encodeExpandedList(arr: JsonValue[], depth: number, keyPrefix: string): string {
        const delimiterHeader = this.getDelimiterHeader();
        const header = `${keyPrefix}[${arr.length}${delimiterHeader}]:`;
        const indentation = this.indent.repeat(depth);

        const items: string[] = [header];

        for (const item of arr) {
            if (isPrimitive(item)) {
                items.push(`${indentation}- ${this.encodePrimitive(item)}`);
            } else if (isArray(item)) {
                const arrayContent = this.encodeArray(item, depth + 1, '');
                items.push(`${indentation}- ${arrayContent}`);
            } else if (isObject(item)) {
                items.push(`${indentation}-`);
                const objContent = this.encodeObject(item, depth + 1);
                if (objContent) {
                    items.push(objContent);
                }
            }
        }

        return items.join('\n');
    }

    // Returns the delimiter character
    private getDelimiterChar(): string {
        return this.delimiter;
    }

    // Returns delimiter marker for headers (tab/pipe explicit, comma omitted as default)
    private getDelimiterHeader(): string {
        if (this.delimiter === '\t') return '\t';
        if (this.delimiter === '|') return '|';
        return '';
    }
}
