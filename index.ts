// https://github.com/mgechev/tiny-compiler/blob/master/tiny.js

const program = 'sub 2 sum 1 3 4';

/*
  # Lexer
  The lexer is responsible for turning the input string into
  a list of tokens. Usually a token looks the following way:
  ```javascript
  {
    "type": Symbol("Operator"),
    "value: "-"
  }
  ```
  In our case we're keeping everything simplified and store
  only the token's value. We can infer the type based on
  regular expressions defined below.
  In short, `lex` will turn the following expression:
  ```
  sub 2 sum 1 3 4
  ```
  To the following array:
  ```
  ["sub", "2", "sum", "1", "3", "4"]
  ```
*/

const lex = (str: string) =>
  str
    .split(' ')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

/*
  # Parser
  The parser is responsible for turning the list of tokens
  into an AST or Abstract Syntax Tree. In the example below
  we use recursive descent parsing to produce the AST
  from the input token array.
  Visually, the parsing is a process which turns the array:
  ```javascript
  const tokens = ["sub", "2", "sum", "1", "3", "4"];
  ```
  to the following tree:
  ```
   sub
   / \
  2  sum
     /|\
    1 3 4
  ```
  The parser uses the following grammar to parse the input token array:
  ```
  num := 0-9+
  op := sum | sub | div | mul
  expr := num | op expr+
  ```
  This translated to plain English, means:
  - `num` can be any sequence of the numbers between 0 and 9.
  - `op` can be any of `sum`, `sub`, `div`, `mul`.
  - `expr` can be either a number (i.e. `num`) or an operation followed by one or more `expr`s.
  Notice that `expr` has a recursive declaration.
*/


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

/*
  # Evaluator
  Finally, this is our evaluator. In it we simply visit each node
  from the tree with pre-order traversal and either:
  - Return the corresponding value, in case the node is of type number.
  - Perform the corresponding arithmetic operation, in case of an operation node.
*/

const evaluate = (ast: Parser) => {
  const operationMap = {
    sum: args => args.reduce((a, b) => a + b, 0),
    sub: args => args.reduce((a, b) => a - b),
    div: args => args.reduce((a, b) => a / b),
    mul: args => args.reduce((a, b) => a * b, 1)
  };

  return ast.type === Num ? ast.val : operationMap[ast.val](ast.expression.map(evaluate))
}

/*
  # Code generator
  Alternatively, instead of interpreting the AST, we can translate
  it to another language. Here's how we can do that with JavaScript.
*/

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
console.log(lex(program));
console.log(parse(lex(program)));

/*
  # Interpreter
  In order to interpret the input stream we feed the parser with the input
  from the lexer and the evaluator with the output of the parser.
*/

console.log(evaluate(parse(lex(program))));

/*
  # Compiler
  In order to compile the expression to JavaScript, the only change we need to make
  is to update the outermost `evaluate` invocation to `compile`.
*/

console.log(compile(parse(lex(program))));
