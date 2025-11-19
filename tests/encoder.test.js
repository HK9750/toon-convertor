"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var index_1 = require("../src/index");
(0, vitest_1.describe)('Primitives', function () {
    (0, vitest_1.it)('should encode null', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)(null)).toBe('null');
    });
    (0, vitest_1.it)('should encode true', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)(true)).toBe('true');
    });
    (0, vitest_1.it)('should encode false', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)(false)).toBe('false');
    });
    (0, vitest_1.it)('should encode positive numbers', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)(42)).toBe('42');
        (0, vitest_1.expect)((0, index_1.jsonToToon)(3.14)).toBe('3.14');
    });
    (0, vitest_1.it)('should encode negative numbers', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)(-42)).toBe('-42');
        (0, vitest_1.expect)((0, index_1.jsonToToon)(-3.14)).toBe('-3.14');
    });
    (0, vitest_1.it)('should encode zero', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)(0)).toBe('0');
        (0, vitest_1.expect)((0, index_1.jsonToToon)(-0)).toBe('0'); // -0 is normalized to 0
    });
    (0, vitest_1.it)('should handle NaN and Infinity as null', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)(NaN)).toBe('null');
        (0, vitest_1.expect)((0, index_1.jsonToToon)(Infinity)).toBe('null');
        (0, vitest_1.expect)((0, index_1.jsonToToon)(-Infinity)).toBe('null');
    });
    (0, vitest_1.it)('should encode simple strings', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('hello')).toBe('hello');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('world')).toBe('world');
    });
    (0, vitest_1.it)('should encode strings with spaces (not at edges)', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('hello world')).toBe('hello world');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('foo bar baz')).toBe('foo bar baz');
    });
});
(0, vitest_1.describe)('String Quoting Rules', function () {
    (0, vitest_1.it)('should quote empty strings', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('')).toBe('""');
    });
    (0, vitest_1.it)('should quote strings with leading whitespace', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)(' hello')).toBe('" hello"');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('  test')).toBe('"  test"');
    });
    (0, vitest_1.it)('should quote strings with trailing whitespace', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('hello ')).toBe('"hello "');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('test  ')).toBe('"test  "');
    });
    (0, vitest_1.it)('should quote reserved words', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('true')).toBe('"true"');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('false')).toBe('"false"');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('null')).toBe('"null"');
    });
    (0, vitest_1.it)('should quote numeric strings', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('42')).toBe('"42"');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('-3.14')).toBe('"-3.14"');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('1e6')).toBe('"1e6"');
    });
    (0, vitest_1.it)('should quote strings with leading zeros', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('05')).toBe('"05"');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('007')).toBe('"007"');
    });
    (0, vitest_1.it)('should quote strings starting with dash', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('-')).toBe('"-"');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('- item')).toBe('"- item"');
    });
    (0, vitest_1.it)('should quote strings with special characters', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('key:value')).toBe('"key:value"');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('a"b')).toBe('"a\\"b"');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('path\\to\\file')).toBe('"path\\\\to\\\\file"');
    });
    (0, vitest_1.it)('should quote strings containing delimiters', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('a,b,c')).toBe('"a,b,c"');
    });
    (0, vitest_1.it)('should quote strings with control characters', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('line1\nline2')).toBe('"line1\\nline2"');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('tab\there')).toBe('"tab\\there"');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('return\rhere')).toBe('"return\\rhere"');
    });
});
(0, vitest_1.describe)('Unicode and Special Characters', function () {
    (0, vitest_1.it)('should handle unicode characters without quoting', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('hello 世界')).toBe('hello 世界');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('مرحبا')).toBe('مرحبا');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('Привет')).toBe('Привет');
    });
    (0, vitest_1.it)('should handle emojis without quoting', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('👋')).toBe('👋');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('🎉🎊')).toBe('🎉🎊');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('Hello 👋 World')).toBe('Hello 👋 World');
    });
    (0, vitest_1.it)('should handle mixed unicode and ascii', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)('café')).toBe('café');
        (0, vitest_1.expect)((0, index_1.jsonToToon)('naïve')).toBe('naïve');
    });
});
(0, vitest_1.describe)('Simple Objects', function () {
    (0, vitest_1.it)('should encode empty object', function () {
        (0, vitest_1.expect)((0, index_1.jsonToToon)({})).toBe('');
    });
    (0, vitest_1.it)('should encode object with primitives', function () {
        var result = (0, index_1.jsonToToon)({ name: 'Alice', age: 30 });
        (0, vitest_1.expect)(result).toBe('name: Alice\nage: 30');
    });
    (0, vitest_1.it)('should encode object with all primitive types', function () {
        var obj = {
            str: 'text',
            num: 42,
            bool: true,
            nullVal: null,
        };
        var result = (0, index_1.jsonToToon)(obj);
        (0, vitest_1.expect)(result).toContain('str: text');
        (0, vitest_1.expect)(result).toContain('num: 42');
        (0, vitest_1.expect)(result).toContain('bool: true');
        (0, vitest_1.expect)(result).toContain('nullVal: null');
    });
});
(0, vitest_1.describe)('Nested Objects', function () {
    (0, vitest_1.it)('should encode nested objects with indentation', function () {
        var obj = {
            user: {
                name: 'Bob',
                age: 25,
            },
        };
        var result = (0, index_1.jsonToToon)(obj);
        (0, vitest_1.expect)(result).toBe('user:\n  name: Bob\n  age: 25');
    });
    (0, vitest_1.it)('should encode deeply nested objects', function () {
        var obj = {
            level1: {
                level2: {
                    level3: {
                        value: 'deep',
                    },
                },
            },
        };
        var result = (0, index_1.jsonToToon)(obj);
        (0, vitest_1.expect)(result).toContain('level1:');
        (0, vitest_1.expect)(result).toContain('  level2:');
        (0, vitest_1.expect)(result).toContain('    level3:');
        (0, vitest_1.expect)(result).toContain('      value: deep');
    });
    (0, vitest_1.it)('should handle mixed nested and flat properties', function () {
        var obj = {
            id: 1,
            user: {
                name: 'Charlie',
            },
            active: true,
        };
        var result = (0, index_1.jsonToToon)(obj);
        (0, vitest_1.expect)(result).toContain('id: 1');
        (0, vitest_1.expect)(result).toContain('user:');
        (0, vitest_1.expect)(result).toContain('  name: Charlie');
        (0, vitest_1.expect)(result).toContain('active: true');
    });
});
(0, vitest_1.describe)('Primitive Arrays', function () {
    (0, vitest_1.it)('should encode empty arrays', function () {
        var result = (0, index_1.jsonToToon)({ items: [] });
        (0, vitest_1.expect)(result).toBe('items[0]:');
    });
    (0, vitest_1.it)('should encode arrays of numbers', function () {
        var result = (0, index_1.jsonToToon)({ nums: [1, 2, 3] });
        (0, vitest_1.expect)(result).toBe('nums[3]: 1,2,3');
    });
    (0, vitest_1.it)('should encode arrays of strings', function () {
        var result = (0, index_1.jsonToToon)({ tags: ['a', 'b', 'c'] });
        (0, vitest_1.expect)(result).toBe('tags[3]: a,b,c');
    });
    (0, vitest_1.it)('should encode arrays with mixed primitives', function () {
        var result = (0, index_1.jsonToToon)({ mixed: [1, 'two', true, null] });
        (0, vitest_1.expect)(result).toBe('mixed[4]: 1,two,true,null');
    });
    (0, vitest_1.it)('should quote strings in arrays when needed', function () {
        var result = (0, index_1.jsonToToon)({ items: ['normal', 'with spaces', 'true'] });
        // Internal spaces don't need quoting, only leading/trailing spaces do
        (0, vitest_1.expect)(result).toBe('items[3]: normal,with spaces,"true"');
    });
    (0, vitest_1.it)('should handle arrays with empty strings', function () {
        var result = (0, index_1.jsonToToon)({ items: ['a', '', 'b'] });
        (0, vitest_1.expect)(result).toBe('items[3]: a,"",b');
    });
});
(0, vitest_1.describe)('Tabular Arrays (Arrays of Objects)', function () {
    (0, vitest_1.it)('should encode uniform arrays as tables', function () {
        var data = {
            users: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
            ],
        };
        var result = (0, index_1.jsonToToon)(data);
        (0, vitest_1.expect)(result).toContain('users[2]{id,name}:');
        (0, vitest_1.expect)(result).toContain('1,Alice');
        (0, vitest_1.expect)(result).toContain('2,Bob');
    });
    (0, vitest_1.it)('should preserve field order from first object', function () {
        var data = {
            items: [
                { price: 10, sku: 'A1', qty: 2 },
                { qty: 1, price: 20, sku: 'B2' },
            ],
        };
        var result = (0, index_1.jsonToToon)(data);
        (0, vitest_1.expect)(result).toContain('{price,sku,qty}');
    });
    (0, vitest_1.it)('should handle tabular arrays with all primitive types', function () {
        var data = {
            records: [
                { id: 1, label: 'test', active: true, value: null },
                { id: 2, label: 'prod', active: false, value: null },
            ],
        };
        var result = (0, index_1.jsonToToon)(data);
        (0, vitest_1.expect)(result).toContain('records[2]{id,label,active,value}:');
        (0, vitest_1.expect)(result).toContain('1,test,true,null');
        (0, vitest_1.expect)(result).toContain('2,prod,false,null');
    });
    (0, vitest_1.it)('should quote field names when needed', function () {
        var data = {
            items: [
                { 'key:name': 'value1', count: 1 },
                { 'key:name': 'value2', count: 2 },
            ],
        };
        var result = (0, index_1.jsonToToon)(data);
        (0, vitest_1.expect)(result).toContain('"key:name"');
    });
    (0, vitest_1.it)('should handle values with internal spaces in tabular format', function () {
        var data = {
            users: [
                { name: 'Alice Smith', role: 'admin' },
                { name: 'Bob', role: 'user' },
            ],
        };
        var result = (0, index_1.jsonToToon)(data);
        // Internal spaces don't need quoting in TOON
        (0, vitest_1.expect)(result).toContain('Alice Smith');
        (0, vitest_1.expect)(result).toContain('Bob');
    });
});
(0, vitest_1.describe)('Mixed/Non-uniform Arrays', function () {
    (0, vitest_1.it)('should use inline format for primitive arrays', function () {
        var data = {
            items: [1, 'text', true],
        };
        var result = (0, index_1.jsonToToon)(data);
        // All primitives should use inline comma-separated format
        (0, vitest_1.expect)(result).toBe('items[3]: 1,text,true');
    });
    (0, vitest_1.it)('should use list format for arrays with objects and primitives', function () {
        var data = {
            items: [{ a: 1 }, 'text', 42],
        };
        var result = (0, index_1.jsonToToon)(data);
        (0, vitest_1.expect)(result).toContain('items[3]:');
        (0, vitest_1.expect)(result).toContain('-');
        (0, vitest_1.expect)(result).toContain('a: 1');
        (0, vitest_1.expect)(result).toContain('- text');
        (0, vitest_1.expect)(result).toContain('- 42');
    });
    (0, vitest_1.it)('should use list format for non-uniform objects', function () {
        var data = {
            items: [
                { a: 1, b: 2 },
                { a: 3, c: 4 }, // Different keys
            ],
        };
        var result = (0, index_1.jsonToToon)(data);
        (0, vitest_1.expect)(result).toContain('items[2]:');
        (0, vitest_1.expect)(result).toContain('-');
    });
    (0, vitest_1.it)('should use list format when objects have nested values', function () {
        var data = {
            items: [
                { id: 1, nested: { value: 'a' } },
                { id: 2, nested: { value: 'b' } },
            ],
        };
        var result = (0, index_1.jsonToToon)(data);
        (0, vitest_1.expect)(result).toContain('items[2]:');
        (0, vitest_1.expect)(result).toContain('-');
    });
});
(0, vitest_1.describe)('Arrays of Arrays', function () {
    (0, vitest_1.it)('should encode arrays of primitive arrays', function () {
        var data = {
            matrix: [[1, 2], [3, 4]],
        };
        var result = (0, index_1.jsonToToon)(data);
        (0, vitest_1.expect)(result).toContain('matrix[2]:');
        (0, vitest_1.expect)(result).toContain('- [2]: 1,2');
        (0, vitest_1.expect)(result).toContain('- [2]: 3,4');
    });
    (0, vitest_1.it)('should handle empty inner arrays', function () {
        var data = {
            arrays: [[], [1], []],
        };
        var result = (0, index_1.jsonToToon)(data);
        (0, vitest_1.expect)(result).toContain('arrays[3]:');
        (0, vitest_1.expect)(result).toContain('- [0]:');
        (0, vitest_1.expect)(result).toContain('- [1]: 1');
    });
});
(0, vitest_1.describe)('Delimiter Options', function () {
    (0, vitest_1.it)('should use tab delimiter when specified', function () {
        var data = {
            items: [
                { a: 1, b: 2 },
                { a: 3, b: 4 },
            ],
        };
        var result = (0, index_1.jsonToToon)(data, { delimiter: '\t' });
        (0, vitest_1.expect)(result).toContain('items[2\t]{a\tb}:');
        (0, vitest_1.expect)(result).toContain('1\t2');
        (0, vitest_1.expect)(result).toContain('3\t4');
    });
    (0, vitest_1.it)('should use pipe delimiter when specified', function () {
        var data = {
            items: [
                { a: 1, b: 2 },
                { a: 3, b: 4 },
            ],
        };
        var result = (0, index_1.jsonToToon)(data, { delimiter: '|' });
        (0, vitest_1.expect)(result).toContain('items[2|]{a|b}:');
        (0, vitest_1.expect)(result).toContain('1|2');
        (0, vitest_1.expect)(result).toContain('3|4');
    });
    (0, vitest_1.it)('should not quote commas when using tab delimiter', function () {
        var data = { tags: ['a,b', 'c,d'] };
        var result = (0, index_1.jsonToToon)(data, { delimiter: '\t' });
        (0, vitest_1.expect)(result).toBe('tags[2\t]: a,b\tc,d');
    });
    (0, vitest_1.it)('should not quote pipes when using comma delimiter', function () {
        var data = { tags: ['a|b', 'c|d'] };
        var result = (0, index_1.jsonToToon)(data, { delimiter: ',' });
        (0, vitest_1.expect)(result).toBe('tags[2]: a|b,c|d');
    });
});
(0, vitest_1.describe)('Custom Indentation', function () {
    (0, vitest_1.it)('should use custom indent string', function () {
        var data = {
            user: {
                name: 'Alice',
            },
        };
        var result = (0, index_1.jsonToToon)(data, { indent: '    ' });
        (0, vitest_1.expect)(result).toBe('user:\n    name: Alice');
    });
    (0, vitest_1.it)('should use tabs for indentation when specified', function () {
        var data = {
            user: {
                name: 'Bob',
            },
        };
        var result = (0, index_1.jsonToToon)(data, { indent: '\t' });
        (0, vitest_1.expect)(result).toBe('user:\n\tname: Bob');
    });
});
(0, vitest_1.describe)('Edge Cases and Boundary Conditions', function () {
    (0, vitest_1.it)('should handle very long strings', function () {
        var longString = 'a'.repeat(1000);
        var result = (0, index_1.jsonToToon)(longString);
        (0, vitest_1.expect)(result).toBe(longString);
    });
    (0, vitest_1.it)('should handle objects with many keys', function () {
        var obj = {};
        for (var i = 0; i < 100; i++) {
            obj["key".concat(i)] = i;
        }
        var result = (0, index_1.jsonToToon)(obj);
        (0, vitest_1.expect)(result).toContain('key0: 0');
        (0, vitest_1.expect)(result).toContain('key99: 99');
    });
    (0, vitest_1.it)('should handle arrays with many elements', function () {
        var arr = Array.from({ length: 100 }, function (_, i) { return i; });
        var result = (0, index_1.jsonToToon)({ nums: arr });
        (0, vitest_1.expect)(result).toContain('[100]:');
    });
    (0, vitest_1.it)('should handle very deeply nested structures', function () {
        var obj = { value: 'deep' };
        for (var i = 0; i < 10; i++) {
            obj = { nested: obj };
        }
        var result = (0, index_1.jsonToToon)(obj);
        (0, vitest_1.expect)(result).toContain('value: deep');
    });
    (0, vitest_1.it)('should handle objects with special key names', function () {
        var obj = {
            '': 'empty key', // Empty string as key
            '123': 'numeric key',
            'key with spaces': 'value',
            'key:with:colons': 'value',
        };
        var result = (0, index_1.jsonToToon)(obj);
        (0, vitest_1.expect)(result).toContain('""'); // Empty key is quoted
        (0, vitest_1.expect)(result).toContain('"123"'); // Numeric key is quoted
        (0, vitest_1.expect)(result).toContain('key with spaces'); // Internal spaces don't need quoting
        (0, vitest_1.expect)(result).toContain('"key:with:colons"'); // Colons need quoting
    });
    (0, vitest_1.it)('should handle scientific notation numbers', function () {
        var result = (0, index_1.jsonToToon)(1e6);
        (0, vitest_1.expect)(result).toBe('1000000');
    });
    (0, vitest_1.it)('should handle very small numbers', function () {
        var result = (0, index_1.jsonToToon)(0.000001);
        (0, vitest_1.expect)(result).toBe('0.000001');
    });
});
(0, vitest_1.describe)('Complex Real-world Examples', function () {
    (0, vitest_1.it)('should encode complex nested structure', function () {
        var data = {
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
        var result = (0, index_1.jsonToToon)(data);
        (0, vitest_1.expect)(result).toContain('metadata:');
        (0, vitest_1.expect)(result).toContain('users[2]{id,name,email}:');
        (0, vitest_1.expect)(result).toContain('settings:');
    });
    (0, vitest_1.it)('should handle configuration-like objects', function () {
        var config = {
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
        var result = (0, index_1.jsonToToon)(config);
        (0, vitest_1.expect)(result).toContain('database:');
        (0, vitest_1.expect)(result).toContain('credentials:');
        (0, vitest_1.expect)(result).toContain('features[3]:');
    });
});
(0, vitest_1.describe)('Aliases', function () {
    (0, vitest_1.it)('should have encode as alias for jsonToToon', function () {
        (0, vitest_1.expect)(index_1.encode).toBe(index_1.jsonToToon);
    });
    (0, vitest_1.it)('should have decode as alias for toonToJson', function () {
        (0, vitest_1.expect)(index_1.decode).toBe(index_1.toonToJson);
    });
});
(0, vitest_1.describe)('Type Safety', function () {
    (0, vitest_1.it)('should handle all valid JSON types', function () {
        var data = {
            null: null,
            boolean: true,
            number: 42,
            string: 'text',
            array: [1, 2, 3],
            object: { key: 'value' },
        };
        var result = (0, index_1.jsonToToon)(data);
        (0, vitest_1.expect)(result).toBeTruthy();
    });
});
