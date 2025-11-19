import { describe, it, expect } from 'vitest';
import { jsonToToon, toonToJson, encode, decode } from '../src/index';

describe('Primitives', () => {
    it('should encode null', () => {
        expect(jsonToToon(null)).toBe('null');
    });

    it('should encode true', () => {
        expect(jsonToToon(true)).toBe('true');
    });

    it('should encode false', () => {
        expect(jsonToToon(false)).toBe('false');
    });

    it('should encode positive numbers', () => {
        expect(jsonToToon(42)).toBe('42');
        expect(jsonToToon(3.14)).toBe('3.14');
    });

    it('should encode negative numbers', () => {
        expect(jsonToToon(-42)).toBe('-42');
        expect(jsonToToon(-3.14)).toBe('-3.14');
    });

    it('should encode zero', () => {
        expect(jsonToToon(0)).toBe('0');
        expect(jsonToToon(-0)).toBe('0'); // -0 is normalized to 0
    });

    it('should handle NaN and Infinity as null', () => {
        expect(jsonToToon(NaN)).toBe('null');
        expect(jsonToToon(Infinity)).toBe('null');
        expect(jsonToToon(-Infinity)).toBe('null');
    });

    it('should encode simple strings', () => {
        expect(jsonToToon('hello')).toBe('hello');
        expect(jsonToToon('world')).toBe('world');
    });

    it('should encode strings with spaces (not at edges)', () => {
        expect(jsonToToon('hello world')).toBe('hello world');
        expect(jsonToToon('foo bar baz')).toBe('foo bar baz');
    });
});

describe('String Quoting Rules', () => {
    it('should quote empty strings', () => {
        expect(jsonToToon('')).toBe('""');
    });

    it('should quote strings with leading whitespace', () => {
        expect(jsonToToon(' hello')).toBe('" hello"');
        expect(jsonToToon('  test')).toBe('"  test"');
    });

    it('should quote strings with trailing whitespace', () => {
        expect(jsonToToon('hello ')).toBe('"hello "');
        expect(jsonToToon('test  ')).toBe('"test  "');
    });

    it('should quote reserved words', () => {
        expect(jsonToToon('true')).toBe('"true"');
        expect(jsonToToon('false')).toBe('"false"');
        expect(jsonToToon('null')).toBe('"null"');
    });

    it('should quote numeric strings', () => {
        expect(jsonToToon('42')).toBe('"42"');
        expect(jsonToToon('-3.14')).toBe('"-3.14"');
        expect(jsonToToon('1e6')).toBe('"1e6"');
    });

    it('should quote strings with leading zeros', () => {
        expect(jsonToToon('05')).toBe('"05"');
        expect(jsonToToon('007')).toBe('"007"');
    });

    it('should quote strings starting with dash', () => {
        expect(jsonToToon('-')).toBe('"-"');
        expect(jsonToToon('- item')).toBe('"- item"');
    });

    it('should quote strings with special characters', () => {
        expect(jsonToToon('key:value')).toBe('"key:value"');
        expect(jsonToToon('a"b')).toBe('"a\\"b"');
        expect(jsonToToon('path\\to\\file')).toBe('"path\\\\to\\\\file"');
    });

    it('should quote strings containing delimiters', () => {
        expect(jsonToToon('a,b,c')).toBe('"a,b,c"');
    });

    it('should quote strings with control characters', () => {
        expect(jsonToToon('line1\nline2')).toBe('"line1\\nline2"');
        expect(jsonToToon('tab\there')).toBe('"tab\\there"');
        expect(jsonToToon('return\rhere')).toBe('"return\\rhere"');
    });
});

describe('Unicode and Special Characters', () => {
    it('should handle unicode characters without quoting', () => {
        expect(jsonToToon('hello 世界')).toBe('hello 世界');
        expect(jsonToToon('مرحبا')).toBe('مرحبا');
        expect(jsonToToon('Привет')).toBe('Привет');
    });

    it('should handle emojis without quoting', () => {
        expect(jsonToToon('👋')).toBe('👋');
        expect(jsonToToon('🎉🎊')).toBe('🎉🎊');
        expect(jsonToToon('Hello 👋 World')).toBe('Hello 👋 World');
    });

    it('should handle mixed unicode and ascii', () => {
        expect(jsonToToon('café')).toBe('café');
        expect(jsonToToon('naïve')).toBe('naïve');
    });
});

