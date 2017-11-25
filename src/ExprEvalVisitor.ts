/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : ExprEvalVisitor.ts
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
} from './parser/ExprParser';
import { ExprVisitor } from './parser/ExprVisitor';

export default class ExprEvalVisitor extends AbstractParseTreeVisitor<number>
  implements ExprVisitor<number> {
  // 保存执行输出结果
  private buffers: string[] = [];
  // 保存变量
  private memory: { [id: string]: number } = {};

  defaultResult() {
    return 0;
  }

  visitExprStat(ctx: ExprStatContext) {
    const val = this.visit(ctx.expr());
    this.buffers.push(`${val}`);
    return val;
  }

  visitAssignStat(ctx: AssignStatContext) {
    const id = ctx.ID().text;
    const val = this.visit(ctx.expr());
    this.memory[id] = val;
    return val;
  }

  visitAddSubExpr(ctx: AddSubExprContext) {
    const left = this.visit(ctx.expr(0));
    const right = this.visit(ctx.expr(1));
    const op = ctx._op;

    if (op.type === ExprParser.ADD) {
      return left + right;
    }
    return left - right;
  }

  visitMulDivExpr(ctx: MulDivExprContext) {
    const left = this.visit(ctx.expr(0));
    const right = this.visit(ctx.expr(1));
    const op = ctx._op;

    if (op.type === ExprParser.MUL) {
      return left * right;
    }
    return left / right;
  }

  visitIdExpr(ctx: IdExprContext) {
    const id = ctx.ID().text;
    if (this.memory[id] !== undefined) {
      return this.memory[id];
    }
    return 0;
  }

  visitIntExpr(ctx: IntExprContext) {
    return parseInt(ctx.INT().text, 10);
  }

  visitParenExpr(ctx: ParenExprContext) {
    return this.visit(ctx.expr());
  }

  print() {
    return this.buffers.join('\n');
  }
}
