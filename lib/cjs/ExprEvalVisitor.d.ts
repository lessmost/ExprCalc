/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : ExprEvalVisitor.ts
 */
import { AbstractParseTreeVisitor } from 'antlr4ts/tree';
import { ExprStatContext, IdExprContext, AssignStatContext, AddSubExprContext, MulDivExprContext, ParenExprContext, IntExprContext } from './parser/ExprParser';
import { ExprVisitor } from './parser/ExprVisitor';
export default class ExprEvalVisitor extends AbstractParseTreeVisitor<number> implements ExprVisitor<number> {
    private buffers;
    private memory;
    defaultResult(): number;
    visitExprStat(ctx: ExprStatContext): number;
    visitAssignStat(ctx: AssignStatContext): number;
    visitAddSubExpr(ctx: AddSubExprContext): number;
    visitMulDivExpr(ctx: MulDivExprContext): number;
    visitIdExpr(ctx: IdExprContext): number;
    visitIntExpr(ctx: IntExprContext): number;
    visitParenExpr(ctx: ParenExprContext): number;
    print(): string;
}
