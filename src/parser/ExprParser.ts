// Generated from Expr.g4 by ANTLR 4.6-SNAPSHOT


import { ATN } from 'antlr4ts/atn/ATN';
import { ATNDeserializer } from 'antlr4ts/atn/ATNDeserializer';
import { FailedPredicateException } from 'antlr4ts/FailedPredicateException';
import { NotNull } from 'antlr4ts/Decorators';
import { NoViableAltException } from 'antlr4ts/NoViableAltException';
import { Override } from 'antlr4ts/Decorators';
import { Parser } from 'antlr4ts/Parser';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { ParserATNSimulator } from 'antlr4ts/atn/ParserATNSimulator';
import { ParseTreeListener } from 'antlr4ts/tree/ParseTreeListener';
import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor';
import { RecognitionException } from 'antlr4ts/RecognitionException';
import { RuleContext } from 'antlr4ts/RuleContext';
import { RuleVersion } from 'antlr4ts/RuleVersion';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { Token } from 'antlr4ts/Token';
import { TokenStream } from 'antlr4ts/TokenStream';
import { Vocabulary } from 'antlr4ts/Vocabulary';
import { VocabularyImpl } from 'antlr4ts/VocabularyImpl';

import * as Utils from 'antlr4ts/misc/Utils';

import { ExprListener } from './ExprListener';
import { ExprVisitor } from './ExprVisitor';


export class ExprParser extends Parser {
	public static readonly MUL=1;
	public static readonly DIV=2;
	public static readonly ADD=3;
	public static readonly SUB=4;
	public static readonly LPAREN=5;
	public static readonly RPAREN=6;
	public static readonly ID=7;
	public static readonly INT=8;
	public static readonly EQ=9;
	public static readonly SEMI=10;
	public static readonly COMMENT=11;
	public static readonly WS=12;
	public static readonly RULE_prog = 0;
	public static readonly RULE_stat = 1;
	public static readonly RULE_exprStat = 2;
	public static readonly RULE_assignStat = 3;
	public static readonly RULE_expr = 4;
	public static readonly ruleNames: string[] = [
		"prog", "stat", "exprStat", "assignStat", "expr"
	];

