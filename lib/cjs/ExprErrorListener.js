"use strict";
/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : ExprErrorListener.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ExprErrorListener {
    constructor() {
        this.errors = [];
    }
    syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, e) {
        this.errors.push(`[${line}:${charPositionInLine}] ${msg}`);
    }
    hasError() {
        return this.errors.length > 0;
    }
    print() {
        return this.errors.join('\n');
    }
}
exports.default = ExprErrorListener;
//# sourceMappingURL=ExprErrorListener.js.map