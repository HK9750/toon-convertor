"use strict";
// ToonEncoder - Converts JSON to TOON (Token-Oriented Object Notation) format
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToonEncoder = exports.encode = void 0;
exports.jsonToToon = jsonToToon;
var _types_1 = require("../@types");
// Converts JSON to TOON format (removes quotes when safe, uses compact arrays, maintains readability)
function jsonToToon(value, options) {
    if (options === void 0) { options = {}; }
    var opts = {
        delimiter: options.delimiter || ',',
        indent: options.indent || '  ',
        keyFolding: options.keyFolding || false,
    };
    var encoder = new ToonEncoder(opts);
    return encoder.encode(value, 0);
}
// Alias for jsonToToon
exports.encode = jsonToToon;
// Encoder class that handles JSON → TOON conversion with optimal format selection
var ToonEncoder = /** @class */ (function () {
    function ToonEncoder(options) {
        this.delimiter = options.delimiter;
        this.indent = options.indent;
        this.keyFolding = options.keyFolding;
    }
    // Routes value to appropriate encoder based on type
    ToonEncoder.prototype.encode = function (value, depth) {
        if ((0, _types_1.isPrimitive)(value)) {
            return this.encodePrimitive(value);
        }
        if ((0, _types_1.isArray)(value)) {
            return this.encodeArray(value, depth, '');
        }
        if ((0, _types_1.isObject)(value)) {
            return this.encodeObject(value, depth);
        }
        throw new Error("Unsupported value type: ".concat(typeof value));
    };
    // Encodes primitives with special handling for NaN, Infinity, and -0
    ToonEncoder.prototype.encodePrimitive = function (value) {
        if (value === null)
            return 'null';
        if (typeof value === 'boolean')
            return value.toString();
        if (typeof value === 'number') {
            if (!Number.isFinite(value))
                return 'null'; // NaN/Infinity → null
            if (Object.is(value, -0))
                return '0'; // -0 → 0
            return value.toString();
        }
        return this.encodeString(value);
    };
    // Encodes strings, adding quotes only when necessary (saves tokens!)
    ToonEncoder.prototype.encodeString = function (str) {
        if (this.needsQuoting(str)) {
            return "\"".concat(this.escapeString(str), "\"");
        }
        return str;
    };
    // Checks if string needs quotes (empty, whitespace edges, reserved words, looks like number, special chars)
    ToonEncoder.prototype.needsQuoting = function (str) {
        if (str.length === 0)
            return true;
        if (str !== str.trim())
            return true;
        if (str === 'true' || str === 'false' || str === 'null')
            return true;
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(str))
            return true;
        if (/^0\d/.test(str))
            return true;
        if (str === '-' || str.startsWith('- '))
            return true;
        if (/[:"\\[\]{}]/.test(str))
            return true;
        if (/[\n\r\t]/.test(str))
            return true;
        if (str.includes(this.delimiter))
            return true;
        return false;
    };
    // Escapes special characters: \\, \", \n, \r, \t
    ToonEncoder.prototype.escapeString = function (str) {
        return str
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    };
    // Encodes objects as indented key-value pairs
    ToonEncoder.prototype.encodeObject = function (obj, depth) {
        var entries = Object.entries(obj);
        if (entries.length === 0) {
            return '';
        }
        var lines = [];
        var indentation = this.indent.repeat(depth);
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var _a = entries_1[_i], key = _a[0], value = _a[1];
            var encodedKey = this.encodeKey(key);
            if ((0, _types_1.isPrimitive)(value)) {
                lines.push("".concat(indentation).concat(encodedKey, ": ").concat(this.encodePrimitive(value)));
            }
            else if ((0, _types_1.isArray)(value)) {
                var arrayContent = this.encodeArray(value, depth + 1, encodedKey);
                if (arrayContent) {
                    lines.push("".concat(indentation).concat(arrayContent));
                }
                else {
                    lines.push("".concat(indentation).concat(encodedKey, "[0]:"));
                }
            }
            else if ((0, _types_1.isObject)(value)) {
                lines.push("".concat(indentation).concat(encodedKey, ":"));
                var nestedContent = this.encodeObject(value, depth + 1);
                if (nestedContent) {
                    lines.push(nestedContent);
                }
            }
        }
        return lines.join('\n');
    };
    // Encodes keys with same quoting rules as strings
    ToonEncoder.prototype.encodeKey = function (key) {
        if (this.needsQuoting(key)) {
            return "\"".concat(this.escapeString(key), "\"");
        }
        return key;
    };
    // Selects best array format: inline (primitives), tabular (uniform objects), or expanded (mixed)
    ToonEncoder.prototype.encodeArray = function (arr, depth, keyPrefix) {
        var _this = this;
        var length = arr.length;
        if (length === 0) {
            return "".concat(keyPrefix, "[0]:");
        }
        // Inline format for all primitives: nums[3]: 1,2,3
        if (arr.every(_types_1.isPrimitive)) {
            var delimiterChar = this.getDelimiterChar();
            var values = arr.map(function (v) { return _this.encodePrimitive(v); }).join(delimiterChar);
            return "".concat(keyPrefix, "[").concat(length).concat(this.getDelimiterHeader(), "]: ").concat(values);
        }
        // Tabular format for uniform objects: users[2]{id,name}: ...
        if (this.canUseTabular(arr)) {
            return this.encodeTabular(arr, depth, keyPrefix);
        }
        // Expanded list for mixed content
        return this.encodeExpandedList(arr, depth, keyPrefix);
    };
    // Checks if array qualifies for tabular format (all objects, same keys, all primitive values)
    ToonEncoder.prototype.canUseTabular = function (arr) {
        if (!arr.every(_types_1.isObject))
            return false;
        var objects = arr;
        if (objects.length === 0)
            return false;
        var firstKeys = new Set(Object.keys(objects[0]));
        return objects.every(function (obj) {
            var keys = Object.keys(obj);
            if (keys.length !== firstKeys.size)
                return false;
            if (!keys.every(function (k) { return firstKeys.has(k); }))
                return false;
            return Object.values(obj).every(_types_1.isPrimitive);
        });
    };
    // Encodes uniform objects as compact table with header and rows
    ToonEncoder.prototype.encodeTabular = function (arr, depth, keyPrefix) {
        var _this = this;
        var fields = Object.keys(arr[0]);
        var delimiterChar = this.getDelimiterChar();
        var delimiterHeader = this.getDelimiterHeader();
        var fieldList = fields.map(function (f) { return _this.encodeKey(f); }).join(delimiterChar);
        var header = "".concat(keyPrefix, "[").concat(arr.length).concat(delimiterHeader, "]{").concat(fieldList, "}:");
        var indentation = this.indent.repeat(depth);
        var rows = arr.map(function (obj) {
            return indentation +
                fields
                    .map(function (field) { return _this.encodePrimitive(obj[field]); })
                    .join(delimiterChar);
        });
        return __spreadArray([header], rows, true).join('\n');
    };
    // Encodes mixed arrays with dash markers (YAML-style)
    ToonEncoder.prototype.encodeExpandedList = function (arr, depth, keyPrefix) {
        var delimiterHeader = this.getDelimiterHeader();
        var header = "".concat(keyPrefix, "[").concat(arr.length).concat(delimiterHeader, "]:");
        var indentation = this.indent.repeat(depth);
        var items = [header];
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var item = arr_1[_i];
            if ((0, _types_1.isPrimitive)(item)) {
                items.push("".concat(indentation, "- ").concat(this.encodePrimitive(item)));
            }
            else if ((0, _types_1.isArray)(item)) {
                var arrayContent = this.encodeArray(item, depth + 1, '');
                items.push("".concat(indentation, "- ").concat(arrayContent));
            }
            else if ((0, _types_1.isObject)(item)) {
                items.push("".concat(indentation, "-"));
                var objContent = this.encodeObject(item, depth + 1);
                if (objContent) {
                    items.push(objContent);
                }
            }
        }
        return items.join('\n');
    };
    // Returns the delimiter character
    ToonEncoder.prototype.getDelimiterChar = function () {
        return this.delimiter;
    };
    // Returns delimiter marker for headers (tab/pipe explicit, comma omitted as default)
    ToonEncoder.prototype.getDelimiterHeader = function () {
        if (this.delimiter === '\t')
            return '\t';
        if (this.delimiter === '|')
            return '|';
        return '';
    };
    return ToonEncoder;
}());
exports.ToonEncoder = ToonEncoder;