	private static readonly _LITERAL_NAMES: (string | undefined)[] = [
		undefined, "'*'", "'/'", "'+'", "'-'", "'('", "')'", undefined, undefined, 
		"'='", "';'"
	];
	private static readonly _SYMBOLIC_NAMES: (string | undefined)[] = [
		undefined, "MUL", "DIV", "ADD", "SUB", "LPAREN", "RPAREN", "ID", "INT", 
		"EQ", "SEMI", "COMMENT", "WS"
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(ExprParser._LITERAL_NAMES, ExprParser._SYMBOLIC_NAMES, []);

	@Override
	@NotNull
	public get vocabulary(): Vocabulary {
		return ExprParser.VOCABULARY;
	}

	@Override
	public get grammarFileName(): string { return "Expr.g4"; }

	@Override
	public get ruleNames(): string[] { return ExprParser.ruleNames; }

	@Override
	public get serializedATN(): string { return ExprParser._serializedATN; }

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(ExprParser._ATN, this);
	}
	@RuleVersion(0)
	public prog(): ProgContext {
		let _localctx: ProgContext = new ProgContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, ExprParser.RULE_prog);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 11; 
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 10;
				this.stat();
				}
				}
				this.state = 13; 
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ( (((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ExprParser.LPAREN) | (1 << ExprParser.ID) | (1 << ExprParser.INT))) !== 0) );
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public stat(): StatContext {
		let _localctx: StatContext = new StatContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, ExprParser.RULE_stat);
		try {
			this.state = 17;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input,1,this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 15;
				this.exprStat();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 16;
				this.assignStat();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public exprStat(): ExprStatContext {
		let _localctx: ExprStatContext = new ExprStatContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, ExprParser.RULE_exprStat);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 19;
			this.expr(0);
			this.state = 20;
			this.match(ExprParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	@RuleVersion(0)
	public assignStat(): AssignStatContext {
		let _localctx: AssignStatContext = new AssignStatContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, ExprParser.RULE_assignStat);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 22;
			this.match(ExprParser.ID);
			this.state = 23;
			this.match(ExprParser.EQ);
			this.state = 24;
			this.expr(0);
			this.state = 25;
			this.match(ExprParser.SEMI);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public expr(): ExprContext;
	public expr(_p: number): ExprContext;
	@RuleVersion(0)
	public expr(_p?: number): ExprContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExprContext = new ExprContext(this._ctx, _parentState);
		let _prevctx: ExprContext = _localctx;
		let _startState: number = 8;
		this.enterRecursionRule(_localctx, 8, ExprParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 34;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case ExprParser.INT:
				{
				_localctx = new IntExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 28;
				this.match(ExprParser.INT);
				}
				break;
			case ExprParser.ID:
				{
				_localctx = new IdExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 29;
				this.match(ExprParser.ID);
				}
				break;
			case ExprParser.LPAREN:
				{
				_localctx = new ParenExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 30;
				this.match(ExprParser.LPAREN);
				this.state = 31;
				this.expr(0);
				this.state = 32;
				this.match(ExprParser.RPAREN);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 44;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input,4,this._ctx);
			while ( _alt!==2 && _alt!==ATN.INVALID_ALT_NUMBER ) {
				if ( _alt===1 ) {
					if ( this._parseListeners!=null ) this.triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					this.state = 42;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input,3,this._ctx) ) {
					case 1:
						{
						_localctx = new MulDivExprContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExprParser.RULE_expr);
						this.state = 36;
						if (!(this.precpred(this._ctx, 5))) throw new FailedPredicateException(this, "this.precpred(this._ctx, 5)");
						this.state = 37;
						(_localctx as MulDivExprContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if ( !(_la===ExprParser.MUL || _la===ExprParser.DIV) ) {
							(_localctx as MulDivExprContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 38;
						this.expr(6);
						}
						break;

					case 2:
						{
						_localctx = new AddSubExprContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, ExprParser.RULE_expr);
						this.state = 39;
						if (!(this.precpred(this._ctx, 4))) throw new FailedPredicateException(this, "this.precpred(this._ctx, 4)");
						this.state = 40;
						(_localctx as AddSubExprContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if ( !(_la===ExprParser.ADD || _la===ExprParser.SUB) ) {
							(_localctx as AddSubExprContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 41;
						this.expr(5);
						}
						break;
					}
					} 
				}
				this.state = 46;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input,4,this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 4:
			return this.expr_sempred(_localctx as ExprContext, predIndex);
		}
		return true;
	}
	private expr_sempred(_localctx: ExprContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 5);

		case 1:
			return this.precpred(this._ctx, 4);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x03\x0E2\x04\x02"+
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x03\x02"+
		"\x06\x02\x0E\n\x02\r\x02\x0E\x02\x0F\x03\x03\x03\x03\x05\x03\x14\n\x03"+
		"\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x06"+
		"\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x05\x06%\n\x06\x03\x06"+
		"\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06-\n\x06\f\x06\x0E\x06"+
		"0\v\x06\x03\x06\x02\x02\x03\n\x07\x02\x02\x04\x02\x06\x02\b\x02\n\x02"+
		"\x02\x04\x03\x02\x03\x04\x03\x02\x05\x062\x02\r\x03\x02\x02\x02\x04\x13"+
		"\x03\x02\x02\x02\x06\x15\x03\x02\x02\x02\b\x18\x03\x02\x02\x02\n$\x03"+
		"\x02\x02\x02\f\x0E\x05\x04\x03\x02\r\f\x03\x02\x02\x02\x0E\x0F\x03\x02"+
		"\x02\x02\x0F\r\x03\x02\x02\x02\x0F\x10\x03\x02\x02\x02\x10\x03\x03\x02"+
		"\x02\x02\x11\x14\x05\x06\x04\x02\x12\x14\x05\b\x05\x02\x13\x11\x03\x02"+
		"\x02\x02\x13\x12\x03\x02\x02\x02\x14\x05\x03\x02\x02\x02\x15\x16\x05\n"+
		"\x06\x02\x16\x17\x07\f\x02\x02\x17\x07\x03\x02\x02\x02\x18\x19\x07\t\x02"+
		"\x02\x19\x1A\x07\v\x02\x02\x1A\x1B\x05\n\x06\x02\x1B\x1C\x07\f\x02\x02"+
		"\x1C\t\x03\x02\x02\x02\x1D\x1E\b\x06\x01\x02\x1E%\x07\n\x02\x02\x1F%\x07"+
		"\t\x02\x02 !\x07\x07\x02\x02!\"\x05\n\x06\x02\"#\x07\b\x02\x02#%\x03\x02"+
		"\x02\x02$\x1D\x03\x02\x02\x02$\x1F\x03\x02\x02\x02$ \x03\x02\x02\x02%"+
		".\x03\x02\x02\x02&\'\f\x07\x02\x02\'(\t\x02\x02\x02(-\x05\n\x06\b)*\f"+
		"\x06\x02\x02*+\t\x03\x02\x02+-\x05\n\x06\x07,&\x03\x02\x02\x02,)\x03\x02"+
		"\x02\x02-0\x03\x02\x02\x02.,\x03\x02\x02\x02./\x03\x02\x02\x02/\v\x03"+
		"\x02\x02\x020.\x03\x02\x02\x02\x07\x0F\x13$,.";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ExprParser.__ATN) {
			ExprParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(ExprParser._serializedATN));
		}

		return ExprParser.__ATN;
	}

}

