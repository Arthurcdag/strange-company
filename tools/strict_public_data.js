const UNSAFE_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
]);

const IDENTIFIER_START = /[A-Za-z_$]/;
const IDENTIFIER_PART = /[A-Za-z0-9_$]/;
const MAX_SOURCE_LENGTH = 2_000_000;
const MAX_DEPTH = 100;
const MAX_VALUES = 100_000;

class StrictDataParser {
  constructor(source, label, { allowIdentifierKeys, allowTrailingCommas }) {
    this.source = String(source).replace(/^\uFEFF/, "");
    this.label = label || "public data";
    this.allowIdentifierKeys = allowIdentifierKeys;
    this.allowTrailingCommas = allowTrailingCommas;
    this.index = 0;
    this.depth = 0;
    this.values = 0;
    if (this.source.length > MAX_SOURCE_LENGTH) {
      this.fail(`source exceeds ${MAX_SOURCE_LENGTH} characters`);
    }
  }

  fail(message) {
    throw new Error(`${this.label}: ${message} at offset ${this.index}`);
  }

  skipWhitespace() {
    while (this.index < this.source.length && /[\t\n\r ]/.test(this.source[this.index])) {
      this.index += 1;
    }
  }

  consume(character) {
    this.skipWhitespace();
    if (this.source[this.index] !== character) {
      this.fail(`expected ${JSON.stringify(character)}`);
    }
    this.index += 1;
  }

  consumeWord(word) {
    this.skipWhitespace();
    if (!this.source.startsWith(word, this.index)) {
      this.fail(`expected ${word}`);
    }
    const end = this.index + word.length;
    if (end < this.source.length && IDENTIFIER_PART.test(this.source[end])) {
      this.fail(`expected ${word} token boundary`);
    }
    this.index = end;
  }

  at(character) {
    this.skipWhitespace();
    return this.source[this.index] === character;
  }

  finish() {
    this.skipWhitespace();
    if (this.index !== this.source.length) {
      this.fail("unexpected trailing syntax");
    }
  }

  enterContainer() {
    this.depth += 1;
    if (this.depth > MAX_DEPTH) this.fail(`nesting exceeds ${MAX_DEPTH} levels`);
  }

  leaveContainer() {
    this.depth -= 1;
  }

  countValue() {
    this.values += 1;
    if (this.values > MAX_VALUES) this.fail(`value count exceeds ${MAX_VALUES}`);
  }

  parseValue() {
    this.skipWhitespace();
    this.countValue();
    const character = this.source[this.index];
    if (character === "{") return this.parseObject();
    if (character === "[") return this.parseArray();
    if (character === '"') return this.parseString();
    if (character === "-" || /[0-9]/.test(character || "")) return this.parseNumber();
    if (this.source.startsWith("true", this.index)) return this.parseLiteral("true", true);
    if (this.source.startsWith("false", this.index)) return this.parseLiteral("false", false);
    if (this.source.startsWith("null", this.index)) return this.parseLiteral("null", null);
    this.fail("expected a data-only object, array, string, number, boolean, or null");
  }

  parseLiteral(token, value) {
    const end = this.index + token.length;
    if (end < this.source.length && IDENTIFIER_PART.test(this.source[end])) {
      this.fail(`invalid ${token} literal`);
    }
    this.index = end;
    return value;
  }

