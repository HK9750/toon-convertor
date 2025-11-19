"use strict";
// ToonDecoder - Parses TOON format back into standard JSON
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToonDecoder = exports.decode = void 0;
exports.toonToJson = toonToJson;
// Parses TOON format back to JSON (handles all formats: primitives, objects, arrays, delimiters)
function toonToJson(toon, options) {
    if (options === void 0) { options = {}; }
    var decoder = new ToonDecoder(options);
    return decoder.decode(toon);
}
// Alias for toonToJson
exports.decode = toonToJson;
// Decoder class that parses TOON using line-based parsing with indentation tracking
var ToonDecoder = /** @class */ (function () {
    function ToonDecoder(options) {
        this.strict = options.strict || false;
        this.lines = [];
        this.currentIndex = 0;
    }
    // Main decode entry: splits into lines and parses from root
    ToonDecoder.prototype.decode = function (toon) {
        if (!toon || !toon.trim()) {
            return null;
        }
        this.lines = toon.split('\n');
        this.currentIndex = 0;
        return this.parseValue(0);
    };
    // Parses value at current position (dispatches to object/array/primitive parser)
    ToonDecoder.prototype.parseValue = function (expectedIndent) {
        while (this.currentIndex < this.lines.length && !this.lines[this.currentIndex].trim()) {
            this.currentIndex++;
        }
        if (this.currentIndex >= this.lines.length) {
            return null;
        }
        var line = this.lines[this.currentIndex];
        var indent = this.getIndent(line);
        if (indent < expectedIndent) {
            return null;
        }
        var trimmed = line.trim();
        // Array header: [N]:, [N\t]:, [N|]:, [N]{fields}:
        var arrayMatch = trimmed.match(/^\[(\d+)([^\]]*)\](?:\{([^}]+)\})?:\s*(.*)$/);
        if (arrayMatch) {
            return this.parseArrayFromHeader(arrayMatch, expectedIndent + this.getIndentSize());
        }
        // Object or key-value pair
        if (trimmed.includes(':')) {
            return this.parseObject(expectedIndent);
        }
        return this.parsePrimitive(trimmed);
    };
    // Parses object from key-value lines at same indentation level
    ToonDecoder.prototype.parseObject = function (expectedIndent) {
        var result = {};
        while (this.currentIndex < this.lines.length) {
            var line = this.lines[this.currentIndex];
            if (!line.trim()) {
                this.currentIndex++;
                continue;
            }
            var indent = this.getIndent(line);
            if (indent < expectedIndent) {
                break;
            }
            if (indent === expectedIndent) {
                var parsed = this.parseKeyValueLine(line, expectedIndent);
                if (parsed) {
                    result[parsed.key] = parsed.value;
                }
            }
            else {
                break;
            }
        }
        return result;
    };
    // Parses a single key-value line (handles primitives, arrays, nested objects)
    ToonDecoder.prototype.parseKeyValueLine = function (line, indent) {
        var trimmed = line.trim();
        var match = trimmed.match(/^([^:]+?)(\[.*?\](?:\{.*?\})?)?:\s*(.*)$/);
        if (!match) {
            return null;
        }
        var rawKey = match[1], arrayPart = match[2], valuePart = match[3];
        var key = this.parseKey(rawKey);
        // Array property
        if (arrayPart) {
            var arrayMatch = arrayPart.match(/^\[(\d+)([^\]]*)\](?:\{([^}]+)\})?$/);
            if (arrayMatch) {
                var value_1 = this.parseArrayFromHeader([arrayPart, arrayMatch[1], arrayMatch[2], arrayMatch[3], valuePart], indent + this.getIndentSize());
                return { key: key, value: value_1 };
            }
        }
        // Nested value on following lines
        if (!valuePart) {
            this.currentIndex++;
            var value_2 = this.parseValue(indent + this.getIndentSize());
            return { key: key, value: value_2 };
        }
        // Simple primitive value
        var value = this.parsePrimitive(valuePart);
        this.currentIndex++;
        return { key: key, value: value };
    };
    // Detects array format and routes to appropriate parser
    ToonDecoder.prototype.parseArrayFromHeader = function (match, contentIndent) {
        var countStr = match[1], delimiterPart = match[2], fieldsPart = match[3], valuePart = match[4];
        var count = parseInt(countStr, 10);
        var delimiter = this.detectDelimiter(delimiterPart);
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
    };
    // Parses inline array by splitting on delimiter
    ToonDecoder.prototype.parseInlineArray = function (values, delimiter) {
        var _this = this;
        var parts = values.split(delimiter);
        return parts.map(function (part) { return _this.parsePrimitive(part.trim()); });
    };
    // Parses tabular array: extracts field names, then parses each row as object
    ToonDecoder.prototype.parseTabularArray = function (count, fieldsPart, delimiter, indent) {
        var _this = this;
        var fields = fieldsPart.split(delimiter).map(function (f) { return _this.parseKey(f.trim()); });
        var result = [];
        for (var i = 0; i < count; i++) {
            while (this.currentIndex < this.lines.length && !this.lines[this.currentIndex].trim()) {
                this.currentIndex++;
            }
            if (this.currentIndex >= this.lines.length) {
                break;
            }
            var line = this.lines[this.currentIndex];
            var lineIndent = this.getIndent(line);
            if (lineIndent !== indent) {
                if (this.strict) {
                    throw new Error("Expected indentation ".concat(indent, " but got ").concat(lineIndent, " at line ").concat(this.currentIndex + 1));
                }
                break;
            }
            var values = line.trim().split(delimiter).map(function (v) { return _this.parsePrimitive(v.trim()); });
            var obj = {};
            for (var j = 0; j < fields.length; j++) {
                obj[fields[j]] = values[j] !== undefined ? values[j] : null;
            }
            result.push(obj);
            this.currentIndex++;
        }
        return result;
    };
    // Parses expanded list: each item starts with dash, can be primitive/object/array
    ToonDecoder.prototype.parseExpandedList = function (count, indent) {
        var result = [];
        for (var i = 0; i < count; i++) {
            while (this.currentIndex < this.lines.length && !this.lines[this.currentIndex].trim()) {
                this.currentIndex++;
            }
            if (this.currentIndex >= this.lines.length) {
                break;
            }
            var line = this.lines[this.currentIndex];
            var trimmed = line.trim();
            if (!trimmed.startsWith('-')) {
                if (this.strict) {
                    throw new Error("Expected list item marker '-' at line ".concat(this.currentIndex + 1));
                }
                break;
            }
            var afterDash = trimmed.substring(1).trim();
            if (!afterDash) {
                // Nested content on following lines
                this.currentIndex++;
                var value = this.parseValue(indent + this.getIndentSize());
                result.push(value || {});
            }
            else if (afterDash.startsWith('[')) {
                // Nested array
                var arrayMatch = afterDash.match(/^\[(\d+)([^\]]*)\](?:\{([^}]+)\})?:\s*(.*)$/);
                if (arrayMatch) {
                    this.currentIndex++;
                    var nested = this.parseArrayFromHeader([afterDash, arrayMatch[1], arrayMatch[2], arrayMatch[3], arrayMatch[4]], indent + this.getIndentSize());
                    result.push(nested);
                }
                else {
                    this.currentIndex++;
                    result.push(this.parsePrimitive(afterDash));
                }
            }
            else {
                // Simple primitive
                this.currentIndex++;
                result.push(this.parsePrimitive(afterDash));
            }
        }
        return result;
    };
    // Parses primitive: null, true, false, numbers, quoted strings, unquoted strings
    ToonDecoder.prototype.parsePrimitive = function (value) {
        var trimmed = value.trim();
        if (trimmed === 'null')
            return null;
        if (trimmed === 'true')
            return true;
        if (trimmed === 'false')
            return false;
        // Number detection
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
            var num = Number(trimmed);
            if (!isNaN(num)) {
                return num;
            }
        }
        // Quoted string
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return this.unescapeString(trimmed.slice(1, -1));
        }
        return trimmed;
    };
    // Parses key (removes quotes if present)
    ToonDecoder.prototype.parseKey = function (key) {
        var trimmed = key.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return this.unescapeString(trimmed.slice(1, -1));
        }
        return trimmed;
    };
    // Converts escape sequences back to characters
    ToonDecoder.prototype.unescapeString = function (str) {
        return str
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
    };
    // Detects delimiter from array header
    ToonDecoder.prototype.detectDelimiter = function (delimiterPart) {
        if (delimiterPart === '\t')
            return '\t';
        if (delimiterPart === '|')
            return '|';
        return ',';
    };
    // Calculates indentation from leading whitespace
    ToonDecoder.prototype.getIndent = function (line) {
        var match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    };
    // Returns standard indent size (2 spaces)
    ToonDecoder.prototype.getIndentSize = function () {
        return 2;
    };
    return ToonDecoder;
}());
exports.ToonDecoder = ToonDecoder;
