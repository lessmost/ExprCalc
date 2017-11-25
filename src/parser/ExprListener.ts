// Generated from Expr.g4 by ANTLR 4.6-SNAPSHOT


import { ParseTreeListener } from 'antlr4ts/tree/ParseTreeListener';

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
 * This interface defines a complete listener for a parse tree produced by
 * `ExprParser`.
 */
export interface ExprListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `MulDivExpr`
	 * labeled alternative in `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	enterMulDivExpr?: (ctx: MulDivExprContext) => void;
	/**
	 * Exit a parse tree produced by the `MulDivExpr`
	 * labeled alternative in `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	exitMulDivExpr?: (ctx: MulDivExprContext) => void;

	/**
	 * Enter a parse tree produced by the `IdExpr`
	 * labeled alternative in `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	enterIdExpr?: (ctx: IdExprContext) => void;
	/**
	 * Exit a parse tree produced by the `IdExpr`
	 * labeled alternative in `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	exitIdExpr?: (ctx: IdExprContext) => void;

	/**
	 * Enter a parse tree produced by the `IntExpr`
	 * labeled alternative in `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	enterIntExpr?: (ctx: IntExprContext) => void;
	/**
	 * Exit a parse tree produced by the `IntExpr`
	 * labeled alternative in `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	exitIntExpr?: (ctx: IntExprContext) => void;

	/**
	 * Enter a parse tree produced by the `ParenExpr`
	 * labeled alternative in `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	enterParenExpr?: (ctx: ParenExprContext) => void;
	/**
	 * Exit a parse tree produced by the `ParenExpr`
	 * labeled alternative in `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	exitParenExpr?: (ctx: ParenExprContext) => void;

	/**
	 * Enter a parse tree produced by the `AddSubExpr`
	 * labeled alternative in `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	enterAddSubExpr?: (ctx: AddSubExprContext) => void;
	/**
	 * Exit a parse tree produced by the `AddSubExpr`
	 * labeled alternative in `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	exitAddSubExpr?: (ctx: AddSubExprContext) => void;

	/**
	 * Enter a parse tree produced by `ExprParser.prog`.
	 * @param ctx the parse tree
	 */
	enterProg?: (ctx: ProgContext) => void;
	/**
	 * Exit a parse tree produced by `ExprParser.prog`.
	 * @param ctx the parse tree
	 */
	exitProg?: (ctx: ProgContext) => void;

	/**
	 * Enter a parse tree produced by `ExprParser.stat`.
	 * @param ctx the parse tree
	 */
	enterStat?: (ctx: StatContext) => void;
	/**
	 * Exit a parse tree produced by `ExprParser.stat`.
	 * @param ctx the parse tree
	 */
	exitStat?: (ctx: StatContext) => void;

	/**
	 * Enter a parse tree produced by `ExprParser.exprStat`.
	 * @param ctx the parse tree
	 */
	enterExprStat?: (ctx: ExprStatContext) => void;
	/**
	 * Exit a parse tree produced by `ExprParser.exprStat`.
	 * @param ctx the parse tree
	 */
	exitExprStat?: (ctx: ExprStatContext) => void;

	/**
	 * Enter a parse tree produced by `ExprParser.assignStat`.
	 * @param ctx the parse tree
	 */
	enterAssignStat?: (ctx: AssignStatContext) => void;
	/**
	 * Exit a parse tree produced by `ExprParser.assignStat`.
	 * @param ctx the parse tree
	 */
	exitAssignStat?: (ctx: AssignStatContext) => void;

	/**
	 * Enter a parse tree produced by `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	enterExpr?: (ctx: ExprContext) => void;
	/**
	 * Exit a parse tree produced by `ExprParser.expr`.
	 * @param ctx the parse tree
	 */
	exitExpr?: (ctx: ExprContext) => void;
}

