"use strict";
// Generated from Expr.g4 by ANTLR 4.6-SNAPSHOT
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ATN_1 = require("antlr4ts/atn/ATN");
const ATNDeserializer_1 = require("antlr4ts/atn/ATNDeserializer");
const FailedPredicateException_1 = require("antlr4ts/FailedPredicateException");
const Decorators_1 = require("antlr4ts/Decorators");
const NoViableAltException_1 = require("antlr4ts/NoViableAltException");
const Decorators_2 = require("antlr4ts/Decorators");
const Parser_1 = require("antlr4ts/Parser");
const ParserRuleContext_1 = require("antlr4ts/ParserRuleContext");
const ParserATNSimulator_1 = require("antlr4ts/atn/ParserATNSimulator");
const RecognitionException_1 = require("antlr4ts/RecognitionException");
const RuleVersion_1 = require("antlr4ts/RuleVersion");
const Token_1 = require("antlr4ts/Token");
const VocabularyImpl_1 = require("antlr4ts/VocabularyImpl");
const Utils = require("antlr4ts/misc/Utils");
class ExprParser extends Parser_1.Parser {
    constructor(input) {
        super(input);
        this._interp = new ParserATNSimulator_1.ParserATNSimulator(ExprParser._ATN, this);
    }
    get vocabulary() {
        return ExprParser.VOCABULARY;
    }
    get grammarFileName() { return "Expr.g4"; }
    get ruleNames() { return ExprParser.ruleNames; }
    get serializedATN() { return ExprParser._serializedATN; }
    prog() {
        let _localctx = new ProgContext(this._ctx, this.state);
        this.enterRule(_localctx, 0, ExprParser.RULE_prog);
        let _la;
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
                } while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ExprParser.LPAREN) | (1 << ExprParser.ID) | (1 << ExprParser.INT))) !== 0));
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    stat() {
        let _localctx = new StatContext(this._ctx, this.state);
        this.enterRule(_localctx, 2, ExprParser.RULE_stat);
        try {
            this.state = 17;
            this._errHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this._input, 1, this._ctx)) {
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
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    exprStat() {
        let _localctx = new ExprStatContext(this._ctx, this.state);
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
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    assignStat() {
        let _localctx = new AssignStatContext(this._ctx, this.state);
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
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    }
    expr(_p) {
        if (_p === undefined) {
            _p = 0;
        }
        let _parentctx = this._ctx;
        let _parentState = this.state;
        let _localctx = new ExprContext(this._ctx, _parentState);
        let _prevctx = _localctx;
        let _startState = 8;
        this.enterRecursionRule(_localctx, 8, ExprParser.RULE_expr, _p);
        let _la;
        try {
            let _alt;
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
                        throw new NoViableAltException_1.NoViableAltException(this);
                }
                this._ctx._stop = this._input.tryLT(-1);
                this.state = 44;
                this._errHandler.sync(this);
                _alt = this.interpreter.adaptivePredict(this._input, 4, this._ctx);
                while (_alt !== 2 && _alt !== ATN_1.ATN.INVALID_ALT_NUMBER) {
                    if (_alt === 1) {
                        if (this._parseListeners != null)
                            this.triggerExitRuleEvent();
                        _prevctx = _localctx;
                        {
                            this.state = 42;
                            this._errHandler.sync(this);
                            switch (this.interpreter.adaptivePredict(this._input, 3, this._ctx)) {
                                case 1:
                                    {
                                        _localctx = new MulDivExprContext(new ExprContext(_parentctx, _parentState));
                                        this.pushNewRecursionContext(_localctx, _startState, ExprParser.RULE_expr);
                                        this.state = 36;
                                        if (!(this.precpred(this._ctx, 5)))
                                            throw new FailedPredicateException_1.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
                                        this.state = 37;
                                        _localctx._op = this._input.LT(1);
                                        _la = this._input.LA(1);
                                        if (!(_la === ExprParser.MUL || _la === ExprParser.DIV)) {
                                            _localctx._op = this._errHandler.recoverInline(this);
                                        }
                                        else {
                                            if (this._input.LA(1) === Token_1.Token.EOF) {
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
                                        if (!(this.precpred(this._ctx, 4)))
                                            throw new FailedPredicateException_1.FailedPredicateException(this, "this.precpred(this._ctx, 4)");
                                        this.state = 40;
                                        _localctx._op = this._input.LT(1);
                                        _la = this._input.LA(1);
                                        if (!(_la === ExprParser.ADD || _la === ExprParser.SUB)) {
                                            _localctx._op = this._errHandler.recoverInline(this);
                                        }
                                        else {
                                            if (this._input.LA(1) === Token_1.Token.EOF) {
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
                    _alt = this.interpreter.adaptivePredict(this._input, 4, this._ctx);
                }
            }
        }
        catch (re) {
            if (re instanceof RecognitionException_1.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.unrollRecursionContexts(_parentctx);
        }
        return _localctx;
    }
    sempred(_localctx, ruleIndex, predIndex) {
        switch (ruleIndex) {
            case 4:
                return this.expr_sempred(_localctx, predIndex);
        }
        return true;
    }
    expr_sempred(_localctx, predIndex) {
        switch (predIndex) {
            case 0:
                return this.precpred(this._ctx, 5);
            case 1:
                return this.precpred(this._ctx, 4);
        }
        return true;
    }
    static get _ATN() {
        if (!ExprParser.__ATN) {
            ExprParser.__ATN = new ATNDeserializer_1.ATNDeserializer().deserialize(Utils.toCharArray(ExprParser._serializedATN));
        }
        return ExprParser.__ATN;
    }
}
ExprParser.MUL = 1;
ExprParser.DIV = 2;
ExprParser.ADD = 3;
ExprParser.SUB = 4;
ExprParser.LPAREN = 5;
ExprParser.RPAREN = 6;
ExprParser.ID = 7;
ExprParser.INT = 8;
ExprParser.EQ = 9;
ExprParser.SEMI = 10;
ExprParser.COMMENT = 11;
ExprParser.WS = 12;
ExprParser.RULE_prog = 0;
ExprParser.RULE_stat = 1;
ExprParser.RULE_exprStat = 2;
ExprParser.RULE_assignStat = 3;
ExprParser.RULE_expr = 4;
ExprParser.ruleNames = [
    "prog", "stat", "exprStat", "assignStat", "expr"
];
ExprParser._LITERAL_NAMES = [
    undefined, "'*'", "'/'", "'+'", "'-'", "'('", "')'", undefined, undefined,
    "'='", "';'"
];
ExprParser._SYMBOLIC_NAMES = [
    undefined, "MUL", "DIV", "ADD", "SUB", "LPAREN", "RPAREN", "ID", "INT",
    "EQ", "SEMI", "COMMENT", "WS"
];
ExprParser.VOCABULARY = new VocabularyImpl_1.VocabularyImpl(ExprParser._LITERAL_NAMES, ExprParser._SYMBOLIC_NAMES, []);
ExprParser._serializedATN = "\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x03\x0E2\x04\x02" +
    "\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x03\x02" +
    "\x06\x02\x0E\n\x02\r\x02\x0E\x02\x0F\x03\x03\x03\x03\x05\x03\x14\n\x03" +
    "\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x06" +
    "\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x05\x06%\n\x06\x03\x06" +
    "\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06-\n\x06\f\x06\x0E\x06" +
    "0\v\x06\x03\x06\x02\x02\x03\n\x07\x02\x02\x04\x02\x06\x02\b\x02\n\x02" +
    "\x02\x04\x03\x02\x03\x04\x03\x02\x05\x062\x02\r\x03\x02\x02\x02\x04\x13" +
    "\x03\x02\x02\x02\x06\x15\x03\x02\x02\x02\b\x18\x03\x02\x02\x02\n$\x03" +
    "\x02\x02\x02\f\x0E\x05\x04\x03\x02\r\f\x03\x02\x02\x02\x0E\x0F\x03\x02" +
    "\x02\x02\x0F\r\x03\x02\x02\x02\x0F\x10\x03\x02\x02\x02\x10\x03\x03\x02" +
    "\x02\x02\x11\x14\x05\x06\x04\x02\x12\x14\x05\b\x05\x02\x13\x11\x03\x02" +
    "\x02\x02\x13\x12\x03\x02\x02\x02\x14\x05\x03\x02\x02\x02\x15\x16\x05\n" +
    "\x06\x02\x16\x17\x07\f\x02\x02\x17\x07\x03\x02\x02\x02\x18\x19\x07\t\x02" +
    "\x02\x19\x1A\x07\v\x02\x02\x1A\x1B\x05\n\x06\x02\x1B\x1C\x07\f\x02\x02" +
    "\x1C\t\x03\x02\x02\x02\x1D\x1E\b\x06\x01\x02\x1E%\x07\n\x02\x02\x1F%\x07" +
    "\t\x02\x02 !\x07\x07\x02\x02!\"\x05\n\x06\x02\"#\x07\b\x02\x02#%\x03\x02" +
    "\x02\x02$\x1D\x03\x02\x02\x02$\x1F\x03\x02\x02\x02$ \x03\x02\x02\x02%" +
    ".\x03\x02\x02\x02&\'\f\x07\x02\x02\'(\t\x02\x02\x02(-\x05\n\x06\b)*\f" +
    "\x06\x02\x02*+\t\x03\x02\x02+-\x05\n\x06\x07,&\x03\x02\x02\x02,)\x03\x02" +
    "\x02\x02-0\x03\x02\x02\x02.,\x03\x02\x02\x02./\x03\x02\x02\x02/\v\x03" +
    "\x02\x02\x020.\x03\x02\x02\x02\x07\x0F\x13$,.";
__decorate([
    Decorators_2.Override,
    Decorators_1.NotNull
], ExprParser.prototype, "vocabulary", null);
__decorate([
    Decorators_2.Override
], ExprParser.prototype, "grammarFileName", null);
__decorate([
    Decorators_2.Override
], ExprParser.prototype, "ruleNames", null);
__decorate([
    Decorators_2.Override
], ExprParser.prototype, "serializedATN", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], ExprParser.prototype, "prog", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], ExprParser.prototype, "stat", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], ExprParser.prototype, "exprStat", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], ExprParser.prototype, "assignStat", null);
__decorate([
    RuleVersion_1.RuleVersion(0)
], ExprParser.prototype, "expr", null);
exports.ExprParser = ExprParser;
class ProgContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    stat(i) {
        if (i === undefined) {
            return this.getRuleContexts(StatContext);
        }
        else {
            return this.getRuleContext(i, StatContext);
        }
    }
    get ruleIndex() { return ExprParser.RULE_prog; }
    enterRule(listener) {
        if (listener.enterProg)
            listener.enterProg(this);
    }
    exitRule(listener) {
        if (listener.exitProg)
            listener.exitProg(this);
    }
    accept(visitor) {
        if (visitor.visitProg)
            return visitor.visitProg(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], ProgContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], ProgContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], ProgContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], ProgContext.prototype, "accept", null);
exports.ProgContext = ProgContext;
class StatContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    exprStat() {
        return this.tryGetRuleContext(0, ExprStatContext);
    }
    assignStat() {
        return this.tryGetRuleContext(0, AssignStatContext);
    }
    get ruleIndex() { return ExprParser.RULE_stat; }
    enterRule(listener) {
        if (listener.enterStat)
            listener.enterStat(this);
    }
    exitRule(listener) {
        if (listener.exitStat)
            listener.exitStat(this);
    }
    accept(visitor) {
        if (visitor.visitStat)
            return visitor.visitStat(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], StatContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], StatContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], StatContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], StatContext.prototype, "accept", null);
