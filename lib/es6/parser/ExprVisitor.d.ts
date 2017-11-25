import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor';
import { MulDivExprContext } from './ExprParser';
import { IdExprContext } from './ExprParser';
import { IntExprContext } from './ExprParser';
import { ParenExprContext } from './ExprParser';
import { AddSubExprContext } from './ExprParser';
import { ProgContext } from './ExprParser';
import { StatContext } from './ExprParser';
import { ExprStatContext } from './ExprParser';
import { AssignStatContext } from './ExprParser';
import { ExprContext } from './ExprParser';
/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `ExprParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface ExprVisitor<Result> extends ParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by the `MulDivExpr`
     * labeled alternative in `ExprParser.expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMulDivExpr?: (ctx: MulDivExprContext) => Result;
    /**
     * Visit a parse tree produced by the `IdExpr`
     * labeled alternative in `ExprParser.expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdExpr?: (ctx: IdExprContext) => Result;
    /**
     * Visit a parse tree produced by the `IntExpr`
     * labeled alternative in `ExprParser.expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIntExpr?: (ctx: IntExprContext) => Result;
    /**
     * Visit a parse tree produced by the `ParenExpr`
     * labeled alternative in `ExprParser.expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParenExpr?: (ctx: ParenExprContext) => Result;
    /**
     * Visit a parse tree produced by the `AddSubExpr`
     * labeled alternative in `ExprParser.expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAddSubExpr?: (ctx: AddSubExprContext) => Result;
    /**
     * Visit a parse tree produced by `ExprParser.prog`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProg?: (ctx: ProgContext) => Result;
    /**
     * Visit a parse tree produced by `ExprParser.stat`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStat?: (ctx: StatContext) => Result;
    /**
     * Visit a parse tree produced by `ExprParser.exprStat`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExprStat?: (ctx: ExprStatContext) => Result;
    /**
     * Visit a parse tree produced by `ExprParser.assignStat`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAssignStat?: (ctx: AssignStatContext) => Result;
    /**
     * Visit a parse tree produced by `ExprParser.expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpr?: (ctx: ExprContext) => Result;
}
