"use strict";
/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : ExprEvalVisitor.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tree_1 = require("antlr4ts/tree");
const ExprParser_1 = require("./parser/ExprParser");
class ExprEvalVisitor extends tree_1.AbstractParseTreeVisitor {
    constructor() {
        super(...arguments);
        // 保存执行输出结果
        this.buffers = [];
        // 保存变量
        this.memory = {};
    }
    defaultResult() {
        return 0;
    }
    visitExprStat(ctx) {
        const val = this.visit(ctx.expr());
        this.buffers.push(`${val}`);
        return val;
    }
    visitAssignStat(ctx) {
        const id = ctx.ID().text;
        const val = this.visit(ctx.expr());
        this.memory[id] = val;
        return val;
    }
    visitAddSubExpr(ctx) {
        const left = this.visit(ctx.expr(0));
        const right = this.visit(ctx.expr(1));
        const op = ctx._op;
        if (op.type === ExprParser_1.ExprParser.ADD) {
            return left + right;
        }
        return left - right;
    }
    visitMulDivExpr(ctx) {
        const left = this.visit(ctx.expr(0));
        const right = this.visit(ctx.expr(1));
        const op = ctx._op;
        if (op.type === ExprParser_1.ExprParser.MUL) {
            return left * right;
        }
        return left / right;
    }
    visitIdExpr(ctx) {
        const id = ctx.ID().text;
        if (this.memory[id] !== undefined) {
            return this.memory[id];
        }
        return 0;
    }
    visitIntExpr(ctx) {
        return parseInt(ctx.INT().text, 10);
    }
    visitParenExpr(ctx) {
        return this.visit(ctx.expr());
    }
    print() {
        return this.buffers.join('\n');
    }
}
exports.default = ExprEvalVisitor;
//# sourceMappingURL=ExprEvalVisitor.js.map