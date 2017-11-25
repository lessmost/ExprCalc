/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : translate.ts
 */

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { ExprLexer } from './parser/ExprLexer';
import { ExprParser } from './parser/ExprParser';
import ExprErrorListener from './ExprErrorListener';
import ExprTranVisitor from './ExprTranVisitor';

export default function execute(code: string): string {
  const input = new ANTLRInputStream(code);
  const lexer = new ExprLexer(input);
  const tokens = new CommonTokenStream(lexer);
  const parser = new ExprParser(tokens);
  const listener = new ExprErrorListener();
  const visitor = new ExprTranVisitor();

  lexer.removeErrorListeners();
  parser.removeErrorListeners();
  lexer.addErrorListener(listener);
  parser.addErrorListener(listener);

  const prog = parser.prog();
  const result = visitor.visit(prog);

  if (listener.hasError()) {
    return listener.print();
  }

  return result;
}
