/**
 * Author : lingdao.lzq
 * Created On : Sat Nov 25 2017
 * File : ExprTranVisitor.ts
 */

import { AbstractParseTreeVisitor } from 'antlr4ts/tree';
import {
  ExprParser,
  ExprStatContext,
  IdExprContext,
  AssignStatContext,
  AddSubExprContext,
  MulDivExprContext,
  ParenExprContext,
  IntExprContext,
  ProgContext,
} from './parser/ExprParser';
import { ExprVisitor } from './parser/ExprVisitor';

export default class ExprTranVisitor extends AbstractParseTreeVisitor<string>
  implements ExprVisitor<string> {
  defaultResult() {
    return '';
  }

  visitProg(ctx: ProgContext) {
    let val = '';
    for (let i = 0; i < ctx.childCount; i++) {
      val += this.visit(ctx.stat(i));
    }
    return val;
  }

  visitExprStat(ctx: ExprStatContext) {
    const val = this.visit(ctx.expr());
    return `${val};\n`;
  }

  visitAssignStat(ctx: AssignStatContext) {
    const id = ctx.ID().text;
    const val = this.visit(ctx.expr());
    return `${id} = ${val};\n`;
  }

  visitAddSubExpr(ctx: AddSubExprContext) {
    const left = this.visit(ctx.expr(0));
    const right = this.visit(ctx.expr(1));
    const op = ctx._op;

    if (op.type === ExprParser.ADD) {
      return `+ ${left} ${right}`;
    }
    return `- ${left} ${right}`;
  }

  visitMulDivExpr(ctx: MulDivExprContext) {
    const left = this.visit(ctx.expr(0));
    const right = this.visit(ctx.expr(1));
    const op = ctx._op;

    if (op.type === ExprParser.MUL) {
      return `* ${left} ${right}`;
    }
    return `/ ${left} ${right}`;
  }

  visitIdExpr(ctx: IdExprContext) {
    const parent = ctx.parent;
    const id = ctx.ID().text;
    return id;
  }

  visitIntExpr(ctx: IntExprContext) {
    const parent = ctx.parent;
    const val = ctx.INT().text;
    return val;
  }

  visitParenExpr(ctx: ParenExprContext) {
    const val = this.visit(ctx.expr());
    return val;
  }
}