describe('Simple Objects', () => {
    it('should encode empty object', () => {
        expect(jsonToToon({})).toBe('');
    });

    it('should encode object with primitives', () => {
        const result = jsonToToon({ name: 'Alice', age: 30 });
        expect(result).toBe('name: Alice\nage: 30');
    });

    it('should encode object with all primitive types', () => {
        const obj = {
            str: 'text',
            num: 42,
            bool: true,
            nullVal: null,
        };
        const result = jsonToToon(obj);
        expect(result).toContain('str: text');
        expect(result).toContain('num: 42');
        expect(result).toContain('bool: true');
        expect(result).toContain('nullVal: null');
    });
});

describe('Nested Objects', () => {
    it('should encode nested objects with indentation', () => {
        const obj = {
            user: {
                name: 'Bob',
                age: 25,
            },
        };
        const result = jsonToToon(obj);
        expect(result).toBe('user:\n  name: Bob\n  age: 25');
    });

    it('should encode deeply nested objects', () => {
        const obj = {
            level1: {
                level2: {
                    level3: {
                        value: 'deep',
                    },
                },
            },
        };
        const result = jsonToToon(obj);
        expect(result).toContain('level1:');
        expect(result).toContain('  level2:');
        expect(result).toContain('    level3:');
        expect(result).toContain('      value: deep');
    });

    it('should handle mixed nested and flat properties', () => {
        const obj = {
            id: 1,
            user: {
                name: 'Charlie',
            },
            active: true,
        };
        const result = jsonToToon(obj);
        expect(result).toContain('id: 1');
        expect(result).toContain('user:');
        expect(result).toContain('  name: Charlie');
        expect(result).toContain('active: true');
    });
});

describe('Primitive Arrays', () => {
    it('should encode empty arrays', () => {
        const result = jsonToToon({ items: [] });
        expect(result).toBe('items[0]:');
    });

    it('should encode arrays of numbers', () => {
        const result = jsonToToon({ nums: [1, 2, 3] });
        expect(result).toBe('nums[3]: 1,2,3');
    });

    it('should encode arrays of strings', () => {
        const result = jsonToToon({ tags: ['a', 'b', 'c'] });
        expect(result).toBe('tags[3]: a,b,c');
    });

    it('should encode arrays with mixed primitives', () => {
        const result = jsonToToon({ mixed: [1, 'two', true, null] });
        expect(result).toBe('mixed[4]: 1,two,true,null');
    });

    it('should quote strings in arrays when needed', () => {
        const result = jsonToToon({ items: ['normal', 'with spaces', 'true'] });
        // Internal spaces don't need quoting, only leading/trailing spaces do
        expect(result).toBe('items[3]: normal,with spaces,"true"');
    });

    it('should handle arrays with empty strings', () => {
        const result = jsonToToon({ items: ['a', '', 'b'] });
        expect(result).toBe('items[3]: a,"",b');
    });
});

