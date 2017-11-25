/**
 * Author : lingdao.lzq
 * Created On : Sat Nov 25 2017
 * File : ExprTranVisitor.ts
 */
import { AbstractParseTreeVisitor } from 'antlr4ts/tree';
import { ExprStatContext, IdExprContext, AssignStatContext, AddSubExprContext, MulDivExprContext, ParenExprContext, IntExprContext, ProgContext } from './parser/ExprParser';
import { ExprVisitor } from './parser/ExprVisitor';
export default class ExprTranVisitor extends AbstractParseTreeVisitor<string> implements ExprVisitor<string> {
    defaultResult(): string;
    visitProg(ctx: ProgContext): string;
    visitExprStat(ctx: ExprStatContext): string;
    visitAssignStat(ctx: AssignStatContext): string;
    visitAddSubExpr(ctx: AddSubExprContext): string;
    visitMulDivExpr(ctx: MulDivExprContext): string;
    visitIdExpr(ctx: IdExprContext): string;
    visitIntExpr(ctx: IntExprContext): string;
    visitParenExpr(ctx: ParenExprContext): string;
}
