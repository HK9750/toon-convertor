// json-to-toon - Convert JSON to TOON (Token-Oriented Object Notation) format
// TOON minimizes token count for LLM prompts while maintaining readability

// Export all types and type guards
export type {
    ToonDelimiter,
    ToonEncodeOptions,
    ToonDecodeOptions,
    JsonValue,
    ToonPrimitive,
} from './@types';

export {
    isPrimitive,
    isObject,
    isArray,
} from './@types';

// Export encoder functions and class
export {
    jsonToToon,
    encode,
    ToonEncoder,
} from './encoder';

// Export decoder functions and class
export {
    toonToJson,
    decode,
    ToonDecoder,
} from './decoder';

// Default export: the main encoding function
export { jsonToToon as default } from './encoder';