export class ProgContext extends ParserRuleContext {
	public stat(): StatContext[];
	public stat(i: number): StatContext;
	public stat(i?: number): StatContext | StatContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StatContext);
		} else {
			return this.getRuleContext(i, StatContext);
		}
	}
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ExprParser.RULE_prog; }
	@Override
	public enterRule(listener: ExprListener): void {
		if (listener.enterProg) listener.enterProg(this);
	}
	@Override
	public exitRule(listener: ExprListener): void {
		if (listener.exitProg) listener.exitProg(this);
	}
	@Override
	public accept<Result>(visitor: ExprVisitor<Result>): Result {
		if (visitor.visitProg) return visitor.visitProg(this);
		else return visitor.visitChildren(this);
	}
}


export class StatContext extends ParserRuleContext {
	public exprStat(): ExprStatContext | undefined {
		return this.tryGetRuleContext(0, ExprStatContext);
	}
	public assignStat(): AssignStatContext | undefined {
		return this.tryGetRuleContext(0, AssignStatContext);
	}
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ExprParser.RULE_stat; }
	@Override
	public enterRule(listener: ExprListener): void {
		if (listener.enterStat) listener.enterStat(this);
	}
	@Override
	public exitRule(listener: ExprListener): void {
		if (listener.exitStat) listener.exitStat(this);
	}
	@Override
	public accept<Result>(visitor: ExprVisitor<Result>): Result {
		if (visitor.visitStat) return visitor.visitStat(this);
		else return visitor.visitChildren(this);
	}
}


export class ExprStatContext extends ParserRuleContext {
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public SEMI(): TerminalNode { return this.getToken(ExprParser.SEMI, 0); }
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ExprParser.RULE_exprStat; }
	@Override
	public enterRule(listener: ExprListener): void {
		if (listener.enterExprStat) listener.enterExprStat(this);
	}
	@Override
	public exitRule(listener: ExprListener): void {
		if (listener.exitExprStat) listener.exitExprStat(this);
	}
	@Override
	public accept<Result>(visitor: ExprVisitor<Result>): Result {
		if (visitor.visitExprStat) return visitor.visitExprStat(this);
		else return visitor.visitChildren(this);
	}
}


export class AssignStatContext extends ParserRuleContext {
	public ID(): TerminalNode { return this.getToken(ExprParser.ID, 0); }
	public EQ(): TerminalNode { return this.getToken(ExprParser.EQ, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public SEMI(): TerminalNode { return this.getToken(ExprParser.SEMI, 0); }
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent: ParserRuleContext, invokingState: number) {
		super(parent, invokingState);

	}
	@Override public get ruleIndex(): number { return ExprParser.RULE_assignStat; }
	@Override
	public enterRule(listener: ExprListener): void {
		if (listener.enterAssignStat) listener.enterAssignStat(this);
	}
	@Override
	public exitRule(listener: ExprListener): void {
		if (listener.exitAssignStat) listener.exitAssignStat(this);
	}
	@Override
	public accept<Result>(visitor: ExprVisitor<Result>): Result {
		if (visitor.visitAssignStat) return visitor.visitAssignStat(this);
		else return visitor.visitChildren(this);
	}
}


export class ExprContext extends ParserRuleContext {
	constructor();
	constructor(parent: ParserRuleContext, invokingState: number);
	constructor(parent?: ParserRuleContext, invokingState?: number) {
		if (parent !== undefined && invokingState !== undefined) {
			super(parent, invokingState);
		} else {
			super();
		}
	}
	@Override public get ruleIndex(): number { return ExprParser.RULE_expr; }
 
