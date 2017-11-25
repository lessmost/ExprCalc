import { ATN } from 'antlr4ts/atn/ATN';
import { Parser } from 'antlr4ts/Parser';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { RuleContext } from 'antlr4ts/RuleContext';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { Token } from 'antlr4ts/Token';
import { TokenStream } from 'antlr4ts/TokenStream';
import { Vocabulary } from 'antlr4ts/Vocabulary';
import { ExprListener } from './ExprListener';
import { ExprVisitor } from './ExprVisitor';
export declare class ExprParser extends Parser {
    static readonly MUL: number;
    static readonly DIV: number;
    static readonly ADD: number;
    static readonly SUB: number;
    static readonly LPAREN: number;
    static readonly RPAREN: number;
    static readonly ID: number;
    static readonly INT: number;
    static readonly EQ: number;
    static readonly SEMI: number;
    static readonly COMMENT: number;
    static readonly WS: number;
    static readonly RULE_prog: number;
    static readonly RULE_stat: number;
    static readonly RULE_exprStat: number;
    static readonly RULE_assignStat: number;
    static readonly RULE_expr: number;
    static readonly ruleNames: string[];
    private static readonly _LITERAL_NAMES;
    private static readonly _SYMBOLIC_NAMES;
    static readonly VOCABULARY: Vocabulary;
    readonly vocabulary: Vocabulary;
    readonly grammarFileName: string;
    readonly ruleNames: string[];
    readonly serializedATN: string;
    constructor(input: TokenStream);
    prog(): ProgContext;
    stat(): StatContext;
    exprStat(): ExprStatContext;
    assignStat(): AssignStatContext;
    expr(): ExprContext;
    expr(_p: number): ExprContext;
    sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean;
    private expr_sempred(_localctx, predIndex);
    static readonly _serializedATN: string;
    static __ATN: ATN;
    static readonly _ATN: ATN;
}
export declare class ProgContext extends ParserRuleContext {
    stat(): StatContext[];
    stat(i: number): StatContext;
    constructor(parent: ParserRuleContext, invokingState: number);
    readonly ruleIndex: number;
    enterRule(listener: ExprListener): void;
    exitRule(listener: ExprListener): void;
    accept<Result>(visitor: ExprVisitor<Result>): Result;
}
export declare class StatContext extends ParserRuleContext {
    exprStat(): ExprStatContext | undefined;
    assignStat(): AssignStatContext | undefined;
    constructor(parent: ParserRuleContext, invokingState: number);
    readonly ruleIndex: number;
    enterRule(listener: ExprListener): void;
    exitRule(listener: ExprListener): void;
    accept<Result>(visitor: ExprVisitor<Result>): Result;
}
export declare class ExprStatContext extends ParserRuleContext {
    expr(): ExprContext;
    SEMI(): TerminalNode;
    constructor(parent: ParserRuleContext, invokingState: number);
    readonly ruleIndex: number;
    enterRule(listener: ExprListener): void;
    exitRule(listener: ExprListener): void;
    accept<Result>(visitor: ExprVisitor<Result>): Result;
}
export declare class AssignStatContext extends ParserRuleContext {
    ID(): TerminalNode;
    EQ(): TerminalNode;
    expr(): ExprContext;
    SEMI(): TerminalNode;
    constructor(parent: ParserRuleContext, invokingState: number);
    readonly ruleIndex: number;
    enterRule(listener: ExprListener): void;
    exitRule(listener: ExprListener): void;
    accept<Result>(visitor: ExprVisitor<Result>): Result;
}
export declare class ExprContext extends ParserRuleContext {
    constructor();
    constructor(parent: ParserRuleContext, invokingState: number);
    readonly ruleIndex: number;
    copyFrom(ctx: ExprContext): void;
}
export declare class MulDivExprContext extends ExprContext {
    _op: Token;
    expr(): ExprContext[];
    expr(i: number): ExprContext;
    MUL(): TerminalNode | undefined;
    DIV(): TerminalNode | undefined;
    constructor(ctx: ExprContext);
    enterRule(listener: ExprListener): void;
    exitRule(listener: ExprListener): void;
    accept<Result>(visitor: ExprVisitor<Result>): Result;
}
export declare class IdExprContext extends ExprContext {
    ID(): TerminalNode;
    constructor(ctx: ExprContext);
    enterRule(listener: ExprListener): void;
    exitRule(listener: ExprListener): void;
    accept<Result>(visitor: ExprVisitor<Result>): Result;
}
export declare class IntExprContext extends ExprContext {
    INT(): TerminalNode;
    constructor(ctx: ExprContext);
    enterRule(listener: ExprListener): void;
    exitRule(listener: ExprListener): void;
    accept<Result>(visitor: ExprVisitor<Result>): Result;
}
export declare class ParenExprContext extends ExprContext {
    LPAREN(): TerminalNode;
    expr(): ExprContext;
    RPAREN(): TerminalNode;
    constructor(ctx: ExprContext);
    enterRule(listener: ExprListener): void;
    exitRule(listener: ExprListener): void;
    accept<Result>(visitor: ExprVisitor<Result>): Result;
}
export declare class AddSubExprContext extends ExprContext {
    _op: Token;
    expr(): ExprContext[];
    expr(i: number): ExprContext;
    ADD(): TerminalNode | undefined;
    SUB(): TerminalNode | undefined;
    constructor(ctx: ExprContext);
    enterRule(listener: ExprListener): void;
    exitRule(listener: ExprListener): void;
    accept<Result>(visitor: ExprVisitor<Result>): Result;
}