describe('Tabular Arrays (Arrays of Objects)', () => {
    it('should encode uniform arrays as tables', () => {
        const data = {
            users: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
            ],
        };
        const result = jsonToToon(data);
        expect(result).toContain('users[2]{id,name}:');
        expect(result).toContain('1,Alice');
        expect(result).toContain('2,Bob');
    });

    it('should preserve field order from first object', () => {
        const data = {
            items: [
                { price: 10, sku: 'A1', qty: 2 },
                { qty: 1, price: 20, sku: 'B2' },
            ],
        };
        const result = jsonToToon(data);
        expect(result).toContain('{price,sku,qty}');
    });

    it('should handle tabular arrays with all primitive types', () => {
        const data = {
            records: [
                { id: 1, label: 'test', active: true, value: null },
                { id: 2, label: 'prod', active: false, value: null },
            ],
        };
        const result = jsonToToon(data);
        expect(result).toContain('records[2]{id,label,active,value}:');
        expect(result).toContain('1,test,true,null');
        expect(result).toContain('2,prod,false,null');
    });

    it('should quote field names when needed', () => {
        const data = {
            items: [
                { 'key:name': 'value1', count: 1 },
                { 'key:name': 'value2', count: 2 },
            ],
        };
        const result = jsonToToon(data);
        expect(result).toContain('"key:name"');
    });

    it('should handle values with internal spaces in tabular format', () => {
        const data = {
            users: [
                { name: 'Alice Smith', role: 'admin' },
                { name: 'Bob', role: 'user' },
            ],
        };
        const result = jsonToToon(data);
        // Internal spaces don't need quoting in TOON
        expect(result).toContain('Alice Smith');
        expect(result).toContain('Bob');
    });
});

describe('Mixed/Non-uniform Arrays', () => {
    it('should use inline format for primitive arrays', () => {
        const data = {
            items: [1, 'text', true],
        };
        const result = jsonToToon(data);
        // All primitives should use inline comma-separated format
        expect(result).toBe('items[3]: 1,text,true');
    });

    it('should use list format for arrays with objects and primitives', () => {
        const data = {
            items: [{ a: 1 }, 'text', 42],
        };
        const result = jsonToToon(data);
        expect(result).toContain('items[3]:');
        expect(result).toContain('-');
        expect(result).toContain('a: 1');
        expect(result).toContain('- text');
        expect(result).toContain('- 42');
    });

    it('should use list format for non-uniform objects', () => {
        const data: { items: Array<{ a: number; b?: number; c?: number }> } = {
            items: [
                { a: 1, b: 2 },
                { a: 3, c: 4 }, // Different keys
            ],
        };
        const result = jsonToToon(data);
        expect(result).toContain('items[2]:');
        expect(result).toContain('-');
    });

    it('should use list format when objects have nested values', () => {
        const data = {
            items: [
                { id: 1, nested: { value: 'a' } },
                { id: 2, nested: { value: 'b' } },
            ],
        };
        const result = jsonToToon(data);
        expect(result).toContain('items[2]:');
        expect(result).toContain('-');
    });
});

describe('Arrays of Arrays', () => {
    it('should encode arrays of primitive arrays', () => {
        const data = {
            matrix: [[1, 2], [3, 4]],
        };
        const result = jsonToToon(data);
        expect(result).toContain('matrix[2]:');
        expect(result).toContain('- [2]: 1,2');
        expect(result).toContain('- [2]: 3,4');
    });

    it('should handle empty inner arrays', () => {
        const data = {
            arrays: [[], [1], []],
        };
        const result = jsonToToon(data);
        expect(result).toContain('arrays[3]:');
        expect(result).toContain('- [0]:');
        expect(result).toContain('- [1]: 1');
    });
});

describe('Delimiter Options', () => {
    it('should use tab delimiter when specified', () => {
        const data = {
            items: [
                { a: 1, b: 2 },
                { a: 3, b: 4 },
            ],
        };
        const result = jsonToToon(data, { delimiter: '\t' });
        expect(result).toContain('items[2\t]{a\tb}:');
        expect(result).toContain('1\t2');
        expect(result).toContain('3\t4');
    });

    it('should use pipe delimiter when specified', () => {
        const data = {
            items: [
                { a: 1, b: 2 },
                { a: 3, b: 4 },
            ],
        };
        const result = jsonToToon(data, { delimiter: '|' });
        expect(result).toContain('items[2|]{a|b}:');
        expect(result).toContain('1|2');
        expect(result).toContain('3|4');
    });

    it('should not quote commas when using tab delimiter', () => {
        const data = { tags: ['a,b', 'c,d'] };
        const result = jsonToToon(data, { delimiter: '\t' });
        expect(result).toBe('tags[2\t]: a,b\tc,d');
    });

    it('should not quote pipes when using comma delimiter', () => {
        const data = { tags: ['a|b', 'c|d'] };
        const result = jsonToToon(data, { delimiter: ',' });
        expect(result).toBe('tags[2]: a|b,c|d');
    });
});

