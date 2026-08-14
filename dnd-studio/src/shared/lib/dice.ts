export interface DicePart {
  notation: string;
  count: number;
  sides: number;
  rolls: number[];
  sum: number;
}

export interface RollResult {
  input: string;
  breakdown: string;
  total: number;
  dice: DicePart[];
  natural20: boolean;
  natural1: boolean;
}

type Operator = '+' | '-' | '*' | '/';

type Token =
  | {
      type: 'number';
      value: number;
    }
  | {
      type: 'dice';
      count: number;
      sides: number;
    }
  | {
      type: 'op';
      value: Operator;
    }
  | {
      type: 'lparen';
    }
  | {
      type: 'rparen';
    };

type AstNode =
  | {
      kind: 'number';
      value: number;
    }
  | {
      kind: 'dice';
      count: number;
      sides: number;
    }
  | {
      kind: 'unary';
      op: '+' | '-';
      operand: AstNode;
    }
  | {
      kind: 'binary';
      op: Operator;
      left: AstNode;
      right: AstNode;
    };

export function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(Math.round(value * 100) / 100);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];

  let index = 0;

  while (index < input.length) {
    const remaining = input.slice(index);

    const diceMatch = remaining.match(/^((\d*)d(\d+))/);

    if (diceMatch) {
      const rawCount = diceMatch[2];
      const rawSides = diceMatch[3];

      const count = rawCount ? Number.parseInt(rawCount, 10) : 1;
      const sides = Number.parseInt(rawSides, 10);

      if (!Number.isFinite(count) || !Number.isFinite(sides)) {
        throw new Error('Invalid dice notation');
      }

      if (count < 1 || count > 100) {
        throw new Error('Dice count must be between 1 and 100');
      }

      if (sides < 2 || sides > 1000) {
        throw new Error('Dice sides must be between 2 and 1000');
      }

      tokens.push({
        type: 'dice',
        count,
        sides,
      });

      index += diceMatch[1].length;
      continue;
    }

    const numberMatch = remaining.match(/^\d+(\.\d+)?/);

    if (numberMatch) {
      const value = Number.parseFloat(numberMatch[0]);

      if (!Number.isFinite(value)) {
        throw new Error('Invalid number');
      }

      tokens.push({
        type: 'number',
        value,
      });

      index += numberMatch[0].length;
      continue;
    }

    const opMatch = remaining.match(/^[+\-*/]/);

    if (opMatch) {
      tokens.push({
        type: 'op',
        value: opMatch[0] as Operator,
      });

      index += 1;
      continue;
    }

    if (remaining.startsWith('(')) {
      tokens.push({
        type: 'lparen',
      });

      index += 1;
      continue;
    }

    if (remaining.startsWith(')')) {
      tokens.push({
        type: 'rparen',
      });

      index += 1;
      continue;
    }

    throw new Error(`Unexpected character: ${remaining[0]}`);
  }

  return tokens;
}

class Parser {
  private tokens: Token[];
  private position = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): AstNode {
    const node = this.parseExpression();

    if (!this.isAtEnd()) {
      throw new Error('Unexpected token');
    }

    return node;
  }

  private parseExpression(): AstNode {
    return this.parseAdditive();
  }

  private parseAdditive(): AstNode {
    let left = this.parseMultiplicative();

    for (;;) {
      const token = this.peek();

      if (
        token &&
        token.type === 'op' &&
        (token.value === '+' || token.value === '-')
      ) {
        this.consume();

        const right = this.parseMultiplicative();

        left = {
          kind: 'binary',
          op: token.value,
          left,
          right,
        };

        continue;
      }

      break;
    }

    return left;
  }

  private parseMultiplicative(): AstNode {
    let left = this.parseUnary();

    for (;;) {
      const token = this.peek();

      if (
        token &&
        token.type === 'op' &&
        (token.value === '*' || token.value === '/')
      ) {
        this.consume();

        const right = this.parseUnary();

        left = {
          kind: 'binary',
          op: token.value,
          left,
          right,
        };

        continue;
      }

      break;
    }

    return left;
  }

  private parseUnary(): AstNode {
    const token = this.peek();

    if (token && token.type === 'op' && (token.value === '+' || token.value === '-')) {
      this.consume();

      const operand = this.parseUnary();

      return {
        kind: 'unary',
        op: token.value,
        operand,
      };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): AstNode {
    const token = this.peek();

    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    if (token.type === 'number') {
      this.consume();

      return {
        kind: 'number',
        value: token.value,
      };
    }

    if (token.type === 'dice') {
      this.consume();

      return {
        kind: 'dice',
        count: token.count,
        sides: token.sides,
      };
    }

    if (token.type === 'lparen') {
      this.consume();

      const expression = this.parseExpression();

      const closing = this.consume();

      if (!closing || closing.type !== 'rparen') {
        throw new Error('Expected closing parenthesis');
      }

      return expression;
    }

    throw new Error('Unexpected token');
  }

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  private consume(): Token | undefined {
    const token = this.tokens[this.position];
    this.position += 1;
    return token;
  }

  private isAtEnd(): boolean {
    return this.position >= this.tokens.length;
  }
}

