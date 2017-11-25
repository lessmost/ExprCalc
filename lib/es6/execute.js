/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : execute.ts
 */
import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { ExprLexer } from './parser/ExprLexer';
import { ExprParser } from './parser/ExprParser';
import ExprErrorListener from './ExprErrorListener';
import ExprEvalVisitor from './ExprEvalVisitor';
export default function execute(code) {
    const input = new ANTLRInputStream(code);
    const lexer = new ExprLexer(input);
    const tokens = new CommonTokenStream(lexer);
    const parser = new ExprParser(tokens);
    const listener = new ExprErrorListener();
    const visitor = new ExprEvalVisitor();
    lexer.removeErrorListeners();
    parser.removeErrorListeners();
    lexer.addErrorListener(listener);
    parser.addErrorListener(listener);
    const prog = parser.prog();
    visitor.visit(prog);
    if (listener.hasError()) {
        return listener.print();
    }
    return visitor.print();
}
//# sourceMappingURL=execute.js.map