# toon-convertor

[![npm version](https://img.shields.io/npm/v/toon-convertor.svg)](https://www.npmjs.com/package/toon-convertor)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Tests](https://img.shields.io/badge/tests-63%20passing-brightgreen.svg)](./tests)

Convert JSON to **TOON (Token-Oriented Object Notation)** - a compact, human-readable format designed to minimize token usage in LLM prompts.

**Save 30-60% tokens** compared to JSON while maintaining full lossless conversion! 🚀

## ✨ Features

- 📊 **Token-Efficient** - 30-60% fewer tokens than JSON
- 🔁 **Lossless** - Perfect round-trip conversion, no data loss
- 🎯 **LLM-Optimized** - Explicit lengths and schemas improve parsing accuracy
- 📐 **Human-Readable** - YAML-like clarity with CSV-style compactness
- 🧺 **Smart Arrays** - Uniform objects auto-collapse into efficient tables
- 🔒 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- ⚡ **Zero Dependencies** - Lightweight and fast

## 📦 Installation

```bash
npm install toon-convertor
```

## 🚀 Quick Start

```typescript
import { jsonToToon, toonToJson } from 'toon-convertor';

// Your JSON data
const data = {
  users: [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' }
  ]
};

// Convert to TOON (saves tokens!)
const toon = jsonToToon(data);
console.log(toon);
/*
users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
*/

// Convert back to JSON (perfect reconstruction)
const json = toonToJson(toon);
// json === data ✓
```

## 📖 Usage Examples

### Basic Objects

```typescript
import { jsonToToon } from 'toon-convertor';

const profile = {
  name: 'Alice',
  age: 30,
  active: true
};

console.log(jsonToToon(profile));
/*
name: Alice
age: 30
active: true
*/
```

### Nested Objects

```typescript
const config = {
  database: {
    host: 'localhost',
    port: 5432,
    credentials: {
      username: 'admin',
      password: 'secret'
    }
  }
};

console.log(jsonToToon(config));
/*
database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret
*/
```

### Primitive Arrays

```typescript
const data = {
  tags: ['typescript', 'llm', 'json'],
  scores: [95, 87, 92]
};

console.log(jsonToToon(data));
/*
tags[3]: typescript,llm,json
scores[3]: 95,87,92
*/
```

### Tabular Arrays (The Magic! ✨)

When you have arrays of uniform objects, TOON automatically uses a super-compact table format:

```typescript
const data = {
  products: [
    { sku: 'A1', name: 'Widget', price: 9.99, stock: 42 },
    { sku: 'B2', name: 'Gadget', price: 14.50, stock: 17 },
    { sku: 'C3', name: 'Doohickey', price: 7.25, stock: 99 }
  ]
};

console.log(jsonToToon(data));
/*
products[3]{sku,name,price,stock}:
  A1,Widget,9.99,42
  B2,Gadget,14.5,17
  C3,Doohickey,7.25,99
*/
```

**Token Savings:** This format is dramatically more compact than repeating field names!

### Mixed Arrays

```typescript
const mixed = {
  items: [
    42,
    'text',
    { nested: 'object' },
    [1, 2, 3]
  ]
};

console.log(jsonToToon(mixed));
/*
items[4]:
  - 42
  - text
  -
    nested: object
  - [3]: 1,2,3
*/
```

### Custom Delimiters

Choose the delimiter that works best for your data:

```typescript
// Tab delimiter (often saves the most tokens)
const toonTab = jsonToToon(data, { delimiter: '\t' });

// Pipe delimiter (when data contains commas)
const toonPipe = jsonToToon(data, { delimiter: '|' });
```

## 🔧 API Reference

### `jsonToToon(value, options?)`

Converts a JSON value to TOON format.

**Parameters:**
- `value: JsonValue` - Any valid JSON value (object, array, primitives)
- `options?: ToonEncodeOptions` - Optional encoding configuration
  - `delimiter?: ',' | '\t' | '|'` - Array delimiter (default: `','`)
  - `indent?: string` - Indentation string (default: `'  '` - 2 spaces)
  - `keyFolding?: boolean` - Experimental feature (default: `false`)

**Returns:** `string` - TOON-formatted string

**Alias:** `encode(value, options?)`

```typescript
import { encode } from 'toon-convertor';
const toon = encode(data); // Same as jsonToToon(data)
```

### `toonToJson(toon, options?)`

Converts a TOON string back to JSON.

**Parameters:**
- `toon: string` - TOON-formatted string
- `options?: ToonDecodeOptions` - Optional decoding configuration
  - `strict?: boolean` - Enable strict validation (throws on errors, default: `false`)

**Returns:** `JsonValue` - Decoded JSON value

**Alias:** `decode(toon, options?)`

```typescript
import { decode } from 'toon-convertor';
const json = decode(toonString); // Same as toonToJson(toonString)
```

### Type Definitions

```typescript
import type {
  JsonValue,           // Any valid JSON value
  ToonPrimitive,       // null | boolean | number | string
  ToonEncodeOptions,   // Encoder configuration
  ToonDecodeOptions,   // Decoder configuration
  ToonDelimiter,       // ',' | '\t' | '|'
  ToonEncoder,         // Encoder class
  ToonDecoder,         // Decoder class
  isPrimitive,         // Type guard for primitives
  isObject,            // Type guard for objects
  isArray              // Type guard for arrays
} from 'toon-convertor';
```

## 📚 TOON Format Overview

TOON combines the best features of multiple formats:

- **YAML-like indentation** for nested objects (clean hierarchy)
- **CSV-style tables** for uniform arrays (massive token savings)
- **Minimal quoting** - strings only quoted when necessary

### Key Features

1. **Explicit Array Lengths**: `items[3]:` tells LLMs exactly what to expect
2. **Field Schemas**: `users[2]{id,name,role}:` defines structure upfront
3. **Smart String Handling**: No quotes needed for simple strings like `hello world`
4. **Delimiter Flexibility**: Choose `,`, `\t`, or `|` based on your data

### When to Use TOON

✅ **Perfect for:**
- LLM prompts with structured data
- API responses in AI applications
- Configuration files for AI agents
- Data serialization where token count matters

❌ **Consider JSON if:**
- You need maximum compatibility (TOON is newer)
- Token count doesn't matter
- You're not working with LLMs

## 🧪 Testing

The package includes comprehensive tests covering 63+ scenarios:

```bash
npm test
```

See [tests/encoder.test.ts](./tests/encoder.test.ts) for detailed examples.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run tests in watch mode
npm run test:watch

# Build the package
npm run build

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
toon-convertor/
├── src/
│   ├── @types/       # Type definitions
│   ├── encoder/      # JSON → TOON conversion
│   ├── decoder/      # TOON → JSON conversion
│   └── index.ts      # Public API exports
├── tests/            # Comprehensive test suite
├── dist/             # Compiled output (auto-generated)
└── README.md         # You are here!
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC License - see [LICENSE](./LICENSE) file for details.

## 🙏 Credits

TOON format designed for optimal LLM token efficiency while maintaining human readability.

---

**Made with ❤️ for the AI community**

If you find this package useful, please consider giving it a ⭐ on GitHub!
