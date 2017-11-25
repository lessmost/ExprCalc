"use strict";
/**
 * Author : lingdao.lzq
 * Created On : Sat Nov 25 2017
 * File : ExprTranVisitor.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tree_1 = require("antlr4ts/tree");
const ExprParser_1 = require("./parser/ExprParser");
class ExprTranVisitor extends tree_1.AbstractParseTreeVisitor {
    defaultResult() {
        return '';
    }
    visitProg(ctx) {
        let val = '';
        for (let i = 0; i < ctx.childCount; i++) {
            val += this.visit(ctx.stat(i));
        }
        return val;
    }
    visitExprStat(ctx) {
        const val = this.visit(ctx.expr());
        return `${val};\n`;
    }
    visitAssignStat(ctx) {
        const id = ctx.ID().text;
        const val = this.visit(ctx.expr());
        return `${id} = ${val};\n`;
    }
    visitAddSubExpr(ctx) {
        const left = this.visit(ctx.expr(0));
        const right = this.visit(ctx.expr(1));
        const op = ctx._op;
        if (op.type === ExprParser_1.ExprParser.ADD) {
            return `+ ${left} ${right}`;
        }
        return `- ${left} ${right}`;
    }
    visitMulDivExpr(ctx) {
        const left = this.visit(ctx.expr(0));
        const right = this.visit(ctx.expr(1));
        const op = ctx._op;
        if (op.type === ExprParser_1.ExprParser.MUL) {
            return `* ${left} ${right}`;
        }
        return `/ ${left} ${right}`;
    }
    visitIdExpr(ctx) {
        const parent = ctx.parent;
        const id = ctx.ID().text;
        return id;
    }
    visitIntExpr(ctx) {
        const parent = ctx.parent;
        const val = ctx.INT().text;
        return val;
    }
    visitParenExpr(ctx) {
        const val = this.visit(ctx.expr());
        return val;
    }
}
exports.default = ExprTranVisitor;
//# sourceMappingURL=ExprTranVisitor.js.map