  parseString() {
    const start = this.index;
    this.index += 1;
    let escaped = false;
    while (this.index < this.source.length) {
      const character = this.source[this.index];
      if (!escaped && character === '"') {
        this.index += 1;
        try {
          return JSON.parse(this.source.slice(start, this.index));
        } catch (error) {
          this.fail(`invalid JSON string: ${error.message}`);
        }
      }
      if (!escaped && (character === "\n" || character === "\r")) {
        this.fail("unescaped newline in string");
      }
      if (!escaped && character.charCodeAt(0) < 0x20) {
        this.fail("unescaped control character in string");
      }
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      }
      this.index += 1;
    }
    this.fail("unterminated string");
  }

  parseNumber() {
    const match = this.source.slice(this.index).match(
      /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/
    );
    if (!match) this.fail("invalid JSON number");
    const token = match[0];
    const end = this.index + token.length;
    const next = this.source[end];
    if (next && !/[\t\n\r ,}\]]/.test(next)) {
      this.fail("invalid character after number");
    }
    this.index = end;
    const value = Number(token);
    if (!Number.isFinite(value)) this.fail("number must be finite");
    return value;
  }

  parseIdentifierKey() {
    const first = this.source[this.index];
    if (!IDENTIFIER_START.test(first || "")) {
      this.fail("object keys must be double-quoted strings or safe identifiers");
    }
    const start = this.index;
    this.index += 1;
    while (this.index < this.source.length && IDENTIFIER_PART.test(this.source[this.index])) {
      this.index += 1;
    }
    return this.source.slice(start, this.index);
  }

  requireSafeKey(key) {
    if (UNSAFE_KEYS.has(key)) {
      this.fail(`unsafe object key ${JSON.stringify(key)} is forbidden`);
    }
  }

  parseObject() {
    this.enterContainer();
    this.consume("{");
    const value = {};
    const keys = new Set();
    try {
      if (this.at("}")) {
        this.consume("}");
        return value;
      }
      while (true) {
        this.skipWhitespace();
        const key = this.source[this.index] === '"'
          ? this.parseString()
          : this.allowIdentifierKeys
            ? this.parseIdentifierKey()
            : this.fail("JSON object keys must be double-quoted strings");
        this.requireSafeKey(key);
        if (keys.has(key)) this.fail(`duplicate object key ${JSON.stringify(key)}`);
        keys.add(key);
        this.consume(":");
        const child = this.parseValue();
        Object.defineProperty(value, key, {
          value: child,
          enumerable: true,
          configurable: true,
          writable: true,
        });
        if (this.at("}")) {
          this.consume("}");
          return value;
        }
        this.consume(",");
        if (this.at("}")) {
          if (!this.allowTrailingCommas) this.fail("trailing object comma is forbidden");
          this.consume("}");
          return value;
        }
      }
    } finally {
      this.leaveContainer();
    }
  }

  parseArray() {
    this.enterContainer();
    this.consume("[");
    const value = [];
    try {
      if (this.at("]")) {
        this.consume("]");
        return value;
      }
      while (true) {
        value.push(this.parseValue());
        if (this.at("]")) {
          this.consume("]");
          return value;
        }
        this.consume(",");
        if (this.at("]")) {
          if (!this.allowTrailingCommas) this.fail("trailing array comma is forbidden");
          this.consume("]");
          return value;
        }
      }
    } finally {
      this.leaveContainer();
    }
  }
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label}: assignment value must be an object`);
  }
  return value;
}

function parsePublicOrderConfig(source, label = "public config") {
  const parser = new StrictDataParser(source, label, {
    allowIdentifierKeys: true,
    allowTrailingCommas: true,
  });
  parser.consumeWord("window");
  parser.consume(".");
  parser.consumeWord("PUBLIC_ORDER_CONFIG");
  parser.consume("=");
  const value = requireObject(parser.parseValue(), label);
  parser.consume(";");
  parser.finish();
  return value;
}

function parseStrictJson(source, label = "JSON data") {
  const parser = new StrictDataParser(source, label, {
    allowIdentifierKeys: false,
    allowTrailingCommas: false,
  });
  const value = parser.parseValue();
  parser.finish();
  return value;
}

function parseFrozenWindowJson(source, globalName, label = globalName) {
  if (!/^[A-Z][A-Z0-9_]*$/.test(globalName)) {
    throw new Error(`${label}: invalid expected global name`);
  }
  const parser = new StrictDataParser(source, label, {
    allowIdentifierKeys: false,
    allowTrailingCommas: false,
  });
  parser.consumeWord("window");
  parser.consume(".");
  parser.consumeWord(globalName);
  parser.consume("=");
  parser.consumeWord("Object");
  parser.consume(".");
  parser.consumeWord("freeze");
  parser.consume("(");
  const value = requireObject(parser.parseValue(), label);
  parser.consume(")");
  parser.consume(";");
  parser.finish();
  return value;
}

module.exports = {
  parseFrozenWindowJson,
  parsePublicOrderConfig,
  parseStrictJson,
};
