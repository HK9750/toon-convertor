"use strict";
// json-to-toon - Convert JSON to TOON (Token-Oriented Object Notation) format
// TOON minimizes token count for LLM prompts while maintaining readability
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.ToonDecoder = exports.decode = exports.toonToJson = exports.ToonEncoder = exports.encode = exports.jsonToToon = exports.isArray = exports.isObject = exports.isPrimitive = void 0;
var _types_1 = require("./@types");
Object.defineProperty(exports, "isPrimitive", { enumerable: true, get: function () { return _types_1.isPrimitive; } });
Object.defineProperty(exports, "isObject", { enumerable: true, get: function () { return _types_1.isObject; } });
Object.defineProperty(exports, "isArray", { enumerable: true, get: function () { return _types_1.isArray; } });
// Export encoder functions and class
var encoder_1 = require("./encoder");
Object.defineProperty(exports, "jsonToToon", { enumerable: true, get: function () { return encoder_1.jsonToToon; } });
Object.defineProperty(exports, "encode", { enumerable: true, get: function () { return encoder_1.encode; } });
Object.defineProperty(exports, "ToonEncoder", { enumerable: true, get: function () { return encoder_1.ToonEncoder; } });
// Export decoder functions and class
var decoder_1 = require("./decoder");
Object.defineProperty(exports, "toonToJson", { enumerable: true, get: function () { return decoder_1.toonToJson; } });
Object.defineProperty(exports, "decode", { enumerable: true, get: function () { return decoder_1.decode; } });
Object.defineProperty(exports, "ToonDecoder", { enumerable: true, get: function () { return decoder_1.ToonDecoder; } });
// Default export: the main encoding function
var encoder_2 = require("./encoder");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return encoder_2.jsonToToon; } });