describe('Custom Indentation', () => {
    it('should use custom indent string', () => {
        const data = {
            user: {
                name: 'Alice',
            },
        };
        const result = jsonToToon(data, { indent: '    ' });
        expect(result).toBe('user:\n    name: Alice');
    });

    it('should use tabs for indentation when specified', () => {
        const data = {
            user: {
                name: 'Bob',
            },
        };
        const result = jsonToToon(data, { indent: '\t' });
        expect(result).toBe('user:\n\tname: Bob');
    });
});

describe('Edge Cases and Boundary Conditions', () => {
    it('should handle very long strings', () => {
        const longString = 'a'.repeat(1000);
        const result = jsonToToon(longString);
        expect(result).toBe(longString);
    });

    it('should handle objects with many keys', () => {
        const obj: Record<string, number> = {};
        for (let i = 0; i < 100; i++) {
            obj[`key${i}`] = i;
        }
        const result = jsonToToon(obj);
        expect(result).toContain('key0: 0');
        expect(result).toContain('key99: 99');
    });

    it('should handle arrays with many elements', () => {
        const arr = Array.from({ length: 100 }, (_, i) => i);
        const result = jsonToToon({ nums: arr });
        expect(result).toContain('[100]:');
    });

    it('should handle very deeply nested structures', () => {
        let obj: any = { value: 'deep' };
        for (let i = 0; i < 10; i++) {
            obj = { nested: obj };
        }
        const result = jsonToToon(obj);
        expect(result).toContain('value: deep');
    });

    it('should handle objects with special key names', () => {
        const obj = {
            '': 'empty key', // Empty string as key
            '123': 'numeric key',
            'key with spaces': 'value',
            'key:with:colons': 'value',
        };
        const result = jsonToToon(obj);
        expect(result).toContain('""'); // Empty key is quoted
        expect(result).toContain('"123"'); // Numeric key is quoted
        expect(result).toContain('key with spaces'); // Internal spaces don't need quoting
        expect(result).toContain('"key:with:colons"'); // Colons need quoting
    });

    it('should handle scientific notation numbers', () => {
        const result = jsonToToon(1e6);
        expect(result).toBe('1000000');
    });

    it('should handle very small numbers', () => {
        const result = jsonToToon(0.000001);
        expect(result).toBe('0.000001');
    });
});

describe('Complex Real-world Examples', () => {
    it('should encode complex nested structure', () => {
        const data = {
            metadata: {
                version: '1.0',
                timestamp: '2025-01-01T00:00:00Z',
            },
            users: [
                { id: 1, name: 'Alice', email: 'alice@example.com' },
                { id: 2, name: 'Bob', email: 'bob@example.com' },
            ],
            settings: {
                theme: 'dark',
                notifications: true,
            },
        };
        const result = jsonToToon(data);
        expect(result).toContain('metadata:');
        expect(result).toContain('users[2]{id,name,email}:');
        expect(result).toContain('settings:');
    });

    it('should handle configuration-like objects', () => {
        const config = {
            database: {
                host: 'localhost',
                port: 5432,
                credentials: {
                    username: 'admin',
                    password: 'secret123',
                },
            },
            features: ['auth', 'api', 'cache'],
            debug: true,
        };
        const result = jsonToToon(config);
        expect(result).toContain('database:');
        expect(result).toContain('credentials:');
        expect(result).toContain('features[3]:');
    });
});

describe('Aliases', () => {
    it('should have encode as alias for jsonToToon', () => {
        expect(encode).toBe(jsonToToon);
    });

    it('should have decode as alias for toonToJson', () => {
        expect(decode).toBe(toonToJson);
    });
});

describe('Type Safety', () => {
    it('should handle all valid JSON types', () => {
        const data: any = {
            null: null,
            boolean: true,
            number: 42,
            string: 'text',
            array: [1, 2, 3],
            object: { key: 'value' },
        };
        const result = jsonToToon(data);
        expect(result).toBeTruthy();
    });
});