exports.StatContext = StatContext;
class ExprStatContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    expr() {
        return this.getRuleContext(0, ExprContext);
    }
    SEMI() { return this.getToken(ExprParser.SEMI, 0); }
    get ruleIndex() { return ExprParser.RULE_exprStat; }
    enterRule(listener) {
        if (listener.enterExprStat)
            listener.enterExprStat(this);
    }
    exitRule(listener) {
        if (listener.exitExprStat)
            listener.exitExprStat(this);
    }
    accept(visitor) {
        if (visitor.visitExprStat)
            return visitor.visitExprStat(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], ExprStatContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], ExprStatContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], ExprStatContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], ExprStatContext.prototype, "accept", null);
exports.ExprStatContext = ExprStatContext;
class AssignStatContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        super(parent, invokingState);
    }
    ID() { return this.getToken(ExprParser.ID, 0); }
    EQ() { return this.getToken(ExprParser.EQ, 0); }
    expr() {
        return this.getRuleContext(0, ExprContext);
    }
    SEMI() { return this.getToken(ExprParser.SEMI, 0); }
    get ruleIndex() { return ExprParser.RULE_assignStat; }
    enterRule(listener) {
        if (listener.enterAssignStat)
            listener.enterAssignStat(this);
    }
    exitRule(listener) {
        if (listener.exitAssignStat)
            listener.exitAssignStat(this);
    }
    accept(visitor) {
        if (visitor.visitAssignStat)
            return visitor.visitAssignStat(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], AssignStatContext.prototype, "ruleIndex", null);