	public copyFrom(ctx: ExprContext): void {
		super.copyFrom(ctx);
	}
}
export class MulDivExprContext extends ExprContext {
	public _op: Token;
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public MUL(): TerminalNode | undefined { return this.tryGetToken(ExprParser.MUL, 0); }
	public DIV(): TerminalNode | undefined { return this.tryGetToken(ExprParser.DIV, 0); }
	constructor(ctx: ExprContext) { super(); this.copyFrom(ctx); }
	@Override
	public enterRule(listener: ExprListener): void {
		if (listener.enterMulDivExpr) listener.enterMulDivExpr(this);
	}
	@Override
	public exitRule(listener: ExprListener): void {
		if (listener.exitMulDivExpr) listener.exitMulDivExpr(this);
	}
	@Override
	public accept<Result>(visitor: ExprVisitor<Result>): Result {
		if (visitor.visitMulDivExpr) return visitor.visitMulDivExpr(this);
		else return visitor.visitChildren(this);
	}
}
export class IdExprContext extends ExprContext {
	public ID(): TerminalNode { return this.getToken(ExprParser.ID, 0); }
	constructor(ctx: ExprContext) { super(); this.copyFrom(ctx); }
	@Override
	public enterRule(listener: ExprListener): void {
		if (listener.enterIdExpr) listener.enterIdExpr(this);
	}
	@Override
	public exitRule(listener: ExprListener): void {
		if (listener.exitIdExpr) listener.exitIdExpr(this);
	}
	@Override
	public accept<Result>(visitor: ExprVisitor<Result>): Result {
		if (visitor.visitIdExpr) return visitor.visitIdExpr(this);
		else return visitor.visitChildren(this);
	}
}
export class IntExprContext extends ExprContext {
	public INT(): TerminalNode { return this.getToken(ExprParser.INT, 0); }
	constructor(ctx: ExprContext) { super(); this.copyFrom(ctx); }
	@Override
	public enterRule(listener: ExprListener): void {
		if (listener.enterIntExpr) listener.enterIntExpr(this);
	}
	@Override
	public exitRule(listener: ExprListener): void {
		if (listener.exitIntExpr) listener.exitIntExpr(this);
	}
	@Override
	public accept<Result>(visitor: ExprVisitor<Result>): Result {
		if (visitor.visitIntExpr) return visitor.visitIntExpr(this);
		else return visitor.visitChildren(this);
	}
}
export class ParenExprContext extends ExprContext {
	public LPAREN(): TerminalNode { return this.getToken(ExprParser.LPAREN, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(ExprParser.RPAREN, 0); }
	constructor(ctx: ExprContext) { super(); this.copyFrom(ctx); }
	@Override
	public enterRule(listener: ExprListener): void {
		if (listener.enterParenExpr) listener.enterParenExpr(this);
	}
	@Override
	public exitRule(listener: ExprListener): void {
		if (listener.exitParenExpr) listener.exitParenExpr(this);
	}
	@Override
	public accept<Result>(visitor: ExprVisitor<Result>): Result {
		if (visitor.visitParenExpr) return visitor.visitParenExpr(this);
		else return visitor.visitChildren(this);
	}
}
export class AddSubExprContext extends ExprContext {
	public _op: Token;
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public ADD(): TerminalNode | undefined { return this.tryGetToken(ExprParser.ADD, 0); }
	public SUB(): TerminalNode | undefined { return this.tryGetToken(ExprParser.SUB, 0); }
	constructor(ctx: ExprContext) { super(); this.copyFrom(ctx); }
	@Override
	public enterRule(listener: ExprListener): void {
		if (listener.enterAddSubExpr) listener.enterAddSubExpr(this);
	}
	@Override
	public exitRule(listener: ExprListener): void {
		if (listener.exitAddSubExpr) listener.exitAddSubExpr(this);
	}
	@Override
	public accept<Result>(visitor: ExprVisitor<Result>): Result {
		if (visitor.visitAddSubExpr) return visitor.visitAddSubExpr(this);
		else return visitor.visitChildren(this);
	}
}


