const program = 'sub 2 sum 1 3 4';

const lex = (str: string) =>
  str
    .split(' ')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

const tokens: string[] = lex(program);

const Op = Symbol('op');
const Num = Symbol('num');


interface ParserBase {
  readonly type: symbol;
}

interface NumberParser extends ParserBase {
  readonly val: number;
  readonly type: typeof Num;
}

interface OperationParser extends ParserBase {
  readonly val: string;
  readonly type: typeof Op;
  readonly expression: unknown[];
}

type Parser = NumberParser | OperationParser;

const parse = (tokens: string[]): Parser => {
  let count = 0;
  const peek = () => tokens[count];
  const consume = () => tokens[count++];

  const parseNum = (): NumberParser => {
    return {
      val: parseInt(consume()),
      type: Num,
    };
  };

  const parseOp = (): OperationParser => {
    const node: OperationParser = { val: consume(), type: Op, expression: [] };

    while (peek()) {
      node.expression.push(parseExpression());
    }

    return node;
  };

  const parseExpression = () => (/\d/.test(peek()) ? parseNum() : parseOp());

  return parseExpression();
};

const evaluate = (ast: Parser) => {
  const operationMap = {
    sum: args => args.reduce((a, b) => a + b, 0),
    sub: args => args.reduce((a, b) => a - b),
    div: args => args.reduce((a, b) => a / b),
    mul: args => args.reduce((a, b) => a * b, 1)
  };

  return ast.type === Num ? ast.val : operationMap[ast.val](ast.expression.map(evaluate))
}

const compile = (ast: Parser) => {
  const operationMap = {
    sum: '+',
    sub: '-',
    div: '/',
    mul: '*'
  };

  const compileNum = (ast: NumberParser) => ast.val;
  const compileOp = (ast: OperationParser) => `(${ast.expression.map(_compile).join(' ' + operationMap[ast.val] + ' ')})`;
  const _compile = (ast: Parser) => ast.type === Num ? compileNum(ast
  ) : compileOp(ast);

  return _compile(ast);
}

console.clear();
console.log(tokens);
console.log(parse(tokens));
console.log(evaluate(parse(tokens)));



console.log(compile(parse(tokens)));