__decorate([
    Decorators_2.Override
], AssignStatContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], AssignStatContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], AssignStatContext.prototype, "accept", null);
exports.AssignStatContext = AssignStatContext;
class ExprContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingState) {
        if (parent !== undefined && invokingState !== undefined) {
            super(parent, invokingState);
        }
        else {
            super();
        }
    }
    get ruleIndex() { return ExprParser.RULE_expr; }
    copyFrom(ctx) {
        super.copyFrom(ctx);
    }
}
__decorate([
    Decorators_2.Override
], ExprContext.prototype, "ruleIndex", null);
exports.ExprContext = ExprContext;
class MulDivExprContext extends ExprContext {
    constructor(ctx) { super(); this.copyFrom(ctx); }
    expr(i) {
        if (i === undefined) {
            return this.getRuleContexts(ExprContext);
        }
        else {
            return this.getRuleContext(i, ExprContext);
        }
    }
    MUL() { return this.tryGetToken(ExprParser.MUL, 0); }
    DIV() { return this.tryGetToken(ExprParser.DIV, 0); }
    enterRule(listener) {
        if (listener.enterMulDivExpr)
            listener.enterMulDivExpr(this);
    }
    exitRule(listener) {
        if (listener.exitMulDivExpr)
            listener.exitMulDivExpr(this);
    }
    accept(visitor) {
        if (visitor.visitMulDivExpr)
            return visitor.visitMulDivExpr(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], MulDivExprContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], MulDivExprContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], MulDivExprContext.prototype, "accept", null);
