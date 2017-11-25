"use strict";
/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : execute.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const antlr4ts_1 = require("antlr4ts");
const ExprLexer_1 = require("./parser/ExprLexer");
const ExprParser_1 = require("./parser/ExprParser");
const ExprErrorListener_1 = require("./ExprErrorListener");
const ExprEvalVisitor_1 = require("./ExprEvalVisitor");
function execute(code) {
    const input = new antlr4ts_1.ANTLRInputStream(code);
    const lexer = new ExprLexer_1.ExprLexer(input);
    const tokens = new antlr4ts_1.CommonTokenStream(lexer);
    const parser = new ExprParser_1.ExprParser(tokens);
    const listener = new ExprErrorListener_1.default();
    const visitor = new ExprEvalVisitor_1.default();
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
exports.default = execute;
//# sourceMappingURL=execute.js.map