function operatorPrecedence(op: Operator): number {
  if (op === '+' || op === '-') {
    return 1;
  }

  return 2;
}

function needsParentheses(
  child: AstNode,
  parentOp: Operator,
  side: 'left' | 'right',
): boolean {
  if (child.kind === 'unary') {
    return child.op === '-' && (parentOp === '*' || parentOp === '/');
  }

  if (child.kind !== 'binary') {
    return false;
  }

  const childPrecedence = operatorPrecedence(child.op);
  const parentPrecedence = operatorPrecedence(parentOp);

  if (childPrecedence < parentPrecedence) {
    return true;
  }

  if (
    childPrecedence === parentPrecedence &&
    side === 'right' &&
    (parentOp === '-' || parentOp === '/')
  ) {
    return true;
  }

  return false;
}

function evaluateNode(
  node: AstNode,
  diceParts: DicePart[],
): {
  value: number;
  text: string;
} {
  if (node.kind === 'number') {
    return {
      value: node.value,
      text: formatNumber(node.value),
    };
  }

  if (node.kind === 'dice') {
    const rolls: number[] = [];

    for (let index = 0; index < node.count; index += 1) {
      rolls.push(randomInt(1, node.sides));
    }

    const sum = rolls.reduce((acc, value) => acc + value, 0);

    diceParts.push({
      notation: `${node.count}d${node.sides}`,
      count: node.count,
      sides: node.sides,
      rolls,
      sum,
    });

    return {
      value: sum,
      text: `${node.count}d${node.sides}[${rolls.join('+')}]`,
    };
  }

  if (node.kind === 'unary') {
    const operand = evaluateNode(node.operand, diceParts);

    const value = node.op === '-' ? -operand.value : operand.value;

    let text = operand.text;

    if (
      node.operand.kind === 'binary' ||
      (node.operand.kind === 'unary' && node.operand.op === '-')
    ) {
      text = `(${operand.text})`;
    }

    if (node.op === '-') {
      text = `-${text}`;
    }

    return {
      value,
      text,
    };
  }

  const left = evaluateNode(node.left, diceParts);
  const right = evaluateNode(node.right, diceParts);

  let value = 0;

  if (node.op === '+') {
    value = left.value + right.value;
  }

  if (node.op === '-') {
    value = left.value - right.value;
  }

  if (node.op === '*') {
    value = left.value * right.value;
  }

  if (node.op === '/') {
    if (right.value === 0) {
      throw new Error('Division by zero');
    }

    value = left.value / right.value;
  }

  const leftText = needsParentheses(node.left, node.op, 'left')
    ? `(${left.text})`
    : left.text;

  const rightText = needsParentheses(node.right, node.op, 'right')
    ? `(${right.text})`
    : right.text;

  return {
    value,
    text: `${leftText} ${node.op} ${rightText}`,
  };
}

function expandShorthand(
  compactInput: string,
): string | null {
  const shorthandMatch = compactInput.match(/^(\d+)d(\d+)\*(\d+)$/);

  if (!shorthandMatch) {
    return null;
  }

  const count = Number.parseInt(shorthandMatch[1], 10);
  const sides = Number.parseInt(shorthandMatch[2], 10);
  const modifier = Number.parseInt(shorthandMatch[3], 10);

  if (!Number.isFinite(count) || !Number.isFinite(sides) || !Number.isFinite(modifier)) {
    return null;
  }

  if (count < 1 || count > 20) {
    return null;
  }

  const repeated = Array.from({ length: count })
    .map(() => `(1d${sides}+${modifier})`)
    .join(' + ');

  return repeated;
}

export function rollExpression(rawInput: string): RollResult | null {
  const input = rawInput.trim();

  if (!input) {
    return null;
  }

  const compact = input
    .toLowerCase()
    .replace(/\s+/g, '');

  const expanded = expandShorthand(compact);

  if (expanded) {
    const expandedResult = rollExpression(expanded);

    if (expandedResult) {
      expandedResult.input = input;
    }

    return expandedResult;
  }

  if (!/[d]/.test(compact)) {
    return null;
  }

  try {
    const tokens = tokenize(compact);
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const diceParts: DicePart[] = [];

    const evaluated = evaluateNode(ast, diceParts);

    if (diceParts.length === 0) {
      return null;
    }

    const total = Math.round(evaluated.value * 100) / 100;

    const singleD20 =
      diceParts.length === 1 &&
      diceParts[0].count === 1 &&
      diceParts[0].sides === 20;

    const natural20 =
      singleD20 && diceParts[0].rolls[0] === 20;

    const natural1 =
      singleD20 && diceParts[0].rolls[0] === 1;

    return {
      input,
      breakdown: evaluated.text,
      total,
      dice: diceParts,
      natural20,
      natural1,
    };
  } catch {
    return null;
  }
}