exports.MulDivExprContext = MulDivExprContext;
class IdExprContext extends ExprContext {
    constructor(ctx) { super(); this.copyFrom(ctx); }
    ID() { return this.getToken(ExprParser.ID, 0); }
    enterRule(listener) {
        if (listener.enterIdExpr)
            listener.enterIdExpr(this);
    }
    exitRule(listener) {
        if (listener.exitIdExpr)
            listener.exitIdExpr(this);
    }
    accept(visitor) {
        if (visitor.visitIdExpr)
            return visitor.visitIdExpr(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], IdExprContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], IdExprContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], IdExprContext.prototype, "accept", null);
exports.IdExprContext = IdExprContext;
class IntExprContext extends ExprContext {
    constructor(ctx) { super(); this.copyFrom(ctx); }
    INT() { return this.getToken(ExprParser.INT, 0); }
    enterRule(listener) {
        if (listener.enterIntExpr)
            listener.enterIntExpr(this);
    }
    exitRule(listener) {
        if (listener.exitIntExpr)
            listener.exitIntExpr(this);
    }
    accept(visitor) {
        if (visitor.visitIntExpr)
            return visitor.visitIntExpr(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], IntExprContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], IntExprContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], IntExprContext.prototype, "accept", null);
exports.IntExprContext = IntExprContext;
class ParenExprContext extends ExprContext {
    constructor(ctx) { super(); this.copyFrom(ctx); }
    LPAREN() { return this.getToken(ExprParser.LPAREN, 0); }
    expr() {
        return this.getRuleContext(0, ExprContext);
    }
    RPAREN() { return this.getToken(ExprParser.RPAREN, 0); }
    enterRule(listener) {
        if (listener.enterParenExpr)
            listener.enterParenExpr(this);
    }
    exitRule(listener) {
        if (listener.exitParenExpr)
            listener.exitParenExpr(this);
    }
    accept(visitor) {
        if (visitor.visitParenExpr)
            return visitor.visitParenExpr(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], ParenExprContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], ParenExprContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], ParenExprContext.prototype, "accept", null);
exports.ParenExprContext = ParenExprContext;
class AddSubExprContext extends ExprContext {
    constructor(ctx) { super(); this.copyFrom(ctx); }
    expr(i) {
        if (i === undefined) {
            return this.getRuleContexts(ExprContext);
        }
        else {
            return this.getRuleContext(i, ExprContext);
        }
    }
    ADD() { return this.tryGetToken(ExprParser.ADD, 0); }
    SUB() { return this.tryGetToken(ExprParser.SUB, 0); }
    enterRule(listener) {
        if (listener.enterAddSubExpr)
            listener.enterAddSubExpr(this);
    }
    exitRule(listener) {
        if (listener.exitAddSubExpr)
            listener.exitAddSubExpr(this);
    }
    accept(visitor) {
        if (visitor.visitAddSubExpr)
            return visitor.visitAddSubExpr(this);
        else
            return visitor.visitChildren(this);
    }
}
__decorate([
    Decorators_2.Override
], AddSubExprContext.prototype, "enterRule", null);
__decorate([
    Decorators_2.Override
], AddSubExprContext.prototype, "exitRule", null);
__decorate([
    Decorators_2.Override
], AddSubExprContext.prototype, "accept", null);
exports.AddSubExprContext = AddSubExprContext;
//# sourceMappingURL=ExprParser.js.map