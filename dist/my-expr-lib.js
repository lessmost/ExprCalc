(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MyExpr = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : ExprErrorListener.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ExprErrorListener {
    constructor() {
        this.errors = [];
    }
    syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, e) {
        this.errors.push(`[${line}:${charPositionInLine}] ${msg}`);
    }
    hasError() {
        return this.errors.length > 0;
    }
    print() {
        return this.errors.join('\n');
    }
}
exports.default = ExprErrorListener;

},{}],2:[function(require,module,exports){
"use strict";
/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : ExprEvalVisitor.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tree_1 = require("antlr4ts/tree");
const ExprParser_1 = require("./parser/ExprParser");
class ExprEvalVisitor extends tree_1.AbstractParseTreeVisitor {
    constructor() {
        super(...arguments);
        // 保存执行输出结果
        this.buffers = [];
        // 保存变量
        this.memory = {};
    }
    defaultResult() {
        return 0;
    }
    visitExprStat(ctx) {
        const val = this.visit(ctx.expr());
        this.buffers.push(`${val}`);
        return val;
    }
    visitAssignStat(ctx) {
        const id = ctx.ID().text;
        const val = this.visit(ctx.expr());
        this.memory[id] = val;
        return val;
    }
    visitAddSubExpr(ctx) {
        const left = this.visit(ctx.expr(0));
        const right = this.visit(ctx.expr(1));
        const op = ctx._op;
        if (op.type === ExprParser_1.ExprParser.ADD) {
            return left + right;
        }
        return left - right;
    }
    visitMulDivExpr(ctx) {
        const left = this.visit(ctx.expr(0));
        const right = this.visit(ctx.expr(1));
        const op = ctx._op;
        if (op.type === ExprParser_1.ExprParser.MUL) {
            return left * right;
        }
        return left / right;
    }
    visitIdExpr(ctx) {
        const id = ctx.ID().text;
        if (this.memory[id] !== undefined) {
            return this.memory[id];
        }
        return 0;
    }
    visitIntExpr(ctx) {
        return parseInt(ctx.INT().text, 10);
    }
    visitParenExpr(ctx) {
        return this.visit(ctx.expr());
    }
    print() {
        return this.buffers.join('\n');
    }
}
exports.default = ExprEvalVisitor;

},{"./parser/ExprParser":7,"antlr4ts/tree":126}],3:[function(require,module,exports){
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

},{"./parser/ExprParser":7,"antlr4ts/tree":126}],4:[function(require,module,exports){
"use strict";
/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : execute.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const antlr4ts_1 = require("antlr4ts");
const ExprLexer_1 = require("./parser/ExprLexer");
const ExprParser_1 = require("./parser/ExprParser");
const ExprErrorListener_1 = require("./ExprErrorListener");
const ExprEvalVisitor_1 = require("./ExprEvalVisitor");
function execute(code) {
    const input = new antlr4ts_1.ANTLRInputStream(code);
    const lexer = new ExprLexer_1.ExprLexer(input);
    const tokens = new antlr4ts_1.CommonTokenStream(lexer);
    const parser = new ExprParser_1.ExprParser(tokens);
    const listener = new ExprErrorListener_1.default();
    const visitor = new ExprEvalVisitor_1.default();
    lexer.removeErrorListeners();
    parser.removeErrorListeners();
    lexer.addErrorListener(listener);
    parser.addErrorListener(listener);
    const prog = parser.prog();
    visitor.visit(prog);
    if (listener.hasError()) {
        return listener.print();
    }
    return visitor.print();
}
exports.default = execute;

},{"./ExprErrorListener":1,"./ExprEvalVisitor":2,"./parser/ExprLexer":6,"./parser/ExprParser":7,"antlr4ts":102}],5:[function(require,module,exports){
"use strict";
/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : index.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const execute_1 = require("./execute");
exports.execute = execute_1.default;
const translate_1 = require("./translate");
exports.translate = translate_1.default;

},{"./execute":4,"./translate":8}],6:[function(require,module,exports){
"use strict";
// Generated from Expr.g4 by ANTLR 4.6-SNAPSHOT
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ATNDeserializer_1 = require("antlr4ts/atn/ATNDeserializer");
const Lexer_1 = require("antlr4ts/Lexer");
const LexerATNSimulator_1 = require("antlr4ts/atn/LexerATNSimulator");
const Decorators_1 = require("antlr4ts/Decorators");
const Decorators_2 = require("antlr4ts/Decorators");
const VocabularyImpl_1 = require("antlr4ts/VocabularyImpl");
const Utils = require("antlr4ts/misc/Utils");
class ExprLexer extends Lexer_1.Lexer {
    constructor(input) {
        super(input);
        this._interp = new LexerATNSimulator_1.LexerATNSimulator(ExprLexer._ATN, this);
    }
    get vocabulary() {
        return ExprLexer.VOCABULARY;
    }
    get grammarFileName() { return "Expr.g4"; }
    get ruleNames() { return ExprLexer.ruleNames; }
    get serializedATN() { return ExprLexer._serializedATN; }
    get modeNames() { return ExprLexer.modeNames; }
    static get _ATN() {
        if (!ExprLexer.__ATN) {
            ExprLexer.__ATN = new ATNDeserializer_1.ATNDeserializer().deserialize(Utils.toCharArray(ExprLexer._serializedATN));
        }
        return ExprLexer.__ATN;
    }
}
ExprLexer.MUL = 1;
ExprLexer.DIV = 2;
ExprLexer.ADD = 3;
ExprLexer.SUB = 4;
ExprLexer.LPAREN = 5;
ExprLexer.RPAREN = 6;
ExprLexer.ID = 7;
ExprLexer.INT = 8;
ExprLexer.EQ = 9;
ExprLexer.SEMI = 10;
ExprLexer.COMMENT = 11;
ExprLexer.WS = 12;
ExprLexer.modeNames = [
    "DEFAULT_MODE"
];
ExprLexer.ruleNames = [
    "MUL", "DIV", "ADD", "SUB", "LPAREN", "RPAREN", "ID", "INT", "EQ", "SEMI",
    "COMMENT", "WS", "LETTER", "DIGIT"
];
ExprLexer._LITERAL_NAMES = [
    undefined, "'*'", "'/'", "'+'", "'-'", "'('", "')'", undefined, undefined,
    "'='", "';'"
];
ExprLexer._SYMBOLIC_NAMES = [
    undefined, "MUL", "DIV", "ADD", "SUB", "LPAREN", "RPAREN", "ID", "INT",
    "EQ", "SEMI", "COMMENT", "WS"
];
ExprLexer.VOCABULARY = new VocabularyImpl_1.VocabularyImpl(ExprLexer._LITERAL_NAMES, ExprLexer._SYMBOLIC_NAMES, []);
ExprLexer._serializedATN = "\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02\x0EX\b\x01\x04" +
    "\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04" +
    "\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r" +
    "\x04\x0E\t\x0E\x04\x0F\t\x0F\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04\x03" +
    "\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03\x07\x03\x07\x03\b\x03\b\x03\b" +
    "\x07\b/\n\b\f\b\x0E\b2\v\b\x03\t\x06\t5\n\t\r\t\x0E\t6\x03\n\x03\n\x03" +
    "\v\x03\v\x03\f\x03\f\x03\f\x03\f\x07\fA\n\f\f\f\x0E\fD\v\f\x03\f\x05\f" +
    "G\n\f\x03\f\x05\fJ\n\f\x03\f\x03\f\x03\r\x06\rO\n\r\r\r\x0E\rP\x03\r\x03" +
    "\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x02\x02\x02\x10\x03\x02\x03\x05\x02" +
    "\x04\x07\x02\x05\t\x02\x06\v\x02\x07\r\x02\b\x0F\x02\t\x11\x02\n\x13\x02" +
    "\v\x15\x02\f\x17\x02\r\x19\x02\x0E\x1B\x02\x02\x1D\x02\x02\x03\x02\x06" +
    "\x03\x022;\x04\x02\f\f\x0F\x0F\x05\x02\v\f\x0F\x0F\"\"\x04\x02C\\c|\\" +
    "\x02\x03\x03\x02\x02\x02\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02\x02\x02" +
    "\x02\t\x03\x02\x02\x02\x02\v\x03\x02\x02\x02\x02\r\x03\x02\x02\x02\x02" +
    "\x0F\x03\x02\x02\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02\x02\x02\x02" +
    "\x15\x03\x02\x02\x02\x02\x17\x03\x02\x02\x02\x02\x19\x03\x02\x02\x02\x03" +
    "\x1F\x03\x02\x02\x02\x05!\x03\x02\x02\x02\x07#\x03\x02\x02\x02\t%\x03" +
    "\x02\x02\x02\v\'\x03\x02\x02\x02\r)\x03\x02\x02\x02\x0F+\x03\x02\x02\x02" +
    "\x114\x03\x02\x02\x02\x138\x03\x02\x02\x02\x15:\x03\x02\x02\x02\x17<\x03" +
    "\x02\x02\x02\x19N\x03\x02\x02\x02\x1BT\x03\x02\x02\x02\x1DV\x03\x02\x02" +
    "\x02\x1F \x07,\x02\x02 \x04\x03\x02\x02\x02!\"\x071\x02\x02\"\x06\x03" +
    "\x02\x02\x02#$\x07-\x02\x02$\b\x03\x02\x02\x02%&\x07/\x02\x02&\n\x03\x02" +
    "\x02\x02\'(\x07*\x02\x02(\f\x03\x02\x02\x02)*\x07+\x02\x02*\x0E\x03\x02" +
    "\x02\x02+0\x05\x1B\x0E\x02,/\x05\x1B\x0E\x02-/\x05\x1D\x0F\x02.,\x03\x02" +
    "\x02\x02.-\x03\x02\x02\x02/2\x03\x02\x02\x020.\x03\x02\x02\x0201\x03\x02" +
    "\x02\x021\x10\x03\x02\x02\x0220\x03\x02\x02\x0235\t\x02\x02\x0243\x03" +
    "\x02\x02\x0256\x03\x02\x02\x0264\x03\x02\x02\x0267\x03\x02\x02\x027\x12" +
    "\x03\x02\x02\x0289\x07?\x02\x029\x14\x03\x02\x02\x02:;\x07=\x02\x02;\x16" +
    "\x03\x02\x02\x02<=\x071\x02\x02=>\x071\x02\x02>B\x03\x02\x02\x02?A\n\x03" +
    "\x02\x02@?\x03\x02\x02\x02AD\x03\x02\x02\x02B@\x03\x02\x02\x02BC\x03\x02" +
    "\x02\x02CF\x03\x02\x02\x02DB\x03\x02\x02\x02EG\x07\x0F\x02\x02FE\x03\x02" +
    "\x02\x02FG\x03\x02\x02\x02GI\x03\x02\x02\x02HJ\x07\f\x02\x02IH\x03\x02" +
    "\x02\x02IJ\x03\x02\x02\x02JK\x03\x02\x02\x02KL\b\f\x02\x02L\x18\x03\x02" +
    "\x02\x02MO\t\x04\x02\x02NM\x03\x02\x02\x02OP\x03\x02\x02\x02PN\x03\x02" +
    "\x02\x02PQ\x03\x02\x02\x02QR\x03\x02\x02\x02RS\b\r\x02\x02S\x1A\x03\x02" +
    "\x02\x02TU\t\x05\x02\x02U\x1C\x03\x02\x02\x02VW\t\x02\x02\x02W\x1E\x03" +
    "\x02\x02\x02\n\x02.06BFIP\x03\x02\x03\x02";
__decorate([
    Decorators_2.Override,
    Decorators_1.NotNull
], ExprLexer.prototype, "vocabulary", null);
__decorate([
    Decorators_2.Override
], ExprLexer.prototype, "grammarFileName", null);
__decorate([
    Decorators_2.Override
], ExprLexer.prototype, "ruleNames", null);
__decorate([
    Decorators_2.Override
], ExprLexer.prototype, "serializedATN", null);
__decorate([
    Decorators_2.Override
], ExprLexer.prototype, "modeNames", null);
exports.ExprLexer = ExprLexer;

},{"antlr4ts/Decorators":16,"antlr4ts/Lexer":24,"antlr4ts/VocabularyImpl":42,"antlr4ts/atn/ATNDeserializer":47,"antlr4ts/atn/LexerATNSimulator":62,"antlr4ts/misc/Utils":118}],7:[function(require,module,exports){
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

},{"antlr4ts/Decorators":16,"antlr4ts/FailedPredicateException":20,"antlr4ts/NoViableAltException":28,"antlr4ts/Parser":29,"antlr4ts/ParserRuleContext":31,"antlr4ts/RecognitionException":34,"antlr4ts/RuleVersion":39,"antlr4ts/Token":40,"antlr4ts/VocabularyImpl":42,"antlr4ts/atn/ATN":43,"antlr4ts/atn/ATNDeserializer":47,"antlr4ts/atn/ParserATNSimulator":76,"antlr4ts/misc/Utils":118}],8:[function(require,module,exports){
"use strict";
/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : translate.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const antlr4ts_1 = require("antlr4ts");
const ExprLexer_1 = require("./parser/ExprLexer");
const ExprParser_1 = require("./parser/ExprParser");
const ExprErrorListener_1 = require("./ExprErrorListener");
const ExprTranVisitor_1 = require("./ExprTranVisitor");
function execute(code) {
    const input = new antlr4ts_1.ANTLRInputStream(code);
    const lexer = new ExprLexer_1.ExprLexer(input);
    const tokens = new antlr4ts_1.CommonTokenStream(lexer);
    const parser = new ExprParser_1.ExprParser(tokens);
    const listener = new ExprErrorListener_1.default();
    const visitor = new ExprTranVisitor_1.default();
    lexer.removeErrorListeners();
    parser.removeErrorListeners();
    lexer.addErrorListener(listener);
    parser.addErrorListener(listener);
    const prog = parser.prog();
    const result = visitor.visit(prog);
    if (listener.hasError()) {
        return listener.print();
    }
    return result;
}
exports.default = execute;

},{"./ExprErrorListener":1,"./ExprTranVisitor":3,"./parser/ExprLexer":6,"./parser/ExprParser":7,"antlr4ts":102}],9:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
// ConvertTo-TS run at 2016-10-04T11:26:49.0828748-07:00
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Vacuum all input from a {@link Reader}/{@link InputStream} and then treat it
 * like a {@code char[]} buffer. Can also pass in a {@link String} or
 * {@code char[]} to use.
 *
 * <p>If you need encoding, pass in stream/reader with correct encoding.</p>
 */
const assert = require("assert");
const Decorators_1 = require("./Decorators");
const IntStream_1 = require("./IntStream");
const READ_BUFFER_SIZE = 1024;
const INITIAL_BUFFER_SIZE = 1024;
class ANTLRInputStream {
    /** Copy data in string to a local char array */
    constructor(input) {
        /** 0..n-1 index into string of next char */
        this.p = 0;
        this.data = input;
        this.n = input.length;
    }
    /** Reset the stream so that it's in the same state it was
     *  when the object was created *except* the data array is not
     *  touched.
     */
    reset() {
        this.p = 0;
    }
    consume() {
        if (this.p >= this.n) {
            assert(this.LA(1) === IntStream_1.IntStream.EOF);
            throw new Error("cannot consume EOF");
        }
        //System.out.println("prev p="+p+", c="+(char)data[p]);
        if (this.p < this.n) {
            this.p++;
            //System.out.println("p moves to "+p+" (c='"+(char)data[p]+"')");
        }
    }
    LA(i) {
        if (i === 0) {
            return 0; // undefined
        }
        if (i < 0) {
            i++; // e.g., translate LA(-1) to use offset i=0; then data[p+0-1]
            if ((this.p + i - 1) < 0) {
                return IntStream_1.IntStream.EOF; // invalid; no char before first char
            }
        }
        if ((this.p + i - 1) >= this.n) {
            //System.out.println("char LA("+i+")=EOF; p="+p);
            return IntStream_1.IntStream.EOF;
        }
        //System.out.println("char LA("+i+")="+(char)data[p+i-1]+"; p="+p);
        //System.out.println("LA("+i+"); p="+p+" n="+n+" data.length="+data.length);
        return this.data.charCodeAt(this.p + i - 1);
    }
    LT(i) {
        return this.LA(i);
    }
    /** Return the current input symbol index 0..n where n indicates the
     *  last symbol has been read.  The index is the index of char to
     *  be returned from LA(1).
     */
    get index() {
        return this.p;
    }
    get size() {
        return this.n;
    }
    /** mark/release do nothing; we have entire buffer */
    mark() {
        return -1;
    }
    release(marker) {
    }
    /** consume() ahead until p==index; can't just set p=index as we must
     *  update line and charPositionInLine. If we seek backwards, just set p
     */
    seek(index) {
        if (index <= this.p) {
            this.p = index; // just jump; don't update stream state (line, ...)
            return;
        }
        // seek forward, consume until p hits index or n (whichever comes first)
        index = Math.min(index, this.n);
        while (this.p < index) {
            this.consume();
        }
    }
    getText(interval) {
        let start = interval.a;
        let stop = interval.b;
        if (stop >= this.n)
            stop = this.n - 1;
        let count = stop - start + 1;
        if (start >= this.n)
            return "";
        // System.err.println("data: "+Arrays.toString(data)+", n="+n+
        // 				   ", start="+start+
        // 				   ", stop="+stop);
        return this.data.substr(start, count);
    }
    get sourceName() {
        if (!this.name) {
            return IntStream_1.IntStream.UNKNOWN_SOURCE_NAME;
        }
        return this.name;
    }
    toString() { return this.data; }
}
__decorate([
    Decorators_1.Override
], ANTLRInputStream.prototype, "consume", null);
__decorate([
    Decorators_1.Override
], ANTLRInputStream.prototype, "LA", null);
__decorate([
    Decorators_1.Override
], ANTLRInputStream.prototype, "index", null);
__decorate([
    Decorators_1.Override
], ANTLRInputStream.prototype, "size", null);
__decorate([
    Decorators_1.Override
], ANTLRInputStream.prototype, "mark", null);
__decorate([
    Decorators_1.Override
], ANTLRInputStream.prototype, "release", null);
__decorate([
    Decorators_1.Override
], ANTLRInputStream.prototype, "seek", null);
__decorate([
    Decorators_1.Override
], ANTLRInputStream.prototype, "getText", null);
__decorate([
    Decorators_1.Override
], ANTLRInputStream.prototype, "sourceName", null);
__decorate([
    Decorators_1.Override
], ANTLRInputStream.prototype, "toString", null);
exports.ANTLRInputStream = ANTLRInputStream;

},{"./Decorators":16,"./IntStream":22,"assert":127}],10:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:49.2855056-07:00
/**
 * This implementation of {@link ANTLRErrorStrategy} responds to syntax errors
 * by immediately canceling the parse operation with a
 * {@link ParseCancellationException}. The implementation ensures that the
 * {@link ParserRuleContext#exception} field is set for all parse tree nodes
 * that were not completed prior to encountering the error.
 *
 * <p>
 * This error strategy is useful in the following scenarios.</p>
 *
 * <ul>
 * <li><strong>Two-stage parsing:</strong> This error strategy allows the first
 * stage of two-stage parsing to immediately terminate if an error is
 * encountered, and immediately fall back to the second stage. In addition to
 * avoiding wasted work by attempting to recover from errors here, the empty
 * implementation of {@link BailErrorStrategy#sync} improves the performance of
 * the first stage.</li>
 * <li><strong>Silent validation:</strong> When syntax errors are not being
 * reported or logged, and the parse result is simply ignored if errors occur,
 * the {@link BailErrorStrategy} avoids wasting work on recovering from errors
 * when the result will be ignored either way.</li>
 * </ul>
 *
 * <p>
 * {@code myparser.errorHandler = new BailErrorStrategy();}</p>
 *
 * @see Parser.errorHandler
 */
const DefaultErrorStrategy_1 = require("./DefaultErrorStrategy");
const InputMismatchException_1 = require("./InputMismatchException");
const Decorators_1 = require("./Decorators");
const ParseCancellationException_1 = require("./misc/ParseCancellationException");
class BailErrorStrategy extends DefaultErrorStrategy_1.DefaultErrorStrategy {
    /** Instead of recovering from exception {@code e}, re-throw it wrapped
     *  in a {@link ParseCancellationException} so it is not caught by the
     *  rule function catches.  Use {@link Exception#getCause()} to get the
     *  original {@link RecognitionException}.
     */
    recover(recognizer, e) {
        for (let context = recognizer.context; context; context = context.parent) {
            context.exception = e;
        }
        throw new ParseCancellationException_1.ParseCancellationException(e);
    }
    /** Make sure we don't attempt to recover inline; if the parser
     *  successfully recovers, it won't throw an exception.
     */
    recoverInline(recognizer) {
        let e = new InputMismatchException_1.InputMismatchException(recognizer);
        for (let context = recognizer.context; context; context = context.parent) {
            context.exception = e;
        }
        throw new ParseCancellationException_1.ParseCancellationException(e);
    }
    /** Make sure we don't attempt to recover from problems in subrules. */
    sync(recognizer) { }
}
__decorate([
    Decorators_1.Override
], BailErrorStrategy.prototype, "recover", null);
__decorate([
    Decorators_1.Override
], BailErrorStrategy.prototype, "recoverInline", null);
__decorate([
    Decorators_1.Override
], BailErrorStrategy.prototype, "sync", null);
exports.BailErrorStrategy = BailErrorStrategy;

},{"./Decorators":16,"./DefaultErrorStrategy":17,"./InputMismatchException":21,"./misc/ParseCancellationException":115}],11:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:49.6074365-07:00
const assert = require("assert");
const CommonToken_1 = require("./CommonToken");
const Interval_1 = require("./misc/Interval");
const Lexer_1 = require("./Lexer");
const Decorators_1 = require("./Decorators");
const Token_1 = require("./Token");
/**
 * This implementation of {@link TokenStream} loads tokens from a
 * {@link TokenSource} on-demand, and places the tokens in a buffer to provide
 * access to any previous token by index.
 *
 * <p>
 * This token stream ignores the value of {@link Token#getChannel}. If your
 * parser requires the token stream filter tokens to only those on a particular
 * channel, such as {@link Token#DEFAULT_CHANNEL} or
 * {@link Token#HIDDEN_CHANNEL}, use a filtering token stream such a
 * {@link CommonTokenStream}.</p>
 */
let BufferedTokenStream = class BufferedTokenStream {
    constructor(tokenSource) {
        /**
         * A collection of all tokens fetched from the token source. The list is
         * considered a complete view of the input once {@link #fetchedEOF} is set
         * to {@code true}.
         */
        this.tokens = [];
        /**
         * The index into {@link #tokens} of the current token (next token to
         * {@link #consume}). {@link #tokens}{@code [}{@link #p}{@code ]} should be
         * {@link #LT LT(1)}.
         *
         * <p>This field is set to -1 when the stream is first constructed or when
         * {@link #setTokenSource} is called, indicating that the first token has
         * not yet been fetched from the token source. For additional information,
         * see the documentation of {@link IntStream} for a description of
         * Initializing Methods.</p>
         */
        this.p = -1;
        /**
         * Indicates whether the {@link Token#EOF} token has been fetched from
         * {@link #tokenSource} and added to {@link #tokens}. This field improves
         * performance for the following cases:
         *
         * <ul>
         * <li>{@link #consume}: The lookahead check in {@link #consume} to prevent
         * consuming the EOF symbol is optimized by checking the values of
         * {@link #fetchedEOF} and {@link #p} instead of calling {@link #LA}.</li>
         * <li>{@link #fetch}: The check to prevent adding multiple EOF symbols into
         * {@link #tokens} is trivial with this field.</li>
         * <ul>
         */
        this.fetchedEOF = false;
        if (tokenSource == null) {
            throw new Error("tokenSource cannot be null");
        }
        this._tokenSource = tokenSource;
    }
    get tokenSource() {
        return this._tokenSource;
    }
    get index() {
        return this.p;
    }
    mark() {
        return 0;
    }
    release(marker) {
        // no resources to release
    }
    seek(index) {
        this.lazyInit();
        this.p = this.adjustSeekIndex(index);
    }
    get size() {
        return this.tokens.length;
    }
    consume() {
        let skipEofCheck;
        if (this.p >= 0) {
            if (this.fetchedEOF) {
                // the last token in tokens is EOF. skip check if p indexes any
                // fetched token except the last.
                skipEofCheck = this.p < this.tokens.length - 1;
            }
            else {
                // no EOF token in tokens. skip check if p indexes a fetched token.
                skipEofCheck = this.p < this.tokens.length;
            }
        }
        else {
            // not yet initialized
            skipEofCheck = false;
        }
        if (!skipEofCheck && this.LA(1) === Token_1.Token.EOF) {
            throw new Error("cannot consume EOF");
        }
        if (this.sync(this.p + 1)) {
            this.p = this.adjustSeekIndex(this.p + 1);
        }
    }
    /** Make sure index {@code i} in tokens has a token.
     *
     * @return {@code true} if a token is located at index {@code i}, otherwise
     *    {@code false}.
     * @see #get(int i)
     */
    sync(i) {
        assert(i >= 0);
        let n = i - this.tokens.length + 1; // how many more elements we need?
        //System.out.println("sync("+i+") needs "+n);
        if (n > 0) {
            let fetched = this.fetch(n);
            return fetched >= n;
        }
        return true;
    }
    /** Add {@code n} elements to buffer.
     *
     * @return The actual number of elements added to the buffer.
     */
    fetch(n) {
        if (this.fetchedEOF) {
            return 0;
        }
        for (let i = 0; i < n; i++) {
            let t = this.tokenSource.nextToken();
            if (this.isWritableToken(t)) {
                t.tokenIndex = this.tokens.length;
            }
            this.tokens.push(t);
            if (t.type === Token_1.Token.EOF) {
                this.fetchedEOF = true;
                return i + 1;
            }
        }
        return n;
    }
    get(i) {
        if (i < 0 || i >= this.tokens.length) {
            throw new RangeError("token index " + i + " out of range 0.." + (this.tokens.length - 1));
        }
        return this.tokens[i];
    }
    /** Get all tokens from start..stop inclusively. */
    getRange(start, stop) {
        if (start < 0 || stop < 0) {
            return [];
        }
        this.lazyInit();
        let subset = new Array();
        if (stop >= this.tokens.length) {
            stop = this.tokens.length - 1;
        }
        for (let i = start; i <= stop; i++) {
            let t = this.tokens[i];
            if (t.type === Token_1.Token.EOF) {
                break;
            }
            subset.push(t);
        }
        return subset;
    }
    LA(i) {
        let token = this.LT(i);
        if (!token) {
            return Token_1.Token.INVALID_TYPE;
        }
        return token.type;
    }
    tryLB(k) {
        if ((this.p - k) < 0) {
            return undefined;
        }
        return this.tokens[this.p - k];
    }
    LT(k) {
        let result = this.tryLT(k);
        if (result === undefined) {
            throw new RangeError("requested lookback index out of range");
        }
        return result;
    }
    tryLT(k) {
        this.lazyInit();
        if (k === 0) {
            throw new RangeError("0 is not a valid lookahead index");
        }
        if (k < 0) {
            return this.tryLB(-k);
        }
        let i = this.p + k - 1;
        this.sync(i);
        if (i >= this.tokens.length) {
            // return EOF token
            // EOF must be last token
            return this.tokens[this.tokens.length - 1];
        }
        //		if ( i>range ) range = i;
        return this.tokens[i];
    }
    /**
     * Allowed derived classes to modify the behavior of operations which change
     * the current stream position by adjusting the target token index of a seek
     * operation. The default implementation simply returns {@code i}. If an
     * exception is thrown in this method, the current stream index should not be
     * changed.
     *
     * <p>For example, {@link CommonTokenStream} overrides this method to ensure that
     * the seek target is always an on-channel token.</p>
     *
     * @param i The target token index.
     * @return The adjusted target token index.
     */
    adjustSeekIndex(i) {
        return i;
    }
    lazyInit() {
        if (this.p === -1) {
            this.setup();
        }
    }
    setup() {
        this.sync(0);
        this.p = this.adjustSeekIndex(0);
    }
    /** Reset this token stream by setting its token source. */
    set tokenSource(tokenSource) {
        this._tokenSource = tokenSource;
        this.tokens.length = 0;
        this.p = -1;
        this.fetchedEOF = false;
    }
    /** Given a start and stop index, return a {@code List} of all tokens in
     *  the token type {@code BitSet}.  Return {@code null} if no tokens were found.  This
     *  method looks at both on and off channel tokens.
     */
    getTokens(start, stop, types) {
        this.lazyInit();
        start = start || 0;
        stop = stop || this.tokens.length - 1;
        if (start < 0 || stop >= this.tokens.length || stop < 0 || start >= this.tokens.length) {
            throw new RangeError("start " + start + " or stop " + stop + " not in 0.." + (this.tokens.length - 1));
        }
        if (start === 0 && stop === this.tokens.length - 1) {
            return this.tokens;
        }
        if (start > stop) {
            return [];
        }
        if (types == null) {
            return this.tokens.slice(start, stop + 1);
        }
        else if (typeof types === 'number') {
            types = new Set().add(types);
        }
        let typesSet = types;
        // list = tokens[start:stop]:{T t, t.type in types}
        let filteredTokens = this.tokens.slice(start, stop + 1);
        filteredTokens = filteredTokens.filter((value) => { return typesSet.has(value.type); });
        return filteredTokens;
    }
    /**
     * Given a starting index, return the index of the next token on channel.
     * Return {@code i} if {@code tokens[i]} is on channel. Return the index of
     * the EOF token if there are no tokens on channel between {@code i} and
     * EOF.
     */
    nextTokenOnChannel(i, channel) {
        this.sync(i);
        if (i >= this.size) {
            return this.size - 1;
        }
        let token = this.tokens[i];
        while (token.channel !== channel) {
            if (token.type === Token_1.Token.EOF) {
                return i;
            }
            i++;
            this.sync(i);
            token = this.tokens[i];
        }
        return i;
    }
    /**
     * Given a starting index, return the index of the previous token on
     * channel. Return {@code i} if {@code tokens[i]} is on channel. Return -1
     * if there are no tokens on channel between {@code i} and 0.
     *
     * <p>
     * If {@code i} specifies an index at or after the EOF token, the EOF token
     * index is returned. This is due to the fact that the EOF token is treated
     * as though it were on every channel.</p>
     */
    previousTokenOnChannel(i, channel) {
        this.sync(i);
        if (i >= this.size) {
            // the EOF token is on every channel
            return this.size - 1;
        }
        while (i >= 0) {
            let token = this.tokens[i];
            if (token.type === Token_1.Token.EOF || token.channel === channel) {
                return i;
            }
            i--;
        }
        return i;
    }
    /** Collect all tokens on specified channel to the right of
     *  the current token up until we see a token on {@link Lexer#DEFAULT_TOKEN_CHANNEL} or
     *  EOF. If {@code channel} is {@code -1}, find any non default channel token.
     */
    getHiddenTokensToRight(tokenIndex, channel = -1) {
        this.lazyInit();
        if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
            throw new RangeError(tokenIndex + " not in 0.." + (this.tokens.length - 1));
        }
        let nextOnChannel = this.nextTokenOnChannel(tokenIndex + 1, Lexer_1.Lexer.DEFAULT_TOKEN_CHANNEL);
        let to;
        let from = tokenIndex + 1;
        // if none onchannel to right, nextOnChannel=-1 so set to = last token
        if (nextOnChannel === -1) {
            to = this.size - 1;
        }
        else {
            to = nextOnChannel;
        }
        return this.filterForChannel(from, to, channel);
    }
    /** Collect all tokens on specified channel to the left of
     *  the current token up until we see a token on {@link Lexer#DEFAULT_TOKEN_CHANNEL}.
     *  If {@code channel} is {@code -1}, find any non default channel token.
     */
    getHiddenTokensToLeft(tokenIndex, channel = -1) {
        this.lazyInit();
        if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
            throw new RangeError(tokenIndex + " not in 0.." + (this.tokens.length - 1));
        }
        if (tokenIndex === 0) {
            // obviously no tokens can appear before the first token
            return [];
        }
        let prevOnChannel = this.previousTokenOnChannel(tokenIndex - 1, Lexer_1.Lexer.DEFAULT_TOKEN_CHANNEL);
        if (prevOnChannel === tokenIndex - 1) {
            return [];
        }
        // if none onchannel to left, prevOnChannel=-1 then from=0
        let from = prevOnChannel + 1;
        let to = tokenIndex - 1;
        return this.filterForChannel(from, to, channel);
    }
    filterForChannel(from, to, channel) {
        let hidden = new Array();
        for (let i = from; i <= to; i++) {
            let t = this.tokens[i];
            if (channel === -1) {
                if (t.channel !== Lexer_1.Lexer.DEFAULT_TOKEN_CHANNEL) {
                    hidden.push(t);
                }
            }
            else {
                if (t.channel === channel) {
                    hidden.push(t);
                }
            }
        }
        return hidden;
    }
    get sourceName() {
        return this.tokenSource.sourceName;
    }
    getText(interval) {
        if (interval === undefined) {
            interval = Interval_1.Interval.of(0, this.size - 1);
        }
        else if (!(interval instanceof Interval_1.Interval)) {
            // Note: the more obvious check for 'instanceof RuleContext' results in a circular dependency problem
            interval = interval.sourceInterval;
        }
        let start = interval.a;
        let stop = interval.b;
        if (start < 0 || stop < 0) {
            return "";
        }
        this.fill();
        if (stop >= this.tokens.length) {
            stop = this.tokens.length - 1;
        }
        let buf = "";
        for (let i = start; i <= stop; i++) {
            let t = this.tokens[i];
            if (t.type === Token_1.Token.EOF) {
                break;
            }
            buf += t.text;
        }
        return buf.toString();
    }
    getTextFromRange(start, stop) {
        if (this.isToken(start) && this.isToken(stop)) {
            return this.getText(Interval_1.Interval.of(start.tokenIndex, stop.tokenIndex));
        }
        return "";
    }
    /** Get all tokens from lexer until EOF. */
    fill() {
        this.lazyInit();
        const blockSize = 1000;
        while (true) {
            let fetched = this.fetch(blockSize);
            if (fetched < blockSize) {
                return;
            }
        }
    }
    // TODO: Figure out a way to make this more flexible?
    isWritableToken(t) {
        return t instanceof CommonToken_1.CommonToken;
    }
    // TODO: Figure out a way to make this more flexible?
    isToken(t) {
        return t instanceof CommonToken_1.CommonToken;
    }
};
__decorate([
    Decorators_1.NotNull
], BufferedTokenStream.prototype, "_tokenSource", void 0);
__decorate([
    Decorators_1.Override
], BufferedTokenStream.prototype, "tokenSource", null);
__decorate([
    Decorators_1.Override
], BufferedTokenStream.prototype, "index", null);
__decorate([
    Decorators_1.Override
], BufferedTokenStream.prototype, "mark", null);
__decorate([
    Decorators_1.Override
], BufferedTokenStream.prototype, "release", null);
__decorate([
    Decorators_1.Override
], BufferedTokenStream.prototype, "seek", null);
__decorate([
    Decorators_1.Override
], BufferedTokenStream.prototype, "size", null);
__decorate([
    Decorators_1.Override
], BufferedTokenStream.prototype, "consume", null);
__decorate([
    Decorators_1.Override
], BufferedTokenStream.prototype, "get", null);
__decorate([
    Decorators_1.Override
], BufferedTokenStream.prototype, "LA", null);
__decorate([
    Decorators_1.NotNull,
    Decorators_1.Override
], BufferedTokenStream.prototype, "LT", null);
__decorate([
    Decorators_1.Override
], BufferedTokenStream.prototype, "sourceName", null);
__decorate([
    Decorators_1.NotNull,
    Decorators_1.Override
], BufferedTokenStream.prototype, "getText", null);
__decorate([
    Decorators_1.NotNull,
    Decorators_1.Override
], BufferedTokenStream.prototype, "getTextFromRange", null);
BufferedTokenStream = __decorate([
    __param(0, Decorators_1.NotNull)
], BufferedTokenStream);
exports.BufferedTokenStream = BufferedTokenStream;

},{"./CommonToken":12,"./Decorators":16,"./Lexer":24,"./Token":40,"./misc/Interval":111,"assert":127}],12:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Interval_1 = require("./misc/Interval");
const Decorators_1 = require("./Decorators");
const Token_1 = require("./Token");
let CommonToken = class CommonToken {
    constructor(type, text, source = CommonToken.EMPTY_SOURCE, channel = Token_1.Token.DEFAULT_CHANNEL, start = 0, stop = 0) {
        /**
         * This is the backing field for {@link #getLine} and {@link #setLine}.
         */
        this._line = 0;
        /**
         * This is the backing field for {@link #getCharPositionInLine} and
         * {@link #setCharPositionInLine}.
         */
        this._charPositionInLine = -1; // set to invalid position
        /**
         * This is the backing field for {@link #getChannel} and
         * {@link #setChannel}.
         */
        this._channel = Token_1.Token.DEFAULT_CHANNEL;
        /**
         * This is the backing field for `tokenIndex`.
         */
        this.index = -1;
        this._text = text;
        this._type = type;
        this.source = source;
        this._channel = channel;
        this.start = start;
        this.stop = stop;
        if (source.source != null) {
            this._line = source.source.line;
            this._charPositionInLine = source.source.charPositionInLine;
        }
    }
    /**
     * Constructs a new {@link CommonToken} as a copy of another {@link Token}.
     *
     * <p>
     * If {@code oldToken} is also a {@link CommonToken} instance, the newly
     * constructed token will share a reference to the {@link #text} field and
     * the {@link Tuple2} stored in {@link #source}. Otherwise, {@link #text} will
     * be assigned the result of calling {@link #getText}, and {@link #source}
     * will be constructed from the result of {@link Token#getTokenSource} and
     * {@link Token#getInputStream}.</p>
     *
     * @param oldToken The token to copy.
     */
    static fromToken(oldToken) {
        let result = new CommonToken(oldToken.type, undefined, CommonToken.EMPTY_SOURCE, oldToken.channel, oldToken.startIndex, oldToken.stopIndex);
        result._line = oldToken.line;
        result.index = oldToken.tokenIndex;
        result._charPositionInLine = oldToken.charPositionInLine;
        if (oldToken instanceof CommonToken) {
            result._text = oldToken.text;
            result.source = oldToken.source;
        }
        else {
            result._text = oldToken.text;
            result.source = { source: oldToken.tokenSource, stream: oldToken.inputStream };
        }
        return result;
    }
    get type() {
        return this._type;
    }
    // @Override
    set line(line) {
        this._line = line;
    }
    get text() {
        if (this._text != null) {
            return this._text;
        }
        let input = this.inputStream;
        if (input == null) {
            return undefined;
        }
        let n = input.size;
        if (this.start < n && this.stop < n) {
            return input.getText(Interval_1.Interval.of(this.start, this.stop));
        }
        else {
            return "<EOF>";
        }
    }
    /**
     * Explicitly set the text for this token. If {code text} is not
     * {@code null}, then {@link #getText} will return this value rather than
     * extracting the text from the input.
     *
     * @param text The explicit text of the token, or {@code null} if the text
     * should be obtained from the input along with the start and stop indexes
     * of the token.
     */
    // @Override
    set text(text) {
        this._text = text;
    }
    get line() {
        return this._line;
    }
    get charPositionInLine() {
        return this._charPositionInLine;
    }
    // @Override
    set charPositionInLine(charPositionInLine) {
        this._charPositionInLine = charPositionInLine;
    }
    get channel() {
        return this._channel;
    }
    // @Override
    set channel(channel) {
        this._channel = channel;
    }
    // @Override
    set type(type) {
        this._type = type;
    }
    get startIndex() {
        return this.start;
    }
    set startIndex(start) {
        this.start = start;
    }
    get stopIndex() {
        return this.stop;
    }
    set stopIndex(stop) {
        this.stop = stop;
    }
    get tokenIndex() {
        return this.index;
    }
    // @Override
    set tokenIndex(index) {
        this.index = index;
    }
    get tokenSource() {
        return this.source.source;
    }
    get inputStream() {
        return this.source.stream;
    }
    toString(recognizer) {
        let channelStr = "";
        if (this._channel > 0) {
            channelStr = ",channel=" + this._channel;
        }
        let txt = this.text;
        if (txt != null) {
            txt = txt.replace(/\n/g, "\\n");
            txt = txt.replace(/\r/g, "\\r");
            txt = txt.replace(/\t/g, "\\t");
        }
        else {
            txt = "<no text>";
        }
        let typeString = String(this._type);
        if (recognizer) {
            typeString = recognizer.vocabulary.getDisplayName(this._type);
        }
        return "[@" + this.tokenIndex + "," + this.start + ":" + this.stop + "='" + txt + "',<" + typeString + ">" + channelStr + "," + this._line + ":" + this.charPositionInLine + "]";
    }
};
/**
 * An empty {@link Tuple2} which is used as the default value of
 * {@link #source} for tokens that do not have a source.
 */
CommonToken.EMPTY_SOURCE = { source: undefined, stream: undefined };
__decorate([
    Decorators_1.NotNull
], CommonToken.prototype, "source", void 0);
__decorate([
    Decorators_1.Override
], CommonToken.prototype, "type", null);
__decorate([
    Decorators_1.Override
], CommonToken.prototype, "text", null);
__decorate([
    Decorators_1.Override
], CommonToken.prototype, "line", null);
__decorate([
    Decorators_1.Override
], CommonToken.prototype, "charPositionInLine", null);
__decorate([
    Decorators_1.Override
], CommonToken.prototype, "channel", null);
__decorate([
    Decorators_1.Override
], CommonToken.prototype, "startIndex", null);
__decorate([
    Decorators_1.Override
], CommonToken.prototype, "stopIndex", null);
__decorate([
    Decorators_1.Override
], CommonToken.prototype, "tokenIndex", null);
__decorate([
    Decorators_1.Override
], CommonToken.prototype, "tokenSource", null);
__decorate([
    Decorators_1.Override
], CommonToken.prototype, "inputStream", null);
__decorate([
    Decorators_1.Override
], CommonToken.prototype, "toString", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], CommonToken, "fromToken", null);
CommonToken = __decorate([
    __param(2, Decorators_1.NotNull)
], CommonToken);
exports.CommonToken = CommonToken;

},{"./Decorators":16,"./Token":40,"./misc/Interval":111}],13:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommonToken_1 = require("./CommonToken");
const Interval_1 = require("./misc/Interval");
const Decorators_1 = require("./Decorators");
/**
 * This default implementation of {@link TokenFactory} creates
 * {@link CommonToken} objects.
 */
class CommonTokenFactory {
    /**
     * Constructs a {@link CommonTokenFactory} with the specified value for
     * {@link #copyText}.
     *
     * <p>
     * When {@code copyText} is {@code false}, the {@link #DEFAULT} instance
     * should be used instead of constructing a new instance.</p>
     *
     * @param copyText The value for {@link #copyText}.
     */
    constructor(copyText = false) {
        this.copyText = copyText;
    }
    create(source, type, text, channel, start, stop, line, charPositionInLine) {
        let t = new CommonToken_1.CommonToken(type, text, source, channel, start, stop);
        t.line = line;
        t.charPositionInLine = charPositionInLine;
        if (text == null && this.copyText && source.stream != null) {
            t.text = source.stream.getText(Interval_1.Interval.of(start, stop));
        }
        return t;
    }
    createSimple(type, text) {
        return new CommonToken_1.CommonToken(type, text);
    }
}
__decorate([
    Decorators_1.Override
], CommonTokenFactory.prototype, "create", null);
__decorate([
    Decorators_1.Override
], CommonTokenFactory.prototype, "createSimple", null);
exports.CommonTokenFactory = CommonTokenFactory;
(function (CommonTokenFactory) {
    /**
     * The default {@link CommonTokenFactory} instance.
     *
     * <p>
     * This token factory does not explicitly copy token text when constructing
     * tokens.</p>
     */
    CommonTokenFactory.DEFAULT = new CommonTokenFactory();
})(CommonTokenFactory = exports.CommonTokenFactory || (exports.CommonTokenFactory = {}));

},{"./CommonToken":12,"./Decorators":16,"./misc/Interval":111}],14:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:50.3953157-07:00
const BufferedTokenStream_1 = require("./BufferedTokenStream");
const Decorators_1 = require("./Decorators");
const Token_1 = require("./Token");
/**
 * This class extends {@link BufferedTokenStream} with functionality to filter
 * token streams to tokens on a particular channel (tokens where
 * {@link Token#getChannel} returns a particular value).
 *
 * <p>
 * This token stream provides access to all tokens by index or when calling
 * methods like {@link #getText}. The channel filtering is only used for code
 * accessing tokens via the lookahead methods {@link #LA}, {@link #LT}, and
 * {@link #LB}.</p>
 *
 * <p>
 * By default, tokens are placed on the default channel
 * ({@link Token#DEFAULT_CHANNEL}), but may be reassigned by using the
 * {@code ->channel(HIDDEN)} lexer command, or by using an embedded action to
 * call {@link Lexer#setChannel}.
 * </p>
 *
 * <p>
 * Note: lexer rules which use the {@code ->skip} lexer command or call
 * {@link Lexer#skip} do not produce tokens at all, so input text matched by
 * such a rule will not be available as part of the token stream, regardless of
 * channel.</p>
 */
let CommonTokenStream = class CommonTokenStream extends BufferedTokenStream_1.BufferedTokenStream {
    /**
     * Constructs a new {@link CommonTokenStream} using the specified token
     * source and filtering tokens to the specified channel. Only tokens whose
     * {@link Token#getChannel} matches {@code channel} or have the
     * `Token.type` equal to {@link Token#EOF} will be returned by the
     * token stream lookahead methods.
     *
     * @param tokenSource The token source.
     * @param channel The channel to use for filtering tokens.
     */
    constructor(tokenSource, channel = Token_1.Token.DEFAULT_CHANNEL) {
        super(tokenSource);
        this.channel = channel;
    }
    adjustSeekIndex(i) {
        return this.nextTokenOnChannel(i, this.channel);
    }
    tryLB(k) {
        if ((this.p - k) < 0) {
            return undefined;
        }
        let i = this.p;
        let n = 1;
        // find k good tokens looking backwards
        while (n <= k && i > 0) {
            // skip off-channel tokens
            i = this.previousTokenOnChannel(i - 1, this.channel);
            n++;
        }
        if (i < 0) {
            return undefined;
        }
        return this.tokens[i];
    }
    tryLT(k) {
        //System.out.println("enter LT("+k+")");
        this.lazyInit();
        if (k === 0) {
            throw new RangeError("0 is not a valid lookahead index");
        }
        if (k < 0) {
            return this.tryLB(-k);
        }
        let i = this.p;
        let n = 1; // we know tokens[p] is a good one
        // find k good tokens
        while (n < k) {
            // skip off-channel tokens, but make sure to not look past EOF
            if (this.sync(i + 1)) {
                i = this.nextTokenOnChannel(i + 1, this.channel);
            }
            n++;
        }
        //		if ( i>range ) range = i;
        return this.tokens[i];
    }
    /** Count EOF just once. */
    getNumberOfOnChannelTokens() {
        let n = 0;
        this.fill();
        for (let i = 0; i < this.tokens.length; i++) {
            let t = this.tokens[i];
            if (t.channel === this.channel) {
                n++;
            }
            if (t.type === Token_1.Token.EOF) {
                break;
            }
        }
        return n;
    }
};
__decorate([
    Decorators_1.Override
], CommonTokenStream.prototype, "adjustSeekIndex", null);
__decorate([
    Decorators_1.Override
], CommonTokenStream.prototype, "tryLB", null);
__decorate([
    Decorators_1.Override
], CommonTokenStream.prototype, "tryLT", null);
CommonTokenStream = __decorate([
    __param(0, Decorators_1.NotNull)
], CommonTokenStream);
exports.CommonTokenStream = CommonTokenStream;

},{"./BufferedTokenStream":11,"./Decorators":16,"./Token":40}],15:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ConsoleErrorListener {
    /**
     * {@inheritDoc}
     *
     * <p>
     * This implementation prints messages to {@link System#err} containing the
     * values of {@code line}, {@code charPositionInLine}, and {@code msg} using
     * the following format.</p>
     *
     * <pre>
     * line <em>line</em>:<em>charPositionInLine</em> <em>msg</em>
     * </pre>
     */
    syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, e) {
        console.error(`line ${line}:${charPositionInLine} ${msg}`);
    }
}
/**
 * Provides a default instance of {@link ConsoleErrorListener}.
 */
ConsoleErrorListener.INSTANCE = new ConsoleErrorListener();
exports.ConsoleErrorListener = ConsoleErrorListener;

},{}],16:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function NotNull(target, propertyKey, propertyDescriptor) {
}
exports.NotNull = NotNull;
function Nullable(target, propertyKey, propertyDescriptor) {
}
exports.Nullable = Nullable;
function Override(target, propertyKey, propertyDescriptor) {
    // do something with 'target' ...
}
exports.Override = Override;
function SuppressWarnings(options) {
    return (target, propertyKey, descriptor) => {
    };
}
exports.SuppressWarnings = SuppressWarnings;

},{}],17:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const FailedPredicateException_1 = require("./FailedPredicateException");
const InputMismatchException_1 = require("./InputMismatchException");
const IntervalSet_1 = require("./misc/IntervalSet");
const NoViableAltException_1 = require("./NoViableAltException");
const PredictionContext_1 = require("./atn/PredictionContext");
const Token_1 = require("./Token");
const Decorators_1 = require("./Decorators");
class DefaultErrorStrategy {
    constructor() {
        /**
         * Indicates whether the error strategy is currently "recovering from an
         * error". This is used to suppress reporting multiple error messages while
         * attempting to recover from a detected syntax error.
         *
         * @see #inErrorRecoveryMode
         */
        this.errorRecoveryMode = false;
        /** The index into the input stream where the last error occurred.
         * 	This is used to prevent infinite loops where an error is found
         *  but no token is consumed during recovery...another error is found,
         *  ad nauseum.  This is a failsafe mechanism to guarantee that at least
         *  one token/tree node is consumed for two errors.
         */
        this.lastErrorIndex = -1;
    }
    /**
     * {@inheritDoc}
     *
     * <p>The default implementation simply calls {@link #endErrorCondition} to
     * ensure that the handler is not in error recovery mode.</p>
     */
    reset(recognizer) {
        this.endErrorCondition(recognizer);
    }
    /**
     * This method is called to enter error recovery mode when a recognition
     * exception is reported.
     *
     * @param recognizer the parser instance
     */
    beginErrorCondition(recognizer) {
        this.errorRecoveryMode = true;
    }
    /**
     * {@inheritDoc}
     */
    inErrorRecoveryMode(recognizer) {
        return this.errorRecoveryMode;
    }
    /**
     * This method is called to leave error recovery mode after recovering from
     * a recognition exception.
     *
     * @param recognizer
     */
    endErrorCondition(recognizer) {
        this.errorRecoveryMode = false;
        this.lastErrorStates = undefined;
        this.lastErrorIndex = -1;
    }
    /**
     * {@inheritDoc}
     *
     * <p>The default implementation simply calls {@link #endErrorCondition}.</p>
     */
    reportMatch(recognizer) {
        this.endErrorCondition(recognizer);
    }
    /**
     * {@inheritDoc}
     *
     * <p>The default implementation returns immediately if the handler is already
     * in error recovery mode. Otherwise, it calls {@link #beginErrorCondition}
     * and dispatches the reporting task based on the runtime type of {@code e}
     * according to the following table.</p>
     *
     * <ul>
     * <li>{@link NoViableAltException}: Dispatches the call to
     * {@link #reportNoViableAlternative}</li>
     * <li>{@link InputMismatchException}: Dispatches the call to
     * {@link #reportInputMismatch}</li>
     * <li>{@link FailedPredicateException}: Dispatches the call to
     * {@link #reportFailedPredicate}</li>
     * <li>All other types: calls {@link Parser#notifyErrorListeners} to report
     * the exception</li>
     * </ul>
     */
    reportError(recognizer, e) {
        // if we've already reported an error and have not matched a token
        // yet successfully, don't report any errors.
        if (this.inErrorRecoveryMode(recognizer)) {
            //			System.err.print("[SPURIOUS] ");
            return; // don't report spurious errors
        }
        this.beginErrorCondition(recognizer);
        if (e instanceof NoViableAltException_1.NoViableAltException) {
            this.reportNoViableAlternative(recognizer, e);
        }
        else if (e instanceof InputMismatchException_1.InputMismatchException) {
            this.reportInputMismatch(recognizer, e);
        }
        else if (e instanceof FailedPredicateException_1.FailedPredicateException) {
            this.reportFailedPredicate(recognizer, e);
        }
        else {
            console.error(`unknown recognition error type: ${e}`);
            this.notifyErrorListeners(recognizer, e.toString(), e);
        }
    }
    notifyErrorListeners(recognizer, message, e) {
        let offendingToken = e.getOffendingToken(recognizer);
        if (offendingToken === undefined) {
            // Pass null to notifyErrorListeners so it in turn calls the error listeners with undefined as the offending
            // token. If we passed undefined, it would instead call the listeners with currentToken from the parser.
            offendingToken = null;
        }
        recognizer.notifyErrorListeners(message, offendingToken, e);
    }
    /**
     * {@inheritDoc}
     *
     * <p>The default implementation resynchronizes the parser by consuming tokens
     * until we find one in the resynchronization set--loosely the set of tokens
     * that can follow the current rule.</p>
     */
    recover(recognizer, e) {
        //		System.out.println("recover in "+recognizer.getRuleInvocationStack()+
        //						   " index="+recognizer.inputStream.index+
        //						   ", lastErrorIndex="+
        //						   lastErrorIndex+
        //						   ", states="+lastErrorStates);
        if (this.lastErrorIndex === recognizer.inputStream.index &&
            this.lastErrorStates &&
            this.lastErrorStates.contains(recognizer.state)) {
            // uh oh, another error at same token index and previously-visited
            // state in ATN; must be a case where LT(1) is in the recovery
            // token set so nothing got consumed. Consume a single token
            // at least to prevent an infinite loop; this is a failsafe.
            //			System.err.println("seen error condition before index="+
            //							   lastErrorIndex+", states="+lastErrorStates);
            //			System.err.println("FAILSAFE consumes "+recognizer.getTokenNames()[recognizer.inputStream.LA(1)]);
            recognizer.consume();
        }
        this.lastErrorIndex = recognizer.inputStream.index;
        if (!this.lastErrorStates)
            this.lastErrorStates = new IntervalSet_1.IntervalSet();
        this.lastErrorStates.add(recognizer.state);
        let followSet = this.getErrorRecoverySet(recognizer);
        this.consumeUntil(recognizer, followSet);
    }
    /**
     * The default implementation of {@link ANTLRErrorStrategy#sync} makes sure
     * that the current lookahead symbol is consistent with what were expecting
     * at this point in the ATN. You can call this anytime but ANTLR only
     * generates code to check before subrules/loops and each iteration.
     *
     * <p>Implements Jim Idle's magic sync mechanism in closures and optional
     * subrules. E.g.,</p>
     *
     * <pre>
     * a : sync ( stuff sync )* ;
     * sync : {consume to what can follow sync} ;
     * </pre>
     *
     * At the start of a sub rule upon error, {@link #sync} performs single
     * token deletion, if possible. If it can't do that, it bails on the current
     * rule and uses the default error recovery, which consumes until the
     * resynchronization set of the current rule.
     *
     * <p>If the sub rule is optional ({@code (...)?}, {@code (...)*}, or block
     * with an empty alternative), then the expected set includes what follows
     * the subrule.</p>
     *
     * <p>During loop iteration, it consumes until it sees a token that can start a
     * sub rule or what follows loop. Yes, that is pretty aggressive. We opt to
     * stay in the loop as long as possible.</p>
     *
     * <p><strong>ORIGINS</strong></p>
     *
     * <p>Previous versions of ANTLR did a poor job of their recovery within loops.
     * A single mismatch token or missing token would force the parser to bail
     * out of the entire rules surrounding the loop. So, for rule</p>
     *
     * <pre>
     * classDef : 'class' ID '{' member* '}'
     * </pre>
     *
     * input with an extra token between members would force the parser to
     * consume until it found the next class definition rather than the next
     * member definition of the current class.
     *
     * <p>This functionality cost a little bit of effort because the parser has to
     * compare token set at the start of the loop and at each iteration. If for
     * some reason speed is suffering for you, you can turn off this
     * functionality by simply overriding this method as a blank { }.</p>
     */
    sync(recognizer) {
        let s = recognizer.interpreter.atn.states[recognizer.state];
        //		System.err.println("sync @ "+s.stateNumber+"="+s.getClass().getSimpleName());
        // If already recovering, don't try to sync
        if (this.inErrorRecoveryMode(recognizer)) {
            return;
        }
        let tokens = recognizer.inputStream;
        let la = tokens.LA(1);
        // try cheaper subset first; might get lucky. seems to shave a wee bit off
        let nextTokens = recognizer.atn.nextTokens(s);
        if (nextTokens.contains(Token_1.Token.EPSILON) || nextTokens.contains(la)) {
            return;
        }
        switch (s.stateType) {
            case 3 /* BLOCK_START */:
            case 5 /* STAR_BLOCK_START */:
            case 4 /* PLUS_BLOCK_START */:
            case 10 /* STAR_LOOP_ENTRY */:
                // report error and recover if possible
                if (this.singleTokenDeletion(recognizer)) {
                    return;
                }
                throw new InputMismatchException_1.InputMismatchException(recognizer);
            case 11 /* PLUS_LOOP_BACK */:
            case 9 /* STAR_LOOP_BACK */:
                //			System.err.println("at loop back: "+s.getClass().getSimpleName());
                this.reportUnwantedToken(recognizer);
                let expecting = recognizer.getExpectedTokens();
                let whatFollowsLoopIterationOrRule = expecting.or(this.getErrorRecoverySet(recognizer));
                this.consumeUntil(recognizer, whatFollowsLoopIterationOrRule);
                break;
            default:
                // do nothing if we can't identify the exact kind of ATN state
                break;
        }
    }
    /**
     * This is called by {@link #reportError} when the exception is a
     * {@link NoViableAltException}.
     *
     * @see #reportError
     *
     * @param recognizer the parser instance
     * @param e the recognition exception
     */
    reportNoViableAlternative(recognizer, e) {
        let tokens = recognizer.inputStream;
        let input;
        if (tokens) {
            if (e.startToken.type === Token_1.Token.EOF)
                input = "<EOF>";
            else
                input = tokens.getTextFromRange(e.startToken, e.getOffendingToken());
        }
        else {
            input = "<unknown input>";
        }
        let msg = "no viable alternative at input " + this.escapeWSAndQuote(input);
        this.notifyErrorListeners(recognizer, msg, e);
    }
    /**
     * This is called by {@link #reportError} when the exception is an
     * {@link InputMismatchException}.
     *
     * @see #reportError
     *
     * @param recognizer the parser instance
     * @param e the recognition exception
     */
    reportInputMismatch(recognizer, e) {
        let expected = e.expectedTokens;
        let expectedString = expected ? expected.toStringVocabulary(recognizer.vocabulary) : "";
        let msg = "mismatched input " + this.getTokenErrorDisplay(e.getOffendingToken(recognizer)) +
            " expecting " + expectedString;
        this.notifyErrorListeners(recognizer, msg, e);
    }
    /**
     * This is called by {@link #reportError} when the exception is a
     * {@link FailedPredicateException}.
     *
     * @see #reportError
     *
     * @param recognizer the parser instance
     * @param e the recognition exception
     */
    reportFailedPredicate(recognizer, e) {
        let ruleName = recognizer.ruleNames[recognizer.context.ruleIndex];
        let msg = "rule " + ruleName + " " + e.message;
        this.notifyErrorListeners(recognizer, msg, e);
    }
    /**
     * This method is called to report a syntax error which requires the removal
     * of a token from the input stream. At the time this method is called, the
     * erroneous symbol is current {@code LT(1)} symbol and has not yet been
     * removed from the input stream. When this method returns,
     * {@code recognizer} is in error recovery mode.
     *
     * <p>This method is called when {@link #singleTokenDeletion} identifies
     * single-token deletion as a viable recovery strategy for a mismatched
     * input error.</p>
     *
     * <p>The default implementation simply returns if the handler is already in
     * error recovery mode. Otherwise, it calls {@link #beginErrorCondition} to
     * enter error recovery mode, followed by calling
     * {@link Parser#notifyErrorListeners}.</p>
     *
     * @param recognizer the parser instance
     */
    reportUnwantedToken(recognizer) {
        if (this.inErrorRecoveryMode(recognizer)) {
            return;
        }
        this.beginErrorCondition(recognizer);
        let t = recognizer.currentToken;
        let tokenName = this.getTokenErrorDisplay(t);
        let expecting = this.getExpectedTokens(recognizer);
        let msg = "extraneous input " + tokenName + " expecting " +
            expecting.toStringVocabulary(recognizer.vocabulary);
        recognizer.notifyErrorListeners(msg, t, undefined);
    }
    /**
     * This method is called to report a syntax error which requires the
     * insertion of a missing token into the input stream. At the time this
     * method is called, the missing token has not yet been inserted. When this
     * method returns, {@code recognizer} is in error recovery mode.
     *
     * <p>This method is called when {@link #singleTokenInsertion} identifies
     * single-token insertion as a viable recovery strategy for a mismatched
     * input error.</p>
     *
     * <p>The default implementation simply returns if the handler is already in
     * error recovery mode. Otherwise, it calls {@link #beginErrorCondition} to
     * enter error recovery mode, followed by calling
     * {@link Parser#notifyErrorListeners}.</p>
     *
     * @param recognizer the parser instance
     */
    reportMissingToken(recognizer) {
        if (this.inErrorRecoveryMode(recognizer)) {
            return;
        }
        this.beginErrorCondition(recognizer);
        let t = recognizer.currentToken;
        let expecting = this.getExpectedTokens(recognizer);
        let msg = "missing " + expecting.toStringVocabulary(recognizer.vocabulary) +
            " at " + this.getTokenErrorDisplay(t);
        recognizer.notifyErrorListeners(msg, t, undefined);
    }
    /**
     * {@inheritDoc}
     *
     * <p>The default implementation attempts to recover from the mismatched input
     * by using single token insertion and deletion as described below. If the
     * recovery attempt fails, this method
     * {@link InputMismatchException}.</p>
     *
     * <p><strong>EXTRA TOKEN</strong> (single token deletion)</p>
     *
     * <p>{@code LA(1)} is not what we are looking for. If {@code LA(2)} has the
     * right token, however, then assume {@code LA(1)} is some extra spurious
     * token and delete it. Then consume and return the next token (which was
     * the {@code LA(2)} token) as the successful result of the match operation.</p>
     *
     * <p>This recovery strategy is implemented by {@link #singleTokenDeletion}.</p>
     *
     * <p><strong>MISSING TOKEN</strong> (single token insertion)</p>
     *
     * <p>If current token (at {@code LA(1)}) is consistent with what could come
     * after the expected {@code LA(1)} token, then assume the token is missing
     * and use the parser's {@link TokenFactory} to create it on the fly. The
     * "insertion" is performed by returning the created token as the successful
     * result of the match operation.</p>
     *
     * <p>This recovery strategy is implemented by {@link #singleTokenInsertion}.</p>
     *
     * <p><strong>EXAMPLE</strong></p>
     *
     * <p>For example, Input {@code i=(3;} is clearly missing the {@code ')'}. When
     * the parser returns from the nested call to {@code expr}, it will have
     * call chain:</p>
     *
     * <pre>
     * stat &rarr; expr &rarr; atom
     * </pre>
     *
     * and it will be trying to match the {@code ')'} at this point in the
     * derivation:
     *
     * <pre>
     * =&gt; ID '=' '(' INT ')' ('+' atom)* ';'
     *                    ^
     * </pre>
     *
     * The attempt to match {@code ')'} will fail when it sees {@code ';'} and
     * call {@link #recoverInline}. To recover, it sees that {@code LA(1)==';'}
     * is in the set of tokens that can follow the {@code ')'} token reference
     * in rule {@code atom}. It can assume that you forgot the {@code ')'}.
     */
    recoverInline(recognizer) {
        // SINGLE TOKEN DELETION
        let matchedSymbol = this.singleTokenDeletion(recognizer);
        if (matchedSymbol) {
            // we have deleted the extra token.
            // now, move past ttype token as if all were ok
            recognizer.consume();
            return matchedSymbol;
        }
        // SINGLE TOKEN INSERTION
        if (this.singleTokenInsertion(recognizer)) {
            return this.getMissingSymbol(recognizer);
        }
        // even that didn't work; must throw the exception
        throw new InputMismatchException_1.InputMismatchException(recognizer);
    }
    /**
     * This method implements the single-token insertion inline error recovery
     * strategy. It is called by {@link #recoverInline} if the single-token
     * deletion strategy fails to recover from the mismatched input. If this
     * method returns {@code true}, {@code recognizer} will be in error recovery
     * mode.
     *
     * <p>This method determines whether or not single-token insertion is viable by
     * checking if the {@code LA(1)} input symbol could be successfully matched
     * if it were instead the {@code LA(2)} symbol. If this method returns
     * {@code true}, the caller is responsible for creating and inserting a
     * token with the correct type to produce this behavior.</p>
     *
     * @param recognizer the parser instance
     * @return {@code true} if single-token insertion is a viable recovery
     * strategy for the current mismatched input, otherwise {@code false}
     */
    singleTokenInsertion(recognizer) {
        let currentSymbolType = recognizer.inputStream.LA(1);
        // if current token is consistent with what could come after current
        // ATN state, then we know we're missing a token; error recovery
        // is free to conjure up and insert the missing token
        let currentState = recognizer.interpreter.atn.states[recognizer.state];
        let next = currentState.transition(0).target;
        let atn = recognizer.interpreter.atn;
        let expectingAtLL2 = atn.nextTokens(next, PredictionContext_1.PredictionContext.fromRuleContext(atn, recognizer.context));
        //		console.warn("LT(2) set="+expectingAtLL2.toString(recognizer.getTokenNames()));
        if (expectingAtLL2.contains(currentSymbolType)) {
            this.reportMissingToken(recognizer);
            return true;
        }
        return false;
    }
    /**
     * This method implements the single-token deletion inline error recovery
     * strategy. It is called by {@link #recoverInline} to attempt to recover
     * from mismatched input. If this method returns null, the parser and error
     * handler state will not have changed. If this method returns non-null,
     * {@code recognizer} will <em>not</em> be in error recovery mode since the
     * returned token was a successful match.
     *
     * <p>If the single-token deletion is successful, this method calls
     * {@link #reportUnwantedToken} to report the error, followed by
     * {@link Parser#consume} to actually "delete" the extraneous token. Then,
     * before returning {@link #reportMatch} is called to signal a successful
     * match.</p>
     *
     * @param recognizer the parser instance
     * @return the successfully matched {@link Token} instance if single-token
     * deletion successfully recovers from the mismatched input, otherwise
     * {@code null}
     */
    singleTokenDeletion(recognizer) {
        let nextTokenType = recognizer.inputStream.LA(2);
        let expecting = this.getExpectedTokens(recognizer);
        if (expecting.contains(nextTokenType)) {
            this.reportUnwantedToken(recognizer);
            /*
            System.err.println("recoverFromMismatchedToken deleting "+
                               ((TokenStream)recognizer.inputStream).LT(1)+
                               " since "+((TokenStream)recognizer.inputStream).LT(2)+
                               " is what we want");
            */
            recognizer.consume(); // simply delete extra token
            // we want to return the token we're actually matching
            let matchedSymbol = recognizer.currentToken;
            this.reportMatch(recognizer); // we know current token is correct
            return matchedSymbol;
        }
        return undefined;
    }
    /** Conjure up a missing token during error recovery.
     *
     *  The recognizer attempts to recover from single missing
     *  symbols. But, actions might refer to that missing symbol.
     *  For example, x=ID {f($x);}. The action clearly assumes
     *  that there has been an identifier matched previously and that
     *  $x points at that token. If that token is missing, but
     *  the next token in the stream is what we want we assume that
     *  this token is missing and we keep going. Because we
     *  have to return some token to replace the missing token,
     *  we have to conjure one up. This method gives the user control
     *  over the tokens returned for missing tokens. Mostly,
     *  you will want to create something special for identifier
     *  tokens. For literals such as '{' and ',', the default
     *  action in the parser or tree parser works. It simply creates
     *  a CommonToken of the appropriate type. The text will be the token.
     *  If you change what tokens must be created by the lexer,
     *  override this method to create the appropriate tokens.
     */
    getMissingSymbol(recognizer) {
        let currentSymbol = recognizer.currentToken;
        let expecting = this.getExpectedTokens(recognizer);
        let expectedTokenType = expecting.minElement; // get any element
        let tokenText;
        if (expectedTokenType === Token_1.Token.EOF)
            tokenText = "<missing EOF>";
        else
            tokenText = "<missing " + recognizer.vocabulary.getDisplayName(expectedTokenType) + ">";
        let current = currentSymbol;
        let lookback = recognizer.inputStream.tryLT(-1);
        if (current.type === Token_1.Token.EOF && lookback != null) {
            current = lookback;
        }
        return this.constructToken(recognizer.inputStream.tokenSource, expectedTokenType, tokenText, current);
    }
    constructToken(tokenSource, expectedTokenType, tokenText, current) {
        let factory = tokenSource.tokenFactory;
        let x = current.tokenSource;
        let stream = x ? x.inputStream : undefined;
        return factory.create({ source: tokenSource, stream: stream }, expectedTokenType, tokenText, Token_1.Token.DEFAULT_CHANNEL, -1, -1, current.line, current.charPositionInLine);
    }
    getExpectedTokens(recognizer) {
        return recognizer.getExpectedTokens();
    }
    /** How should a token be displayed in an error message? The default
     *  is to display just the text, but during development you might
     *  want to have a lot of information spit out.  Override in that case
     *  to use t.toString() (which, for CommonToken, dumps everything about
     *  the token). This is better than forcing you to override a method in
     *  your token objects because you don't have to go modify your lexer
     *  so that it creates a new Java type.
     */
    getTokenErrorDisplay(t) {
        if (!t)
            return "<no token>";
        let s = this.getSymbolText(t);
        if (!s) {
            if (this.getSymbolType(t) === Token_1.Token.EOF) {
                s = "<EOF>";
            }
            else {
                s = `<${this.getSymbolType(t)}>`;
            }
        }
        return this.escapeWSAndQuote(s);
    }
    getSymbolText(symbol) {
        return symbol.text;
    }
    getSymbolType(symbol) {
        return symbol.type;
    }
    escapeWSAndQuote(s) {
        //		if ( s==null ) return s;
        s = s.replace("\n", "\\n");
        s = s.replace("\r", "\\r");
        s = s.replace("\t", "\\t");
        return "'" + s + "'";
    }
    /*  Compute the error recovery set for the current rule.  During
     *  rule invocation, the parser pushes the set of tokens that can
     *  follow that rule reference on the stack; this amounts to
     *  computing FIRST of what follows the rule reference in the
     *  enclosing rule. See LinearApproximator.FIRST().
     *  This local follow set only includes tokens
     *  from within the rule; i.e., the FIRST computation done by
     *  ANTLR stops at the end of a rule.
     *
     *  EXAMPLE
     *
     *  When you find a "no viable alt exception", the input is not
     *  consistent with any of the alternatives for rule r.  The best
     *  thing to do is to consume tokens until you see something that
     *  can legally follow a call to r *or* any rule that called r.
     *  You don't want the exact set of viable next tokens because the
     *  input might just be missing a token--you might consume the
     *  rest of the input looking for one of the missing tokens.
     *
     *  Consider grammar:
     *
     *  a : '[' b ']'
     *    | '(' b ')'
     *    ;
     *  b : c '^' INT ;
     *  c : ID
     *    | INT
     *    ;
     *
     *  At each rule invocation, the set of tokens that could follow
     *  that rule is pushed on a stack.  Here are the various
     *  context-sensitive follow sets:
     *
     *  FOLLOW(b1_in_a) = FIRST(']') = ']'
     *  FOLLOW(b2_in_a) = FIRST(')') = ')'
     *  FOLLOW(c_in_b) = FIRST('^') = '^'
     *
     *  Upon erroneous input "[]", the call chain is
     *
     *  a -> b -> c
     *
     *  and, hence, the follow context stack is:
     *
     *  depth     follow set       start of rule execution
     *    0         <EOF>                    a (from main())
     *    1          ']'                     b
     *    2          '^'                     c
     *
     *  Notice that ')' is not included, because b would have to have
     *  been called from a different context in rule a for ')' to be
     *  included.
     *
     *  For error recovery, we cannot consider FOLLOW(c)
     *  (context-sensitive or otherwise).  We need the combined set of
     *  all context-sensitive FOLLOW sets--the set of all tokens that
     *  could follow any reference in the call chain.  We need to
     *  resync to one of those tokens.  Note that FOLLOW(c)='^' and if
     *  we resync'd to that token, we'd consume until EOF.  We need to
     *  sync to context-sensitive FOLLOWs for a, b, and c: {']','^'}.
     *  In this case, for input "[]", LA(1) is ']' and in the set, so we would
     *  not consume anything. After printing an error, rule c would
     *  return normally.  Rule b would not find the required '^' though.
     *  At this point, it gets a mismatched token error and
     *  exception (since LA(1) is not in the viable following token
     *  set).  The rule exception handler tries to recover, but finds
     *  the same recovery set and doesn't consume anything.  Rule b
     *  exits normally returning to rule a.  Now it finds the ']' (and
     *  with the successful match exits errorRecovery mode).
     *
     *  So, you can see that the parser walks up the call chain looking
     *  for the token that was a member of the recovery set.
     *
     *  Errors are not generated in errorRecovery mode.
     *
     *  ANTLR's error recovery mechanism is based upon original ideas:
     *
     *  "Algorithms + Data Structures = Programs" by Niklaus Wirth
     *
     *  and
     *
     *  "A note on error recovery in recursive descent parsers":
     *  http://portal.acm.org/citation.cfm?id=947902.947905
     *
     *  Later, Josef Grosch had some good ideas:
     *
     *  "Efficient and Comfortable Error Recovery in Recursive Descent
     *  Parsers":
     *  ftp://www.cocolab.com/products/cocktail/doca4.ps/ell.ps.zip
     *
     *  Like Grosch I implement context-sensitive FOLLOW sets that are combined
     *  at run-time upon error to avoid overhead during parsing.
     */
    getErrorRecoverySet(recognizer) {
        let atn = recognizer.interpreter.atn;
        let ctx = recognizer.context;
        let recoverSet = new IntervalSet_1.IntervalSet();
        while (ctx && ctx.invokingState >= 0) {
            // compute what follows who invoked us
            let invokingState = atn.states[ctx.invokingState];
            let rt = invokingState.transition(0);
            let follow = atn.nextTokens(rt.followState);
            recoverSet.addAll(follow);
            ctx = ctx._parent;
        }
        recoverSet.remove(Token_1.Token.EPSILON);
        //		System.out.println("recover set "+recoverSet.toString(recognizer.getTokenNames()));
        return recoverSet;
    }
    /** Consume tokens until one matches the given token set. */
    consumeUntil(recognizer, set) {
        //		System.err.println("consumeUntil("+set.toString(recognizer.getTokenNames())+")");
        let ttype = recognizer.inputStream.LA(1);
        while (ttype !== Token_1.Token.EOF && !set.contains(ttype)) {
            //System.out.println("consume during recover LA(1)="+getTokenNames()[input.LA(1)]);
            //			recognizer.inputStream.consume();
            recognizer.consume();
            ttype = recognizer.inputStream.LA(1);
        }
    }
}
__decorate([
    Decorators_1.Override
], DefaultErrorStrategy.prototype, "reset", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "beginErrorCondition", null);
__decorate([
    Decorators_1.Override
], DefaultErrorStrategy.prototype, "inErrorRecoveryMode", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "endErrorCondition", null);
__decorate([
    Decorators_1.Override
], DefaultErrorStrategy.prototype, "reportMatch", null);
__decorate([
    Decorators_1.Override
], DefaultErrorStrategy.prototype, "reportError", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "notifyErrorListeners", null);
__decorate([
    Decorators_1.Override
], DefaultErrorStrategy.prototype, "recover", null);
__decorate([
    Decorators_1.Override
], DefaultErrorStrategy.prototype, "sync", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "reportNoViableAlternative", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "reportInputMismatch", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "reportFailedPredicate", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "reportUnwantedToken", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "reportMissingToken", null);
__decorate([
    Decorators_1.Override
], DefaultErrorStrategy.prototype, "recoverInline", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "singleTokenInsertion", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "singleTokenDeletion", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "getMissingSymbol", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "getExpectedTokens", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "getSymbolText", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "getSymbolType", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "escapeWSAndQuote", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "getErrorRecoverySet", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], DefaultErrorStrategy.prototype, "consumeUntil", null);
exports.DefaultErrorStrategy = DefaultErrorStrategy;

},{"./Decorators":16,"./FailedPredicateException":20,"./InputMismatchException":21,"./NoViableAltException":28,"./Token":40,"./atn/PredictionContext":81,"./misc/IntervalSet":112}],18:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:51.1349829-07:00
/**
 *
 * @author Sam Harwell
 */
var Dependents;
(function (Dependents) {
    /**
     * The element is dependent upon the specified rule.
     */
    Dependents[Dependents["SELF"] = 0] = "SELF";
    /**
     * The element is dependent upon the set of the specified rule's parents
     * (rules which directly reference it).
     */
    Dependents[Dependents["PARENTS"] = 1] = "PARENTS";
    /**
     * The element is dependent upon the set of the specified rule's children
     * (rules which it directly references).
     */
    Dependents[Dependents["CHILDREN"] = 2] = "CHILDREN";
    /**
     * The element is dependent upon the set of the specified rule's ancestors
     * (the transitive closure of `PARENTS` rules).
     */
    Dependents[Dependents["ANCESTORS"] = 3] = "ANCESTORS";
    /**
     * The element is dependent upon the set of the specified rule's descendants
     * (the transitive closure of `CHILDREN` rules).
     */
    Dependents[Dependents["DESCENDANTS"] = 4] = "DESCENDANTS";
    /**
     * The element is dependent upon the set of the specified rule's siblings
     * (the union of `CHILDREN` of its `PARENTS`).
     */
    Dependents[Dependents["SIBLINGS"] = 5] = "SIBLINGS";
    /**
     * The element is dependent upon the set of the specified rule's preceeding
     * siblings (the union of `CHILDREN` of its `PARENTS` which
     * appear before a reference to the rule).
     */
    Dependents[Dependents["PRECEEDING_SIBLINGS"] = 6] = "PRECEEDING_SIBLINGS";
    /**
     * The element is dependent upon the set of the specified rule's following
     * siblings (the union of `CHILDREN` of its `PARENTS` which
     * appear after a reference to the rule).
     */
    Dependents[Dependents["FOLLOWING_SIBLINGS"] = 7] = "FOLLOWING_SIBLINGS";
    /**
     * The element is dependent upon the set of the specified rule's preceeding
     * elements (rules which might end before the start of the specified rule
     * while parsing). This is calculated by taking the
     * `PRECEEDING_SIBLINGS` of the rule and each of its
     * `ANCESTORS`, along with the `DESCENDANTS` of those
     * elements.
     */
    Dependents[Dependents["PRECEEDING"] = 8] = "PRECEEDING";
    /**
     * The element is dependent upon the set of the specified rule's following
     * elements (rules which might start after the end of the specified rule
     * while parsing). This is calculated by taking the
     * `FOLLOWING_SIBLINGS` of the rule and each of its
     * `ANCESTORS`, along with the `DESCENDANTS` of those
     * elements.
     */
    Dependents[Dependents["FOLLOWING"] = 9] = "FOLLOWING";
})(Dependents = exports.Dependents || (exports.Dependents = {}));

},{}],19:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const BitSet_1 = require("./misc/BitSet");
const Decorators_1 = require("./Decorators");
const Interval_1 = require("./misc/Interval");
const Stubs_1 = require("./misc/Stubs");
class DiagnosticErrorListener {
    /**
     * Initializes a new instance of {@link DiagnosticErrorListener}, specifying
     * whether all ambiguities or only exact ambiguities are reported.
     *
     * @param exactOnly {@code true} to report only exact ambiguities, otherwise
     * {@code false} to report all ambiguities.  Defaults to true.
     */
    constructor(exactOnly = true) {
        this.exactOnly = exactOnly;
        this.exactOnly = exactOnly;
    }
    reportAmbiguity(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
        if (this.exactOnly && !exact) {
            return;
        }
        let decision = this.getDecisionDescription(recognizer, dfa);
        let conflictingAlts = this.getConflictingAlts(ambigAlts, configs);
        let text = recognizer.inputStream.getText(Interval_1.Interval.of(startIndex, stopIndex));
        let message = `reportAmbiguity d=${decision}: ambigAlts=${conflictingAlts}, input='${text}'`;
        recognizer.notifyErrorListeners(message);
    }
    reportAttemptingFullContext(recognizer, dfa, startIndex, stopIndex, conflictingAlts, conflictState) {
        let format = "reportAttemptingFullContext d=%s, input='%s'";
        let decision = this.getDecisionDescription(recognizer, dfa);
        let text = recognizer.inputStream.getText(Interval_1.Interval.of(startIndex, stopIndex));
        let message = `reportAttemptingFullContext d=${decision}, input='${text}'`;
        recognizer.notifyErrorListeners(message);
    }
    reportContextSensitivity(recognizer, dfa, startIndex, stopIndex, prediction, acceptState) {
        let format = "reportContextSensitivity d=%s, input='%s'";
        let decision = this.getDecisionDescription(recognizer, dfa);
        let text = recognizer.inputStream.getText(Interval_1.Interval.of(startIndex, stopIndex));
        let message = `reportContextSensitivity d=${decision}, input='${text}'`;
        recognizer.notifyErrorListeners(message);
    }
    getDecisionDescription(recognizer, dfa) {
        let decision = dfa.decision;
        let ruleIndex = dfa.atnStartState.ruleIndex;
        let ruleNames = recognizer.ruleNames;
        if (ruleIndex < 0 || ruleIndex >= ruleNames.length) {
            return decision.toString();
        }
        let ruleName = ruleNames[ruleIndex];
        if (!ruleName) {
            return decision.toString();
        }
        return `${decision} (${ruleName})`;
    }
    /**
     * Computes the set of conflicting or ambiguous alternatives from a
     * configuration set, if that information was not already provided by the
     * parser.
     *
     * @param reportedAlts The set of conflicting or ambiguous alternatives, as
     * reported by the parser.
     * @param configs The conflicting or ambiguous configuration set.
     * @return Returns {@code reportedAlts} if it is not {@code null}, otherwise
     * returns the set of alternatives represented in {@code configs}.
     */
    getConflictingAlts(reportedAlts, configs) {
        if (reportedAlts != null) {
            return reportedAlts;
        }
        let result = new BitSet_1.BitSet();
        for (let config of Stubs_1.asIterable(configs)) {
            result.set(config.alt);
        }
        return result;
    }
}
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(6, Decorators_1.NotNull)
], DiagnosticErrorListener.prototype, "reportAmbiguity", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(5, Decorators_1.NotNull)
], DiagnosticErrorListener.prototype, "reportAttemptingFullContext", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(5, Decorators_1.NotNull)
], DiagnosticErrorListener.prototype, "reportContextSensitivity", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull)
], DiagnosticErrorListener.prototype, "getDecisionDescription", null);
__decorate([
    Decorators_1.NotNull,
    __param(1, Decorators_1.NotNull)
], DiagnosticErrorListener.prototype, "getConflictingAlts", null);
exports.DiagnosticErrorListener = DiagnosticErrorListener;

},{"./Decorators":16,"./misc/BitSet":107,"./misc/Interval":111,"./misc/Stubs":116}],20:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const RecognitionException_1 = require("./RecognitionException");
const Decorators_1 = require("./Decorators");
const PredicateTransition_1 = require("./atn/PredicateTransition");
let FailedPredicateException = class FailedPredicateException extends RecognitionException_1.RecognitionException {
    constructor(recognizer, predicate, message) {
        super(recognizer, recognizer.inputStream, recognizer.context, FailedPredicateException.formatMessage(predicate, message));
        let s = recognizer.interpreter.atn.states[recognizer.state];
        let trans = s.transition(0);
        if (trans instanceof PredicateTransition_1.PredicateTransition) {
            this._ruleIndex = trans.ruleIndex;
            this._predicateIndex = trans.predIndex;
        }
        else {
            this._ruleIndex = 0;
            this._predicateIndex = 0;
        }
        this._predicate = predicate;
        super.setOffendingToken(recognizer, recognizer.currentToken);
    }
    get ruleIndex() {
        return this._ruleIndex;
    }
    get predicateIndex() {
        return this._predicateIndex;
    }
    get predicate() {
        return this._predicate;
    }
    static formatMessage(predicate, message) {
        if (message) {
            return message;
        }
        return `failed predicate: {${predicate}}?`;
    }
};
__decorate([
    Decorators_1.NotNull
], FailedPredicateException, "formatMessage", null);
FailedPredicateException = __decorate([
    __param(0, Decorators_1.NotNull)
], FailedPredicateException);
exports.FailedPredicateException = FailedPredicateException;

},{"./Decorators":16,"./RecognitionException":34,"./atn/PredicateTransition":80}],21:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:51.5187682-07:00
/** This signifies any kind of mismatched input exceptions such as
 *  when the current input does not match the expected token.
 */
const RecognitionException_1 = require("./RecognitionException");
const Decorators_1 = require("./Decorators");
let InputMismatchException = class InputMismatchException extends RecognitionException_1.RecognitionException {
    //private static serialVersionUID: number =  1532568338707443067L;
    constructor(recognizer) {
        super(recognizer, recognizer.inputStream, recognizer.context);
        super.setOffendingToken(recognizer, recognizer.currentToken);
    }
};
InputMismatchException = __decorate([
    __param(0, Decorators_1.NotNull)
], InputMismatchException);
exports.InputMismatchException = InputMismatchException;

},{"./Decorators":16,"./RecognitionException":34}],22:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:51.6934376-07:00
var IntStream;
(function (IntStream) {
    /**
     * The value returned by {@link #LA LA()} when the end of the stream is
     * reached.
     */
    IntStream.EOF = -1;
    /**
     * The value returned by {@link #getSourceName} when the actual name of the
     * underlying source is not known.
     */
    IntStream.UNKNOWN_SOURCE_NAME = "<unknown>";
})(IntStream = exports.IntStream || (exports.IntStream = {}));

},{}],23:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:51.5898546-07:00
const Decorators_1 = require("./Decorators");
const ParserRuleContext_1 = require("./ParserRuleContext");
/**
 * This class extends {@link ParserRuleContext} by allowing the value of
 * {@link #getRuleIndex} to be explicitly set for the context.
 *
 * <p>
 * {@link ParserRuleContext} does not include field storage for the rule index
 * since the context classes created by the code generator override the
 * {@link #getRuleIndex} method to return the correct value for that context.
 * Since the parser interpreter does not use the context classes generated for a
 * parser, this class (with slightly more memory overhead per node) is used to
 * provide equivalent functionality.</p>
 */
class InterpreterRuleContext extends ParserRuleContext_1.ParserRuleContext {
    constructor(ruleIndex, parent, invokingStateNumber) {
        if (invokingStateNumber !== undefined) {
            super(parent, invokingStateNumber);
        }
        else {
            super();
        }
        this._ruleIndex = ruleIndex;
    }
    get ruleIndex() {
        return this._ruleIndex;
    }
}
__decorate([
    Decorators_1.Override
], InterpreterRuleContext.prototype, "ruleIndex", null);
exports.InterpreterRuleContext = InterpreterRuleContext;

},{"./Decorators":16,"./ParserRuleContext":31}],24:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommonTokenFactory_1 = require("./CommonTokenFactory");
const IntegerStack_1 = require("./misc/IntegerStack");
const Interval_1 = require("./misc/Interval");
const IntStream_1 = require("./IntStream");
const LexerATNSimulator_1 = require("./atn/LexerATNSimulator");
const LexerNoViableAltException_1 = require("./LexerNoViableAltException");
const Decorators_1 = require("./Decorators");
const Recognizer_1 = require("./Recognizer");
const Token_1 = require("./Token");
/** A lexer is recognizer that draws input symbols from a character stream.
 *  lexer grammars result in a subclass of this object. A Lexer object
 *  uses simplified match() and error recovery mechanisms in the interest
 *  of speed.
 */
class Lexer extends Recognizer_1.Recognizer {
    constructor(input) {
        super();
        /** How to create token objects */
        this._factory = CommonTokenFactory_1.CommonTokenFactory.DEFAULT;
        /** What character index in the stream did the current token start at?
         *  Needed, for example, to get the text for current token.  Set at
         *  the start of nextToken.
         */
        this._tokenStartCharIndex = -1;
        /** The line on which the first character of the token resides */
        this._tokenStartLine = 0;
        /** The character position of first character within the line */
        this._tokenStartCharPositionInLine = 0;
        /** Once we see EOF on char stream, next token will be EOF.
         *  If you have DONE : EOF ; then you see DONE EOF.
         */
        this._hitEOF = false;
        /** The channel number for the current token */
        this._channel = 0;
        /** The token type for the current token */
        this._type = 0;
        this._modeStack = new IntegerStack_1.IntegerStack();
        this._mode = Lexer.DEFAULT_MODE;
        this._input = input;
        this._tokenFactorySourcePair = { source: this, stream: input };
    }
    static get DEFAULT_TOKEN_CHANNEL() {
        return Token_1.Token.DEFAULT_CHANNEL;
    }
    static get HIDDEN() {
        return Token_1.Token.HIDDEN_CHANNEL;
    }
    reset(resetInput) {
        // wack Lexer state variables
        if (resetInput === undefined || resetInput === true) {
            this._input.seek(0); // rewind the input
        }
        this._token = undefined;
        this._type = Token_1.Token.INVALID_TYPE;
        this._channel = Token_1.Token.DEFAULT_CHANNEL;
        this._tokenStartCharIndex = -1;
        this._tokenStartCharPositionInLine = -1;
        this._tokenStartLine = -1;
        this._text = undefined;
        this._hitEOF = false;
        this._mode = Lexer.DEFAULT_MODE;
        this._modeStack.clear();
        this.interpreter.reset();
    }
    /** Return a token from this source; i.e., match a token on the char
     *  stream.
     */
    nextToken() {
        if (this._input == null) {
            throw new Error("nextToken requires a non-null input stream.");
        }
        // Mark start location in char stream so unbuffered streams are
        // guaranteed at least have text of current token
        let tokenStartMarker = this._input.mark();
        try {
            outer: while (true) {
                if (this._hitEOF) {
                    return this.emitEOF();
                }
                this._token = undefined;
                this._channel = Token_1.Token.DEFAULT_CHANNEL;
                this._tokenStartCharIndex = this._input.index;
                this._tokenStartCharPositionInLine = this.interpreter.charPositionInLine;
                this._tokenStartLine = this.interpreter.line;
                this._text = undefined;
                do {
                    this._type = Token_1.Token.INVALID_TYPE;
                    //				System.out.println("nextToken line "+tokenStartLine+" at "+((char)input.LA(1))+
                    //								   " in mode "+mode+
                    //								   " at index "+input.index);
                    let ttype;
                    try {
                        ttype = this.interpreter.match(this._input, this._mode);
                    }
                    catch (e) {
                        if (e instanceof LexerNoViableAltException_1.LexerNoViableAltException) {
                            this.notifyListeners(e); // report error
                            this.recover(e);
                            ttype = Lexer.SKIP;
                        }
                        else {
                            throw e;
                        }
                    }
                    if (this._input.LA(1) === IntStream_1.IntStream.EOF) {
                        this._hitEOF = true;
                    }
                    if (this._type === Token_1.Token.INVALID_TYPE)
                        this._type = ttype;
                    if (this._type === Lexer.SKIP) {
                        continue outer;
                    }
                } while (this._type === Lexer.MORE);
                if (this._token == null)
                    return this.emit();
                return this._token;
            }
        }
        finally {
            // make sure we release marker after match or
            // unbuffered char stream will keep buffering
            this._input.release(tokenStartMarker);
        }
    }
    /** Instruct the lexer to skip creating a token for current lexer rule
     *  and look for another token.  nextToken() knows to keep looking when
     *  a lexer rule finishes with token set to SKIP_TOKEN.  Recall that
     *  if token==null at end of any token rule, it creates one for you
     *  and emits it.
     */
    skip() {
        this._type = Lexer.SKIP;
    }
    more() {
        this._type = Lexer.MORE;
    }
    mode(m) {
        this._mode = m;
    }
    pushMode(m) {
        if (LexerATNSimulator_1.LexerATNSimulator.debug)
            console.log("pushMode " + m);
        this._modeStack.push(this._mode);
        this.mode(m);
    }
    popMode() {
        if (this._modeStack.isEmpty)
            throw new Error("EmptyStackException");
        if (LexerATNSimulator_1.LexerATNSimulator.debug)
            console.log("popMode back to " + this._modeStack.peek());
        this.mode(this._modeStack.pop());
        return this._mode;
    }
    get tokenFactory() {
        return this._factory;
    }
    // @Override
    set tokenFactory(factory) {
        this._factory = factory;
    }
    /** Set the char stream and reset the lexer */
    set inputStream(input) {
        this.reset(false);
        this._input = input;
        this._tokenFactorySourcePair = { source: this, stream: this._input };
    }
    get sourceName() {
        return this._input.sourceName;
    }
    get inputStream() {
        return this._input;
    }
    emit(token) {
        if (!token)
            token = this._factory.create(this._tokenFactorySourcePair, this._type, this._text, this._channel, this._tokenStartCharIndex, this.charIndex - 1, this._tokenStartLine, this._tokenStartCharPositionInLine);
        this._token = token;
        return token;
    }
    emitEOF() {
        let cpos = this.charPositionInLine;
        let line = this.line;
        let eof = this._factory.create(this._tokenFactorySourcePair, Token_1.Token.EOF, undefined, Token_1.Token.DEFAULT_CHANNEL, this._input.index, this._input.index - 1, line, cpos);
        this.emit(eof);
        return eof;
    }
    get line() {
        return this.interpreter.line;
    }
    get charPositionInLine() {
        return this.interpreter.charPositionInLine;
    }
    set line(line) {
        this.interpreter.line = line;
    }
    set charPositionInLine(charPositionInLine) {
        this.interpreter.charPositionInLine = charPositionInLine;
    }
    /** What is the index of the current character of lookahead? */
    get charIndex() {
        return this._input.index;
    }
    /** Return the text matched so far for the current token or any
     *  text override.
     */
    get text() {
        if (this._text != null) {
            return this._text;
        }
        return this.interpreter.getText(this._input);
    }
    /** Set the complete text of this token; it wipes any previous
     *  changes to the text.
     */
    set text(text) {
        this._text = text;
    }
    /** Override if emitting multiple tokens. */
    get token() { return this._token; }
    set token(_token) {
        this._token = _token;
    }
    set type(ttype) {
        this._type = ttype;
    }
    get type() {
        return this._type;
    }
    set channel(channel) {
        this._channel = channel;
    }
    get channel() {
        return this._channel;
    }
    /** Return a list of all Token objects in input char stream.
     *  Forces load of all tokens. Does not include EOF token.
     */
    getAllTokens() {
        let tokens = [];
        let t = this.nextToken();
        while (t.type != Token_1.Token.EOF) {
            tokens.push(t);
            t = this.nextToken();
        }
        return tokens;
    }
    notifyListeners(e) {
        let text = this._input.getText(Interval_1.Interval.of(this._tokenStartCharIndex, this._input.index));
        let msg = "token recognition error at: '" +
            this.getErrorDisplay(text) + "'";
        let listener = this.getErrorListenerDispatch();
        if (listener.syntaxError) {
            listener.syntaxError(this, undefined, this._tokenStartLine, this._tokenStartCharPositionInLine, msg, e);
        }
    }
    getErrorDisplay(s) {
        if (typeof s === "number") {
            switch (s) {
                case Token_1.Token.EOF:
                    return "<EOF>";
                case 0x0a:
                    return "\\n";
                case 0x09:
                    return "\\t";
                case 0x0d:
                    return "\\r";
            }
            return String.fromCharCode(s);
        }
        return s.replace(/\n/g, "\\n")
            .replace(/\t/g, "\\t")
            .replace(/\r/g, "\\r");
    }
    getCharErrorDisplay(c) {
        let s = this.getErrorDisplay(c);
        return "'" + s + "'";
    }
    recover(re) {
        if (re instanceof LexerNoViableAltException_1.LexerNoViableAltException) {
            if (this._input.LA(1) != IntStream_1.IntStream.EOF) {
                // skip a char and try again
                this.interpreter.consume(this._input);
            }
        }
        else {
            //System.out.println("consuming char "+(char)input.LA(1)+" during recovery");
            //re.printStackTrace();
            // TODO: Do we lose character or line position information?
            this._input.consume();
        }
    }
}
Lexer.DEFAULT_MODE = 0;
Lexer.MORE = -2;
Lexer.SKIP = -3;
Lexer.MIN_CHAR_VALUE = 0x0000;
Lexer.MAX_CHAR_VALUE = 0xFFFF;
__decorate([
    Decorators_1.Override
], Lexer.prototype, "nextToken", null);
__decorate([
    Decorators_1.Override
], Lexer.prototype, "tokenFactory", null);
__decorate([
    Decorators_1.Override
], Lexer.prototype, "sourceName", null);
__decorate([
    Decorators_1.Override
], Lexer.prototype, "inputStream", null);
__decorate([
    Decorators_1.Override
], Lexer.prototype, "line", null);
__decorate([
    Decorators_1.Override
], Lexer.prototype, "charPositionInLine", null);
exports.Lexer = Lexer;

},{"./CommonTokenFactory":13,"./Decorators":16,"./IntStream":22,"./LexerNoViableAltException":26,"./Recognizer":35,"./Token":40,"./atn/LexerATNSimulator":62,"./misc/IntegerStack":110,"./misc/Interval":111}],25:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Lexer_1 = require("./Lexer");
const LexerATNSimulator_1 = require("./atn/LexerATNSimulator");
const Decorators_1 = require("./Decorators");
const Decorators_2 = require("./Decorators");
let LexerInterpreter = class LexerInterpreter extends Lexer_1.Lexer {
    constructor(grammarFileName, vocabulary, modeNames, ruleNames, atn, input) {
        super(input);
        if (atn.grammarType != 0 /* LEXER */) {
            throw new Error("IllegalArgumentException: The ATN must be a lexer ATN.");
        }
        this._grammarFileName = grammarFileName;
        this._atn = atn;
        this._ruleNames = ruleNames.slice(0);
        this._modeNames = modeNames.slice(0);
        this._vocabulary = vocabulary;
        this._interp = new LexerATNSimulator_1.LexerATNSimulator(atn, this);
    }
    get atn() {
        return this._atn;
    }
    get grammarFileName() {
        return this._grammarFileName;
    }
    get ruleNames() {
        return this._ruleNames;
    }
    get modeNames() {
        return this._modeNames;
    }
    get vocabulary() {
        return this._vocabulary;
    }
};
__decorate([
    Decorators_1.NotNull
], LexerInterpreter.prototype, "_vocabulary", void 0);
__decorate([
    Decorators_2.Override
], LexerInterpreter.prototype, "atn", null);
__decorate([
    Decorators_2.Override
], LexerInterpreter.prototype, "grammarFileName", null);
__decorate([
    Decorators_2.Override
], LexerInterpreter.prototype, "ruleNames", null);
__decorate([
    Decorators_2.Override
], LexerInterpreter.prototype, "modeNames", null);
__decorate([
    Decorators_2.Override
], LexerInterpreter.prototype, "vocabulary", null);
LexerInterpreter = __decorate([
    __param(1, Decorators_1.NotNull)
], LexerInterpreter);
exports.LexerInterpreter = LexerInterpreter;

},{"./Decorators":16,"./Lexer":24,"./atn/LexerATNSimulator":62}],26:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const RecognitionException_1 = require("./RecognitionException");
const Decorators_1 = require("./Decorators");
const Interval_1 = require("./misc/Interval");
const Utils = require("./misc/Utils");
let LexerNoViableAltException = class LexerNoViableAltException extends RecognitionException_1.RecognitionException {
    constructor(lexer, input, startIndex, deadEndConfigs) {
        super(lexer, input);
        this._startIndex = startIndex;
        this._deadEndConfigs = deadEndConfigs;
    }
    get startIndex() {
        return this._startIndex;
    }
    get deadEndConfigs() {
        return this._deadEndConfigs;
    }
    get inputStream() {
        return super.inputStream;
    }
    toString() {
        let symbol = "";
        if (this._startIndex >= 0 && this._startIndex < this.inputStream.size) {
            symbol = this.inputStream.getText(Interval_1.Interval.of(this._startIndex, this._startIndex));
            symbol = Utils.escapeWhitespace(symbol, false);
        }
        // return String.format(Locale.getDefault(), "%s('%s')", LexerNoViableAltException.class.getSimpleName(), symbol);
        return `LexerNoViableAltException('${symbol}')`;
    }
};
__decorate([
    Decorators_1.Override
], LexerNoViableAltException.prototype, "inputStream", null);
__decorate([
    Decorators_1.Override
], LexerNoViableAltException.prototype, "toString", null);
LexerNoViableAltException = __decorate([
    __param(1, Decorators_1.NotNull)
], LexerNoViableAltException);
exports.LexerNoViableAltException = LexerNoViableAltException;

},{"./Decorators":16,"./RecognitionException":34,"./misc/Interval":111,"./misc/Utils":118}],27:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommonTokenFactory_1 = require("./CommonTokenFactory");
const Decorators_1 = require("./Decorators");
const Token_1 = require("./Token");
/**
 * Provides an implementation of {@link TokenSource} as a wrapper around a list
 * of {@link Token} objects.
 *
 * <p>If the final token in the list is an {@link Token#EOF} token, it will be used
 * as the EOF token for every call to {@link #nextToken} after the end of the
 * list is reached. Otherwise, an EOF token will be created.</p>
 */
let ListTokenSource = class ListTokenSource {
    /**
     * Constructs a new {@link ListTokenSource} instance from the specified
     * collection of {@link Token} objects and source name.
     *
     * @param tokens The collection of {@link Token} objects to provide as a
     * {@link TokenSource}.
     * @param sourceName The name of the {@link TokenSource}. If this value is
     * {@code null}, {@link #getSourceName} will attempt to infer the name from
     * the next {@link Token} (or the previous token if the end of the input has
     * been reached).
     *
     * @exception NullPointerException if {@code tokens} is {@code null}
     */
    constructor(tokens, sourceName) {
        /**
         * The index into {@link #tokens} of token to return by the next call to
         * {@link #nextToken}. The end of the input is indicated by this value
         * being greater than or equal to the number of items in {@link #tokens}.
         */
        this.i = 0;
        /**
         * This is the backing field for {@link #getTokenFactory} and
         * {@link setTokenFactory}.
         */
        this._factory = CommonTokenFactory_1.CommonTokenFactory.DEFAULT;
        if (tokens == null) {
            throw new Error("tokens cannot be null");
        }
        this.tokens = tokens;
        this._sourceName = sourceName;
    }
    /**
     * {@inheritDoc}
     */
    get charPositionInLine() {
        if (this.i < this.tokens.length) {
            return this.tokens[this.i].charPositionInLine;
        }
        else if (this.eofToken != null) {
            return this.eofToken.charPositionInLine;
        }
        else if (this.tokens.length > 0) {
            // have to calculate the result from the line/column of the previous
            // token, along with the text of the token.
            let lastToken = this.tokens[this.tokens.length - 1];
            let tokenText = lastToken.text;
            if (tokenText != null) {
                let lastNewLine = tokenText.lastIndexOf('\n');
                if (lastNewLine >= 0) {
                    return tokenText.length - lastNewLine - 1;
                }
            }
            return lastToken.charPositionInLine + lastToken.stopIndex - lastToken.startIndex + 1;
        }
        // only reach this if tokens is empty, meaning EOF occurs at the first
        // position in the input
        return 0;
    }
    /**
     * {@inheritDoc}
     */
    nextToken() {
        if (this.i >= this.tokens.length) {
            if (this.eofToken == null) {
                let start = -1;
                if (this.tokens.length > 0) {
                    let previousStop = this.tokens[this.tokens.length - 1].stopIndex;
                    if (previousStop !== -1) {
                        start = previousStop + 1;
                    }
                }
                let stop = Math.max(-1, start - 1);
                this.eofToken = this._factory.create({ source: this, stream: this.inputStream }, Token_1.Token.EOF, "EOF", Token_1.Token.DEFAULT_CHANNEL, start, stop, this.line, this.charPositionInLine);
            }
            return this.eofToken;
        }
        let t = this.tokens[this.i];
        if (this.i === this.tokens.length - 1 && t.type === Token_1.Token.EOF) {
            this.eofToken = t;
        }
        this.i++;
        return t;
    }
    /**
     * {@inheritDoc}
     */
    get line() {
        if (this.i < this.tokens.length) {
            return this.tokens[this.i].line;
        }
        else if (this.eofToken != null) {
            return this.eofToken.line;
        }
        else if (this.tokens.length > 0) {
            // have to calculate the result from the line/column of the previous
            // token, along with the text of the token.
            let lastToken = this.tokens[this.tokens.length - 1];
            let line = lastToken.line;
            let tokenText = lastToken.text;
            if (tokenText != null) {
                for (let i = 0; i < tokenText.length; i++) {
                    if (tokenText.charAt(i) == '\n') {
                        line++;
                    }
                }
            }
            // if no text is available, assume the token did not contain any newline characters.
            return line;
        }
        // only reach this if tokens is empty, meaning EOF occurs at the first
        // position in the input
        return 1;
    }
    /**
     * {@inheritDoc}
     */
    get inputStream() {
        if (this.i < this.tokens.length) {
            return this.tokens[this.i].inputStream;
        }
        else if (this.eofToken != null) {
            return this.eofToken.inputStream;
        }
        else if (this.tokens.length > 0) {
            return this.tokens[this.tokens.length - 1].inputStream;
        }
        // no input stream information is available
        return undefined;
    }
    /**
     * {@inheritDoc}
     */
    get sourceName() {
        if (this._sourceName) {
            return this._sourceName;
        }
        let inputStream = this.inputStream;
        if (inputStream != null) {
            return inputStream.sourceName;
        }
        return "List";
    }
    /**
     * {@inheritDoc}
     */
    // @Override
    set tokenFactory(factory) {
        this._factory = factory;
    }
    /**
     * {@inheritDoc}
     */
    get tokenFactory() {
        return this._factory;
    }
};
__decorate([
    Decorators_1.Override
], ListTokenSource.prototype, "charPositionInLine", null);
__decorate([
    Decorators_1.Override
], ListTokenSource.prototype, "nextToken", null);
__decorate([
    Decorators_1.Override
], ListTokenSource.prototype, "line", null);
__decorate([
    Decorators_1.Override
], ListTokenSource.prototype, "inputStream", null);
__decorate([
    Decorators_1.Override
], ListTokenSource.prototype, "sourceName", null);
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], ListTokenSource.prototype, "tokenFactory", null);
ListTokenSource = __decorate([
    __param(0, Decorators_1.NotNull)
], ListTokenSource);
exports.ListTokenSource = ListTokenSource;

},{"./CommonTokenFactory":13,"./Decorators":16,"./Token":40}],28:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Parser_1 = require("./Parser");
const RecognitionException_1 = require("./RecognitionException");
const Decorators_1 = require("./Decorators");
class NoViableAltException extends RecognitionException_1.RecognitionException {
    constructor(recognizer, input, startToken, offendingToken, deadEndConfigs, ctx) {
        if (recognizer instanceof Parser_1.Parser) {
            if (input === undefined) {
                input = recognizer.inputStream;
            }
            if (startToken === undefined) {
                startToken = recognizer.currentToken;
            }
            if (offendingToken === undefined) {
                offendingToken = recognizer.currentToken;
            }
            if (ctx === undefined) {
                ctx = recognizer.context;
            }
        }
        super(recognizer, input, ctx);
        this._deadEndConfigs = deadEndConfigs;
        this._startToken = startToken;
        this.setOffendingToken(recognizer, offendingToken);
    }
    get startToken() {
        return this._startToken;
    }
    get deadEndConfigs() {
        return this._deadEndConfigs;
    }
}
__decorate([
    Decorators_1.NotNull
], NoViableAltException.prototype, "_startToken", void 0);
exports.NoViableAltException = NoViableAltException;

},{"./Decorators":16,"./Parser":29,"./RecognitionException":34}],29:[function(require,module,exports){
(function (process){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils = require("./misc/Utils");
const ATNDeserializationOptions_1 = require("./atn/ATNDeserializationOptions");
const ATNDeserializer_1 = require("./atn/ATNDeserializer");
const DefaultErrorStrategy_1 = require("./DefaultErrorStrategy");
const IntegerStack_1 = require("./misc/IntegerStack");
const Lexer_1 = require("./Lexer");
const Decorators_1 = require("./Decorators");
// import { ParseTreePatternMatcher } from './tree/pattern/ParseTreePatternMatcher';
// import { ProfilingATNSimulator } from './atn/ProfilingATNSimulator';
const ProxyParserErrorListener_1 = require("./ProxyParserErrorListener");
const Recognizer_1 = require("./Recognizer");
const Token_1 = require("./Token");
class TraceListener {
    constructor(ruleNames, tokenStream) {
        this.ruleNames = ruleNames;
        this.tokenStream = tokenStream;
    }
    enterEveryRule(ctx) {
        console.log("enter   " + this.ruleNames[ctx.ruleIndex] +
            ", LT(1)=" + this.tokenStream.LT(1).text);
    }
    exitEveryRule(ctx) {
        console.log("exit    " + this.ruleNames[ctx.ruleIndex] +
            ", LT(1)=" + this.tokenStream.LT(1).text);
    }
    visitErrorNode(node) {
    }
    visitTerminal(node) {
        let parent = node.parent.ruleContext;
        let token = node.symbol;
        console.log("consume " + token + " rule " + this.ruleNames[parent.ruleIndex]);
    }
}
__decorate([
    Decorators_1.Override
], TraceListener.prototype, "enterEveryRule", null);
__decorate([
    Decorators_1.Override
], TraceListener.prototype, "exitEveryRule", null);
__decorate([
    Decorators_1.Override
], TraceListener.prototype, "visitErrorNode", null);
__decorate([
    Decorators_1.Override
], TraceListener.prototype, "visitTerminal", null);
/** This is all the parsing support code essentially; most of it is error recovery stuff. */
class Parser extends Recognizer_1.Recognizer {
    constructor(input) {
        super();
        /**
         * The error handling strategy for the parser. The default value is a new
         * instance of {@link DefaultErrorStrategy}.
         *
         * @see #getErrorHandler
         * @see #setErrorHandler
         */
        this._errHandler = new DefaultErrorStrategy_1.DefaultErrorStrategy();
        this._precedenceStack = new IntegerStack_1.IntegerStack();
        /**
         * Specifies whether or not the parser should construct a parse tree during
         * the parsing process. The default value is `true`.
         *
         * @see `buildParseTree`
         */
        this._buildParseTrees = true;
        /**
         * The list of {@link ParseTreeListener} listeners registered to receive
         * events during the parse.
         *
         * @see #addParseListener
         */
        this._parseListeners = [];
        /**
         * The number of syntax errors reported during parsing. This value is
         * incremented each time {@link #notifyErrorListeners} is called.
         */
        this._syntaxErrors = 0;
        /** Indicates parser has match()ed EOF token. See {@link #exitRule()}. */
        this.matchedEOF = false;
        this._precedenceStack.push(0);
        this.inputStream = input;
    }
    reset(resetInput) {
        // Note: this method executes when not parsing, so _ctx can be undefined
        if (resetInput === undefined || resetInput === true) {
            this.inputStream.seek(0);
        }
        this._errHandler.reset(this);
        this._ctx = undefined;
        this._syntaxErrors = 0;
        this.matchedEOF = false;
        this.isTrace = false;
        this._precedenceStack.clear();
        this._precedenceStack.push(0);
        let interpreter = this.interpreter;
        if (interpreter != null) {
            interpreter.reset();
        }
    }
    /**
     * Match current input symbol against {@code ttype}. If the symbol type
     * matches, {@link ANTLRErrorStrategy#reportMatch} and {@link #consume} are
     * called to complete the match process.
     *
     * <p>If the symbol type does not match,
     * {@link ANTLRErrorStrategy#recoverInline} is called on the current error
     * strategy to attempt recovery. If {@link #getBuildParseTree} is
     * {@code true} and the token index of the symbol returned by
     * {@link ANTLRErrorStrategy#recoverInline} is -1, the symbol is added to
     * the parse tree by calling {@link ParserRuleContext#addErrorNode}.</p>
     *
     * @param ttype the token type to match
     * @return the matched symbol
     * @ if the current input symbol did not match
     * {@code ttype} and the error strategy could not recover from the
     * mismatched symbol
     */
    match(ttype) {
        let t = this.currentToken;
        if (t.type === ttype) {
            if (ttype === Token_1.Token.EOF) {
                this.matchedEOF = true;
            }
            this._errHandler.reportMatch(this);
            this.consume();
        }
        else {
            t = this._errHandler.recoverInline(this);
            if (this._buildParseTrees && t.tokenIndex === -1) {
                // we must have conjured up a new token during single token insertion
                // if it's not the current symbol
                this._ctx.addErrorNode(t);
            }
        }
        return t;
    }
    /**
     * Match current input symbol as a wildcard. If the symbol type matches
     * (i.e. has a value greater than 0), {@link ANTLRErrorStrategy#reportMatch}
     * and {@link #consume} are called to complete the match process.
     *
     * <p>If the symbol type does not match,
     * {@link ANTLRErrorStrategy#recoverInline} is called on the current error
     * strategy to attempt recovery. If {@link #getBuildParseTree} is
     * {@code true} and the token index of the symbol returned by
     * {@link ANTLRErrorStrategy#recoverInline} is -1, the symbol is added to
     * the parse tree by calling {@link ParserRuleContext#addErrorNode}.</p>
     *
     * @return the matched symbol
     * @ if the current input symbol did not match
     * a wildcard and the error strategy could not recover from the mismatched
     * symbol
     */
    matchWildcard() {
        let t = this.currentToken;
        if (t.type > 0) {
            this._errHandler.reportMatch(this);
            this.consume();
        }
        else {
            t = this._errHandler.recoverInline(this);
            if (this._buildParseTrees && t.tokenIndex == -1) {
                // we must have conjured up a new token during single token insertion
                // if it's not the current symbol
                this._ctx.addErrorNode(t);
            }
        }
        return t;
    }
    /**
     * Track the {@link ParserRuleContext} objects during the parse and hook
     * them up using the {@link ParserRuleContext#children} list so that it
     * forms a parse tree. The {@link ParserRuleContext} returned from the start
     * rule represents the root of the parse tree.
     *
     * <p>Note that if we are not building parse trees, rule contexts only point
     * upwards. When a rule exits, it returns the context but that gets garbage
     * collected if nobody holds a reference. It points upwards but nobody
     * points at it.</p>
     *
     * <p>When we build parse trees, we are adding all of these contexts to
     * {@link ParserRuleContext#children} list. Contexts are then not candidates
     * for garbage collection.</p>
     */
    set buildParseTree(buildParseTrees) {
        this._buildParseTrees = buildParseTrees;
    }
    /**
     * Gets whether or not a complete parse tree will be constructed while
     * parsing. This property is {@code true} for a newly constructed parser.
     *
     * @return {@code true} if a complete parse tree will be constructed while
     * parsing, otherwise {@code false}
     */
    get buildParseTree() {
        return this._buildParseTrees;
    }
    getParseListeners() {
        return this._parseListeners;
    }
    /**
     * Registers {@code listener} to receive events during the parsing process.
     *
     * <p>To support output-preserving grammar transformations (including but not
     * limited to left-recursion removal, automated left-factoring, and
     * optimized code generation), calls to listener methods during the parse
     * may differ substantially from calls made by
     * {@link ParseTreeWalker#DEFAULT} used after the parse is complete. In
     * particular, rule entry and exit events may occur in a different order
     * during the parse than after the parser. In addition, calls to certain
     * rule entry methods may be omitted.</p>
     *
     * <p>With the following specific exceptions, calls to listener events are
     * <em>deterministic</em>, i.e. for identical input the calls to listener
     * methods will be the same.</p>
     *
     * <ul>
     * <li>Alterations to the grammar used to generate code may change the
     * behavior of the listener calls.</li>
     * <li>Alterations to the command line options passed to ANTLR 4 when
     * generating the parser may change the behavior of the listener calls.</li>
     * <li>Changing the version of the ANTLR Tool used to generate the parser
     * may change the behavior of the listener calls.</li>
     * </ul>
     *
     * @param listener the listener to add
     *
     * @ if {@code} listener is {@code null}
     */
    addParseListener(listener) {
        if (listener == null) {
            throw new TypeError("listener cannot be null");
        }
        this._parseListeners.push(listener);
    }
    /**
     * Remove {@code listener} from the list of parse listeners.
     *
     * <p>If {@code listener} is {@code null} or has not been added as a parse
     * listener, this method does nothing.</p>
     *
     * @see #addParseListener
     *
     * @param listener the listener to remove
     */
    removeParseListener(listener) {
        let index = this._parseListeners.findIndex(l => l === listener);
        if (index != -1) {
            this._parseListeners.splice(index, 1);
        }
    }
    /**
     * Remove all parse listeners.
     *
     * @see #addParseListener
     */
    removeParseListeners() {
        this._parseListeners.length = 0;
    }
    /**
     * Notify any parse listeners of an enter rule event.
     *
     * @see #addParseListener
     */
    triggerEnterRuleEvent() {
        for (let listener of this._parseListeners) {
            if (listener.enterEveryRule) {
                listener.enterEveryRule(this._ctx);
            }
            this._ctx.enterRule(listener);
        }
    }
    /**
     * Notify any parse listeners of an exit rule event.
     *
     * @see #addParseListener
     */
    triggerExitRuleEvent() {
        // reverse order walk of listeners
        for (let i = this._parseListeners.length - 1; i >= 0; i--) {
            let listener = this._parseListeners[i];
            this._ctx.exitRule(listener);
            if (listener.exitEveryRule) {
                listener.exitEveryRule(this._ctx);
            }
        }
    }
    /**
     * Gets the number of syntax errors reported during parsing. This value is
     * incremented each time {@link #notifyErrorListeners} is called.
     *
     * @see #notifyErrorListeners
     */
    get numberOfSyntaxErrors() {
        return this._syntaxErrors;
    }
    get tokenFactory() {
        return this._input.tokenSource.tokenFactory;
    }
    /**
     * The ATN with bypass alternatives is expensive to create so we create it
     * lazily.
     *
     * @ if the current parser does not
     * implement the `serializedATN` property.
     */
    getATNWithBypassAlts() {
        let serializedAtn = this.serializedATN;
        if (serializedAtn == null) {
            throw new Error("The current parser does not support an ATN with bypass alternatives.");
        }
        let result = Parser.bypassAltsAtnCache.get(serializedAtn);
        if (result == null) {
            let deserializationOptions = new ATNDeserializationOptions_1.ATNDeserializationOptions();
            deserializationOptions.isGenerateRuleBypassTransitions = true;
            result = new ATNDeserializer_1.ATNDeserializer(deserializationOptions).deserialize(Utils.toCharArray(serializedAtn));
            Parser.bypassAltsAtnCache.set(serializedAtn, result);
        }
        return result;
    }
    compileParseTreePattern(pattern, patternRuleIndex, lexer) {
        if (!lexer) {
            if (this.inputStream) {
                let tokenSource = this.inputStream.tokenSource;
                if (tokenSource instanceof Lexer_1.Lexer) {
                    lexer = tokenSource;
                }
            }
            if (!lexer) {
                throw new Error("Parser can't discover a lexer to use");
            }
        }
        throw new Error("Not implemented");
        // let m: ParseTreePatternMatcher =  new ParseTreePatternMatcher(lexer, this);
        // return m.compile(pattern, patternRuleIndex);
    }
    get errorHandler() {
        return this._errHandler;
    }
    set errorHandler(handler) {
        this._errHandler = handler;
    }
    get inputStream() {
        return this._input;
    }
    /** Set the token stream and reset the parser. */
    set inputStream(input) {
        this.reset(false);
        this._input = input;
    }
    /** Match needs to return the current input symbol, which gets put
     *  into the label for the associated token ref; e.g., x=ID.
     */
    get currentToken() {
        return this._input.LT(1);
    }
    notifyErrorListeners(msg, offendingToken, e) {
        if (offendingToken === undefined) {
            offendingToken = this.currentToken;
        }
        else if (offendingToken === null) {
            offendingToken = undefined;
        }
        this._syntaxErrors++;
        let line = -1;
        let charPositionInLine = -1;
        if (offendingToken != null) {
            line = offendingToken.line;
            charPositionInLine = offendingToken.charPositionInLine;
        }
        let listener = this.getErrorListenerDispatch();
        if (listener.syntaxError) {
            listener.syntaxError(this, offendingToken, line, charPositionInLine, msg, e);
        }
    }
    /**
     * Consume and return the [current symbol](`currentToken`).
     *
     * <p>E.g., given the following input with {@code A} being the current
     * lookahead symbol, this function moves the cursor to {@code B} and returns
     * {@code A}.</p>
     *
     * <pre>
     *  A B
     *  ^
     * </pre>
     *
     * If the parser is not in error recovery mode, the consumed symbol is added
     * to the parse tree using {@link ParserRuleContext#addChild(Token)}, and
     * {@link ParseTreeListener#visitTerminal} is called on any parse listeners.
     * If the parser <em>is</em> in error recovery mode, the consumed symbol is
     * added to the parse tree using
     * {@link ParserRuleContext#addErrorNode(Token)}, and
     * {@link ParseTreeListener#visitErrorNode} is called on any parse
     * listeners.
     */
    consume() {
        let o = this.currentToken;
        if (o.type != Parser.EOF) {
            this.inputStream.consume();
        }
        let hasListener = this._parseListeners.length !== 0;
        if (this._buildParseTrees || hasListener) {
            if (this._errHandler.inErrorRecoveryMode(this)) {
                let node = this._ctx.addErrorNode(o);
                if (hasListener) {
                    for (let listener of this._parseListeners) {
                        if (listener.visitErrorNode) {
                            listener.visitErrorNode(node);
                        }
                    }
                }
            }
            else {
                let node = this._ctx.addChild(o);
                if (hasListener) {
                    for (let listener of this._parseListeners) {
                        if (listener.visitTerminal) {
                            listener.visitTerminal(node);
                        }
                    }
                }
            }
        }
        return o;
    }
    addContextToParseTree() {
        let parent = this._ctx._parent;
        // add current context to parent if we have a parent
        if (parent != null) {
            parent.addChild(this._ctx);
        }
    }
    /**
     * Always called by generated parsers upon entry to a rule. Access field
     * {@link #_ctx} get the current context.
     */
    enterRule(localctx, state, ruleIndex) {
        this.state = state;
        this._ctx = localctx;
        this._ctx._start = this._input.LT(1);
        if (this._buildParseTrees)
            this.addContextToParseTree();
        this.triggerEnterRuleEvent();
    }
    enterLeftFactoredRule(localctx, state, ruleIndex) {
        this.state = state;
        if (this._buildParseTrees) {
            let factoredContext = this._ctx.getChild(this._ctx.childCount - 1);
            this._ctx.removeLastChild();
            factoredContext._parent = localctx;
            localctx.addChild(factoredContext);
        }
        this._ctx = localctx;
        this._ctx._start = this._input.LT(1);
        if (this._buildParseTrees) {
            this.addContextToParseTree();
        }
        this.triggerEnterRuleEvent();
    }
    exitRule() {
        if (this.matchedEOF) {
            // if we have matched EOF, it cannot consume past EOF so we use LT(1) here
            this._ctx._stop = this._input.LT(1); // LT(1) will be end of file
        }
        else {
            this._ctx._stop = this._input.tryLT(-1); // stop node is what we just matched
        }
        // trigger event on _ctx, before it reverts to parent
        this.triggerExitRuleEvent();
        this.state = this._ctx.invokingState;
        this._ctx = this._ctx._parent;
    }
    enterOuterAlt(localctx, altNum) {
        localctx.altNumber = altNum;
        // if we have new localctx, make sure we replace existing ctx
        // that is previous child of parse tree
        if (this._buildParseTrees && this._ctx !== localctx) {
            let parent = this._ctx._parent;
            if (parent != null) {
                parent.removeLastChild();
                parent.addChild(localctx);
            }
        }
        this._ctx = localctx;
    }
    /**
     * Get the precedence level for the top-most precedence rule.
     *
     * @return The precedence level for the top-most precedence rule, or -1 if
     * the parser context is not nested within a precedence rule.
     */
    get precedence() {
        if (this._precedenceStack.isEmpty) {
            return -1;
        }
        return this._precedenceStack.peek();
    }
    enterRecursionRule(localctx, state, ruleIndex, precedence) {
        this.state = state;
        this._precedenceStack.push(precedence);
        this._ctx = localctx;
        this._ctx._start = this._input.LT(1);
        this.triggerEnterRuleEvent(); // simulates rule entry for left-recursive rules
    }
    /** Like {@link #enterRule} but for recursive rules.
     *  Make the current context the child of the incoming localctx.
     */
    pushNewRecursionContext(localctx, state, ruleIndex) {
        let previous = this._ctx;
        previous._parent = localctx;
        previous.invokingState = state;
        previous._stop = this._input.tryLT(-1);
        this._ctx = localctx;
        this._ctx._start = previous._start;
        if (this._buildParseTrees) {
            this._ctx.addChild(previous);
        }
        this.triggerEnterRuleEvent(); // simulates rule entry for left-recursive rules
    }
    unrollRecursionContexts(_parentctx) {
        this._precedenceStack.pop();
        this._ctx._stop = this._input.tryLT(-1);
        let retctx = this._ctx; // save current ctx (return value)
        // unroll so _ctx is as it was before call to recursive method
        if (this._parseListeners.length > 0) {
            while (this._ctx !== _parentctx) {
                this.triggerExitRuleEvent();
                this._ctx = this._ctx._parent;
            }
        }
        else {
            this._ctx = _parentctx;
        }
        // hook into tree
        retctx._parent = _parentctx;
        if (this._buildParseTrees && _parentctx != null) {
            // add return ctx into invoking rule's tree
            _parentctx.addChild(retctx);
        }
    }
    getInvokingContext(ruleIndex) {
        let p = this._ctx;
        while (p && p.ruleIndex !== ruleIndex) {
            p = p._parent;
        }
        return p;
    }
    get context() {
        return this._ctx;
    }
    set context(ctx) {
        this._ctx = ctx;
    }
    precpred(localctx, precedence) {
        return precedence >= this._precedenceStack.peek();
    }
    getErrorListenerDispatch() {
        return new ProxyParserErrorListener_1.ProxyParserErrorListener(this.getErrorListeners());
    }
    inContext(context) {
        // TODO: useful in parser?
        return false;
    }
    /**
     * Checks whether or not {@code symbol} can follow the current state in the
     * ATN. The behavior of this method is equivalent to the following, but is
     * implemented such that the complete context-sensitive follow set does not
     * need to be explicitly constructed.
     *
     * <pre>
     * return getExpectedTokens().contains(symbol);
     * </pre>
     *
     * @param symbol the symbol type to check
     * @return {@code true} if {@code symbol} can follow the current state in
     * the ATN, otherwise {@code false}.
     */
    isExpectedToken(symbol) {
        //   		return interpreter.atn.nextTokens(_ctx);
        let atn = this.interpreter.atn;
        let ctx = this._ctx;
        let s = atn.states[this.state];
        let following = atn.nextTokens(s);
        if (following.contains(symbol)) {
            return true;
        }
        //        System.out.println("following "+s+"="+following);
        if (!following.contains(Token_1.Token.EPSILON))
            return false;
        while (ctx != null && ctx.invokingState >= 0 && following.contains(Token_1.Token.EPSILON)) {
            let invokingState = atn.states[ctx.invokingState];
            let rt = invokingState.transition(0);
            following = atn.nextTokens(rt.followState);
            if (following.contains(symbol)) {
                return true;
            }
            ctx = ctx._parent;
        }
        if (following.contains(Token_1.Token.EPSILON) && symbol == Token_1.Token.EOF) {
            return true;
        }
        return false;
    }
    get isMatchedEOF() {
        return this.matchedEOF;
    }
    /**
     * Computes the set of input symbols which could follow the current parser
     * state and context, as given by {@link #getState} and {@link #getContext},
     * respectively.
     *
     * @see ATN#getExpectedTokens(int, RuleContext)
     */
    getExpectedTokens() {
        return this.atn.getExpectedTokens(this.state, this.context);
    }
    getExpectedTokensWithinCurrentRule() {
        let atn = this.interpreter.atn;
        let s = atn.states[this.state];
        return atn.nextTokens(s);
    }
    /** Get a rule's index (i.e., {@code RULE_ruleName} field) or -1 if not found. */
    getRuleIndex(ruleName) {
        let ruleIndex = this.getRuleIndexMap().get(ruleName);
        if (ruleIndex != null)
            return ruleIndex;
        return -1;
    }
    get ruleContext() { return this._ctx; }
    /** Return List&lt;String&gt; of the rule names in your parser instance
     *  leading up to a call to the current rule.  You could override if
     *  you want more details such as the file/line info of where
     *  in the ATN a rule is invoked.
     *
     *  This is very useful for error messages.
     */
    getRuleInvocationStack(ctx = this._ctx) {
        let p = ctx; // Workaround for Microsoft/TypeScript#14487
        let ruleNames = this.ruleNames;
        let stack = [];
        while (p != null) {
            // compute what follows who invoked us
            let ruleIndex = p.ruleIndex;
            if (ruleIndex < 0)
                stack.push("n/a");
            else
                stack.push(ruleNames[ruleIndex]);
            p = p._parent;
        }
        return stack;
    }
    /** For debugging and other purposes. */
    getDFAStrings() {
        let s = [];
        for (let d = 0; d < this._interp.atn.decisionToDFA.length; d++) {
            let dfa = this._interp.atn.decisionToDFA[d];
            s.push(dfa.toString(this.vocabulary, this.ruleNames));
        }
        return s;
    }
    /** For debugging and other purposes. */
    dumpDFA() {
        let seenOne = false;
        for (let d = 0; d < this._interp.atn.decisionToDFA.length; d++) {
            let dfa = this._interp.atn.decisionToDFA[d];
            if (!dfa.isEmpty) {
                if (seenOne)
                    console.log();
                console.log("Decision " + dfa.decision + ":");
                process.stdout.write(dfa.toString(this.vocabulary, this.ruleNames));
                seenOne = true;
            }
        }
    }
    get sourceName() {
        return this._input.sourceName;
    }
    get parseInfo() {
        throw new Error("Not implemented");
        // let interp: ParserATNSimulator = this.interpreter;
        // if (interp instanceof ProfilingATNSimulator) {
        // 	return new ParseInfo(interp);
        // }
        // return undefined;
    }
    /**
     * @since 4.3
     */
    setProfile(profile) {
        throw new Error("Not implemented");
        // let interp: ParserATNSimulator = this.interpreter;
        // if ( profile ) {
        // 	if (!(interp instanceof ProfilingATNSimulator)) {
        // 		this.interpreter = new ProfilingATNSimulator(this);
        // 	}
        // }
        // else if (interp instanceof ProfilingATNSimulator) {
        // 	this.interpreter = new ParserATNSimulator(this.atn, this);
        // }
        // this.interpreter.setPredictionMode(interp.getPredictionMode());
    }
    /** During a parse is sometimes useful to listen in on the rule entry and exit
     *  events as well as token matches. This is for quick and dirty debugging.
     */
    set isTrace(trace) {
        if (!trace) {
            if (this._tracer) {
                this.removeParseListener(this._tracer);
                this._tracer = undefined;
            }
        }
        else {
            if (this._tracer) {
                this.removeParseListener(this._tracer);
            }
            else {
                this._tracer = new TraceListener(this.ruleNames, this._input);
            }
            this.addParseListener(this._tracer);
        }
    }
    /**
     * Gets whether a {@link TraceListener} is registered as a parse listener
     * for the parser.
     */
    get isTrace() {
        return this._tracer != null;
    }
}
/**
 * This field maps from the serialized ATN string to the deserialized {@link ATN} with
 * bypass alternatives.
 *
 * @see ATNDeserializationOptions.isGenerateRuleBypassTransitions
 */
Parser.bypassAltsAtnCache = new Map();
__decorate([
    Decorators_1.NotNull
], Parser.prototype, "_errHandler", void 0);
__decorate([
    Decorators_1.NotNull
], Parser.prototype, "match", null);
__decorate([
    Decorators_1.NotNull
], Parser.prototype, "matchWildcard", null);
__decorate([
    Decorators_1.NotNull
], Parser.prototype, "getParseListeners", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], Parser.prototype, "addParseListener", null);
__decorate([
    Decorators_1.NotNull
], Parser.prototype, "getATNWithBypassAlts", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], Parser.prototype, "errorHandler", null);
__decorate([
    Decorators_1.Override
], Parser.prototype, "inputStream", null);
__decorate([
    Decorators_1.NotNull
], Parser.prototype, "currentToken", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], Parser.prototype, "enterRule", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.Nullable)
], Parser.prototype, "precpred", null);
__decorate([
    Decorators_1.Override
], Parser.prototype, "getErrorListenerDispatch", null);
__decorate([
    Decorators_1.NotNull
], Parser.prototype, "getExpectedTokens", null);
__decorate([
    Decorators_1.NotNull
], Parser.prototype, "getExpectedTokensWithinCurrentRule", null);
__decorate([
    Decorators_1.Override
], Parser.prototype, "parseInfo", null);
exports.Parser = Parser;

}).call(this,require('_process'))

},{"./Decorators":16,"./DefaultErrorStrategy":17,"./Lexer":24,"./ProxyParserErrorListener":33,"./Recognizer":35,"./Token":40,"./atn/ATNDeserializationOptions":46,"./atn/ATNDeserializer":47,"./misc/IntegerStack":110,"./misc/Utils":118,"_process":128}],30:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const ATNState_1 = require("./atn/ATNState");
const BitSet_1 = require("./misc/BitSet");
const FailedPredicateException_1 = require("./FailedPredicateException");
const InputMismatchException_1 = require("./InputMismatchException");
const InterpreterRuleContext_1 = require("./InterpreterRuleContext");
const LoopEndState_1 = require("./atn/LoopEndState");
const Decorators_1 = require("./Decorators");
const Decorators_2 = require("./Decorators");
const Parser_1 = require("./Parser");
const ParserATNSimulator_1 = require("./atn/ParserATNSimulator");
const RecognitionException_1 = require("./RecognitionException");
const StarLoopEntryState_1 = require("./atn/StarLoopEntryState");
const Token_1 = require("./Token");
/** A parser simulator that mimics what ANTLR's generated
 *  parser code does. A ParserATNSimulator is used to make
 *  predictions via adaptivePredict but this class moves a pointer through the
 *  ATN to simulate parsing. ParserATNSimulator just
 *  makes us efficient rather than having to backtrack, for example.
 *
 *  This properly creates parse trees even for left recursive rules.
 *
 *  We rely on the left recursive rule invocation and special predicate
 *  transitions to make left recursive rules work.
 *
 *  See TestParserInterpreter for examples.
 */
let ParserInterpreter = class ParserInterpreter extends Parser_1.Parser {
    constructor(grammarFileName, vocabulary, ruleNames, atn, input) {
        super(grammarFileName instanceof ParserInterpreter ? grammarFileName.inputStream : input);
        /** This stack corresponds to the _parentctx, _parentState pair of locals
         *  that would exist on call stack frames with a recursive descent parser;
         *  in the generated function for a left-recursive rule you'd see:
         *
         *  private EContext e(int _p) {
         *      ParserRuleContext _parentctx = _ctx;    // Pair.a
         *      int _parentState = state;          // Pair.b
         *      ...
         *  }
         *
         *  Those values are used to create new recursive rule invocation contexts
         *  associated with left operand of an alt like "expr '*' expr".
         */
        this._parentContextStack = [];
        /** We need a map from (decision,inputIndex)->forced alt for computing ambiguous
         *  parse trees. For now, we allow exactly one override.
         */
        this.overrideDecision = -1;
        this.overrideDecisionInputIndex = -1;
        this.overrideDecisionAlt = -1;
        this.overrideDecisionReached = false; // latch and only override once; error might trigger infinite loop
        /** What is the current context when we override a decisions?  This tells
         *  us what the root of the parse tree is when using override
         *  for an ambiguity/lookahead check.
         */
        this._overrideDecisionRoot = undefined;
        if (grammarFileName instanceof ParserInterpreter) {
            let old = grammarFileName;
            this._grammarFileName = old._grammarFileName;
            this._atn = old._atn;
            this.pushRecursionContextStates = old.pushRecursionContextStates;
            this._ruleNames = old._ruleNames;
            this._vocabulary = old._vocabulary;
            this.interpreter = new ParserATNSimulator_1.ParserATNSimulator(this._atn, this);
        }
        else {
            // The second constructor requires non-null arguments
            vocabulary = vocabulary;
            ruleNames = ruleNames;
            atn = atn;
            this._grammarFileName = grammarFileName;
            this._atn = atn;
            this._ruleNames = ruleNames.slice(0);
            this._vocabulary = vocabulary;
            // identify the ATN states where pushNewRecursionContext() must be called
            this.pushRecursionContextStates = new BitSet_1.BitSet(atn.states.length);
            for (let state of atn.states) {
                if (!(state instanceof StarLoopEntryState_1.StarLoopEntryState)) {
                    continue;
                }
                if (state.precedenceRuleDecision) {
                    this.pushRecursionContextStates.set(state.stateNumber);
                }
            }
            // get atn simulator that knows how to do predictions
            this.interpreter = new ParserATNSimulator_1.ParserATNSimulator(atn, this);
        }
    }
    reset(resetInput) {
        if (resetInput === undefined) {
            super.reset();
        }
        else {
            super.reset(resetInput);
        }
        this.overrideDecisionReached = false;
        this._overrideDecisionRoot = undefined;
    }
    get atn() {
        return this._atn;
    }
    get vocabulary() {
        return this._vocabulary;
    }
    get ruleNames() {
        return this._ruleNames;
    }
    get grammarFileName() {
        return this._grammarFileName;
    }
    /** Begin parsing at startRuleIndex */
    parse(startRuleIndex) {
        let startRuleStartState = this._atn.ruleToStartState[startRuleIndex];
        this._rootContext = this.createInterpreterRuleContext(undefined, ATNState_1.ATNState.INVALID_STATE_NUMBER, startRuleIndex);
        if (startRuleStartState.isPrecedenceRule) {
            this.enterRecursionRule(this._rootContext, startRuleStartState.stateNumber, startRuleIndex, 0);
        }
        else {
            this.enterRule(this._rootContext, startRuleStartState.stateNumber, startRuleIndex);
        }
        while (true) {
            let p = this.atnState;
            switch (p.stateType) {
                case 7 /* RULE_STOP */:
                    // pop; return from rule
                    if (this._ctx.isEmpty) {
                        if (startRuleStartState.isPrecedenceRule) {
                            let result = this._ctx;
                            let parentContext = this._parentContextStack.pop();
                            this.unrollRecursionContexts(parentContext[0]);
                            return result;
                        }
                        else {
                            this.exitRule();
                            return this._rootContext;
                        }
                    }
                    this.visitRuleStopState(p);
                    break;
                default:
                    try {
                        this.visitState(p);
                    }
                    catch (e) {
                        if (e instanceof RecognitionException_1.RecognitionException) {
                            this.state = this._atn.ruleToStopState[p.ruleIndex].stateNumber;
                            this.context.exception = e;
                            this.errorHandler.reportError(this, e);
                            this.recover(e);
                        }
                        else {
                            throw e;
                        }
                    }
                    break;
            }
        }
    }
    enterRecursionRule(localctx, state, ruleIndex, precedence) {
        this._parentContextStack.push([this._ctx, localctx.invokingState]);
        super.enterRecursionRule(localctx, state, ruleIndex, precedence);
    }
    get atnState() {
        return this._atn.states[this.state];
    }
    visitState(p) {
        let predictedAlt = 1;
        if (p.numberOfTransitions > 1) {
            predictedAlt = this.visitDecisionState(p);
        }
        let transition = p.transition(predictedAlt - 1);
        switch (transition.serializationType) {
            case 1 /* EPSILON */:
                if (this.pushRecursionContextStates.get(p.stateNumber) &&
                    !(transition.target instanceof LoopEndState_1.LoopEndState)) {
                    // We are at the start of a left recursive rule's (...)* loop
                    // and we're not taking the exit branch of loop.
                    let parentContext = this._parentContextStack[this._parentContextStack.length - 1];
                    let localctx = this.createInterpreterRuleContext(parentContext[0], parentContext[1], this._ctx.ruleIndex);
                    this.pushNewRecursionContext(localctx, this._atn.ruleToStartState[p.ruleIndex].stateNumber, this._ctx.ruleIndex);
                }
                break;
            case 5 /* ATOM */:
                this.match(transition._label);
                break;
            case 2 /* RANGE */:
            case 7 /* SET */:
            case 8 /* NOT_SET */:
                if (!transition.matches(this._input.LA(1), Token_1.Token.MIN_USER_TOKEN_TYPE, 65535)) {
                    this.recoverInline();
                }
                this.matchWildcard();
                break;
            case 9 /* WILDCARD */:
                this.matchWildcard();
                break;
            case 3 /* RULE */:
                let ruleStartState = transition.target;
                let ruleIndex = ruleStartState.ruleIndex;
                let newctx = this.createInterpreterRuleContext(this._ctx, p.stateNumber, ruleIndex);
                if (ruleStartState.isPrecedenceRule) {
                    this.enterRecursionRule(newctx, ruleStartState.stateNumber, ruleIndex, transition.precedence);
                }
                else {
                    this.enterRule(newctx, transition.target.stateNumber, ruleIndex);
                }
                break;
            case 4 /* PREDICATE */:
                let predicateTransition = transition;
                if (!this.sempred(this._ctx, predicateTransition.ruleIndex, predicateTransition.predIndex)) {
                    throw new FailedPredicateException_1.FailedPredicateException(this);
                }
                break;
            case 6 /* ACTION */:
                let actionTransition = transition;
                this.action(this._ctx, actionTransition.ruleIndex, actionTransition.actionIndex);
                break;
            case 10 /* PRECEDENCE */:
                if (!this.precpred(this._ctx, transition.precedence)) {
                    let precedence = transition.precedence;
                    throw new FailedPredicateException_1.FailedPredicateException(this, `precpred(_ctx, ${precedence})`);
                }
                break;
            default:
                throw new Error("UnsupportedOperationException: Unrecognized ATN transition type.");
        }
        this.state = transition.target.stateNumber;
    }
    /** Method visitDecisionState() is called when the interpreter reaches
     *  a decision state (instance of DecisionState). It gives an opportunity
     *  for subclasses to track interesting things.
     */
    visitDecisionState(p) {
        let edge = 1;
        let predictedAlt;
        this.errorHandler.sync(this);
        let decision = p.decision;
        if (decision === this.overrideDecision && this._input.index === this.overrideDecisionInputIndex && !this.overrideDecisionReached) {
            predictedAlt = this.overrideDecisionAlt;
            this.overrideDecisionReached = true;
        }
        else {
            predictedAlt = this.interpreter.adaptivePredict(this._input, decision, this._ctx);
        }
        return predictedAlt;
    }
    /** Provide simple "factory" for InterpreterRuleContext's.
     *  @since 4.5.1
     */
    createInterpreterRuleContext(parent, invokingStateNumber, ruleIndex) {
        return new InterpreterRuleContext_1.InterpreterRuleContext(ruleIndex, parent, invokingStateNumber);
    }
    visitRuleStopState(p) {
        let ruleStartState = this._atn.ruleToStartState[p.ruleIndex];
        if (ruleStartState.isPrecedenceRule) {
            let parentContext = this._parentContextStack.pop();
            this.unrollRecursionContexts(parentContext[0]);
            this.state = parentContext[1];
        }
        else {
            this.exitRule();
        }
        let ruleTransition = this._atn.states[this.state].transition(0);
        this.state = ruleTransition.followState.stateNumber;
    }
    /** Override this parser interpreters normal decision-making process
     *  at a particular decision and input token index. Instead of
     *  allowing the adaptive prediction mechanism to choose the
     *  first alternative within a block that leads to a successful parse,
     *  force it to take the alternative, 1..n for n alternatives.
     *
     *  As an implementation limitation right now, you can only specify one
     *  override. This is sufficient to allow construction of different
     *  parse trees for ambiguous input. It means re-parsing the entire input
     *  in general because you're never sure where an ambiguous sequence would
     *  live in the various parse trees. For example, in one interpretation,
     *  an ambiguous input sequence would be matched completely in expression
     *  but in another it could match all the way back to the root.
     *
     *  s : e '!'? ;
     *  e : ID
     *    | ID '!'
     *    ;
     *
     *  Here, x! can be matched as (s (e ID) !) or (s (e ID !)). In the first
     *  case, the ambiguous sequence is fully contained only by the root.
     *  In the second case, the ambiguous sequences fully contained within just
     *  e, as in: (e ID !).
     *
     *  Rather than trying to optimize this and make
     *  some intelligent decisions for optimization purposes, I settled on
     *  just re-parsing the whole input and then using
     *  {link Trees#getRootOfSubtreeEnclosingRegion} to find the minimal
     *  subtree that contains the ambiguous sequence. I originally tried to
     *  record the call stack at the point the parser detected and ambiguity but
     *  left recursive rules create a parse tree stack that does not reflect
     *  the actual call stack. That impedance mismatch was enough to make
     *  it it challenging to restart the parser at a deeply nested rule
     *  invocation.
     *
     *  Only parser interpreters can override decisions so as to avoid inserting
     *  override checking code in the critical ALL(*) prediction execution path.
     *
     *  @since 4.5
     */
    addDecisionOverride(decision, tokenIndex, forcedAlt) {
        this.overrideDecision = decision;
        this.overrideDecisionInputIndex = tokenIndex;
        this.overrideDecisionAlt = forcedAlt;
    }
    get overrideDecisionRoot() {
        return this._overrideDecisionRoot;
    }
    /** Rely on the error handler for this parser but, if no tokens are consumed
     *  to recover, add an error node. Otherwise, nothing is seen in the parse
     *  tree.
     */
    recover(e) {
        let i = this._input.index;
        this.errorHandler.recover(this, e);
        if (this._input.index === i) {
            // no input consumed, better add an error node
            let tok = e.getOffendingToken();
            if (!tok) {
                throw new Error("Expected exception to have an offending token");
            }
            let source = tok.tokenSource;
            let stream = source !== undefined ? source.inputStream : undefined;
            let sourcePair = { source: source, stream: stream };
            if (e instanceof InputMismatchException_1.InputMismatchException) {
                let expectedTokens = e.expectedTokens;
                if (expectedTokens === undefined) {
                    throw new Error("Expected the exception to provide expected tokens");
                }
                let expectedTokenType = expectedTokens.minElement; // get any element
                let errToken = this.tokenFactory.create(sourcePair, expectedTokenType, tok.text, Token_1.Token.DEFAULT_CHANNEL, -1, -1, // invalid start/stop
                tok.line, tok.charPositionInLine);
                this._ctx.addErrorNode(errToken);
            }
            else {
                let source = tok.tokenSource;
                let errToken = this.tokenFactory.create(sourcePair, Token_1.Token.INVALID_TYPE, tok.text, Token_1.Token.DEFAULT_CHANNEL, -1, -1, // invalid start/stop
                tok.line, tok.charPositionInLine);
                this._ctx.addErrorNode(errToken);
            }
        }
    }
    recoverInline() {
        return this._errHandler.recoverInline(this);
    }
    /** Return the root of the parse, which can be useful if the parser
     *  bails out. You still can access the top node. Note that,
     *  because of the way left recursive rules add children, it's possible
     *  that the root will not have any children if the start rule immediately
     *  called and left recursive rule that fails.
     *
     * @since 4.5.1
     */
    get rootContext() {
        return this._rootContext;
    }
};
__decorate([
    Decorators_1.NotNull
], ParserInterpreter.prototype, "_vocabulary", void 0);
__decorate([
    Decorators_2.Override
], ParserInterpreter.prototype, "reset", null);
__decorate([
    Decorators_2.Override
], ParserInterpreter.prototype, "atn", null);
__decorate([
    Decorators_2.Override
], ParserInterpreter.prototype, "vocabulary", null);
__decorate([
    Decorators_2.Override
], ParserInterpreter.prototype, "ruleNames", null);
__decorate([
    Decorators_2.Override
], ParserInterpreter.prototype, "grammarFileName", null);
__decorate([
    Decorators_2.Override
], ParserInterpreter.prototype, "enterRecursionRule", null);
ParserInterpreter = __decorate([
    __param(1, Decorators_1.NotNull)
], ParserInterpreter);
exports.ParserInterpreter = ParserInterpreter;

},{"./Decorators":16,"./FailedPredicateException":20,"./InputMismatchException":21,"./InterpreterRuleContext":23,"./Parser":29,"./RecognitionException":34,"./Token":40,"./atn/ATNState":49,"./atn/LoopEndState":73,"./atn/ParserATNSimulator":76,"./atn/StarLoopEntryState":92,"./misc/BitSet":107}],31:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:56.6285494-07:00
const ErrorNode_1 = require("./tree/ErrorNode");
const Interval_1 = require("./misc/Interval");
const Decorators_1 = require("./Decorators");
const RuleContext_1 = require("./RuleContext");
const TerminalNode_1 = require("./tree/TerminalNode");
/** A rule invocation record for parsing.
 *
 *  Contains all of the information about the current rule not stored in the
 *  RuleContext. It handles parse tree children list, Any ATN state
 *  tracing, and the default values available for rule invocations:
 *  start, stop, rule index, current alt number.
 *
 *  Subclasses made for each rule and grammar track the parameters,
 *  return values, locals, and labels specific to that rule. These
 *  are the objects that are returned from rules.
 *
 *  Note text is not an actual field of a rule return value; it is computed
 *  from start and stop using the input stream's toString() method.  I
 *  could add a ctor to this so that we can pass in and store the input
 *  stream, but I'm not sure we want to do that.  It would seem to be undefined
 *  to get the .text property anyway if the rule matches tokens from multiple
 *  input streams.
 *
 *  I do not use getters for fields of objects that are used simply to
 *  group values such as this aggregate.  The getters/setters are there to
 *  satisfy the superclass interface.
 */
class ParserRuleContext extends RuleContext_1.RuleContext {
    constructor(parent, invokingStateNumber) {
        if (invokingStateNumber == null) {
            super();
        }
        else {
            super(parent, invokingStateNumber);
        }
    }
    static emptyContext() {
        return ParserRuleContext.EMPTY;
    }
    /**
     * COPY a ctx (I'm deliberately not using copy constructor) to avoid
     * confusion with creating node with parent. Does not copy children.
     *
     * This is used in the generated parser code to flip a generic XContext
     * node for rule X to a YContext for alt label Y. In that sense, it is not
     * really a generic copy function.
     *
     * If we do an error sync() at start of a rule, we might add error nodes
     * to the generic XContext so this function must copy those nodes to the
     * YContext as well else they are lost!
     */
    copyFrom(ctx) {
        this._parent = ctx._parent;
        this.invokingState = ctx.invokingState;
        this._start = ctx._start;
        this._stop = ctx._stop;
        // copy any error nodes to alt label node
        if (ctx.children) {
            this.children = [];
            // reset parent pointer for any error nodes
            for (let child of ctx.children) {
                if (child instanceof ErrorNode_1.ErrorNode) {
                    this.children.push(child);
                    child._parent = this;
                }
            }
        }
    }
    // Double dispatch methods for listeners
    enterRule(listener) { }
    exitRule(listener) { }
    addChild(t) {
        let result;
        if (t instanceof TerminalNode_1.TerminalNode) {
            // Does not set parent link
        }
        else if (t instanceof RuleContext_1.RuleContext) {
            // Does not set parent link
        }
        else {
            t = new TerminalNode_1.TerminalNode(t);
            t._parent = this;
            result = t;
        }
        if (!this.children) {
            this.children = [t];
        }
        else {
            this.children.push(t);
        }
        return result;
    }
    /** Used by enterOuterAlt to toss out a RuleContext previously added as
     *  we entered a rule. If we have # label, we will need to remove
     *  generic ruleContext object.
     */
    removeLastChild() {
        if (this.children) {
            this.children.pop();
        }
    }
    //	public void trace(int s) {
    //		if ( states==null ) states = new ArrayList<Integer>();
    //		states.add(s);
    //	}
    addErrorNode(badToken) {
        let t = new ErrorNode_1.ErrorNode(badToken);
        this.addChild(t);
        t._parent = this;
        return t;
    }
    get parent() {
        let parent = super.parent;
        if (parent === undefined || parent instanceof ParserRuleContext) {
            return parent;
        }
        throw new TypeError("Invalid parent type for ParserRuleContext");
    }
    // Note: in TypeScript, order or arguments reversed
    getChild(i, ctxType) {
        if (!this.children || i < 0 || i >= this.children.length) {
            throw new RangeError("index parameter must be between >= 0 and <= number of children.");
        }
        if (ctxType == null) {
            return this.children[i];
        }
        let result = this.tryGetChild(i, ctxType);
        if (result === undefined) {
            throw new Error("The specified node does not exist");
        }
        return result;
    }
    tryGetChild(i, ctxType) {
        if (!this.children || i < 0 || i >= this.children.length) {
            return undefined;
        }
        let j = -1; // what node with ctxType have we found?
        for (let o of this.children) {
            if (o instanceof ctxType) {
                j++;
                if (j === i) {
                    return o;
                }
            }
        }
        return undefined;
    }
    getToken(ttype, i) {
        let result = this.tryGetToken(ttype, i);
        if (result === undefined) {
            throw new Error("The specified token does not exist");
        }
        return result;
    }
    tryGetToken(ttype, i) {
        if (!this.children || i < 0 || i >= this.children.length) {
            return undefined;
        }
        let j = -1; // what token with ttype have we found?
        for (let o of this.children) {
            if (o instanceof TerminalNode_1.TerminalNode) {
                let symbol = o.symbol;
                if (symbol.type === ttype) {
                    j++;
                    if (j === i) {
                        return o;
                    }
                }
            }
        }
        return undefined;
    }
    getTokens(ttype) {
        let tokens = [];
        if (!this.children) {
            return tokens;
        }
        for (let o of this.children) {
            if (o instanceof TerminalNode_1.TerminalNode) {
                let symbol = o.symbol;
                if (symbol.type === ttype) {
                    tokens.push(o);
                }
            }
        }
        return tokens;
    }
    get ruleContext() {
        return this;
    }
    // NOTE: argument order change from Java version
    getRuleContext(i, ctxType) {
        return this.getChild(i, ctxType);
    }
    tryGetRuleContext(i, ctxType) {
        return this.tryGetChild(i, ctxType);
    }
    getRuleContexts(ctxType) {
        let contexts = [];
        if (!this.children) {
            return contexts;
        }
        for (let o of this.children) {
            if (o instanceof ctxType) {
                contexts.push(o);
            }
        }
        return contexts;
    }
    get childCount() {
        return this.children ? this.children.length : 0;
    }
    get sourceInterval() {
        if (!this._start) {
            return Interval_1.Interval.INVALID;
        }
        if (!this._stop || this._stop.tokenIndex < this._start.tokenIndex) {
            return Interval_1.Interval.of(this._start.tokenIndex, this._start.tokenIndex - 1); // empty
        }
        return Interval_1.Interval.of(this._start.tokenIndex, this._stop.tokenIndex);
    }
    /**
     * Get the initial token in this context.
     * Note that the range from start to stop is inclusive, so for rules that do not consume anything
     * (for example, zero length or error productions) this token may exceed stop.
     */
    get start() { return this._start; }
    /**
     * Get the final token in this context.
     * Note that the range from start to stop is inclusive, so for rules that do not consume anything
     * (for example, zero length or error productions) this token may precede start.
     */
    get stop() { return this._stop; }
    /** Used for rule context info debugging during parse-time, not so much for ATN debugging */
    toInfoString(recognizer) {
        let rules = recognizer.getRuleInvocationStack(this).reverse();
        return "ParserRuleContext" + rules + "{" +
            "start=" + this._start +
            ", stop=" + this._stop +
            '}';
    }
}
ParserRuleContext.EMPTY = new ParserRuleContext();
__decorate([
    Decorators_1.Override
    /** Override to make type more specific */
], ParserRuleContext.prototype, "parent", null);
__decorate([
    Decorators_1.Override
], ParserRuleContext.prototype, "childCount", null);
__decorate([
    Decorators_1.Override
], ParserRuleContext.prototype, "sourceInterval", null);
exports.ParserRuleContext = ParserRuleContext;

},{"./Decorators":16,"./RuleContext":36,"./misc/Interval":111,"./tree/ErrorNode":120,"./tree/TerminalNode":124}],32:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("./Decorators");
/**
 * This implementation of {@link ANTLRErrorListener} dispatches all calls to a
 * collection of delegate listeners. This reduces the effort required to support multiple
 * listeners.
 *
 * @author Sam Harwell
 */
class ProxyErrorListener {
    constructor(delegates) {
        this.delegates = delegates;
        if (!delegates) {
            throw new Error("Invalid delegates");
        }
    }
    getDelegates() {
        return this.delegates;
    }
    syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, e) {
        this.delegates.forEach(listener => {
            if (listener.syntaxError) {
                listener.syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, e);
            }
        });
    }
}
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull),
    __param(4, Decorators_1.NotNull)
], ProxyErrorListener.prototype, "syntaxError", null);
exports.ProxyErrorListener = ProxyErrorListener;

},{"./Decorators":16}],33:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProxyErrorListener_1 = require("./ProxyErrorListener");
const Decorators_1 = require("./Decorators");
/**
 * @author Sam Harwell
 */
class ProxyParserErrorListener extends ProxyErrorListener_1.ProxyErrorListener {
    constructor(delegates) {
        super(delegates);
    }
    reportAmbiguity(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
        this.getDelegates()
            .forEach(listener => {
            if (listener.reportAmbiguity) {
                listener.reportAmbiguity(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs);
            }
        });
    }
    reportAttemptingFullContext(recognizer, dfa, startIndex, stopIndex, conflictingAlts, conflictState) {
        this.getDelegates()
            .forEach(listener => {
            if (listener.reportAttemptingFullContext) {
                listener.reportAttemptingFullContext(recognizer, dfa, startIndex, stopIndex, conflictingAlts, conflictState);
            }
        });
    }
    reportContextSensitivity(recognizer, dfa, startIndex, stopIndex, prediction, acceptState) {
        this.getDelegates()
            .forEach(listener => {
            if (listener.reportContextSensitivity) {
                listener.reportContextSensitivity(recognizer, dfa, startIndex, stopIndex, prediction, acceptState);
            }
        });
    }
}
__decorate([
    Decorators_1.Override
], ProxyParserErrorListener.prototype, "reportAmbiguity", null);
__decorate([
    Decorators_1.Override
], ProxyParserErrorListener.prototype, "reportAttemptingFullContext", null);
__decorate([
    Decorators_1.Override
], ProxyParserErrorListener.prototype, "reportContextSensitivity", null);
exports.ProxyParserErrorListener = ProxyParserErrorListener;

},{"./Decorators":16,"./ProxyErrorListener":32}],34:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** The root of the ANTLR exception hierarchy. In general, ANTLR tracks just
 *  3 kinds of errors: prediction errors, failed predicate errors, and
 *  mismatched input errors. In each case, the parser knows where it is
 *  in the input, where it is in the ATN, the rule invocation stack,
 *  and what kind of problem occurred.
 */
class RecognitionException extends Error {
    constructor(recognizer, input, ctx, message) {
        super(message);
        this._offendingState = -1;
        this._recognizer = recognizer;
        this.input = input;
        this.ctx = ctx;
        if (recognizer)
            this._offendingState = recognizer.state;
    }
    /**
     * Get the ATN state number the parser was in at the time the error
     * occurred. For {@link NoViableAltException} and
     * {@link LexerNoViableAltException} exceptions, this is the
     * {@link DecisionState} number. For others, it is the state whose outgoing
     * edge we couldn't match.
     *
     * <p>If the state number is not known, this method returns -1.</p>
     */
    get offendingState() {
        return this._offendingState;
    }
    setOffendingState(offendingState) {
        this._offendingState = offendingState;
    }
    /**
     * Gets the set of input symbols which could potentially follow the
     * previously matched symbol at the time this exception was thrown.
     *
     * <p>If the set of expected tokens is not known and could not be computed,
     * this method returns {@code null}.</p>
     *
     * @return The set of token types that could potentially follow the current
     * state in the ATN, or {@code null} if the information is not available.
     */
    get expectedTokens() {
        if (this._recognizer) {
            return this._recognizer.atn.getExpectedTokens(this._offendingState, this.ctx);
        }
        return undefined;
    }
    /**
     * Gets the {@link RuleContext} at the time this exception was thrown.
     *
     * <p>If the context is not available, this method returns {@code null}.</p>
     *
     * @return The {@link RuleContext} at the time this exception was thrown.
     * If the context is not available, this method returns {@code null}.
     */
    get context() {
        return this.ctx;
    }
    /**
     * Gets the input stream which is the symbol source for the recognizer where
     * this exception was thrown.
     *
     * <p>If the input stream is not available, this method returns {@code null}.</p>
     *
     * @return The input stream which is the symbol source for the recognizer
     * where this exception was thrown, or {@code null} if the stream is not
     * available.
     */
    get inputStream() {
        return this.input;
    }
    getOffendingToken(recognizer) {
        if (recognizer && recognizer !== this._recognizer)
            return undefined;
        return this.offendingToken;
    }
    setOffendingToken(recognizer, offendingToken) {
        if (recognizer === this._recognizer) {
            this.offendingToken = offendingToken;
        }
    }
    /**
     * Gets the {@link Recognizer} where this exception occurred.
     *
     * <p>If the recognizer is not available, this method returns {@code null}.</p>
     *
     * @return The recognizer where this exception occurred, or {@code null} if
     * the recognizer is not available.
     */
    get recognizer() {
        return this._recognizer;
    }
}
exports.RecognitionException = RecognitionException;

},{}],35:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConsoleErrorListener_1 = require("./ConsoleErrorListener");
const ProxyErrorListener_1 = require("./ProxyErrorListener");
const Decorators_1 = require("./Decorators");
const Token_1 = require("./Token");
const Utils = require("./misc/Utils");
class Recognizer {
    constructor() {
        this._listeners = [ConsoleErrorListener_1.ConsoleErrorListener.INSTANCE];
        this._stateNumber = -1;
    }
    /**
     * Get a map from token names to token types.
     *
     * <p>Used for XPath and tree pattern compilation.</p>
     */
    getTokenTypeMap() {
        let vocabulary = this.vocabulary;
        let result = Recognizer.tokenTypeMapCache.get(vocabulary);
        if (result == null) {
            let intermediateResult = new Map();
            for (let i = 0; i <= this.atn.maxTokenType; i++) {
                let literalName = vocabulary.getLiteralName(i);
                if (literalName != null) {
                    intermediateResult.set(literalName, i);
                }
                let symbolicName = vocabulary.getSymbolicName(i);
                if (symbolicName != null) {
                    intermediateResult.set(symbolicName, i);
                }
            }
            intermediateResult.set("EOF", Token_1.Token.EOF);
            result = Object.freeze(intermediateResult);
            Recognizer.tokenTypeMapCache.set(vocabulary, result);
        }
        return result;
    }
    /**
     * Get a map from rule names to rule indexes.
     *
     * <p>Used for XPath and tree pattern compilation.</p>
     */
    getRuleIndexMap() {
        let ruleNames = this.ruleNames;
        if (ruleNames == null) {
            throw new Error("The current recognizer does not provide a list of rule names.");
        }
        let result = Recognizer.ruleIndexMapCache.get(ruleNames);
        if (result == null) {
            result = Object.freeze(Utils.toMap(ruleNames));
            Recognizer.ruleIndexMapCache.set(ruleNames, result);
        }
        return result;
    }
    getTokenType(tokenName) {
        let ttype = this.getTokenTypeMap().get(tokenName);
        if (ttype != null)
            return ttype;
        return Token_1.Token.INVALID_TYPE;
    }
    /**
     * If this recognizer was generated, it will have a serialized ATN
     * representation of the grammar.
     *
     * <p>For interpreters, we don't know their serialized ATN despite having
     * created the interpreter from it.</p>
     */
    get serializedATN() {
        throw new Error("there is no serialized ATN");
    }
    /**
     * Get the {@link ATN} used by the recognizer for prediction.
     *
     * @return The {@link ATN} used by the recognizer for prediction.
     */
    get atn() {
        return this._interp.atn;
    }
    /**
     * Get the ATN interpreter used by the recognizer for prediction.
     *
     * @return The ATN interpreter used by the recognizer for prediction.
     */
    get interpreter() {
        return this._interp;
    }
    /** If profiling during the parse/lex, this will return DecisionInfo records
     *  for each decision in recognizer in a ParseInfo object.
     *
     * @since 4.3
     */
    get parseInfo() {
        return undefined;
    }
    /**
     * Set the ATN interpreter used by the recognizer for prediction.
     *
     * @param interpreter The ATN interpreter used by the recognizer for
     * prediction.
     */
    set interpreter(interpreter) {
        this._interp = interpreter;
    }
    /** What is the error header, normally line/character position information? */
    getErrorHeader(e) {
        let token = e.getOffendingToken();
        if (!token)
            return "";
        let line = token.line;
        let charPositionInLine = token.charPositionInLine;
        return "line " + line + ":" + charPositionInLine;
    }
    /**
     * @exception NullPointerException if {@code listener} is {@code null}.
     */
    addErrorListener(listener) {
        if (!listener)
            throw new TypeError("listener must not be null");
        this._listeners.push(listener);
    }
    removeErrorListener(listener) {
        let position = this._listeners.indexOf(listener);
        if (position !== -1) {
            this._listeners.splice(position, 1);
        }
    }
    removeErrorListeners() {
        this._listeners.length = 0;
    }
    getErrorListeners() {
        return this._listeners.slice(0);
    }
    getErrorListenerDispatch() {
        return new ProxyErrorListener_1.ProxyErrorListener(this.getErrorListeners());
    }
    // subclass needs to override these if there are sempreds or actions
    // that the ATN interp needs to execute
    sempred(_localctx, ruleIndex, actionIndex) {
        return true;
    }
    precpred(localctx, precedence) {
        return true;
    }
    action(_localctx, ruleIndex, actionIndex) {
    }
    get state() {
        return this._stateNumber;
    }
    /** Indicate that the recognizer has changed internal state that is
     *  consistent with the ATN state passed in.  This way we always know
     *  where we are in the ATN as the parser goes along. The rule
     *  context objects form a stack that lets us see the stack of
     *  invoking rules. Combine this and we have complete ATN
     *  configuration information.
     */
    set state(atnState) {
        //		System.err.println("setState "+atnState);
        this._stateNumber = atnState;
        //		if ( traceATNStates ) _ctx.trace(atnState);
    }
}
Recognizer.EOF = -1;
Recognizer.tokenTypeMapCache = new WeakMap();
Recognizer.ruleIndexMapCache = new WeakMap();
__decorate([
    Decorators_1.SuppressWarnings("serial"),
    Decorators_1.NotNull
], Recognizer.prototype, "_listeners", void 0);
__decorate([
    Decorators_1.NotNull
], Recognizer.prototype, "getTokenTypeMap", null);
__decorate([
    Decorators_1.NotNull
], Recognizer.prototype, "getRuleIndexMap", null);
__decorate([
    Decorators_1.NotNull
], Recognizer.prototype, "serializedATN", null);
__decorate([
    Decorators_1.NotNull
], Recognizer.prototype, "atn", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], Recognizer.prototype, "interpreter", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], Recognizer.prototype, "getErrorHeader", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], Recognizer.prototype, "addErrorListener", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], Recognizer.prototype, "removeErrorListener", null);
__decorate([
    Decorators_1.NotNull
], Recognizer.prototype, "getErrorListeners", null);
exports.Recognizer = Recognizer;

},{"./ConsoleErrorListener":15,"./Decorators":16,"./ProxyErrorListener":32,"./Token":40,"./misc/Utils":118}],36:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:57.3490837-07:00
/** A rule context is a record of a single rule invocation.
 *
 *  We form a stack of these context objects using the parent
 *  pointer. A parent pointer of null indicates that the current
 *  context is the bottom of the stack. The ParserRuleContext subclass
 *  as a children list so that we can turn this data structure into a
 *  tree.
 *
 *  The root node always has a null pointer and invokingState of -1.
 *
 *  Upon entry to parsing, the first invoked rule function creates a
 *  context object (a subclass specialized for that rule such as
 *  SContext) and makes it the root of a parse tree, recorded by field
 *  Parser._ctx.
 *
 *  public final SContext s() throws RecognitionException {
 *      SContext _localctx = new SContext(_ctx, state); <-- create new node
 *      enterRule(_localctx, 0, RULE_s);                     <-- push it
 *      ...
 *      exitRule();                                          <-- pop back to _localctx
 *      return _localctx;
 *  }
 *
 *  A subsequent rule invocation of r from the start rule s pushes a
 *  new context object for r whose parent points at s and use invoking
 *  state is the state with r emanating as edge label.
 *
 *  The invokingState fields from a context object to the root
 *  together form a stack of rule indication states where the root
 *  (bottom of the stack) has a -1 sentinel value. If we invoke start
 *  symbol s then call r1, which calls r2, the  would look like
 *  this:
 *
 *     SContext[-1]   <- root node (bottom of the stack)
 *     R1Context[p]   <- p in rule s called r1
 *     R2Context[q]   <- q in rule r1 called r2
 *
 *  So the top of the stack, _ctx, represents a call to the current
 *  rule and it holds the return address from another rule that invoke
 *  to this rule. To invoke a rule, we must always have a current context.
 *
 *  The parent contexts are useful for computing lookahead sets and
 *  getting error information.
 *
 *  These objects are used during parsing and prediction.
 *  For the special case of parsers, we use the subclass
 *  ParserRuleContext.
 *
 *  @see ParserRuleContext
 */
const ATN_1 = require("./atn/ATN");
const Recognizer_1 = require("./Recognizer");
const RuleNode_1 = require("./tree/RuleNode");
const Interval_1 = require("./misc/Interval");
const Decorators_1 = require("./Decorators");
const Trees_1 = require("./tree/Trees");
const ParserRuleContext_1 = require("./ParserRuleContext");
class RuleContext extends RuleNode_1.RuleNode {
    constructor(parent, invokingState) {
        super();
        this._parent = parent;
        this.invokingState = invokingState != null ? invokingState : -1;
    }
    static getChildContext(parent, invokingState) {
        return new RuleContext(parent, invokingState);
    }
    depth() {
        let n = 0;
        let p = this;
        while (p) {
            p = p._parent;
            n++;
        }
        return n;
    }
    /** A context is empty if there is no invoking state; meaning nobody called
     *  current context.
     */
    get isEmpty() {
        return this.invokingState === -1;
    }
    // satisfy the ParseTree / SyntaxTree interface
    get sourceInterval() {
        return Interval_1.Interval.INVALID;
    }
    get ruleContext() { return this; }
    get parent() { return this._parent; }
    get payload() { return this; }
    /** Return the combined text of all child nodes. This method only considers
     *  tokens which have been added to the parse tree.
     *  <p>
     *  Since tokens on hidden channels (e.g. whitespace or comments) are not
     *  added to the parse trees, they will not appear in the output of this
     *  method.
     */
    get text() {
        if (this.childCount === 0) {
            return "";
        }
        let builder = "";
        for (let i = 0; i < this.childCount; i++) {
            builder += this.getChild(i).text;
        }
        return builder.toString();
    }
    get ruleIndex() { return -1; }
    /** For rule associated with this parse tree internal node, return
     *  the outer alternative number used to match the input. Default
     *  implementation does not compute nor store this alt num. Create
     *  a subclass of ParserRuleContext with backing field and set
     *  option contextSuperClass.
     *  to set it.
     *
     *  @since 4.5.3
     */
    get altNumber() { return ATN_1.ATN.INVALID_ALT_NUMBER; }
    /** Set the outer alternative number for this context node. Default
     *  implementation does nothing to avoid backing field overhead for
     *  trees that don't need it.  Create
     *  a subclass of ParserRuleContext with backing field and set
     *  option contextSuperClass.
     *
     *  @since 4.5.3
     */
    set altNumber(altNumber) { }
    getChild(i) {
        throw new RangeError("i must be greater than or equal to 0 and less than childCount");
    }
    get childCount() {
        return 0;
    }
    accept(visitor) {
        return visitor.visitChildren(this);
    }
    toStringTree(recog) {
        return Trees_1.Trees.toStringTree(this, recog);
    }
    toString(arg1, stop) {
        const ruleNames = (arg1 instanceof Recognizer_1.Recognizer) ? arg1.ruleNames : arg1;
        stop = stop || ParserRuleContext_1.ParserRuleContext.emptyContext();
        let buf = "";
        let p = this;
        buf += ("[");
        while (p && p !== stop) {
            if (!ruleNames) {
                if (!p.isEmpty) {
                    buf += (p.invokingState);
                }
            }
            else {
                let ruleIndex = p.ruleIndex;
                let ruleName = (ruleIndex >= 0 && ruleIndex < ruleNames.length)
                    ? ruleNames[ruleIndex] : ruleIndex.toString();
                buf += (ruleName);
            }
            if (p._parent && (ruleNames || !p._parent.isEmpty)) {
                buf += (" ");
            }
            p = p._parent;
        }
        buf += ("]");
        return buf.toString();
    }
}
__decorate([
    Decorators_1.Override
], RuleContext.prototype, "sourceInterval", null);
__decorate([
    Decorators_1.Override
], RuleContext.prototype, "ruleContext", null);
__decorate([
    Decorators_1.Override
], RuleContext.prototype, "parent", null);
__decorate([
    Decorators_1.Override
], RuleContext.prototype, "payload", null);
__decorate([
    Decorators_1.Override
], RuleContext.prototype, "text", null);
__decorate([
    Decorators_1.Override
], RuleContext.prototype, "getChild", null);
__decorate([
    Decorators_1.Override
], RuleContext.prototype, "childCount", null);
__decorate([
    Decorators_1.Override
], RuleContext.prototype, "accept", null);
__decorate([
    Decorators_1.Override
], RuleContext.prototype, "toStringTree", null);
exports.RuleContext = RuleContext;

},{"./Decorators":16,"./ParserRuleContext":31,"./Recognizer":35,"./atn/ATN":43,"./misc/Interval":111,"./tree/RuleNode":123,"./tree/Trees":125}],37:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:57.4741196-07:00
const ATN_1 = require("./atn/ATN");
const Decorators_1 = require("./Decorators");
const ParserRuleContext_1 = require("./ParserRuleContext");
/** A handy class for use with
 *
 *  options {contextSuperClass=org.antlr.v4.runtime.RuleContextWithAltNum;}
 *
 *  that provides a backing field / impl for the outer alternative number
 *  matched for an internal parse tree node.
 *
 *  I'm only putting into Java runtime as I'm certain I'm the only one that
 *  will really every use this.
 */
class RuleContextWithAltNum extends ParserRuleContext_1.ParserRuleContext {
    constructor(parent, invokingStateNumber) {
        if (invokingStateNumber !== undefined) {
            super(parent, invokingStateNumber);
        }
        else {
            super();
        }
        this._altNumber = ATN_1.ATN.INVALID_ALT_NUMBER;
    }
    get altNumber() {
        return this._altNumber;
    }
    // @Override
    set altNumber(altNum) {
        this._altNumber = altNum;
    }
}
__decorate([
    Decorators_1.Override
], RuleContextWithAltNum.prototype, "altNumber", null);
exports.RuleContextWithAltNum = RuleContextWithAltNum;

},{"./Decorators":16,"./ParserRuleContext":31,"./atn/ATN":43}],38:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Declares a dependency upon a grammar rule, along with a set of zero or more dependent rules.
 *
 * Version numbers within a grammar should be assigned on a monotonically increasing basis to allow for accurate
 * tracking of dependent rules.
 *
 * @author Sam Harwell
 */
function RuleDependency(dependency) {
    return function (target, propertyKey, propertyDescriptor) {
    };
}
exports.RuleDependency = RuleDependency;

},{}],39:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @author Sam Harwell
 */
function RuleVersion(version) {
    return function (target, propertyKey, propertyDescriptor) {
    };
}
exports.RuleVersion = RuleVersion;

},{}],40:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const IntStream_1 = require("./IntStream");
var Token;
(function (Token) {
    Token.INVALID_TYPE = 0;
    /** During lookahead operations, this "token" signifies we hit rule end ATN state
     *  and did not follow it despite needing to.
     */
    Token.EPSILON = -2;
    Token.MIN_USER_TOKEN_TYPE = 1;
    Token.EOF = IntStream_1.IntStream.EOF;
    /** All tokens go to the parser (unless skip() is called in that rule)
     *  on a particular "channel".  The parser tunes to a particular channel
     *  so that whitespace etc... can go to the parser on a "hidden" channel.
     */
    Token.DEFAULT_CHANNEL = 0;
    /** Anything on different channel than DEFAULT_CHANNEL is not parsed
     *  by parser.
     */
    Token.HIDDEN_CHANNEL = 1;
    /**
     * This is the minimum constant value which can be assigned to a
     * user-defined token channel.
     *
     * <p>
     * The non-negative numbers less than {@link #MIN_USER_CHANNEL_VALUE} are
     * assigned to the predefined channels {@link #DEFAULT_CHANNEL} and
     * {@link #HIDDEN_CHANNEL}.</p>
     *
     * @see `Token.channel`
     */
    Token.MIN_USER_CHANNEL_VALUE = 2;
})(Token = exports.Token || (exports.Token = {}));

},{"./IntStream":22}],41:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:58.1768850-07:00
const Interval_1 = require("./misc/Interval");
const Decorators_1 = require("./Decorators");
const Token_1 = require("./Token");
/**
 * Useful for rewriting out a buffered input token stream after doing some
 * augmentation or other manipulations on it.
 *
 * <p>
 * You can insert stuff, replace, and delete chunks. Note that the operations
 * are done lazily--only if you convert the buffer to a {@link String} with
 * {@link TokenStream#getText()}. This is very efficient because you are not
 * moving data around all the time. As the buffer of tokens is converted to
 * strings, the {@link #getText()} method(s) scan the input token stream and
 * check to see if there is an operation at the current index. If so, the
 * operation is done and then normal {@link String} rendering continues on the
 * buffer. This is like having multiple Turing machine instruction streams
 * (programs) operating on a single input tape. :)</p>
 *
 * <p>
 * This rewriter makes no modifications to the token stream. It does not ask the
 * stream to fill itself up nor does it advance the input cursor. The token
 * stream `TokenStream.index` will return the same value before and
 * after any {@link #getText()} call.</p>
 *
 * <p>
 * The rewriter only works on tokens that you have in the buffer and ignores the
 * current input cursor. If you are buffering tokens on-demand, calling
 * {@link #getText()} halfway through the input will only do rewrites for those
 * tokens in the first half of the file.</p>
 *
 * <p>
 * Since the operations are done lazily at {@link #getText}-time, operations do
 * not screw up the token index values. That is, an insert operation at token
 * index {@code i} does not change the index values for tokens
 * {@code i}+1..n-1.</p>
 *
 * <p>
 * Because operations never actually alter the buffer, you may always get the
 * original token stream back without undoing anything. Since the instructions
 * are queued up, you can easily simulate transactions and roll back any changes
 * if there is an error just by removing instructions. For example,</p>
 *
 * <pre>
 * CharStream input = new ANTLRFileStream("input");
 * TLexer lex = new TLexer(input);
 * CommonTokenStream tokens = new CommonTokenStream(lex);
 * T parser = new T(tokens);
 * TokenStreamRewriter rewriter = new TokenStreamRewriter(tokens);
 * parser.startRule();
 * </pre>
 *
 * <p>
 * Then in the rules, you can execute (assuming rewriter is visible):</p>
 *
 * <pre>
 * Token t,u;
 * ...
 * rewriter.insertAfter(t, "text to put after t");}
 * rewriter.insertAfter(u, "text after u");}
 * System.out.println(rewriter.getText());
 * </pre>
 *
 * <p>
 * You can also have multiple "instruction streams" and get multiple rewrites
 * from a single pass over the input. Just name the instruction streams and use
 * that name again when printing the buffer. This could be useful for generating
 * a C file and also its header file--all from the same buffer:</p>
 *
 * <pre>
 * rewriter.insertAfter("pass1", t, "text to put after t");}
 * rewriter.insertAfter("pass2", u, "text after u");}
 * System.out.println(rewriter.getText("pass1"));
 * System.out.println(rewriter.getText("pass2"));
 * </pre>
 *
 * <p>
 * If you don't use named rewrite streams, a "default" stream is used as the
 * first example shows.</p>
 */
class TokenStreamRewriter {
    constructor(tokens) {
        this.tokens = tokens;
        this.programs = new Map();
        this.programs.set(TokenStreamRewriter.DEFAULT_PROGRAM_NAME, []);
        this.lastRewriteTokenIndexes = new Map();
    }
    getTokenStream() {
        return this.tokens;
    }
    rollback(instructionIndex, programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        let is = this.programs.get(programName);
        if (is != null) {
            this.programs.set(programName, is.slice(TokenStreamRewriter.MIN_TOKEN_INDEX, instructionIndex));
        }
    }
    deleteProgram(programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        this.rollback(TokenStreamRewriter.MIN_TOKEN_INDEX, programName);
    }
    insertAfter(tokenOrIndex, text, programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        let index;
        if (typeof tokenOrIndex === 'number') {
            index = tokenOrIndex;
        }
        else {
            index = tokenOrIndex.tokenIndex;
        }
        // to insert after, just insert before next index (even if past end)
        let op = new InsertAfterOp(this.tokens, index, text);
        let rewrites = this.getProgram(programName);
        op.instructionIndex = rewrites.length;
        rewrites.push(op);
    }
    insertBefore(tokenOrIndex, text, programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        let index;
        if (typeof tokenOrIndex === 'number') {
            index = tokenOrIndex;
        }
        else {
            index = tokenOrIndex.tokenIndex;
        }
        let op = new InsertBeforeOp(this.tokens, index, text);
        let rewrites = this.getProgram(programName);
        op.instructionIndex = rewrites.length;
        rewrites.push(op);
    }
    replaceSingle(index, text) {
        if (typeof index === 'number') {
            this.replace(index, index, text);
        }
        else {
            this.replace(index, index, text);
        }
    }
    replace(from, to, text, programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        if (typeof from !== 'number') {
            from = from.tokenIndex;
        }
        if (typeof to !== 'number') {
            to = to.tokenIndex;
        }
        if (from > to || from < 0 || to < 0 || to >= this.tokens.size) {
            throw new RangeError(`replace: range invalid: ${from}..${to}(size=${this.tokens.size})`);
        }
        let op = new ReplaceOp(this.tokens, from, to, text);
        let rewrites = this.getProgram(programName);
        op.instructionIndex = rewrites.length;
        rewrites.push(op);
    }
    delete(from, to, programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        if (to === undefined) {
            to = from;
        }
        if (typeof from === 'number') {
            this.replace(from, to, undefined, programName);
        }
        else {
            this.replace(from, to, undefined, programName);
        }
    }
    getLastRewriteTokenIndex(programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        let I = this.lastRewriteTokenIndexes.get(programName);
        if (I == null) {
            return -1;
        }
        return I;
    }
    setLastRewriteTokenIndex(programName, i) {
        this.lastRewriteTokenIndexes.set(programName, i);
    }
    getProgram(name) {
        let is = this.programs.get(name);
        if (is == null) {
            is = this.initializeProgram(name);
        }
        return is;
    }
    initializeProgram(name) {
        let is = [];
        this.programs.set(name, is);
        return is;
    }
    getText(intervalOrProgram, programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        let interval;
        if (intervalOrProgram instanceof Interval_1.Interval) {
            interval = intervalOrProgram;
        }
        else {
            interval = Interval_1.Interval.of(0, this.tokens.size - 1);
        }
        if (typeof intervalOrProgram === 'string') {
            programName = intervalOrProgram;
        }
        let rewrites = this.programs.get(programName);
        let start = interval.a;
        let stop = interval.b;
        // ensure start/end are in range
        if (stop > this.tokens.size - 1)
            stop = this.tokens.size - 1;
        if (start < 0)
            start = 0;
        if (rewrites == null || rewrites.length === 0) {
            return this.tokens.getText(interval); // no instructions to execute
        }
        let buf = [];
        // First, optimize instruction stream
        let indexToOp = this.reduceToSingleOperationPerIndex(rewrites);
        // Walk buffer, executing instructions and emitting tokens
        let i = start;
        while (i <= stop && i < this.tokens.size) {
            let op = indexToOp.get(i);
            indexToOp.delete(i); // remove so any left have index size-1
            let t = this.tokens.get(i);
            if (op == null) {
                // no operation at that index, just dump token
                if (t.type !== Token_1.Token.EOF)
                    buf.push(String(t.text));
                i++; // move to next token
            }
            else {
                i = op.execute(buf); // execute operation and skip
            }
        }
        // include stuff after end if it's last index in buffer
        // So, if they did an insertAfter(lastValidIndex, "foo"), include
        // foo if end==lastValidIndex.
        if (stop === this.tokens.size - 1) {
            // Scan any remaining operations after last token
            // should be included (they will be inserts).
            for (let op of indexToOp.values()) {
                if (op.index >= this.tokens.size - 1)
                    buf += op.text;
            }
        }
        return buf.join("");
    }
    /** We need to combine operations and report invalid operations (like
     *  overlapping replaces that are not completed nested). Inserts to
     *  same index need to be combined etc...  Here are the cases:
     *
     *  I.i.u I.j.v								leave alone, nonoverlapping
     *  I.i.u I.i.v								combine: Iivu
     *
     *  R.i-j.u R.x-y.v	| i-j in x-y			delete first R
     *  R.i-j.u R.i-j.v							delete first R
     *  R.i-j.u R.x-y.v	| x-y in i-j			ERROR
     *  R.i-j.u R.x-y.v	| boundaries overlap	ERROR
     *
     *  Delete special case of replace (text==null):
     *  D.i-j.u D.x-y.v	| boundaries overlap	combine to max(min)..max(right)
     *
     *  I.i.u R.x-y.v | i in (x+1)-y			delete I (since insert before
     *											we're not deleting i)
     *  I.i.u R.x-y.v | i not in (x+1)-y		leave alone, nonoverlapping
     *  R.x-y.v I.i.u | i in x-y				ERROR
     *  R.x-y.v I.x.u 							R.x-y.uv (combine, delete I)
     *  R.x-y.v I.i.u | i not in x-y			leave alone, nonoverlapping
     *
     *  I.i.u = insert u before op @ index i
     *  R.x-y.u = replace x-y indexed tokens with u
     *
     *  First we need to examine replaces. For any replace op:
     *
     * 		1. wipe out any insertions before op within that range.
     *		2. Drop any replace op before that is contained completely within
     *	 that range.
     *		3. Throw exception upon boundary overlap with any previous replace.
     *
     *  Then we can deal with inserts:
     *
     * 		1. for any inserts to same index, combine even if not adjacent.
     * 		2. for any prior replace with same left boundary, combine this
     *	 insert with replace and delete this replace.
     * 		3. throw exception if index in same range as previous replace
     *
     *  Don't actually delete; make op null in list. Easier to walk list.
     *  Later we can throw as we add to index &rarr; op map.
     *
     *  Note that I.2 R.2-2 will wipe out I.2 even though, technically, the
     *  inserted stuff would be before the replace range. But, if you
     *  add tokens in front of a method body '{' and then delete the method
     *  body, I think the stuff before the '{' you added should disappear too.
     *
     *  Return a map from token index to operation.
     */
    reduceToSingleOperationPerIndex(rewrites) {
        // console.log(`rewrites=[${Utils.join(rewrites, ", ")}]`);
        // WALK REPLACES
        for (let i = 0; i < rewrites.length; i++) {
            let op = rewrites[i];
            if (op == null)
                continue;
            if (!(op instanceof ReplaceOp))
                continue;
            let rop = op;
            // Wipe prior inserts within range
            let inserts = this.getKindOfOps(rewrites, InsertBeforeOp, i);
            for (let iop of inserts) {
                if (iop.index == rop.index) {
                    // E.g., insert before 2, delete 2..2; update replace
                    // text to include insert before, kill insert
                    rewrites[iop.instructionIndex] = undefined;
                    rop.text = iop.text.toString() + (rop.text != null ? rop.text.toString() : "");
                }
                else if (iop.index > rop.index && iop.index <= rop.lastIndex) {
                    // delete insert as it's a no-op.
                    rewrites[iop.instructionIndex] = undefined;
                }
            }
            // Drop any prior replaces contained within
            let prevReplaces = this.getKindOfOps(rewrites, ReplaceOp, i);
            for (let prevRop of prevReplaces) {
                if (prevRop.index >= rop.index && prevRop.lastIndex <= rop.lastIndex) {
                    // delete replace as it's a no-op.
                    rewrites[prevRop.instructionIndex] = undefined;
                    continue;
                }
                // throw exception unless disjoint or identical
                let disjoint = prevRop.lastIndex < rop.index || prevRop.index > rop.lastIndex;
                // Delete special case of replace (text==null):
                // D.i-j.u D.x-y.v	| boundaries overlap	combine to max(min)..max(right)
                if (prevRop.text == null && rop.text == null && !disjoint) {
                    // console.log(`overlapping deletes: ${prevRop}, ${rop}`);
                    rewrites[prevRop.instructionIndex] = undefined; // kill first delete
                    rop.index = Math.min(prevRop.index, rop.index);
                    rop.lastIndex = Math.max(prevRop.lastIndex, rop.lastIndex);
                    // console.log(`new rop ${rop}`);
                }
                else if (!disjoint) {
                    throw new Error(`replace op boundaries of ${rop} overlap with previous ${prevRop}`);
                }
            }
        }
        // WALK INSERTS
        for (let i = 0; i < rewrites.length; i++) {
            let op = rewrites[i];
            if (op == null)
                continue;
            if (!(op instanceof InsertBeforeOp))
                continue;
            let iop = op;
            // combine current insert with prior if any at same index
            let prevInserts = this.getKindOfOps(rewrites, InsertBeforeOp, i);
            for (let prevIop of prevInserts) {
                if (prevIop.index === iop.index) {
                    if (prevIop instanceof InsertAfterOp) {
                        iop.text = this.catOpText(prevIop.text, iop.text);
                        rewrites[prevIop.instructionIndex] = undefined;
                    }
                    else if (prevIop instanceof InsertBeforeOp) {
                        // convert to strings...we're in process of toString'ing
                        // whole token buffer so no lazy eval issue with any templates
                        iop.text = this.catOpText(iop.text, prevIop.text);
                        // delete redundant prior insert
                        rewrites[prevIop.instructionIndex] = undefined;
                    }
                }
            }
            // look for replaces where iop.index is in range; error
            let prevReplaces = this.getKindOfOps(rewrites, ReplaceOp, i);
            for (let rop of prevReplaces) {
                if (iop.index == rop.index) {
                    rop.text = this.catOpText(iop.text, rop.text);
                    rewrites[i] = undefined; // delete current insert
                    continue;
                }
                if (iop.index >= rop.index && iop.index <= rop.lastIndex) {
                    throw new Error(`insert op ${iop} within boundaries of previous ${rop}`);
                }
            }
        }
        // console.log(`rewrites after=[${Utils.join(rewrites, ", ")}]`);
        let m = new Map();
        for (let i = 0; i < rewrites.length; i++) {
            let op = rewrites[i];
            if (op == null)
                continue; // ignore deleted ops
            if (m.get(op.index) != null) {
                throw new Error("should only be one op per index");
            }
            m.set(op.index, op);
        }
        // console.log(`index to op: ${m}`);
        return m;
    }
    catOpText(a, b) {
        let x = "";
        let y = "";
        if (a != null)
            x = a.toString();
        if (b != null)
            y = b.toString();
        return x + y;
    }
    /** Get all operations before an index of a particular kind */
    getKindOfOps(rewrites, kind, before) {
        let ops = [];
        for (let i = 0; i < before && i < rewrites.length; i++) {
            let op = rewrites[i];
            if (op == null)
                continue; // ignore deleted
            if (op instanceof kind) {
                ops.push(op);
            }
        }
        return ops;
    }
}
TokenStreamRewriter.DEFAULT_PROGRAM_NAME = "default";
TokenStreamRewriter.PROGRAM_INIT_SIZE = 100;
TokenStreamRewriter.MIN_TOKEN_INDEX = 0;
exports.TokenStreamRewriter = TokenStreamRewriter;
// Define the rewrite operation hierarchy
class RewriteOperation {
    constructor(tokens, index, text) {
        this.tokens = tokens;
        this.index = index;
        this.text = text;
    }
    /** Execute the rewrite operation by possibly adding to the buffer.
     *  Return the index of the next token to operate on.
     */
    execute(buf) {
        return this.index;
    }
    toString() {
        let opName = this.constructor.name;
        let $index = opName.indexOf('$');
        opName = opName.substring($index + 1, opName.length);
        return "<" + opName + "@" + this.tokens.get(this.index) +
            ":\"" + this.text + "\">";
    }
}
__decorate([
    Decorators_1.Override
], RewriteOperation.prototype, "toString", null);
exports.RewriteOperation = RewriteOperation;
class InsertBeforeOp extends RewriteOperation {
    constructor(tokens, index, text) {
        super(tokens, index, text);
    }
    execute(buf) {
        buf.push(this.text);
        if (this.tokens.get(this.index).type !== Token_1.Token.EOF) {
            buf.push(String(this.tokens.get(this.index).text));
        }
        return this.index + 1;
    }
}
__decorate([
    Decorators_1.Override
], InsertBeforeOp.prototype, "execute", null);
/** Distinguish between insert after/before to do the "insert afters"
 *  first and then the "insert befores" at same index. Implementation
 *  of "insert after" is "insert before index+1".
 */
class InsertAfterOp extends InsertBeforeOp {
    constructor(tokens, index, text) {
        super(tokens, index + 1, text); // insert after is insert before index+1
    }
}
/** I'm going to try replacing range from x..y with (y-x)+1 ReplaceOp
 *  instructions.
 */
class ReplaceOp extends RewriteOperation {
    constructor(tokens, from, to, text) {
        super(tokens, from, text);
        this.lastIndex = to;
    }
    execute(buf) {
        if (this.text != null) {
            buf.push(this.text);
        }
        return this.lastIndex + 1;
    }
    toString() {
        if (this.text == null) {
            return "<DeleteOp@" + this.tokens.get(this.index) +
                ".." + this.tokens.get(this.lastIndex) + ">";
        }
        return "<ReplaceOp@" + this.tokens.get(this.index) +
            ".." + this.tokens.get(this.lastIndex) + ":\"" + this.text + "\">";
    }
}
__decorate([
    Decorators_1.Override
], ReplaceOp.prototype, "execute", null);
__decorate([
    Decorators_1.Override
], ReplaceOp.prototype, "toString", null);

},{"./Decorators":16,"./Token":40,"./misc/Interval":111}],42:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:59.5829654-07:00
const Decorators_1 = require("./Decorators");
const Token_1 = require("./Token");
/**
 * This class provides a default implementation of the {@link Vocabulary}
 * interface.
 *
 * @author Sam Harwell
 */
class VocabularyImpl {
    /**
     * Constructs a new instance of {@link VocabularyImpl} from the specified
     * literal, symbolic, and display token names.
     *
     * @param literalNames The literal names assigned to tokens, or an empty array
     * if no literal names are assigned.
     * @param symbolicNames The symbolic names assigned to tokens, or
     * an empty array if no symbolic names are assigned.
     * @param displayNames The display names assigned to tokens, or an empty array
     * to use the values in {@code literalNames} and {@code symbolicNames} as
     * the source of display names, as described in
     * {@link #getDisplayName(int)}.
     *
     * @see #getLiteralName(int)
     * @see #getSymbolicName(int)
     * @see #getDisplayName(int)
     */
    constructor(literalNames, symbolicNames, displayNames) {
        this.literalNames = literalNames;
        this.symbolicNames = symbolicNames;
        this.displayNames = displayNames;
        // See note here on -1 part: https://github.com/antlr/antlr4/pull/1146
        this._maxTokenType =
            Math.max(this.displayNames.length, Math.max(this.literalNames.length, this.symbolicNames.length)) - 1;
    }
    get maxTokenType() {
        return this._maxTokenType;
    }
    getLiteralName(tokenType) {
        if (tokenType >= 0 && tokenType < this.literalNames.length) {
            return this.literalNames[tokenType];
        }
        return undefined;
    }
    getSymbolicName(tokenType) {
        if (tokenType >= 0 && tokenType < this.symbolicNames.length) {
            return this.symbolicNames[tokenType];
        }
        if (tokenType === Token_1.Token.EOF) {
            return "EOF";
        }
        return undefined;
    }
    getDisplayName(tokenType) {
        if (tokenType >= 0 && tokenType < this.displayNames.length) {
            let displayName = this.displayNames[tokenType];
            if (displayName) {
                return displayName;
            }
        }
        let literalName = this.getLiteralName(tokenType);
        if (literalName) {
            return literalName;
        }
        let symbolicName = this.getSymbolicName(tokenType);
        if (symbolicName) {
            return symbolicName;
        }
        return String(tokenType);
    }
}
/**
 * Gets an empty {@link Vocabulary} instance.
 *
 * <p>
 * No literal or symbol names are assigned to token types, so
 * {@link #getDisplayName(int)} returns the numeric value for all tokens
 * except {@link Token#EOF}.</p>
 */
VocabularyImpl.EMPTY_VOCABULARY = new VocabularyImpl([], [], []);
__decorate([
    Decorators_1.NotNull
], VocabularyImpl.prototype, "literalNames", void 0);
__decorate([
    Decorators_1.NotNull
], VocabularyImpl.prototype, "symbolicNames", void 0);
__decorate([
    Decorators_1.NotNull
], VocabularyImpl.prototype, "displayNames", void 0);
__decorate([
    Decorators_1.Override
], VocabularyImpl.prototype, "maxTokenType", null);
__decorate([
    Decorators_1.Override
], VocabularyImpl.prototype, "getLiteralName", null);
__decorate([
    Decorators_1.Override
], VocabularyImpl.prototype, "getSymbolicName", null);
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull
], VocabularyImpl.prototype, "getDisplayName", null);
__decorate([
    Decorators_1.NotNull
], VocabularyImpl, "EMPTY_VOCABULARY", void 0);
exports.VocabularyImpl = VocabularyImpl;

},{"./Decorators":16,"./Token":40}],43:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:25.1063510-07:00
const Array2DHashMap_1 = require("../misc/Array2DHashMap");
const DFA_1 = require("../dfa/DFA");
const IntervalSet_1 = require("../misc/IntervalSet");
const InvalidState_1 = require("./InvalidState");
const LL1Analyzer_1 = require("./LL1Analyzer");
const Decorators_1 = require("../Decorators");
const ObjectEqualityComparator_1 = require("../misc/ObjectEqualityComparator");
const PredictionContext_1 = require("./PredictionContext");
const Token_1 = require("../Token");
const assert = require("assert");
/** */
let ATN = class ATN {
    /** Used for runtime deserialization of ATNs from strings */
    constructor(grammarType, maxTokenType) {
        this.states = [];
        /** Each subrule/rule is a decision point and we must track them so we
         *  can go back later and build DFA predictors for them.  This includes
         *  all the rules, subrules, optional blocks, ()+, ()* etc...
         */
        this.decisionToState = [];
        this.modeNameToStartState = new Map();
        this.modeToStartState = [];
        this.contextCache = new Array2DHashMap_1.Array2DHashMap(ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE);
        this.decisionToDFA = [];
        this.modeToDFA = [];
        this.LL1Table = new Map();
        this.grammarType = grammarType;
        this.maxTokenType = maxTokenType;
    }
    clearDFA() {
        this.decisionToDFA = new Array(this.decisionToState.length);
        for (let i = 0; i < this.decisionToDFA.length; i++) {
            this.decisionToDFA[i] = new DFA_1.DFA(this.decisionToState[i], i);
        }
        this.modeToDFA = new Array(this.modeToStartState.length);
        for (let i = 0; i < this.modeToDFA.length; i++) {
            this.modeToDFA[i] = new DFA_1.DFA(this.modeToStartState[i]);
        }
        this.contextCache.clear();
        this.LL1Table.clear();
    }
    get contextCacheSize() {
        return this.contextCache.size;
    }
    getCachedContext(context) {
        return PredictionContext_1.PredictionContext.getCachedContext(context, this.contextCache, new PredictionContext_1.PredictionContext.IdentityHashMap());
    }
    getDecisionToDFA() {
        assert(this.decisionToDFA != null && this.decisionToDFA.length === this.decisionToState.length);
        return this.decisionToDFA;
    }
    nextTokens(s, ctx) {
        if (ctx) {
            let anal = new LL1Analyzer_1.LL1Analyzer(this);
            let next = anal.LOOK(s, ctx);
            return next;
        }
        else {
            if (s.nextTokenWithinRule) {
                return s.nextTokenWithinRule;
            }
            s.nextTokenWithinRule = this.nextTokens(s, PredictionContext_1.PredictionContext.EMPTY_LOCAL);
            s.nextTokenWithinRule.setReadonly(true);
            return s.nextTokenWithinRule;
        }
    }
    addState(state) {
        state.atn = this;
        state.stateNumber = this.states.length;
        this.states.push(state);
    }
    removeState(state) {
        // just replace the state, don't shift states in list
        let invalidState = new InvalidState_1.InvalidState();
        invalidState.atn = this;
        invalidState.stateNumber = state.stateNumber;
        this.states[state.stateNumber] = invalidState;
    }
    defineMode(name, s) {
        this.modeNameToStartState.set(name, s);
        this.modeToStartState.push(s);
        this.modeToDFA.push(new DFA_1.DFA(s));
        this.defineDecisionState(s);
    }
    defineDecisionState(s) {
        this.decisionToState.push(s);
        s.decision = this.decisionToState.length - 1;
        this.decisionToDFA.push(new DFA_1.DFA(s, s.decision));
        return s.decision;
    }
    getDecisionState(decision) {
        if (this.decisionToState.length > 0) {
            return this.decisionToState[decision];
        }
        return undefined;
    }
    get numberOfDecisions() {
        return this.decisionToState.length;
    }
    /**
     * Computes the set of input symbols which could follow ATN state number
     * {@code stateNumber} in the specified full {@code context}. This method
     * considers the complete parser context, but does not evaluate semantic
     * predicates (i.e. all predicates encountered during the calculation are
     * assumed true). If a path in the ATN exists from the starting state to the
     * {@link RuleStopState} of the outermost context without matching any
     * symbols, {@link Token#EOF} is added to the returned set.
     *
     * <p>If {@code context} is {@code null}, it is treated as
     * {@link ParserRuleContext#EMPTY}.</p>
     *
     * <p>Note that this does NOT give you the set of all tokens that could
     * appear at a given token position in the input phrase.  In other words, it
     * does not answer:</p>
     *
     * <quote>"Given a specific partial input phrase, return the set of all
     * tokens that can follow the last token in the input phrase."</quote>
     *
     * <p>The big difference is that with just the input, the parser could land
     * right in the middle of a lookahead decision. Getting all
     * <em>possible</em> tokens given a partial input stream is a separate
     * computation. See https://github.com/antlr/antlr4/issues/1428</p>
     *
     * <p>For this function, we are specifying an ATN state and call stack to
     * compute what token(s) can come next and specifically: outside of a
     * lookahead decision. That is what you want for error reporting and
     * recovery upon parse error.</p>
     *
     * @param stateNumber the ATN state number
     * @param context the full parse context
     * @return The set of potentially valid input symbols which could follow the
     * specified state in the specified context.
     * @ if the ATN does not contain a state with
     * number {@code stateNumber}
     */
    getExpectedTokens(stateNumber, context) {
        if (stateNumber < 0 || stateNumber >= this.states.length) {
            throw new RangeError("Invalid state number.");
        }
        let ctx = context;
        let s = this.states[stateNumber];
        let following = this.nextTokens(s);
        if (!following.contains(Token_1.Token.EPSILON)) {
            return following;
        }
        let expected = new IntervalSet_1.IntervalSet();
        expected.addAll(following);
        expected.remove(Token_1.Token.EPSILON);
        while (ctx != null && ctx.invokingState >= 0 && following.contains(Token_1.Token.EPSILON)) {
            let invokingState = this.states[ctx.invokingState];
            let rt = invokingState.transition(0);
            following = this.nextTokens(rt.followState);
            expected.addAll(following);
            expected.remove(Token_1.Token.EPSILON);
            ctx = ctx._parent;
        }
        if (following.contains(Token_1.Token.EPSILON)) {
            expected.add(Token_1.Token.EOF);
        }
        return expected;
    }
};
__decorate([
    Decorators_1.NotNull
], ATN.prototype, "states", void 0);
__decorate([
    Decorators_1.NotNull
], ATN.prototype, "decisionToState", void 0);
__decorate([
    Decorators_1.NotNull
], ATN.prototype, "modeNameToStartState", void 0);
__decorate([
    Decorators_1.NotNull
], ATN.prototype, "modeToStartState", void 0);
__decorate([
    Decorators_1.NotNull
], ATN.prototype, "decisionToDFA", void 0);
__decorate([
    Decorators_1.NotNull
], ATN.prototype, "modeToDFA", void 0);
__decorate([
    Decorators_1.NotNull
], ATN.prototype, "nextTokens", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ATN.prototype, "removeState", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], ATN.prototype, "defineMode", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ATN.prototype, "defineDecisionState", null);
__decorate([
    Decorators_1.NotNull
], ATN.prototype, "getExpectedTokens", null);
ATN = __decorate([
    __param(0, Decorators_1.NotNull)
], ATN);
exports.ATN = ATN;
(function (ATN) {
    ATN.INVALID_ALT_NUMBER = 0;
})(ATN = exports.ATN || (exports.ATN = {}));
exports.ATN = ATN;

},{"../Decorators":16,"../Token":40,"../dfa/DFA":98,"../misc/Array2DHashMap":103,"../misc/IntervalSet":112,"../misc/ObjectEqualityComparator":114,"./InvalidState":60,"./LL1Analyzer":61,"./PredictionContext":81,"assert":127}],44:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:25.2796692-07:00
const Array2DHashMap_1 = require("../misc/Array2DHashMap");
const DecisionState_1 = require("./DecisionState");
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
const ObjectEqualityComparator_1 = require("../misc/ObjectEqualityComparator");
const PredictionContext_1 = require("./PredictionContext");
const SemanticContext_1 = require("./SemanticContext");
const assert = require("assert");
/**
 * This field stores the bit mask for implementing the
 * {@link #isPrecedenceFilterSuppressed} property as a bit within the
 * existing {@link #altAndOuterContextDepth} field.
 */
const SUPPRESS_PRECEDENCE_FILTER = 0x80000000;
/**
 * Represents a location with context in an ATN. The location is identified by the following values:
 *
 * * The current ATN state
 * * The predicted alternative
 * * The semantic context which must be true for this configuration to be enabled
 * * The syntactic context, which is represented as a graph-structured stack whose path(s) lead to the root of the rule
 *   invocations leading to this state
 *
 * In addition to these values, `ATNConfig` stores several properties about paths taken to get to the location which
 * were added over time to help with performance, correctness, and/or debugging.
 *
 * * `reachesIntoOuterContext`:: Used to ensure semantic predicates are not evaluated in the wrong context.
 * * `hasPassedThroughNonGreedyDecision`: Used for enabling first-match-wins instead of longest-match-wins after
 *   crossing a non-greedy decision.
 * * `lexerActionExecutor`: Used for tracking the lexer action(s) to execute should this instance be selected during
 *   lexing.
 * * `isPrecedenceFilterSuppressed`: A state variable for one of the dynamic disambiguation strategies employed by
 *   `ParserATNSimulator.applyPrecedenceFilter`.
 *
 * Due to the use of a graph-structured stack, a single `ATNConfig` is capable of representing many individual ATN
 * configurations which reached the same location in an ATN by following different paths.
 *
 * PERF: To conserve memory, `ATNConfig` is split into several different concrete types. `ATNConfig` itself stores the
 * minimum amount of information typically used to define an `ATNConfig` instance. Various derived types provide
 * additional storage space for cases where a non-default value is used for some of the object properties. The
 * `ATNConfig.create` and `ATNConfig.transform` methods automatically select the smallest concrete type capable of
 * representing the unique information for any given `ATNConfig`.
 */
let ATNConfig = class ATNConfig {
    constructor(state, altOrConfig, context) {
        if (typeof altOrConfig === 'number') {
            assert((altOrConfig & 0xFFFFFF) == altOrConfig);
            this._state = state;
            this.altAndOuterContextDepth = altOrConfig;
            this._context = context;
        }
        else {
            this._state = state;
            this.altAndOuterContextDepth = altOrConfig.altAndOuterContextDepth;
            this._context = context;
        }
    }
    static create(state, alt, context, semanticContext = SemanticContext_1.SemanticContext.NONE, lexerActionExecutor) {
        if (semanticContext != SemanticContext_1.SemanticContext.NONE) {
            if (lexerActionExecutor != null) {
                return new ActionSemanticContextATNConfig(lexerActionExecutor, semanticContext, state, alt, context, false);
            }
            else {
                return new SemanticContextATNConfig(semanticContext, state, alt, context);
            }
        }
        else if (lexerActionExecutor != null) {
            return new ActionATNConfig(lexerActionExecutor, state, alt, context, false);
        }
        else {
            return new ATNConfig(state, alt, context);
        }
    }
    /** Gets the ATN state associated with this configuration */
    get state() {
        return this._state;
    }
    /** What alt (or lexer rule) is predicted by this configuration */
    get alt() {
        return this.altAndOuterContextDepth & 0x00FFFFFF;
    }
    get context() {
        return this._context;
    }
    set context(context) {
        this._context = context;
    }
    get reachesIntoOuterContext() {
        return this.outerContextDepth !== 0;
    }
    /**
     * We cannot execute predicates dependent upon local context unless
     * we know for sure we are in the correct context. Because there is
     * no way to do this efficiently, we simply cannot evaluate
     * dependent predicates unless we are in the rule that initially
     * invokes the ATN simulator.
     *
     * <p>
     * closure() tracks the depth of how far we dip into the outer context:
     * depth &gt; 0.  Note that it may not be totally accurate depth since I
     * don't ever decrement. TODO: make it a boolean then</p>
     */
    get outerContextDepth() {
        return (this.altAndOuterContextDepth >>> 24) & 0x7F;
    }
    set outerContextDepth(outerContextDepth) {
        assert(outerContextDepth >= 0);
        // saturate at 0x7F - everything but zero/positive is only used for debug information anyway
        outerContextDepth = Math.min(outerContextDepth, 0x7F);
        this.altAndOuterContextDepth = ((outerContextDepth << 24) | (this.altAndOuterContextDepth & ~0x7F000000) >>> 0);
    }
    get lexerActionExecutor() {
        return undefined;
    }
    get semanticContext() {
        return SemanticContext_1.SemanticContext.NONE;
    }
    get hasPassedThroughNonGreedyDecision() {
        return false;
    }
    clone() {
        return this.transform(this.state, false);
    }
    transform(/*@NotNull*/ state, checkNonGreedy, arg2) {
        if (arg2 == null) {
            return this.transformImpl(state, this._context, this.semanticContext, checkNonGreedy, this.lexerActionExecutor);
        }
        else if (arg2 instanceof PredictionContext_1.PredictionContext) {
            return this.transformImpl(state, arg2, this.semanticContext, checkNonGreedy, this.lexerActionExecutor);
        }
        else if (arg2 instanceof SemanticContext_1.SemanticContext) {
            return this.transformImpl(state, this._context, arg2, checkNonGreedy, this.lexerActionExecutor);
        }
        else {
            return this.transformImpl(state, this._context, this.semanticContext, checkNonGreedy, arg2);
        }
    }
    transformImpl(state, context, semanticContext, checkNonGreedy, lexerActionExecutor) {
        let passedThroughNonGreedy = checkNonGreedy && ATNConfig.checkNonGreedyDecision(this, state);
        if (semanticContext != SemanticContext_1.SemanticContext.NONE) {
            if (lexerActionExecutor != null || passedThroughNonGreedy) {
                return new ActionSemanticContextATNConfig(lexerActionExecutor, semanticContext, state, this, context, passedThroughNonGreedy);
            }
            else {
                return new SemanticContextATNConfig(semanticContext, state, this, context);
            }
        }
        else if (lexerActionExecutor != null || passedThroughNonGreedy) {
            return new ActionATNConfig(lexerActionExecutor, state, this, context, passedThroughNonGreedy);
        }
        else {
            return new ATNConfig(state, this, context);
        }
    }
    static checkNonGreedyDecision(source, target) {
        return source.hasPassedThroughNonGreedyDecision
            || target instanceof DecisionState_1.DecisionState && target.nonGreedy;
    }
    appendContext(context, contextCache) {
        if (typeof context === 'number') {
            let appendedContext = this.context.appendSingleContext(context, contextCache);
            let result = this.transform(this.state, false, appendedContext);
            return result;
        }
        else {
            let appendedContext = this.context.appendContext(context, contextCache);
            let result = this.transform(this.state, false, appendedContext);
            return result;
        }
    }
    /**
     * Determines if this `ATNConfig` fully contains another `ATNConfig`.
     *
     * An ATN configuration represents a position (including context) in an ATN during parsing. Since `ATNConfig` stores
     * the context as a graph, a single `ATNConfig` instance is capable of representing many ATN configurations which
     * are all in the same "location" but have different contexts. These `ATNConfig` instances are again merged when
     * they are added to an `ATNConfigSet`. This method supports `ATNConfigSet.contains` by evaluating whether a
     * particular `ATNConfig` contains all of the ATN configurations represented by another `ATNConfig`.
     *
     * An `ATNConfig` _a_ contains another `ATNConfig` _b_ if all of the following conditions are met:
     *
     * * The configurations are in the same state (`state`)
     * * The configurations predict the same alternative (`alt`)
     * * The semantic context of _a_ implies the semantic context of _b_ (this method performs a weaker equality check)
     * * Joining the prediction contexts of _a_ and _b_ results in the prediction context of _a_
     *
     * This method implements a conservative approximation of containment. As a result, when this method returns `true`
     * it is known that parsing from `subconfig` can only recognize a subset of the inputs which can be recognized
     * starting at the current `ATNConfig`. However, due to the imprecise evaluation of implication for the semantic
     * contexts, no assumptions can be made about the relationship between the configurations when this method returns
     * `false`.
     *
     * @param subconfig The sub configuration.
     * @return `true` if this configuration contains `subconfig`; otherwise, `false`.
     */
    contains(subconfig) {
        if (this.state.stateNumber !== subconfig.state.stateNumber
            || this.alt !== subconfig.alt
            || !this.semanticContext.equals(subconfig.semanticContext)) {
            return false;
        }
        let leftWorkList = [];
        let rightWorkList = [];
        leftWorkList.push(this.context);
        rightWorkList.push(subconfig.context);
        while (true) {
            let left = leftWorkList.pop();
            let right = rightWorkList.pop();
            if (!left || !right) {
                break;
            }
            if (left === right) {
                return true;
            }
            if (left.size < right.size) {
                return false;
            }
            if (right.isEmpty) {
                return left.hasEmpty;
            }
            else {
                for (let i = 0; i < right.size; i++) {
                    let index = left.findReturnState(right.getReturnState(i));
                    if (index < 0) {
                        // assumes invokingStates has no duplicate entries
                        return false;
                    }
                    leftWorkList.push(left.getParent(index));
                    rightWorkList.push(right.getParent(i));
                }
            }
        }
        return false;
    }
    get isPrecedenceFilterSuppressed() {
        return (this.altAndOuterContextDepth & SUPPRESS_PRECEDENCE_FILTER) !== 0;
    }
    set isPrecedenceFilterSuppressed(value) {
        if (value) {
            this.altAndOuterContextDepth |= SUPPRESS_PRECEDENCE_FILTER;
        }
        else {
            this.altAndOuterContextDepth &= ~SUPPRESS_PRECEDENCE_FILTER;
        }
    }
    /** An ATN configuration is equal to another if both have
     *  the same state, they predict the same alternative, and
     *  syntactic/semantic contexts are the same.
     */
    equals(o) {
        if (this === o) {
            return true;
        }
        else if (!(o instanceof ATNConfig)) {
            return false;
        }
        return this.state.stateNumber == o.state.stateNumber
            && this.alt == o.alt
            && this.reachesIntoOuterContext == o.reachesIntoOuterContext
            && this.context.equals(o.context)
            && this.semanticContext.equals(o.semanticContext)
            && this.isPrecedenceFilterSuppressed == o.isPrecedenceFilterSuppressed
            && this.hasPassedThroughNonGreedyDecision == o.hasPassedThroughNonGreedyDecision
            && ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE.equals(this.lexerActionExecutor, o.lexerActionExecutor);
    }
    hashCode() {
        let hashCode = MurmurHash_1.MurmurHash.initialize(7);
        hashCode = MurmurHash_1.MurmurHash.update(hashCode, this.state.stateNumber);
        hashCode = MurmurHash_1.MurmurHash.update(hashCode, this.alt);
        hashCode = MurmurHash_1.MurmurHash.update(hashCode, this.reachesIntoOuterContext ? 1 : 0);
        hashCode = MurmurHash_1.MurmurHash.update(hashCode, this.context);
        hashCode = MurmurHash_1.MurmurHash.update(hashCode, this.semanticContext);
        hashCode = MurmurHash_1.MurmurHash.update(hashCode, this.hasPassedThroughNonGreedyDecision ? 1 : 0);
        hashCode = MurmurHash_1.MurmurHash.update(hashCode, this.lexerActionExecutor);
        hashCode = MurmurHash_1.MurmurHash.finish(hashCode, 7);
        return hashCode;
    }
    /**
     * Returns a graphical representation of the current `ATNConfig` in Graphviz format. The graph can be stored to a
     * **.dot** file and then rendered to an image using Graphviz.
     *
     * @return A Graphviz graph representing the current `ATNConfig`.
     *
     * @see http://www.graphviz.org/
     */
    toDotString() {
        let builder = "";
        builder += ("digraph G {\n");
        builder += ("rankdir=LR;\n");
        let visited = new Array2DHashMap_1.Array2DHashMap(PredictionContext_1.PredictionContext.IdentityEqualityComparator.INSTANCE);
        let workList = [];
        function getOrAddContext(context) {
            let newNumber = visited.size;
            let result = visited.putIfAbsent(context, newNumber);
            if (result != null) {
                // Already saw this context
                return result;
            }
            workList.push(context);
            return newNumber;
        }
        workList.push(this.context);
        visited.put(this.context, 0);
        while (true) {
            let current = workList.pop();
            if (!current) {
                break;
            }
            for (let i = 0; i < current.size; i++) {
                builder += ("  s") + (getOrAddContext(current));
                builder += ("->");
                builder += ("s") + (getOrAddContext(current.getParent(i)));
                builder += ("[label=\"") + (current.getReturnState(i)) + ("\"];\n");
            }
        }
        builder += ("}\n");
        return builder.toString();
    }
    toString(recog, showAlt, showContext) {
        // Must check showContext before showAlt to preserve original overload behavior
        if (showContext == null) {
            showContext = showAlt != null;
        }
        if (showAlt == null) {
            showAlt = true;
        }
        let buf = "";
        // if (this.state.ruleIndex >= 0) {
        // 	if (recog != null) {
        // 		buf += (recog.ruleNames[this.state.ruleIndex] + ":");
        // 	} else {
        // 		buf += (this.state.ruleIndex + ":");
        // 	}
        // }
        let contexts;
        if (showContext) {
            contexts = this.context.toStrings(recog, this.state.stateNumber);
        }
        else {
            contexts = ["?"];
        }
        let first = true;
        for (let contextDesc of contexts) {
            if (first) {
                first = false;
            }
            else {
                buf += (", ");
            }
            buf += ('(');
            buf += (this.state);
            if (showAlt) {
                buf += (",");
                buf += (this.alt);
            }
            if (this.context) {
                buf += (",");
                buf += (contextDesc);
            }
            if (this.semanticContext !== SemanticContext_1.SemanticContext.NONE) {
                buf += (",");
                buf += (this.semanticContext);
            }
            if (this.reachesIntoOuterContext) {
                buf += (",up=") + (this.outerContextDepth);
            }
            buf += (')');
        }
        return buf.toString();
    }
};
__decorate([
    Decorators_1.NotNull
], ATNConfig.prototype, "_state", void 0);
__decorate([
    Decorators_1.NotNull
], ATNConfig.prototype, "_context", void 0);
__decorate([
    Decorators_1.NotNull
], ATNConfig.prototype, "state", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], ATNConfig.prototype, "context", null);
__decorate([
    Decorators_1.NotNull
], ATNConfig.prototype, "semanticContext", null);
__decorate([
    Decorators_1.Override
], ATNConfig.prototype, "clone", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(2, Decorators_1.NotNull)
], ATNConfig.prototype, "transformImpl", null);
__decorate([
    Decorators_1.Override
], ATNConfig.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], ATNConfig.prototype, "hashCode", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(3, Decorators_1.NotNull)
], ATNConfig, "create", null);
ATNConfig = __decorate([
    __param(0, Decorators_1.NotNull), __param(2, Decorators_1.NotNull)
], ATNConfig);
exports.ATNConfig = ATNConfig;
/**
 * This class was derived from `ATNConfig` purely as a memory optimization. It allows for the creation of an `ATNConfig`
 * with a non-default semantic context.
 *
 * See the `ATNConfig` documentation for more information about conserving memory through the use of several concrete
 * types.
 */
let SemanticContextATNConfig = class SemanticContextATNConfig extends ATNConfig {
    constructor(semanticContext, state, altOrConfig, context) {
        if (typeof altOrConfig === 'number') {
            super(state, altOrConfig, context);
        }
        else {
            super(state, altOrConfig, context);
        }
        this._semanticContext = semanticContext;
    }
    get semanticContext() {
        return this._semanticContext;
    }
};
__decorate([
    Decorators_1.NotNull
], SemanticContextATNConfig.prototype, "_semanticContext", void 0);
__decorate([
    Decorators_1.Override
], SemanticContextATNConfig.prototype, "semanticContext", null);
SemanticContextATNConfig = __decorate([
    __param(1, Decorators_1.NotNull), __param(2, Decorators_1.NotNull)
], SemanticContextATNConfig);
/**
 * This class was derived from `ATNConfig` purely as a memory optimization. It allows for the creation of an `ATNConfig`
 * with a lexer action.
 *
 * See the `ATNConfig` documentation for more information about conserving memory through the use of several concrete
 * types.
 */
let ActionATNConfig = class ActionATNConfig extends ATNConfig {
    constructor(lexerActionExecutor, state, altOrConfig, context, passedThroughNonGreedyDecision) {
        if (typeof altOrConfig === 'number') {
            super(state, altOrConfig, context);
        }
        else {
            super(state, altOrConfig, context);
            if (altOrConfig.semanticContext !== SemanticContext_1.SemanticContext.NONE) {
                throw new Error("Not supported");
            }
        }
        this._lexerActionExecutor = lexerActionExecutor;
        this.passedThroughNonGreedyDecision = passedThroughNonGreedyDecision;
    }
    get lexerActionExecutor() {
        return this._lexerActionExecutor;
    }
    get hasPassedThroughNonGreedyDecision() {
        return this.passedThroughNonGreedyDecision;
    }
};
__decorate([
    Decorators_1.Override
], ActionATNConfig.prototype, "lexerActionExecutor", null);
__decorate([
    Decorators_1.Override
], ActionATNConfig.prototype, "hasPassedThroughNonGreedyDecision", null);
ActionATNConfig = __decorate([
    __param(1, Decorators_1.NotNull), __param(2, Decorators_1.NotNull)
], ActionATNConfig);
/**
 * This class was derived from `SemanticContextATNConfig` purely as a memory optimization. It allows for the creation of
 * an `ATNConfig` with both a lexer action and a non-default semantic context.
 *
 * See the `ATNConfig` documentation for more information about conserving memory through the use of several concrete
 * types.
 */
let ActionSemanticContextATNConfig = class ActionSemanticContextATNConfig extends SemanticContextATNConfig {
    constructor(lexerActionExecutor, semanticContext, state, altOrConfig, context, passedThroughNonGreedyDecision) {
        if (typeof altOrConfig === 'number') {
            super(semanticContext, state, altOrConfig, context);
        }
        else {
            super(semanticContext, state, altOrConfig, context);
        }
        this._lexerActionExecutor = lexerActionExecutor;
        this.passedThroughNonGreedyDecision = passedThroughNonGreedyDecision;
    }
    get lexerActionExecutor() {
        return this._lexerActionExecutor;
    }
    get hasPassedThroughNonGreedyDecision() {
        return this.passedThroughNonGreedyDecision;
    }
};
__decorate([
    Decorators_1.Override
], ActionSemanticContextATNConfig.prototype, "lexerActionExecutor", null);
__decorate([
    Decorators_1.Override
], ActionSemanticContextATNConfig.prototype, "hasPassedThroughNonGreedyDecision", null);
ActionSemanticContextATNConfig = __decorate([
    __param(1, Decorators_1.NotNull), __param(2, Decorators_1.NotNull)
], ActionSemanticContextATNConfig);

},{"../Decorators":16,"../misc/Array2DHashMap":103,"../misc/MurmurHash":113,"../misc/ObjectEqualityComparator":114,"./DecisionState":58,"./PredictionContext":81,"./SemanticContext":88,"assert":127}],45:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:25.5488013-07:00
const Array2DHashMap_1 = require("../misc/Array2DHashMap");
const Array2DHashSet_1 = require("../misc/Array2DHashSet");
const ArrayEqualityComparator_1 = require("../misc/ArrayEqualityComparator");
const ATN_1 = require("./ATN");
const ATNConfig_1 = require("./ATNConfig");
const BitSet_1 = require("../misc/BitSet");
const Stubs_1 = require("../misc/Stubs");
const Decorators_1 = require("../Decorators");
const ObjectEqualityComparator_1 = require("../misc/ObjectEqualityComparator");
const PredictionContext_1 = require("./PredictionContext");
const PredictionContextCache_1 = require("./PredictionContextCache");
const SemanticContext_1 = require("./SemanticContext");
const assert = require("assert");
const Utils = require("../misc/Utils");
class KeyTypeEqualityComparer {
    hashCode(key) {
        return key.state ^ key.alt;
    }
    equals(a, b) {
        return a.state === b.state && a.alt === b.alt;
    }
}
KeyTypeEqualityComparer.INSTANCE = new KeyTypeEqualityComparer();
function NewKeyedConfigMap(map) {
    if (map) {
        return new Array2DHashMap_1.Array2DHashMap(map);
    }
    else {
        return new Array2DHashMap_1.Array2DHashMap(KeyTypeEqualityComparer.INSTANCE);
    }
}
/**
 * Represents a set of ATN configurations (see `ATNConfig`). As configurations are added to the set, they are merged
 * with other `ATNConfig` instances already in the set when possible using the graph-structured stack.
 *
 * An instance of this class represents the complete set of positions (with context) in an ATN which would be associated
 * with a single DFA state. Its internal representation is more complex than traditional state used for NFA to DFA
 * conversion due to performance requirements (both improving speed and reducing memory overhead) as well as supporting
 * features such as semantic predicates and non-greedy operators in a form to support ANTLR's prediction algorithm.
 *
 * @author Sam Harwell
 */
class ATNConfigSet {
    constructor(set, readonly) {
        this._uniqueAlt = 0;
        // Used in parser and lexer. In lexer, it indicates we hit a pred
        // while computing a closure operation.  Don't make a DFA state from this.
        this._hasSemanticContext = false;
        this._dipsIntoOuterContext = false;
        /**
         * When {@code true}, this config set represents configurations where the entire
         * outer context has been consumed by the ATN interpreter. This prevents the
         * {@link ParserATNSimulator#closure} from pursuing the global FOLLOW when a
         * rule stop state is reached with an empty prediction context.
         * <p>
         * Note: {@code outermostConfigSet} and {@link #dipsIntoOuterContext} should never
         * be true at the same time.
         */
        this.outermostConfigSet = false;
        this.cachedHashCode = -1;
        if (!set) {
            this.mergedConfigs = NewKeyedConfigMap();
            this.unmerged = [];
            this.configs = [];
            this._uniqueAlt = ATN_1.ATN.INVALID_ALT_NUMBER;
        }
        else {
            if (readonly) {
                this.mergedConfigs = undefined;
                this.unmerged = undefined;
            }
            else if (!set.isReadOnly) {
                this.mergedConfigs = NewKeyedConfigMap(set.mergedConfigs);
                this.unmerged = set.unmerged.slice(0);
            }
            else {
                this.mergedConfigs = NewKeyedConfigMap();
                this.unmerged = [];
            }
            this.configs = set.configs.slice(0);
            this._dipsIntoOuterContext = set._dipsIntoOuterContext;
            this._hasSemanticContext = set._hasSemanticContext;
            this.outermostConfigSet = set.outermostConfigSet;
            if (readonly || !set.isReadOnly) {
                this._uniqueAlt = set._uniqueAlt;
                this._conflictInfo = set._conflictInfo;
            }
            // if (!readonly && set.isReadOnly) -> addAll is called from clone()
        }
    }
    /**
     * Get the set of all alternatives represented by configurations in this
     * set.
     */
    getRepresentedAlternatives() {
        if (this._conflictInfo != null) {
            return this._conflictInfo.conflictedAlts.clone();
        }
        let alts = new BitSet_1.BitSet();
        for (let config of Stubs_1.asIterable(this)) {
            alts.set(config.alt);
        }
        return alts;
    }
    get isReadOnly() {
        return this.mergedConfigs == null;
    }
    get isOutermostConfigSet() {
        return this.outermostConfigSet;
    }
    set isOutermostConfigSet(outermostConfigSet) {
        if (this.outermostConfigSet && !outermostConfigSet) {
            throw new Error("IllegalStateException");
        }
        assert(!outermostConfigSet || !this._dipsIntoOuterContext);
        this.outermostConfigSet = outermostConfigSet;
    }
    getStates() {
        let states = new Array2DHashSet_1.Array2DHashSet(ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE);
        for (let c of this.configs) {
            states.add(c.state);
        }
        return states;
    }
    optimizeConfigs(interpreter) {
        if (this.configs.length === 0) {
            return;
        }
        for (let i = 0; i < this.configs.length; i++) {
            let config = this.configs[i];
            config.context = interpreter.atn.getCachedContext(config.context);
        }
    }
    clone(readonly) {
        let copy = new ATNConfigSet(this, readonly);
        if (!readonly && this.isReadOnly) {
            copy.addAll(this.configs);
        }
        return copy;
    }
    get size() {
        return this.configs.length;
    }
    get isEmpty() {
        return this.configs.length === 0;
    }
    contains(o) {
        if (!(o instanceof ATNConfig_1.ATNConfig)) {
            return false;
        }
        if (this.mergedConfigs && this.unmerged) {
            let config = o;
            let configKey = this.getKey(config);
            let mergedConfig = this.mergedConfigs.get(configKey);
            if (mergedConfig != null && this.canMerge(config, configKey, mergedConfig)) {
                return mergedConfig.contains(config);
            }
            for (let c of this.unmerged) {
                if (c.contains(o)) {
                    return true;
                }
            }
        }
        else {
            for (let c of this.configs) {
                if (c.contains(o)) {
                    return true;
                }
            }
        }
        return false;
    }
    iterator() {
        return new ATNConfigSetIterator(this, this.configs);
    }
    toArray(a) {
        if (!a || a.length < this.configs.length) {
            return this.configs;
        }
        for (let i = 0; i < this.configs.length; i++) {
            a[i] = this.configs[i];
        }
        return a;
    }
    add(e, contextCache) {
        this.ensureWritable();
        if (!this.mergedConfigs || !this.unmerged) {
            throw new Error("Covered by ensureWritable but duplicated here for strict null check limitation");
        }
        assert(!this.outermostConfigSet || !e.reachesIntoOuterContext);
        if (contextCache == null) {
            contextCache = PredictionContextCache_1.PredictionContextCache.UNCACHED;
        }
        let addKey;
        let key = this.getKey(e);
        let mergedConfig = this.mergedConfigs.get(key);
        addKey = (mergedConfig == null);
        if (mergedConfig != null && this.canMerge(e, key, mergedConfig)) {
            mergedConfig.outerContextDepth = Math.max(mergedConfig.outerContextDepth, e.outerContextDepth);
            if (e.isPrecedenceFilterSuppressed) {
                mergedConfig.isPrecedenceFilterSuppressed = true;
            }
            let joined = PredictionContext_1.PredictionContext.join(mergedConfig.context, e.context, contextCache);
            this.updatePropertiesForMergedConfig(e);
            if (mergedConfig.context == joined) {
                return false;
            }
            mergedConfig.context = joined;
            return true;
        }
        for (let i = 0; i < this.unmerged.length; i++) {
            let unmergedConfig = this.unmerged[i];
            if (this.canMerge(e, key, unmergedConfig)) {
                unmergedConfig.outerContextDepth = Math.max(unmergedConfig.outerContextDepth, e.outerContextDepth);
                if (e.isPrecedenceFilterSuppressed) {
                    unmergedConfig.isPrecedenceFilterSuppressed = true;
                }
                let joined = PredictionContext_1.PredictionContext.join(unmergedConfig.context, e.context, contextCache);
                this.updatePropertiesForMergedConfig(e);
                if (unmergedConfig.context == joined) {
                    return false;
                }
                unmergedConfig.context = joined;
                if (addKey) {
                    this.mergedConfigs.put(key, unmergedConfig);
                    this.unmerged.splice(i, 1);
                }
                return true;
            }
        }
        this.configs.push(e);
        if (addKey) {
            this.mergedConfigs.put(key, e);
        }
        else {
            this.unmerged.push(e);
        }
        this.updatePropertiesForAddedConfig(e);
        return true;
    }
    updatePropertiesForMergedConfig(config) {
        // merged configs can't change the alt or semantic context
        this._dipsIntoOuterContext = this._dipsIntoOuterContext || config.reachesIntoOuterContext;
        assert(!this.outermostConfigSet || !this._dipsIntoOuterContext);
    }
    updatePropertiesForAddedConfig(config) {
        if (this.configs.length === 1) {
            this._uniqueAlt = config.alt;
        }
        else if (this._uniqueAlt !== config.alt) {
            this._uniqueAlt = ATN_1.ATN.INVALID_ALT_NUMBER;
        }
        this._hasSemanticContext = this._hasSemanticContext || !SemanticContext_1.SemanticContext.NONE.equals(config.semanticContext);
        this._dipsIntoOuterContext = this._dipsIntoOuterContext || config.reachesIntoOuterContext;
        assert(!this.outermostConfigSet || !this._dipsIntoOuterContext);
    }
    canMerge(left, leftKey, right) {
        if (left.state.stateNumber != right.state.stateNumber) {
            return false;
        }
        if (leftKey.alt !== right.alt) {
            return false;
        }
        return left.semanticContext.equals(right.semanticContext);
    }
    getKey(e) {
        return { state: e.state.stateNumber, alt: e.alt };
    }
    containsAll(c) {
        for (let o of Stubs_1.asIterable(c)) {
            if (!(o instanceof ATNConfig_1.ATNConfig)) {
                return false;
            }
            if (!this.contains(o)) {
                return false;
            }
        }
        return true;
    }
    addAll(c, contextCache) {
        this.ensureWritable();
        let changed = false;
        for (let group of Stubs_1.asIterable(c)) {
            if (this.add(group, contextCache)) {
                changed = true;
            }
        }
        return changed;
    }
    retainAll(c) {
        this.ensureWritable();
        throw new Error("Not supported yet.");
    }
    removeAll(c) {
        this.ensureWritable();
        throw new Error("Not supported yet.");
    }
    clear() {
        this.ensureWritable();
        if (!this.mergedConfigs || !this.unmerged) {
            throw new Error("Covered by ensureWritable but duplicated here for strict null check limitation");
        }
        this.mergedConfigs.clear();
        this.unmerged.length = 0;
        this.configs.length = 0;
        this._dipsIntoOuterContext = false;
        this._hasSemanticContext = false;
        this._uniqueAlt = ATN_1.ATN.INVALID_ALT_NUMBER;
        this._conflictInfo = undefined;
    }
    equals(obj) {
        if (this === obj) {
            return true;
        }
        if (!(obj instanceof ATNConfigSet)) {
            return false;
        }
        return this.outermostConfigSet == obj.outermostConfigSet
            && Utils.equals(this._conflictInfo, obj._conflictInfo)
            && ArrayEqualityComparator_1.ArrayEqualityComparator.INSTANCE.equals(this.configs, obj.configs);
    }
    hashCode() {
        if (this.isReadOnly && this.cachedHashCode != -1) {
            return this.cachedHashCode;
        }
        let hashCode = 1;
        hashCode = 5 * hashCode ^ (this.outermostConfigSet ? 1 : 0);
        hashCode = 5 * hashCode ^ ArrayEqualityComparator_1.ArrayEqualityComparator.INSTANCE.hashCode(this.configs);
        if (this.isReadOnly) {
            this.cachedHashCode = hashCode;
        }
        return hashCode;
    }
    toString(showContext) {
        if (showContext == null) {
            showContext = false;
        }
        let buf = "";
        let sortedConfigs = this.configs.slice(0);
        sortedConfigs.sort((o1, o2) => {
            if (o1.alt != o2.alt) {
                return o1.alt - o2.alt;
            }
            else if (o1.state.stateNumber != o2.state.stateNumber) {
                return o1.state.stateNumber - o2.state.stateNumber;
            }
            else {
                return o1.semanticContext.toString().localeCompare(o2.semanticContext.toString());
            }
        });
        buf += ("[");
        for (let i = 0; i < sortedConfigs.length; i++) {
            if (i > 0) {
                buf += (", ");
            }
            buf += (sortedConfigs[i].toString(undefined, true, showContext));
        }
        buf += ("]");
        if (this._hasSemanticContext)
            buf += (",hasSemanticContext=") + (this._hasSemanticContext);
        if (this._uniqueAlt !== ATN_1.ATN.INVALID_ALT_NUMBER)
            buf += (",uniqueAlt=") + (this._uniqueAlt);
        if (this._conflictInfo != null) {
            buf += (",conflictingAlts=") + (this._conflictInfo.conflictedAlts);
            if (!this._conflictInfo.isExact) {
                buf += ("*");
            }
        }
        if (this._dipsIntoOuterContext)
            buf += (",dipsIntoOuterContext");
        return buf.toString();
    }
    get uniqueAlt() {
        return this._uniqueAlt;
    }
    get hasSemanticContext() {
        return this._hasSemanticContext;
    }
    set hasSemanticContext(value) {
        this.ensureWritable();
        this._hasSemanticContext = value;
    }
    get conflictInfo() {
        return this._conflictInfo;
    }
    set conflictInfo(conflictInfo) {
        this.ensureWritable();
        this._conflictInfo = conflictInfo;
    }
    get conflictingAlts() {
        if (this._conflictInfo == null) {
            return undefined;
        }
        return this._conflictInfo.conflictedAlts;
    }
    get isExactConflict() {
        if (this._conflictInfo == null) {
            return false;
        }
        return this._conflictInfo.isExact;
    }
    get dipsIntoOuterContext() {
        return this._dipsIntoOuterContext;
    }
    get(index) {
        return this.configs[index];
    }
    remove(indexOrItem) {
        this.ensureWritable();
        if (!this.mergedConfigs || !this.unmerged) {
            throw new Error("Covered by ensureWritable but duplicated here for strict null check limitation");
        }
        if (typeof indexOrItem !== 'number') {
            throw new Error("Not supported yet");
        }
        let index = indexOrItem;
        let config = this.configs[index];
        this.configs.splice(index, 1);
        let key = this.getKey(config);
        if (this.mergedConfigs.get(key) === config) {
            this.mergedConfigs.remove(key);
        }
        else {
            for (let i = 0; i < this.unmerged.length; i++) {
                if (this.unmerged[i] === config) {
                    this.unmerged.splice(i, 1);
                    return;
                }
            }
        }
    }
    ensureWritable() {
        if (this.isReadOnly) {
            throw new Error("This ATNConfigSet is read only.");
        }
    }
}
__decorate([
    Decorators_1.NotNull
], ATNConfigSet.prototype, "getRepresentedAlternatives", null);
__decorate([
    Decorators_1.Override
], ATNConfigSet.prototype, "size", null);
__decorate([
    Decorators_1.Override
], ATNConfigSet.prototype, "isEmpty", null);
__decorate([
    Decorators_1.Override
], ATNConfigSet.prototype, "contains", null);
__decorate([
    Decorators_1.Override
], ATNConfigSet.prototype, "iterator", null);
__decorate([
    Decorators_1.Override
], ATNConfigSet.prototype, "toArray", null);
__decorate([
    Decorators_1.Override
], ATNConfigSet.prototype, "containsAll", null);
__decorate([
    Decorators_1.Override
], ATNConfigSet.prototype, "retainAll", null);
__decorate([
    Decorators_1.Override
], ATNConfigSet.prototype, "removeAll", null);
__decorate([
    Decorators_1.Override
], ATNConfigSet.prototype, "clear", null);
__decorate([
    Decorators_1.Override
], ATNConfigSet.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], ATNConfigSet.prototype, "hashCode", null);
exports.ATNConfigSet = ATNConfigSet;
class ATNConfigSetIterator {
    constructor(set, configs) {
        this.index = -1;
        this.removed = false;
        this.configs = configs;
    }
    hasNext() {
        return this.index + 1 < this.configs.length;
    }
    next() {
        if (!this.hasNext()) {
            throw new Error("NoSuchElementException");
        }
        this.index++;
        this.removed = false;
        return this.configs[this.index];
    }
    remove() {
        if (this.removed || this.index < 0 || this.index >= this.configs.length) {
            throw new Error("IllegalStateException");
        }
        this.set.remove(this.index);
        this.removed = true;
    }
}
__decorate([
    Decorators_1.Override
], ATNConfigSetIterator.prototype, "hasNext", null);
__decorate([
    Decorators_1.Override
], ATNConfigSetIterator.prototype, "next", null);
__decorate([
    Decorators_1.Override
], ATNConfigSetIterator.prototype, "remove", null);

},{"../Decorators":16,"../misc/Array2DHashMap":103,"../misc/Array2DHashSet":104,"../misc/ArrayEqualityComparator":105,"../misc/BitSet":107,"../misc/ObjectEqualityComparator":114,"../misc/Stubs":116,"../misc/Utils":118,"./ATN":43,"./ATNConfig":44,"./PredictionContext":81,"./PredictionContextCache":82,"./SemanticContext":88,"assert":127}],46:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:25.8187912-07:00
const Decorators_1 = require("../Decorators");
/**
 *
 * @author Sam Harwell
 */
class ATNDeserializationOptions {
    constructor(options) {
        this.readOnly = false;
        if (options) {
            this.verifyATN = options.verifyATN;
            this.generateRuleBypassTransitions = options.generateRuleBypassTransitions;
            this.optimize = options.optimize;
        }
        else {
            this.verifyATN = true;
            this.generateRuleBypassTransitions = false;
            this.optimize = true;
        }
    }
    static get defaultOptions() {
        if (ATNDeserializationOptions._defaultOptions == null) {
            ATNDeserializationOptions._defaultOptions = new ATNDeserializationOptions();
            ATNDeserializationOptions._defaultOptions.makeReadOnly();
        }
        return ATNDeserializationOptions._defaultOptions;
    }
    get isReadOnly() {
        return this.readOnly;
    }
    makeReadOnly() {
        this.readOnly = true;
    }
    get isVerifyATN() {
        return this.verifyATN;
    }
    set isVerifyATN(verifyATN) {
        this.throwIfReadOnly();
        this.verifyATN = verifyATN;
    }
    get isGenerateRuleBypassTransitions() {
        return this.generateRuleBypassTransitions;
    }
    set isGenerateRuleBypassTransitions(generateRuleBypassTransitions) {
        this.throwIfReadOnly();
        this.generateRuleBypassTransitions = generateRuleBypassTransitions;
    }
    get isOptimize() {
        return this.optimize;
    }
    set isOptimize(optimize) {
        this.throwIfReadOnly();
        this.optimize = optimize;
    }
    throwIfReadOnly() {
        if (this.isReadOnly) {
            throw new Error("The object is read only.");
        }
    }
}
__decorate([
    Decorators_1.NotNull
], ATNDeserializationOptions, "defaultOptions", null);
exports.ATNDeserializationOptions = ATNDeserializationOptions;

},{"../Decorators":16}],47:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:25.9683447-07:00
const ActionTransition_1 = require("./ActionTransition");
const Array2DHashSet_1 = require("../misc/Array2DHashSet");
const ATN_1 = require("./ATN");
const ATNDeserializationOptions_1 = require("./ATNDeserializationOptions");
const AtomTransition_1 = require("./AtomTransition");
const BasicBlockStartState_1 = require("./BasicBlockStartState");
const BasicState_1 = require("./BasicState");
const BitSet_1 = require("../misc/BitSet");
const BlockEndState_1 = require("./BlockEndState");
const BlockStartState_1 = require("./BlockStartState");
const DecisionState_1 = require("./DecisionState");
const DFA_1 = require("../dfa/DFA");
const EpsilonTransition_1 = require("./EpsilonTransition");
const IntervalSet_1 = require("../misc/IntervalSet");
const InvalidState_1 = require("./InvalidState");
const LexerChannelAction_1 = require("./LexerChannelAction");
const LexerCustomAction_1 = require("./LexerCustomAction");
const LexerModeAction_1 = require("./LexerModeAction");
const LexerMoreAction_1 = require("./LexerMoreAction");
const LexerPopModeAction_1 = require("./LexerPopModeAction");
const LexerPushModeAction_1 = require("./LexerPushModeAction");
const LexerSkipAction_1 = require("./LexerSkipAction");
const LexerTypeAction_1 = require("./LexerTypeAction");
const LoopEndState_1 = require("./LoopEndState");
const Decorators_1 = require("../Decorators");
const NotSetTransition_1 = require("./NotSetTransition");
const ParserATNSimulator_1 = require("./ParserATNSimulator");
const PlusBlockStartState_1 = require("./PlusBlockStartState");
const PlusLoopbackState_1 = require("./PlusLoopbackState");
const PrecedencePredicateTransition_1 = require("./PrecedencePredicateTransition");
const PredicateTransition_1 = require("./PredicateTransition");
const RangeTransition_1 = require("./RangeTransition");
const RuleStartState_1 = require("./RuleStartState");
const RuleStopState_1 = require("./RuleStopState");
const RuleTransition_1 = require("./RuleTransition");
const SetTransition_1 = require("./SetTransition");
const StarBlockStartState_1 = require("./StarBlockStartState");
const StarLoopbackState_1 = require("./StarLoopbackState");
const StarLoopEntryState_1 = require("./StarLoopEntryState");
const Token_1 = require("../Token");
const TokensStartState_1 = require("./TokensStartState");
const UUID_1 = require("../misc/UUID");
const WildcardTransition_1 = require("./WildcardTransition");
/**
 *
 * @author Sam Harwell
 */
class ATNDeserializer {
    constructor(deserializationOptions) {
        if (deserializationOptions == null) {
            deserializationOptions = ATNDeserializationOptions_1.ATNDeserializationOptions.defaultOptions;
        }
        this.deserializationOptions = deserializationOptions;
    }
    static get SERIALIZED_VERSION() {
        /* This value should never change. Updates following this version are
         * reflected as change in the unique ID SERIALIZED_UUID.
         */
        return 3;
    }
    /**
     * Determines if a particular serialized representation of an ATN supports
     * a particular feature, identified by the {@link UUID} used for serializing
     * the ATN at the time the feature was first introduced.
     *
     * @param feature The {@link UUID} marking the first time the feature was
     * supported in the serialized ATN.
     * @param actualUuid The {@link UUID} of the actual serialized ATN which is
     * currently being deserialized.
     * @return {@code true} if the {@code actualUuid} value represents a
     * serialized ATN at or after the feature identified by {@code feature} was
     * introduced; otherwise, {@code false}.
     */
    isFeatureSupported(feature, actualUuid) {
        let featureIndex = ATNDeserializer.SUPPORTED_UUIDS.findIndex(e => e.equals(feature));
        if (featureIndex < 0) {
            return false;
        }
        return ATNDeserializer.SUPPORTED_UUIDS.findIndex(e => e.equals(actualUuid)) >= featureIndex;
    }
    deserialize(data) {
        data = data.slice(0);
        // Each Uint16 value in data is shifted by +2 at the entry to this method. This is an encoding optimization
        // targeting the serialized values 0 and -1 (serialized to 0xFFFF), each of which are very common in the
        // serialized form of the ATN. In the modified UTF-8 that Java uses for compiled string literals, these two
        // character values have multi-byte forms. By shifting each value by +2, they become characters 2 and 1 prior to
        // writing the string, each of which have single-byte representations. Since the shift occurs in the tool during
        // ATN serialization, each target is responsible for adjusting the values during deserialization.
        //
        // As a special case, note that the first element of data is not adjusted because it contains the major version
        // number of the serialized ATN, which was fixed at 3 at the time the value shifting was implemented.
        for (let i = 1; i < data.length; i++) {
            data[i] = (data[i] - 2) & 0xFFFF;
        }
        let p = 0;
        let version = ATNDeserializer.toInt(data[p++]);
        if (version != ATNDeserializer.SERIALIZED_VERSION) {
            let reason = `Could not deserialize ATN with version ${version} (expected ${ATNDeserializer.SERIALIZED_VERSION}).`;
            throw new Error(reason);
        }
        let uuid = ATNDeserializer.toUUID(data, p);
        p += 8;
        if (ATNDeserializer.SUPPORTED_UUIDS.findIndex(e => e.equals(uuid)) < 0) {
            let reason = `Could not deserialize ATN with UUID ${uuid} (expected ${ATNDeserializer.SERIALIZED_UUID} or a legacy UUID).`;
            throw new Error(reason);
        }
        let supportsLexerActions = this.isFeatureSupported(ATNDeserializer.ADDED_LEXER_ACTIONS, uuid);
        let grammarType = ATNDeserializer.toInt(data[p++]);
        let maxTokenType = ATNDeserializer.toInt(data[p++]);
        let atn = new ATN_1.ATN(grammarType, maxTokenType);
        //
        // STATES
        //
        let loopBackStateNumbers = [];
        let endStateNumbers = [];
        let nstates = ATNDeserializer.toInt(data[p++]);
        for (let i = 0; i < nstates; i++) {
            let stype = ATNDeserializer.toInt(data[p++]);
            // ignore bad type of states
            if (stype === 0 /* INVALID_TYPE */) {
                atn.addState(new InvalidState_1.InvalidState());
                continue;
            }
            let ruleIndex = ATNDeserializer.toInt(data[p++]);
            if (ruleIndex === 0xFFFF) {
                ruleIndex = -1;
            }
            let s = this.stateFactory(stype, ruleIndex);
            if (stype === 12 /* LOOP_END */) {
                let loopBackStateNumber = ATNDeserializer.toInt(data[p++]);
                loopBackStateNumbers.push([s, loopBackStateNumber]);
            }
            else if (s instanceof BlockStartState_1.BlockStartState) {
                let endStateNumber = ATNDeserializer.toInt(data[p++]);
                endStateNumbers.push([s, endStateNumber]);
            }
            atn.addState(s);
        }
        // delay the assignment of loop back and end states until we know all the state instances have been initialized
        for (let pair of loopBackStateNumbers) {
            pair[0].loopBackState = atn.states[pair[1]];
        }
        for (let pair of endStateNumbers) {
            pair[0].endState = atn.states[pair[1]];
        }
        let numNonGreedyStates = ATNDeserializer.toInt(data[p++]);
        for (let i = 0; i < numNonGreedyStates; i++) {
            let stateNumber = ATNDeserializer.toInt(data[p++]);
            atn.states[stateNumber].nonGreedy = true;
        }
        let numSllDecisions = ATNDeserializer.toInt(data[p++]);
        for (let i = 0; i < numSllDecisions; i++) {
            let stateNumber = ATNDeserializer.toInt(data[p++]);
            atn.states[stateNumber].sll = true;
        }
        let numPrecedenceStates = ATNDeserializer.toInt(data[p++]);
        for (let i = 0; i < numPrecedenceStates; i++) {
            let stateNumber = ATNDeserializer.toInt(data[p++]);
            atn.states[stateNumber].isPrecedenceRule = true;
        }
        //
        // RULES
        //
        let nrules = ATNDeserializer.toInt(data[p++]);
        if (atn.grammarType === 0 /* LEXER */) {
            atn.ruleToTokenType = new Int32Array(nrules);
        }
        atn.ruleToStartState = new Array(nrules);
        for (let i = 0; i < nrules; i++) {
            let s = ATNDeserializer.toInt(data[p++]);
            let startState = atn.states[s];
            startState.leftFactored = ATNDeserializer.toInt(data[p++]) != 0;
            atn.ruleToStartState[i] = startState;
            if (atn.grammarType === 0 /* LEXER */) {
                let tokenType = ATNDeserializer.toInt(data[p++]);
                if (tokenType === 0xFFFF) {
                    tokenType = Token_1.Token.EOF;
                }
                atn.ruleToTokenType[i] = tokenType;
                if (!this.isFeatureSupported(ATNDeserializer.ADDED_LEXER_ACTIONS, uuid)) {
                    // this piece of unused metadata was serialized prior to the
                    // addition of LexerAction
                    let actionIndexIgnored = ATNDeserializer.toInt(data[p++]);
                    if (actionIndexIgnored === 0xFFFF) {
                        actionIndexIgnored = -1;
                    }
                }
            }
        }
        atn.ruleToStopState = new Array(nrules);
        for (let state of atn.states) {
            if (!(state instanceof RuleStopState_1.RuleStopState)) {
                continue;
            }
            atn.ruleToStopState[state.ruleIndex] = state;
            atn.ruleToStartState[state.ruleIndex].stopState = state;
        }
        //
        // MODES
        //
        let nmodes = ATNDeserializer.toInt(data[p++]);
        for (let i = 0; i < nmodes; i++) {
            let s = ATNDeserializer.toInt(data[p++]);
            atn.modeToStartState.push(atn.states[s]);
        }
        atn.modeToDFA = new Array(nmodes);
        for (let i = 0; i < nmodes; i++) {
            atn.modeToDFA[i] = new DFA_1.DFA(atn.modeToStartState[i]);
        }
        //
        // SETS
        //
        let sets = [];
        p = this.readSets(data, p, sets, false);
        // Next, if the ATN was serialized with the Unicode SMP feature,
        // deserialize sets with 32-bit arguments <= U+10FFFF.
        if (this.isFeatureSupported(ATNDeserializer.ADDED_UNICODE_SMP, uuid)) {
            p = this.readSets(data, p, sets, true);
        }
        //
        // EDGES
        //
        let nedges = ATNDeserializer.toInt(data[p++]);
        for (let i = 0; i < nedges; i++) {
            let src = ATNDeserializer.toInt(data[p]);
            let trg = ATNDeserializer.toInt(data[p + 1]);
            let ttype = ATNDeserializer.toInt(data[p + 2]);
            let arg1 = ATNDeserializer.toInt(data[p + 3]);
            let arg2 = ATNDeserializer.toInt(data[p + 4]);
            let arg3 = ATNDeserializer.toInt(data[p + 5]);
            let trans = this.edgeFactory(atn, ttype, src, trg, arg1, arg2, arg3, sets);
            // console.log(`EDGE ${trans.constructor.name} ${src}->${trg} ${Transition.serializationNames[ttype]} ${arg1},${arg2},${arg3}`);
            let srcState = atn.states[src];
            srcState.addTransition(trans);
            p += 6;
        }
        let returnTransitionsSet = new Array2DHashSet_1.Array2DHashSet({
            hashCode: (o) => o.stopState ^ o.returnState ^ o.outermostPrecedenceReturn,
            equals: function (a, b) {
                return a.stopState === b.stopState
                    && a.returnState === b.returnState
                    && a.outermostPrecedenceReturn === b.outermostPrecedenceReturn;
            }
        });
        let returnTransitions = [];
        for (let state of atn.states) {
            let returningToLeftFactored = state.ruleIndex >= 0 && atn.ruleToStartState[state.ruleIndex].leftFactored;
            for (let i = 0; i < state.numberOfTransitions; i++) {
                let t = state.transition(i);
                if (!(t instanceof RuleTransition_1.RuleTransition)) {
                    continue;
                }
                let ruleTransition = t;
                let returningFromLeftFactored = atn.ruleToStartState[ruleTransition.target.ruleIndex].leftFactored;
                if (!returningFromLeftFactored && returningToLeftFactored) {
                    continue;
                }
                let outermostPrecedenceReturn = -1;
                if (atn.ruleToStartState[ruleTransition.target.ruleIndex].isPrecedenceRule) {
                    if (ruleTransition.precedence === 0) {
                        outermostPrecedenceReturn = ruleTransition.target.ruleIndex;
                    }
                }
                let current = { stopState: ruleTransition.target.ruleIndex, returnState: ruleTransition.followState.stateNumber, outermostPrecedenceReturn: outermostPrecedenceReturn };
                if (returnTransitionsSet.add(current)) {
                    returnTransitions.push(current);
                }
            }
        }
        // Add all elements from returnTransitions to the ATN
        for (let returnTransition of returnTransitions) {
            let transition = new EpsilonTransition_1.EpsilonTransition(atn.states[returnTransition.returnState], returnTransition.outermostPrecedenceReturn);
            atn.ruleToStopState[returnTransition.stopState].addTransition(transition);
        }
        for (let state of atn.states) {
            if (state instanceof BlockStartState_1.BlockStartState) {
                // we need to know the end state to set its start state
                if (state.endState == null) {
                    throw new Error("IllegalStateException");
                }
                // block end states can only be associated to a single block start state
                if (state.endState.startState != null) {
                    throw new Error("IllegalStateException");
                }
                state.endState.startState = state;
            }
            if (state instanceof PlusLoopbackState_1.PlusLoopbackState) {
                let loopbackState = state;
                for (let i = 0; i < loopbackState.numberOfTransitions; i++) {
                    let target = loopbackState.transition(i).target;
                    if (target instanceof PlusBlockStartState_1.PlusBlockStartState) {
                        target.loopBackState = loopbackState;
                    }
                }
            }
            else if (state instanceof StarLoopbackState_1.StarLoopbackState) {
                let loopbackState = state;
                for (let i = 0; i < loopbackState.numberOfTransitions; i++) {
                    let target = loopbackState.transition(i).target;
                    if (target instanceof StarLoopEntryState_1.StarLoopEntryState) {
                        target.loopBackState = loopbackState;
                    }
                }
            }
        }
        //
        // DECISIONS
        //
        let ndecisions = ATNDeserializer.toInt(data[p++]);
        for (let i = 1; i <= ndecisions; i++) {
            let s = ATNDeserializer.toInt(data[p++]);
            let decState = atn.states[s];
            atn.decisionToState.push(decState);
            decState.decision = i - 1;
        }
        //
        // LEXER ACTIONS
        //
        if (atn.grammarType === 0 /* LEXER */) {
            if (supportsLexerActions) {
                atn.lexerActions = new Array(ATNDeserializer.toInt(data[p++]));
                for (let i = 0; i < atn.lexerActions.length; i++) {
                    let actionType = ATNDeserializer.toInt(data[p++]);
                    let data1 = ATNDeserializer.toInt(data[p++]);
                    if (data1 == 0xFFFF) {
                        data1 = -1;
                    }
                    let data2 = ATNDeserializer.toInt(data[p++]);
                    if (data2 == 0xFFFF) {
                        data2 = -1;
                    }
                    let lexerAction = this.lexerActionFactory(actionType, data1, data2);
                    atn.lexerActions[i] = lexerAction;
                }
            }
            else {
                // for compatibility with older serialized ATNs, convert the old
                // serialized action index for action transitions to the new
                // form, which is the index of a LexerCustomAction
                let legacyLexerActions = [];
                for (let state of atn.states) {
                    for (let i = 0; i < state.numberOfTransitions; i++) {
                        let transition = state.transition(i);
                        if (!(transition instanceof ActionTransition_1.ActionTransition)) {
                            continue;
                        }
                        let ruleIndex = transition.ruleIndex;
                        let actionIndex = transition.actionIndex;
                        let lexerAction = new LexerCustomAction_1.LexerCustomAction(ruleIndex, actionIndex);
                        state.setTransition(i, new ActionTransition_1.ActionTransition(transition.target, ruleIndex, legacyLexerActions.length, false));
                        legacyLexerActions.push(lexerAction);
                    }
                }
                atn.lexerActions = legacyLexerActions;
            }
        }
        this.markPrecedenceDecisions(atn);
        atn.decisionToDFA = new Array(ndecisions);
        for (let i = 0; i < ndecisions; i++) {
            atn.decisionToDFA[i] = new DFA_1.DFA(atn.decisionToState[i], i);
        }
        if (this.deserializationOptions.isVerifyATN) {
            this.verifyATN(atn);
        }
        if (this.deserializationOptions.isGenerateRuleBypassTransitions && atn.grammarType === 1 /* PARSER */) {
            atn.ruleToTokenType = new Int32Array(atn.ruleToStartState.length);
            for (let i = 0; i < atn.ruleToStartState.length; i++) {
                atn.ruleToTokenType[i] = atn.maxTokenType + i + 1;
            }
            for (let i = 0; i < atn.ruleToStartState.length; i++) {
                let bypassStart = new BasicBlockStartState_1.BasicBlockStartState();
                bypassStart.ruleIndex = i;
                atn.addState(bypassStart);
                let bypassStop = new BlockEndState_1.BlockEndState();
                bypassStop.ruleIndex = i;
                atn.addState(bypassStop);
                bypassStart.endState = bypassStop;
                atn.defineDecisionState(bypassStart);
                bypassStop.startState = bypassStart;
                let endState;
                let excludeTransition;
                if (atn.ruleToStartState[i].isPrecedenceRule) {
                    // wrap from the beginning of the rule to the StarLoopEntryState
                    endState = undefined;
                    for (let state of atn.states) {
                        if (state.ruleIndex !== i) {
                            continue;
                        }
                        if (!(state instanceof StarLoopEntryState_1.StarLoopEntryState)) {
                            continue;
                        }
                        let maybeLoopEndState = state.transition(state.numberOfTransitions - 1).target;
                        if (!(maybeLoopEndState instanceof LoopEndState_1.LoopEndState)) {
                            continue;
                        }
                        if (maybeLoopEndState.epsilonOnlyTransitions && maybeLoopEndState.transition(0).target instanceof RuleStopState_1.RuleStopState) {
                            endState = state;
                            break;
                        }
                    }
                    if (!endState) {
                        throw new Error("Couldn't identify final state of the precedence rule prefix section.");
                    }
                    excludeTransition = endState.loopBackState.transition(0);
                }
                else {
                    endState = atn.ruleToStopState[i];
                }
                // all non-excluded transitions that currently target end state need to target blockEnd instead
                for (let state of atn.states) {
                    for (let i = 0; i < state.numberOfTransitions; i++) {
                        let transition = state.transition(i);
                        if (transition === excludeTransition) {
                            continue;
                        }
                        if (transition.target === endState) {
                            transition.target = bypassStop;
                        }
                    }
                }
                // all transitions leaving the rule start state need to leave blockStart instead
                while (atn.ruleToStartState[i].numberOfTransitions > 0) {
                    let transition = atn.ruleToStartState[i].removeTransition(atn.ruleToStartState[i].numberOfTransitions - 1);
                    bypassStart.addTransition(transition);
                }
                // link the new states
                atn.ruleToStartState[i].addTransition(new EpsilonTransition_1.EpsilonTransition(bypassStart));
                bypassStop.addTransition(new EpsilonTransition_1.EpsilonTransition(endState));
                let matchState = new BasicState_1.BasicState();
                atn.addState(matchState);
                matchState.addTransition(new AtomTransition_1.AtomTransition(bypassStop, atn.ruleToTokenType[i]));
                bypassStart.addTransition(new EpsilonTransition_1.EpsilonTransition(matchState));
            }
            if (this.deserializationOptions.isVerifyATN) {
                // reverify after modification
                this.verifyATN(atn);
            }
        }
        if (this.deserializationOptions.isOptimize) {
            while (true) {
                let optimizationCount = 0;
                optimizationCount += ATNDeserializer.inlineSetRules(atn);
                optimizationCount += ATNDeserializer.combineChainedEpsilons(atn);
                let preserveOrder = atn.grammarType === 0 /* LEXER */;
                optimizationCount += ATNDeserializer.optimizeSets(atn, preserveOrder);
                if (optimizationCount === 0) {
                    break;
                }
            }
            if (this.deserializationOptions.isVerifyATN) {
                // reverify after modification
                this.verifyATN(atn);
            }
        }
        ATNDeserializer.identifyTailCalls(atn);
        return atn;
    }
    readSets(data, p, sets, read32) {
        let nsets = ATNDeserializer.toInt(data[p++]);
        for (let i = 0; i < nsets; i++) {
            let nintervals = ATNDeserializer.toInt(data[p]);
            p++;
            let set = new IntervalSet_1.IntervalSet();
            sets.push(set);
            let containsEof = ATNDeserializer.toInt(data[p++]) != 0;
            if (containsEof) {
                set.add(-1);
            }
            if (read32) {
                for (let j = 0; j < nintervals; j++) {
                    set.add(ATNDeserializer.toInt32(data, p), ATNDeserializer.toInt32(data, p + 2));
                    p += 4;
                }
            }
            else {
                for (let j = 0; j < nintervals; j++) {
                    set.add(ATNDeserializer.toInt(data[p]), ATNDeserializer.toInt(data[p + 1]));
                    p += 2;
                }
            }
        }
        return p;
    }
    /**
     * Analyze the {@link StarLoopEntryState} states in the specified ATN to set
     * the {@link StarLoopEntryState#precedenceRuleDecision} field to the
     * correct value.
     *
     * @param atn The ATN.
     */
    markPrecedenceDecisions(atn) {
        // Map rule index -> precedence decision for that rule
        let rulePrecedenceDecisions = new Map();
        for (let state of atn.states) {
            if (!(state instanceof StarLoopEntryState_1.StarLoopEntryState)) {
                continue;
            }
            /* We analyze the ATN to determine if this ATN decision state is the
             * decision for the closure block that determines whether a
             * precedence rule should continue or complete.
             */
            if (atn.ruleToStartState[state.ruleIndex].isPrecedenceRule) {
                let maybeLoopEndState = state.transition(state.numberOfTransitions - 1).target;
                if (maybeLoopEndState instanceof LoopEndState_1.LoopEndState) {
                    if (maybeLoopEndState.epsilonOnlyTransitions && maybeLoopEndState.transition(0).target instanceof RuleStopState_1.RuleStopState) {
                        rulePrecedenceDecisions.set(state.ruleIndex, state);
                        state.precedenceRuleDecision = true;
                        state.precedenceLoopbackStates = new BitSet_1.BitSet(atn.states.length);
                    }
                }
            }
        }
        // After marking precedence decisions, we go back through and fill in
        // StarLoopEntryState.precedenceLoopbackStates.
        for (let precedenceDecision of rulePrecedenceDecisions) {
            for (let transition of atn.ruleToStopState[precedenceDecision[0]].getTransitions()) {
                if (transition.serializationType !== 1 /* EPSILON */) {
                    continue;
                }
                let epsilonTransition = transition;
                if (epsilonTransition.outermostPrecedenceReturn !== -1) {
                    continue;
                }
                precedenceDecision[1].precedenceLoopbackStates.set(transition.target.stateNumber);
            }
        }
    }
    verifyATN(atn) {
        // verify assumptions
        for (let state of atn.states) {
            this.checkCondition(state != null, "ATN states should not be null.");
            if (state.stateType === 0 /* INVALID_TYPE */) {
                continue;
            }
            this.checkCondition(state.onlyHasEpsilonTransitions || state.numberOfTransitions <= 1);
            if (state instanceof PlusBlockStartState_1.PlusBlockStartState) {
                this.checkCondition(state.loopBackState != null);
            }
            if (state instanceof StarLoopEntryState_1.StarLoopEntryState) {
                let starLoopEntryState = state;
                this.checkCondition(starLoopEntryState.loopBackState != null);
                this.checkCondition(starLoopEntryState.numberOfTransitions === 2);
                if (starLoopEntryState.transition(0).target instanceof StarBlockStartState_1.StarBlockStartState) {
                    this.checkCondition(starLoopEntryState.transition(1).target instanceof LoopEndState_1.LoopEndState);
                    this.checkCondition(!starLoopEntryState.nonGreedy);
                }
                else if (starLoopEntryState.transition(0).target instanceof LoopEndState_1.LoopEndState) {
                    this.checkCondition(starLoopEntryState.transition(1).target instanceof StarBlockStartState_1.StarBlockStartState);
                    this.checkCondition(starLoopEntryState.nonGreedy);
                }
                else {
                    throw new Error("IllegalStateException");
                }
            }
            if (state instanceof StarLoopbackState_1.StarLoopbackState) {
                this.checkCondition(state.numberOfTransitions === 1);
                this.checkCondition(state.transition(0).target instanceof StarLoopEntryState_1.StarLoopEntryState);
            }
            if (state instanceof LoopEndState_1.LoopEndState) {
                this.checkCondition(state.loopBackState != null);
            }
            if (state instanceof RuleStartState_1.RuleStartState) {
                this.checkCondition(state.stopState != null);
            }
            if (state instanceof BlockStartState_1.BlockStartState) {
                this.checkCondition(state.endState != null);
            }
            if (state instanceof BlockEndState_1.BlockEndState) {
                this.checkCondition(state.startState != null);
            }
            if (state instanceof DecisionState_1.DecisionState) {
                let decisionState = state;
                this.checkCondition(decisionState.numberOfTransitions <= 1 || decisionState.decision >= 0);
            }
            else {
                this.checkCondition(state.numberOfTransitions <= 1 || state instanceof RuleStopState_1.RuleStopState);
            }
        }
    }
    checkCondition(condition, message) {
        if (!condition) {
            throw new Error("IllegalStateException: " + message);
        }
    }
    static inlineSetRules(atn) {
        let inlinedCalls = 0;
        let ruleToInlineTransition = new Array(atn.ruleToStartState.length);
        for (let i = 0; i < atn.ruleToStartState.length; i++) {
            let startState = atn.ruleToStartState[i];
            let middleState = startState;
            while (middleState.onlyHasEpsilonTransitions
                && middleState.numberOfOptimizedTransitions === 1
                && middleState.getOptimizedTransition(0).serializationType === 1 /* EPSILON */) {
                middleState = middleState.getOptimizedTransition(0).target;
            }
            if (middleState.numberOfOptimizedTransitions !== 1) {
                continue;
            }
            let matchTransition = middleState.getOptimizedTransition(0);
            let matchTarget = matchTransition.target;
            if (matchTransition.isEpsilon
                || !matchTarget.onlyHasEpsilonTransitions
                || matchTarget.numberOfOptimizedTransitions !== 1
                || !(matchTarget.getOptimizedTransition(0).target instanceof RuleStopState_1.RuleStopState)) {
                continue;
            }
            switch (matchTransition.serializationType) {
                case 5 /* ATOM */:
                case 2 /* RANGE */:
                case 7 /* SET */:
                    ruleToInlineTransition[i] = matchTransition;
                    break;
                case 8 /* NOT_SET */:
                case 9 /* WILDCARD */:
                    // not implemented yet
                    continue;
                default:
                    continue;
            }
        }
        for (let stateNumber = 0; stateNumber < atn.states.length; stateNumber++) {
            let state = atn.states[stateNumber];
            if (state.ruleIndex < 0) {
                continue;
            }
            let optimizedTransitions;
            for (let i = 0; i < state.numberOfOptimizedTransitions; i++) {
                let transition = state.getOptimizedTransition(i);
                if (!(transition instanceof RuleTransition_1.RuleTransition)) {
                    if (optimizedTransitions != null) {
                        optimizedTransitions.push(transition);
                    }
                    continue;
                }
                let ruleTransition = transition;
                let effective = ruleToInlineTransition[ruleTransition.target.ruleIndex];
                if (effective == null) {
                    if (optimizedTransitions != null) {
                        optimizedTransitions.push(transition);
                    }
                    continue;
                }
                if (optimizedTransitions == null) {
                    optimizedTransitions = [];
                    for (let j = 0; j < i; j++) {
                        optimizedTransitions.push(state.getOptimizedTransition(i));
                    }
                }
                inlinedCalls++;
                let target = ruleTransition.followState;
                let intermediateState = new BasicState_1.BasicState();
                intermediateState.setRuleIndex(target.ruleIndex);
                atn.addState(intermediateState);
                optimizedTransitions.push(new EpsilonTransition_1.EpsilonTransition(intermediateState));
                switch (effective.serializationType) {
                    case 5 /* ATOM */:
                        intermediateState.addTransition(new AtomTransition_1.AtomTransition(target, effective._label));
                        break;
                    case 2 /* RANGE */:
                        intermediateState.addTransition(new RangeTransition_1.RangeTransition(target, effective.from, effective.to));
                        break;
                    case 7 /* SET */:
                        intermediateState.addTransition(new SetTransition_1.SetTransition(target, effective.label));
                        break;
                    default:
                        throw new Error("UnsupportedOperationException");
                }
            }
            if (optimizedTransitions != null) {
                if (state.isOptimized) {
                    while (state.numberOfOptimizedTransitions > 0) {
                        state.removeOptimizedTransition(state.numberOfOptimizedTransitions - 1);
                    }
                }
                for (let transition of optimizedTransitions) {
                    state.addOptimizedTransition(transition);
                }
            }
        }
        if (ParserATNSimulator_1.ParserATNSimulator.debug) {
            console.log("ATN runtime optimizer removed " + inlinedCalls + " rule invocations by inlining sets.");
        }
        return inlinedCalls;
    }
    static combineChainedEpsilons(atn) {
        let removedEdges = 0;
        for (let state of atn.states) {
            if (!state.onlyHasEpsilonTransitions || state instanceof RuleStopState_1.RuleStopState) {
                continue;
            }
            let optimizedTransitions;
            nextTransition: for (let i = 0; i < state.numberOfOptimizedTransitions; i++) {
                let transition = state.getOptimizedTransition(i);
                let intermediate = transition.target;
                if (transition.serializationType !== 1 /* EPSILON */
                    || transition.outermostPrecedenceReturn !== -1
                    || intermediate.stateType !== 1 /* BASIC */
                    || !intermediate.onlyHasEpsilonTransitions) {
                    if (optimizedTransitions != null) {
                        optimizedTransitions.push(transition);
                    }
                    continue nextTransition;
                }
                for (let j = 0; j < intermediate.numberOfOptimizedTransitions; j++) {
                    if (intermediate.getOptimizedTransition(j).serializationType !== 1 /* EPSILON */
                        || intermediate.getOptimizedTransition(j).outermostPrecedenceReturn !== -1) {
                        if (optimizedTransitions != null) {
                            optimizedTransitions.push(transition);
                        }
                        continue nextTransition;
                    }
                }
                removedEdges++;
                if (optimizedTransitions == null) {
                    optimizedTransitions = [];
                    for (let j = 0; j < i; j++) {
                        optimizedTransitions.push(state.getOptimizedTransition(j));
                    }
                }
                for (let j = 0; j < intermediate.numberOfOptimizedTransitions; j++) {
                    let target = intermediate.getOptimizedTransition(j).target;
                    optimizedTransitions.push(new EpsilonTransition_1.EpsilonTransition(target));
                }
            }
            if (optimizedTransitions != null) {
                if (state.isOptimized) {
                    while (state.numberOfOptimizedTransitions > 0) {
                        state.removeOptimizedTransition(state.numberOfOptimizedTransitions - 1);
                    }
                }
                for (let transition of optimizedTransitions) {
                    state.addOptimizedTransition(transition);
                }
            }
        }
        if (ParserATNSimulator_1.ParserATNSimulator.debug) {
            console.log("ATN runtime optimizer removed " + removedEdges + " transitions by combining chained epsilon transitions.");
        }
        return removedEdges;
    }
    static optimizeSets(atn, preserveOrder) {
        if (preserveOrder) {
            // this optimization currently doesn't preserve edge order.
            return 0;
        }
        let removedPaths = 0;
        let decisions = atn.decisionToState;
        for (let decision of decisions) {
            let setTransitions = new IntervalSet_1.IntervalSet();
            for (let i = 0; i < decision.numberOfOptimizedTransitions; i++) {
                let epsTransition = decision.getOptimizedTransition(i);
                if (!(epsTransition instanceof EpsilonTransition_1.EpsilonTransition)) {
                    continue;
                }
                if (epsTransition.target.numberOfOptimizedTransitions !== 1) {
                    continue;
                }
                let transition = epsTransition.target.getOptimizedTransition(0);
                if (!(transition.target instanceof BlockEndState_1.BlockEndState)) {
                    continue;
                }
                if (transition instanceof NotSetTransition_1.NotSetTransition) {
                    // TODO: not yet implemented
                    continue;
                }
                if (transition instanceof AtomTransition_1.AtomTransition
                    || transition instanceof RangeTransition_1.RangeTransition
                    || transition instanceof SetTransition_1.SetTransition) {
                    setTransitions.add(i);
                }
            }
            if (setTransitions.size <= 1) {
                continue;
            }
            let optimizedTransitions = [];
            for (let i = 0; i < decision.numberOfOptimizedTransitions; i++) {
                if (!setTransitions.contains(i)) {
                    optimizedTransitions.push(decision.getOptimizedTransition(i));
                }
            }
            let blockEndState = decision.getOptimizedTransition(setTransitions.minElement).target.getOptimizedTransition(0).target;
            let matchSet = new IntervalSet_1.IntervalSet();
            for (let i = 0; i < setTransitions.intervals.length; i++) {
                let interval = setTransitions.intervals[i];
                for (let j = interval.a; j <= interval.b; j++) {
                    let matchTransition = decision.getOptimizedTransition(j).target.getOptimizedTransition(0);
                    if (matchTransition instanceof NotSetTransition_1.NotSetTransition) {
                        throw new Error("Not yet implemented.");
                    }
                    else {
                        matchSet.addAll(matchTransition.label);
                    }
                }
            }
            let newTransition;
            if (matchSet.intervals.length === 1) {
                if (matchSet.size === 1) {
                    newTransition = new AtomTransition_1.AtomTransition(blockEndState, matchSet.minElement);
                }
                else {
                    let matchInterval = matchSet.intervals[0];
                    newTransition = new RangeTransition_1.RangeTransition(blockEndState, matchInterval.a, matchInterval.b);
                }
            }
            else {
                newTransition = new SetTransition_1.SetTransition(blockEndState, matchSet);
            }
            let setOptimizedState = new BasicState_1.BasicState();
            setOptimizedState.setRuleIndex(decision.ruleIndex);
            atn.addState(setOptimizedState);
            setOptimizedState.addTransition(newTransition);
            optimizedTransitions.push(new EpsilonTransition_1.EpsilonTransition(setOptimizedState));
            removedPaths += decision.numberOfOptimizedTransitions - optimizedTransitions.length;
            if (decision.isOptimized) {
                while (decision.numberOfOptimizedTransitions > 0) {
                    decision.removeOptimizedTransition(decision.numberOfOptimizedTransitions - 1);
                }
            }
            for (let transition of optimizedTransitions) {
                decision.addOptimizedTransition(transition);
            }
        }
        if (ParserATNSimulator_1.ParserATNSimulator.debug) {
            console.log("ATN runtime optimizer removed " + removedPaths + " paths by collapsing sets.");
        }
        return removedPaths;
    }
    static identifyTailCalls(atn) {
        for (let state of atn.states) {
            for (let i = 0; i < state.numberOfTransitions; i++) {
                let transition = state.transition(i);
                if (!(transition instanceof RuleTransition_1.RuleTransition)) {
                    continue;
                }
                transition.tailCall = this.testTailCall(atn, transition, false);
                transition.optimizedTailCall = this.testTailCall(atn, transition, true);
            }
            if (!state.isOptimized) {
                continue;
            }
            for (let i = 0; i < state.numberOfOptimizedTransitions; i++) {
                let transition = state.getOptimizedTransition(i);
                if (!(transition instanceof RuleTransition_1.RuleTransition)) {
                    continue;
                }
                transition.tailCall = this.testTailCall(atn, transition, false);
                transition.optimizedTailCall = this.testTailCall(atn, transition, true);
            }
        }
    }
    static testTailCall(atn, transition, optimizedPath) {
        if (!optimizedPath && transition.tailCall) {
            return true;
        }
        if (optimizedPath && transition.optimizedTailCall) {
            return true;
        }
        let reachable = new BitSet_1.BitSet(atn.states.length);
        let worklist = [];
        worklist.push(transition.followState);
        while (true) {
            let state = worklist.pop();
            if (!state) {
                break;
            }
            if (reachable.get(state.stateNumber)) {
                continue;
            }
            if (state instanceof RuleStopState_1.RuleStopState) {
                continue;
            }
            if (!state.onlyHasEpsilonTransitions) {
                return false;
            }
            let transitionCount = optimizedPath ? state.numberOfOptimizedTransitions : state.numberOfTransitions;
            for (let i = 0; i < transitionCount; i++) {
                let t = optimizedPath ? state.getOptimizedTransition(i) : state.transition(i);
                if (t.serializationType !== 1 /* EPSILON */) {
                    return false;
                }
                worklist.push(t.target);
            }
        }
        return true;
    }
    static toInt(c) {
        return c;
    }
    static toInt32(data, offset) {
        return (data[offset] | (data[offset + 1] << 16)) >>> 0;
    }
    static toUUID(data, offset) {
        let leastSigBits = ATNDeserializer.toInt32(data, offset);
        let lessSigBits = ATNDeserializer.toInt32(data, offset + 2);
        let moreSigBits = ATNDeserializer.toInt32(data, offset + 4);
        let mostSigBits = ATNDeserializer.toInt32(data, offset + 6);
        return new UUID_1.UUID(mostSigBits, moreSigBits, lessSigBits, leastSigBits);
    }
    edgeFactory(atn, type, src, trg, arg1, arg2, arg3, sets) {
        let target = atn.states[trg];
        switch (type) {
            case 1 /* EPSILON */: return new EpsilonTransition_1.EpsilonTransition(target);
            case 2 /* RANGE */:
                if (arg3 !== 0) {
                    return new RangeTransition_1.RangeTransition(target, Token_1.Token.EOF, arg2);
                }
                else {
                    return new RangeTransition_1.RangeTransition(target, arg1, arg2);
                }
            case 3 /* RULE */:
                let rt = new RuleTransition_1.RuleTransition(atn.states[arg1], arg2, arg3, target);
                return rt;
            case 4 /* PREDICATE */:
                let pt = new PredicateTransition_1.PredicateTransition(target, arg1, arg2, arg3 !== 0);
                return pt;
            case 10 /* PRECEDENCE */:
                return new PrecedencePredicateTransition_1.PrecedencePredicateTransition(target, arg1);
            case 5 /* ATOM */:
                if (arg3 !== 0) {
                    return new AtomTransition_1.AtomTransition(target, Token_1.Token.EOF);
                }
                else {
                    return new AtomTransition_1.AtomTransition(target, arg1);
                }
            case 6 /* ACTION */:
                let a = new ActionTransition_1.ActionTransition(target, arg1, arg2, arg3 !== 0);
                return a;
            case 7 /* SET */: return new SetTransition_1.SetTransition(target, sets[arg1]);
            case 8 /* NOT_SET */: return new NotSetTransition_1.NotSetTransition(target, sets[arg1]);
            case 9 /* WILDCARD */: return new WildcardTransition_1.WildcardTransition(target);
        }
        throw new Error("The specified transition type is not valid.");
    }
    stateFactory(type, ruleIndex) {
        let s;
        switch (type) {
            case 0 /* INVALID_TYPE */: return new InvalidState_1.InvalidState();
            case 1 /* BASIC */:
                s = new BasicState_1.BasicState();
                break;
            case 2 /* RULE_START */:
                s = new RuleStartState_1.RuleStartState();
                break;
            case 3 /* BLOCK_START */:
                s = new BasicBlockStartState_1.BasicBlockStartState();
                break;
            case 4 /* PLUS_BLOCK_START */:
                s = new PlusBlockStartState_1.PlusBlockStartState();
                break;
            case 5 /* STAR_BLOCK_START */:
                s = new StarBlockStartState_1.StarBlockStartState();
                break;
            case 6 /* TOKEN_START */:
                s = new TokensStartState_1.TokensStartState();
                break;
            case 7 /* RULE_STOP */:
                s = new RuleStopState_1.RuleStopState();
                break;
            case 8 /* BLOCK_END */:
                s = new BlockEndState_1.BlockEndState();
                break;
            case 9 /* STAR_LOOP_BACK */:
                s = new StarLoopbackState_1.StarLoopbackState();
                break;
            case 10 /* STAR_LOOP_ENTRY */:
                s = new StarLoopEntryState_1.StarLoopEntryState();
                break;
            case 11 /* PLUS_LOOP_BACK */:
                s = new PlusLoopbackState_1.PlusLoopbackState();
                break;
            case 12 /* LOOP_END */:
                s = new LoopEndState_1.LoopEndState();
                break;
            default:
                let message = `The specified state type ${type} is not valid.`;
                throw new Error(message);
        }
        s.ruleIndex = ruleIndex;
        return s;
    }
    lexerActionFactory(type, data1, data2) {
        switch (type) {
            case 0 /* CHANNEL */:
                return new LexerChannelAction_1.LexerChannelAction(data1);
            case 1 /* CUSTOM */:
                return new LexerCustomAction_1.LexerCustomAction(data1, data2);
            case 2 /* MODE */:
                return new LexerModeAction_1.LexerModeAction(data1);
            case 3 /* MORE */:
                return LexerMoreAction_1.LexerMoreAction.INSTANCE;
            case 4 /* POP_MODE */:
                return LexerPopModeAction_1.LexerPopModeAction.INSTANCE;
            case 5 /* PUSH_MODE */:
                return new LexerPushModeAction_1.LexerPushModeAction(data1);
            case 6 /* SKIP */:
                return LexerSkipAction_1.LexerSkipAction.INSTANCE;
            case 7 /* TYPE */:
                return new LexerTypeAction_1.LexerTypeAction(data1);
            default:
                let message = `The specified lexer action type ${type} is not valid.`;
                throw new Error(message);
        }
    }
}
/* WARNING: DO NOT MERGE THESE LINES. If UUIDs differ during a merge,
 * resolve the conflict by generating a new ID!
 */
/**
 * This is the earliest supported serialized UUID.
 */
ATNDeserializer.BASE_SERIALIZED_UUID = UUID_1.UUID.fromString("E4178468-DF95-44D0-AD87-F22A5D5FB6D3");
/**
 * This UUID indicates an extension of {@link #ADDED_PRECEDENCE_TRANSITIONS}
 * for the addition of lexer actions encoded as a sequence of
 * {@link LexerAction} instances.
 */
ATNDeserializer.ADDED_LEXER_ACTIONS = UUID_1.UUID.fromString("AB35191A-1603-487E-B75A-479B831EAF6D");
/**
 * This UUID indicates the serialized ATN contains two sets of
 * IntervalSets, where the second set's values are encoded as
 * 32-bit integers to support the full Unicode SMP range up to U+10FFFF.
 */
ATNDeserializer.ADDED_UNICODE_SMP = UUID_1.UUID.fromString("59627784-3BE5-417A-B9EB-8131A7286089");
/**
 * This list contains all of the currently supported UUIDs, ordered by when
 * the feature first appeared in this branch.
 */
ATNDeserializer.SUPPORTED_UUIDS = [
    ATNDeserializer.BASE_SERIALIZED_UUID,
    ATNDeserializer.ADDED_LEXER_ACTIONS,
    ATNDeserializer.ADDED_UNICODE_SMP
];
/**
 * This is the current serialized UUID.
 */
ATNDeserializer.SERIALIZED_UUID = ATNDeserializer.ADDED_UNICODE_SMP;
__decorate([
    Decorators_1.NotNull
], ATNDeserializer.prototype, "deserializationOptions", void 0);
__decorate([
    __param(0, Decorators_1.NotNull)
], ATNDeserializer.prototype, "deserialize", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ATNDeserializer.prototype, "markPrecedenceDecisions", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], ATNDeserializer.prototype, "edgeFactory", null);
exports.ATNDeserializer = ATNDeserializer;

},{"../Decorators":16,"../Token":40,"../dfa/DFA":98,"../misc/Array2DHashSet":104,"../misc/BitSet":107,"../misc/IntervalSet":112,"../misc/UUID":117,"./ATN":43,"./ATNDeserializationOptions":46,"./ActionTransition":51,"./AtomTransition":52,"./BasicBlockStartState":53,"./BasicState":54,"./BlockEndState":55,"./BlockStartState":56,"./DecisionState":58,"./EpsilonTransition":59,"./InvalidState":60,"./LexerChannelAction":64,"./LexerCustomAction":65,"./LexerModeAction":67,"./LexerMoreAction":68,"./LexerPopModeAction":69,"./LexerPushModeAction":70,"./LexerSkipAction":71,"./LexerTypeAction":72,"./LoopEndState":73,"./NotSetTransition":74,"./ParserATNSimulator":76,"./PlusBlockStartState":77,"./PlusLoopbackState":78,"./PrecedencePredicateTransition":79,"./PredicateTransition":80,"./RangeTransition":84,"./RuleStartState":85,"./RuleStopState":86,"./RuleTransition":87,"./SetTransition":89,"./StarBlockStartState":91,"./StarLoopEntryState":92,"./StarLoopbackState":93,"./TokensStartState":94,"./WildcardTransition":96}],48:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const ATNConfigSet_1 = require("./ATNConfigSet");
const DFAState_1 = require("../dfa/DFAState");
const Decorators_1 = require("../Decorators");
const PredictionContext_1 = require("./PredictionContext");
let ATNSimulator = class ATNSimulator {
    constructor(atn) {
        this.atn = atn;
    }
    static get ERROR() {
        if (!ATNSimulator._ERROR) {
            ATNSimulator._ERROR = new DFAState_1.DFAState(new ATNConfigSet_1.ATNConfigSet());
            ATNSimulator._ERROR.stateNumber = PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY;
        }
        return ATNSimulator._ERROR;
    }
    /**
     * Clear the DFA cache used by the current instance. Since the DFA cache may
     * be shared by multiple ATN simulators, this method may affect the
     * performance (but not accuracy) of other parsers which are being used
     * concurrently.
     *
     * @ if the current instance does not
     * support clearing the DFA.
     *
     * @since 4.3
     */
    clearDFA() {
        this.atn.clearDFA();
    }
};
__decorate([
    Decorators_1.NotNull
], ATNSimulator.prototype, "atn", void 0);
__decorate([
    Decorators_1.NotNull
], ATNSimulator, "ERROR", null);
ATNSimulator = __decorate([
    __param(0, Decorators_1.NotNull)
], ATNSimulator);
exports.ATNSimulator = ATNSimulator;
(function (ATNSimulator) {
    const RULE_VARIANT_DELIMITER = '$';
    const RULE_LF_VARIANT_MARKER = "$lf$";
    const RULE_NOLF_VARIANT_MARKER = "$nolf$";
})(ATNSimulator = exports.ATNSimulator || (exports.ATNSimulator = {}));
exports.ATNSimulator = ATNSimulator;

},{"../Decorators":16,"../dfa/DFAState":100,"./ATNConfigSet":45,"./PredictionContext":81}],49:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
const INITIAL_NUM_TRANSITIONS = 4;
/**
 * The following images show the relation of states and
 * {@link ATNState#transitions} for various grammar constructs.
 *
 * <ul>
 *
 * <li>Solid edges marked with an &#0949; indicate a required
 * {@link EpsilonTransition}.</li>
 *
 * <li>Dashed edges indicate locations where any transition derived from
 * {@link Transition} might appear.</li>
 *
 * <li>Dashed nodes are place holders for either a sequence of linked
 * {@link BasicState} states or the inclusion of a block representing a nested
 * construct in one of the forms below.</li>
 *
 * <li>Nodes showing multiple outgoing alternatives with a {@code ...} support
 * any number of alternatives (one or more). Nodes without the {@code ...} only
 * support the exact number of alternatives shown in the diagram.</li>
 *
 * </ul>
 *
 * <h2>Basic Blocks</h2>
 *
 * <h3>Rule</h3>
 *
 * <embed src="images/Rule.svg" type="image/svg+xml"/>
 *
 * <h3>Block of 1 or more alternatives</h3>
 *
 * <embed src="images/Block.svg" type="image/svg+xml"/>
 *
 * <h2>Greedy Loops</h2>
 *
 * <h3>Greedy Closure: {@code (...)*}</h3>
 *
 * <embed src="images/ClosureGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Greedy Positive Closure: {@code (...)+}</h3>
 *
 * <embed src="images/PositiveClosureGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Greedy Optional: {@code (...)?}</h3>
 *
 * <embed src="images/OptionalGreedy.svg" type="image/svg+xml"/>
 *
 * <h2>Non-Greedy Loops</h2>
 *
 * <h3>Non-Greedy Closure: {@code (...)*?}</h3>
 *
 * <embed src="images/ClosureNonGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Non-Greedy Positive Closure: {@code (...)+?}</h3>
 *
 * <embed src="images/PositiveClosureNonGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Non-Greedy Optional: {@code (...)??}</h3>
 *
 * <embed src="images/OptionalNonGreedy.svg" type="image/svg+xml"/>
 */
class ATNState {
    constructor() {
        this.stateNumber = ATNState.INVALID_STATE_NUMBER;
        this.ruleIndex = 0; // at runtime, we don't have Rule objects
        this.epsilonOnlyTransitions = false;
        /** Track the transitions emanating from this ATN state. */
        this.transitions = [];
        this.optimizedTransitions = this.transitions;
    }
    /**
     * Gets the state number.
     *
     * @return the state number
     */
    getStateNumber() {
        return this.stateNumber;
    }
    /**
     * For all states except {@link RuleStopState}, this returns the state
     * number. Returns -1 for stop states.
     *
     * @return -1 for {@link RuleStopState}, otherwise the state number
     */
    get nonStopStateNumber() {
        return this.getStateNumber();
    }
    hashCode() {
        return this.stateNumber;
    }
    equals(o) {
        // are these states same object?
        if (o instanceof ATNState) {
            return this.stateNumber === o.stateNumber;
        }
        return false;
    }
    get isNonGreedyExitState() {
        return false;
    }
    toString() {
        return String(this.stateNumber);
    }
    getTransitions() {
        return this.transitions.slice(0);
    }
    get numberOfTransitions() {
        return this.transitions.length;
    }
    addTransition(e, index) {
        if (this.transitions.length === 0) {
            this.epsilonOnlyTransitions = e.isEpsilon;
        }
        else if (this.epsilonOnlyTransitions !== e.isEpsilon) {
            this.epsilonOnlyTransitions = false;
            throw new Error("ATN state " + this.stateNumber + " has both epsilon and non-epsilon transitions.");
        }
        this.transitions.splice(index !== undefined ? index : this.transitions.length, 0, e);
    }
    transition(i) {
        return this.transitions[i];
    }
    setTransition(i, e) {
        this.transitions[i] = e;
    }
    removeTransition(index) {
        return this.transitions.splice(index, 1)[0];
    }
    get onlyHasEpsilonTransitions() {
        return this.epsilonOnlyTransitions;
    }
    setRuleIndex(ruleIndex) {
        this.ruleIndex = ruleIndex;
    }
    get isOptimized() {
        return this.optimizedTransitions !== this.transitions;
    }
    get numberOfOptimizedTransitions() {
        return this.optimizedTransitions.length;
    }
    getOptimizedTransition(i) {
        return this.optimizedTransitions[i];
    }
    addOptimizedTransition(e) {
        if (!this.isOptimized) {
            this.optimizedTransitions = new Array();
        }
        this.optimizedTransitions.push(e);
    }
    setOptimizedTransition(i, e) {
        if (!this.isOptimized) {
            throw new Error("This ATNState is not optimized.");
        }
        this.optimizedTransitions[i] = e;
    }
    removeOptimizedTransition(i) {
        if (!this.isOptimized) {
            throw new Error("This ATNState is not optimized.");
        }
        this.optimizedTransitions.splice(i, 1);
    }
}
ATNState.serializationNames = [
    "INVALID",
    "BASIC",
    "RULE_START",
    "BLOCK_START",
    "PLUS_BLOCK_START",
    "STAR_BLOCK_START",
    "TOKEN_START",
    "RULE_STOP",
    "BLOCK_END",
    "STAR_LOOP_BACK",
    "STAR_LOOP_ENTRY",
    "PLUS_LOOP_BACK",
    "LOOP_END"
];
__decorate([
    Decorators_1.Override
], ATNState.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], ATNState.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], ATNState.prototype, "toString", null);
exports.ATNState = ATNState;
(function (ATNState) {
    ATNState.INVALID_STATE_NUMBER = -1;
})(ATNState = exports.ATNState || (exports.ATNState = {}));

},{"../Decorators":16}],50:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Transition_1 = require("./Transition");
/**
 *
 * @author Sam Harwell
 */
class AbstractPredicateTransition extends Transition_1.Transition {
    constructor(target) {
        super(target);
    }
}
exports.AbstractPredicateTransition = AbstractPredicateTransition;

},{"./Transition":95}],51:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
const Transition_1 = require("./Transition");
let ActionTransition = class ActionTransition extends Transition_1.Transition {
    constructor(target, ruleIndex, actionIndex = -1, isCtxDependent = false) {
        super(target);
        this.ruleIndex = ruleIndex;
        this.actionIndex = actionIndex;
        this.isCtxDependent = isCtxDependent;
    }
    get serializationType() {
        return 6 /* ACTION */;
    }
    get isEpsilon() {
        return true; // we are to be ignored by analysis 'cept for predicates
    }
    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return false;
    }
    toString() {
        return "action_" + this.ruleIndex + ":" + this.actionIndex;
    }
};
__decorate([
    Decorators_1.Override
], ActionTransition.prototype, "serializationType", null);
__decorate([
    Decorators_1.Override
], ActionTransition.prototype, "isEpsilon", null);
__decorate([
    Decorators_1.Override
], ActionTransition.prototype, "matches", null);
__decorate([
    Decorators_1.Override
], ActionTransition.prototype, "toString", null);
ActionTransition = __decorate([
    __param(0, Decorators_1.NotNull)
], ActionTransition);
exports.ActionTransition = ActionTransition;

},{"../Decorators":16,"./Transition":95}],52:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const IntervalSet_1 = require("../misc/IntervalSet");
const Decorators_1 = require("../Decorators");
const Transition_1 = require("./Transition");
/** TODO: make all transitions sets? no, should remove set edges */
let AtomTransition = class AtomTransition extends Transition_1.Transition {
    constructor(target, label) {
        super(target);
        this._label = label;
    }
    get serializationType() {
        return 5 /* ATOM */;
    }
    get label() {
        return IntervalSet_1.IntervalSet.of(this._label);
    }
    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return this._label === symbol;
    }
    toString() {
        return String(this.label);
    }
};
__decorate([
    Decorators_1.Override
], AtomTransition.prototype, "serializationType", null);
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull
], AtomTransition.prototype, "label", null);
__decorate([
    Decorators_1.Override
], AtomTransition.prototype, "matches", null);
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull
], AtomTransition.prototype, "toString", null);
AtomTransition = __decorate([
    __param(0, Decorators_1.NotNull)
], AtomTransition);
exports.AtomTransition = AtomTransition;

},{"../Decorators":16,"../misc/IntervalSet":112,"./Transition":95}],53:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const BlockStartState_1 = require("./BlockStartState");
const Decorators_1 = require("../Decorators");
/**
 *
 * @author Sam Harwell
 */
class BasicBlockStartState extends BlockStartState_1.BlockStartState {
    get stateType() {
        return 3 /* BLOCK_START */;
    }
}
__decorate([
    Decorators_1.Override
], BasicBlockStartState.prototype, "stateType", null);
exports.BasicBlockStartState = BasicBlockStartState;

},{"../Decorators":16,"./BlockStartState":56}],54:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:27.8389930-07:00
const ATNState_1 = require("./ATNState");
const Decorators_1 = require("../Decorators");
/**
 *
 * @author Sam Harwell
 */
class BasicState extends ATNState_1.ATNState {
    get stateType() {
        return 1 /* BASIC */;
    }
}
__decorate([
    Decorators_1.Override
], BasicState.prototype, "stateType", null);
exports.BasicState = BasicState;

},{"../Decorators":16,"./ATNState":49}],55:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:27.9125304-07:00
const ATNState_1 = require("./ATNState");
const Decorators_1 = require("../Decorators");
/** Terminal node of a simple {@code (a|b|c)} block. */
class BlockEndState extends ATNState_1.ATNState {
    get stateType() {
        return 8 /* BLOCK_END */;
    }
}
__decorate([
    Decorators_1.Override
], BlockEndState.prototype, "stateType", null);
exports.BlockEndState = BlockEndState;

},{"../Decorators":16,"./ATNState":49}],56:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const DecisionState_1 = require("./DecisionState");
/**  The start of a regular {@code (...)} block. */
class BlockStartState extends DecisionState_1.DecisionState {
}
exports.BlockStartState = BlockStartState;

},{"./DecisionState":58}],57:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
const Utils = require("../misc/Utils");
/**
 * This class stores information about a configuration conflict.
 *
 * @author Sam Harwell
 */
class ConflictInfo {
    constructor(conflictedAlts, exact) {
        this._conflictedAlts = conflictedAlts;
        this.exact = exact;
    }
    /**
     * Gets the set of conflicting alternatives for the configuration set.
     */
    get conflictedAlts() {
        return this._conflictedAlts;
    }
    /**
     * Gets whether or not the configuration conflict is an exact conflict.
     * An exact conflict occurs when the prediction algorithm determines that
     * the represented alternatives for a particular configuration set cannot be
     * further reduced by consuming additional input. After reaching an exact
     * conflict during an SLL prediction, only switch to full-context prediction
     * could reduce the set of viable alternatives. In LL prediction, an exact
     * conflict indicates a true ambiguity in the input.
     *
     * <p>
     * For the {@link PredictionMode#LL_EXACT_AMBIG_DETECTION} prediction mode,
     * accept states are conflicting but not exact are treated as non-accept
     * states.</p>
     */
    get isExact() {
        return this.exact;
    }
    equals(obj) {
        if (obj === this) {
            return true;
        }
        else if (!(obj instanceof ConflictInfo)) {
            return false;
        }
        return this.isExact === obj.isExact
            && Utils.equals(this.conflictedAlts, obj.conflictedAlts);
    }
    hashCode() {
        return this.conflictedAlts.hashCode();
    }
}
__decorate([
    Decorators_1.Override
], ConflictInfo.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], ConflictInfo.prototype, "hashCode", null);
exports.ConflictInfo = ConflictInfo;

},{"../Decorators":16,"../misc/Utils":118}],58:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:28.4381103-07:00
const ATNState_1 = require("./ATNState");
class DecisionState extends ATNState_1.ATNState {
    constructor() {
        super(...arguments);
        this.decision = -1;
        this.nonGreedy = false;
        this.sll = false;
    }
}
exports.DecisionState = DecisionState;

},{"./ATNState":49}],59:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
const Transition_1 = require("./Transition");
let EpsilonTransition = class EpsilonTransition extends Transition_1.Transition {
    constructor(target, outermostPrecedenceReturn = -1) {
        super(target);
        this._outermostPrecedenceReturn = outermostPrecedenceReturn;
    }
    /**
     * @return the rule index of a precedence rule for which this transition is
     * returning from, where the precedence value is 0; otherwise, -1.
     *
     * @see ATNConfig.isPrecedenceFilterSuppressed
     * @see ParserATNSimulator#applyPrecedenceFilter(ATNConfigSet, ParserRuleContext, PredictionContextCache)
     * @since 4.4.1
     */
    get outermostPrecedenceReturn() {
        return this._outermostPrecedenceReturn;
    }
    get serializationType() {
        return 1 /* EPSILON */;
    }
    get isEpsilon() {
        return true;
    }
    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return false;
    }
    toString() {
        return "epsilon";
    }
};
__decorate([
    Decorators_1.Override
], EpsilonTransition.prototype, "serializationType", null);
__decorate([
    Decorators_1.Override
], EpsilonTransition.prototype, "isEpsilon", null);
__decorate([
    Decorators_1.Override
], EpsilonTransition.prototype, "matches", null);
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull
], EpsilonTransition.prototype, "toString", null);
EpsilonTransition = __decorate([
    __param(0, Decorators_1.NotNull)
], EpsilonTransition);
exports.EpsilonTransition = EpsilonTransition;

},{"../Decorators":16,"./Transition":95}],60:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const BasicState_1 = require("./BasicState");
const Decorators_1 = require("../Decorators");
/**
 *
 * @author Sam Harwell
 */
class InvalidState extends BasicState_1.BasicState {
    get stateType() {
        return 0 /* INVALID_TYPE */;
    }
}
__decorate([
    Decorators_1.Override
], InvalidState.prototype, "stateType", null);
exports.InvalidState = InvalidState;

},{"../Decorators":16,"./BasicState":54}],61:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:30.4445360-07:00
const AbstractPredicateTransition_1 = require("./AbstractPredicateTransition");
const Array2DHashSet_1 = require("../misc/Array2DHashSet");
const ATNConfig_1 = require("./ATNConfig");
const BitSet_1 = require("../misc/BitSet");
const IntervalSet_1 = require("../misc/IntervalSet");
const Decorators_1 = require("../Decorators");
const NotSetTransition_1 = require("./NotSetTransition");
const ObjectEqualityComparator_1 = require("../misc/ObjectEqualityComparator");
const PredictionContext_1 = require("./PredictionContext");
const RuleStopState_1 = require("./RuleStopState");
const RuleTransition_1 = require("./RuleTransition");
const Token_1 = require("../Token");
const WildcardTransition_1 = require("./WildcardTransition");
let LL1Analyzer = class LL1Analyzer {
    constructor(atn) { this.atn = atn; }
    /**
     * Calculates the SLL(1) expected lookahead set for each outgoing transition
     * of an {@link ATNState}. The returned array has one element for each
     * outgoing transition in {@code s}. If the closure from transition
     * <em>i</em> leads to a semantic predicate before matching a symbol, the
     * element at index <em>i</em> of the result will be {@code null}.
     *
     * @param s the ATN state
     * @return the expected symbols for each outgoing transition of {@code s}.
     */
    getDecisionLookahead(s) {
        //		System.out.println("LOOK("+s.stateNumber+")");
        if (s == null) {
            return undefined;
        }
        let look = new Array(s.numberOfTransitions);
        for (let alt = 0; alt < s.numberOfTransitions; alt++) {
            let current = new IntervalSet_1.IntervalSet();
            look[alt] = current;
            let lookBusy = new Array2DHashSet_1.Array2DHashSet(ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE);
            let seeThruPreds = false; // fail to get lookahead upon pred
            this._LOOK(s.transition(alt).target, undefined, PredictionContext_1.PredictionContext.EMPTY_LOCAL, current, lookBusy, new BitSet_1.BitSet(), seeThruPreds, false);
            // Wipe out lookahead for this alternative if we found nothing
            // or we had a predicate when we !seeThruPreds
            if (current.size === 0 || current.contains(LL1Analyzer.HIT_PRED)) {
                current = undefined;
                look[alt] = current;
            }
        }
        return look;
    }
    LOOK(s, ctx, stopState) {
        if (stopState === undefined) {
            if (s.atn == null) {
                throw new Error("Illegal state");
            }
            stopState = s.atn.ruleToStopState[s.ruleIndex];
        }
        else if (stopState === null) {
            // This is an explicit request to pass undefined as the stopState to _LOOK. Used to distinguish an overload
            // from the method which simply omits the stopState parameter.
            stopState = undefined;
        }
        let r = new IntervalSet_1.IntervalSet();
        let seeThruPreds = true; // ignore preds; get all lookahead
        let addEOF = true;
        this._LOOK(s, stopState, ctx, r, new Array2DHashSet_1.Array2DHashSet(), new BitSet_1.BitSet(), seeThruPreds, addEOF);
        return r;
    }
    /**
     * Compute set of tokens that can follow {@code s} in the ATN in the
     * specified {@code ctx}.
     * <p/>
     * If {@code ctx} is {@link PredictionContext#EMPTY_LOCAL} and
     * {@code stopState} or the end of the rule containing {@code s} is reached,
     * {@link Token#EPSILON} is added to the result set. If {@code ctx} is not
     * {@link PredictionContext#EMPTY_LOCAL} and {@code addEOF} is {@code true}
     * and {@code stopState} or the end of the outermost rule is reached,
     * {@link Token#EOF} is added to the result set.
     *
     * @param s the ATN state.
     * @param stopState the ATN state to stop at. This can be a
     * {@link BlockEndState} to detect epsilon paths through a closure.
     * @param ctx The outer context, or {@link PredictionContext#EMPTY_LOCAL} if
     * the outer context should not be used.
     * @param look The result lookahead set.
     * @param lookBusy A set used for preventing epsilon closures in the ATN
     * from causing a stack overflow. Outside code should pass
     * {@code new HashSet<ATNConfig>} for this argument.
     * @param calledRuleStack A set used for preventing left recursion in the
     * ATN from causing a stack overflow. Outside code should pass
     * {@code new BitSet()} for this argument.
     * @param seeThruPreds {@code true} to true semantic predicates as
     * implicitly {@code true} and "see through them", otherwise {@code false}
     * to treat semantic predicates as opaque and add {@link #HIT_PRED} to the
     * result if one is encountered.
     * @param addEOF Add {@link Token#EOF} to the result if the end of the
     * outermost context is reached. This parameter has no effect if {@code ctx}
     * is {@link PredictionContext#EMPTY_LOCAL}.
     */
    _LOOK(s, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF) {
        //		System.out.println("_LOOK("+s.stateNumber+", ctx="+ctx);
        let c = ATNConfig_1.ATNConfig.create(s, 0, ctx);
        if (!lookBusy.add(c))
            return;
        if (s === stopState) {
            if (PredictionContext_1.PredictionContext.isEmptyLocal(ctx)) {
                look.add(Token_1.Token.EPSILON);
                return;
            }
            else if (ctx.isEmpty) {
                if (addEOF) {
                    look.add(Token_1.Token.EOF);
                }
                return;
            }
        }
        if (s instanceof RuleStopState_1.RuleStopState) {
            if (ctx.isEmpty && !PredictionContext_1.PredictionContext.isEmptyLocal(ctx)) {
                if (addEOF) {
                    look.add(Token_1.Token.EOF);
                }
                return;
            }
            let removed = calledRuleStack.get(s.ruleIndex);
            try {
                calledRuleStack.clear(s.ruleIndex);
                for (let i = 0; i < ctx.size; i++) {
                    if (ctx.getReturnState(i) === PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY) {
                        continue;
                    }
                    let returnState = this.atn.states[ctx.getReturnState(i)];
                    //					System.out.println("popping back to "+retState);
                    this._LOOK(returnState, stopState, ctx.getParent(i), look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
                }
            }
            finally {
                if (removed) {
                    calledRuleStack.set(s.ruleIndex);
                }
            }
        }
        let n = s.numberOfTransitions;
        for (let i = 0; i < n; i++) {
            let t = s.transition(i);
            if (t instanceof RuleTransition_1.RuleTransition) {
                if (calledRuleStack.get(t.ruleIndex)) {
                    continue;
                }
                let newContext = ctx.getChild(t.followState.stateNumber);
                try {
                    calledRuleStack.set(t.ruleIndex);
                    this._LOOK(t.target, stopState, newContext, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
                }
                finally {
                    calledRuleStack.clear(t.ruleIndex);
                }
            }
            else if (t instanceof AbstractPredicateTransition_1.AbstractPredicateTransition) {
                if (seeThruPreds) {
                    this._LOOK(t.target, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
                }
                else {
                    look.add(LL1Analyzer.HIT_PRED);
                }
            }
            else if (t.isEpsilon) {
                this._LOOK(t.target, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
            }
            else if (t instanceof WildcardTransition_1.WildcardTransition) {
                look.addAll(IntervalSet_1.IntervalSet.of(Token_1.Token.MIN_USER_TOKEN_TYPE, this.atn.maxTokenType));
            }
            else {
                //				System.out.println("adding "+ t);
                let set = t.label;
                if (set != null) {
                    if (t instanceof NotSetTransition_1.NotSetTransition) {
                        set = set.complement(IntervalSet_1.IntervalSet.of(Token_1.Token.MIN_USER_TOKEN_TYPE, this.atn.maxTokenType));
                    }
                    look.addAll(set);
                }
            }
        }
    }
};
/** Special value added to the lookahead sets to indicate that we hit
 *  a predicate during analysis if {@code seeThruPreds==false}.
 */
LL1Analyzer.HIT_PRED = Token_1.Token.INVALID_TYPE;
__decorate([
    Decorators_1.NotNull
], LL1Analyzer.prototype, "atn", void 0);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], LL1Analyzer.prototype, "LOOK", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(2, Decorators_1.NotNull),
    __param(3, Decorators_1.NotNull),
    __param(4, Decorators_1.NotNull),
    __param(5, Decorators_1.NotNull)
], LL1Analyzer.prototype, "_LOOK", null);
LL1Analyzer = __decorate([
    __param(0, Decorators_1.NotNull)
], LL1Analyzer);
exports.LL1Analyzer = LL1Analyzer;

},{"../Decorators":16,"../Token":40,"../misc/Array2DHashSet":104,"../misc/BitSet":107,"../misc/IntervalSet":112,"../misc/ObjectEqualityComparator":114,"./ATNConfig":44,"./AbstractPredicateTransition":50,"./NotSetTransition":74,"./PredictionContext":81,"./RuleStopState":86,"./RuleTransition":87,"./WildcardTransition":96}],62:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:29.1083066-07:00
const AcceptStateInfo_1 = require("../dfa/AcceptStateInfo");
const Stubs_1 = require("../misc/Stubs");
const ATN_1 = require("./ATN");
const ATNConfig_1 = require("./ATNConfig");
const ATNConfigSet_1 = require("./ATNConfigSet");
const ATNSimulator_1 = require("./ATNSimulator");
const DFAState_1 = require("../dfa/DFAState");
const Interval_1 = require("../misc/Interval");
const IntStream_1 = require("../IntStream");
const Lexer_1 = require("../Lexer");
const LexerActionExecutor_1 = require("./LexerActionExecutor");
const LexerNoViableAltException_1 = require("../LexerNoViableAltException");
const Decorators_1 = require("../Decorators");
const OrderedATNConfigSet_1 = require("./OrderedATNConfigSet");
const PredictionContext_1 = require("./PredictionContext");
const RuleStopState_1 = require("./RuleStopState");
const Token_1 = require("../Token");
const assert = require("assert");
/** "dup" of ParserInterpreter */
let LexerATNSimulator = class LexerATNSimulator extends ATNSimulator_1.ATNSimulator {
    constructor(atn, recog) {
        super(atn);
        this.optimize_tail_calls = true;
        /** The current token's starting index into the character stream.
         *  Shared across DFA to ATN simulation in case the ATN fails and the
         *  DFA did not have a previous accept state. In this case, we use the
         *  ATN-generated exception object.
         */
        this.startIndex = -1;
        /** line number 1..n within the input */
        this._line = 1;
        /** The index of the character relative to the beginning of the line 0..n-1 */
        this._charPositionInLine = 0;
        this.mode = Lexer_1.Lexer.DEFAULT_MODE;
        /** Used during DFA/ATN exec to record the most recent accept configuration info */
        this.prevAccept = new LexerATNSimulator.SimState();
        this.recog = recog;
    }
    copyState(simulator) {
        this._charPositionInLine = simulator.charPositionInLine;
        this._line = simulator._line;
        this.mode = simulator.mode;
        this.startIndex = simulator.startIndex;
    }
    match(input, mode) {
        LexerATNSimulator.match_calls++;
        this.mode = mode;
        let mark = input.mark();
        try {
            this.startIndex = input.index;
            this.prevAccept.reset();
            let s0 = this.atn.modeToDFA[mode].s0;
            if (s0 == null) {
                return this.matchATN(input);
            }
            else {
                return this.execATN(input, s0);
            }
        }
        finally {
            input.release(mark);
        }
    }
    reset() {
        this.prevAccept.reset();
        this.startIndex = -1;
        this._line = 1;
        this._charPositionInLine = 0;
        this.mode = Lexer_1.Lexer.DEFAULT_MODE;
    }
    matchATN(input) {
        let startState = this.atn.modeToStartState[this.mode];
        if (LexerATNSimulator.debug) {
            console.log(`matchATN mode ${this.mode} start: ${startState}`);
        }
        let old_mode = this.mode;
        let s0_closure = this.computeStartState(input, startState);
        let suppressEdge = s0_closure.hasSemanticContext;
        if (suppressEdge) {
            s0_closure.hasSemanticContext = false;
        }
        let next = this.addDFAState(s0_closure);
        if (!suppressEdge) {
            let dfa = this.atn.modeToDFA[this.mode];
            if (!dfa.s0) {
                dfa.s0 = next;
            }
            else {
                next = dfa.s0;
            }
        }
        let predict = this.execATN(input, next);
        if (LexerATNSimulator.debug) {
            console.log(`DFA after matchATN: ${this.atn.modeToDFA[old_mode].toLexerString()}`);
        }
        return predict;
    }
    execATN(input, ds0) {
        // console.log("enter exec index "+input.index+" from "+ds0.configs);
        if (LexerATNSimulator.debug) {
            console.log(`start state closure=${ds0.configs}`);
        }
        if (ds0.isAcceptState) {
            // allow zero-length tokens
            this.captureSimState(this.prevAccept, input, ds0);
        }
        let t = input.LA(1);
        // @NotNull
        let s = ds0; // s is current/from DFA state
        while (true) {
            if (LexerATNSimulator.debug) {
                console.log(`execATN loop starting closure: ${s.configs}`);
            }
            // As we move src->trg, src->trg, we keep track of the previous trg to
            // avoid looking up the DFA state again, which is expensive.
            // If the previous target was already part of the DFA, we might
            // be able to avoid doing a reach operation upon t. If s!=null,
            // it means that semantic predicates didn't prevent us from
            // creating a DFA state. Once we know s!=null, we check to see if
            // the DFA state has an edge already for t. If so, we can just reuse
            // it's configuration set; there's no point in re-computing it.
            // This is kind of like doing DFA simulation within the ATN
            // simulation because DFA simulation is really just a way to avoid
            // computing reach/closure sets. Technically, once we know that
            // we have a previously added DFA state, we could jump over to
            // the DFA simulator. But, that would mean popping back and forth
            // a lot and making things more complicated algorithmically.
            // This optimization makes a lot of sense for loops within DFA.
            // A character will take us back to an existing DFA state
            // that already has lots of edges out of it. e.g., .* in comments.
            let target = this.getExistingTargetState(s, t);
            if (target == null) {
                target = this.computeTargetState(input, s, t);
            }
            if (target === ATNSimulator_1.ATNSimulator.ERROR) {
                break;
            }
            // If this is a consumable input element, make sure to consume before
            // capturing the accept state so the input index, line, and char
            // position accurately reflect the state of the interpreter at the
            // end of the token.
            if (t !== IntStream_1.IntStream.EOF) {
                this.consume(input);
            }
            if (target.isAcceptState) {
                this.captureSimState(this.prevAccept, input, target);
                if (t === IntStream_1.IntStream.EOF) {
                    break;
                }
            }
            t = input.LA(1);
            s = target; // flip; current DFA target becomes new src/from state
        }
        return this.failOrAccept(this.prevAccept, input, s.configs, t);
    }
    /**
     * Get an existing target state for an edge in the DFA. If the target state
     * for the edge has not yet been computed or is otherwise not available,
     * this method returns {@code null}.
     *
     * @param s The current DFA state
     * @param t The next input symbol
     * @return The existing target DFA state for the given input symbol
     * {@code t}, or {@code null} if the target state for this edge is not
     * already cached
     */
    getExistingTargetState(s, t) {
        let target = s.getTarget(t);
        if (LexerATNSimulator.debug && target != null) {
            console.log("reuse state " + s.stateNumber +
                " edge to " + target.stateNumber);
        }
        return target;
    }
    /**
     * Compute a target state for an edge in the DFA, and attempt to add the
     * computed state and corresponding edge to the DFA.
     *
     * @param input The input stream
     * @param s The current DFA state
     * @param t The next input symbol
     *
     * @return The computed target DFA state for the given input symbol
     * {@code t}. If {@code t} does not lead to a valid DFA state, this method
     * returns {@link #ERROR}.
     */
    computeTargetState(input, s, t) {
        let reach = new OrderedATNConfigSet_1.OrderedATNConfigSet();
        // if we don't find an existing DFA state
        // Fill reach starting from closure, following t transitions
        this.getReachableConfigSet(input, s.configs, reach, t);
        if (reach.isEmpty) {
            if (!reach.hasSemanticContext) {
                // we got nowhere on t, don't throw out this knowledge; it'd
                // cause a failover from DFA later.
                this.addDFAEdge(s, t, ATNSimulator_1.ATNSimulator.ERROR);
            }
            // stop when we can't match any more char
            return ATNSimulator_1.ATNSimulator.ERROR;
        }
        // Add an edge from s to target DFA found/created for reach
        return this.addDFAEdge(s, t, reach);
    }
    failOrAccept(prevAccept, input, reach, t) {
        if (prevAccept.dfaState != null) {
            let lexerActionExecutor = prevAccept.dfaState.lexerActionExecutor;
            this.accept(input, lexerActionExecutor, this.startIndex, prevAccept.index, prevAccept.line, prevAccept.charPos);
            return prevAccept.dfaState.prediction;
        }
        else {
            // if no accept and EOF is first char, return EOF
            if (t === IntStream_1.IntStream.EOF && input.index === this.startIndex) {
                return Token_1.Token.EOF;
            }
            throw new LexerNoViableAltException_1.LexerNoViableAltException(this.recog, input, this.startIndex, reach);
        }
    }
    /** Given a starting configuration set, figure out all ATN configurations
     *  we can reach upon input {@code t}. Parameter {@code reach} is a return
     *  parameter.
     */
    getReachableConfigSet(input, closure, reach, t) {
        // this is used to skip processing for configs which have a lower priority
        // than a config that already reached an accept state for the same rule
        let skipAlt = ATN_1.ATN.INVALID_ALT_NUMBER;
        for (let c of Stubs_1.asIterable(closure)) {
            let currentAltReachedAcceptState = c.alt === skipAlt;
            if (currentAltReachedAcceptState && c.hasPassedThroughNonGreedyDecision) {
                continue;
            }
            if (LexerATNSimulator.debug) {
                console.log(`testing ${this.getTokenName(t)} at ${c.toString(this.recog, true)}`);
            }
            let n = c.state.numberOfOptimizedTransitions;
            for (let ti = 0; ti < n; ti++) {
                let trans = c.state.getOptimizedTransition(ti);
                let target = this.getReachableTarget(trans, t);
                if (target != null) {
                    let lexerActionExecutor = c.lexerActionExecutor;
                    let config;
                    if (lexerActionExecutor != null) {
                        lexerActionExecutor = lexerActionExecutor.fixOffsetBeforeMatch(input.index - this.startIndex);
                        config = c.transform(target, true, lexerActionExecutor);
                    }
                    else {
                        assert(c.lexerActionExecutor == null);
                        config = c.transform(target, true);
                    }
                    let treatEofAsEpsilon = t === IntStream_1.IntStream.EOF;
                    if (this.closure(input, config, reach, currentAltReachedAcceptState, true, treatEofAsEpsilon)) {
                        // any remaining configs for this alt have a lower priority than
                        // the one that just reached an accept state.
                        skipAlt = c.alt;
                        break;
                    }
                }
            }
        }
    }
    accept(input, lexerActionExecutor, startIndex, index, line, charPos) {
        if (LexerATNSimulator.debug) {
            console.log(`ACTION ${lexerActionExecutor}`);
        }
        // seek to after last char in token
        input.seek(index);
        this._line = line;
        this._charPositionInLine = charPos;
        if (lexerActionExecutor != null && this.recog != null) {
            lexerActionExecutor.execute(this.recog, input, startIndex);
        }
    }
    getReachableTarget(trans, t) {
        if (trans.matches(t, Lexer_1.Lexer.MIN_CHAR_VALUE, Lexer_1.Lexer.MAX_CHAR_VALUE)) {
            return trans.target;
        }
        return undefined;
    }
    computeStartState(input, p) {
        let initialContext = PredictionContext_1.PredictionContext.EMPTY_FULL;
        let configs = new OrderedATNConfigSet_1.OrderedATNConfigSet();
        for (let i = 0; i < p.numberOfTransitions; i++) {
            let target = p.transition(i).target;
            let c = ATNConfig_1.ATNConfig.create(target, i + 1, initialContext);
            this.closure(input, c, configs, false, false, false);
        }
        return configs;
    }
    /**
     * Since the alternatives within any lexer decision are ordered by
     * preference, this method stops pursuing the closure as soon as an accept
     * state is reached. After the first accept state is reached by depth-first
     * search from {@code config}, all other (potentially reachable) states for
     * this rule would have a lower priority.
     *
     * @return {@code true} if an accept state is reached, otherwise
     * {@code false}.
     */
    closure(input, config, configs, currentAltReachedAcceptState, speculative, treatEofAsEpsilon) {
        if (LexerATNSimulator.debug) {
            console.log("closure(" + config.toString(this.recog, true) + ")");
        }
        if (config.state instanceof RuleStopState_1.RuleStopState) {
            if (LexerATNSimulator.debug) {
                if (this.recog != null) {
                    console.log(`closure at ${this.recog.ruleNames[config.state.ruleIndex]} rule stop ${config}`);
                }
                else {
                    console.log(`closure at rule stop ${config}`);
                }
            }
            let context = config.context;
            if (context.isEmpty) {
                configs.add(config);
                return true;
            }
            else if (context.hasEmpty) {
                configs.add(config.transform(config.state, true, PredictionContext_1.PredictionContext.EMPTY_FULL));
                currentAltReachedAcceptState = true;
            }
            for (let i = 0; i < context.size; i++) {
                let returnStateNumber = context.getReturnState(i);
                if (returnStateNumber == PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY) {
                    continue;
                }
                let newContext = context.getParent(i); // "pop" return state
                let returnState = this.atn.states[returnStateNumber];
                let c = config.transform(returnState, false, newContext);
                currentAltReachedAcceptState = this.closure(input, c, configs, currentAltReachedAcceptState, speculative, treatEofAsEpsilon);
            }
            return currentAltReachedAcceptState;
        }
        // optimization
        if (!config.state.onlyHasEpsilonTransitions) {
            if (!currentAltReachedAcceptState || !config.hasPassedThroughNonGreedyDecision) {
                configs.add(config);
            }
        }
        let p = config.state;
        for (let i = 0; i < p.numberOfOptimizedTransitions; i++) {
            let t = p.getOptimizedTransition(i);
            let c = this.getEpsilonTarget(input, config, t, configs, speculative, treatEofAsEpsilon);
            if (c != null) {
                currentAltReachedAcceptState = this.closure(input, c, configs, currentAltReachedAcceptState, speculative, treatEofAsEpsilon);
            }
        }
        return currentAltReachedAcceptState;
    }
    // side-effect: can alter configs.hasSemanticContext
    getEpsilonTarget(input, config, t, configs, speculative, treatEofAsEpsilon) {
        let c;
        switch (t.serializationType) {
            case 3 /* RULE */:
                let ruleTransition = t;
                if (this.optimize_tail_calls && ruleTransition.optimizedTailCall && !config.context.hasEmpty) {
                    c = config.transform(t.target, true);
                }
                else {
                    let newContext = config.context.getChild(ruleTransition.followState.stateNumber);
                    c = config.transform(t.target, true, newContext);
                }
                break;
            case 10 /* PRECEDENCE */:
                throw new Error("Precedence predicates are not supported in lexers.");
            case 4 /* PREDICATE */:
                /*  Track traversing semantic predicates. If we traverse,
                    we cannot add a DFA state for this "reach" computation
                    because the DFA would not test the predicate again in the
                    future. Rather than creating collections of semantic predicates
                    like v3 and testing them on prediction, v4 will test them on the
                    fly all the time using the ATN not the DFA. This is slower but
                    semantically it's not used that often. One of the key elements to
                    this predicate mechanism is not adding DFA states that see
                    predicates immediately afterwards in the ATN. For example,
    
                    a : ID {p1}? | ID {p2}? ;
    
                    should create the start state for rule 'a' (to save start state
                    competition), but should not create target of ID state. The
                    collection of ATN states the following ID references includes
                    states reached by traversing predicates. Since this is when we
                    test them, we cannot cash the DFA state target of ID.
                */
                let pt = t;
                if (LexerATNSimulator.debug) {
                    console.log("EVAL rule " + pt.ruleIndex + ":" + pt.predIndex);
                }
                configs.hasSemanticContext = true;
                if (this.evaluatePredicate(input, pt.ruleIndex, pt.predIndex, speculative)) {
                    c = config.transform(t.target, true);
                }
                else {
                    c = undefined;
                }
                break;
            case 6 /* ACTION */:
                if (config.context.hasEmpty) {
                    // execute actions anywhere in the start rule for a token.
                    //
                    // TODO: if the entry rule is invoked recursively, some
                    // actions may be executed during the recursive call. The
                    // problem can appear when hasEmpty is true but
                    // isEmpty is false. In this case, the config needs to be
                    // split into two contexts - one with just the empty path
                    // and another with everything but the empty path.
                    // Unfortunately, the current algorithm does not allow
                    // getEpsilonTarget to return two configurations, so
                    // additional modifications are needed before we can support
                    // the split operation.
                    let lexerActionExecutor = LexerActionExecutor_1.LexerActionExecutor.append(config.lexerActionExecutor, this.atn.lexerActions[t.actionIndex]);
                    c = config.transform(t.target, true, lexerActionExecutor);
                    break;
                }
                else {
                    // ignore actions in referenced rules
                    c = config.transform(t.target, true);
                    break;
                }
            case 1 /* EPSILON */:
                c = config.transform(t.target, true);
                break;
            case 5 /* ATOM */:
            case 2 /* RANGE */:
            case 7 /* SET */:
                if (treatEofAsEpsilon) {
                    if (t.matches(IntStream_1.IntStream.EOF, Lexer_1.Lexer.MIN_CHAR_VALUE, Lexer_1.Lexer.MAX_CHAR_VALUE)) {
                        c = config.transform(t.target, false);
                        break;
                    }
                }
                c = undefined;
                break;
            default:
                c = undefined;
                break;
        }
        return c;
    }
    /**
     * Evaluate a predicate specified in the lexer.
     *
     * <p>If {@code speculative} is {@code true}, this method was called before
     * {@link #consume} for the matched character. This method should call
     * {@link #consume} before evaluating the predicate to ensure position
     * sensitive values, including {@link Lexer#getText}, {@link Lexer#getLine},
     * and {@link Lexer#getCharPositionInLine}, properly reflect the current
     * lexer state. This method should restore {@code input} and the simulator
     * to the original state before returning (i.e. undo the actions made by the
     * call to {@link #consume}.</p>
     *
     * @param input The input stream.
     * @param ruleIndex The rule containing the predicate.
     * @param predIndex The index of the predicate within the rule.
     * @param speculative {@code true} if the current index in {@code input} is
     * one character before the predicate's location.
     *
     * @return {@code true} if the specified predicate evaluates to
     * {@code true}.
     */
    evaluatePredicate(input, ruleIndex, predIndex, speculative) {
        // assume true if no recognizer was provided
        if (this.recog == null) {
            return true;
        }
        if (!speculative) {
            return this.recog.sempred(undefined, ruleIndex, predIndex);
        }
        let savedCharPositionInLine = this._charPositionInLine;
        let savedLine = this._line;
        let index = input.index;
        let marker = input.mark();
        try {
            this.consume(input);
            return this.recog.sempred(undefined, ruleIndex, predIndex);
        }
        finally {
            this._charPositionInLine = savedCharPositionInLine;
            this._line = savedLine;
            input.seek(index);
            input.release(marker);
        }
    }
    captureSimState(settings, input, dfaState) {
        settings.index = input.index;
        settings.line = this._line;
        settings.charPos = this._charPositionInLine;
        settings.dfaState = dfaState;
    }
    addDFAEdge(p, t, q) {
        if (q instanceof ATNConfigSet_1.ATNConfigSet) {
            /* leading to this call, ATNConfigSet.hasSemanticContext is used as a
            * marker indicating dynamic predicate evaluation makes this edge
            * dependent on the specific input sequence, so the static edge in the
            * DFA should be omitted. The target DFAState is still created since
            * execATN has the ability to resynchronize with the DFA state cache
            * following the predicate evaluation step.
            *
            * TJP notes: next time through the DFA, we see a pred again and eval.
            * If that gets us to a previously created (but dangling) DFA
            * state, we can continue in pure DFA mode from there.
            */
            let suppressEdge = q.hasSemanticContext;
            if (suppressEdge) {
                q.hasSemanticContext = false;
            }
            // @NotNull
            let to = this.addDFAState(q);
            if (suppressEdge) {
                return to;
            }
            this.addDFAEdge(p, t, to);
            return to;
        }
        else {
            if (LexerATNSimulator.debug) {
                console.log("EDGE " + p + " -> " + q + " upon " + String.fromCharCode(t));
            }
            if (p != null) {
                p.setTarget(t, q);
            }
        }
    }
    /** Add a new DFA state if there isn't one with this set of
        configurations already. This method also detects the first
        configuration containing an ATN rule stop state. Later, when
        traversing the DFA, we will know which rule to accept.
     */
    addDFAState(configs) {
        /* the lexer evaluates predicates on-the-fly; by this point configs
         * should not contain any configurations with unevaluated predicates.
         */
        assert(!configs.hasSemanticContext);
        let proposed = new DFAState_1.DFAState(configs);
        let existing = this.atn.modeToDFA[this.mode].states.get(proposed);
        if (existing != null)
            return existing;
        configs.optimizeConfigs(this);
        let newState = new DFAState_1.DFAState(configs.clone(true));
        let firstConfigWithRuleStopState = undefined;
        for (let c of Stubs_1.asIterable(configs)) {
            if (c.state instanceof RuleStopState_1.RuleStopState) {
                firstConfigWithRuleStopState = c;
                break;
            }
        }
        if (firstConfigWithRuleStopState != null) {
            let prediction = this.atn.ruleToTokenType[firstConfigWithRuleStopState.state.ruleIndex];
            let lexerActionExecutor = firstConfigWithRuleStopState.lexerActionExecutor;
            newState.acceptStateInfo = new AcceptStateInfo_1.AcceptStateInfo(prediction, lexerActionExecutor);
        }
        return this.atn.modeToDFA[this.mode].addState(newState);
    }
    getDFA(mode) {
        return this.atn.modeToDFA[mode];
    }
    /** Get the text matched so far for the current token.
     */
    getText(input) {
        // index is first lookahead char, don't include.
        return input.getText(Interval_1.Interval.of(this.startIndex, input.index - 1));
    }
    get line() {
        return this._line;
    }
    set line(line) {
        this._line = line;
    }
    get charPositionInLine() {
        return this._charPositionInLine;
    }
    set charPositionInLine(charPositionInLine) {
        this._charPositionInLine = charPositionInLine;
    }
    consume(input) {
        let curChar = input.LA(1);
        if (curChar == '\n'.charCodeAt(0)) {
            this._line++;
            this._charPositionInLine = 0;
        }
        else {
            this._charPositionInLine++;
        }
        input.consume();
    }
    getTokenName(t) {
        if (t === -1)
            return "EOF";
        //if ( atn.g!=null ) return atn.g.getTokenDisplayName(t);
        return "'" + String.fromCharCode(t) + "'";
    }
};
LexerATNSimulator.match_calls = 0;
__decorate([
    Decorators_1.NotNull
], LexerATNSimulator.prototype, "prevAccept", void 0);
__decorate([
    __param(0, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "copyState", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "match", null);
__decorate([
    Decorators_1.Override
], LexerATNSimulator.prototype, "reset", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "matchATN", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "execATN", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "getExistingTargetState", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "computeTargetState", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull), __param(2, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "getReachableConfigSet", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "accept", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "computeStartState", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull), __param(2, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "closure", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(2, Decorators_1.NotNull),
    __param(3, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "getEpsilonTarget", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "evaluatePredicate", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(2, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "captureSimState", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "addDFAState", null);
__decorate([
    Decorators_1.NotNull
], LexerATNSimulator.prototype, "getDFA", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "getText", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], LexerATNSimulator.prototype, "consume", null);
__decorate([
    Decorators_1.NotNull
], LexerATNSimulator.prototype, "getTokenName", null);
LexerATNSimulator = __decorate([
    __param(0, Decorators_1.NotNull)
], LexerATNSimulator);
exports.LexerATNSimulator = LexerATNSimulator;
(function (LexerATNSimulator) {
    LexerATNSimulator.debug = false;
    LexerATNSimulator.dfa_debug = false;
    /** When we hit an accept state in either the DFA or the ATN, we
     *  have to notify the character stream to start buffering characters
     *  via {@link IntStream#mark} and record the current state. The current sim state
     *  includes the current index into the input, the current line,
     *  and current character position in that line. Note that the Lexer is
     *  tracking the starting line and characterization of the token. These
     *  variables track the "state" of the simulator when it hits an accept state.
     *
     *  <p>We track these variables separately for the DFA and ATN simulation
     *  because the DFA simulation often has to fail over to the ATN
     *  simulation. If the ATN simulation fails, we need the DFA to fall
     *  back to its previously accepted state, if any. If the ATN succeeds,
     *  then the ATN does the accept and the DFA simulator that invoked it
     *  can simply return the predicted token type.</p>
     */
    class SimState {
        constructor() {
            this.index = -1;
            this.line = 0;
            this.charPos = -1;
        }
        reset() {
            this.index = -1;
            this.line = 0;
            this.charPos = -1;
            this.dfaState = undefined;
        }
    }
    LexerATNSimulator.SimState = SimState;
})(LexerATNSimulator = exports.LexerATNSimulator || (exports.LexerATNSimulator = {}));
exports.LexerATNSimulator = LexerATNSimulator;

},{"../Decorators":16,"../IntStream":22,"../Lexer":24,"../LexerNoViableAltException":26,"../Token":40,"../dfa/AcceptStateInfo":97,"../dfa/DFAState":100,"../misc/Interval":111,"../misc/Stubs":116,"./ATN":43,"./ATNConfig":44,"./ATNConfigSet":45,"./ATNSimulator":48,"./LexerActionExecutor":63,"./OrderedATNConfigSet":75,"./PredictionContext":81,"./RuleStopState":86,"assert":127}],63:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:28.8810453-07:00
const ArrayEqualityComparator_1 = require("../misc/ArrayEqualityComparator");
const LexerIndexedCustomAction_1 = require("./LexerIndexedCustomAction");
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
/**
 * Represents an executor for a sequence of lexer actions which traversed during
 * the matching operation of a lexer rule (token).
 *
 * <p>The executor tracks position information for position-dependent lexer actions
 * efficiently, ensuring that actions appearing only at the end of the rule do
 * not cause bloating of the {@link DFA} created for the lexer.</p>
 *
 * @author Sam Harwell
 * @since 4.2
 */
let LexerActionExecutor = class LexerActionExecutor {
    /**
     * Constructs an executor for a sequence of {@link LexerAction} actions.
     * @param lexerActions The lexer actions to execute.
     */
    constructor(lexerActions) {
        this._lexerActions = lexerActions;
        let hash = MurmurHash_1.MurmurHash.initialize();
        for (let lexerAction of lexerActions) {
            hash = MurmurHash_1.MurmurHash.update(hash, lexerAction);
        }
        this.cachedHashCode = MurmurHash_1.MurmurHash.finish(hash, lexerActions.length);
    }
    /**
     * Creates a {@link LexerActionExecutor} which executes the actions for
     * the input {@code lexerActionExecutor} followed by a specified
     * {@code lexerAction}.
     *
     * @param lexerActionExecutor The executor for actions already traversed by
     * the lexer while matching a token within a particular
     * {@link ATNConfig}. If this is {@code null}, the method behaves as though
     * it were an empty executor.
     * @param lexerAction The lexer action to execute after the actions
     * specified in {@code lexerActionExecutor}.
     *
     * @return A {@link LexerActionExecutor} for executing the combine actions
     * of {@code lexerActionExecutor} and {@code lexerAction}.
     */
    static append(lexerActionExecutor, lexerAction) {
        if (!lexerActionExecutor) {
            return new LexerActionExecutor([lexerAction]);
        }
        let lexerActions = lexerActionExecutor._lexerActions.slice(0);
        lexerActions.push(lexerAction);
        return new LexerActionExecutor(lexerActions);
    }
    /**
     * Creates a {@link LexerActionExecutor} which encodes the current offset
     * for position-dependent lexer actions.
     *
     * <p>Normally, when the executor encounters lexer actions where
     * {@link LexerAction#isPositionDependent} returns {@code true}, it calls
     * {@link IntStream#seek} on the input {@link CharStream} to set the input
     * position to the <em>end</em> of the current token. This behavior provides
     * for efficient DFA representation of lexer actions which appear at the end
     * of a lexer rule, even when the lexer rule matches a variable number of
     * characters.</p>
     *
     * <p>Prior to traversing a match transition in the ATN, the current offset
     * from the token start index is assigned to all position-dependent lexer
     * actions which have not already been assigned a fixed offset. By storing
     * the offsets relative to the token start index, the DFA representation of
     * lexer actions which appear in the middle of tokens remains efficient due
     * to sharing among tokens of the same length, regardless of their absolute
     * position in the input stream.</p>
     *
     * <p>If the current executor already has offsets assigned to all
     * position-dependent lexer actions, the method returns {@code this}.</p>
     *
     * @param offset The current offset to assign to all position-dependent
     * lexer actions which do not already have offsets assigned.
     *
     * @return A {@link LexerActionExecutor} which stores input stream offsets
     * for all position-dependent lexer actions.
     */
    fixOffsetBeforeMatch(offset) {
        let updatedLexerActions;
        for (let i = 0; i < this._lexerActions.length; i++) {
            if (this._lexerActions[i].isPositionDependent && !(this._lexerActions[i] instanceof LexerIndexedCustomAction_1.LexerIndexedCustomAction)) {
                if (!updatedLexerActions) {
                    updatedLexerActions = this._lexerActions.slice(0);
                }
                updatedLexerActions[i] = new LexerIndexedCustomAction_1.LexerIndexedCustomAction(offset, this._lexerActions[i]);
            }
        }
        if (!updatedLexerActions) {
            return this;
        }
        return new LexerActionExecutor(updatedLexerActions);
    }
    /**
     * Gets the lexer actions to be executed by this executor.
     * @return The lexer actions to be executed by this executor.
     */
    get lexerActions() {
        return this._lexerActions;
    }
    /**
     * Execute the actions encapsulated by this executor within the context of a
     * particular {@link Lexer}.
     *
     * <p>This method calls {@link IntStream#seek} to set the position of the
     * {@code input} {@link CharStream} prior to calling
     * {@link LexerAction#execute} on a position-dependent action. Before the
     * method returns, the input position will be restored to the same position
     * it was in when the method was invoked.</p>
     *
     * @param lexer The lexer instance.
     * @param input The input stream which is the source for the current token.
     * When this method is called, the current {@link IntStream#index} for
     * {@code input} should be the start of the following token, i.e. 1
     * character past the end of the current token.
     * @param startIndex The token start index. This value may be passed to
     * {@link IntStream#seek} to set the {@code input} position to the beginning
     * of the token.
     */
    execute(lexer, input, startIndex) {
        let requiresSeek = false;
        let stopIndex = input.index;
        try {
            for (let lexerAction of this._lexerActions) {
                if (lexerAction instanceof LexerIndexedCustomAction_1.LexerIndexedCustomAction) {
                    let offset = lexerAction.offset;
                    input.seek(startIndex + offset);
                    lexerAction = lexerAction.action;
                    requiresSeek = (startIndex + offset) !== stopIndex;
                }
                else if (lexerAction.isPositionDependent) {
                    input.seek(stopIndex);
                    requiresSeek = false;
                }
                lexerAction.execute(lexer);
            }
        }
        finally {
            if (requiresSeek) {
                input.seek(stopIndex);
            }
        }
    }
    hashCode() {
        return this.cachedHashCode;
    }
    equals(obj) {
        if (obj === this) {
            return true;
        }
        else if (!(obj instanceof LexerActionExecutor)) {
            return false;
        }
        return this.cachedHashCode === obj.cachedHashCode
            && ArrayEqualityComparator_1.ArrayEqualityComparator.INSTANCE.equals(this._lexerActions, obj._lexerActions);
    }
};
__decorate([
    Decorators_1.NotNull
], LexerActionExecutor.prototype, "_lexerActions", void 0);
__decorate([
    Decorators_1.NotNull
], LexerActionExecutor.prototype, "lexerActions", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], LexerActionExecutor.prototype, "execute", null);
__decorate([
    Decorators_1.Override
], LexerActionExecutor.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], LexerActionExecutor.prototype, "equals", null);
__decorate([
    Decorators_1.NotNull,
    __param(1, Decorators_1.NotNull)
], LexerActionExecutor, "append", null);
LexerActionExecutor = __decorate([
    __param(0, Decorators_1.NotNull)
], LexerActionExecutor);
exports.LexerActionExecutor = LexerActionExecutor;

},{"../Decorators":16,"../misc/ArrayEqualityComparator":105,"../misc/MurmurHash":113,"./LexerIndexedCustomAction":66}],64:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
/**
 * Implements the {@code channel} lexer action by calling
 * {@link Lexer#setChannel} with the assigned channel.
 *
 * @author Sam Harwell
 * @since 4.2
 */
class LexerChannelAction {
    /**
     * Constructs a new {@code channel} action with the specified channel value.
     * @param channel The channel value to pass to {@link Lexer#setChannel}.
     */
    constructor(channel) {
        this._channel = channel;
    }
    /**
     * Gets the channel to use for the {@link Token} created by the lexer.
     *
     * @return The channel to use for the {@link Token} created by the lexer.
     */
    get channel() {
        return this._channel;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@link LexerActionType#CHANNEL}.
     */
    get actionType() {
        return 0 /* CHANNEL */;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@code false}.
     */
    get isPositionDependent() {
        return false;
    }
    /**
     * {@inheritDoc}
     *
     * <p>This action is implemented by calling {@link Lexer#setChannel} with the
     * value provided by {@link #getChannel}.</p>
     */
    execute(lexer) {
        lexer.channel = this._channel;
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize();
        hash = MurmurHash_1.MurmurHash.update(hash, this.actionType);
        hash = MurmurHash_1.MurmurHash.update(hash, this._channel);
        return MurmurHash_1.MurmurHash.finish(hash, 2);
    }
    equals(obj) {
        if (obj === this) {
            return true;
        }
        else if (!(obj instanceof LexerChannelAction)) {
            return false;
        }
        return this._channel === obj._channel;
    }
    toString() {
        return `channel(${this._channel})`;
    }
}
__decorate([
    Decorators_1.Override
], LexerChannelAction.prototype, "actionType", null);
__decorate([
    Decorators_1.Override
], LexerChannelAction.prototype, "isPositionDependent", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], LexerChannelAction.prototype, "execute", null);
__decorate([
    Decorators_1.Override
], LexerChannelAction.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], LexerChannelAction.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], LexerChannelAction.prototype, "toString", null);
exports.LexerChannelAction = LexerChannelAction;

},{"../Decorators":16,"../misc/MurmurHash":113}],65:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
/**
 * Executes a custom lexer action by calling {@link Recognizer#action} with the
 * rule and action indexes assigned to the custom action. The implementation of
 * a custom action is added to the generated code for the lexer in an override
 * of {@link Recognizer#action} when the grammar is compiled.
 *
 * <p>This class may represent embedded actions created with the <code>{...}</code>
 * syntax in ANTLR 4, as well as actions created for lexer commands where the
 * command argument could not be evaluated when the grammar was compiled.</p>
 *
 * @author Sam Harwell
 * @since 4.2
 */
class LexerCustomAction {
    /**
     * Constructs a custom lexer action with the specified rule and action
     * indexes.
     *
     * @param ruleIndex The rule index to use for calls to
     * {@link Recognizer#action}.
     * @param actionIndex The action index to use for calls to
     * {@link Recognizer#action}.
     */
    constructor(ruleIndex, actionIndex) {
        this._ruleIndex = ruleIndex;
        this._actionIndex = actionIndex;
    }
    /**
     * Gets the rule index to use for calls to {@link Recognizer#action}.
     *
     * @return The rule index for the custom action.
     */
    get ruleIndex() {
        return this._ruleIndex;
    }
    /**
     * Gets the action index to use for calls to {@link Recognizer#action}.
     *
     * @return The action index for the custom action.
     */
    get actionIndex() {
        return this._actionIndex;
    }
    /**
     * {@inheritDoc}
     *
     * @return This method returns {@link LexerActionType#CUSTOM}.
     */
    get actionType() {
        return 1 /* CUSTOM */;
    }
    /**
     * Gets whether the lexer action is position-dependent. Position-dependent
     * actions may have different semantics depending on the {@link CharStream}
     * index at the time the action is executed.
     *
     * <p>Custom actions are position-dependent since they may represent a
     * user-defined embedded action which makes calls to methods like
     * {@link Lexer#getText}.</p>
     *
     * @return This method returns {@code true}.
     */
    get isPositionDependent() {
        return true;
    }
    /**
     * {@inheritDoc}
     *
     * <p>Custom actions are implemented by calling {@link Lexer#action} with the
     * appropriate rule and action indexes.</p>
     */
    execute(lexer) {
        lexer.action(undefined, this._ruleIndex, this._actionIndex);
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize();
        hash = MurmurHash_1.MurmurHash.update(hash, this.actionType);
        hash = MurmurHash_1.MurmurHash.update(hash, this._ruleIndex);
        hash = MurmurHash_1.MurmurHash.update(hash, this._actionIndex);
        return MurmurHash_1.MurmurHash.finish(hash, 3);
    }
    equals(obj) {
        if (obj === this) {
            return true;
        }
        else if (!(obj instanceof LexerCustomAction)) {
            return false;
        }
        return this._ruleIndex === obj._ruleIndex
            && this._actionIndex === obj._actionIndex;
    }
}
__decorate([
    Decorators_1.Override
], LexerCustomAction.prototype, "actionType", null);
__decorate([
    Decorators_1.Override
], LexerCustomAction.prototype, "isPositionDependent", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], LexerCustomAction.prototype, "execute", null);
__decorate([
    Decorators_1.Override
], LexerCustomAction.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], LexerCustomAction.prototype, "equals", null);
exports.LexerCustomAction = LexerCustomAction;

},{"../Decorators":16,"../misc/MurmurHash":113}],66:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
/**
 * This implementation of {@link LexerAction} is used for tracking input offsets
 * for position-dependent actions within a {@link LexerActionExecutor}.
 *
 * <p>This action is not serialized as part of the ATN, and is only required for
 * position-dependent lexer actions which appear at a location other than the
 * end of a rule. For more information about DFA optimizations employed for
 * lexer actions, see {@link LexerActionExecutor#append} and
 * {@link LexerActionExecutor#fixOffsetBeforeMatch}.</p>
 *
 * @author Sam Harwell
 * @since 4.2
 */
let LexerIndexedCustomAction = class LexerIndexedCustomAction {
    /**
     * Constructs a new indexed custom action by associating a character offset
     * with a {@link LexerAction}.
     *
     * <p>Note: This class is only required for lexer actions for which
     * {@link LexerAction#isPositionDependent} returns {@code true}.</p>
     *
     * @param offset The offset into the input {@link CharStream}, relative to
     * the token start index, at which the specified lexer action should be
     * executed.
     * @param action The lexer action to execute at a particular offset in the
     * input {@link CharStream}.
     */
    constructor(offset, action) {
        this._offset = offset;
        this._action = action;
    }
    /**
     * Gets the location in the input {@link CharStream} at which the lexer
     * action should be executed. The value is interpreted as an offset relative
     * to the token start index.
     *
     * @return The location in the input {@link CharStream} at which the lexer
     * action should be executed.
     */
    get offset() {
        return this._offset;
    }
    /**
     * Gets the lexer action to execute.
     *
     * @return A {@link LexerAction} object which executes the lexer action.
     */
    get action() {
        return this._action;
    }
    /**
     * {@inheritDoc}
     *
     * @return This method returns the result of calling {@link #getActionType}
     * on the {@link LexerAction} returned by {@link #getAction}.
     */
    get actionType() {
        return this._action.actionType;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@code true}.
     */
    get isPositionDependent() {
        return true;
    }
    /**
     * {@inheritDoc}
     *
     * <p>This method calls {@link #execute} on the result of {@link #getAction}
     * using the provided {@code lexer}.</p>
     */
    execute(lexer) {
        // assume the input stream position was properly set by the calling code
        this._action.execute(lexer);
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize();
        hash = MurmurHash_1.MurmurHash.update(hash, this._offset);
        hash = MurmurHash_1.MurmurHash.update(hash, this._action);
        return MurmurHash_1.MurmurHash.finish(hash, 2);
    }
    equals(obj) {
        if (obj === this) {
            return true;
        }
        else if (!(obj instanceof LexerIndexedCustomAction)) {
            return false;
        }
        return this._offset === obj._offset
            && this._action.equals(obj._action);
    }
};
__decorate([
    Decorators_1.NotNull
], LexerIndexedCustomAction.prototype, "action", null);
__decorate([
    Decorators_1.Override
], LexerIndexedCustomAction.prototype, "actionType", null);
__decorate([
    Decorators_1.Override
], LexerIndexedCustomAction.prototype, "isPositionDependent", null);
__decorate([
    Decorators_1.Override
], LexerIndexedCustomAction.prototype, "execute", null);
__decorate([
    Decorators_1.Override
], LexerIndexedCustomAction.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], LexerIndexedCustomAction.prototype, "equals", null);
LexerIndexedCustomAction = __decorate([
    __param(1, Decorators_1.NotNull)
], LexerIndexedCustomAction);
exports.LexerIndexedCustomAction = LexerIndexedCustomAction;

},{"../Decorators":16,"../misc/MurmurHash":113}],67:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
/**
 * Implements the {@code mode} lexer action by calling {@link Lexer#mode} with
 * the assigned mode.
 *
 * @author Sam Harwell
 * @since 4.2
 */
class LexerModeAction {
    /**
     * Constructs a new {@code mode} action with the specified mode value.
     * @param mode The mode value to pass to {@link Lexer#mode}.
     */
    constructor(mode) {
        this._mode = mode;
    }
    /**
     * Get the lexer mode this action should transition the lexer to.
     *
     * @return The lexer mode for this {@code mode} command.
     */
    get mode() {
        return this._mode;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@link LexerActionType#MODE}.
     */
    get actionType() {
        return 2 /* MODE */;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@code false}.
     */
    get isPositionDependent() {
        return false;
    }
    /**
     * {@inheritDoc}
     *
     * <p>This action is implemented by calling {@link Lexer#mode} with the
     * value provided by {@link #getMode}.</p>
     */
    execute(lexer) {
        lexer.mode(this._mode);
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize();
        hash = MurmurHash_1.MurmurHash.update(hash, this.actionType);
        hash = MurmurHash_1.MurmurHash.update(hash, this._mode);
        return MurmurHash_1.MurmurHash.finish(hash, 2);
    }
    equals(obj) {
        if (obj === this) {
            return true;
        }
        else if (!(obj instanceof LexerModeAction)) {
            return false;
        }
        return this._mode === obj._mode;
    }
    toString() {
        return `mode(${this._mode})`;
    }
}
__decorate([
    Decorators_1.Override
], LexerModeAction.prototype, "actionType", null);
__decorate([
    Decorators_1.Override
], LexerModeAction.prototype, "isPositionDependent", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], LexerModeAction.prototype, "execute", null);
__decorate([
    Decorators_1.Override
], LexerModeAction.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], LexerModeAction.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], LexerModeAction.prototype, "toString", null);
exports.LexerModeAction = LexerModeAction;

},{"../Decorators":16,"../misc/MurmurHash":113}],68:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
/**
 * Implements the {@code more} lexer action by calling {@link Lexer#more}.
 *
 * <p>The {@code more} command does not have any parameters, so this action is
 * implemented as a singleton instance exposed by {@link #INSTANCE}.</p>
 *
 * @author Sam Harwell
 * @since 4.2
 */
class LexerMoreAction {
    /**
     * Constructs the singleton instance of the lexer {@code more} command.
     */
    constructor() {
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@link LexerActionType#MORE}.
     */
    get actionType() {
        return 3 /* MORE */;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@code false}.
     */
    get isPositionDependent() {
        return false;
    }
    /**
     * {@inheritDoc}
     *
     * <p>This action is implemented by calling {@link Lexer#more}.</p>
     */
    execute(lexer) {
        lexer.more();
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize();
        hash = MurmurHash_1.MurmurHash.update(hash, this.actionType);
        return MurmurHash_1.MurmurHash.finish(hash, 1);
    }
    equals(obj) {
        return obj === this;
    }
    toString() {
        return "more";
    }
}
__decorate([
    Decorators_1.Override
], LexerMoreAction.prototype, "actionType", null);
__decorate([
    Decorators_1.Override
], LexerMoreAction.prototype, "isPositionDependent", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], LexerMoreAction.prototype, "execute", null);
__decorate([
    Decorators_1.Override
], LexerMoreAction.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], LexerMoreAction.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], LexerMoreAction.prototype, "toString", null);
exports.LexerMoreAction = LexerMoreAction;
(function (LexerMoreAction) {
    /**
     * Provides a singleton instance of this parameterless lexer action.
     */
    LexerMoreAction.INSTANCE = new LexerMoreAction();
})(LexerMoreAction = exports.LexerMoreAction || (exports.LexerMoreAction = {}));

},{"../Decorators":16,"../misc/MurmurHash":113}],69:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
/**
 * Implements the {@code popMode} lexer action by calling {@link Lexer#popMode}.
 *
 * <p>The {@code popMode} command does not have any parameters, so this action is
 * implemented as a singleton instance exposed by {@link #INSTANCE}.</p>
 *
 * @author Sam Harwell
 * @since 4.2
 */
class LexerPopModeAction {
    /**
     * Constructs the singleton instance of the lexer {@code popMode} command.
     */
    constructor() {
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@link LexerActionType#POP_MODE}.
     */
    get actionType() {
        return 4 /* POP_MODE */;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@code false}.
     */
    get isPositionDependent() {
        return false;
    }
    /**
     * {@inheritDoc}
     *
     * <p>This action is implemented by calling {@link Lexer#popMode}.</p>
     */
    execute(lexer) {
        lexer.popMode();
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize();
        hash = MurmurHash_1.MurmurHash.update(hash, this.actionType);
        return MurmurHash_1.MurmurHash.finish(hash, 1);
    }
    equals(obj) {
        return obj === this;
    }
    toString() {
        return "popMode";
    }
}
__decorate([
    Decorators_1.Override
], LexerPopModeAction.prototype, "actionType", null);
__decorate([
    Decorators_1.Override
], LexerPopModeAction.prototype, "isPositionDependent", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], LexerPopModeAction.prototype, "execute", null);
__decorate([
    Decorators_1.Override
], LexerPopModeAction.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], LexerPopModeAction.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], LexerPopModeAction.prototype, "toString", null);
exports.LexerPopModeAction = LexerPopModeAction;
(function (LexerPopModeAction) {
    /**
     * Provides a singleton instance of this parameterless lexer action.
     */
    LexerPopModeAction.INSTANCE = new LexerPopModeAction();
})(LexerPopModeAction = exports.LexerPopModeAction || (exports.LexerPopModeAction = {}));

},{"../Decorators":16,"../misc/MurmurHash":113}],70:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
/**
 * Implements the {@code pushMode} lexer action by calling
 * {@link Lexer#pushMode} with the assigned mode.
 *
 * @author Sam Harwell
 * @since 4.2
 */
class LexerPushModeAction {
    /**
     * Constructs a new {@code pushMode} action with the specified mode value.
     * @param mode The mode value to pass to {@link Lexer#pushMode}.
     */
    constructor(mode) {
        this._mode = mode;
    }
    /**
     * Get the lexer mode this action should transition the lexer to.
     *
     * @return The lexer mode for this {@code pushMode} command.
     */
    get mode() {
        return this._mode;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@link LexerActionType#PUSH_MODE}.
     */
    get actionType() {
        return 5 /* PUSH_MODE */;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@code false}.
     */
    get isPositionDependent() {
        return false;
    }
    /**
     * {@inheritDoc}
     *
     * <p>This action is implemented by calling {@link Lexer#pushMode} with the
     * value provided by {@link #getMode}.</p>
     */
    execute(lexer) {
        lexer.pushMode(this._mode);
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize();
        hash = MurmurHash_1.MurmurHash.update(hash, this.actionType);
        hash = MurmurHash_1.MurmurHash.update(hash, this._mode);
        return MurmurHash_1.MurmurHash.finish(hash, 2);
    }
    equals(obj) {
        if (obj === this) {
            return true;
        }
        else if (!(obj instanceof LexerPushModeAction)) {
            return false;
        }
        return this._mode === obj._mode;
    }
    toString() {
        return `pushMode(${this._mode})`;
    }
}
__decorate([
    Decorators_1.Override
], LexerPushModeAction.prototype, "actionType", null);
__decorate([
    Decorators_1.Override
], LexerPushModeAction.prototype, "isPositionDependent", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], LexerPushModeAction.prototype, "execute", null);
__decorate([
    Decorators_1.Override
], LexerPushModeAction.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], LexerPushModeAction.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], LexerPushModeAction.prototype, "toString", null);
exports.LexerPushModeAction = LexerPushModeAction;

},{"../Decorators":16,"../misc/MurmurHash":113}],71:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
/**
 * Implements the {@code skip} lexer action by calling {@link Lexer#skip}.
 *
 * <p>The {@code skip} command does not have any parameters, so this action is
 * implemented as a singleton instance exposed by {@link #INSTANCE}.</p>
 *
 * @author Sam Harwell
 * @since 4.2
 */
class LexerSkipAction {
    /**
     * Constructs the singleton instance of the lexer {@code skip} command.
     */
    constructor() {
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@link LexerActionType#SKIP}.
     */
    get actionType() {
        return 6 /* SKIP */;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@code false}.
     */
    get isPositionDependent() {
        return false;
    }
    /**
     * {@inheritDoc}
     *
     * <p>This action is implemented by calling {@link Lexer#skip}.</p>
     */
    execute(lexer) {
        lexer.skip();
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize();
        hash = MurmurHash_1.MurmurHash.update(hash, this.actionType);
        return MurmurHash_1.MurmurHash.finish(hash, 1);
    }
    equals(obj) {
        return obj === this;
    }
    toString() {
        return "skip";
    }
}
__decorate([
    Decorators_1.Override
], LexerSkipAction.prototype, "actionType", null);
__decorate([
    Decorators_1.Override
], LexerSkipAction.prototype, "isPositionDependent", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], LexerSkipAction.prototype, "execute", null);
__decorate([
    Decorators_1.Override
], LexerSkipAction.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], LexerSkipAction.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], LexerSkipAction.prototype, "toString", null);
exports.LexerSkipAction = LexerSkipAction;
(function (LexerSkipAction) {
    /**
     * Provides a singleton instance of this parameterless lexer action.
     */
    LexerSkipAction.INSTANCE = new LexerSkipAction();
})(LexerSkipAction = exports.LexerSkipAction || (exports.LexerSkipAction = {}));

},{"../Decorators":16,"../misc/MurmurHash":113}],72:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
/**
 * Implements the {@code type} lexer action by setting `Lexer.type`
 * with the assigned type.
 *
 * @author Sam Harwell
 * @since 4.2
 */
class LexerTypeAction {
    /**
     * Constructs a new {@code type} action with the specified token type value.
     * @param type The type to assign to the token using `Lexer.type`.
     */
    constructor(type) {
        this._type = type;
    }
    /**
     * Gets the type to assign to a token created by the lexer.
     * @return The type to assign to a token created by the lexer.
     */
    get type() {
        return this._type;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@link LexerActionType#TYPE}.
     */
    get actionType() {
        return 7 /* TYPE */;
    }
    /**
     * {@inheritDoc}
     * @return This method returns {@code false}.
     */
    get isPositionDependent() {
        return false;
    }
    /**
     * {@inheritDoc}
     *
     * <p>This action is implemented by setting `Lexer.type` with the
     * value provided by `type`.</p>
     */
    execute(lexer) {
        lexer.type = this._type;
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize();
        hash = MurmurHash_1.MurmurHash.update(hash, this.actionType);
        hash = MurmurHash_1.MurmurHash.update(hash, this._type);
        return MurmurHash_1.MurmurHash.finish(hash, 2);
    }
    equals(obj) {
        if (obj === this) {
            return true;
        }
        else if (!(obj instanceof LexerTypeAction)) {
            return false;
        }
        return this._type === obj._type;
    }
    toString() {
        return `type(${this._type})`;
    }
}
__decorate([
    Decorators_1.Override
], LexerTypeAction.prototype, "actionType", null);
__decorate([
    Decorators_1.Override
], LexerTypeAction.prototype, "isPositionDependent", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], LexerTypeAction.prototype, "execute", null);
__decorate([
    Decorators_1.Override
], LexerTypeAction.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], LexerTypeAction.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], LexerTypeAction.prototype, "toString", null);
exports.LexerTypeAction = LexerTypeAction;

},{"../Decorators":16,"../misc/MurmurHash":113}],73:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:30.7737978-07:00
const ATNState_1 = require("./ATNState");
const Decorators_1 = require("../Decorators");
/** Mark the end of a * or + loop. */
class LoopEndState extends ATNState_1.ATNState {
    get stateType() {
        return 12 /* LOOP_END */;
    }
}
__decorate([
    Decorators_1.Override
], LoopEndState.prototype, "stateType", null);
exports.LoopEndState = LoopEndState;

},{"../Decorators":16,"./ATNState":49}],74:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
const SetTransition_1 = require("./SetTransition");
let NotSetTransition = class NotSetTransition extends SetTransition_1.SetTransition {
    constructor(target, set) {
        super(target, set);
    }
    get serializationType() {
        return 8 /* NOT_SET */;
    }
    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return symbol >= minVocabSymbol
            && symbol <= maxVocabSymbol
            && !super.matches(symbol, minVocabSymbol, maxVocabSymbol);
    }
    toString() {
        return '~' + super.toString();
    }
};
__decorate([
    Decorators_1.Override
], NotSetTransition.prototype, "serializationType", null);
__decorate([
    Decorators_1.Override
], NotSetTransition.prototype, "matches", null);
__decorate([
    Decorators_1.Override
], NotSetTransition.prototype, "toString", null);
NotSetTransition = __decorate([
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.Nullable)
], NotSetTransition);
exports.NotSetTransition = NotSetTransition;

},{"../Decorators":16,"./SetTransition":89}],75:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ATNConfigSet_1 = require("./ATNConfigSet");
const Decorators_1 = require("../Decorators");
/**
 *
 * @author Sam Harwell
 */
class OrderedATNConfigSet extends ATNConfigSet_1.ATNConfigSet {
    constructor(set, readonly) {
        if (set != null && readonly != null) {
            super(set, readonly);
        }
        else {
            super();
        }
    }
    clone(readonly) {
        let copy = new OrderedATNConfigSet(this, readonly);
        if (!readonly && this.isReadOnly) {
            copy.addAll(this);
        }
        return copy;
    }
    getKey(e) {
        // This is a specially crafted key to ensure configurations are only merged if they are equal
        return { state: 0, alt: e.hashCode() };
    }
    canMerge(left, leftKey, right) {
        return left.equals(right);
    }
}
__decorate([
    Decorators_1.Override
], OrderedATNConfigSet.prototype, "clone", null);
__decorate([
    Decorators_1.Override
], OrderedATNConfigSet.prototype, "getKey", null);
__decorate([
    Decorators_1.Override
], OrderedATNConfigSet.prototype, "canMerge", null);
exports.OrderedATNConfigSet = OrderedATNConfigSet;

},{"../Decorators":16,"./ATNConfigSet":45}],76:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:31.1989835-07:00
const AcceptStateInfo_1 = require("../dfa/AcceptStateInfo");
const ActionTransition_1 = require("./ActionTransition");
const Array2DHashSet_1 = require("../misc/Array2DHashSet");
const Arrays_1 = require("../misc/Arrays");
const Stubs_1 = require("../misc/Stubs");
const ATN_1 = require("./ATN");
const ATNConfig_1 = require("./ATNConfig");
const ATNConfigSet_1 = require("./ATNConfigSet");
const ATNSimulator_1 = require("./ATNSimulator");
const AtomTransition_1 = require("./AtomTransition");
const BitSet_1 = require("../misc/BitSet");
const ConflictInfo_1 = require("./ConflictInfo");
const DecisionState_1 = require("./DecisionState");
const DFAState_1 = require("../dfa/DFAState");
const IntegerList_1 = require("../misc/IntegerList");
const Interval_1 = require("../misc/Interval");
const IntStream_1 = require("../IntStream");
const Decorators_1 = require("../Decorators");
const NotSetTransition_1 = require("./NotSetTransition");
const NoViableAltException_1 = require("../NoViableAltException");
const ObjectEqualityComparator_1 = require("../misc/ObjectEqualityComparator");
const ParserRuleContext_1 = require("../ParserRuleContext");
const PredictionContext_1 = require("./PredictionContext");
const PredictionContextCache_1 = require("./PredictionContextCache");
const PredictionMode_1 = require("./PredictionMode");
const RuleStopState_1 = require("./RuleStopState");
const RuleTransition_1 = require("./RuleTransition");
const SemanticContext_1 = require("./SemanticContext");
const SetTransition_1 = require("./SetTransition");
const SimulatorState_1 = require("./SimulatorState");
const Token_1 = require("../Token");
const VocabularyImpl_1 = require("../VocabularyImpl");
const assert = require("assert");
const MAX_SHORT_VALUE = 0xFFFF;
const MIN_INTEGER_VALUE = -((1 << 31) >>> 0);
/**
 * The embodiment of the adaptive LL(*), ALL(*), parsing strategy.
 *
 * <p>
 * The basic complexity of the adaptive strategy makes it harder to understand.
 * We begin with ATN simulation to build paths in a DFA. Subsequent prediction
 * requests go through the DFA first. If they reach a state without an edge for
 * the current symbol, the algorithm fails over to the ATN simulation to
 * complete the DFA path for the current input (until it finds a conflict state
 * or uniquely predicting state).</p>
 *
 * <p>
 * All of that is done without using the outer context because we want to create
 * a DFA that is not dependent upon the rule invocation stack when we do a
 * prediction. One DFA works in all contexts. We avoid using context not
 * necessarily because it's slower, although it can be, but because of the DFA
 * caching problem. The closure routine only considers the rule invocation stack
 * created during prediction beginning in the decision rule. For example, if
 * prediction occurs without invoking another rule's ATN, there are no context
 * stacks in the configurations. When lack of context leads to a conflict, we
 * don't know if it's an ambiguity or a weakness in the strong LL(*) parsing
 * strategy (versus full LL(*)).</p>
 *
 * <p>
 * When SLL yields a configuration set with conflict, we rewind the input and
 * retry the ATN simulation, this time using full outer context without adding
 * to the DFA. Configuration context stacks will be the full invocation stacks
 * from the start rule. If we get a conflict using full context, then we can
 * definitively say we have a true ambiguity for that input sequence. If we
 * don't get a conflict, it implies that the decision is sensitive to the outer
 * context. (It is not context-sensitive in the sense of context-sensitive
 * grammars.)</p>
 *
 * <p>
 * The next time we reach this DFA state with an SLL conflict, through DFA
 * simulation, we will again retry the ATN simulation using full context mode.
 * This is slow because we can't save the results and have to "interpret" the
 * ATN each time we get that input.</p>
 *
 * <p>
 * <strong>CACHING FULL CONTEXT PREDICTIONS</strong></p>
 *
 * <p>
 * We could cache results from full context to predicted alternative easily and
 * that saves a lot of time but doesn't work in presence of predicates. The set
 * of visible predicates from the ATN start state changes depending on the
 * context, because closure can fall off the end of a rule. I tried to cache
 * tuples (stack context, semantic context, predicted alt) but it was slower
 * than interpreting and much more complicated. Also required a huge amount of
 * memory. The goal is not to create the world's fastest parser anyway. I'd like
 * to keep this algorithm simple. By launching multiple threads, we can improve
 * the speed of parsing across a large number of files.</p>
 *
 * <p>
 * There is no strict ordering between the amount of input used by SLL vs LL,
 * which makes it really hard to build a cache for full context. Let's say that
 * we have input A B C that leads to an SLL conflict with full context X. That
 * implies that using X we might only use A B but we could also use A B C D to
 * resolve conflict. Input A B C D could predict alternative 1 in one position
 * in the input and A B C E could predict alternative 2 in another position in
 * input. The conflicting SLL configurations could still be non-unique in the
 * full context prediction, which would lead us to requiring more input than the
 * original A B C.	To make a	prediction cache work, we have to track	the exact
 * input	used during the previous prediction. That amounts to a cache that maps
 * X to a specific DFA for that context.</p>
 *
 * <p>
 * Something should be done for left-recursive expression predictions. They are
 * likely LL(1) + pred eval. Easier to do the whole SLL unless error and retry
 * with full LL thing Sam does.</p>
 *
 * <p>
 * <strong>AVOIDING FULL CONTEXT PREDICTION</strong></p>
 *
 * <p>
 * We avoid doing full context retry when the outer context is empty, we did not
 * dip into the outer context by falling off the end of the decision state rule,
 * or when we force SLL mode.</p>
 *
 * <p>
 * As an example of the not dip into outer context case, consider as super
 * constructor calls versus function calls. One grammar might look like
 * this:</p>
 *
 * <pre>
 * ctorBody
 *   : '{' superCall? stat* '}'
 *   ;
 * </pre>
 *
 * <p>
 * Or, you might see something like</p>
 *
 * <pre>
 * stat
 *   : superCall ';'
 *   | expression ';'
 *   | ...
 *   ;
 * </pre>
 *
 * <p>
 * In both cases I believe that no closure operations will dip into the outer
 * context. In the first case ctorBody in the worst case will stop at the '}'.
 * In the 2nd case it should stop at the ';'. Both cases should stay within the
 * entry rule and not dip into the outer context.</p>
 *
 * <p>
 * <strong>PREDICATES</strong></p>
 *
 * <p>
 * Predicates are always evaluated if present in either SLL or LL both. SLL and
 * LL simulation deals with predicates differently. SLL collects predicates as
 * it performs closure operations like ANTLR v3 did. It delays predicate
 * evaluation until it reaches and accept state. This allows us to cache the SLL
 * ATN simulation whereas, if we had evaluated predicates on-the-fly during
 * closure, the DFA state configuration sets would be different and we couldn't
 * build up a suitable DFA.</p>
 *
 * <p>
 * When building a DFA accept state during ATN simulation, we evaluate any
 * predicates and return the sole semantically valid alternative. If there is
 * more than 1 alternative, we report an ambiguity. If there are 0 alternatives,
 * we throw an exception. Alternatives without predicates act like they have
 * true predicates. The simple way to think about it is to strip away all
 * alternatives with false predicates and choose the minimum alternative that
 * remains.</p>
 *
 * <p>
 * When we start in the DFA and reach an accept state that's predicated, we test
 * those and return the minimum semantically viable alternative. If no
 * alternatives are viable, we throw an exception.</p>
 *
 * <p>
 * During full LL ATN simulation, closure always evaluates predicates and
 * on-the-fly. This is crucial to reducing the configuration set size during
 * closure. It hits a landmine when parsing with the Java grammar, for example,
 * without this on-the-fly evaluation.</p>
 *
 * <p>
 * <strong>SHARING DFA</strong></p>
 *
 * <p>
 * All instances of the same parser share the same decision DFAs through a
 * static field. Each instance gets its own ATN simulator but they share the
 * same {@link ATN#decisionToDFA} field. They also share a
 * {@link PredictionContextCache} object that makes sure that all
 * {@link PredictionContext} objects are shared among the DFA states. This makes
 * a big size difference.</p>
 *
 * <p>
 * <strong>THREAD SAFETY</strong></p>
 *
 * <p>
 * The {@link ParserATNSimulator} locks on the {@link ATN#decisionToDFA} field when
 * it adds a new DFA object to that array. {@link #addDFAEdge}
 * locks on the DFA for the current decision when setting the
 * {@link DFAState#edges} field. {@link #addDFAState} locks on
 * the DFA for the current decision when looking up a DFA state to see if it
 * already exists. We must make sure that all requests to add DFA states that
 * are equivalent result in the same shared DFA object. This is because lots of
 * threads will be trying to update the DFA at once. The
 * {@link #addDFAState} method also locks inside the DFA lock
 * but this time on the shared context cache when it rebuilds the
 * configurations' {@link PredictionContext} objects using cached
 * subgraphs/nodes. No other locking occurs, even during DFA simulation. This is
 * safe as long as we can guarantee that all threads referencing
 * {@code s.edge[t]} get the same physical target {@link DFAState}, or
 * {@code null}. Once into the DFA, the DFA simulation does not reference the
 * {@link DFA#states} map. It follows the {@link DFAState#edges} field to new
 * targets. The DFA simulator will either find {@link DFAState#edges} to be
 * {@code null}, to be non-{@code null} and {@code dfa.edges[t]} null, or
 * {@code dfa.edges[t]} to be non-null. The
 * {@link #addDFAEdge} method could be racing to set the field
 * but in either case the DFA simulator works; if {@code null}, and requests ATN
 * simulation. It could also race trying to get {@code dfa.edges[t]}, but either
 * way it will work because it's not doing a test and set operation.</p>
 *
 * <p>
 * <strong>Starting with SLL then failing to combined SLL/LL (Two-Stage
 * Parsing)</strong></p>
 *
 * <p>
 * Sam pointed out that if SLL does not give a syntax error, then there is no
 * point in doing full LL, which is slower. We only have to try LL if we get a
 * syntax error. For maximum speed, Sam starts the parser set to pure SLL
 * mode with the {@link BailErrorStrategy}:</p>
 *
 * <pre>
 * parser.interpreter.{@link #setPredictionMode setPredictionMode}{@code (}{@link PredictionMode#SLL}{@code )};
 * parser.{@link Parser#setErrorHandler setErrorHandler}(new {@link BailErrorStrategy}());
 * </pre>
 *
 * <p>
 * If it does not get a syntax error, then we're done. If it does get a syntax
 * error, we need to retry with the combined SLL/LL strategy.</p>
 *
 * <p>
 * The reason this works is as follows. If there are no SLL conflicts, then the
 * grammar is SLL (at least for that input set). If there is an SLL conflict,
 * the full LL analysis must yield a set of viable alternatives which is a
 * subset of the alternatives reported by SLL. If the LL set is a singleton,
 * then the grammar is LL but not SLL. If the LL set is the same size as the SLL
 * set, the decision is SLL. If the LL set has size &gt; 1, then that decision
 * is truly ambiguous on the current input. If the LL set is smaller, then the
 * SLL conflict resolution might choose an alternative that the full LL would
 * rule out as a possibility based upon better context information. If that's
 * the case, then the SLL parse will definitely get an error because the full LL
 * analysis says it's not viable. If SLL conflict resolution chooses an
 * alternative within the LL set, them both SLL and LL would choose the same
 * alternative because they both choose the minimum of multiple conflicting
 * alternatives.</p>
 *
 * <p>
 * Let's say we have a set of SLL conflicting alternatives {@code {1, 2, 3}} and
 * a smaller LL set called <em>s</em>. If <em>s</em> is {@code {2, 3}}, then SLL
 * parsing will get an error because SLL will pursue alternative 1. If
 * <em>s</em> is {@code {1, 2}} or {@code {1, 3}} then both SLL and LL will
 * choose the same alternative because alternative one is the minimum of either
 * set. If <em>s</em> is {@code {2}} or {@code {3}} then SLL will get a syntax
 * error. If <em>s</em> is {@code {1}} then SLL will succeed.</p>
 *
 * <p>
 * Of course, if the input is invalid, then we will get an error for sure in
 * both SLL and LL parsing. Erroneous input will therefore require 2 passes over
 * the input.</p>
 */
let ParserATNSimulator = class ParserATNSimulator extends ATNSimulator_1.ATNSimulator {
    constructor(atn, parser) {
        super(atn);
        this.predictionMode = PredictionMode_1.PredictionMode.LL;
        this.force_global_context = false;
        this.always_try_local_context = true;
        /**
         * Determines whether the DFA is used for full-context predictions. When
         * {@code true}, the DFA stores transition information for both full-context
         * and SLL parsing; otherwise, the DFA only stores SLL transition
         * information.
         *
         * <p>
         * For some grammars, enabling the full-context DFA can result in a
         * substantial performance improvement. However, this improvement typically
         * comes at the expense of memory used for storing the cached DFA states,
         * configuration sets, and prediction contexts.</p>
         *
         * <p>
         * The default value is {@code false}.</p>
         */
        this.enable_global_context_dfa = false;
        this.optimize_unique_closure = true;
        this.optimize_ll1 = true;
        this.optimize_tail_calls = true;
        this.tail_call_preserves_sll = true;
        this.treat_sllk1_conflict_as_ambiguity = false;
        /**
         * When {@code true}, ambiguous alternatives are reported when they are
         * encountered within {@link #execATN}. When {@code false}, these messages
         * are suppressed. The default is {@code false}.
         * <p>
         * When messages about ambiguous alternatives are not required, setting this
         * to {@code false} enables additional internal optimizations which may lose
         * this information.
         */
        this.reportAmbiguities = false;
        /** By default we do full context-sensitive LL(*) parsing not
         *  Strong LL(*) parsing. If we fail with Strong LL(*) we
         *  try full LL(*). That means we rewind and use context information
         *  when closure operations fall off the end of the rule that
         *  holds the decision were evaluating.
         */
        this.userWantsCtxSensitive = true;
        this._parser = parser;
    }
    getPredictionMode() {
        return this.predictionMode;
    }
    setPredictionMode(predictionMode) {
        this.predictionMode = predictionMode;
    }
    reset() {
    }
    adaptivePredict(input, decision, outerContext, useContext) {
        if (useContext === undefined) {
            useContext = false;
        }
        let dfa = this.atn.decisionToDFA[decision];
        assert(dfa != null);
        if (this.optimize_ll1 && !dfa.isPrecedenceDfa && !dfa.isEmpty) {
            let ll_1 = input.LA(1);
            if (ll_1 >= 0 && ll_1 <= 0xFFFF) {
                let key = ((decision << 16) >>> 0) + ll_1;
                let alt = this.atn.LL1Table.get(key);
                if (alt != null) {
                    return alt;
                }
            }
        }
        this.dfa = dfa;
        if (this.force_global_context) {
            useContext = true;
        }
        else if (!this.always_try_local_context) {
            useContext = useContext || dfa.isContextSensitive;
        }
        this.userWantsCtxSensitive = useContext || (this.predictionMode !== PredictionMode_1.PredictionMode.SLL && outerContext != null && !this.atn.decisionToState[decision].sll);
        if (outerContext == null) {
            outerContext = ParserRuleContext_1.ParserRuleContext.emptyContext();
        }
        let state;
        if (!dfa.isEmpty) {
            state = this.getStartState(dfa, input, outerContext, useContext);
        }
        if (state == null) {
            if (outerContext == null)
                outerContext = ParserRuleContext_1.ParserRuleContext.emptyContext();
            if (ParserATNSimulator.debug)
                console.log("ATN decision " + dfa.decision +
                    " exec LA(1)==" + this.getLookaheadName(input) +
                    ", outerContext=" + outerContext.toString(this._parser));
            state = this.computeStartState(dfa, outerContext, useContext);
        }
        let m = input.mark();
        let index = input.index;
        try {
            let alt = this.execDFA(dfa, input, index, state);
            if (ParserATNSimulator.debug)
                console.log("DFA after predictATN: " + dfa.toString(this._parser.vocabulary, this._parser.ruleNames));
            return alt;
        }
        finally {
            this.dfa = undefined;
            input.seek(index);
            input.release(m);
        }
    }
    getStartState(dfa, input, outerContext, useContext) {
        if (!useContext) {
            if (dfa.isPrecedenceDfa) {
                // the start state for a precedence DFA depends on the current
                // parser precedence, and is provided by a DFA method.
                let state = dfa.getPrecedenceStartState(this._parser.precedence, false);
                if (state == null) {
                    return undefined;
                }
                return new SimulatorState_1.SimulatorState(outerContext, state, false, outerContext);
            }
            else {
                if (dfa.s0 == null) {
                    return undefined;
                }
                return new SimulatorState_1.SimulatorState(outerContext, dfa.s0, false, outerContext);
            }
        }
        if (!this.enable_global_context_dfa) {
            return undefined;
        }
        let remainingContext = outerContext;
        assert(outerContext != null);
        let s0;
        if (dfa.isPrecedenceDfa) {
            s0 = dfa.getPrecedenceStartState(this._parser.precedence, true);
        }
        else {
            s0 = dfa.s0full;
        }
        while (remainingContext != null && s0 != null && s0.isContextSensitive) {
            remainingContext = this.skipTailCalls(remainingContext);
            s0 = s0.getContextTarget(this.getReturnState(remainingContext));
            if (remainingContext.isEmpty) {
                assert(s0 == null || !s0.isContextSensitive);
            }
            else {
                remainingContext = remainingContext.parent;
            }
        }
        if (s0 == null) {
            return undefined;
        }
        return new SimulatorState_1.SimulatorState(outerContext, s0, useContext, remainingContext);
    }
    execDFA(dfa, input, startIndex, state) {
        let outerContext = state.outerContext;
        if (ParserATNSimulator.dfa_debug)
            console.log("DFA decision " + dfa.decision +
                " exec LA(1)==" + this.getLookaheadName(input) +
                ", outerContext=" + outerContext.toString(this._parser));
        if (ParserATNSimulator.dfa_debug)
            console.log(dfa.toString(this._parser.vocabulary, this._parser.ruleNames));
        let s = state.s0;
        let t = input.LA(1);
        let remainingOuterContext = state.remainingOuterContext;
        while (true) {
            if (ParserATNSimulator.dfa_debug)
                console.log("DFA state " + s.stateNumber + " LA(1)==" + this.getLookaheadName(input));
            if (state.useContext) {
                while (s.isContextSymbol(t)) {
                    let next;
                    if (remainingOuterContext != null) {
                        remainingOuterContext = this.skipTailCalls(remainingOuterContext);
                        next = s.getContextTarget(this.getReturnState(remainingOuterContext));
                    }
                    if (next == null) {
                        // fail over to ATN
                        let initialState = new SimulatorState_1.SimulatorState(state.outerContext, s, state.useContext, remainingOuterContext);
                        return this.execATN(dfa, input, startIndex, initialState);
                    }
                    assert(remainingOuterContext != null);
                    remainingOuterContext = remainingOuterContext.parent;
                    s = next;
                }
            }
            if (this.isAcceptState(s, state.useContext)) {
                if (s.predicates != null) {
                    if (ParserATNSimulator.dfa_debug)
                        console.log("accept " + s);
                }
                else {
                    if (ParserATNSimulator.dfa_debug)
                        console.log("accept; predict " + s.prediction + " in state " + s.stateNumber);
                }
                // keep going unless we're at EOF or state only has one alt number
                // mentioned in configs; check if something else could match
                // TODO: don't we always stop? only lexer would keep going
                // TODO: v3 dfa don't do this.
                break;
            }
            // t is not updated if one of these states is reached
            assert(!this.isAcceptState(s, state.useContext));
            // if no edge, pop over to ATN interpreter, update DFA and return
            let target = this.getExistingTargetState(s, t);
            if (target == null) {
                if (ParserATNSimulator.dfa_debug && t >= 0)
                    console.log("no edge for " + this._parser.vocabulary.getDisplayName(t));
                let alt;
                if (ParserATNSimulator.dfa_debug) {
                    let interval = Interval_1.Interval.of(startIndex, this._parser.inputStream.index);
                    console.log("ATN exec upon " +
                        this._parser.inputStream.getText(interval) +
                        " at DFA state " + s.stateNumber);
                }
                let initialState = new SimulatorState_1.SimulatorState(outerContext, s, state.useContext, remainingOuterContext);
                alt = this.execATN(dfa, input, startIndex, initialState);
                if (ParserATNSimulator.dfa_debug) {
                    console.log("back from DFA update, alt=" + alt + ", dfa=\n" + dfa.toString(this._parser.vocabulary, this._parser.ruleNames));
                    //dump(dfa);
                }
                // action already executed
                if (ParserATNSimulator.dfa_debug)
                    console.log("DFA decision " + dfa.decision +
                        " predicts " + alt);
                return alt; // we've updated DFA, exec'd action, and have our deepest answer
            }
            else if (target === ATNSimulator_1.ATNSimulator.ERROR) {
                let errorState = new SimulatorState_1.SimulatorState(outerContext, s, state.useContext, remainingOuterContext);
                return this.handleNoViableAlt(input, startIndex, errorState);
            }
            s = target;
            if (!this.isAcceptState(s, state.useContext) && t !== IntStream_1.IntStream.EOF) {
                input.consume();
                t = input.LA(1);
            }
        }
        //		if ( acceptState==null ) {
        //			if ( debug ) System.out.println("!!! no viable alt in dfa");
        //			return -1;
        //		}
        if (!state.useContext && s.configs.conflictInfo != null) {
            if (dfa.atnStartState instanceof DecisionState_1.DecisionState) {
                if (!this.userWantsCtxSensitive ||
                    (!s.configs.dipsIntoOuterContext && s.configs.isExactConflict) ||
                    (this.treat_sllk1_conflict_as_ambiguity && input.index === startIndex)) {
                    // we don't report the ambiguity again
                    //if ( !this.acceptState.configset.hasSemanticContext ) {
                    // 	this.reportAmbiguity(dfa, acceptState, startIndex, input.index, acceptState.configset.conflictingAlts, acceptState.configset);
                    //}
                }
                else {
                    assert(!state.useContext);
                    // Before attempting full context prediction, check to see if there are
                    // disambiguating or validating predicates to evaluate which allow an
                    // immediate decision
                    let conflictingAlts;
                    let predicates = s.predicates;
                    if (predicates != null) {
                        let conflictIndex = input.index;
                        if (conflictIndex !== startIndex) {
                            input.seek(startIndex);
                        }
                        conflictingAlts = this.evalSemanticContext(predicates, outerContext, true);
                        if (conflictingAlts.cardinality() === 1) {
                            return conflictingAlts.nextSetBit(0);
                        }
                        if (conflictIndex !== startIndex) {
                            // restore the index so reporting the fallback to full
                            // context occurs with the index at the correct spot
                            input.seek(conflictIndex);
                        }
                    }
                    if (this.reportAmbiguities) {
                        let conflictState = new SimulatorState_1.SimulatorState(outerContext, s, state.useContext, remainingOuterContext);
                        this.reportAttemptingFullContext(dfa, conflictingAlts, conflictState, startIndex, input.index);
                    }
                    input.seek(startIndex);
                    return this.adaptivePredict(input, dfa.decision, outerContext, true);
                }
            }
        }
        // Before jumping to prediction, check to see if there are
        // disambiguating or validating predicates to evaluate
        let predicates = s.predicates;
        if (predicates != null) {
            let stopIndex = input.index;
            if (startIndex !== stopIndex) {
                input.seek(startIndex);
            }
            let alts = this.evalSemanticContext(predicates, outerContext, this.reportAmbiguities && this.predictionMode === PredictionMode_1.PredictionMode.LL_EXACT_AMBIG_DETECTION);
            switch (alts.cardinality()) {
                case 0:
                    throw this.noViableAlt(input, outerContext, s.configs, startIndex);
                case 1:
                    return alts.nextSetBit(0);
                default:
                    // report ambiguity after predicate evaluation to make sure the correct
                    // set of ambig alts is reported.
                    if (startIndex !== stopIndex) {
                        input.seek(stopIndex);
                    }
                    this.reportAmbiguity(dfa, s, startIndex, stopIndex, s.configs.isExactConflict, alts, s.configs);
                    return alts.nextSetBit(0);
            }
        }
        if (ParserATNSimulator.dfa_debug)
            console.log("DFA decision " + dfa.decision +
                " predicts " + s.prediction);
        return s.prediction;
    }
    /**
     * Determines if a particular DFA state should be treated as an accept state
     * for the current prediction mode. In addition to the {@code useContext}
     * parameter, the {@link #getPredictionMode()} method provides the
     * prediction mode controlling the prediction algorithm as a whole.
     *
     * <p>
     * The default implementation simply returns the value of
     * `DFAState.isAcceptState` except for conflict states when
     * {@code useContext} is {@code true} and {@link #getPredictionMode()} is
     * {@link PredictionMode#LL_EXACT_AMBIG_DETECTION}. In that case, only
     * conflict states where {@link ATNConfigSet#isExactConflict} is
     * {@code true} are considered accept states.
     * </p>
     *
     * @param state The DFA state to check.
     * @param useContext {@code true} if the prediction algorithm is currently
     * considering the full parser context; otherwise, {@code false} if the
     * algorithm is currently performing a local context prediction.
     *
     * @return {@code true} if the specified {@code state} is an accept state;
     * otherwise, {@code false}.
     */
    isAcceptState(state, useContext) {
        if (!state.isAcceptState) {
            return false;
        }
        if (state.configs.conflictingAlts == null) {
            // unambiguous
            return true;
        }
        // More picky when we need exact conflicts
        if (useContext && this.predictionMode === PredictionMode_1.PredictionMode.LL_EXACT_AMBIG_DETECTION) {
            return state.configs.isExactConflict;
        }
        return true;
    }
    /** Performs ATN simulation to compute a predicted alternative based
     *  upon the remaining input, but also updates the DFA cache to avoid
     *  having to traverse the ATN again for the same input sequence.

     There are some key conditions we're looking for after computing a new
     set of ATN configs (proposed DFA state):
           * if the set is empty, there is no viable alternative for current symbol
           * does the state uniquely predict an alternative?
           * does the state have a conflict that would prevent us from
             putting it on the work list?
           * if in non-greedy decision is there a config at a rule stop state?

     We also have some key operations to do:
           * add an edge from previous DFA state to potentially new DFA state, D,
             upon current symbol but only if adding to work list, which means in all
             cases except no viable alternative (and possibly non-greedy decisions?)
           * collecting predicates and adding semantic context to DFA accept states
           * adding rule context to context-sensitive DFA accept states
           * consuming an input symbol
           * reporting a conflict
           * reporting an ambiguity
           * reporting a context sensitivity
           * reporting insufficient predicates

     We should isolate those operations, which are side-effecting, to the
     main work loop. We can isolate lots of code into other functions, but
     they should be side effect free. They can return package that
     indicates whether we should report something, whether we need to add a
     DFA edge, whether we need to augment accept state with semantic
     context or rule invocation context. Actually, it seems like we always
     add predicates if they exist, so that can simply be done in the main
     loop for any accept state creation or modification request.

     cover these cases:
        dead end
        single alt
        single alt + preds
        conflict
        conflict + preds

     TODO: greedy + those

     */
    execATN(dfa, input, startIndex, initialState) {
        if (ParserATNSimulator.debug)
            console.log("execATN decision " + dfa.decision + " exec LA(1)==" + this.getLookaheadName(input));
        let outerContext = initialState.outerContext;
        let useContext = initialState.useContext;
        let t = input.LA(1);
        let previous = initialState;
        let contextCache = new PredictionContextCache_1.PredictionContextCache();
        while (true) {
            let nextState = this.computeReachSet(dfa, previous, t, contextCache);
            if (nextState == null) {
                this.setDFAEdge(previous.s0, input.LA(1), ATNSimulator_1.ATNSimulator.ERROR);
                return this.handleNoViableAlt(input, startIndex, previous);
            }
            let D = nextState.s0;
            // predicted alt => accept state
            assert(D.isAcceptState || D.prediction === ATN_1.ATN.INVALID_ALT_NUMBER);
            // conflicted => accept state
            assert(D.isAcceptState || D.configs.conflictInfo == null);
            if (this.isAcceptState(D, useContext)) {
                let conflictingAlts = D.configs.conflictingAlts;
                let predictedAlt = conflictingAlts == null ? D.prediction : ATN_1.ATN.INVALID_ALT_NUMBER;
                if (predictedAlt !== ATN_1.ATN.INVALID_ALT_NUMBER) {
                    if (this.optimize_ll1
                        && input.index === startIndex
                        && !dfa.isPrecedenceDfa
                        && nextState.outerContext === nextState.remainingOuterContext
                        && dfa.decision >= 0
                        && !D.configs.hasSemanticContext) {
                        if (t >= 0 && t <= MAX_SHORT_VALUE) {
                            let key = ((dfa.decision << 16) >>> 0) + t;
                            this.atn.LL1Table.set(key, predictedAlt);
                        }
                    }
                    if (useContext && this.always_try_local_context) {
                        this.reportContextSensitivity(dfa, predictedAlt, nextState, startIndex, input.index);
                    }
                }
                predictedAlt = D.prediction;
                //				int k = input.index - startIndex + 1; // how much input we used
                //				System.out.println("used k="+k);
                let attemptFullContext = conflictingAlts != null && this.userWantsCtxSensitive;
                if (attemptFullContext) {
                    // Only exact conflicts are known to be ambiguous when local
                    // prediction does not step out of the decision rule.
                    attemptFullContext = !useContext
                        && (D.configs.dipsIntoOuterContext || !D.configs.isExactConflict)
                        && (!this.treat_sllk1_conflict_as_ambiguity || input.index !== startIndex);
                }
                if (D.configs.hasSemanticContext) {
                    let predPredictions = D.predicates;
                    if (predPredictions != null) {
                        let conflictIndex = input.index;
                        if (conflictIndex !== startIndex) {
                            input.seek(startIndex);
                        }
                        // use complete evaluation here if we'll want to retry with full context if still ambiguous
                        conflictingAlts = this.evalSemanticContext(predPredictions, outerContext, attemptFullContext || this.reportAmbiguities);
                        switch (conflictingAlts.cardinality()) {
                            case 0:
                                throw this.noViableAlt(input, outerContext, D.configs, startIndex);
                            case 1:
                                return conflictingAlts.nextSetBit(0);
                            default:
                                break;
                        }
                        if (conflictIndex !== startIndex) {
                            // restore the index so reporting the fallback to full
                            // context occurs with the index at the correct spot
                            input.seek(conflictIndex);
                        }
                    }
                }
                if (!attemptFullContext) {
                    if (conflictingAlts != null) {
                        if (this.reportAmbiguities && conflictingAlts.cardinality() > 1) {
                            this.reportAmbiguity(dfa, D, startIndex, input.index, D.configs.isExactConflict, conflictingAlts, D.configs);
                        }
                        predictedAlt = conflictingAlts.nextSetBit(0);
                    }
                    return predictedAlt;
                }
                else {
                    assert(!useContext);
                    assert(this.isAcceptState(D, false));
                    if (ParserATNSimulator.debug)
                        console.log("RETRY with outerContext=" + outerContext);
                    let fullContextState = this.computeStartState(dfa, outerContext, true);
                    if (this.reportAmbiguities) {
                        this.reportAttemptingFullContext(dfa, conflictingAlts, nextState, startIndex, input.index);
                    }
                    input.seek(startIndex);
                    return this.execATN(dfa, input, startIndex, fullContextState);
                }
            }
            previous = nextState;
            if (t !== IntStream_1.IntStream.EOF) {
                input.consume();
                t = input.LA(1);
            }
        }
    }
    /**
     * This method is used to improve the localization of error messages by
     * choosing an alternative rather than throwing a
     * {@link NoViableAltException} in particular prediction scenarios where the
     * {@link #ERROR} state was reached during ATN simulation.
     *
     * <p>
     * The default implementation of this method uses the following
     * algorithm to identify an ATN configuration which successfully parsed the
     * decision entry rule. Choosing such an alternative ensures that the
     * {@link ParserRuleContext} returned by the calling rule will be complete
     * and valid, and the syntax error will be reported later at a more
     * localized location.</p>
     *
     * <ul>
     * <li>If no configuration in {@code configs} reached the end of the
     * decision rule, return {@link ATN#INVALID_ALT_NUMBER}.</li>
     * <li>If all configurations in {@code configs} which reached the end of the
     * decision rule predict the same alternative, return that alternative.</li>
     * <li>If the configurations in {@code configs} which reached the end of the
     * decision rule predict multiple alternatives (call this <em>S</em>),
     * choose an alternative in the following order.
     * <ol>
     * <li>Filter the configurations in {@code configs} to only those
     * configurations which remain viable after evaluating semantic predicates.
     * If the set of these filtered configurations which also reached the end of
     * the decision rule is not empty, return the minimum alternative
     * represented in this set.</li>
     * <li>Otherwise, choose the minimum alternative in <em>S</em>.</li>
     * </ol>
     * </li>
     * </ul>
     *
     * <p>
     * In some scenarios, the algorithm described above could predict an
     * alternative which will result in a {@link FailedPredicateException} in
     * parser. Specifically, this could occur if the <em>only</em> configuration
     * capable of successfully parsing to the end of the decision rule is
     * blocked by a semantic predicate. By choosing this alternative within
     * {@link #adaptivePredict} instead of throwing a
     * {@link NoViableAltException}, the resulting
     * {@link FailedPredicateException} in the parser will identify the specific
     * predicate which is preventing the parser from successfully parsing the
     * decision rule, which helps developers identify and correct logic errors
     * in semantic predicates.
     * </p>
     *
     * @param input The input {@link TokenStream}
     * @param startIndex The start index for the current prediction, which is
     * the input index where any semantic context in {@code configs} should be
     * evaluated
     * @param previous The ATN simulation state immediately before the
     * {@link #ERROR} state was reached
     *
     * @return The value to return from {@link #adaptivePredict}, or
     * {@link ATN#INVALID_ALT_NUMBER} if a suitable alternative was not
     * identified and {@link #adaptivePredict} should report an error instead.
     */
    handleNoViableAlt(input, startIndex, previous) {
        if (previous.s0 != null) {
            let alts = new BitSet_1.BitSet();
            let maxAlt = 0;
            for (let config of Stubs_1.asIterable(previous.s0.configs)) {
                if (config.reachesIntoOuterContext || config.state instanceof RuleStopState_1.RuleStopState) {
                    alts.set(config.alt);
                    maxAlt = Math.max(maxAlt, config.alt);
                }
            }
            switch (alts.cardinality()) {
                case 0:
                    break;
                case 1:
                    return alts.nextSetBit(0);
                default:
                    if (!previous.s0.configs.hasSemanticContext) {
                        // configs doesn't contain any predicates, so the predicate
                        // filtering code below would be pointless
                        return alts.nextSetBit(0);
                    }
                    /*
                     * Try to find a configuration set that not only dipped into the outer
                     * context, but also isn't eliminated by a predicate.
                     */
                    let filteredConfigs = new ATNConfigSet_1.ATNConfigSet();
                    for (let config of Stubs_1.asIterable(previous.s0.configs)) {
                        if (config.reachesIntoOuterContext || config.state instanceof RuleStopState_1.RuleStopState) {
                            filteredConfigs.add(config);
                        }
                    }
                    /* The following code blocks are adapted from predicateDFAState with
                     * the following key changes.
                     *
                     *  1. The code operates on an ATNConfigSet rather than a DFAState.
                     *  2. Predicates are collected for all alternatives represented in
                     *     filteredConfigs, rather than restricting the evaluation to
                     *     conflicting and/or unique configurations.
                     */
                    let altToPred = this.getPredsForAmbigAlts(alts, filteredConfigs, maxAlt);
                    if (altToPred != null) {
                        let predicates = this.getPredicatePredictions(alts, altToPred);
                        if (predicates != null) {
                            let stopIndex = input.index;
                            try {
                                input.seek(startIndex);
                                let filteredAlts = this.evalSemanticContext(predicates, previous.outerContext, false);
                                if (!filteredAlts.isEmpty) {
                                    return filteredAlts.nextSetBit(0);
                                }
                            }
                            finally {
                                input.seek(stopIndex);
                            }
                        }
                    }
                    return alts.nextSetBit(0);
            }
        }
        throw this.noViableAlt(input, previous.outerContext, previous.s0.configs, startIndex);
    }
    computeReachSet(dfa, previous, t, contextCache) {
        let useContext = previous.useContext;
        let remainingGlobalContext = previous.remainingOuterContext;
        let s = previous.s0;
        if (useContext) {
            while (s.isContextSymbol(t)) {
                let next;
                if (remainingGlobalContext != null) {
                    remainingGlobalContext = this.skipTailCalls(remainingGlobalContext);
                    next = s.getContextTarget(this.getReturnState(remainingGlobalContext));
                }
                if (next == null) {
                    break;
                }
                assert(remainingGlobalContext != null);
                remainingGlobalContext = remainingGlobalContext.parent;
                s = next;
            }
        }
        assert(!this.isAcceptState(s, useContext));
        if (this.isAcceptState(s, useContext)) {
            return new SimulatorState_1.SimulatorState(previous.outerContext, s, useContext, remainingGlobalContext);
        }
        let s0 = s;
        let target = this.getExistingTargetState(s0, t);
        if (target == null) {
            let result = this.computeTargetState(dfa, s0, remainingGlobalContext, t, useContext, contextCache);
            target = result[0];
            remainingGlobalContext = result[1];
        }
        if (target === ATNSimulator_1.ATNSimulator.ERROR) {
            return undefined;
        }
        assert(!useContext || !target.configs.dipsIntoOuterContext);
        return new SimulatorState_1.SimulatorState(previous.outerContext, target, useContext, remainingGlobalContext);
    }
    /**
     * Get an existing target state for an edge in the DFA. If the target state
     * for the edge has not yet been computed or is otherwise not available,
     * this method returns {@code null}.
     *
     * @param s The current DFA state
     * @param t The next input symbol
     * @return The existing target DFA state for the given input symbol
     * {@code t}, or {@code null} if the target state for this edge is not
     * already cached
     */
    getExistingTargetState(s, t) {
        return s.getTarget(t);
    }
    /**
     * Compute a target state for an edge in the DFA, and attempt to add the
     * computed state and corresponding edge to the DFA.
     *
     * @param dfa
     * @param s The current DFA state
     * @param remainingGlobalContext
     * @param t The next input symbol
     * @param useContext
     * @param contextCache
     *
     * @return The computed target DFA state for the given input symbol
     * {@code t}. If {@code t} does not lead to a valid DFA state, this method
     * returns {@link #ERROR}.
     */
    computeTargetState(dfa, s, remainingGlobalContext, t, useContext, contextCache) {
        let closureConfigs = s.configs.toArray();
        let contextElements;
        let reach = new ATNConfigSet_1.ATNConfigSet();
        let stepIntoGlobal;
        do {
            let hasMoreContext = !useContext || remainingGlobalContext != null;
            if (!hasMoreContext) {
                reach.isOutermostConfigSet = true;
            }
            let reachIntermediate = new ATNConfigSet_1.ATNConfigSet();
            /* Configurations already in a rule stop state indicate reaching the end
             * of the decision rule (local context) or end of the start rule (full
             * context). Once reached, these configurations are never updated by a
             * closure operation, so they are handled separately for the performance
             * advantage of having a smaller intermediate set when calling closure.
             *
             * For full-context reach operations, separate handling is required to
             * ensure that the alternative matching the longest overall sequence is
             * chosen when multiple such configurations can match the input.
             */
            let skippedStopStates;
            for (let c of closureConfigs) {
                if (ParserATNSimulator.debug)
                    console.log("testing " + this.getTokenName(t) + " at " + c.toString());
                if (c.state instanceof RuleStopState_1.RuleStopState) {
                    assert(c.context.isEmpty);
                    if (useContext && !c.reachesIntoOuterContext || t === IntStream_1.IntStream.EOF) {
                        if (skippedStopStates == null) {
                            skippedStopStates = [];
                        }
                        skippedStopStates.push(c);
                    }
                    continue;
                }
                let n = c.state.numberOfOptimizedTransitions;
                for (let ti = 0; ti < n; ti++) {
                    let trans = c.state.getOptimizedTransition(ti);
                    let target = this.getReachableTarget(c, trans, t);
                    if (target != null) {
                        reachIntermediate.add(c.transform(target, false), contextCache);
                    }
                }
            }
            /* This block optimizes the reach operation for intermediate sets which
             * trivially indicate a termination state for the overall
             * adaptivePredict operation.
             *
             * The conditions assume that intermediate
             * contains all configurations relevant to the reach set, but this
             * condition is not true when one or more configurations have been
             * withheld in skippedStopStates, or when the current symbol is EOF.
             */
            if (this.optimize_unique_closure && skippedStopStates == null && t !== Token_1.Token.EOF && reachIntermediate.uniqueAlt !== ATN_1.ATN.INVALID_ALT_NUMBER) {
                reachIntermediate.isOutermostConfigSet = reach.isOutermostConfigSet;
                reach = reachIntermediate;
                break;
            }
            /* If the reach set could not be trivially determined, perform a closure
             * operation on the intermediate set to compute its initial value.
             */
            let collectPredicates = false;
            let treatEofAsEpsilon = t === Token_1.Token.EOF;
            this.closure(reachIntermediate, reach, collectPredicates, hasMoreContext, contextCache, treatEofAsEpsilon);
            stepIntoGlobal = reach.dipsIntoOuterContext;
            if (t === IntStream_1.IntStream.EOF) {
                /* After consuming EOF no additional input is possible, so we are
                 * only interested in configurations which reached the end of the
                 * decision rule (local context) or end of the start rule (full
                 * context). Update reach to contain only these configurations. This
                 * handles both explicit EOF transitions in the grammar and implicit
                 * EOF transitions following the end of the decision or start rule.
                 *
                 * This is handled before the configurations in skippedStopStates,
                 * because any configurations potentially added from that list are
                 * already guaranteed to meet this condition whether or not it's
                 * required.
                 */
                reach = this.removeAllConfigsNotInRuleStopState(reach, contextCache);
            }
            /* If skippedStopStates is not null, then it contains at least one
             * configuration. For full-context reach operations, these
             * configurations reached the end of the start rule, in which case we
             * only add them back to reach if no configuration during the current
             * closure operation reached such a state. This ensures adaptivePredict
             * chooses an alternative matching the longest overall sequence when
             * multiple alternatives are viable.
             */
            if (skippedStopStates != null && (!useContext || !PredictionMode_1.PredictionMode.hasConfigInRuleStopState(reach))) {
                assert(skippedStopStates.length > 0);
                for (let c of skippedStopStates) {
                    reach.add(c, contextCache);
                }
            }
            if (useContext && stepIntoGlobal) {
                reach.clear();
                // We know remainingGlobalContext is not undefined at this point (why?)
                remainingGlobalContext = remainingGlobalContext;
                remainingGlobalContext = this.skipTailCalls(remainingGlobalContext);
                let nextContextElement = this.getReturnState(remainingGlobalContext);
                if (contextElements == null) {
                    contextElements = new IntegerList_1.IntegerList();
                }
                if (remainingGlobalContext.isEmpty) {
                    remainingGlobalContext = undefined;
                }
                else {
                    remainingGlobalContext = remainingGlobalContext.parent;
                }
                contextElements.add(nextContextElement);
                if (nextContextElement !== PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY) {
                    for (let i = 0; i < closureConfigs.length; i++) {
                        closureConfigs[i] = closureConfigs[i].appendContext(nextContextElement, contextCache);
                    }
                }
            }
        } while (useContext && stepIntoGlobal);
        if (reach.isEmpty) {
            this.setDFAEdge(s, t, ATNSimulator_1.ATNSimulator.ERROR);
            return [ATNSimulator_1.ATNSimulator.ERROR, remainingGlobalContext];
        }
        let result = this.addDFAEdge(dfa, s, t, contextElements, reach, contextCache);
        return [result, remainingGlobalContext];
    }
    /**
     * Return a configuration set containing only the configurations from
     * {@code configs} which are in a {@link RuleStopState}. If all
     * configurations in {@code configs} are already in a rule stop state, this
     * method simply returns {@code configs}.
     *
     * @param configs the configuration set to update
     * @param contextCache the {@link PredictionContext} cache
     *
     * @return {@code configs} if all configurations in {@code configs} are in a
     * rule stop state, otherwise return a new configuration set containing only
     * the configurations from {@code configs} which are in a rule stop state
     */
    removeAllConfigsNotInRuleStopState(configs, contextCache) {
        if (PredictionMode_1.PredictionMode.allConfigsInRuleStopStates(configs)) {
            return configs;
        }
        let result = new ATNConfigSet_1.ATNConfigSet();
        for (let config of Stubs_1.asIterable(configs)) {
            if (!(config.state instanceof RuleStopState_1.RuleStopState)) {
                continue;
            }
            result.add(config, contextCache);
        }
        return result;
    }
    computeStartState(dfa, globalContext, useContext) {
        let s0 = dfa.isPrecedenceDfa ? dfa.getPrecedenceStartState(this._parser.precedence, useContext) :
            useContext ? dfa.s0full :
                dfa.s0;
        if (s0 != null) {
            if (!useContext) {
                return new SimulatorState_1.SimulatorState(globalContext, s0, useContext, globalContext);
            }
            s0.setContextSensitive(this.atn);
        }
        let decision = dfa.decision;
        // @NotNull
        let p = dfa.atnStartState;
        let previousContext = 0;
        let remainingGlobalContext = globalContext;
        let initialContext = useContext ? PredictionContext_1.PredictionContext.EMPTY_FULL : PredictionContext_1.PredictionContext.EMPTY_LOCAL; // always at least the implicit call to start rule
        let contextCache = new PredictionContextCache_1.PredictionContextCache();
        if (useContext) {
            if (!this.enable_global_context_dfa) {
                while (remainingGlobalContext != null) {
                    if (remainingGlobalContext.isEmpty) {
                        previousContext = PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY;
                        remainingGlobalContext = undefined;
                    }
                    else {
                        previousContext = this.getReturnState(remainingGlobalContext);
                        initialContext = initialContext.appendSingleContext(previousContext, contextCache);
                        remainingGlobalContext = remainingGlobalContext.parent;
                    }
                }
            }
            while (s0 != null && s0.isContextSensitive && remainingGlobalContext != null) {
                let next;
                remainingGlobalContext = this.skipTailCalls(remainingGlobalContext);
                if (remainingGlobalContext.isEmpty) {
                    next = s0.getContextTarget(PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY);
                    previousContext = PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY;
                    remainingGlobalContext = undefined;
                }
                else {
                    previousContext = this.getReturnState(remainingGlobalContext);
                    next = s0.getContextTarget(previousContext);
                    initialContext = initialContext.appendSingleContext(previousContext, contextCache);
                    remainingGlobalContext = remainingGlobalContext.parent;
                }
                if (next == null) {
                    break;
                }
                s0 = next;
            }
        }
        if (s0 != null && !s0.isContextSensitive) {
            return new SimulatorState_1.SimulatorState(globalContext, s0, useContext, remainingGlobalContext);
        }
        let configs = new ATNConfigSet_1.ATNConfigSet();
        while (true) {
            let reachIntermediate = new ATNConfigSet_1.ATNConfigSet();
            let n = p.numberOfTransitions;
            for (let ti = 0; ti < n; ti++) {
                // for each transition
                let target = p.transition(ti).target;
                reachIntermediate.add(ATNConfig_1.ATNConfig.create(target, ti + 1, initialContext));
            }
            let hasMoreContext = remainingGlobalContext != null;
            if (!hasMoreContext) {
                configs.isOutermostConfigSet = true;
            }
            let collectPredicates = true;
            this.closure(reachIntermediate, configs, collectPredicates, hasMoreContext, contextCache, false);
            let stepIntoGlobal = configs.dipsIntoOuterContext;
            let next;
            if (useContext && !this.enable_global_context_dfa) {
                s0 = this.addDFAState(dfa, configs, contextCache);
                break;
            }
            else if (s0 == null) {
                if (!dfa.isPrecedenceDfa) {
                    next = this.addDFAState(dfa, configs, contextCache);
                    if (useContext) {
                        if (!dfa.s0full) {
                            dfa.s0full = next;
                        }
                        else {
                            next = dfa.s0full;
                        }
                    }
                    else {
                        if (!dfa.s0) {
                            dfa.s0 = next;
                        }
                        else {
                            next = dfa.s0;
                        }
                    }
                }
                else {
                    /* If this is a precedence DFA, we use applyPrecedenceFilter
                     * to convert the computed start state to a precedence start
                     * state. We then use DFA.setPrecedenceStartState to set the
                     * appropriate start state for the precedence level rather
                     * than simply setting DFA.s0.
                     */
                    configs = this.applyPrecedenceFilter(configs, globalContext, contextCache);
                    next = this.addDFAState(dfa, configs, contextCache);
                    dfa.setPrecedenceStartState(this._parser.precedence, useContext, next);
                }
            }
            else {
                if (dfa.isPrecedenceDfa) {
                    configs = this.applyPrecedenceFilter(configs, globalContext, contextCache);
                }
                next = this.addDFAState(dfa, configs, contextCache);
                s0.setContextTarget(previousContext, next);
            }
            s0 = next;
            if (!useContext || !stepIntoGlobal) {
                break;
            }
            // TODO: make sure it distinguishes empty stack states
            next.setContextSensitive(this.atn);
            // We know remainingGlobalContext is not undefined at this point (why?)
            remainingGlobalContext = remainingGlobalContext;
            configs.clear();
            remainingGlobalContext = this.skipTailCalls(remainingGlobalContext);
            let nextContextElement = this.getReturnState(remainingGlobalContext);
            if (remainingGlobalContext.isEmpty) {
                remainingGlobalContext = undefined;
            }
            else {
                remainingGlobalContext = remainingGlobalContext.parent;
            }
            if (nextContextElement !== PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY) {
                initialContext = initialContext.appendSingleContext(nextContextElement, contextCache);
            }
            previousContext = nextContextElement;
        }
        return new SimulatorState_1.SimulatorState(globalContext, s0, useContext, remainingGlobalContext);
    }
    /**
     * This method transforms the start state computed by
     * {@link #computeStartState} to the special start state used by a
     * precedence DFA for a particular precedence value. The transformation
     * process applies the following changes to the start state's configuration
     * set.
     *
     * <ol>
     * <li>Evaluate the precedence predicates for each configuration using
     * {@link SemanticContext#evalPrecedence}.</li>
     * <li>When {@link ATNConfig#isPrecedenceFilterSuppressed} is {@code false},
     * remove all configurations which predict an alternative greater than 1,
     * for which another configuration that predicts alternative 1 is in the
     * same ATN state with the same prediction context. This transformation is
     * valid for the following reasons:
     * <ul>
     * <li>The closure block cannot contain any epsilon transitions which bypass
     * the body of the closure, so all states reachable via alternative 1 are
     * part of the precedence alternatives of the transformed left-recursive
     * rule.</li>
     * <li>The "primary" portion of a left recursive rule cannot contain an
     * epsilon transition, so the only way an alternative other than 1 can exist
     * in a state that is also reachable via alternative 1 is by nesting calls
     * to the left-recursive rule, with the outer calls not being at the
     * preferred precedence level. The
     * {@link ATNConfig#isPrecedenceFilterSuppressed} property marks ATN
     * configurations which do not meet this condition, and therefore are not
     * eligible for elimination during the filtering process.</li>
     * </ul>
     * </li>
     * </ol>
     *
     * <p>
     * The prediction context must be considered by this filter to address
     * situations like the following.
     * </p>
     * <code>
     * <pre>
     * grammar TA;
     * prog: statement* EOF;
     * statement: letterA | statement letterA 'b' ;
     * letterA: 'a';
     * </pre>
     * </code>
     * <p>
     * If the above grammar, the ATN state immediately before the token
     * reference {@code 'a'} in {@code letterA} is reachable from the left edge
     * of both the primary and closure blocks of the left-recursive rule
     * {@code statement}. The prediction context associated with each of these
     * configurations distinguishes between them, and prevents the alternative
     * which stepped out to {@code prog} (and then back in to {@code statement}
     * from being eliminated by the filter.
     * </p>
     *
     * @param configs The configuration set computed by
     * {@link #computeStartState} as the start state for the DFA.
     * @return The transformed configuration set representing the start state
     * for a precedence DFA at a particular precedence level (determined by
     * calling {@link Parser#getPrecedence}).
     */
    applyPrecedenceFilter(configs, globalContext, contextCache) {
        let statesFromAlt1 = new Map();
        let configSet = new ATNConfigSet_1.ATNConfigSet();
        for (let config of Stubs_1.asIterable(configs)) {
            // handle alt 1 first
            if (config.alt !== 1) {
                continue;
            }
            let updatedContext = config.semanticContext.evalPrecedence(this._parser, globalContext);
            if (updatedContext == null) {
                // the configuration was eliminated
                continue;
            }
            statesFromAlt1.set(config.state.stateNumber, config.context);
            if (updatedContext !== config.semanticContext) {
                configSet.add(config.transform(config.state, false, updatedContext), contextCache);
            }
            else {
                configSet.add(config, contextCache);
            }
        }
        for (let config of Stubs_1.asIterable(configs)) {
            if (config.alt === 1) {
                // already handled
                continue;
            }
            if (!config.isPrecedenceFilterSuppressed) {
                /* In the future, this elimination step could be updated to also
                 * filter the prediction context for alternatives predicting alt>1
                 * (basically a graph subtraction algorithm).
                 */
                let context = statesFromAlt1.get(config.state.stateNumber);
                if (context != null && context.equals(config.context)) {
                    // eliminated
                    continue;
                }
            }
            configSet.add(config, contextCache);
        }
        return configSet;
    }
    getReachableTarget(source, trans, ttype) {
        if (trans.matches(ttype, 0, this.atn.maxTokenType)) {
            return trans.target;
        }
        return undefined;
    }
    /** collect and set D's semantic context */
    predicateDFAState(D, configs, nalts) {
        let conflictingAlts = this.getConflictingAltsFromConfigSet(configs);
        if (!conflictingAlts) {
            throw new Error("This unhandled scenario is intended to be unreachable, but I'm currently not sure of why we know that's the case.");
        }
        if (ParserATNSimulator.debug)
            console.log("predicateDFAState " + D);
        let altToPred = this.getPredsForAmbigAlts(conflictingAlts, configs, nalts);
        // altToPred[uniqueAlt] is now our validating predicate (if any)
        let predPredictions;
        if (altToPred != null) {
            // we have a validating predicate; test it
            // Update DFA so reach becomes accept state with predicate
            predPredictions = this.getPredicatePredictions(conflictingAlts, altToPred);
            D.predicates = predPredictions;
        }
        return predPredictions;
    }
    getPredsForAmbigAlts(ambigAlts, configs, nalts) {
        // REACH=[1|1|[]|0:0, 1|2|[]|0:1]
        /* altToPred starts as an array of all undefined contexts. The entry at index i
         * corresponds to alternative i. altToPred[i] may have one of three values:
         *   1. undefined: no ATNConfig c is found such that c.alt===i
         *   2. SemanticContext.NONE: At least one ATNConfig c exists such that
         *      c.alt===i and c.semanticContext===SemanticContext.NONE. In other words,
         *      alt i has at least one unpredicated config.
         *   3. Non-NONE Semantic Context: There exists at least one, and for all
         *      ATNConfig c such that c.alt===i, c.semanticContext!==SemanticContext.NONE.
         *
         * From this, it is clear that NONE||anything==NONE.
         */
        let altToPred = new Array(nalts + 1);
        let n = altToPred.length;
        for (let c of Stubs_1.asIterable(configs)) {
            if (ambigAlts.get(c.alt)) {
                altToPred[c.alt] = SemanticContext_1.SemanticContext.or(altToPred[c.alt], c.semanticContext);
            }
        }
        let nPredAlts = 0;
        for (let i = 0; i < n; i++) {
            if (altToPred[i] == null) {
                altToPred[i] = SemanticContext_1.SemanticContext.NONE;
            }
            else if (altToPred[i] !== SemanticContext_1.SemanticContext.NONE) {
                nPredAlts++;
            }
        }
        // At this point we know `altToPred` doesn't contain any undefined entries
        let result = altToPred;
        // nonambig alts are undefined in result
        if (nPredAlts === 0)
            result = undefined;
        if (ParserATNSimulator.debug)
            console.log("getPredsForAmbigAlts result " + (result ? Arrays_1.Arrays.toString(result) : "undefined"));
        return result;
    }
    getPredicatePredictions(ambigAlts, altToPred) {
        let pairs = [];
        let containsPredicate = false;
        for (let i = 1; i < altToPred.length; i++) {
            let pred = altToPred[i];
            // unpredicated is indicated by SemanticContext.NONE
            assert(pred != null);
            // find first unpredicated but ambig alternative, if any.
            // Only ambiguous alternatives will have SemanticContext.NONE.
            // Any unambig alts or ambig naked alts after first ambig naked are ignored
            // (null, i) means alt i is the default prediction
            // if no (null, i), then no default prediction.
            if (ambigAlts != null && ambigAlts.get(i) && pred === SemanticContext_1.SemanticContext.NONE) {
                pairs.push(new DFAState_1.DFAState.PredPrediction(pred, i));
            }
            else if (pred !== SemanticContext_1.SemanticContext.NONE) {
                containsPredicate = true;
                pairs.push(new DFAState_1.DFAState.PredPrediction(pred, i));
            }
        }
        if (!containsPredicate) {
            return undefined;
        }
        //		System.out.println(Arrays.toString(altToPred)+"->"+pairs);
        return pairs;
    }
    /** Look through a list of predicate/alt pairs, returning alts for the
     *  pairs that win. A {@code null} predicate indicates an alt containing an
     *  unpredicated config which behaves as "always true."
     */
    evalSemanticContext(predPredictions, outerContext, complete) {
        let predictions = new BitSet_1.BitSet();
        for (let pair of predPredictions) {
            if (pair.pred === SemanticContext_1.SemanticContext.NONE) {
                predictions.set(pair.alt);
                if (!complete) {
                    break;
                }
                continue;
            }
            let evaluatedResult = this.evalSemanticContextImpl(pair.pred, outerContext, pair.alt);
            if (ParserATNSimulator.debug || ParserATNSimulator.dfa_debug) {
                console.log("eval pred " + pair + "=" + evaluatedResult);
            }
            if (evaluatedResult) {
                if (ParserATNSimulator.debug || ParserATNSimulator.dfa_debug)
                    console.log("PREDICT " + pair.alt);
                predictions.set(pair.alt);
                if (!complete) {
                    break;
                }
            }
        }
        return predictions;
    }
    /**
     * Evaluate a semantic context within a specific parser context.
     *
     * <p>
     * This method might not be called for every semantic context evaluated
     * during the prediction process. In particular, we currently do not
     * evaluate the following but it may change in the future:</p>
     *
     * <ul>
     * <li>Precedence predicates (represented by
     * {@link SemanticContext.PrecedencePredicate}) are not currently evaluated
     * through this method.</li>
     * <li>Operator predicates (represented by {@link SemanticContext.AND} and
     * {@link SemanticContext.OR}) are evaluated as a single semantic
     * context, rather than evaluating the operands individually.
     * Implementations which require evaluation results from individual
     * predicates should override this method to explicitly handle evaluation of
     * the operands within operator predicates.</li>
     * </ul>
     *
     * @param pred The semantic context to evaluate
     * @param parserCallStack The parser context in which to evaluate the
     * semantic context
     * @param alt The alternative which is guarded by {@code pred}
     *
     * @since 4.3
     */
    evalSemanticContextImpl(pred, parserCallStack, alt) {
        return pred.eval(this._parser, parserCallStack);
    }
    /* TODO: If we are doing predicates, there is no point in pursuing
         closure operations if we reach a DFA state that uniquely predicts
         alternative. We will not be caching that DFA state and it is a
         waste to pursue the closure. Might have to advance when we do
         ambig detection thought :(
          */
    closure(sourceConfigs, configs, collectPredicates, hasMoreContext, contextCache, treatEofAsEpsilon) {
        if (contextCache == null) {
            contextCache = PredictionContextCache_1.PredictionContextCache.UNCACHED;
        }
        let currentConfigs = sourceConfigs;
        let closureBusy = new Array2DHashSet_1.Array2DHashSet(ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE);
        while (currentConfigs.size > 0) {
            let intermediate = new ATNConfigSet_1.ATNConfigSet();
            for (let config of Stubs_1.asIterable(currentConfigs)) {
                this.closureImpl(config, configs, intermediate, closureBusy, collectPredicates, hasMoreContext, contextCache, 0, treatEofAsEpsilon);
            }
            currentConfigs = intermediate;
        }
    }
    closureImpl(config, configs, intermediate, closureBusy, collectPredicates, hasMoreContexts, contextCache, depth, treatEofAsEpsilon) {
        if (ParserATNSimulator.debug)
            console.log("closure(" + config.toString(this._parser, true) + ")");
        if (config.state instanceof RuleStopState_1.RuleStopState) {
            // We hit rule end. If we have context info, use it
            if (!config.context.isEmpty) {
                let hasEmpty = config.context.hasEmpty;
                let nonEmptySize = config.context.size - (hasEmpty ? 1 : 0);
                for (let i = 0; i < nonEmptySize; i++) {
                    let newContext = config.context.getParent(i); // "pop" return state
                    let returnState = this.atn.states[config.context.getReturnState(i)];
                    let c = ATNConfig_1.ATNConfig.create(returnState, config.alt, newContext, config.semanticContext);
                    // While we have context to pop back from, we may have
                    // gotten that context AFTER having fallen off a rule.
                    // Make sure we track that we are now out of context.
                    c.outerContextDepth = config.outerContextDepth;
                    c.isPrecedenceFilterSuppressed = config.isPrecedenceFilterSuppressed;
                    assert(depth > MIN_INTEGER_VALUE);
                    this.closureImpl(c, configs, intermediate, closureBusy, collectPredicates, hasMoreContexts, contextCache, depth - 1, treatEofAsEpsilon);
                }
                if (!hasEmpty || !hasMoreContexts) {
                    return;
                }
                config = config.transform(config.state, false, PredictionContext_1.PredictionContext.EMPTY_LOCAL);
            }
            else if (!hasMoreContexts) {
                configs.add(config, contextCache);
                return;
            }
            else {
                // else if we have no context info, just chase follow links (if greedy)
                if (ParserATNSimulator.debug)
                    console.log("FALLING off rule " +
                        this.getRuleName(config.state.ruleIndex));
                if (config.context === PredictionContext_1.PredictionContext.EMPTY_FULL) {
                    // no need to keep full context overhead when we step out
                    config = config.transform(config.state, false, PredictionContext_1.PredictionContext.EMPTY_LOCAL);
                }
                else if (!config.reachesIntoOuterContext && PredictionContext_1.PredictionContext.isEmptyLocal(config.context)) {
                    // add stop state when leaving decision rule for the first time
                    configs.add(config, contextCache);
                }
            }
        }
        let p = config.state;
        // optimization
        if (!p.onlyHasEpsilonTransitions) {
            configs.add(config, contextCache);
            // make sure to not return here, because EOF transitions can act as
            // both epsilon transitions and non-epsilon transitions.
            if (ParserATNSimulator.debug)
                console.log("added config " + configs);
        }
        for (let i = 0; i < p.numberOfOptimizedTransitions; i++) {
            // This block implements first-edge elimination of ambiguous LR
            // alternatives as part of dynamic disambiguation during prediction.
            // See antlr/antlr4#1398.
            if (i === 0
                && p.stateType === 10 /* STAR_LOOP_ENTRY */
                && p.precedenceRuleDecision
                && !config.context.hasEmpty) {
                let precedenceDecision = p;
                // When suppress is true, it means the outgoing edge i==0 is
                // ambiguous with the outgoing edge i==1, and thus the closure
                // operation can dynamically disambiguate by suppressing this
                // edge during the closure operation.
                let suppress = true;
                for (let j = 0; j < config.context.size; j++) {
                    if (!precedenceDecision.precedenceLoopbackStates.get(config.context.getReturnState(j))) {
                        suppress = false;
                        break;
                    }
                }
                if (suppress) {
                    continue;
                }
            }
            let t = p.getOptimizedTransition(i);
            let continueCollecting = !(t instanceof ActionTransition_1.ActionTransition) && collectPredicates;
            let c = this.getEpsilonTarget(config, t, continueCollecting, depth === 0, contextCache, treatEofAsEpsilon);
            if (c != null) {
                if (t instanceof RuleTransition_1.RuleTransition) {
                    if (intermediate != null && !collectPredicates) {
                        intermediate.add(c, contextCache);
                        continue;
                    }
                }
                if (!t.isEpsilon && !closureBusy.add(c)) {
                    // avoid infinite recursion for EOF* and EOF+
                    continue;
                }
                let newDepth = depth;
                if (config.state instanceof RuleStopState_1.RuleStopState) {
                    // target fell off end of rule; mark resulting c as having dipped into outer context
                    // We can't get here if incoming config was rule stop and we had context
                    // track how far we dip into outer context.  Might
                    // come in handy and we avoid evaluating context dependent
                    // preds if this is > 0.
                    if (!closureBusy.add(c)) {
                        // avoid infinite recursion for right-recursive rules
                        continue;
                    }
                    if (this.dfa != null && this.dfa.isPrecedenceDfa) {
                        let outermostPrecedenceReturn = t.outermostPrecedenceReturn;
                        if (outermostPrecedenceReturn == this.dfa.atnStartState.ruleIndex) {
                            c.isPrecedenceFilterSuppressed = true;
                        }
                    }
                    c.outerContextDepth = c.outerContextDepth + 1;
                    assert(newDepth > MIN_INTEGER_VALUE);
                    newDepth--;
                    if (ParserATNSimulator.debug)
                        console.log("dips into outer ctx: " + c);
                }
                else if (t instanceof RuleTransition_1.RuleTransition) {
                    if (this.optimize_tail_calls && t.optimizedTailCall && (!this.tail_call_preserves_sll || !PredictionContext_1.PredictionContext.isEmptyLocal(config.context))) {
                        assert(c.context === config.context);
                        if (newDepth === 0) {
                            // the pop/push of a tail call would keep the depth
                            // constant, except we latch if it goes negative
                            newDepth--;
                            if (!this.tail_call_preserves_sll && PredictionContext_1.PredictionContext.isEmptyLocal(config.context)) {
                                // make sure the SLL config "dips into the outer context" or prediction may not fall back to LL on conflict
                                c.outerContextDepth = c.outerContextDepth + 1;
                            }
                        }
                    }
                    else {
                        // latch when newDepth goes negative - once we step out of the entry context we can't return
                        if (newDepth >= 0) {
                            newDepth++;
                        }
                    }
                }
                this.closureImpl(c, configs, intermediate, closureBusy, continueCollecting, hasMoreContexts, contextCache, newDepth, treatEofAsEpsilon);
            }
        }
    }
    getRuleName(index) {
        if (this._parser != null && index >= 0)
            return this._parser.ruleNames[index];
        return "<rule " + index + ">";
    }
    getEpsilonTarget(config, t, collectPredicates, inContext, contextCache, treatEofAsEpsilon) {
        switch (t.serializationType) {
            case 3 /* RULE */:
                return this.ruleTransition(config, t, contextCache);
            case 10 /* PRECEDENCE */:
                return this.precedenceTransition(config, t, collectPredicates, inContext);
            case 4 /* PREDICATE */:
                return this.predTransition(config, t, collectPredicates, inContext);
            case 6 /* ACTION */:
                return this.actionTransition(config, t);
            case 1 /* EPSILON */:
                return config.transform(t.target, false);
            case 5 /* ATOM */:
            case 2 /* RANGE */:
            case 7 /* SET */:
                // EOF transitions act like epsilon transitions after the first EOF
                // transition is traversed
                if (treatEofAsEpsilon) {
                    if (t.matches(Token_1.Token.EOF, 0, 1)) {
                        return config.transform(t.target, false);
                    }
                }
                return undefined;
            default:
                return undefined;
        }
    }
    actionTransition(config, t) {
        if (ParserATNSimulator.debug)
            console.log("ACTION edge " + t.ruleIndex + ":" + t.actionIndex);
        return config.transform(t.target, false);
    }
    precedenceTransition(config, pt, collectPredicates, inContext) {
        if (ParserATNSimulator.debug) {
            console.log("PRED (collectPredicates=" + collectPredicates + ") " +
                pt.precedence + ">=_p" +
                ", ctx dependent=true");
            if (this._parser != null) {
                console.log("context surrounding pred is " +
                    this._parser.getRuleInvocationStack());
            }
        }
        let c;
        if (collectPredicates && inContext) {
            let newSemCtx = SemanticContext_1.SemanticContext.and(config.semanticContext, pt.predicate);
            c = config.transform(pt.target, false, newSemCtx);
        }
        else {
            c = config.transform(pt.target, false);
        }
        if (ParserATNSimulator.debug)
            console.log("config from pred transition=" + c);
        return c;
    }
    predTransition(config, pt, collectPredicates, inContext) {
        if (ParserATNSimulator.debug) {
            console.log("PRED (collectPredicates=" + collectPredicates + ") " +
                pt.ruleIndex + ":" + pt.predIndex +
                ", ctx dependent=" + pt.isCtxDependent);
            if (this._parser != null) {
                console.log("context surrounding pred is " +
                    this._parser.getRuleInvocationStack());
            }
        }
        let c;
        if (collectPredicates &&
            (!pt.isCtxDependent || (pt.isCtxDependent && inContext))) {
            let newSemCtx = SemanticContext_1.SemanticContext.and(config.semanticContext, pt.predicate);
            c = config.transform(pt.target, false, newSemCtx);
        }
        else {
            c = config.transform(pt.target, false);
        }
        if (ParserATNSimulator.debug)
            console.log("config from pred transition=" + c);
        return c;
    }
    ruleTransition(config, t, contextCache) {
        if (ParserATNSimulator.debug) {
            console.log("CALL rule " + this.getRuleName(t.target.ruleIndex) +
                ", ctx=" + config.context);
        }
        let returnState = t.followState;
        let newContext;
        if (this.optimize_tail_calls && t.optimizedTailCall && (!this.tail_call_preserves_sll || !PredictionContext_1.PredictionContext.isEmptyLocal(config.context))) {
            newContext = config.context;
        }
        else if (contextCache != null) {
            newContext = contextCache.getChild(config.context, returnState.stateNumber);
        }
        else {
            newContext = config.context.getChild(returnState.stateNumber);
        }
        return config.transform(t.target, false, newContext);
    }
    isConflicted(configset, contextCache) {
        if (configset.uniqueAlt !== ATN_1.ATN.INVALID_ALT_NUMBER || configset.size <= 1) {
            return undefined;
        }
        let configs = configset.toArray();
        configs.sort(ParserATNSimulator.STATE_ALT_SORT_COMPARATOR);
        let exact = !configset.dipsIntoOuterContext;
        let alts = new BitSet_1.BitSet();
        let minAlt = configs[0].alt;
        alts.set(minAlt);
        /* Quick checks come first (single pass, no context joining):
         *  1. Make sure first config in the sorted list predicts the minimum
         *     represented alternative.
         *  2. Make sure every represented state has at least one configuration
         *     which predicts the minimum represented alternative.
         *  3. (exact only) make sure every represented state has at least one
         *     configuration which predicts each represented alternative.
         */
        // quick check 1 & 2 => if we assume #1 holds and check #2 against the
        // minAlt from the first state, #2 will fail if the assumption was
        // incorrect
        let currentState = configs[0].state.nonStopStateNumber;
        for (let config of configs) {
            let stateNumber = config.state.nonStopStateNumber;
            if (stateNumber !== currentState) {
                if (config.alt !== minAlt) {
                    return undefined;
                }
                currentState = stateNumber;
            }
        }
        let representedAlts;
        if (exact) {
            currentState = configs[0].state.nonStopStateNumber;
            // get the represented alternatives of the first state
            representedAlts = new BitSet_1.BitSet();
            let maxAlt = minAlt;
            for (let config of configs) {
                if (config.state.nonStopStateNumber != currentState) {
                    break;
                }
                let alt = config.alt;
                representedAlts.set(alt);
                maxAlt = alt;
            }
            // quick check #3:
            currentState = configs[0].state.nonStopStateNumber;
            let currentAlt = minAlt;
            for (let config of configs) {
                let stateNumber = config.state.nonStopStateNumber;
                let alt = config.alt;
                if (stateNumber !== currentState) {
                    if (currentAlt !== maxAlt) {
                        exact = false;
                        break;
                    }
                    currentState = stateNumber;
                    currentAlt = minAlt;
                }
                else if (alt !== currentAlt) {
                    if (alt !== representedAlts.nextSetBit(currentAlt + 1)) {
                        exact = false;
                        break;
                    }
                    currentAlt = alt;
                }
            }
        }
        currentState = configs[0].state.nonStopStateNumber;
        let firstIndexCurrentState = 0;
        let lastIndexCurrentStateMinAlt = 0;
        let joinedCheckContext = configs[0].context;
        for (let i = 1; i < configs.length; i++) {
            let config = configs[i];
            if (config.alt !== minAlt) {
                break;
            }
            if (config.state.nonStopStateNumber !== currentState) {
                break;
            }
            lastIndexCurrentStateMinAlt = i;
            joinedCheckContext = contextCache.join(joinedCheckContext, configs[i].context);
        }
        for (let i = lastIndexCurrentStateMinAlt + 1; i < configs.length; i++) {
            let config = configs[i];
            let state = config.state;
            alts.set(config.alt);
            if (state.nonStopStateNumber !== currentState) {
                currentState = state.nonStopStateNumber;
                firstIndexCurrentState = i;
                lastIndexCurrentStateMinAlt = i;
                joinedCheckContext = config.context;
                for (let j = firstIndexCurrentState + 1; j < configs.length; j++) {
                    let config2 = configs[j];
                    if (config2.alt !== minAlt) {
                        break;
                    }
                    if (config2.state.nonStopStateNumber !== currentState) {
                        break;
                    }
                    lastIndexCurrentStateMinAlt = j;
                    joinedCheckContext = contextCache.join(joinedCheckContext, config2.context);
                }
                i = lastIndexCurrentStateMinAlt;
                continue;
            }
            let joinedCheckContext2 = config.context;
            let currentAlt = config.alt;
            let lastIndexCurrentStateCurrentAlt = i;
            for (let j = lastIndexCurrentStateCurrentAlt + 1; j < configs.length; j++) {
                let config2 = configs[j];
                if (config2.alt !== currentAlt) {
                    break;
                }
                if (config2.state.nonStopStateNumber !== currentState) {
                    break;
                }
                lastIndexCurrentStateCurrentAlt = j;
                joinedCheckContext2 = contextCache.join(joinedCheckContext2, config2.context);
            }
            i = lastIndexCurrentStateCurrentAlt;
            let check = contextCache.join(joinedCheckContext, joinedCheckContext2);
            if (!joinedCheckContext.equals(check)) {
                return undefined;
            }
            // update exact if necessary
            exact = exact && joinedCheckContext.equals(joinedCheckContext2);
        }
        return new ConflictInfo_1.ConflictInfo(alts, exact);
    }
    getConflictingAltsFromConfigSet(configs) {
        let conflictingAlts = configs.conflictingAlts;
        if (conflictingAlts == null && configs.uniqueAlt !== ATN_1.ATN.INVALID_ALT_NUMBER) {
            conflictingAlts = new BitSet_1.BitSet();
            conflictingAlts.set(configs.uniqueAlt);
        }
        return conflictingAlts;
    }
    getTokenName(t) {
        if (t === Token_1.Token.EOF) {
            return "EOF";
        }
        let vocabulary = this._parser != null ? this._parser.vocabulary : VocabularyImpl_1.VocabularyImpl.EMPTY_VOCABULARY;
        let displayName = vocabulary.getDisplayName(t);
        if (displayName === String(t)) {
            return displayName;
        }
        return displayName + "<" + t + ">";
    }
    getLookaheadName(input) {
        return this.getTokenName(input.LA(1));
    }
    dumpDeadEndConfigs(nvae) {
        console.log("dead end configs: ");
        let deadEndConfigs = nvae.deadEndConfigs;
        if (!deadEndConfigs) {
            return;
        }
        for (let c of Stubs_1.asIterable(deadEndConfigs)) {
            let trans = "no edges";
            if (c.state.numberOfOptimizedTransitions > 0) {
                let t = c.state.getOptimizedTransition(0);
                if (t instanceof AtomTransition_1.AtomTransition) {
                    trans = "Atom " + this.getTokenName(t._label);
                }
                else if (t instanceof SetTransition_1.SetTransition) {
                    let not = t instanceof NotSetTransition_1.NotSetTransition;
                    trans = (not ? "~" : "") + "Set " + t.set.toString();
                }
            }
            console.log(c.toString(this._parser, true) + ":" + trans);
        }
    }
    noViableAlt(input, outerContext, configs, startIndex) {
        return new NoViableAltException_1.NoViableAltException(this._parser, input, input.get(startIndex), input.LT(1), configs, outerContext);
    }
    getUniqueAlt(configs) {
        let alt = ATN_1.ATN.INVALID_ALT_NUMBER;
        for (let c of Stubs_1.asIterable(configs)) {
            if (alt === ATN_1.ATN.INVALID_ALT_NUMBER) {
                alt = c.alt; // found first alt
            }
            else if (c.alt !== alt) {
                return ATN_1.ATN.INVALID_ALT_NUMBER;
            }
        }
        return alt;
    }
    configWithAltAtStopState(configs, alt) {
        for (let c of Stubs_1.asIterable(configs)) {
            if (c.alt === alt) {
                if (c.state instanceof RuleStopState_1.RuleStopState) {
                    return true;
                }
            }
        }
        return false;
    }
    addDFAEdge(dfa, fromState, t, contextTransitions, toConfigs, contextCache) {
        assert(contextTransitions == null || contextTransitions.isEmpty || dfa.isContextSensitive);
        let from = fromState;
        let to = this.addDFAState(dfa, toConfigs, contextCache);
        if (contextTransitions != null) {
            for (let context of contextTransitions.toArray()) {
                if (context === PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY) {
                    if (from.configs.isOutermostConfigSet) {
                        continue;
                    }
                }
                from.setContextSensitive(this.atn);
                from.setContextSymbol(t);
                let next = from.getContextTarget(context);
                if (next != null) {
                    from = next;
                    continue;
                }
                next = this.addDFAContextState(dfa, from.configs, context, contextCache);
                assert(context !== PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY || next.configs.isOutermostConfigSet);
                from.setContextTarget(context, next);
                from = next;
            }
        }
        if (ParserATNSimulator.debug)
            console.log("EDGE " + from + " -> " + to + " upon " + this.getTokenName(t));
        this.setDFAEdge(from, t, to);
        if (ParserATNSimulator.debug)
            console.log("DFA=\n" + dfa.toString(this._parser != null ? this._parser.vocabulary : VocabularyImpl_1.VocabularyImpl.EMPTY_VOCABULARY, this._parser != null ? this._parser.ruleNames : undefined));
        return to;
    }
    setDFAEdge(p, t, q) {
        if (p != null) {
            p.setTarget(t, q);
        }
    }
    /** See comment on LexerInterpreter.addDFAState. */
    addDFAContextState(dfa, configs, returnContext, contextCache) {
        if (returnContext !== PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY) {
            let contextConfigs = new ATNConfigSet_1.ATNConfigSet();
            for (let config of Stubs_1.asIterable(configs)) {
                contextConfigs.add(config.appendContext(returnContext, contextCache));
            }
            return this.addDFAState(dfa, contextConfigs, contextCache);
        }
        else {
            assert(!configs.isOutermostConfigSet, "Shouldn't be adding a duplicate edge.");
            configs = configs.clone(true);
            configs.isOutermostConfigSet = true;
            return this.addDFAState(dfa, configs, contextCache);
        }
    }
    /** See comment on LexerInterpreter.addDFAState. */
    addDFAState(dfa, configs, contextCache) {
        let enableDfa = this.enable_global_context_dfa || !configs.isOutermostConfigSet;
        if (enableDfa) {
            if (!configs.isReadOnly) {
                configs.optimizeConfigs(this);
            }
            let proposed = this.createDFAState(dfa, configs);
            let existing = dfa.states.get(proposed);
            if (existing != null)
                return existing;
        }
        if (!configs.isReadOnly) {
            if (configs.conflictInfo == null) {
                configs.conflictInfo = this.isConflicted(configs, contextCache);
            }
        }
        let newState = this.createDFAState(dfa, configs.clone(true));
        // getDecisionState won't return undefined when we request a known valid decision
        let decisionState = this.atn.getDecisionState(dfa.decision);
        let predictedAlt = this.getUniqueAlt(configs);
        if (predictedAlt !== ATN_1.ATN.INVALID_ALT_NUMBER) {
            newState.acceptStateInfo = new AcceptStateInfo_1.AcceptStateInfo(predictedAlt);
        }
        else if (configs.conflictingAlts != null) {
            let conflictingAlts = configs.conflictingAlts;
            if (conflictingAlts) {
                newState.acceptStateInfo = new AcceptStateInfo_1.AcceptStateInfo(conflictingAlts.nextSetBit(0));
            }
        }
        if (newState.isAcceptState && configs.hasSemanticContext) {
            this.predicateDFAState(newState, configs, decisionState.numberOfTransitions);
        }
        if (!enableDfa) {
            return newState;
        }
        let added = dfa.addState(newState);
        if (ParserATNSimulator.debug && added === newState)
            console.log("adding new DFA state: " + newState);
        return added;
    }
    createDFAState(dfa, configs) {
        return new DFAState_1.DFAState(configs);
    }
    reportAttemptingFullContext(dfa, conflictingAlts, conflictState, startIndex, stopIndex) {
        if (ParserATNSimulator.debug || ParserATNSimulator.retry_debug) {
            let interval = Interval_1.Interval.of(startIndex, stopIndex);
            console.log("reportAttemptingFullContext decision=" + dfa.decision + ":" + conflictState.s0.configs +
                ", input=" + this._parser.inputStream.getText(interval));
        }
        if (this._parser != null) {
            let listener = this._parser.getErrorListenerDispatch();
            if (listener.reportAttemptingFullContext) {
                listener.reportAttemptingFullContext(this._parser, dfa, startIndex, stopIndex, conflictingAlts, conflictState);
            }
        }
    }
    reportContextSensitivity(dfa, prediction, acceptState, startIndex, stopIndex) {
        if (ParserATNSimulator.debug || ParserATNSimulator.retry_debug) {
            let interval = Interval_1.Interval.of(startIndex, stopIndex);
            console.log("reportContextSensitivity decision=" + dfa.decision + ":" + acceptState.s0.configs +
                ", input=" + this._parser.inputStream.getText(interval));
        }
        if (this._parser != null) {
            let listener = this._parser.getErrorListenerDispatch();
            if (listener.reportContextSensitivity) {
                listener.reportContextSensitivity(this._parser, dfa, startIndex, stopIndex, prediction, acceptState);
            }
        }
    }
    /** If context sensitive parsing, we know it's ambiguity not conflict */
    reportAmbiguity(dfa, D, // the DFA state from execATN(): void that had SLL conflicts
        startIndex, stopIndex, exact, ambigAlts, configs) {
        if (ParserATNSimulator.debug || ParserATNSimulator.retry_debug) {
            let interval = Interval_1.Interval.of(startIndex, stopIndex);
            console.log("reportAmbiguity " +
                ambigAlts + ":" + configs +
                ", input=" + this._parser.inputStream.getText(interval));
        }
        if (this._parser != null) {
            let listener = this._parser.getErrorListenerDispatch();
            if (listener.reportAmbiguity) {
                listener.reportAmbiguity(this._parser, dfa, startIndex, stopIndex, exact, ambigAlts, configs);
            }
        }
    }
    getReturnState(context) {
        if (context.isEmpty) {
            return PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY;
        }
        let state = this.atn.states[context.invokingState];
        let transition = state.transition(0);
        return transition.followState.stateNumber;
    }
    skipTailCalls(context) {
        if (!this.optimize_tail_calls) {
            return context;
        }
        while (!context.isEmpty) {
            let state = this.atn.states[context.invokingState];
            assert(state.numberOfTransitions === 1 && state.transition(0).serializationType === 3 /* RULE */);
            let transition = state.transition(0);
            if (!transition.tailCall) {
                break;
            }
            // This method requires that the root ancestor of the ParserRuleContext be empty. If we make it to this
            // line, we know the current node is not empty, which means it does have a parent.
            context = context.parent;
        }
        return context;
    }
    /**
     * @since 4.3
     */
    get parser() {
        return this._parser;
    }
};
ParserATNSimulator.debug = false;
ParserATNSimulator.dfa_debug = false;
ParserATNSimulator.retry_debug = false;
ParserATNSimulator.STATE_ALT_SORT_COMPARATOR = (o1, o2) => {
    let diff = o1.state.nonStopStateNumber - o2.state.nonStopStateNumber;
    if (diff !== 0) {
        return diff;
    }
    diff = o1.alt - o2.alt;
    if (diff !== 0) {
        return diff;
    }
    return 0;
};
__decorate([
    Decorators_1.NotNull
], ParserATNSimulator.prototype, "predictionMode", void 0);
__decorate([
    Decorators_1.NotNull
], ParserATNSimulator.prototype, "getPredictionMode", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "setPredictionMode", null);
__decorate([
    Decorators_1.Override
], ParserATNSimulator.prototype, "reset", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "adaptivePredict", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(2, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "getStartState", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(3, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "execDFA", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(3, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "execATN", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(2, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "handleNoViableAlt", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "getExistingTargetState", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "computeTargetState", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "removeAllConfigsNotInRuleStopState", null);
__decorate([
    Decorators_1.NotNull
], ParserATNSimulator.prototype, "computeStartState", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "applyPrecedenceFilter", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "getReachableTarget", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "getPredsForAmbigAlts", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "evalSemanticContext", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "evalSemanticContextImpl", null);
__decorate([
    __param(1, Decorators_1.NotNull),
    __param(4, Decorators_1.Nullable)
], ParserATNSimulator.prototype, "closure", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(2, Decorators_1.Nullable),
    __param(3, Decorators_1.NotNull),
    __param(6, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "closureImpl", null);
__decorate([
    Decorators_1.NotNull
], ParserATNSimulator.prototype, "getRuleName", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "getEpsilonTarget", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "actionTransition", null);
__decorate([
    Decorators_1.Nullable,
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "precedenceTransition", null);
__decorate([
    Decorators_1.Nullable,
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "predTransition", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull), __param(2, Decorators_1.Nullable)
], ParserATNSimulator.prototype, "ruleTransition", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "isConflicted", null);
__decorate([
    Decorators_1.NotNull
], ParserATNSimulator.prototype, "getTokenName", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "dumpDeadEndConfigs", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(2, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "noViableAlt", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "getUniqueAlt", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "configWithAltAtStopState", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(4, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "addDFAEdge", null);
__decorate([
    __param(0, Decorators_1.Nullable), __param(2, Decorators_1.Nullable)
], ParserATNSimulator.prototype, "setDFAEdge", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "addDFAContextState", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "addDFAState", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "createDFAState", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(2, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "reportAttemptingFullContext", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(2, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "reportContextSensitivity", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(5, Decorators_1.NotNull),
    __param(6, Decorators_1.NotNull)
], ParserATNSimulator.prototype, "reportAmbiguity", null);
ParserATNSimulator = __decorate([
    __param(0, Decorators_1.NotNull)
], ParserATNSimulator);
exports.ParserATNSimulator = ParserATNSimulator;

},{"../Decorators":16,"../IntStream":22,"../NoViableAltException":28,"../ParserRuleContext":31,"../Token":40,"../VocabularyImpl":42,"../dfa/AcceptStateInfo":97,"../dfa/DFAState":100,"../misc/Array2DHashSet":104,"../misc/Arrays":106,"../misc/BitSet":107,"../misc/IntegerList":109,"../misc/Interval":111,"../misc/ObjectEqualityComparator":114,"../misc/Stubs":116,"./ATN":43,"./ATNConfig":44,"./ATNConfigSet":45,"./ATNSimulator":48,"./ActionTransition":51,"./AtomTransition":52,"./ConflictInfo":57,"./DecisionState":58,"./NotSetTransition":74,"./PredictionContext":81,"./PredictionContextCache":82,"./PredictionMode":83,"./RuleStopState":86,"./RuleTransition":87,"./SemanticContext":88,"./SetTransition":89,"./SimulatorState":90,"assert":127}],77:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const BlockStartState_1 = require("./BlockStartState");
const Decorators_1 = require("../Decorators");
/** Start of {@code (A|B|...)+} loop. Technically a decision state, but
 *  we don't use for code generation; somebody might need it, so I'm defining
 *  it for completeness. In reality, the {@link PlusLoopbackState} node is the
 *  real decision-making note for {@code A+}.
 */
class PlusBlockStartState extends BlockStartState_1.BlockStartState {
    get stateType() {
        return 4 /* PLUS_BLOCK_START */;
    }
}
__decorate([
    Decorators_1.Override
], PlusBlockStartState.prototype, "stateType", null);
exports.PlusBlockStartState = PlusBlockStartState;

},{"../Decorators":16,"./BlockStartState":56}],78:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const DecisionState_1 = require("./DecisionState");
const Decorators_1 = require("../Decorators");
/** Decision state for {@code A+} and {@code (A|B)+}.  It has two transitions:
 *  one to the loop back to start of the block and one to exit.
 */
class PlusLoopbackState extends DecisionState_1.DecisionState {
    get stateType() {
        return 11 /* PLUS_LOOP_BACK */;
    }
}
__decorate([
    Decorators_1.Override
], PlusLoopbackState.prototype, "stateType", null);
exports.PlusLoopbackState = PlusLoopbackState;

},{"../Decorators":16,"./DecisionState":58}],79:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:35.0994191-07:00
const AbstractPredicateTransition_1 = require("./AbstractPredicateTransition");
const Decorators_1 = require("../Decorators");
const SemanticContext_1 = require("./SemanticContext");
/**
 *
 * @author Sam Harwell
 */
let PrecedencePredicateTransition = class PrecedencePredicateTransition extends AbstractPredicateTransition_1.AbstractPredicateTransition {
    constructor(target, precedence) {
        super(target);
        this.precedence = precedence;
    }
    get serializationType() {
        return 10 /* PRECEDENCE */;
    }
    get isEpsilon() {
        return true;
    }
    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return false;
    }
    get predicate() {
        return new SemanticContext_1.SemanticContext.PrecedencePredicate(this.precedence);
    }
    toString() {
        return this.precedence + " >= _p";
    }
};
__decorate([
    Decorators_1.Override
], PrecedencePredicateTransition.prototype, "serializationType", null);
__decorate([
    Decorators_1.Override
], PrecedencePredicateTransition.prototype, "isEpsilon", null);
__decorate([
    Decorators_1.Override
], PrecedencePredicateTransition.prototype, "matches", null);
__decorate([
    Decorators_1.Override
], PrecedencePredicateTransition.prototype, "toString", null);
PrecedencePredicateTransition = __decorate([
    __param(0, Decorators_1.NotNull)
], PrecedencePredicateTransition);
exports.PrecedencePredicateTransition = PrecedencePredicateTransition;

},{"../Decorators":16,"./AbstractPredicateTransition":50,"./SemanticContext":88}],80:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:35.2826960-07:00
const AbstractPredicateTransition_1 = require("./AbstractPredicateTransition");
const Decorators_1 = require("../Decorators");
const SemanticContext_1 = require("./SemanticContext");
/** TODO: this is old comment:
 *  A tree of semantic predicates from the grammar AST if label==SEMPRED.
 *  In the ATN, labels will always be exactly one predicate, but the DFA
 *  may have to combine a bunch of them as it collects predicates from
 *  multiple ATN configurations into a single DFA state.
 */
let PredicateTransition = class PredicateTransition extends AbstractPredicateTransition_1.AbstractPredicateTransition {
    constructor(target, ruleIndex, predIndex, isCtxDependent) {
        super(target);
        this.ruleIndex = ruleIndex;
        this.predIndex = predIndex;
        this.isCtxDependent = isCtxDependent;
    }
    get serializationType() {
        return 4 /* PREDICATE */;
    }
    get isEpsilon() { return true; }
    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return false;
    }
    get predicate() {
        return new SemanticContext_1.SemanticContext.Predicate(this.ruleIndex, this.predIndex, this.isCtxDependent);
    }
    toString() {
        return "pred_" + this.ruleIndex + ":" + this.predIndex;
    }
};
__decorate([
    Decorators_1.Override
], PredicateTransition.prototype, "serializationType", null);
__decorate([
    Decorators_1.Override
], PredicateTransition.prototype, "isEpsilon", null);
__decorate([
    Decorators_1.Override
], PredicateTransition.prototype, "matches", null);
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull
], PredicateTransition.prototype, "toString", null);
PredicateTransition = __decorate([
    __param(0, Decorators_1.NotNull)
], PredicateTransition);
exports.PredicateTransition = PredicateTransition;

},{"../Decorators":16,"./AbstractPredicateTransition":50,"./SemanticContext":88}],81:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:35.3812636-07:00
const Array2DHashMap_1 = require("../misc/Array2DHashMap");
const Array2DHashSet_1 = require("../misc/Array2DHashSet");
const Arrays_1 = require("../misc/Arrays");
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
const PredictionContextCache_1 = require("./PredictionContextCache");
const assert = require("assert");
const INITIAL_HASH = 1;
class PredictionContext {
    constructor(cachedHashCode) {
        this.cachedHashCode = cachedHashCode;
    }
    static calculateEmptyHashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize(INITIAL_HASH);
        hash = MurmurHash_1.MurmurHash.finish(hash, 0);
        return hash;
    }
    static calculateSingleHashCode(parent, returnState) {
        let hash = MurmurHash_1.MurmurHash.initialize(INITIAL_HASH);
        hash = MurmurHash_1.MurmurHash.update(hash, parent);
        hash = MurmurHash_1.MurmurHash.update(hash, returnState);
        hash = MurmurHash_1.MurmurHash.finish(hash, 2);
        return hash;
    }
    static calculateHashCode(parents, returnStates) {
        let hash = MurmurHash_1.MurmurHash.initialize(INITIAL_HASH);
        for (let parent of parents) {
            hash = MurmurHash_1.MurmurHash.update(hash, parent);
        }
        for (let returnState of returnStates) {
            hash = MurmurHash_1.MurmurHash.update(hash, returnState);
        }
        hash = MurmurHash_1.MurmurHash.finish(hash, 2 * parents.length);
        return hash;
    }
    static fromRuleContext(atn, outerContext, fullContext = true) {
        if (outerContext.isEmpty) {
            return fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL;
        }
        let parent;
        if (outerContext._parent) {
            parent = PredictionContext.fromRuleContext(atn, outerContext._parent, fullContext);
        }
        else {
            parent = fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL;
        }
        let state = atn.states[outerContext.invokingState];
        let transition = state.transition(0);
        return parent.getChild(transition.followState.stateNumber);
    }
    static addEmptyContext(context) {
        return context.addEmptyContext();
    }
    static removeEmptyContext(context) {
        return context.removeEmptyContext();
    }
    static join(context0, context1, contextCache = PredictionContextCache_1.PredictionContextCache.UNCACHED) {
        if (context0 == context1) {
            return context0;
        }
        if (context0.isEmpty) {
            return PredictionContext.isEmptyLocal(context0) ? context0 : PredictionContext.addEmptyContext(context1);
        }
        else if (context1.isEmpty) {
            return PredictionContext.isEmptyLocal(context1) ? context1 : PredictionContext.addEmptyContext(context0);
        }
        let context0size = context0.size;
        let context1size = context1.size;
        if (context0size === 1 && context1size === 1 && context0.getReturnState(0) === context1.getReturnState(0)) {
            let merged = contextCache.join(context0.getParent(0), context1.getParent(0));
            if (merged === context0.getParent(0)) {
                return context0;
            }
            else if (merged === context1.getParent(0)) {
                return context1;
            }
            else {
                return merged.getChild(context0.getReturnState(0));
            }
        }
        let count = 0;
        let parentsList = new Array(context0size + context1size);
        let returnStatesList = new Array(parentsList.length);
        let leftIndex = 0;
        let rightIndex = 0;
        let canReturnLeft = true;
        let canReturnRight = true;
        while (leftIndex < context0size && rightIndex < context1size) {
            if (context0.getReturnState(leftIndex) === context1.getReturnState(rightIndex)) {
                parentsList[count] = contextCache.join(context0.getParent(leftIndex), context1.getParent(rightIndex));
                returnStatesList[count] = context0.getReturnState(leftIndex);
                canReturnLeft = canReturnLeft && parentsList[count] === context0.getParent(leftIndex);
                canReturnRight = canReturnRight && parentsList[count] === context1.getParent(rightIndex);
                leftIndex++;
                rightIndex++;
            }
            else if (context0.getReturnState(leftIndex) < context1.getReturnState(rightIndex)) {
                parentsList[count] = context0.getParent(leftIndex);
                returnStatesList[count] = context0.getReturnState(leftIndex);
                canReturnRight = false;
                leftIndex++;
            }
            else {
                assert(context1.getReturnState(rightIndex) < context0.getReturnState(leftIndex));
                parentsList[count] = context1.getParent(rightIndex);
                returnStatesList[count] = context1.getReturnState(rightIndex);
                canReturnLeft = false;
                rightIndex++;
            }
            count++;
        }
        while (leftIndex < context0size) {
            parentsList[count] = context0.getParent(leftIndex);
            returnStatesList[count] = context0.getReturnState(leftIndex);
            leftIndex++;
            canReturnRight = false;
            count++;
        }
        while (rightIndex < context1size) {
            parentsList[count] = context1.getParent(rightIndex);
            returnStatesList[count] = context1.getReturnState(rightIndex);
            rightIndex++;
            canReturnLeft = false;
            count++;
        }
        if (canReturnLeft) {
            return context0;
        }
        else if (canReturnRight) {
            return context1;
        }
        if (count < parentsList.length) {
            parentsList = parentsList.slice(0, count);
            returnStatesList = returnStatesList.slice(0, count);
        }
        if (parentsList.length === 0) {
            // if one of them was EMPTY_LOCAL, it would be empty and handled at the beginning of the method
            return PredictionContext.EMPTY_FULL;
        }
        else if (parentsList.length === 1) {
            return new SingletonPredictionContext(parentsList[0], returnStatesList[0]);
        }
        else {
            return new ArrayPredictionContext(parentsList, returnStatesList);
        }
    }
    static isEmptyLocal(context) {
        return context === PredictionContext.EMPTY_LOCAL;
    }
    static getCachedContext(context, contextCache, visited) {
        if (context.isEmpty) {
            return context;
        }
        let existing = visited.get(context);
        if (existing) {
            return existing;
        }
        existing = contextCache.get(context);
        if (existing) {
            visited.put(context, existing);
            return existing;
        }
        let changed = false;
        let parents = new Array(context.size);
        for (let i = 0; i < parents.length; i++) {
            let parent = PredictionContext.getCachedContext(context.getParent(i), contextCache, visited);
            if (changed || parent !== context.getParent(i)) {
                if (!changed) {
                    parents = new Array(context.size);
                    for (let j = 0; j < context.size; j++) {
                        parents[j] = context.getParent(j);
                    }
                    changed = true;
                }
                parents[i] = parent;
            }
        }
        if (!changed) {
            existing = contextCache.putIfAbsent(context, context);
            visited.put(context, existing != null ? existing : context);
            return context;
        }
        // We know parents.length>0 because context.isEmpty is checked at the beginning of the method.
        let updated;
        if (parents.length === 1) {
            updated = new SingletonPredictionContext(parents[0], context.getReturnState(0));
        }
        else {
            let returnStates = new Array(context.size);
            for (let i = 0; i < context.size; i++) {
                returnStates[i] = context.getReturnState(i);
            }
            updated = new ArrayPredictionContext(parents, returnStates, context.hashCode());
        }
        existing = contextCache.putIfAbsent(updated, updated);
        visited.put(updated, existing || updated);
        visited.put(context, existing || updated);
        return updated;
    }
    appendSingleContext(returnContext, contextCache) {
        return this.appendContext(PredictionContext.EMPTY_FULL.getChild(returnContext), contextCache);
    }
    getChild(returnState) {
        return new SingletonPredictionContext(this, returnState);
    }
    hashCode() {
        return this.cachedHashCode;
    }
    toStrings(recognizer, currentState, stop = PredictionContext.EMPTY_FULL) {
        let result = [];
        outer: for (let perm = 0;; perm++) {
            let offset = 0;
            let last = true;
            let p = this;
            let stateNumber = currentState;
            let localBuffer = "";
            localBuffer += "[";
            while (!p.isEmpty && p !== stop) {
                let index = 0;
                if (p.size > 0) {
                    let bits = 1;
                    while (((1 << bits) >>> 0) < p.size) {
                        bits++;
                    }
                    let mask = ((1 << bits) >>> 0) - 1;
                    index = (perm >> offset) & mask;
                    last = last && index >= p.size - 1;
                    if (index >= p.size) {
                        continue outer;
                    }
                    offset += bits;
                }
                if (recognizer) {
                    if (localBuffer.length > 1) {
                        // first char is '[', if more than that this isn't the first rule
                        localBuffer += ' ';
                    }
                    let atn = recognizer.atn;
                    let s = atn.states[stateNumber];
                    let ruleName = recognizer.ruleNames[s.ruleIndex];
                    localBuffer += ruleName;
                }
                else if (p.getReturnState(index) !== PredictionContext.EMPTY_FULL_STATE_KEY) {
                    if (!p.isEmpty) {
                        if (localBuffer.length > 1) {
                            // first char is '[', if more than that this isn't the first rule
                            localBuffer += ' ';
                        }
                        localBuffer += p.getReturnState(index);
                    }
                }
                stateNumber = p.getReturnState(index);
                p = p.getParent(index);
            }
            localBuffer += "]";
            result.push(localBuffer);
            if (last) {
                break;
            }
        }
        return result;
    }
}
__decorate([
    Decorators_1.Override
], PredictionContext.prototype, "hashCode", null);
__decorate([
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull), __param(2, Decorators_1.NotNull)
], PredictionContext, "join", null);
__decorate([
    __param(0, Decorators_1.NotNull),
    __param(1, Decorators_1.NotNull),
    __param(2, Decorators_1.NotNull)
], PredictionContext, "getCachedContext", null);
exports.PredictionContext = PredictionContext;
class EmptyPredictionContext extends PredictionContext {
    constructor(fullContext) {
        super(PredictionContext.calculateEmptyHashCode());
        this.fullContext = fullContext;
    }
    get isFullContext() {
        return this.fullContext;
    }
    addEmptyContext() {
        return this;
    }
    removeEmptyContext() {
        throw new Error("Cannot remove the empty context from itself.");
    }
    getParent(index) {
        throw new Error("index out of bounds");
    }
    getReturnState(index) {
        throw new Error("index out of bounds");
    }
    findReturnState(returnState) {
        return -1;
    }
    get size() {
        return 0;
    }
    appendSingleContext(returnContext, contextCache) {
        return contextCache.getChild(this, returnContext);
    }
    appendContext(suffix, contextCache) {
        return suffix;
    }
    get isEmpty() {
        return true;
    }
    get hasEmpty() {
        return true;
    }
    equals(o) {
        return this === o;
    }
    toStrings(recognizer, currentState, stop) {
        return ["[]"];
    }
}
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "addEmptyContext", null);
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "removeEmptyContext", null);
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "getParent", null);
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "getReturnState", null);
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "findReturnState", null);
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "size", null);
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "appendSingleContext", null);
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "appendContext", null);
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "isEmpty", null);
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "hasEmpty", null);
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], EmptyPredictionContext.prototype, "toStrings", null);
let ArrayPredictionContext = class ArrayPredictionContext extends PredictionContext {
    constructor(parents, returnStates, hashCode) {
        super(hashCode || PredictionContext.calculateHashCode(parents, returnStates));
        assert(parents.length === returnStates.length);
        assert(returnStates.length > 1 || returnStates[0] !== PredictionContext.EMPTY_FULL_STATE_KEY, "Should be using PredictionContext.EMPTY instead.");
        this.parents = parents;
        this.returnStates = returnStates;
    }
    getParent(index) {
        return this.parents[index];
    }
    getReturnState(index) {
        return this.returnStates[index];
    }
    findReturnState(returnState) {
        return Arrays_1.Arrays.binarySearch(this.returnStates, returnState);
    }
    get size() {
        return this.returnStates.length;
    }
    get isEmpty() {
        return false;
    }
    get hasEmpty() {
        return this.returnStates[this.returnStates.length - 1] === PredictionContext.EMPTY_FULL_STATE_KEY;
    }
    addEmptyContext() {
        if (this.hasEmpty) {
            return this;
        }
        let parents2 = this.parents.slice(0);
        let returnStates2 = this.returnStates.slice(0);
        parents2.push(PredictionContext.EMPTY_FULL);
        returnStates2.push(PredictionContext.EMPTY_FULL_STATE_KEY);
        return new ArrayPredictionContext(parents2, returnStates2);
    }
    removeEmptyContext() {
        if (!this.hasEmpty) {
            return this;
        }
        if (this.returnStates.length === 2) {
            return new SingletonPredictionContext(this.parents[0], this.returnStates[0]);
        }
        else {
            let parents2 = this.parents.slice(0, this.parents.length - 1);
            let returnStates2 = this.returnStates.slice(0, this.returnStates.length - 1);
            return new ArrayPredictionContext(parents2, returnStates2);
        }
    }
    appendContext(suffix, contextCache) {
        return ArrayPredictionContext.appendContextImpl(this, suffix, new PredictionContext.IdentityHashMap());
    }
    static appendContextImpl(context, suffix, visited) {
        if (suffix.isEmpty) {
            if (PredictionContext.isEmptyLocal(suffix)) {
                if (context.hasEmpty) {
                    return PredictionContext.EMPTY_LOCAL;
                }
                throw new Error("what to do here?");
            }
            return context;
        }
        if (suffix.size !== 1) {
            throw new Error("Appending a tree suffix is not yet supported.");
        }
        let result = visited.get(context);
        if (!result) {
            if (context.isEmpty) {
                result = suffix;
            }
            else {
                let parentCount = context.size;
                if (context.hasEmpty) {
                    parentCount--;
                }
                let updatedParents = new Array(parentCount);
                let updatedReturnStates = new Array(parentCount);
                for (let i = 0; i < parentCount; i++) {
                    updatedReturnStates[i] = context.getReturnState(i);
                }
                for (let i = 0; i < parentCount; i++) {
                    updatedParents[i] = ArrayPredictionContext.appendContextImpl(context.getParent(i), suffix, visited);
                }
                if (updatedParents.length === 1) {
                    result = new SingletonPredictionContext(updatedParents[0], updatedReturnStates[0]);
                }
                else {
                    assert(updatedParents.length > 1);
                    result = new ArrayPredictionContext(updatedParents, updatedReturnStates);
                }
                if (context.hasEmpty) {
                    result = PredictionContext.join(result, suffix);
                }
            }
            visited.put(context, result);
        }
        return result;
    }
    equals(o) {
        if (this === o) {
            return true;
        }
        else if (!(o instanceof ArrayPredictionContext)) {
            return false;
        }
        if (this.hashCode() !== o.hashCode()) {
            // can't be same if hash is different
            return false;
        }
        let other = o;
        return this.equalsImpl(other, new Array2DHashSet_1.Array2DHashSet());
    }
    equalsImpl(other, visited) {
        let selfWorkList = [];
        let otherWorkList = [];
        selfWorkList.push(this);
        otherWorkList.push(other);
        while (true) {
            let currentSelf = selfWorkList.pop();
            let currentOther = otherWorkList.pop();
            if (!currentSelf || !currentOther) {
                break;
            }
            let operands = new PredictionContextCache_1.PredictionContextCache.IdentityCommutativePredictionContextOperands(currentSelf, currentOther);
            if (!visited.add(operands)) {
                continue;
            }
            let selfSize = operands.x.size;
            if (selfSize === 0) {
                if (!operands.x.equals(operands.y)) {
                    return false;
                }
                continue;
            }
            let otherSize = operands.y.size;
            if (selfSize !== otherSize) {
                return false;
            }
            for (let i = 0; i < selfSize; i++) {
                if (operands.x.getReturnState(i) !== operands.y.getReturnState(i)) {
                    return false;
                }
                let selfParent = operands.x.getParent(i);
                let otherParent = operands.y.getParent(i);
                if (selfParent.hashCode() !== otherParent.hashCode()) {
                    return false;
                }
                if (selfParent !== otherParent) {
                    selfWorkList.push(selfParent);
                    otherWorkList.push(otherParent);
                }
            }
        }
        return true;
    }
};
__decorate([
    Decorators_1.NotNull
], ArrayPredictionContext.prototype, "parents", void 0);
__decorate([
    Decorators_1.NotNull
], ArrayPredictionContext.prototype, "returnStates", void 0);
__decorate([
    Decorators_1.Override
], ArrayPredictionContext.prototype, "getParent", null);
__decorate([
    Decorators_1.Override
], ArrayPredictionContext.prototype, "getReturnState", null);
__decorate([
    Decorators_1.Override
], ArrayPredictionContext.prototype, "findReturnState", null);
__decorate([
    Decorators_1.Override
], ArrayPredictionContext.prototype, "size", null);
__decorate([
    Decorators_1.Override
], ArrayPredictionContext.prototype, "isEmpty", null);
__decorate([
    Decorators_1.Override
], ArrayPredictionContext.prototype, "hasEmpty", null);
__decorate([
    Decorators_1.Override
], ArrayPredictionContext.prototype, "addEmptyContext", null);
__decorate([
    Decorators_1.Override
], ArrayPredictionContext.prototype, "removeEmptyContext", null);
__decorate([
    Decorators_1.Override
], ArrayPredictionContext.prototype, "appendContext", null);
__decorate([
    Decorators_1.Override
], ArrayPredictionContext.prototype, "equals", null);
ArrayPredictionContext = __decorate([
    __param(0, Decorators_1.NotNull)
], ArrayPredictionContext);
let SingletonPredictionContext = class SingletonPredictionContext extends PredictionContext {
    constructor(parent, returnState) {
        super(PredictionContext.calculateSingleHashCode(parent, returnState));
        // assert(returnState != PredictionContext.EMPTY_FULL_STATE_KEY && returnState != PredictionContext.EMPTY_LOCAL_STATE_KEY);
        this.parent = parent;
        this.returnState = returnState;
    }
    getParent(index) {
        // assert(index == 0);
        return this.parent;
    }
    getReturnState(index) {
        // assert(index == 0);
        return this.returnState;
    }
    findReturnState(returnState) {
        return this.returnState === returnState ? 0 : -1;
    }
    get size() {
        return 1;
    }
    get isEmpty() {
        return false;
    }
    get hasEmpty() {
        return false;
    }
    appendContext(suffix, contextCache) {
        return contextCache.getChild(this.parent.appendContext(suffix, contextCache), this.returnState);
    }
    addEmptyContext() {
        let parents = [this.parent, PredictionContext.EMPTY_FULL];
        let returnStates = [this.returnState, PredictionContext.EMPTY_FULL_STATE_KEY];
        return new ArrayPredictionContext(parents, returnStates);
    }
    removeEmptyContext() {
        return this;
    }
    equals(o) {
        if (o === this) {
            return true;
        }
        else if (!(o instanceof SingletonPredictionContext)) {
            return false;
        }
        let other = o;
        if (this.hashCode() !== other.hashCode()) {
            return false;
        }
        return this.returnState === other.returnState
            && this.parent.equals(other.parent);
    }
};
__decorate([
    Decorators_1.NotNull
], SingletonPredictionContext.prototype, "parent", void 0);
__decorate([
    Decorators_1.Override
], SingletonPredictionContext.prototype, "getParent", null);
__decorate([
    Decorators_1.Override
], SingletonPredictionContext.prototype, "getReturnState", null);
__decorate([
    Decorators_1.Override
], SingletonPredictionContext.prototype, "findReturnState", null);
__decorate([
    Decorators_1.Override
], SingletonPredictionContext.prototype, "size", null);
__decorate([
    Decorators_1.Override
], SingletonPredictionContext.prototype, "isEmpty", null);
__decorate([
    Decorators_1.Override
], SingletonPredictionContext.prototype, "hasEmpty", null);
__decorate([
    Decorators_1.Override
], SingletonPredictionContext.prototype, "appendContext", null);
__decorate([
    Decorators_1.Override
], SingletonPredictionContext.prototype, "addEmptyContext", null);
__decorate([
    Decorators_1.Override
], SingletonPredictionContext.prototype, "removeEmptyContext", null);
__decorate([
    Decorators_1.Override
], SingletonPredictionContext.prototype, "equals", null);
SingletonPredictionContext = __decorate([
    __param(0, Decorators_1.NotNull)
], SingletonPredictionContext);
exports.SingletonPredictionContext = SingletonPredictionContext;
(function (PredictionContext) {
    PredictionContext.EMPTY_LOCAL = new EmptyPredictionContext(false);
    PredictionContext.EMPTY_FULL = new EmptyPredictionContext(true);
    PredictionContext.EMPTY_LOCAL_STATE_KEY = -((1 << 31) >>> 0);
    PredictionContext.EMPTY_FULL_STATE_KEY = ((1 << 31) >>> 0) - 1;
    class IdentityHashMap extends Array2DHashMap_1.Array2DHashMap {
        constructor() {
            super(IdentityEqualityComparator.INSTANCE);
        }
    }
    PredictionContext.IdentityHashMap = IdentityHashMap;
    class IdentityEqualityComparator {
        IdentityEqualityComparator() {
        }
        hashCode(obj) {
            return obj.hashCode();
        }
        equals(a, b) {
            return a === b;
        }
    }
    IdentityEqualityComparator.INSTANCE = new IdentityEqualityComparator();
    __decorate([
        Decorators_1.Override
    ], IdentityEqualityComparator.prototype, "hashCode", null);
    __decorate([
        Decorators_1.Override
    ], IdentityEqualityComparator.prototype, "equals", null);
    PredictionContext.IdentityEqualityComparator = IdentityEqualityComparator;
})(PredictionContext = exports.PredictionContext || (exports.PredictionContext = {}));

},{"../Decorators":16,"../misc/Array2DHashMap":103,"../misc/Array2DHashSet":104,"../misc/Arrays":106,"../misc/MurmurHash":113,"./PredictionContextCache":82,"assert":127}],82:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:35.6390614-07:00
const Array2DHashMap_1 = require("../misc/Array2DHashMap");
const Decorators_1 = require("../Decorators");
const ObjectEqualityComparator_1 = require("../misc/ObjectEqualityComparator");
const PredictionContext_1 = require("./PredictionContext");
const assert = require("assert");
/** Used to cache {@link PredictionContext} objects. Its used for the shared
 *  context cash associated with contexts in DFA states. This cache
 *  can be used for both lexers and parsers.
 *
 * @author Sam Harwell
 */
class PredictionContextCache {
    constructor(enableCache = true) {
        this.contexts = new Array2DHashMap_1.Array2DHashMap(ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE);
        this.childContexts = new Array2DHashMap_1.Array2DHashMap(ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE);
        this.joinContexts = new Array2DHashMap_1.Array2DHashMap(ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE);
        this.enableCache = enableCache;
    }
    getAsCached(context) {
        if (!this.enableCache) {
            return context;
        }
        let result = this.contexts.get(context);
        if (!result) {
            result = context;
            this.contexts.put(context, context);
        }
        return result;
    }
    getChild(context, invokingState) {
        if (!this.enableCache) {
            return context.getChild(invokingState);
        }
        let operands = new PredictionContextCache.PredictionContextAndInt(context, invokingState);
        let result = this.childContexts.get(operands);
        if (!result) {
            result = context.getChild(invokingState);
            result = this.getAsCached(result);
            this.childContexts.put(operands, result);
        }
        return result;
    }
    join(x, y) {
        if (!this.enableCache) {
            return PredictionContext_1.PredictionContext.join(x, y, this);
        }
        let operands = new PredictionContextCache.IdentityCommutativePredictionContextOperands(x, y);
        let result = this.joinContexts.get(operands);
        if (result) {
            return result;
        }
        result = PredictionContext_1.PredictionContext.join(x, y, this);
        result = this.getAsCached(result);
        this.joinContexts.put(operands, result);
        return result;
    }
}
PredictionContextCache.UNCACHED = new PredictionContextCache(false);
exports.PredictionContextCache = PredictionContextCache;
(function (PredictionContextCache) {
    class PredictionContextAndInt {
        constructor(obj, value) {
            this.obj = obj;
            this.value = value;
        }
        equals(obj) {
            if (!(obj instanceof PredictionContextAndInt)) {
                return false;
            }
            else if (obj == this) {
                return true;
            }
            let other = obj;
            return this.value === other.value
                && (this.obj === other.obj || (this.obj != null && this.obj.equals(other.obj)));
        }
        hashCode() {
            let hashCode = 5;
            hashCode = 7 * hashCode + (this.obj != null ? this.obj.hashCode() : 0);
            hashCode = 7 * hashCode + this.value;
            return hashCode;
        }
    }
    __decorate([
        Decorators_1.Override
    ], PredictionContextAndInt.prototype, "equals", null);
    __decorate([
        Decorators_1.Override
    ], PredictionContextAndInt.prototype, "hashCode", null);
    PredictionContextCache.PredictionContextAndInt = PredictionContextAndInt;
    class IdentityCommutativePredictionContextOperands {
        constructor(x, y) {
            assert(x != null);
            assert(y != null);
            this._x = x;
            this._y = y;
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        equals(o) {
            if (!(o instanceof IdentityCommutativePredictionContextOperands)) {
                return false;
            }
            else if (this === o) {
                return true;
            }
            let other = o;
            return (this._x === other._x && this._y === other._y) || (this._x === other._y && this._y === other._x);
        }
        hashCode() {
            return this._x.hashCode() ^ this._y.hashCode();
        }
    }
    __decorate([
        Decorators_1.Override
    ], IdentityCommutativePredictionContextOperands.prototype, "equals", null);
    __decorate([
        Decorators_1.Override
    ], IdentityCommutativePredictionContextOperands.prototype, "hashCode", null);
    PredictionContextCache.IdentityCommutativePredictionContextOperands = IdentityCommutativePredictionContextOperands;
})(PredictionContextCache = exports.PredictionContextCache || (exports.PredictionContextCache = {}));

},{"../Decorators":16,"../misc/Array2DHashMap":103,"../misc/ObjectEqualityComparator":114,"./PredictionContext":81,"assert":127}],83:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:36.2673893-07:00
const Array2DHashMap_1 = require("../misc/Array2DHashMap");
const Stubs_1 = require("../misc/Stubs");
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
const RuleStopState_1 = require("./RuleStopState");
/**
 * This enumeration defines the prediction modes available in ANTLR 4 along with
 * utility methods for analyzing configuration sets for conflicts and/or
 * ambiguities.
 */
var PredictionMode;
(function (PredictionMode) {
    /**
     * The SLL(*) prediction mode. This prediction mode ignores the current
     * parser context when making predictions. This is the fastest prediction
     * mode, and provides correct results for many grammars. This prediction
     * mode is more powerful than the prediction mode provided by ANTLR 3, but
     * may result in syntax errors for grammar and input combinations which are
     * not SLL.
     *
     * <p>
     * When using this prediction mode, the parser will either return a correct
     * parse tree (i.e. the same parse tree that would be returned with the
     * {@link #LL} prediction mode), or it will report a syntax error. If a
     * syntax error is encountered when using the {@link #SLL} prediction mode,
     * it may be due to either an actual syntax error in the input or indicate
     * that the particular combination of grammar and input requires the more
     * powerful {@link #LL} prediction abilities to complete successfully.</p>
     *
     * <p>
     * This prediction mode does not provide any guarantees for prediction
     * behavior for syntactically-incorrect inputs.</p>
     */
    PredictionMode[PredictionMode["SLL"] = 0] = "SLL";
    /**
     * The LL(*) prediction mode. This prediction mode allows the current parser
     * context to be used for resolving SLL conflicts that occur during
     * prediction. This is the fastest prediction mode that guarantees correct
     * parse results for all combinations of grammars with syntactically correct
     * inputs.
     *
     * <p>
     * When using this prediction mode, the parser will make correct decisions
     * for all syntactically-correct grammar and input combinations. However, in
     * cases where the grammar is truly ambiguous this prediction mode might not
     * report a precise answer for <em>exactly which</em> alternatives are
     * ambiguous.</p>
     *
     * <p>
     * This prediction mode does not provide any guarantees for prediction
     * behavior for syntactically-incorrect inputs.</p>
     */
    PredictionMode[PredictionMode["LL"] = 1] = "LL";
    /**
     * The LL(*) prediction mode with exact ambiguity detection. In addition to
     * the correctness guarantees provided by the {@link #LL} prediction mode,
     * this prediction mode instructs the prediction algorithm to determine the
     * complete and exact set of ambiguous alternatives for every ambiguous
     * decision encountered while parsing.
     *
     * <p>
     * This prediction mode may be used for diagnosing ambiguities during
     * grammar development. Due to the performance overhead of calculating sets
     * of ambiguous alternatives, this prediction mode should be avoided when
     * the exact results are not necessary.</p>
     *
     * <p>
     * This prediction mode does not provide any guarantees for prediction
     * behavior for syntactically-incorrect inputs.</p>
     */
    PredictionMode[PredictionMode["LL_EXACT_AMBIG_DETECTION"] = 2] = "LL_EXACT_AMBIG_DETECTION";
})(PredictionMode = exports.PredictionMode || (exports.PredictionMode = {}));
(function (PredictionMode) {
    /** A Map that uses just the state and the stack context as the key. */
    // NOTE: Base type used to be FlexibleHashMap<ATNConfig, BitSet>
    class AltAndContextMap extends Array2DHashMap_1.Array2DHashMap {
        constructor() {
            super(AltAndContextConfigEqualityComparator.INSTANCE);
        }
    }
    class AltAndContextConfigEqualityComparator {
        AltAndContextConfigEqualityComparator() {
        }
        /**
         * The hash code is only a function of the {@link ATNState#stateNumber}
         * and {@link ATNConfig#context}.
         */
        hashCode(o) {
            let hashCode = MurmurHash_1.MurmurHash.initialize(7);
            hashCode = MurmurHash_1.MurmurHash.update(hashCode, o.state.stateNumber);
            hashCode = MurmurHash_1.MurmurHash.update(hashCode, o.context);
            hashCode = MurmurHash_1.MurmurHash.finish(hashCode, 2);
            return hashCode;
        }
        equals(a, b) {
            if (a === b)
                return true;
            if (a == null || b == null)
                return false;
            return a.state.stateNumber == b.state.stateNumber
                && a.context.equals(b.context);
        }
    }
    AltAndContextConfigEqualityComparator.INSTANCE = new AltAndContextConfigEqualityComparator();
    __decorate([
        Decorators_1.Override
    ], AltAndContextConfigEqualityComparator.prototype, "hashCode", null);
    __decorate([
        Decorators_1.Override
    ], AltAndContextConfigEqualityComparator.prototype, "equals", null);
    /**
     * Checks if any configuration in {@code configs} is in a
     * {@link RuleStopState}. Configurations meeting this condition have reached
     * the end of the decision rule (local context) or end of start rule (full
     * context).
     *
     * @param configs the configuration set to test
     * @return {@code true} if any configuration in {@code configs} is in a
     * {@link RuleStopState}, otherwise {@code false}
     */
    function hasConfigInRuleStopState(configs) {
        for (let c of Stubs_1.asIterable(configs)) {
            if (c.state instanceof RuleStopState_1.RuleStopState) {
                return true;
            }
        }
        return false;
    }
    PredictionMode.hasConfigInRuleStopState = hasConfigInRuleStopState;
    /**
     * Checks if all configurations in {@code configs} are in a
     * {@link RuleStopState}. Configurations meeting this condition have reached
     * the end of the decision rule (local context) or end of start rule (full
     * context).
     *
     * @param configs the configuration set to test
     * @return {@code true} if all configurations in {@code configs} are in a
     * {@link RuleStopState}, otherwise {@code false}
     */
    function allConfigsInRuleStopStates(/*@NotNull*/ configs) {
        for (let config of Stubs_1.asIterable(configs)) {
            if (!(config.state instanceof RuleStopState_1.RuleStopState)) {
                return false;
            }
        }
        return true;
    }
    PredictionMode.allConfigsInRuleStopStates = allConfigsInRuleStopStates;
})(PredictionMode = exports.PredictionMode || (exports.PredictionMode = {}));

},{"../Decorators":16,"../misc/Array2DHashMap":103,"../misc/MurmurHash":113,"../misc/Stubs":116,"./RuleStopState":86}],84:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const IntervalSet_1 = require("../misc/IntervalSet");
const Decorators_1 = require("../Decorators");
const Transition_1 = require("./Transition");
let RangeTransition = class RangeTransition extends Transition_1.Transition {
    constructor(target, from, to) {
        super(target);
        this.from = from;
        this.to = to;
    }
    get serializationType() {
        return 2 /* RANGE */;
    }
    get label() {
        return IntervalSet_1.IntervalSet.of(this.from, this.to);
    }
    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return symbol >= this.from && symbol <= this.to;
    }
    toString() {
        return "'" + String.fromCharCode(this.from) + "'..'" + String.fromCharCode(this.to) + "'";
    }
};
__decorate([
    Decorators_1.Override
], RangeTransition.prototype, "serializationType", null);
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull
], RangeTransition.prototype, "label", null);
__decorate([
    Decorators_1.Override
], RangeTransition.prototype, "matches", null);
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull
], RangeTransition.prototype, "toString", null);
RangeTransition = __decorate([
    __param(0, Decorators_1.NotNull)
], RangeTransition);
exports.RangeTransition = RangeTransition;

},{"../Decorators":16,"../misc/IntervalSet":112,"./Transition":95}],85:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:36.6806851-07:00
const ATNState_1 = require("./ATNState");
const Decorators_1 = require("../Decorators");
class RuleStartState extends ATNState_1.ATNState {
    constructor() {
        super(...arguments);
        this.isPrecedenceRule = false;
        this.leftFactored = false;
    }
    get stateType() {
        return 2 /* RULE_START */;
    }
}
__decorate([
    Decorators_1.Override
], RuleStartState.prototype, "stateType", null);
exports.RuleStartState = RuleStartState;

},{"../Decorators":16,"./ATNState":49}],86:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:36.7513856-07:00
const ATNState_1 = require("./ATNState");
const Decorators_1 = require("../Decorators");
/** The last node in the ATN for a rule, unless that rule is the start symbol.
 *  In that case, there is one transition to EOF. Later, we might encode
 *  references to all calls to this rule to compute FOLLOW sets for
 *  error handling.
 */
class RuleStopState extends ATNState_1.ATNState {
    get nonStopStateNumber() {
        return -1;
    }
    get stateType() {
        return 7 /* RULE_STOP */;
    }
}
__decorate([
    Decorators_1.Override
], RuleStopState.prototype, "nonStopStateNumber", null);
__decorate([
    Decorators_1.Override
], RuleStopState.prototype, "stateType", null);
exports.RuleStopState = RuleStopState;

},{"../Decorators":16,"./ATNState":49}],87:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
const Transition_1 = require("./Transition");
/** */
let RuleTransition = class RuleTransition extends Transition_1.Transition {
    constructor(ruleStart, ruleIndex, precedence, followState) {
        super(ruleStart);
        this.tailCall = false;
        this.optimizedTailCall = false;
        this.ruleIndex = ruleIndex;
        this.precedence = precedence;
        this.followState = followState;
    }
    get serializationType() {
        return 3 /* RULE */;
    }
    get isEpsilon() {
        return true;
    }
    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return false;
    }
};
__decorate([
    Decorators_1.NotNull
], RuleTransition.prototype, "followState", void 0);
__decorate([
    Decorators_1.Override
], RuleTransition.prototype, "serializationType", null);
__decorate([
    Decorators_1.Override
], RuleTransition.prototype, "isEpsilon", null);
__decorate([
    Decorators_1.Override
], RuleTransition.prototype, "matches", null);
RuleTransition = __decorate([
    __param(0, Decorators_1.NotNull), __param(3, Decorators_1.NotNull)
], RuleTransition);
exports.RuleTransition = RuleTransition;

},{"../Decorators":16,"./Transition":95}],88:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:36.9521478-07:00
const Array2DHashSet_1 = require("../misc/Array2DHashSet");
const ArrayEqualityComparator_1 = require("../misc/ArrayEqualityComparator");
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
const ObjectEqualityComparator_1 = require("../misc/ObjectEqualityComparator");
const Utils = require("../misc/Utils");
function max(items) {
    let result;
    for (let current of items) {
        if (result === undefined) {
            result = current;
            continue;
        }
        let comparison = result.compareTo(current);
        if (comparison < 0) {
            result = current;
        }
    }
    return result;
}
function min(items) {
    let result;
    for (let current of items) {
        if (result === undefined) {
            result = current;
            continue;
        }
        let comparison = result.compareTo(current);
        if (comparison > 0) {
            result = current;
        }
    }
    return result;
}
/** A tree structure used to record the semantic context in which
 *  an ATN configuration is valid.  It's either a single predicate,
 *  a conjunction {@code p1&&p2}, or a sum of products {@code p1||p2}.
 *
 *  <p>I have scoped the {@link AND}, {@link OR}, and {@link Predicate} subclasses of
 *  {@link SemanticContext} within the scope of this outer class.</p>
 */
class SemanticContext {
    /**
     * The default {@link SemanticContext}, which is semantically equivalent to
     * a predicate of the form {@code {true}?}.
     */
    static get NONE() {
        if (SemanticContext._NONE === undefined) {
            SemanticContext._NONE = new SemanticContext.Predicate();
        }
        return SemanticContext._NONE;
    }
    /**
     * Evaluate the precedence predicates for the context and reduce the result.
     *
     * @param parser The parser instance.
     * @param parserCallStack
     * @return The simplified semantic context after precedence predicates are
     * evaluated, which will be one of the following values.
     * <ul>
     * <li>{@link #NONE}: if the predicate simplifies to {@code true} after
     * precedence predicates are evaluated.</li>
     * <li>{@code null}: if the predicate simplifies to {@code false} after
     * precedence predicates are evaluated.</li>
     * <li>{@code this}: if the semantic context is not changed as a result of
     * precedence predicate evaluation.</li>
     * <li>A non-{@code null} {@link SemanticContext}: the new simplified
     * semantic context after precedence predicates are evaluated.</li>
     * </ul>
     */
    evalPrecedence(parser, parserCallStack) {
        return this;
    }
    static and(a, b) {
        if (!a || a === SemanticContext.NONE)
            return b;
        if (b === SemanticContext.NONE)
            return a;
        let result = new SemanticContext.AND(a, b);
        if (result.opnds.length === 1) {
            return result.opnds[0];
        }
        return result;
    }
    /**
     *
     *  @see ParserATNSimulator#getPredsForAmbigAlts
     */
    static or(a, b) {
        if (!a) {
            return b;
        }
        if (a === SemanticContext.NONE || b === SemanticContext.NONE)
            return SemanticContext.NONE;
        let result = new SemanticContext.OR(a, b);
        if (result.opnds.length === 1) {
            return result.opnds[0];
        }
        return result;
    }
}
exports.SemanticContext = SemanticContext;
(function (SemanticContext) {
    /**
     * This random 30-bit prime represents the value of `AND.class.hashCode()`.
     */
    const AND_HASHCODE = 40363613;
    /**
     * This random 30-bit prime represents the value of `OR.class.hashCode()`.
     */
    const OR_HASHCODE = 486279973;
    function filterPrecedencePredicates(collection) {
        let result = [];
        for (let i = 0; i < collection.length; i++) {
            let context = collection[i];
            if (context instanceof SemanticContext.PrecedencePredicate) {
                result.push(context);
                // Remove the item from 'collection' and move i back so we look at the same index again
                collection.splice(i, 1);
                i--;
            }
        }
        return result;
    }
    class Predicate extends SemanticContext {
        constructor(ruleIndex = -1, predIndex = -1, isCtxDependent = false) {
            super();
            this.ruleIndex = ruleIndex;
            this.predIndex = predIndex;
            this.isCtxDependent = isCtxDependent;
        }
        eval(parser, parserCallStack) {
            let localctx = this.isCtxDependent ? parserCallStack : undefined;
            return parser.sempred(localctx, this.ruleIndex, this.predIndex);
        }
        hashCode() {
            let hashCode = MurmurHash_1.MurmurHash.initialize();
            hashCode = MurmurHash_1.MurmurHash.update(hashCode, this.ruleIndex);
            hashCode = MurmurHash_1.MurmurHash.update(hashCode, this.predIndex);
            hashCode = MurmurHash_1.MurmurHash.update(hashCode, this.isCtxDependent ? 1 : 0);
            hashCode = MurmurHash_1.MurmurHash.finish(hashCode, 3);
            return hashCode;
        }
        equals(obj) {
            if (!(obj instanceof Predicate))
                return false;
            if (this === obj)
                return true;
            return this.ruleIndex === obj.ruleIndex &&
                this.predIndex === obj.predIndex &&
                this.isCtxDependent === obj.isCtxDependent;
        }
        toString() {
            return "{" + this.ruleIndex + ":" + this.predIndex + "}?";
        }
    }
    __decorate([
        Decorators_1.Override
    ], Predicate.prototype, "eval", null);
    __decorate([
        Decorators_1.Override
    ], Predicate.prototype, "hashCode", null);
    __decorate([
        Decorators_1.Override
    ], Predicate.prototype, "equals", null);
    __decorate([
        Decorators_1.Override
    ], Predicate.prototype, "toString", null);
    SemanticContext.Predicate = Predicate;
    class PrecedencePredicate extends SemanticContext {
        constructor(precedence) {
            super();
            this.precedence = precedence;
        }
        eval(parser, parserCallStack) {
            return parser.precpred(parserCallStack, this.precedence);
        }
        evalPrecedence(parser, parserCallStack) {
            if (parser.precpred(parserCallStack, this.precedence)) {
                return SemanticContext.NONE;
            }
            else {
                return undefined;
            }
        }
        compareTo(o) {
            return this.precedence - o.precedence;
        }
        hashCode() {
            let hashCode = 1;
            hashCode = 31 * hashCode + this.precedence;
            return hashCode;
        }
        equals(obj) {
            if (!(obj instanceof PrecedencePredicate)) {
                return false;
            }
            if (this === obj) {
                return true;
            }
            return this.precedence === obj.precedence;
        }
        // precedence >= _precedenceStack.peek()
        toString() {
            return "{" + this.precedence + ">=prec}?";
        }
    }
    __decorate([
        Decorators_1.Override
    ], PrecedencePredicate.prototype, "eval", null);
    __decorate([
        Decorators_1.Override
    ], PrecedencePredicate.prototype, "evalPrecedence", null);
    __decorate([
        Decorators_1.Override
    ], PrecedencePredicate.prototype, "compareTo", null);
    __decorate([
        Decorators_1.Override
    ], PrecedencePredicate.prototype, "hashCode", null);
    __decorate([
        Decorators_1.Override
    ], PrecedencePredicate.prototype, "equals", null);
    __decorate([
        Decorators_1.Override
        // precedence >= _precedenceStack.peek()
    ], PrecedencePredicate.prototype, "toString", null);
    SemanticContext.PrecedencePredicate = PrecedencePredicate;
    /**
     * This is the base class for semantic context "operators", which operate on
     * a collection of semantic context "operands".
     *
     * @since 4.3
     */
    class Operator extends SemanticContext {
    }
    SemanticContext.Operator = Operator;
    /**
     * A semantic context which is true whenever none of the contained contexts
     * is false.
     */
    let AND = class AND extends Operator {
        constructor(a, b) {
            super();
            let operands = new Array2DHashSet_1.Array2DHashSet(ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE);
            if (a instanceof AND)
                operands.addAll(a.opnds);
            else
                operands.add(a);
            if (b instanceof AND)
                operands.addAll(b.opnds);
            else
                operands.add(b);
            this.opnds = operands.toArray();
            let precedencePredicates = filterPrecedencePredicates(this.opnds);
            // interested in the transition with the lowest precedence
            let reduced = min(precedencePredicates);
            if (reduced) {
                this.opnds.push(reduced);
            }
        }
        get operands() {
            return this.opnds;
        }
        equals(obj) {
            if (this === obj)
                return true;
            if (!(obj instanceof AND))
                return false;
            return ArrayEqualityComparator_1.ArrayEqualityComparator.INSTANCE.equals(this.opnds, obj.opnds);
        }
        hashCode() {
            return MurmurHash_1.MurmurHash.hashCode(this.opnds, AND_HASHCODE);
        }
        /**
         * {@inheritDoc}
         *
         * <p>
         * The evaluation of predicates by this context is short-circuiting, but
         * unordered.</p>
         */
        eval(parser, parserCallStack) {
            for (let opnd of this.opnds) {
                if (!opnd.eval(parser, parserCallStack))
                    return false;
            }
            return true;
        }
        evalPrecedence(parser, parserCallStack) {
            let differs = false;
            let operands = [];
            for (let context of this.opnds) {
                let evaluated = context.evalPrecedence(parser, parserCallStack);
                differs = differs || (evaluated !== context);
                if (evaluated == null) {
                    // The AND context is false if any element is false
                    return undefined;
                }
                else if (evaluated !== SemanticContext.NONE) {
                    // Reduce the result by skipping true elements
                    operands.push(evaluated);
                }
            }
            if (!differs) {
                return this;
            }
            if (operands.length === 0) {
                // all elements were true, so the AND context is true
                return SemanticContext.NONE;
            }
            let result = operands[0];
            for (let i = 1; i < operands.length; i++) {
                result = SemanticContext.and(result, operands[i]);
            }
            return result;
        }
        toString() {
            return Utils.join(this.opnds, "&&");
        }
    };
    __decorate([
        Decorators_1.Override
    ], AND.prototype, "operands", null);
    __decorate([
        Decorators_1.Override
    ], AND.prototype, "equals", null);
    __decorate([
        Decorators_1.Override
    ], AND.prototype, "hashCode", null);
    __decorate([
        Decorators_1.Override
    ], AND.prototype, "eval", null);
    __decorate([
        Decorators_1.Override
    ], AND.prototype, "evalPrecedence", null);
    __decorate([
        Decorators_1.Override
    ], AND.prototype, "toString", null);
    AND = __decorate([
        __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
    ], AND);
    SemanticContext.AND = AND;
    /**
     * A semantic context which is true whenever at least one of the contained
     * contexts is true.
     */
    let OR = class OR extends Operator {
        constructor(a, b) {
            super();
            let operands = new Array2DHashSet_1.Array2DHashSet(ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE);
            if (a instanceof OR)
                operands.addAll(a.opnds);
            else
                operands.add(a);
            if (b instanceof OR)
                operands.addAll(b.opnds);
            else
                operands.add(b);
            this.opnds = operands.toArray();
            let precedencePredicates = filterPrecedencePredicates(this.opnds);
            // interested in the transition with the highest precedence
            let reduced = max(precedencePredicates);
            if (reduced) {
                this.opnds.push(reduced);
            }
        }
        get operands() {
            return this.opnds;
        }
        equals(obj) {
            if (this === obj)
                return true;
            if (!(obj instanceof OR))
                return false;
            return ArrayEqualityComparator_1.ArrayEqualityComparator.INSTANCE.equals(this.opnds, obj.opnds);
        }
        hashCode() {
            return MurmurHash_1.MurmurHash.hashCode(this.opnds, OR_HASHCODE);
        }
        /**
         * {@inheritDoc}
         *
         * <p>
         * The evaluation of predicates by this context is short-circuiting, but
         * unordered.</p>
         */
        eval(parser, parserCallStack) {
            for (let opnd of this.opnds) {
                if (opnd.eval(parser, parserCallStack))
                    return true;
            }
            return false;
        }
        evalPrecedence(parser, parserCallStack) {
            let differs = false;
            let operands = [];
            for (let context of this.opnds) {
                let evaluated = context.evalPrecedence(parser, parserCallStack);
                differs = differs || (evaluated !== context);
                if (evaluated === SemanticContext.NONE) {
                    // The OR context is true if any element is true
                    return SemanticContext.NONE;
                }
                else if (evaluated) {
                    // Reduce the result by skipping false elements
                    operands.push(evaluated);
                }
            }
            if (!differs) {
                return this;
            }
            if (operands.length === 0) {
                // all elements were false, so the OR context is false
                return undefined;
            }
            let result = operands[0];
            for (let i = 1; i < operands.length; i++) {
                result = SemanticContext.or(result, operands[i]);
            }
            return result;
        }
        toString() {
            return Utils.join(this.opnds, "||");
        }
    };
    __decorate([
        Decorators_1.Override
    ], OR.prototype, "operands", null);
    __decorate([
        Decorators_1.Override
    ], OR.prototype, "equals", null);
    __decorate([
        Decorators_1.Override
    ], OR.prototype, "hashCode", null);
    __decorate([
        Decorators_1.Override
    ], OR.prototype, "eval", null);
    __decorate([
        Decorators_1.Override
    ], OR.prototype, "evalPrecedence", null);
    __decorate([
        Decorators_1.Override
    ], OR.prototype, "toString", null);
    OR = __decorate([
        __param(0, Decorators_1.NotNull), __param(1, Decorators_1.NotNull)
    ], OR);
    SemanticContext.OR = OR;
})(SemanticContext = exports.SemanticContext || (exports.SemanticContext = {}));

},{"../Decorators":16,"../misc/Array2DHashSet":104,"../misc/ArrayEqualityComparator":105,"../misc/MurmurHash":113,"../misc/ObjectEqualityComparator":114,"../misc/Utils":118}],89:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const IntervalSet_1 = require("../misc/IntervalSet");
const Decorators_1 = require("../Decorators");
const Token_1 = require("../Token");
const Transition_1 = require("./Transition");
/** A transition containing a set of values. */
let SetTransition = class SetTransition extends Transition_1.Transition {
    // TODO (sam): should we really allow null here?
    constructor(target, set) {
        super(target);
        if (set == null) {
            set = IntervalSet_1.IntervalSet.of(Token_1.Token.INVALID_TYPE);
        }
        this.set = set;
    }
    get serializationType() {
        return 7 /* SET */;
    }
    get label() {
        return this.set;
    }
    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return this.set.contains(symbol);
    }
    toString() {
        return this.set.toString();
    }
};
__decorate([
    Decorators_1.NotNull
], SetTransition.prototype, "set", void 0);
__decorate([
    Decorators_1.Override
], SetTransition.prototype, "serializationType", null);
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull
], SetTransition.prototype, "label", null);
__decorate([
    Decorators_1.Override
], SetTransition.prototype, "matches", null);
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull
], SetTransition.prototype, "toString", null);
SetTransition = __decorate([
    __param(0, Decorators_1.NotNull), __param(1, Decorators_1.Nullable)
], SetTransition);
exports.SetTransition = SetTransition;

},{"../Decorators":16,"../Token":40,"../misc/IntervalSet":112,"./Transition":95}],90:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
const ParserRuleContext_1 = require("../ParserRuleContext");
/**
 *
 * @author Sam Harwell
 */
let SimulatorState = class SimulatorState {
    constructor(outerContext, s0, useContext, remainingOuterContext) {
        this.outerContext = outerContext != null ? outerContext : ParserRuleContext_1.ParserRuleContext.emptyContext();
        this.s0 = s0;
        this.useContext = useContext;
        this.remainingOuterContext = remainingOuterContext;
    }
};
SimulatorState = __decorate([
    __param(1, Decorators_1.NotNull)
], SimulatorState);
exports.SimulatorState = SimulatorState;

},{"../Decorators":16,"../ParserRuleContext":31}],91:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const BlockStartState_1 = require("./BlockStartState");
const Decorators_1 = require("../Decorators");
/** The block that begins a closure loop. */
class StarBlockStartState extends BlockStartState_1.BlockStartState {
    get stateType() {
        return 5 /* STAR_BLOCK_START */;
    }
}
__decorate([
    Decorators_1.Override
], StarBlockStartState.prototype, "stateType", null);
exports.StarBlockStartState = StarBlockStartState;

},{"../Decorators":16,"./BlockStartState":56}],92:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const BitSet_1 = require("../misc/BitSet");
const DecisionState_1 = require("./DecisionState");
const Decorators_1 = require("../Decorators");
class StarLoopEntryState extends DecisionState_1.DecisionState {
    constructor() {
        super(...arguments);
        /**
         * Indicates whether this state can benefit from a precedence DFA during SLL
         * decision making.
         *
         * <p>This is a computed property that is calculated during ATN deserialization
         * and stored for use in {@link ParserATNSimulator} and
         * {@link ParserInterpreter}.</p>
         *
         * @see `DFA.isPrecedenceDfa`
         */
        this.precedenceRuleDecision = false;
        /**
         * For precedence decisions, this set marks states <em>S</em> which have all
         * of the following characteristics:
         *
         * <ul>
         * <li>One or more invocation sites of the current rule returns to
         * <em>S</em>.</li>
         * <li>The closure from <em>S</em> includes the current decision without
         * passing through any rule invocations or stepping out of the current
         * rule.</li>
         * </ul>
         *
         * <p>This field is not used when {@link #isPrecedenceDecision} is
         * {@code false}.</p>
         */
        this.precedenceLoopbackStates = new BitSet_1.BitSet();
    }
    get stateType() {
        return 10 /* STAR_LOOP_ENTRY */;
    }
}
__decorate([
    Decorators_1.Override
], StarLoopEntryState.prototype, "stateType", null);
exports.StarLoopEntryState = StarLoopEntryState;

},{"../Decorators":16,"../misc/BitSet":107,"./DecisionState":58}],93:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:37.6368726-07:00
const ATNState_1 = require("./ATNState");
const Decorators_1 = require("../Decorators");
class StarLoopbackState extends ATNState_1.ATNState {
    get loopEntryState() {
        return this.transition(0).target;
    }
    get stateType() {
        return 9 /* STAR_LOOP_BACK */;
    }
}
__decorate([
    Decorators_1.Override
], StarLoopbackState.prototype, "stateType", null);
exports.StarLoopbackState = StarLoopbackState;

},{"../Decorators":16,"./ATNState":49}],94:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const DecisionState_1 = require("./DecisionState");
const Decorators_1 = require("../Decorators");
/** The Tokens rule start state linking to each lexer rule start state */
class TokensStartState extends DecisionState_1.DecisionState {
    get stateType() {
        return 6 /* TOKEN_START */;
    }
}
__decorate([
    Decorators_1.Override
], TokensStartState.prototype, "stateType", null);
exports.TokensStartState = TokensStartState;

},{"../Decorators":16,"./DecisionState":58}],95:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
/** An ATN transition between any two ATN states.  Subclasses define
 *  atom, set, epsilon, action, predicate, rule transitions.
 *
 *  <p>This is a one way link.  It emanates from a state (usually via a list of
 *  transitions) and has a target state.</p>
 *
 *  <p>Since we never have to change the ATN transitions once we construct it,
 *  we can fix these transitions as specific classes. The DFA transitions
 *  on the other hand need to update the labels as it adds transitions to
 *  the states. We'll use the term Edge for the DFA to distinguish them from
 *  ATN transitions.</p>
 */
let Transition = class Transition {
    constructor(target) {
        if (target == null) {
            throw new Error("target cannot be null.");
        }
        this.target = target;
    }
    /**
     * Determines if the transition is an "epsilon" transition.
     *
     * <p>The default implementation returns {@code false}.</p>
     *
     * @return {@code true} if traversing this transition in the ATN does not
     * consume an input symbol; otherwise, {@code false} if traversing this
     * transition consumes (matches) an input symbol.
     */
    get isEpsilon() {
        return false;
    }
    get label() {
        return undefined;
    }
};
Transition.serializationNames = [
    "INVALID",
    "EPSILON",
    "RANGE",
    "RULE",
    "PREDICATE",
    "ATOM",
    "ACTION",
    "SET",
    "NOT_SET",
    "WILDCARD",
    "PRECEDENCE"
];
__decorate([
    Decorators_1.NotNull
], Transition.prototype, "target", void 0);
Transition = __decorate([
    __param(0, Decorators_1.NotNull)
], Transition);
exports.Transition = Transition;

},{"../Decorators":16}],96:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
const Transition_1 = require("./Transition");
let WildcardTransition = class WildcardTransition extends Transition_1.Transition {
    constructor(target) {
        super(target);
    }
    get serializationType() {
        return 9 /* WILDCARD */;
    }
    matches(symbol, minVocabSymbol, maxVocabSymbol) {
        return symbol >= minVocabSymbol && symbol <= maxVocabSymbol;
    }
    toString() {
        return ".";
    }
};
__decorate([
    Decorators_1.Override
], WildcardTransition.prototype, "serializationType", null);
__decorate([
    Decorators_1.Override
], WildcardTransition.prototype, "matches", null);
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull
], WildcardTransition.prototype, "toString", null);
WildcardTransition = __decorate([
    __param(0, Decorators_1.NotNull)
], WildcardTransition);
exports.WildcardTransition = WildcardTransition;

},{"../Decorators":16,"./Transition":95}],97:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Stores information about a {@link DFAState} which is an accept state under
 * some condition. Certain settings, such as
 * {@link ParserATNSimulator#getPredictionMode()}, may be used in addition to
 * this information to determine whether or not a particular state is an accept
 * state.
 *
 * @author Sam Harwell
 */
class AcceptStateInfo {
    constructor(prediction, lexerActionExecutor) {
        this._prediction = prediction;
        this._lexerActionExecutor = lexerActionExecutor;
    }
    /**
     * Gets the prediction made by this accept state. Note that this value
     * assumes the predicates, if any, in the {@link DFAState} evaluate to
     * {@code true}. If predicate evaluation is enabled, the final prediction of
     * the accept state will be determined by the result of predicate
     * evaluation.
     */
    get prediction() {
        return this._prediction;
    }
    /**
     * Gets the {@link LexerActionExecutor} which can be used to execute actions
     * and/or commands after the lexer matches a token.
     */
    get lexerActionExecutor() {
        return this._lexerActionExecutor;
    }
}
exports.AcceptStateInfo = AcceptStateInfo;

},{}],98:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:38.3567094-07:00
const Array2DHashSet_1 = require("../misc/Array2DHashSet");
const ATNConfigSet_1 = require("../atn/ATNConfigSet");
const DFASerializer_1 = require("./DFASerializer");
const DFAState_1 = require("./DFAState");
const LexerDFASerializer_1 = require("./LexerDFASerializer");
const Decorators_1 = require("../Decorators");
const ObjectEqualityComparator_1 = require("../misc/ObjectEqualityComparator");
const StarLoopEntryState_1 = require("../atn/StarLoopEntryState");
const VocabularyImpl_1 = require("../VocabularyImpl");
let DFA = class DFA {
    constructor(atnStartState, decision = 0) {
        /**
         * A set of all states in the `DFA`.
         *
         * Note that this collection of states holds the DFA states for both SLL and LL prediction. Only the start state
         * needs to be differentiated for these cases, which is tracked by the `s0` and `s0full` fields.
         */
        this.states = new Array2DHashSet_1.Array2DHashSet(ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE);
        this.nextStateNumber = 0;
        if (!atnStartState.atn) {
            throw new Error("The ATNState must be associated with an ATN");
        }
        this.atnStartState = atnStartState;
        this.atn = atnStartState.atn;
        this.decision = decision;
        // Precedence DFAs are associated with the special precedence decision created for left-recursive rules which
        // evaluate their alternatives using a precedence hierarchy. When such a decision is encountered, we mark this
        // DFA instance as a precedence DFA and initialize the initial states s0 and s0full to special DFAState
        // instances which use outgoing edges to link to the actual start state used for each precedence level.
        let isPrecedenceDfa = false;
        if (atnStartState instanceof StarLoopEntryState_1.StarLoopEntryState) {
            if (atnStartState.precedenceRuleDecision) {
                isPrecedenceDfa = true;
                this.s0 = new DFAState_1.DFAState(new ATNConfigSet_1.ATNConfigSet());
                this.s0full = new DFAState_1.DFAState(new ATNConfigSet_1.ATNConfigSet());
            }
        }
        this.precedenceDfa = isPrecedenceDfa;
    }
    /**
     * Gets whether this DFA is a precedence DFA. Precedence DFAs use a special
     * start state {@link #s0} which is not stored in {@link #states}. The
     * {@link DFAState#edges} array for this start state contains outgoing edges
     * supplying individual start states corresponding to specific precedence
     * values.
     *
     * @return {@code true} if this is a precedence DFA; otherwise,
     * {@code false}.
     * @see Parser.precedence
     */
    get isPrecedenceDfa() {
        return this.precedenceDfa;
    }
    /**
     * Get the start state for a specific precedence value.
     *
     * @param precedence The current precedence.
     * @return The start state corresponding to the specified precedence, or
     * {@code null} if no start state exists for the specified precedence.
     *
     * @ if this is not a precedence DFA.
     * @see `isPrecedenceDfa`
     */
    getPrecedenceStartState(precedence, fullContext) {
        if (!this.isPrecedenceDfa) {
            throw new Error("Only precedence DFAs may contain a precedence start state.");
        }
        // s0 and s0full are never null for a precedence DFA
        if (fullContext) {
            return this.s0full.getTarget(precedence);
        }
        else {
            return this.s0.getTarget(precedence);
        }
    }
    /**
     * Set the start state for a specific precedence value.
     *
     * @param precedence The current precedence.
     * @param startState The start state corresponding to the specified
     * precedence.
     *
     * @ if this is not a precedence DFA.
     * @see `isPrecedenceDfa`
     */
    setPrecedenceStartState(precedence, fullContext, startState) {
        if (!this.isPrecedenceDfa) {
            throw new Error("Only precedence DFAs may contain a precedence start state.");
        }
        if (precedence < 0) {
            return;
        }
        if (fullContext) {
            // s0full is never null for a precedence DFA
            this.s0full.setTarget(precedence, startState);
        }
        else {
            // s0 is never null for a precedence DFA
            this.s0.setTarget(precedence, startState);
        }
    }
    get isEmpty() {
        if (this.isPrecedenceDfa) {
            // s0 and s0full are never null for a precedence DFA
            return this.s0.getEdgeMap().size === 0 && this.s0full.getEdgeMap().size === 0;
        }
        return this.s0 == null && this.s0full == null;
    }
    get isContextSensitive() {
        if (this.isPrecedenceDfa) {
            // s0full is never null for a precedence DFA
            return this.s0full.getEdgeMap().size > 0;
        }
        return this.s0full != null;
    }
    addState(state) {
        state.stateNumber = this.nextStateNumber++;
        return this.states.getOrAdd(state);
    }
    toString(vocabulary, ruleNames) {
        if (!vocabulary) {
            vocabulary = VocabularyImpl_1.VocabularyImpl.EMPTY_VOCABULARY;
        }
        if (!this.s0) {
            return "";
        }
        let serializer;
        if (ruleNames) {
            serializer = new DFASerializer_1.DFASerializer(this, vocabulary, ruleNames, this.atnStartState.atn);
        }
        else {
            serializer = new DFASerializer_1.DFASerializer(this, vocabulary);
        }
        return serializer.toString();
    }
    toLexerString() {
        if (!this.s0) {
            return "";
        }
        let serializer = new LexerDFASerializer_1.LexerDFASerializer(this);
        return serializer.toString();
    }
};
__decorate([
    Decorators_1.NotNull
], DFA.prototype, "states", void 0);
__decorate([
    Decorators_1.NotNull
], DFA.prototype, "atnStartState", void 0);
__decorate([
    Decorators_1.NotNull
], DFA.prototype, "atn", void 0);
DFA = __decorate([
    __param(0, Decorators_1.NotNull)
], DFA);
exports.DFA = DFA;

},{"../Decorators":16,"../VocabularyImpl":42,"../atn/ATNConfigSet":45,"../atn/StarLoopEntryState":92,"../misc/Array2DHashSet":104,"../misc/ObjectEqualityComparator":114,"./DFASerializer":99,"./DFAState":100,"./LexerDFASerializer":101}],99:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:38.5097925-07:00
const Stubs_1 = require("../misc/Stubs");
const ATNSimulator_1 = require("../atn/ATNSimulator");
const Decorators_1 = require("../Decorators");
const PredictionContext_1 = require("../atn/PredictionContext");
const Recognizer_1 = require("../Recognizer");
const VocabularyImpl_1 = require("../VocabularyImpl");
/** A DFA walker that knows how to dump them to serialized strings. */
class DFASerializer {
    constructor(dfa, vocabulary, ruleNames, atn) {
        if (vocabulary instanceof Recognizer_1.Recognizer) {
            ruleNames = vocabulary.ruleNames;
            atn = vocabulary.atn;
            vocabulary = vocabulary.vocabulary;
        }
        else if (!vocabulary) {
            vocabulary = VocabularyImpl_1.VocabularyImpl.EMPTY_VOCABULARY;
        }
        this.dfa = dfa;
        this.vocabulary = vocabulary;
        this.ruleNames = ruleNames;
        this.atn = atn;
    }
    toString() {
        if (!this.dfa.s0) {
            return "";
        }
        let buf = "";
        if (this.dfa.states) {
            let states = new Array(...this.dfa.states.toArray());
            states.sort((o1, o2) => o1.stateNumber - o2.stateNumber);
            for (let s of states) {
                let edges = s.getEdgeMap();
                let edgeKeys = [...edges.keys()].sort((a, b) => a - b);
                let contextEdges = s.getContextEdgeMap();
                let contextEdgeKeys = [...contextEdges.keys()].sort((a, b) => a - b);
                for (let entry of edgeKeys) {
                    let value = edges.get(entry);
                    if ((value == null || value === ATNSimulator_1.ATNSimulator.ERROR) && !s.isContextSymbol(entry)) {
                        continue;
                    }
                    let contextSymbol = false;
                    buf += (this.getStateString(s)) + ("-") + (this.getEdgeLabel(entry)) + ("->");
                    if (s.isContextSymbol(entry)) {
                        buf += ("!");
                        contextSymbol = true;
                    }
                    let t = value;
                    if (t && t.stateNumber !== ATNSimulator_1.ATNSimulator.ERROR.stateNumber) {
                        buf += (this.getStateString(t)) + ('\n');
                    }
                    else if (contextSymbol) {
                        buf += ("ctx\n");
                    }
                }
                if (s.isContextSensitive) {
                    for (let entry of contextEdgeKeys) {
                        buf += (this.getStateString(s))
                            + ("-")
                            + (this.getContextLabel(entry))
                            + ("->")
                            + (this.getStateString(contextEdges.get(entry)))
                            + ("\n");
                    }
                }
            }
        }
        let output = buf;
        if (output.length === 0)
            return "";
        //return Utils.sortLinesInString(output);
        return output;
    }
    getContextLabel(i) {
        if (i === PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY) {
            return "ctx:EMPTY_FULL";
        }
        else if (i === PredictionContext_1.PredictionContext.EMPTY_LOCAL_STATE_KEY) {
            return "ctx:EMPTY_LOCAL";
        }
        if (this.atn && i > 0 && i <= this.atn.states.length) {
            let state = this.atn.states[i];
            let ruleIndex = state.ruleIndex;
            if (this.ruleNames && ruleIndex >= 0 && ruleIndex < this.ruleNames.length) {
                return "ctx:" + String(i) + "(" + this.ruleNames[ruleIndex] + ")";
            }
        }
        return "ctx:" + String(i);
    }
    getEdgeLabel(i) {
        return this.vocabulary.getDisplayName(i);
    }
    getStateString(s) {
        if (s === ATNSimulator_1.ATNSimulator.ERROR) {
            return "ERROR";
        }
        let n = s.stateNumber;
        let stateStr = "s" + n;
        if (s.isAcceptState) {
            if (s.predicates) {
                stateStr = ":s" + n + "=>" + s.predicates;
            }
            else {
                stateStr = ":s" + n + "=>" + s.prediction;
            }
        }
        if (s.isContextSensitive) {
            stateStr += "*";
            for (let config of Stubs_1.asIterable(s.configs)) {
                if (config.reachesIntoOuterContext) {
                    stateStr += "*";
                    break;
                }
            }
        }
        return stateStr;
    }
}
__decorate([
    Decorators_1.NotNull
], DFASerializer.prototype, "dfa", void 0);
__decorate([
    Decorators_1.NotNull
], DFASerializer.prototype, "vocabulary", void 0);
__decorate([
    Decorators_1.Override
], DFASerializer.prototype, "toString", null);
exports.DFASerializer = DFASerializer;

},{"../Decorators":16,"../Recognizer":35,"../VocabularyImpl":42,"../atn/ATNSimulator":48,"../atn/PredictionContext":81,"../misc/Stubs":116}],100:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const ATN_1 = require("../atn/ATN");
const BitSet_1 = require("../misc/BitSet");
const MurmurHash_1 = require("../misc/MurmurHash");
const Decorators_1 = require("../Decorators");
const PredictionContext_1 = require("../atn/PredictionContext");
const assert = require("assert");
/** A DFA state represents a set of possible ATN configurations.
 *  As Aho, Sethi, Ullman p. 117 says "The DFA uses its state
 *  to keep track of all possible states the ATN can be in after
 *  reading each input symbol.  That is to say, after reading
 *  input a1a2..an, the DFA is in a state that represents the
 *  subset T of the states of the ATN that are reachable from the
 *  ATN's start state along some path labeled a1a2..an."
 *  In conventional NFA&rarr;DFA conversion, therefore, the subset T
 *  would be a bitset representing the set of states the
 *  ATN could be in.  We need to track the alt predicted by each
 *  state as well, however.  More importantly, we need to maintain
 *  a stack of states, tracking the closure operations as they
 *  jump from rule to rule, emulating rule invocations (method calls).
 *  I have to add a stack to simulate the proper lookahead sequences for
 *  the underlying LL grammar from which the ATN was derived.
 *
 *  <p>I use a set of ATNConfig objects not simple states.  An ATNConfig
 *  is both a state (ala normal conversion) and a RuleContext describing
 *  the chain of rules (if any) followed to arrive at that state.</p>
 *
 *  <p>A DFA state may have multiple references to a particular state,
 *  but with different ATN contexts (with same or different alts)
 *  meaning that state was reached via a different set of rule invocations.</p>
 */
class DFAState {
    /**
     * Constructs a new `DFAState`.
     *
     * @param configs The set of ATN configurations defining this state.
     */
    constructor(configs) {
        this.stateNumber = -1;
        this.configs = configs;
        this.edges = new Map();
        this.contextEdges = new Map();
    }
    get isContextSensitive() {
        return !!this.contextSymbols;
    }
    isContextSymbol(symbol) {
        if (!this.isContextSensitive) {
            return false;
        }
        return this.contextSymbols.get(symbol);
    }
    setContextSymbol(symbol) {
        assert(this.isContextSensitive);
        this.contextSymbols.set(symbol);
    }
    setContextSensitive(atn) {
        assert(!this.configs.isOutermostConfigSet);
        if (this.isContextSensitive) {
            return;
        }
        if (!this.contextSymbols) {
            this.contextSymbols = new BitSet_1.BitSet();
        }
    }
    get acceptStateInfo() {
        return this._acceptStateInfo;
    }
    set acceptStateInfo(acceptStateInfo) {
        this._acceptStateInfo = acceptStateInfo;
    }
    get isAcceptState() {
        return !!this._acceptStateInfo;
    }
    get prediction() {
        if (!this._acceptStateInfo) {
            return ATN_1.ATN.INVALID_ALT_NUMBER;
        }
        return this._acceptStateInfo.prediction;
    }
    get lexerActionExecutor() {
        if (!this._acceptStateInfo) {
            return undefined;
        }
        return this._acceptStateInfo.lexerActionExecutor;
    }
    getTarget(symbol) {
        return this.edges.get(symbol);
    }
    setTarget(symbol, target) {
        this.edges.set(symbol, target);
    }
    getEdgeMap() {
        return this.edges;
    }
    getContextTarget(invokingState) {
        if (invokingState === PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY) {
            invokingState = -1;
        }
        return this.contextEdges.get(invokingState);
    }
    setContextTarget(invokingState, target) {
        if (!this.isContextSensitive) {
            throw new Error("The state is not context sensitive.");
        }
        if (invokingState === PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY) {
            invokingState = -1;
        }
        this.contextEdges.set(invokingState, target);
    }
    getContextEdgeMap() {
        let map = new Map(this.contextEdges);
        let existing = map.get(-1);
        if (existing !== undefined) {
            if (map.size === 1) {
                let result = new Map();
                result.set(PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY, existing);
                return result;
            }
            else {
                map.delete(-1);
                map.set(PredictionContext_1.PredictionContext.EMPTY_FULL_STATE_KEY, existing);
            }
        }
        return map;
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize(7);
        hash = MurmurHash_1.MurmurHash.update(hash, this.configs.hashCode());
        hash = MurmurHash_1.MurmurHash.finish(hash, 1);
        return hash;
    }
    /**
     * Two {@link DFAState} instances are equal if their ATN configuration sets
     * are the same. This method is used to see if a state already exists.
     *
     * <p>Because the number of alternatives and number of ATN configurations are
     * finite, there is a finite number of DFA states that can be processed.
     * This is necessary to show that the algorithm terminates.</p>
     *
     * <p>Cannot test the DFA state numbers here because in
     * {@link ParserATNSimulator#addDFAState} we need to know if any other state
     * exists that has this exact set of ATN configurations. The
     * {@link #stateNumber} is irrelevant.</p>
     */
    equals(o) {
        // compare set of ATN configurations in this set with other
        if (this === o)
            return true;
        if (!(o instanceof DFAState)) {
            return false;
        }
        let other = o;
        let sameSet = this.configs.equals(other.configs);
        //		System.out.println("DFAState.equals: "+configs+(sameSet?"==":"!=")+other.configs);
        return sameSet;
    }
    toString() {
        let buf = "";
        buf += (this.stateNumber) + (":") + (this.configs);
        if (this.isAcceptState) {
            buf += ("=>");
            if (this.predicates) {
                buf += this.predicates;
            }
            else {
                buf += (this.prediction);
            }
        }
        return buf.toString();
    }
}
__decorate([
    Decorators_1.NotNull
], DFAState.prototype, "configs", void 0);
__decorate([
    Decorators_1.NotNull
], DFAState.prototype, "edges", void 0);
__decorate([
    Decorators_1.NotNull
], DFAState.prototype, "contextEdges", void 0);
__decorate([
    Decorators_1.Override
], DFAState.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], DFAState.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], DFAState.prototype, "toString", null);
exports.DFAState = DFAState;
(function (DFAState) {
    /** Map a predicate to a predicted alternative. */
    let PredPrediction = class PredPrediction {
        constructor(pred, alt) {
            this.alt = alt;
            this.pred = pred;
        }
        toString() {
            return "(" + this.pred + ", " + this.alt + ")";
        }
    };
    __decorate([
        Decorators_1.NotNull
    ], PredPrediction.prototype, "pred", void 0);
    __decorate([
        Decorators_1.Override
    ], PredPrediction.prototype, "toString", null);
    PredPrediction = __decorate([
        __param(0, Decorators_1.NotNull)
    ], PredPrediction);
    DFAState.PredPrediction = PredPrediction;
})(DFAState = exports.DFAState || (exports.DFAState = {}));

},{"../Decorators":16,"../atn/ATN":43,"../atn/PredictionContext":81,"../misc/BitSet":107,"../misc/MurmurHash":113,"assert":127}],101:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const DFASerializer_1 = require("./DFASerializer");
const Decorators_1 = require("../Decorators");
const VocabularyImpl_1 = require("../VocabularyImpl");
let LexerDFASerializer = class LexerDFASerializer extends DFASerializer_1.DFASerializer {
    constructor(dfa) {
        super(dfa, VocabularyImpl_1.VocabularyImpl.EMPTY_VOCABULARY);
    }
    getEdgeLabel(i) {
        return "'" + String.fromCharCode(i) + "'";
    }
};
__decorate([
    Decorators_1.Override,
    Decorators_1.NotNull
], LexerDFASerializer.prototype, "getEdgeLabel", null);
LexerDFASerializer = __decorate([
    __param(0, Decorators_1.NotNull)
], LexerDFASerializer);
exports.LexerDFASerializer = LexerDFASerializer;

},{"../Decorators":16,"../VocabularyImpl":42,"./DFASerializer":99}],102:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// export * from './ANTLRFileStream';
__export(require("./ANTLRInputStream"));
__export(require("./BailErrorStrategy"));
__export(require("./BufferedTokenStream"));
__export(require("./CommonToken"));
__export(require("./CommonTokenFactory"));
__export(require("./CommonTokenStream"));
__export(require("./ConsoleErrorListener"));
__export(require("./DefaultErrorStrategy"));
__export(require("./Dependents"));
__export(require("./DiagnosticErrorListener"));
__export(require("./FailedPredicateException"));
__export(require("./InputMismatchException"));
__export(require("./InterpreterRuleContext"));
__export(require("./IntStream"));
__export(require("./Lexer"));
__export(require("./LexerInterpreter"));
__export(require("./LexerNoViableAltException"));
__export(require("./ListTokenSource"));
__export(require("./NoViableAltException"));
__export(require("./Parser"));
__export(require("./ParserInterpreter"));
__export(require("./ParserRuleContext"));
__export(require("./ProxyErrorListener"));
__export(require("./ProxyParserErrorListener"));
__export(require("./RecognitionException"));
__export(require("./Recognizer"));
__export(require("./RuleContext"));
__export(require("./RuleContextWithAltNum"));
__export(require("./RuleDependency"));
__export(require("./RuleVersion"));
__export(require("./Token"));
__export(require("./TokenStreamRewriter"));
__export(require("./VocabularyImpl"));

},{"./ANTLRInputStream":9,"./BailErrorStrategy":10,"./BufferedTokenStream":11,"./CommonToken":12,"./CommonTokenFactory":13,"./CommonTokenStream":14,"./ConsoleErrorListener":15,"./DefaultErrorStrategy":17,"./Dependents":18,"./DiagnosticErrorListener":19,"./FailedPredicateException":20,"./InputMismatchException":21,"./IntStream":22,"./InterpreterRuleContext":23,"./Lexer":24,"./LexerInterpreter":25,"./LexerNoViableAltException":26,"./ListTokenSource":27,"./NoViableAltException":28,"./Parser":29,"./ParserInterpreter":30,"./ParserRuleContext":31,"./ProxyErrorListener":32,"./ProxyParserErrorListener":33,"./RecognitionException":34,"./Recognizer":35,"./RuleContext":36,"./RuleContextWithAltNum":37,"./RuleDependency":38,"./RuleVersion":39,"./Token":40,"./TokenStreamRewriter":41,"./VocabularyImpl":42}],103:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Array2DHashSet_1 = require("./Array2DHashSet");
const Stubs_1 = require("./Stubs");
const DefaultEqualityComparator_1 = require("./DefaultEqualityComparator");
class MapKeyEqualityComparator {
    constructor(keyComparator) {
        this.keyComparator = keyComparator;
    }
    hashCode(obj) {
        return this.keyComparator.hashCode(obj.key);
    }
    equals(a, b) {
        return this.keyComparator.equals(a.key, b.key);
    }
}
class Array2DHashMap {
    constructor(keyComparer) {
        if (keyComparer instanceof Array2DHashMap) {
            this.backingStore = new Array2DHashSet_1.Array2DHashSet(keyComparer.backingStore);
        }
        else {
            this.backingStore = new Array2DHashSet_1.Array2DHashSet(new MapKeyEqualityComparator(keyComparer));
        }
    }
    clear() {
        this.backingStore.clear();
    }
    containsKey(key) {
        return this.backingStore.contains({ key });
    }
    containsValue(value) {
        return this.values().contains(value);
    }
    entrySet() {
        return new EntrySet(this, this.backingStore);
    }
    get(key) {
        let bucket = this.backingStore.get({ key });
        if (!bucket) {
            return undefined;
        }
        return bucket.value;
    }
    get isEmpty() {
        return this.backingStore.isEmpty;
    }
    keySet() {
        return new KeySet(this, this.backingStore);
    }
    put(key, value) {
        let element = this.backingStore.get({ key, value });
        let result;
        if (!element) {
            this.backingStore.add({ key, value });
        }
        else {
            result = element.value;
            element.value = value;
        }
        return result;
    }
    putIfAbsent(key, value) {
        let element = this.backingStore.get({ key, value });
        let result;
        if (!element) {
            this.backingStore.add({ key, value });
        }
        else {
            result = element.value;
        }
        return result;
    }
    putAll(m) {
        for (let entry of Stubs_1.asIterable(m.entrySet())) {
            this.put(entry.getKey(), entry.getValue());
        }
    }
    remove(key) {
        let value = this.get(key);
        this.backingStore.remove({ key });
        return value;
    }
    get size() {
        return this.backingStore.size;
    }
    values() {
        return new ValueCollection(this, this.backingStore);
    }
    hashCode() {
        return this.backingStore.hashCode();
    }
    equals(o) {
        if (!(o instanceof Array2DHashMap)) {
            return false;
        }
        return this.backingStore.equals(o.backingStore);
    }
}
exports.Array2DHashMap = Array2DHashMap;
class EntrySet {
    constructor(map, backingStore) {
        this.map = map;
        this.backingStore = backingStore;
    }
    add(e) {
        throw new Error("Not implemented");
    }
    addAll(collection) {
        throw new Error("Not implemented");
    }
    clear() {
        this.map.clear();
    }
    contains(o) {
        throw new Error("Not implemented");
    }
    containsAll(collection) {
        for (let key of Stubs_1.asIterable(collection)) {
            if (!this.contains(key)) {
                return false;
            }
        }
        return true;
    }
    equals(o) {
        if (o === this) {
            return true;
        }
        else if (!(o instanceof EntrySet)) {
            return false;
        }
        return this.backingStore.equals(o.backingStore);
    }
    hashCode() {
        return this.backingStore.hashCode();
    }
    get isEmpty() {
        return this.backingStore.isEmpty;
    }
    iterator() {
        throw new Error("Not implemented");
    }
    remove(o) {
        throw new Error("Not implemented");
    }
    removeAll(collection) {
        let removedAny = false;
        for (let key of Stubs_1.asIterable(collection)) {
            removedAny = this.remove(key) || removedAny;
        }
        return removedAny;
    }
    retainAll(collection) {
        throw new Error("Not implemented");
    }
    get size() {
        return this.backingStore.size;
    }
    toArray(a) {
        throw new Error("Not implemented");
    }
}
class KeySet {
    constructor(map, backingStore) {
        this.map = map;
        this.backingStore = backingStore;
    }
    add(e) {
        throw new Error("Not supported");
    }
    addAll(collection) {
        throw new Error("Not supported");
    }
    clear() {
        this.map.clear();
    }
    contains(o) {
        return this.backingStore.contains({ key: o });
    }
    containsAll(collection) {
        for (let key of Stubs_1.asIterable(collection)) {
            if (!this.contains(key)) {
                return false;
            }
        }
        return true;
    }
    equals(o) {
        if (o === this) {
            return true;
        }
        else if (!(o instanceof KeySet)) {
            return false;
        }
        return this.backingStore.equals(o.backingStore);
    }
    hashCode() {
        return this.backingStore.hashCode();
    }
    get isEmpty() {
        return this.backingStore.isEmpty;
    }
    iterator() {
        throw new Error("Not implemented");
    }
    remove(o) {
        return this.backingStore.remove({ key: o });
    }
    removeAll(collection) {
        let removedAny = false;
        for (let key of Stubs_1.asIterable(collection)) {
            removedAny = this.remove(key) || removedAny;
        }
        return removedAny;
    }
    retainAll(collection) {
        throw new Error("Not implemented");
    }
    get size() {
        return this.backingStore.size;
    }
    toArray(a) {
        throw new Error("Not implemented");
    }
}
class ValueCollection {
    constructor(map, backingStore) {
        this.map = map;
        this.backingStore = backingStore;
    }
    add(e) {
        throw new Error("Not supported");
    }
    addAll(collection) {
        throw new Error("Not supported");
    }
    clear() {
        this.map.clear();
    }
    contains(o) {
        for (let bucket of Stubs_1.asIterable(this.backingStore)) {
            if (DefaultEqualityComparator_1.DefaultEqualityComparator.INSTANCE.equals(o, bucket.value)) {
                return true;
            }
        }
        return false;
    }
    containsAll(collection) {
        for (let key of Stubs_1.asIterable(collection)) {
            if (!this.contains(key)) {
                return false;
            }
        }
        return true;
    }
    equals(o) {
        if (o === this) {
            return true;
        }
        else if (!(o instanceof ValueCollection)) {
            return false;
        }
        return this.backingStore.equals(o.backingStore);
    }
    hashCode() {
        return this.backingStore.hashCode();
    }
    get isEmpty() {
        return this.backingStore.isEmpty;
    }
    iterator() {
        let delegate = this.backingStore.iterator();
        return {
            hasNext() {
                return delegate.hasNext();
            },
            next() {
                return delegate.next().value;
            },
            remove() {
                throw new Error("Not supported");
            }
        };
    }
    remove(o) {
        throw new Error("Not implemented");
    }
    removeAll(collection) {
        let removedAny = false;
        for (let key of Stubs_1.asIterable(collection)) {
            removedAny = this.remove(key) || removedAny;
        }
        return removedAny;
    }
    retainAll(collection) {
        throw new Error("Not implemented");
    }
    get size() {
        return this.backingStore.size;
    }
    toArray(a) {
        if (a === undefined || a.length < this.backingStore.size) {
            a = new Array(this.backingStore.size);
        }
        let i = 0;
        for (let bucket of Stubs_1.asIterable(this.backingStore)) {
            a[i++] = bucket.value;
        }
        return a;
    }
}

},{"./Array2DHashSet":104,"./DefaultEqualityComparator":108,"./Stubs":116}],104:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-03T02:09:41.7434086-07:00
const assert = require("assert");
const DefaultEqualityComparator_1 = require("./DefaultEqualityComparator");
const Decorators_1 = require("../Decorators");
const Stubs_1 = require("./Stubs");
const MurmurHash_1 = require("./MurmurHash");
/** {@link Set} implementation with closed hashing (open addressing). */
// NOTE:  JavaScript's Set interface has on significant different diffrence from Java's:
// 		  e.g. the return type of add() differs!
//        For this reason I've commented tweaked the implements clause
const INITAL_CAPACITY = 16; // must be power of 2
const LOAD_FACTOR = 0.75;
class Array2DHashSet {
    constructor(comparatorOrSet, initialCapacity = INITAL_CAPACITY) {
        /** How many elements in set */
        this.n = 0;
        this.threshold = Math.floor(INITAL_CAPACITY * LOAD_FACTOR); // when to expand
        if (comparatorOrSet instanceof Array2DHashSet) {
            this.comparator = comparatorOrSet.comparator;
            this.buckets = comparatorOrSet.buckets.slice(0);
            for (let i = 0; i < this.buckets.length; i++) {
                let bucket = this.buckets[i];
                if (bucket) {
                    this.buckets[i] = bucket.slice(0);
                }
            }
            this.n = comparatorOrSet.n;
            this.threshold = comparatorOrSet.threshold;
        }
        else {
            this.comparator = comparatorOrSet || DefaultEqualityComparator_1.DefaultEqualityComparator.INSTANCE;
            this.buckets = this.createBuckets(initialCapacity);
        }
    }
    /**
     * Add {@code o} to set if not there; return existing value if already
     * there. This method performs the same operation as {@link #add} aside from
     * the return value.
     */
    getOrAdd(o) {
        if (this.n > this.threshold)
            this.expand();
        return this.getOrAddImpl(o);
    }
    getOrAddImpl(o) {
        let b = this.getBucket(o);
        let bucket = this.buckets[b];
        // NEW BUCKET
        if (!bucket) {
            bucket = [o];
            this.buckets[b] = bucket;
            this.n++;
            return o;
        }
        // LOOK FOR IT IN BUCKET
        for (let i = 0; i < bucket.length; i++) {
            let existing = bucket[i];
            if (this.comparator.equals(existing, o)) {
                return existing; // found existing, quit
            }
        }
        // FULL BUCKET, expand and add to end
        bucket.push(o);
        this.n++;
        return o;
    }
    get(o) {
        if (o == null)
            return o;
        let b = this.getBucket(o);
        let bucket = this.buckets[b];
        if (!bucket) {
            // no bucket
            return undefined;
        }
        for (let e of bucket) {
            if (this.comparator.equals(e, o)) {
                return e;
            }
        }
        return undefined;
    }
    getBucket(o) {
        let hash = this.comparator.hashCode(o);
        let b = hash & (this.buckets.length - 1); // assumes len is power of 2
        return b;
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize();
        for (let bucket of this.buckets) {
            if (bucket == null)
                continue;
            for (let o of bucket) {
                if (o == null)
                    break;
                hash = MurmurHash_1.MurmurHash.update(hash, this.comparator.hashCode(o));
            }
        }
        hash = MurmurHash_1.MurmurHash.finish(hash, this.size);
        return hash;
    }
    equals(o) {
        if (o === this)
            return true;
        if (!(o instanceof Array2DHashSet))
            return false;
        if (o.size !== this.size)
            return false;
        let same = this.containsAll(o);
        return same;
    }
    expand() {
        let old = this.buckets;
        let newCapacity = this.buckets.length * 2;
        let newTable = this.createBuckets(newCapacity);
        this.buckets = newTable;
        this.threshold = Math.floor(newCapacity * LOAD_FACTOR);
        //		System.out.println("new size="+newCapacity+", thres="+threshold);
        // rehash all existing entries
        let oldSize = this.size;
        for (let bucket of old) {
            if (!bucket) {
                continue;
            }
            for (let o of bucket) {
                let b = this.getBucket(o);
                let newBucket = this.buckets[b];
                if (!newBucket) {
                    newBucket = [];
                    this.buckets[b] = newBucket;
                }
                newBucket.push(o);
            }
        }
        assert(this.n === oldSize);
    }
    add(t) {
        let existing = this.getOrAdd(t);
        return existing === t;
    }
    get size() {
        return this.n;
    }
    get isEmpty() {
        return this.n === 0;
    }
    contains(o) {
        return this.containsFast(this.asElementType(o));
    }
    containsFast(obj) {
        if (obj == null) {
            return false;
        }
        return this.get(obj) != null;
    }
    iterator() {
        return new SetIterator(this.toArray(), this);
    }
    toArray(a) {
        // Check if the array argument was provided
        if (!a || a.length < this.size) {
            a = new Array(this.size);
        }
        // Copy elements from the nested arrays into the destination array
        let i = 0; // Position within destination array
        for (let bucket of this.buckets) {
            if (bucket == null) {
                continue;
            }
            for (let o of bucket) {
                if (o == null) {
                    break;
                }
                a[i++] = o;
            }
        }
        return a;
    }
    remove(o) {
        return this.removeFast(this.asElementType(o));
    }
    removeFast(obj) {
        if (obj == null) {
            return false;
        }
        let b = this.getBucket(obj);
        let bucket = this.buckets[b];
        if (!bucket) {
            // no bucket
            return false;
        }
        for (let i = 0; i < bucket.length; i++) {
            let e = bucket[i];
            if (this.comparator.equals(e, obj)) {
                // shift all elements to the right down one
                bucket.copyWithin(i, i + 1);
                bucket.length--;
                this.n--;
                return true;
            }
        }
        return false;
    }
    containsAll(collection) {
        if (collection instanceof Array2DHashSet) {
            let s = collection;
            for (let bucket of s.buckets) {
                if (bucket == null)
                    continue;
                for (let o of bucket) {
                    if (o == null)
                        break;
                    if (!this.containsFast(this.asElementType(o)))
                        return false;
                }
            }
        }
        else {
            for (let o of Stubs_1.asIterable(collection)) {
                if (!this.containsFast(this.asElementType(o)))
                    return false;
            }
        }
        return true;
    }
    addAll(c) {
        let changed = false;
        for (let o of Stubs_1.asIterable(c)) {
            let existing = this.getOrAdd(o);
            if (existing !== o)
                changed = true;
        }
        return changed;
    }
    retainAll(c) {
        let newsize = 0;
        for (let bucket of this.buckets) {
            if (bucket == null) {
                continue;
            }
            let i;
            let j;
            for (i = 0, j = 0; i < bucket.length; i++) {
                if (bucket[i] == null) {
                    break;
                }
                if (!c.contains(bucket[i])) {
                    // removed
                    continue;
                }
                // keep
                if (i !== j) {
                    bucket[j] = bucket[i];
                }
                j++;
                newsize++;
            }
            newsize += j;
            bucket.length = j;
        }
        let changed = newsize != this.n;
        this.n = newsize;
        return changed;
    }
    removeAll(c) {
        let changed = false;
        for (let o of Stubs_1.asIterable(c)) {
            if (this.removeFast(this.asElementType(o)))
                changed = true;
        }
        return changed;
    }
    clear() {
        this.buckets = this.createBuckets(INITAL_CAPACITY);
        this.n = 0;
        this.threshold = Math.floor(INITAL_CAPACITY * LOAD_FACTOR);
    }
    toString() {
        if (this.size === 0)
            return "{}";
        let buf = '{';
        let first = true;
        for (let bucket of this.buckets) {
            if (bucket == null)
                continue;
            for (let o of bucket) {
                if (o == null)
                    break;
                if (first)
                    first = false;
                else
                    buf += ", ";
                buf += o.toString();
            }
        }
        buf += '}';
        return buf;
    }
    toTableString() {
        let buf = "";
        for (let bucket of this.buckets) {
            if (bucket == null) {
                buf += "null\n";
                continue;
            }
            buf += '[';
            let first = true;
            for (let o of bucket) {
                if (first)
                    first = false;
                else
                    buf += " ";
                if (o == null)
                    buf += "_";
                else
                    buf += o.toString();
            }
            buf += "]\n";
        }
        return buf;
    }
    /**
     * Return {@code o} as an instance of the element type {@code T}. If
     * {@code o} is non-null but known to not be an instance of {@code T}, this
     * method returns {@code null}. The base implementation does not perform any
     * type checks; override this method to provide strong type checks for the
     * {@link #contains} and {@link #remove} methods to ensure the arguments to
     * the {@link EqualityComparator} for the set always have the expected
     * types.
     *
     * @param o the object to try and cast to the element type of the set
     * @return {@code o} if it could be an instance of {@code T}, otherwise
     * {@code null}.
     */
    asElementType(o) {
        return o;
    }
    /**
     * Return an array of {@code T[]} with length {@code capacity}.
     *
     * @param capacity the length of the array to return
     * @return the newly constructed array
     */
    createBuckets(capacity) {
        return new Array(capacity);
    }
}
__decorate([
    Decorators_1.NotNull
], Array2DHashSet.prototype, "comparator", void 0);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "add", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "size", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "isEmpty", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "contains", null);
__decorate([
    __param(0, Decorators_1.Nullable)
], Array2DHashSet.prototype, "containsFast", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "iterator", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "toArray", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "remove", null);
__decorate([
    __param(0, Decorators_1.Nullable)
], Array2DHashSet.prototype, "removeFast", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "containsAll", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "addAll", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "retainAll", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "removeAll", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "clear", null);
__decorate([
    Decorators_1.Override
], Array2DHashSet.prototype, "toString", null);
__decorate([
    Decorators_1.SuppressWarnings("unchecked")
], Array2DHashSet.prototype, "asElementType", null);
__decorate([
    Decorators_1.SuppressWarnings("unchecked")
], Array2DHashSet.prototype, "createBuckets", null);
exports.Array2DHashSet = Array2DHashSet;
class SetIterator {
    constructor(data, set) {
        this.data = data;
        this.set = set;
        this.nextIndex = 0;
        this.removed = true;
    }
    hasNext() {
        return this.nextIndex < this.data.length;
    }
    next() {
        if (this.nextIndex >= this.data.length)
            throw new RangeError("Attempted to iterate past end.");
        this.removed = false;
        return this.data[this.nextIndex++];
    }
    // Note: this is an untested extension to the JavaScript iterator interface
    remove() {
        if (this.removed) {
            throw new Error("This entry has already been removed");
        }
        this.set.remove(this.data[this.nextIndex - 1]);
        this.removed = true;
    }
}

},{"../Decorators":16,"./DefaultEqualityComparator":108,"./MurmurHash":113,"./Stubs":116,"assert":127}],105:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
const MurmurHash_1 = require("./MurmurHash");
const ObjectEqualityComparator_1 = require("./ObjectEqualityComparator");
/**
 * This default implementation of {@link EqualityComparator} uses object equality
 * for comparisons by calling {@link Object#hashCode} and {@link Object#equals}.
 *
 * @author Sam Harwell
 */
class ArrayEqualityComparator {
    /**
     * {@inheritDoc}
     *
     * <p>This implementation returns
     * {@code obj.}{@link Object#hashCode hashCode()}.</p>
     */
    hashCode(obj) {
        if (obj == null) {
            return 0;
        }
        return MurmurHash_1.MurmurHash.hashCode(obj, 0);
    }
    /**
     * {@inheritDoc}
     *
     * <p>This implementation relies on object equality. If both objects are
     * {@code null}, this method returns {@code true}. Otherwise if only
     * {@code a} is {@code null}, this method returns {@code false}. Otherwise,
     * this method returns the result of
     * {@code a.}{@link Object#equals equals}{@code (b)}.</p>
     */
    equals(a, b) {
        if (a == null) {
            return b == null;
        }
        else if (b == null) {
            return false;
        }
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE.equals(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
}
ArrayEqualityComparator.INSTANCE = new ArrayEqualityComparator();
__decorate([
    Decorators_1.Override
], ArrayEqualityComparator.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], ArrayEqualityComparator.prototype, "equals", null);
exports.ArrayEqualityComparator = ArrayEqualityComparator;

},{"../Decorators":16,"./MurmurHash":113,"./ObjectEqualityComparator":114}],106:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Arrays;
(function (Arrays) {
    /**
     * Searches the specified array of numbers for the specified value using the binary search algorithm. The array must
     * be sorted prior to making this call. If it is not sorted, the results are unspecified. If the array contains
     * multiple elements with the specified value, there is no guarantee which one will be found.
     *
     * @return index of the search key, if it is contained in the array; otherwise, (-(insertion point) - 1). The
     * insertion point is defined as the point at which the key would be inserted into the array: the index of the first
     * element greater than the key, or array.length if all elements in the array are less than the specified key. Note
     * that this guarantees that the return value will be >= 0 if and only if the key is found.
     */
    function binarySearch(array, key, fromIndex, toIndex) {
        return binarySearch0(array, fromIndex !== undefined ? fromIndex : 0, toIndex !== undefined ? toIndex : array.length, key);
    }
    Arrays.binarySearch = binarySearch;
    function binarySearch0(array, fromIndex, toIndex, key) {
        let low = fromIndex;
        let high = toIndex - 1;
        while (low <= high) {
            let mid = (low + high) >>> 1;
            let midVal = array[mid];
            if (midVal < key) {
                low = mid + 1;
            }
            else if (midVal > key) {
                high = mid - 1;
            }
            else {
                // key found
                return mid;
            }
        }
        // key not found.
        return -(low + 1);
    }
    function toString(array) {
        let result = "[";
        let first = true;
        for (let i = 0; i < array.length; i++) {
            if (first) {
                first = false;
            }
            else {
                result += ", ";
            }
            let element = array[i];
            if (element === null) {
                result += "null";
            }
            else if (element === undefined) {
                result += "undefined";
            }
            else {
                result += element;
            }
        }
        result += "]";
        return result;
    }
    Arrays.toString = toString;
})(Arrays = exports.Arrays || (exports.Arrays = {}));

},{}],107:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const MurmurHash_1 = require("./MurmurHash");
/**
 * Private empty array used to construct empty BitSets
 */
const EMPTY_DATA = new Uint16Array(0);
/**
 * Gets the word index of the `UInt16` element in `BitSet.data` containing the bit with the specified index.
 */
function getIndex(bitNumber) {
    return bitNumber >>> 4;
}
/**
 * Convert a word index into the bit index of the LSB of that word
 */
function unIndex(n) {
    return n * 16;
}
/**
 * Get's the bit number of the least signficant bit set LSB which is set in a word non-zero word;
 * Bit numbers run from LSB to MSB starting with 0.
 */
function findLSBSet(word) {
    let bit = 1;
    for (let i = 0; i < 16; i++) {
        if ((word & bit) !== 0)
            return i;
        bit = (bit << 1) >>> 0;
    }
    throw new RangeError("No specified bit found");
}
function findMSBSet(word) {
    let bit = (1 << 15) >>> 0;
    for (let i = 15; i >= 0; i--) {
        if ((word & bit) !== 0)
            return i;
        bit = bit >>> 1;
    }
    throw new RangeError("No specified bit found");
}
/**
 * Gets a 16-bit mask with bit numbers fromBit to toBit (inclusive) set.
 * Bit numbers run from LSB to MSB starting with 0.
 */
function bitsFor(fromBit, toBit) {
    fromBit &= 0xF;
    toBit &= 0xF;
    if (fromBit === toBit)
        return (1 << fromBit) >>> 0;
    return ((0xFFFF >>> (15 - toBit)) ^ (0xFFFF >>> (16 - fromBit)));
}
/**
 * A lookup table for number of set bits in a 16-bit integer.   This is used to quickly count the cardinality (number of unique elements) of a BitSet.
 */
const POP_CNT = new Uint8Array(65536);
for (let i = 0; i < 16; i++) {
    const stride = (1 << i) >>> 0;
    let index = 0;
    while (index < POP_CNT.length) {
        // skip the numbers where the bit isn't set
        index += stride;
        // increment the ones where the bit is set
        for (let j = 0; j < stride; j++) {
            POP_CNT[index]++;
            index++;
        }
    }
}
class BitSet {
    /*
    ** constructor implementation
    */
    constructor(arg) {
        if (!arg) {
            // covering the case of unspecified and nbits===0
            this.data = EMPTY_DATA;
        }
        else if (typeof arg === "number") {
            if (arg < 0) {
                throw new RangeError("nbits cannot be negative");
            }
            else {
                this.data = new Uint16Array(getIndex(arg - 1) + 1);
            }
        }
        else {
            if (arg instanceof BitSet) {
                this.data = arg.data.slice(0); // Clone the data
            }
            else {
                let max = -1;
                for (let v of arg) {
                    if (max < v)
                        max = v;
                }
                this.data = new Uint16Array(getIndex(max - 1) + 1);
                for (let v of arg) {
                    this.set(v);
                }
            }
        }
    }
    /**
     * Performs a logical **AND** of this target bit set with the argument bit set. This bit set is modified so that
     * each bit in it has the value `true` if and only if it both initially had the value `true` and the corresponding
     * bit in the bit set argument also had the value `true`.
     */
    and(set) {
        const data = this.data;
        const other = set.data;
        const words = Math.min(data.length, other.length);
        let lastWord = -1; // Keep track of index of last non-zero word
        for (let i = 0; i < words; i++) {
            if ((data[i] &= other[i]) !== 0) {
                lastWord = i;
                ;
            }
        }
        if (lastWord === -1) {
            this.data = EMPTY_DATA;
        }
        if (lastWord < data.length - 1) {
            this.data = data.slice(0, lastWord + 1);
        }
    }
    /**
     * Clears all of the bits in this `BitSet` whose corresponding bit is set in the specified `BitSet`.
     */
    andNot(set) {
        const data = this.data;
        const other = set.data;
        const words = Math.min(data.length, other.length);
        let lastWord = -1; // Keep track of index of last non-zero word
        for (let i = 0; i < words; i++) {
            if ((data[i] &= (other[i] ^ 0xFFFF)) !== 0) {
                lastWord = i;
                ;
            }
        }
        if (lastWord === -1) {
            this.data = EMPTY_DATA;
        }
        if (lastWord < data.length - 1) {
            this.data = data.slice(0, lastWord + 1);
        }
    }
    /**
     * Returns the number of bits set to `true` in this `BitSet`.
     */
    cardinality() {
        if (this.isEmpty) {
            return 0;
        }
        const data = this.data;
        const length = data.length;
        let result = 0;
        for (let i = 0; i < length; i++) {
            result += POP_CNT[data[i]];
        }
        return result;
    }
    clear(fromIndex, toIndex) {
        if (fromIndex == null) {
            this.data.fill(0);
        }
        else if (toIndex == null) {
            this.set(fromIndex, false);
        }
        else {
            this.set(fromIndex, toIndex, false);
        }
    }
    flip(fromIndex, toIndex) {
        if (toIndex == null) {
            toIndex = fromIndex;
        }
        if (fromIndex < 0 || toIndex < fromIndex)
            throw new RangeError();
        let word = getIndex(fromIndex);
        const lastWord = getIndex(toIndex);
        if (word === lastWord) {
            this.data[word] ^= bitsFor(fromIndex, toIndex);
        }
        else {
            this.data[word++] ^= bitsFor(fromIndex, 15);
            while (word < lastWord) {
                this.data[word++] ^= 0xFFFF;
            }
            this.data[word++] ^= bitsFor(0, toIndex);
        }
    }
    get(fromIndex, toIndex) {
        if (toIndex === undefined) {
            return !!(this.data[getIndex(fromIndex)] & bitsFor(fromIndex, fromIndex));
        }
        else {
            // return a BitSet
            let result = new BitSet(toIndex + 1);
            for (let i = fromIndex; i <= toIndex; i++) {
                result.set(i, this.get(i));
            }
            return result;
        }
    }
    /**
     * Returns true if the specified `BitSet` has any bits set to `true` that are also set to `true` in this `BitSet`.
     *
     * @param set `BitSet` to intersect with
     */
    intersects(set) {
        let smallerLength = Math.min(this.length(), set.length());
        if (smallerLength === 0) {
            return false;
        }
        let bound = getIndex(smallerLength - 1);
        for (let i = 0; i <= bound; i++) {
            if ((this.data[i] & set.data[i]) !== 0) {
                return true;
            }
        }
        return false;
    }
    /**
     * Returns true if this `BitSet` contains no bits that are set to `true`.
     */
    get isEmpty() {
        return this.length() === 0;
    }
    /**
     * Returns the "logical size" of this `BitSet`: the index of the highest set bit in the `BitSet` plus one. Returns
     * zero if the `BitSet` contains no set bits.
     */
    length() {
        if (!this.data.length)
            return 0;
        return this.previousSetBit(unIndex(this.data.length) - 1) + 1;
    }
    /**
     * Returns the index of the first bit that is set to `false` that occurs on or after the specified starting index,
     * If no such bit exists then `-1` is returned.
     *
     * @param fromIndex the index to start checking from (inclusive)
     *
     * @throws RangeError if the specified index is negative
     */
    nextClearBit(fromIndex) {
        if (fromIndex < 0) {
            throw new RangeError("fromIndex cannot be negative");
        }
        const data = this.data;
        const length = data.length;
        let word = getIndex(fromIndex);
        if (word > length)
            return -1;
        let ignore = 0xFFFF ^ bitsFor(fromIndex, 15);
        if ((data[word] | ignore) === 0xFFFF) {
            word++;
            ignore = 0;
            for (; word < length; word++) {
                if (data[word] !== 0xFFFF)
                    break;
            }
            if (word === length)
                return -1; // Hit the end
        }
        return unIndex(word) + findLSBSet((data[word] | ignore) ^ 0xFFFF);
    }
    /**
     * Returns the index of the first bit that is set to `true` that occurs on or after the specified starting index.
     * If no such bit exists then `-1` is returned.
     *
     * To iterate over the `true` bits in a `BitSet`, use the following loop:
     *
     * ```
     * for (let i = bs.nextSetBit(0); i >= 0; i = bs.nextSetBit(i + 1)) {
     *   // operate on index i here
     * }
     * ```
     *
     * @param fromIndex the index to start checking from (inclusive)
     *
     * @throws RangeError if the specified index is negative
     */
    nextSetBit(fromIndex) {
        if (fromIndex < 0) {
            throw new RangeError("fromIndex cannot be negative");
        }
        const data = this.data;
        const length = data.length;
        let word = getIndex(fromIndex);
        if (word > length)
            return -1;
        let mask = bitsFor(fromIndex, 15);
        if ((data[word] & mask) === 0) {
            word++;
            mask = 0xFFFF;
            for (; word < length; word++) {
                if (data[word] !== 0)
                    break;
            }
            if (word >= length)
                return -1;
        }
        return unIndex(word) + findLSBSet(data[word] & mask);
    }
    /**
     * Performs a logical **OR** of this bit set with the bit set argument. This bit set is modified so that a bit in it
     * has the value `true` if and only if it either already had the value `true` or the corresponding bit in the bit
     * set argument has the value `true`.
     */
    or(set) {
        const data = this.data;
        const other = set.data;
        const minWords = Math.min(data.length, other.length);
        const words = Math.max(data.length, other.length);
        const dest = data.length === words ? data : new Uint16Array(words);
        let lastWord = -1;
        // Or those words both sets have in common
        for (let i = 0; i < minWords; i++) {
            if ((dest[i] = data[i] | other[i]) !== 0)
                lastWord = i;
        }
        // Copy words from larger set (if there is one)
        const longer = data.length > other.length ? data : other;
        for (let i = minWords; i < words; i++) {
            if ((dest[i] = longer[i]) !== 0)
                lastWord = i;
        }
        if (lastWord === -1) {
            this.data = EMPTY_DATA;
        }
        else if (dest.length === lastWord + 1) {
            this.data = dest;
        }
        else {
            this.data = dest.slice(0, lastWord);
        }
    }
    /**
     * Returns the index of the nearest bit that is set to `false` that occurs on or before the specified starting
     * index. If no such bit exists, or if `-1` is given as the starting index, then `-1` is returned.
     *
     * @param fromIndex the index to start checking from (inclusive)
     *
     * @throws RangeError if the specified index is less than `-1`
     */
    previousClearBit(fromIndex) {
        if (fromIndex < 0) {
            throw new RangeError("fromIndex cannot be negative");
        }
        const data = this.data;
        const length = data.length;
        let word = getIndex(fromIndex);
        if (word >= length)
            word = length - 1;
        let ignore = 0xFFFF ^ bitsFor(0, fromIndex);
        if ((data[word] | ignore) === 0xFFFF) {
            ignore = 0;
            word--;
            for (; word >= 0; word--) {
                if (data[word] !== 0xFFFF)
                    break;
            }
            if (word < 0)
                return -1; // Hit the end
        }
        return unIndex(word) + findMSBSet((data[word] | ignore) ^ 0xFFFF);
    }
    /**
     * Returns the index of the nearest bit that is set to `true` that occurs on or before the specified starting index.
     * If no such bit exists, or if `-1` is given as the starting index, then `-1` is returned.
     *
     * To iterate over the `true` bits in a `BitSet`, use the following loop:
     *
     * ```
     * for (let i = bs.length(); (i = bs.previousSetBit(i-1)) >= 0; ) {
     *   // operate on index i here
     * }
     * ```
     *
     * @param fromIndex the index to start checking from (inclusive)
     *
     * @throws RangeError if the specified index is less than `-1`
     */
    previousSetBit(fromIndex) {
        if (fromIndex < 0) {
            throw new RangeError("fromIndex cannot be negative");
        }
        const data = this.data;
        const length = data.length;
        let word = getIndex(fromIndex);
        if (word >= length)
            word = length - 1;
        let mask = bitsFor(0, fromIndex);
        if ((data[word] & mask) === 0) {
            word--;
            mask = 0xFFFF;
            for (; word >= 0; word--) {
                if (data[word] !== 0)
                    break;
            }
            if (word < 0)
                return -1;
        }
        return unIndex(word) + findMSBSet(data[word] & mask);
    }
    set(fromIndex, toIndex, value) {
        if (toIndex === undefined) {
            toIndex = fromIndex;
            value = true;
        }
        else if (typeof toIndex === 'boolean') {
            value = toIndex;
            toIndex = fromIndex;
        }
        if (value === undefined) {
            value = true;
        }
        if (fromIndex < 0 || fromIndex > toIndex) {
            throw new RangeError();
        }
        let word = getIndex(fromIndex);
        let lastWord = getIndex(toIndex);
        if (value && lastWord >= this.data.length) {
            // Grow array "just enough" for bits we need to set
            var temp = new Uint16Array(lastWord + 1);
            this.data.forEach((value, index) => temp[index] = value);
            this.data = temp;
        }
        else if (!value) {
            // But there is no need to grow array to clear bits.
            if (word >= this.data.length)
                return; // Early exit
            if (lastWord >= this.data.length) {
                // Adjust work to fit array
                lastWord = this.data.length - 1;
                toIndex = this.data.length * 16 - 1;
            }
        }
        if (word === lastWord) {
            this._setBits(word, value, bitsFor(fromIndex, toIndex));
        }
        else {
            this._setBits(word++, value, bitsFor(fromIndex, 15));
            while (word < lastWord) {
                this.data[word++] = value ? 0xFFFF : 0;
            }
            this._setBits(word, value, bitsFor(0, toIndex));
        }
    }
    _setBits(word, value, mask) {
        if (value) {
            this.data[word] |= mask;
        }
        else {
            this.data[word] &= 0xFFFF ^ mask;
        }
    }
    /**
     * Returns the number of bits of space actually in use by this `BitSet` to represent bit values. The maximum element
     * in the set is the size - 1st element.
     */
    get size() {
        return this.data.byteLength * 8;
    }
    /**
     * Returns a new byte array containing all the bits in this bit set.
     *
     * More precisely, if
     * `let bytes = s.toByteArray();`
     * then `bytes.length === (s.length()+7)/8` and `s.get(n) === ((bytes[n/8] & (1<<(n%8))) != 0)` for all
     * `n < 8 * bytes.length`.
     */
    // toByteArray(): Int8Array {
    // 	throw new Error("NOT IMPLEMENTED");
    // }
    /**
     * Returns a new integer array containing all the bits in this bit set.
     *
     * More precisely, if
     * `let integers = s.toIntegerArray();`
     * then `integers.length === (s.length()+31)/32` and `s.get(n) === ((integers[n/32] & (1<<(n%32))) != 0)` for all
     * `n < 32 * integers.length`.
     */
    // toIntegerArray(): Int32Array {
    // 	throw new Error("NOT IMPLEMENTED");
    // }
    hashCode() {
        return MurmurHash_1.MurmurHash.hashCode(this.data, 22);
    }
    /**
     * Compares this object against the specified object. The result is `true` if and only if the argument is not `null`
     * and is a `Bitset` object that has exactly the same set of bits set to `true` as this bit set. That is, for every
     * nonnegative index `k`,
     *
     *     ((BitSet)obj).get(k) == this.get(k)
     *
     * must be true. The current sizes of the two bit sets are not compared.
     */
    equals(obj) {
        if (obj === this) {
            return true;
        }
        else if (!(obj instanceof BitSet)) {
            return false;
        }
        const len = this.length();
        if (len !== obj.length()) {
            return false;
        }
        if (len === 0) {
            return true;
        }
        let bound = getIndex(len - 1);
        for (let i = 0; i <= bound; i++) {
            if (this.data[i] !== obj.data[i]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Returns a string representation of this bit set. For every index for which this `BitSet` contains a bit in the
     * set state, the decimal representation of that index is included in the result. Such indices are listed in order
     * from lowest to highest, separated by ", " (a comma and a space) and surrounded by braces, resulting in the usual
     * mathematical notation for a set of integers.
     *
     * Example:
     *
     *     BitSet drPepper = new BitSet();
     *
     * Now `drPepper.toString()` returns `"{}"`.
     *
     *     drPepper.set(2);
     *
     * Now `drPepper.toString()` returns `"{2}"`.
     *
     *     drPepper.set(4);
     *     drPepper.set(10);
     *
     * Now `drPepper.toString()` returns `"{2, 4, 10}"`.
     */
    toString() {
        let result = "{";
        let first = true;
        for (let i = this.nextSetBit(0); i >= 0; i = this.nextSetBit(i + 1)) {
            if (first) {
                first = false;
            }
            else {
                result += ", ";
            }
            result += i;
        }
        result += "}";
        return result;
    }
    // static valueOf(bytes: Int8Array): BitSet;
    // static valueOf(buffer: ArrayBuffer): BitSet;
    // static valueOf(integers: Int32Array): BitSet;
    // static valueOf(data: Int8Array | Int32Array | ArrayBuffer): BitSet {
    // 	throw new Error("NOT IMPLEMENTED");
    // }
    /**
     * Performs a logical **XOR** of this bit set with the bit set argument. This bit set is modified so that a bit in
     * it has the value `true` if and only if one of the following statements holds:
     *
     * * The bit initially has the value `true`, and the corresponding bit in the argument has the value `false`.
     * * The bit initially has the value `false`, and the corresponding bit in the argument has the value `true`.
     */
    xor(set) {
        const data = this.data;
        const other = set.data;
        const minWords = Math.min(data.length, other.length);
        const words = Math.max(data.length, other.length);
        const dest = data.length === words ? data : new Uint16Array(words);
        let lastWord = -1;
        // Xor those words both sets have in common
        for (let i = 0; i < minWords; i++) {
            if ((dest[i] = data[i] ^ other[i]) !== 0)
                lastWord = i;
        }
        // Copy words from larger set (if there is one)
        const longer = data.length > other.length ? data : other;
        for (let i = minWords; i < words; i++) {
            if ((dest[i] = longer[i]) !== 0)
                lastWord = i;
        }
        if (lastWord === -1) {
            this.data = EMPTY_DATA;
        }
        else if (dest.length === lastWord + 1) {
            this.data = dest;
        }
        else {
            this.data = dest.slice(0, lastWord + 1);
        }
    }
    clone() {
        return new BitSet(this);
    }
    [Symbol.iterator]() {
        return new BitSetIterator(this.data);
    }
    // Overrides formatting for nodejs assert etc.
    [util.inspect.custom]() {
        return "BitSet " + this.toString();
    }
}
exports.BitSet = BitSet;
class BitSetIterator {
    constructor(data) {
        this.data = data;
        this.index = 0;
        this.mask = 0xFFFF;
    }
    next() {
        while (this.index < this.data.length) {
            const bits = this.data[this.index] & this.mask;
            ;
            if (bits !== 0) {
                const bitNumber = unIndex(this.index) + findLSBSet(bits);
                this.mask = bitsFor(bitNumber + 1, 15);
                return { done: false, value: bitNumber };
            }
            this.index++;
            this.mask = 0xFFFF;
        }
        return { done: true, value: -1 };
    }
    [Symbol.iterator]() { return this; }
}

},{"./MurmurHash":113,"util":131}],108:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
const MurmurHash_1 = require("./MurmurHash");
const ObjectEqualityComparator_1 = require("./ObjectEqualityComparator");
/**
 * This default implementation of {@link EqualityComparator} uses object equality
 * for comparisons by calling {@link Object#hashCode} and {@link Object#equals}.
 *
 * @author Sam Harwell
 */
class DefaultEqualityComparator {
    /**
     * {@inheritDoc}
     *
     * <p>This implementation returns
     * {@code obj.}{@link Object#hashCode hashCode()}.</p>
     */
    hashCode(obj) {
        if (obj == null) {
            return 0;
        }
        else if (typeof obj === 'string' || typeof obj === 'number') {
            return MurmurHash_1.MurmurHash.hashCode([obj]);
        }
        else {
            return ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE.hashCode(obj);
        }
    }
    /**
     * {@inheritDoc}
     *
     * <p>This implementation relies on object equality. If both objects are
     * {@code null}, this method returns {@code true}. Otherwise if only
     * {@code a} is {@code null}, this method returns {@code false}. Otherwise,
     * this method returns the result of
     * {@code a.}{@link Object#equals equals}{@code (b)}.</p>
     */
    equals(a, b) {
        if (a == null) {
            return b == null;
        }
        else if (typeof a === 'string' || typeof a === 'number') {
            return a === b;
        }
        else {
            return ObjectEqualityComparator_1.ObjectEqualityComparator.INSTANCE.equals(a, b);
        }
    }
}
DefaultEqualityComparator.INSTANCE = new DefaultEqualityComparator();
__decorate([
    Decorators_1.Override
], DefaultEqualityComparator.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], DefaultEqualityComparator.prototype, "equals", null);
exports.DefaultEqualityComparator = DefaultEqualityComparator;

},{"../Decorators":16,"./MurmurHash":113,"./ObjectEqualityComparator":114}],109:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:40.5099429-07:00
const Arrays_1 = require("./Arrays");
const Decorators_1 = require("../Decorators");
const EMPTY_DATA = new Int32Array(0);
const INITIAL_SIZE = 4;
const MAX_ARRAY_SIZE = (((1 << 31) >>> 0) - 1) - 8;
/**
 *
 * @author Sam Harwell
 */
class IntegerList {
    constructor(arg) {
        if (!arg) {
            this._data = EMPTY_DATA;
            this._size = 0;
        }
        else if (arg instanceof IntegerList) {
            this._data = arg._data.slice(0);
            this._size = arg._size;
        }
        else if (typeof arg === 'number') {
            if (arg === 0) {
                this._data = EMPTY_DATA;
                this._size = 0;
            }
            else {
                this._data = new Int32Array(arg);
                this._size = 0;
            }
        }
        else {
            // arg is Iterable<number>
            this._data = EMPTY_DATA;
            this._size = 0;
            for (let value of arg) {
                this.add(value);
            }
        }
    }
    add(value) {
        if (this._data.length === this._size) {
            this.ensureCapacity(this._size + 1);
        }
        this._data[this._size] = value;
        this._size++;
    }
    addAll(list) {
        if (Array.isArray(list)) {
            this.ensureCapacity(this._size + list.length);
            this._data.subarray(this._size, this._size + list.length).set(list);
            this._size += list.length;
        }
        else if (list instanceof IntegerList) {
            this.ensureCapacity(this._size + list._size);
            this._data.subarray(this._size, this._size + list.size).set(list._data);
            this._size += list._size;
        }
        else {
            // list is JavaCollection<number>
            this.ensureCapacity(this._size + list.size);
            let current = 0;
            for (let xi = list.iterator(); xi.hasNext();) {
                this._data[this._size + current] = xi.next();
                current++;
            }
            this._size += list.size;
        }
    }
    get(index) {
        if (index < 0 || index >= this._size) {
            throw RangeError();
        }
        return this._data[index];
    }
    contains(value) {
        for (let i = 0; i < this._size; i++) {
            if (this._data[i] === value) {
                return true;
            }
        }
        return false;
    }
    set(index, value) {
        if (index < 0 || index >= this._size) {
            throw RangeError();
        }
        let previous = this._data[index];
        this._data[index] = value;
        return previous;
    }
    removeAt(index) {
        let value = this.get(index);
        this._data.copyWithin(index, index + 1, this._size);
        this._data[this._size - 1] = 0;
        this._size--;
        return value;
    }
    removeRange(fromIndex, toIndex) {
        if (fromIndex < 0 || toIndex < 0 || fromIndex > this._size || toIndex > this._size) {
            throw RangeError();
        }
        if (fromIndex > toIndex) {
            throw RangeError();
        }
        this._data.copyWithin(toIndex, fromIndex, this._size);
        this._data.fill(0, this._size - (toIndex - fromIndex), this._size);
        this._size -= (toIndex - fromIndex);
    }
    get isEmpty() {
        return this._size === 0;
    }
    get size() {
        return this._size;
    }
    trimToSize() {
        if (this._data.length === this._size) {
            return;
        }
        this._data = this._data.slice(0, this._size);
    }
    clear() {
        this._data.fill(0, 0, this._size);
        this._size = 0;
    }
    toArray() {
        if (this._size === 0) {
            return [];
        }
        return Array.from(this._data.subarray(0, this._size));
    }
    sort() {
        this._data.subarray(0, this._size).sort();
    }
    /**
     * Compares the specified object with this list for equality.  Returns
     * {@code true} if and only if the specified object is also an {@link IntegerList},
     * both lists have the same size, and all corresponding pairs of elements in
     * the two lists are equal.  In other words, two lists are defined to be
     * equal if they contain the same elements in the same order.
     * <p>
     * This implementation first checks if the specified object is this
     * list. If so, it returns {@code true}; if not, it checks if the
     * specified object is an {@link IntegerList}. If not, it returns {@code false};
     * if so, it checks the size of both lists. If the lists are not the same size,
     * it returns {@code false}; otherwise it iterates over both lists, comparing
     * corresponding pairs of elements.  If any comparison returns {@code false},
     * this method returns {@code false}.
     *
     * @param o the object to be compared for equality with this list
     * @return {@code true} if the specified object is equal to this list
     */
    equals(o) {
        if (o === this) {
            return true;
        }
        if (!(o instanceof IntegerList)) {
            return false;
        }
        if (this._size !== o._size) {
            return false;
        }
        for (let i = 0; i < this._size; i++) {
            if (this._data[i] !== o._data[i]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Returns the hash code value for this list.
     *
     * <p>This implementation uses exactly the code that is used to define the
     * list hash function in the documentation for the {@link List#hashCode}
     * method.</p>
     *
     * @return the hash code value for this list
     */
    hashCode() {
        let hashCode = 1;
        for (let i = 0; i < this._size; i++) {
            hashCode = 31 * hashCode + this._data[i];
        }
        return hashCode;
    }
    /**
     * Returns a string representation of this list.
     */
    toString() {
        return this._data.toString();
    }
    binarySearch(key, fromIndex, toIndex) {
        if (fromIndex === undefined) {
            fromIndex = 0;
        }
        if (toIndex === undefined) {
            toIndex = this._size;
        }
        if (fromIndex < 0 || toIndex < 0 || fromIndex > this._size || toIndex > this._size) {
            throw new RangeError();
        }
        if (fromIndex > toIndex) {
            throw new RangeError();
        }
        return Arrays_1.Arrays.binarySearch(this._data, key, fromIndex, toIndex);
    }
    ensureCapacity(capacity) {
        if (capacity < 0 || capacity > MAX_ARRAY_SIZE) {
            throw new RangeError();
        }
        let newLength;
        if (this._data.length === 0) {
            newLength = INITIAL_SIZE;
        }
        else {
            newLength = this._data.length;
        }
        while (newLength < capacity) {
            newLength = newLength * 2;
            if (newLength < 0 || newLength > MAX_ARRAY_SIZE) {
                newLength = MAX_ARRAY_SIZE;
            }
        }
        let tmp = new Int32Array(newLength);
        tmp.set(this._data);
        this._data = tmp;
    }
}
__decorate([
    Decorators_1.NotNull
], IntegerList.prototype, "_data", void 0);
__decorate([
    Decorators_1.Override
], IntegerList.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], IntegerList.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], IntegerList.prototype, "toString", null);
exports.IntegerList = IntegerList;

},{"../Decorators":16,"./Arrays":106}],110:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:40.6647101-07:00
const IntegerList_1 = require("./IntegerList");
/**
 *
 * @author Sam Harwell
 */
class IntegerStack extends IntegerList_1.IntegerList {
    constructor(arg) {
        super(arg);
    }
    push(value) {
        this.add(value);
    }
    pop() {
        return this.removeAt(this.size - 1);
    }
    peek() {
        return this.get(this.size - 1);
    }
}
exports.IntegerStack = IntegerStack;

},{"./IntegerList":109}],111:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:40.7402214-07:00
const Decorators_1 = require("../Decorators");
const INTERVAL_POOL_MAX_VALUE = 1000;
/** An immutable inclusive interval a..b */
class Interval {
    /**
     * @param a The start of the interval
     * @param b The end of the interval (inclusive)
     */
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    static get INVALID() {
        return Interval._INVALID;
    }
    /** Interval objects are used readonly so share all with the
     *  same single value a==b up to some max size.  Use an array as a perfect hash.
     *  Return shared object for 0..INTERVAL_POOL_MAX_VALUE or a new
     *  Interval object with a..a in it.  On Java.g4, 218623 IntervalSets
     *  have a..a (set with 1 element).
     */
    static of(a, b) {
        // cache just a..a
        if (a !== b || a < 0 || a > INTERVAL_POOL_MAX_VALUE) {
            return new Interval(a, b);
        }
        if (Interval.cache[a] == null) {
            Interval.cache[a] = new Interval(a, a);
        }
        return Interval.cache[a];
    }
    /** return number of elements between a and b inclusively. x..x is length 1.
     *  if b &lt; a, then length is 0.  9..10 has length 2.
     */
    get length() {
        if (this.b < this.a) {
            return 0;
        }
        return this.b - this.a + 1;
    }
    equals(o) {
        if (o === this) {
            return true;
        }
        else if (!(o instanceof Interval)) {
            return false;
        }
        let other = o;
        return this.a === other.a && this.b === other.b;
    }
    hashCode() {
        let hash = 23;
        hash = hash * 31 + this.a;
        hash = hash * 31 + this.b;
        return hash;
    }
    /** Does this start completely before other? Disjoint */
    startsBeforeDisjoint(other) {
        return this.a < other.a && this.b < other.a;
    }
    /** Does this start at or before other? Nondisjoint */
    startsBeforeNonDisjoint(other) {
        return this.a <= other.a && this.b >= other.a;
    }
    /** Does this.a start after other.b? May or may not be disjoint */
    startsAfter(other) {
        return this.a > other.a;
    }
    /** Does this start completely after other? Disjoint */
    startsAfterDisjoint(other) {
        return this.a > other.b;
    }
    /** Does this start after other? NonDisjoint */
    startsAfterNonDisjoint(other) {
        return this.a > other.a && this.a <= other.b; // this.b>=other.b implied
    }
    /** Are both ranges disjoint? I.e., no overlap? */
    disjoint(other) {
        return this.startsBeforeDisjoint(other) || this.startsAfterDisjoint(other);
    }
    /** Are two intervals adjacent such as 0..41 and 42..42? */
    adjacent(other) {
        return this.a === other.b + 1 || this.b === other.a - 1;
    }
    properlyContains(other) {
        return other.a >= this.a && other.b <= this.b;
    }
    /** Return the interval computed from combining this and other */
    union(other) {
        return Interval.of(Math.min(this.a, other.a), Math.max(this.b, other.b));
    }
    /** Return the interval in common between this and o */
    intersection(other) {
        return Interval.of(Math.max(this.a, other.a), Math.min(this.b, other.b));
    }
    /** Return the interval with elements from {@code this} not in {@code other};
     *  {@code other} must not be totally enclosed (properly contained)
     *  within {@code this}, which would result in two disjoint intervals
     *  instead of the single one returned by this method.
     */
    differenceNotProperlyContained(other) {
        let diff;
        if (other.startsBeforeNonDisjoint(this)) {
            // other.a to left of this.a (or same)
            diff = Interval.of(Math.max(this.a, other.b + 1), this.b);
        }
        else if (other.startsAfterNonDisjoint(this)) {
            // other.a to right of this.a
            diff = Interval.of(this.a, other.a - 1);
        }
        return diff;
    }
    toString() {
        return this.a + ".." + this.b;
    }
}
Interval._INVALID = new Interval(-1, -2);
Interval.cache = new Array(INTERVAL_POOL_MAX_VALUE + 1);
__decorate([
    Decorators_1.Override
], Interval.prototype, "equals", null);
__decorate([
    Decorators_1.Override
], Interval.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], Interval.prototype, "toString", null);
exports.Interval = Interval;

},{"../Decorators":16}],112:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:40.8683480-07:00
const ArrayEqualityComparator_1 = require("./ArrayEqualityComparator");
const IntegerList_1 = require("./IntegerList");
const Interval_1 = require("./Interval");
const Lexer_1 = require("../Lexer");
const MurmurHash_1 = require("./MurmurHash");
const Decorators_1 = require("../Decorators");
const Token_1 = require("../Token");
/**
 * This class implements the {@link IntSet} backed by a sorted array of
 * non-overlapping intervals. It is particularly efficient for representing
 * large collections of numbers, where the majority of elements appear as part
 * of a sequential range of numbers that are all part of the set. For example,
 * the set { 1, 2, 3, 4, 7, 8 } may be represented as { [1, 4], [7, 8] }.
 *
 * <p>
 * This class is able to represent sets containing any combination of values in
 * the range {@link Integer#MIN_VALUE} to {@link Integer#MAX_VALUE}
 * (inclusive).</p>
 */
class IntervalSet {
    constructor(intervals) {
        this.readonly = false;
        if (intervals != null) {
            this._intervals = intervals.slice(0);
        }
        else {
            this._intervals = [];
        }
    }
    static get COMPLETE_CHAR_SET() {
        if (IntervalSet._COMPLETE_CHAR_SET === undefined) {
            IntervalSet._COMPLETE_CHAR_SET = IntervalSet.of(Lexer_1.Lexer.MIN_CHAR_VALUE, Lexer_1.Lexer.MAX_CHAR_VALUE);
            IntervalSet._COMPLETE_CHAR_SET.setReadonly(true);
        }
        return IntervalSet._COMPLETE_CHAR_SET;
    }
    static get EMPTY_SET() {
        if (IntervalSet._EMPTY_SET == null) {
            IntervalSet._EMPTY_SET = new IntervalSet();
            IntervalSet._EMPTY_SET.setReadonly(true);
        }
        return IntervalSet._EMPTY_SET;
    }
    /**
     * Create a set with all ints within range [a..b] (inclusive). If b is omitted, the set contains the single element
     * a.
     */
    static of(a, b = a) {
        let s = new IntervalSet();
        s.add(a, b);
        return s;
    }
    clear() {
        if (this.readonly) {
            throw new Error("can't alter readonly IntervalSet");
        }
        this._intervals.length = 0;
    }
    /** Add interval; i.e., add all integers from a to b to set.
     *  If b&lt;a, do nothing.
     *  Keep list in sorted order (by left range value).
     *  If overlap, combine ranges.  For example,
     *  If this is {1..5, 10..20}, adding 6..7 yields
     *  {1..5, 6..7, 10..20}.  Adding 4..8 yields {1..8, 10..20}.
     */
    add(a, b = a) {
        this.addRange(Interval_1.Interval.of(a, b));
    }
    // copy on write so we can cache a..a intervals and sets of that
    addRange(addition) {
        if (this.readonly) {
            throw new Error("can't alter readonly IntervalSet");
        }
        //System.out.println("add "+addition+" to "+intervals.toString());
        if (addition.b < addition.a) {
            return;
        }
        // find position in list
        // Use iterators as we modify list in place
        for (let i = 0; i < this._intervals.length; i++) {
            let r = this._intervals[i];
            if (addition.equals(r)) {
                return;
            }
            if (addition.adjacent(r) || !addition.disjoint(r)) {
                // next to each other, make a single larger interval
                let bigger = addition.union(r);
                this._intervals[i] = bigger;
                // make sure we didn't just create an interval that
                // should be merged with next interval in list
                while (i < this._intervals.length - 1) {
                    i++;
                    let next = this._intervals[i];
                    if (!bigger.adjacent(next) && bigger.disjoint(next)) {
                        break;
                    }
                    // if we bump up against or overlap next, merge
                    // remove this one
                    this._intervals.splice(i, 1);
                    i--;
                    // move backwards to what we just set
                    this._intervals[i] = bigger.union(next);
                    // set to 3 merged ones
                }
                // first call to next after previous duplicates the result
                return;
            }
            if (addition.startsBeforeDisjoint(r)) {
                // insert before r
                this._intervals.splice(i, 0, addition);
                return;
            }
            // if disjoint and after r, a future iteration will handle it
        }
        // ok, must be after last interval (and disjoint from last interval)
        // just add it
        this._intervals.push(addition);
    }
    /** combine all sets in the array returned the or'd value */
    static or(sets) {
        let r = new IntervalSet();
        for (let s of sets) {
            r.addAll(s);
        }
        return r;
    }
    addAll(set) {
        if (set == null) {
            return this;
        }
        if (set instanceof IntervalSet) {
            let other = set;
            // walk set and add each interval
            let n = other._intervals.length;
            for (let i = 0; i < n; i++) {
                let I = other._intervals[i];
                this.add(I.a, I.b);
            }
        }
        else {
            for (let value of set.toList()) {
                this.add(value);
            }
        }
        return this;
    }
    complementRange(minElement, maxElement) {
        return this.complement(IntervalSet.of(minElement, maxElement));
    }
    /** {@inheritDoc} */
    complement(vocabulary) {
        if (vocabulary.isNil) {
            // nothing in common with null set
            return IntervalSet.EMPTY_SET;
        }
        let vocabularyIS;
        if (vocabulary instanceof IntervalSet) {
            vocabularyIS = vocabulary;
        }
        else {
            vocabularyIS = new IntervalSet();
            vocabularyIS.addAll(vocabulary);
        }
        return vocabularyIS.subtract(this);
    }
    subtract(a) {
        if (a == null || a.isNil) {
            return new IntervalSet(this._intervals);
        }
        if (a instanceof IntervalSet) {
            return IntervalSet.subtract(this, a);
        }
        let other = new IntervalSet();
        other.addAll(a);
        return IntervalSet.subtract(this, other);
    }
    /**
     * Compute the set difference between two interval sets. The specific
     * operation is {@code left - right}.
     */
    static subtract(left, right) {
        if (left.isNil) {
            return new IntervalSet();
        }
        let result = new IntervalSet(left._intervals);
        if (right.isNil) {
            // right set has no elements; just return the copy of the current set
            return result;
        }
        let resultI = 0;
        let rightI = 0;
        while (resultI < result._intervals.length && rightI < right._intervals.length) {
            let resultInterval = result._intervals[resultI];
            let rightInterval = right._intervals[rightI];
            // operation: (resultInterval - rightInterval) and update indexes
            if (rightInterval.b < resultInterval.a) {
                rightI++;
                continue;
            }
            if (rightInterval.a > resultInterval.b) {
                resultI++;
                continue;
            }
            let beforeCurrent;
            let afterCurrent;
            if (rightInterval.a > resultInterval.a) {
                beforeCurrent = new Interval_1.Interval(resultInterval.a, rightInterval.a - 1);
            }
            if (rightInterval.b < resultInterval.b) {
                afterCurrent = new Interval_1.Interval(rightInterval.b + 1, resultInterval.b);
            }
            if (beforeCurrent) {
                if (afterCurrent) {
                    // split the current interval into two
                    result._intervals[resultI] = beforeCurrent;
                    result._intervals.splice(resultI + 1, 0, afterCurrent);
                    resultI++;
                    rightI++;
                    continue;
                }
                else {
                    // replace the current interval
                    result._intervals[resultI] = beforeCurrent;
                    resultI++;
                    continue;
                }
            }
            else {
                if (afterCurrent) {
                    // replace the current interval
                    result._intervals[resultI] = afterCurrent;
                    rightI++;
                    continue;
                }
                else {
                    // remove the current interval (thus no need to increment resultI)
                    result._intervals.splice(resultI, 1);
                    continue;
                }
            }
        }
        // If rightI reached right.intervals.size, no more intervals to subtract from result.
        // If resultI reached result.intervals.size, we would be subtracting from an empty set.
        // Either way, we are done.
        return result;
    }
    or(a) {
        let o = new IntervalSet();
        o.addAll(this);
        o.addAll(a);
        return o;
    }
    /** {@inheritDoc} */
    and(other) {
        if (other.isNil) {
            // nothing in common with null set
            return new IntervalSet();
        }
        let myIntervals = this._intervals;
        let theirIntervals = other._intervals;
        let intersection;
        let mySize = myIntervals.length;
        let theirSize = theirIntervals.length;
        let i = 0;
        let j = 0;
        // iterate down both interval lists looking for nondisjoint intervals
        while (i < mySize && j < theirSize) {
            let mine = myIntervals[i];
            let theirs = theirIntervals[j];
            //System.out.println("mine="+mine+" and theirs="+theirs);
            if (mine.startsBeforeDisjoint(theirs)) {
                // move this iterator looking for interval that might overlap
                i++;
            }
            else if (theirs.startsBeforeDisjoint(mine)) {
                // move other iterator looking for interval that might overlap
                j++;
            }
            else if (mine.properlyContains(theirs)) {
                // overlap, add intersection, get next theirs
                if (!intersection) {
                    intersection = new IntervalSet();
                }
                intersection.addRange(mine.intersection(theirs));
                j++;
            }
            else if (theirs.properlyContains(mine)) {
                // overlap, add intersection, get next mine
                if (!intersection) {
                    intersection = new IntervalSet();
                }
                intersection.addRange(mine.intersection(theirs));
                i++;
            }
            else if (!mine.disjoint(theirs)) {
                // overlap, add intersection
                if (!intersection) {
                    intersection = new IntervalSet();
                }
                intersection.addRange(mine.intersection(theirs));
                // Move the iterator of lower range [a..b], but not
                // the upper range as it may contain elements that will collide
                // with the next iterator. So, if mine=[0..115] and
                // theirs=[115..200], then intersection is 115 and move mine
                // but not theirs as theirs may collide with the next range
                // in thisIter.
                // move both iterators to next ranges
                if (mine.startsAfterNonDisjoint(theirs)) {
                    j++;
                }
                else if (theirs.startsAfterNonDisjoint(mine)) {
                    i++;
                }
            }
        }
        if (!intersection) {
            return new IntervalSet();
        }
        return intersection;
    }
    /** {@inheritDoc} */
    contains(el) {
        let n = this._intervals.length;
        for (let i = 0; i < n; i++) {
            let I = this._intervals[i];
            let a = I.a;
            let b = I.b;
            if (el < a) {
                // list is sorted and el is before this interval; not here
                break;
            }
            if (el >= a && el <= b) {
                // found in this interval
                return true;
            }
        }
        return false;
        /*
                for (ListIterator iter = intervals.listIterator(); iter.hasNext();) {
                    let I: Interval =  (Interval) iter.next();
                    if ( el<I.a ) {
                        break; // list is sorted and el is before this interval; not here
                    }
                    if ( el>=I.a && el<=I.b ) {
                        return true; // found in this interval
                    }
                }
                return false;
                */
    }
    /** {@inheritDoc} */
    get isNil() {
        return this._intervals == null || this._intervals.length === 0;
    }
    /** {@inheritDoc} */
    getSingleElement() {
        if (this._intervals != null && this._intervals.length === 1) {
            let I = this._intervals[0];
            if (I.a === I.b) {
                return I.a;
            }
        }
        return Token_1.Token.INVALID_TYPE;
    }
    /**
     * Returns the maximum value contained in the set.
     *
     * @return the maximum value contained in the set. If the set is empty, this
     * method returns {@link Token#INVALID_TYPE}.
     */
    get maxElement() {
        if (this.isNil) {
            return Token_1.Token.INVALID_TYPE;
        }
        let last = this._intervals[this._intervals.length - 1];
        return last.b;
    }
    /**
     * Returns the minimum value contained in the set.
     *
     * @return the minimum value contained in the set. If the set is empty, this
     * method returns {@link Token#INVALID_TYPE}.
     */
    get minElement() {
        if (this.isNil) {
            return Token_1.Token.INVALID_TYPE;
        }
        return this._intervals[0].a;
    }
    /** Return a list of Interval objects. */
    get intervals() {
        return this._intervals;
    }
    hashCode() {
        let hash = MurmurHash_1.MurmurHash.initialize();
        for (let I of this._intervals) {
            hash = MurmurHash_1.MurmurHash.update(hash, I.a);
            hash = MurmurHash_1.MurmurHash.update(hash, I.b);
        }
        hash = MurmurHash_1.MurmurHash.finish(hash, this._intervals.length * 2);
        return hash;
    }
    /** Are two IntervalSets equal?  Because all intervals are sorted
     *  and disjoint, equals is a simple linear walk over both lists
     *  to make sure they are the same.  Interval.equals() is used
     *  by the List.equals() method to check the ranges.
     */
    equals(o) {
        if (o == null || !(o instanceof IntervalSet)) {
            return false;
        }
        return ArrayEqualityComparator_1.ArrayEqualityComparator.INSTANCE.equals(this._intervals, o._intervals);
    }
    toString(elemAreChar = false) {
        let buf = "";
        if (this._intervals == null || this._intervals.length === 0) {
            return "{}";
        }
        if (this.size > 1) {
            buf += "{";
        }
        let first = true;
        for (let I of this._intervals) {
            if (first) {
                first = false;
            }
            else {
                buf += ", ";
            }
            let a = I.a;
            let b = I.b;
            if (a === b) {
                if (a == Token_1.Token.EOF) {
                    buf += "<EOF>";
                }
                else if (elemAreChar) {
                    buf += "'" + String.fromCharCode(a) + "'";
                }
                else {
                    buf += a;
                }
            }
            else {
                if (elemAreChar) {
                    buf += "'" + String.fromCharCode(a) + "'..'" + String.fromCharCode(b) + "'";
                }
                else {
                    buf += a + ".." + b;
                }
            }
        }
        if (this.size > 1) {
            buf += "}";
        }
        return buf;
    }
    toStringVocabulary(vocabulary) {
        if (this._intervals == null || this._intervals.length === 0) {
            return "{}";
        }
        let buf = "";
        if (this.size > 1) {
            buf += "{";
        }
        let first = true;
        for (let I of this._intervals) {
            if (first) {
                first = false;
            }
            else {
                buf += ", ";
            }
            let a = I.a;
            let b = I.b;
            if (a === b) {
                buf += this.elementName(vocabulary, a);
            }
            else {
                for (let i = a; i <= b; i++) {
                    if (i > a) {
                        buf += ", ";
                    }
                    buf += this.elementName(vocabulary, i);
                }
            }
        }
        if (this.size > 1) {
            buf += "}";
        }
        return buf;
    }
    elementName(vocabulary, a) {
        if (a === Token_1.Token.EOF) {
            return "<EOF>";
        }
        else if (a === Token_1.Token.EPSILON) {
            return "<EPSILON>";
        }
        else {
            return vocabulary.getDisplayName(a);
        }
    }
    get size() {
        let n = 0;
        let numIntervals = this._intervals.length;
        if (numIntervals == 1) {
            let firstInterval = this._intervals[0];
            return firstInterval.b - firstInterval.a + 1;
        }
        for (let i = 0; i < numIntervals; i++) {
            let I = this._intervals[i];
            n += (I.b - I.a + 1);
        }
        return n;
    }
    toIntegerList() {
        let values = new IntegerList_1.IntegerList(this.size);
        let n = this._intervals.length;
        for (let i = 0; i < n; i++) {
            let I = this._intervals[i];
            let a = I.a;
            let b = I.b;
            for (let v = a; v <= b; v++) {
                values.add(v);
            }
        }
        return values;
    }
    toList() {
        let values = new Array();
        let n = this._intervals.length;
        for (let i = 0; i < n; i++) {
            let I = this._intervals[i];
            let a = I.a;
            let b = I.b;
            for (let v = a; v <= b; v++) {
                values.push(v);
            }
        }
        return values;
    }
    toSet() {
        let s = new Set();
        for (let I of this._intervals) {
            let a = I.a;
            let b = I.b;
            for (let v = a; v <= b; v++) {
                s.add(v);
            }
        }
        return s;
    }
    toArray() {
        return this.toList();
    }
    remove(el) {
        if (this.readonly) {
            throw new Error("can't alter readonly IntervalSet");
        }
        let n = this._intervals.length;
        for (let i = 0; i < n; i++) {
            let I = this._intervals[i];
            let a = I.a;
            let b = I.b;
            if (el < a) {
                break; // list is sorted and el is before this interval; not here
            }
            // if whole interval x..x, rm
            if (el === a && el === b) {
                this._intervals.splice(i, 1);
                break;
            }
            // if on left edge x..b, adjust left
            if (el === a) {
                this._intervals[i] = Interval_1.Interval.of(I.a + 1, I.b);
                break;
            }
            // if on right edge a..x, adjust right
            if (el === b) {
                this._intervals[i] = Interval_1.Interval.of(I.a, I.b - 1);
                break;
            }
            // if in middle a..x..b, split interval
            if (el > a && el < b) {
                let oldb = I.b;
                this._intervals[i] = Interval_1.Interval.of(I.a, el - 1); // [a..x-1]
                this.add(el + 1, oldb); // add [x+1..b]
            }
        }
    }
    get isReadonly() {
        return this.readonly;
    }
    setReadonly(readonly) {
        if (this.readonly && !readonly) {
            throw new Error("can't alter readonly IntervalSet");
        }
        this.readonly = readonly;
    }
}
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "addAll", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "complement", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "subtract", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "or", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "and", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "contains", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "isNil", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "getSingleElement", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "equals", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], IntervalSet.prototype, "toStringVocabulary", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], IntervalSet.prototype, "elementName", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "size", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "toList", null);
__decorate([
    Decorators_1.Override
], IntervalSet.prototype, "remove", null);
__decorate([
    Decorators_1.NotNull
], IntervalSet, "of", null);
__decorate([
    Decorators_1.NotNull
], IntervalSet, "subtract", null);
exports.IntervalSet = IntervalSet;

},{"../Decorators":16,"../Lexer":24,"../Token":40,"./ArrayEqualityComparator":105,"./IntegerList":109,"./Interval":111,"./MurmurHash":113}],113:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @author Sam Harwell
 */
var MurmurHash;
(function (MurmurHash) {
    const DEFAULT_SEED = 0;
    /**
     * Initialize the hash using the specified {@code seed}.
     *
     * @param seed the seed (optional)
     * @return the intermediate hash value
     */
    function initialize(seed = DEFAULT_SEED) {
        return seed;
    }
    MurmurHash.initialize = initialize;
    /**
     * Update the intermediate hash value for the next input {@code value}.
     *
     * @param hash the intermediate hash value
     * @param value the value to add to the current hash
     * @return the updated intermediate hash value
     */
    function update(hash, value) {
        const c1 = 0xCC9E2D51;
        const c2 = 0x1B873593;
        const r1 = 15;
        const r2 = 13;
        const m = 5;
        const n = 0xE6546B64;
        if (value == null) {
            value = 0;
        }
        else if (typeof value === 'string') {
            value = hashString(value);
        }
        else if (typeof value === 'object') {
            value = value.hashCode();
        }
        let k = value;
        k = Math.imul(k, c1);
        k = (k << r1) | (k >>> (32 - r1));
        k = Math.imul(k, c2);
        hash = hash ^ k;
        hash = (hash << r2) | (hash >>> (32 - r2));
        hash = Math.imul(hash, m) + n;
        return hash & 0xFFFFFFFF;
    }
    MurmurHash.update = update;
    /**
     * Apply the final computation steps to the intermediate value {@code hash}
     * to form the final result of the MurmurHash 3 hash function.
     *
     * @param hash the intermediate hash value
     * @param numberOfWords the number of integer values added to the hash
     * @return the final hash result
     */
    function finish(hash, numberOfWords) {
        hash = hash ^ (numberOfWords * 4);
        hash = hash ^ (hash >>> 16);
        hash = Math.imul(hash, 0x85EBCA6B);
        hash = hash ^ (hash >>> 13);
        hash = Math.imul(hash, 0xC2B2AE35);
        hash = hash ^ (hash >>> 16);
        return hash;
    }
    MurmurHash.finish = finish;
    /**
     * Utility function to compute the hash code of an array using the
     * MurmurHash algorithm.
     *
     * @param <T> the array element type
     * @param data the array data
     * @param seed the seed for the MurmurHash algorithm
     * @return the hash code of the data
     */
    function hashCode(data, seed = DEFAULT_SEED) {
        let hash = initialize(seed);
        let length = 0;
        for (let value of data) {
            hash = update(hash, value);
            length++;
        }
        hash = finish(hash, length);
        return hash;
    }
    MurmurHash.hashCode = hashCode;
    /**
     * Function to hash a string. Based on the implementation found here:
     * http://stackoverflow.com/a/7616484
     */
    function hashString(str) {
        let len = str.length;
        if (len === 0) {
            return 0;
        }
        let hash = 0;
        for (let i = 0; i < len; i++) {
            let c = str.charCodeAt(i);
            hash = (((hash << 5) >>> 0) - hash) + c;
            hash |= 0;
        }
        return hash;
    }
})(MurmurHash = exports.MurmurHash || (exports.MurmurHash = {}));

},{}],114:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
/**
 * This default implementation of {@link EqualityComparator} uses object equality
 * for comparisons by calling {@link Object#hashCode} and {@link Object#equals}.
 *
 * @author Sam Harwell
 */
class ObjectEqualityComparator {
    /**
     * {@inheritDoc}
     *
     * <p>This implementation returns
     * {@code obj.}{@link Object#hashCode hashCode()}.</p>
     */
    hashCode(obj) {
        if (obj == null) {
            return 0;
        }
        return obj.hashCode();
    }
    /**
     * {@inheritDoc}
     *
     * <p>This implementation relies on object equality. If both objects are
     * {@code null}, this method returns {@code true}. Otherwise if only
     * {@code a} is {@code null}, this method returns {@code false}. Otherwise,
     * this method returns the result of
     * {@code a.}{@link Object#equals equals}{@code (b)}.</p>
     */
    equals(a, b) {
        if (a == null) {
            return b == null;
        }
        return a.equals(b);
    }
}
ObjectEqualityComparator.INSTANCE = new ObjectEqualityComparator();
__decorate([
    Decorators_1.Override
], ObjectEqualityComparator.prototype, "hashCode", null);
__decorate([
    Decorators_1.Override
], ObjectEqualityComparator.prototype, "equals", null);
exports.ObjectEqualityComparator = ObjectEqualityComparator;

},{"../Decorators":16}],115:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:42.5447085-07:00
/**
 * This exception is thrown to cancel a parsing operation. This exception does
 * not extend {@link RecognitionException}, allowing it to bypass the standard
 * error recovery mechanisms. {@link BailErrorStrategy} throws this exception in
 * response to a parse error.
 *
 * @author Sam Harwell
 */
class ParseCancellationException extends Error {
    constructor(cause) {
        super(cause.message);
        this.cause = cause;
        this.stack = cause.stack;
    }
    getCause() {
        return this.cause;
    }
}
exports.ParseCancellationException = ParseCancellationException;

},{}],116:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This adapter function allows Collection<T> arguments to be used in JavaScript for...of loops
 */
function asIterable(collection) {
    if (collection[Symbol.iterator])
        return collection;
    return new IterableAdapter(collection);
}
exports.asIterable = asIterable;
// implementation detail of above...
class IterableAdapter {
    constructor(collection) {
        this.collection = collection;
    }
    [Symbol.iterator]() { this._iterator = this.collection.iterator(); return this; }
    next() {
        if (!this._iterator.hasNext()) {
            // A bit of a hack needed here, tracking under https://github.com/Microsoft/TypeScript/issues/11375
            return { done: true, value: undefined };
        }
        return { done: false, value: this._iterator.next() };
    }
}

},{}],117:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const MurmurHash_1 = require("./MurmurHash");
class UUID {
    constructor(mostSigBits, moreSigBits, lessSigBits, leastSigBits) {
        this.data = new Uint32Array(4);
        this.data[0] = mostSigBits;
        this.data[1] = moreSigBits;
        this.data[2] = lessSigBits;
        this.data[3] = leastSigBits;
    }
    static fromString(data) {
        if (!/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(data)) {
            throw new Error("Incorrectly formatted UUID");
        }
        let segments = data.split('-');
        let mostSigBits = parseInt(segments[0], 16);
        let moreSigBits = ((parseInt(segments[1], 16) << 16) >>> 0) + parseInt(segments[2], 16);
        let lessSigBits = ((parseInt(segments[3], 16) << 16) >>> 0) + parseInt(segments[4].substr(0, 4), 16);
        let leastSigBits = parseInt(segments[4].substr(-8), 16);
        return new UUID(mostSigBits, moreSigBits, lessSigBits, leastSigBits);
    }
    hashCode() {
        return MurmurHash_1.MurmurHash.hashCode([this.data[0], this.data[1], this.data[2], this.data[3]]);
    }
    equals(obj) {
        if (obj === this) {
            return true;
        }
        else if (!(obj instanceof UUID)) {
            return false;
        }
        return this.data[0] === obj.data[0]
            && this.data[1] === obj.data[1]
            && this.data[2] === obj.data[2]
            && this.data[3] === obj.data[3];
    }
    toString() {
        return ("00000000" + this.data[0].toString(16)).substr(-8)
            + "-" + ("0000" + (this.data[1] >>> 16).toString(16)).substr(-4)
            + "-" + ("0000" + this.data[1].toString(16)).substr(-4)
            + "-" + ("0000" + (this.data[2] >>> 16).toString(16)).substr(-4)
            + "-" + ("0000" + this.data[2].toString(16)).substr(-4)
            + ("00000000" + this.data[3].toString(16)).substr(-8);
    }
}
exports.UUID = UUID;

},{"./MurmurHash":113}],118:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function escapeWhitespace(s, escapeSpaces) {
    return escapeSpaces ? s.replace(/ /, '\u00B7') : s
        .replace(/\t/, "\\t")
        .replace(/\n/, "\\n")
        .replace(/\r/, "\\r");
}
exports.escapeWhitespace = escapeWhitespace;
// Seriously: why isn't this built in to java? ugh!
function join(collection, separator) {
    let buf = "";
    let first = true;
    for (let current of collection) {
        if (first) {
            first = false;
        }
        else {
            buf += separator;
        }
        buf += current;
    }
    return buf;
}
exports.join = join;
function equals(x, y) {
    if (x === y) {
        return true;
    }
    if (x == null || y == null) {
        return false;
    }
    return x.equals(y);
}
exports.equals = equals;
// export function numNonnull(data: any[]): number {
// 	let n: number =  0;
// 	if ( data == null ) return n;
// 	for (let o of data) {
// 		if ( o!=null ) n++;
// 	}
// 	return n;
// }
// export function removeAllElements<T>(data: Collection<T>, value: T): void {
// 	if ( data==null ) return;
// 	while ( data.contains(value) ) data.remove(value);
// }
// export function writeFile(@NotNull fileName: string, @NotNull content: string): void {
// 	writeFile(fileName, content, null);
// }
// export function writeFile(@NotNull fileName: string, @NotNull content: string, @Nullable encoding: string): void {
// 	let f: File =  new File(fileName);
// 	let fos: FileOutputStream =  new FileOutputStream(f);
// 	let osw: OutputStreamWriter;
// 	if (encoding != null) {
// 		osw = new OutputStreamWriter(fos, encoding);
// 	}
// 	else {
// 		osw = new OutputStreamWriter(fos);
// 	}
// 	try {
// 		osw.write(content);
// 	}
// 	finally {
// 		osw.close();
// 	}
// }
// @NotNull
// export function readFile(@NotNull fileName: string): char[] {
// 	return readFile(fileName, null);
// }
// @NotNull
// export function readFile(@NotNull fileName: string, @Nullable encoding: string): char[] {
// 	let f: File =  new File(fileName);
// 	let size: number =  (int)f.length();
// 	let isr: InputStreamReader;
// 	let fis: FileInputStream =  new FileInputStream(fileName);
// 	if ( encoding!=null ) {
// 		isr = new InputStreamReader(fis, encoding);
// 	}
// 	else {
// 		isr = new InputStreamReader(fis);
// 	}
// 	let data: char[] =  null;
// 	try {
// 		data = new char[size];
// 		let n: number =  isr.read(data);
// 		if (n < data.length) {
// 			data = Arrays.copyOf(data, n);
// 		}
// 	}
// 	finally {
// 		isr.close();
// 	}
// 	return data;
// }
// export function removeAll<T>(@NotNull predicate: List<T> list,@NotNull Predicate<? super T>): void {
// 	let j: number =  0;
// 	for (let i = 0; i < list.size; i++) {
// 		let item: T =  list.get(i);
// 		if (!predicate.eval(item)) {
// 			if (j != i) {
// 				list.set(j, item);
// 			}
// 			j++;
// 		}
// 	}
// 	if (j < list.size) {
// 		list.subList(j, list.size).clear();
// 	}
// }
// export function removeAll<T>(@NotNull predicate: Iterable<T> iterable,@NotNull Predicate<? super T>): void {
// 	if (iterable instanceof List<?>) {
// 		removeAll((List<T>)iterable, predicate);
// 		return;
// 	}
// 	for (Iterator<T> iterator = iterable.iterator(); iterator.hasNext(); ) {
// 		let item: T =  iterator.next();
// 		if (predicate.eval(item)) {
// 			iterator.remove();
// 		}
// 	}
// }
/** Convert array of strings to string&rarr;index map. Useful for
 *  converting rulenames to name&rarr;ruleindex map.
 */
function toMap(keys) {
    let m = new Map();
    for (let i = 0; i < keys.length; i++) {
        m.set(keys[i], i);
    }
    return m;
}
exports.toMap = toMap;
function toCharArray(str) {
    let result = new Uint16Array(str.length);
    for (let i = 0; i < str.length; i++) {
        result[i] = str.charCodeAt(i);
    }
    return result;
}
exports.toCharArray = toCharArray;
// export function toCharArray(data: IntegerList): char[] {
// 	if ( data==null ) return null;
// 	let cdata: char[] =  new char[data.size];
// 	for (let i=0; i<data.size; i++) {
// 		cdata[i] = (char)data.get(i);
// 	}
// 	return cdata;
// }
// /**
// 	* @since 4.5
// 	*/
// @NotNull
// export function toSet(@NotNull bits: BitSet): IntervalSet {
// 	let s: IntervalSet =  new IntervalSet();
// 	let i: number =  bits.nextSetBit(0);
// 	while ( i >= 0 ) {
// 		s.add(i);
// 		i = bits.nextSetBit(i+1);
// 	}
// 	return s;
// }

},{}],119:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("../Decorators");
class AbstractParseTreeVisitor {
    /**
     * {@inheritDoc}
     *
     * <p>The default implementation calls {@link ParseTree#accept} on the
     * specified tree.</p>
     */
    visit(tree) {
        return tree.accept(this);
    }
    /**
     * {@inheritDoc}
     *
     * <p>The default implementation initializes the aggregate result to
     * {@link #defaultResult defaultResult()}. Before visiting each child, it
     * calls {@link #shouldVisitNextChild shouldVisitNextChild}; if the result
     * is {@code false} no more children are visited and the current aggregate
     * result is returned. After visiting a child, the aggregate result is
     * updated by calling {@link #aggregateResult aggregateResult} with the
     * previous aggregate result and the result of visiting the child.</p>
     *
     * <p>The default implementation is not safe for use in visitors that modify
     * the tree structure. Visitors that modify the tree should override this
     * method to behave properly in respect to the specific algorithm in use.</p>
     */
    visitChildren(node) {
        let result = this.defaultResult();
        let n = node.childCount;
        for (let i = 0; i < n; i++) {
            if (!this.shouldVisitNextChild(node, result)) {
                break;
            }
            let c = node.getChild(i);
            let childResult = c.accept(this);
            result = this.aggregateResult(result, childResult);
        }
        return result;
    }
    /**
     * {@inheritDoc}
     *
     * <p>The default implementation returns the result of
     * {@link #defaultResult defaultResult}.</p>
     */
    visitTerminal(node) {
        return this.defaultResult();
    }
    /**
     * {@inheritDoc}
     *
     * <p>The default implementation returns the result of
     * {@link #defaultResult defaultResult}.</p>
     */
    visitErrorNode(node) {
        return this.defaultResult();
    }
    /**
     * Aggregates the results of visiting multiple children of a node. After
     * either all children are visited or {@link #shouldVisitNextChild} returns
     * {@code false}, the aggregate value is returned as the result of
     * {@link #visitChildren}.
     *
     * <p>The default implementation returns {@code nextResult}, meaning
     * {@link #visitChildren} will return the result of the last child visited
     * (or return the initial value if the node has no children).</p>
     *
     * @param aggregate The previous aggregate value. In the default
     * implementation, the aggregate value is initialized to
     * {@link #defaultResult}, which is passed as the {@code aggregate} argument
     * to this method after the first child node is visited.
     * @param nextResult The result of the immediately preceeding call to visit
     * a child node.
     *
     * @return The updated aggregate result.
     */
    aggregateResult(aggregate, nextResult) {
        return nextResult;
    }
    /**
     * This method is called after visiting each child in
     * {@link #visitChildren}. This method is first called before the first
     * child is visited; at that point {@code currentResult} will be the initial
     * value (in the default implementation, the initial value is returned by a
     * call to {@link #defaultResult}. This method is not called after the last
     * child is visited.
     *
     * <p>The default implementation always returns {@code true}, indicating that
     * {@code visitChildren} should only return after all children are visited.
     * One reason to override this method is to provide a "short circuit"
     * evaluation option for situations where the result of visiting a single
     * child has the potential to determine the result of the visit operation as
     * a whole.</p>
     *
     * @param node The {@link RuleNode} whose children are currently being
     * visited.
     * @param currentResult The current aggregate result of the children visited
     * to the current point.
     *
     * @return {@code true} to continue visiting children. Otherwise return
     * {@code false} to stop visiting children and immediately return the
     * current aggregate result from {@link #visitChildren}.
     */
    shouldVisitNextChild(node, currentResult) {
        return true;
    }
}
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], AbstractParseTreeVisitor.prototype, "visit", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], AbstractParseTreeVisitor.prototype, "visitChildren", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], AbstractParseTreeVisitor.prototype, "visitTerminal", null);
__decorate([
    Decorators_1.Override,
    __param(0, Decorators_1.NotNull)
], AbstractParseTreeVisitor.prototype, "visitErrorNode", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], AbstractParseTreeVisitor.prototype, "shouldVisitNextChild", null);
exports.AbstractParseTreeVisitor = AbstractParseTreeVisitor;

},{"../Decorators":16}],120:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:47.4646355-07:00
const Decorators_1 = require("../Decorators");
const TerminalNode_1 = require("./TerminalNode");
/** Represents a token that was consumed during resynchronization
 *  rather than during a valid match operation. For example,
 *  we will create this kind of a node during single token insertion
 *  and deletion as well as during "consume until error recovery set"
 *  upon no viable alternative exceptions.
 */
class ErrorNode extends TerminalNode_1.TerminalNode {
    constructor(token) {
        super(token);
    }
    accept(visitor) {
        return visitor.visitErrorNode(this);
    }
}
__decorate([
    Decorators_1.Override
], ErrorNode.prototype, "accept", null);
exports.ErrorNode = ErrorNode;

},{"../Decorators":16,"./TerminalNode":124}],121:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ParseTreeProperty {
    constructor(name = "ParseTreeProperty") {
        this._symbol = Symbol(name);
    }
    get(node) {
        return node[this._symbol];
    }
    set(node, value) {
        node[this._symbol] = value;
    }
    removeFrom(node) {
        let result = node[this._symbol];
        delete node[this._symbol];
        return result;
    }
}
exports.ParseTreeProperty = ParseTreeProperty;

},{}],122:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorNode_1 = require("./ErrorNode");
const TerminalNode_1 = require("./TerminalNode");
const RuleNode_1 = require("./RuleNode");
class ParseTreeWalker {
    walk(listener, t) {
        let nodeStack = [];
        let indexStack = [];
        let currentNode = t;
        let currentIndex = 0;
        while (currentNode) {
            // pre-order visit
            if (currentNode instanceof ErrorNode_1.ErrorNode) {
                if (listener.visitErrorNode) {
                    listener.visitErrorNode(currentNode);
                }
            }
            else if (currentNode instanceof TerminalNode_1.TerminalNode) {
                if (listener.visitTerminal) {
                    listener.visitTerminal(currentNode);
                }
            }
            else {
                this.enterRule(listener, currentNode);
            }
            // Move down to first child, if exists
            if (currentNode.childCount > 0) {
                nodeStack.push(currentNode);
                indexStack.push(currentIndex);
                currentIndex = 0;
                currentNode = currentNode.getChild(0);
                continue;
            }
            // No child nodes, so walk tree
            do {
                // post-order visit
                if (currentNode instanceof RuleNode_1.RuleNode) {
                    this.exitRule(listener, currentNode);
                }
                // No parent, so no siblings
                if (nodeStack.length === 0) {
                    currentNode = undefined;
                    currentIndex = 0;
                    break;
                }
                // Move to next sibling if possible
                let last = nodeStack[nodeStack.length - 1];
                currentIndex++;
                currentNode = currentIndex < last.childCount ? last.getChild(currentIndex) : undefined;
                if (currentNode) {
                    break;
                }
                // No next sibling, so move up
                currentNode = nodeStack.pop();
                currentIndex = indexStack.pop();
            } while (currentNode);
        }
    }
    /**
     * The discovery of a rule node, involves sending two events: the generic
     * {@link ParseTreeListener#enterEveryRule} and a
     * {@link RuleContext}-specific event. First we trigger the generic and then
     * the rule specific. We to them in reverse order upon finishing the node.
     */
    enterRule(listener, r) {
        let ctx = r.ruleContext;
        if (listener.enterEveryRule) {
            listener.enterEveryRule(ctx);
        }
        ctx.enterRule(listener);
    }
    exitRule(listener, r) {
        let ctx = r.ruleContext;
        ctx.exitRule(listener);
        if (listener.exitEveryRule) {
            listener.exitEveryRule(ctx);
        }
    }
}
exports.ParseTreeWalker = ParseTreeWalker;
(function (ParseTreeWalker) {
    ParseTreeWalker.DEFAULT = new ParseTreeWalker();
})(ParseTreeWalker = exports.ParseTreeWalker || (exports.ParseTreeWalker = {}));

},{"./ErrorNode":120,"./RuleNode":123,"./TerminalNode":124}],123:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class RuleNode {
}
exports.RuleNode = RuleNode;

},{}],124:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ConvertTo-TS run at 2016-10-04T11:26:48.1433686-07:00
const Interval_1 = require("../misc/Interval");
const Decorators_1 = require("../Decorators");
const Token_1 = require("../Token");
class TerminalNode {
    constructor(symbol) {
        this._symbol = symbol;
    }
    getChild(i) {
        throw new RangeError("Terminal Node has no children.");
    }
    get symbol() {
        return this._symbol;
    }
    get parent() {
        return this._parent;
    }
    get payload() {
        return this._symbol;
    }
    get sourceInterval() {
        let tokenIndex = this._symbol.tokenIndex;
        return new Interval_1.Interval(tokenIndex, tokenIndex);
    }
    get childCount() {
        return 0;
    }
    accept(visitor) {
        return visitor.visitTerminal(this);
    }
    get text() {
        return this._symbol.text || "";
    }
    toStringTree(parser) {
        return this.toString();
    }
    toString() {
        if (this._symbol.type === Token_1.Token.EOF) {
            return "<EOF>";
        }
        return this._symbol.text || "";
    }
}
__decorate([
    Decorators_1.Override
], TerminalNode.prototype, "getChild", null);
__decorate([
    Decorators_1.Override
], TerminalNode.prototype, "parent", null);
__decorate([
    Decorators_1.Override
], TerminalNode.prototype, "payload", null);
__decorate([
    Decorators_1.Override
], TerminalNode.prototype, "sourceInterval", null);
__decorate([
    Decorators_1.Override
], TerminalNode.prototype, "childCount", null);
__decorate([
    Decorators_1.Override
], TerminalNode.prototype, "accept", null);
__decorate([
    Decorators_1.Override
], TerminalNode.prototype, "text", null);
__decorate([
    Decorators_1.Override
], TerminalNode.prototype, "toStringTree", null);
__decorate([
    Decorators_1.Override
], TerminalNode.prototype, "toString", null);
exports.TerminalNode = TerminalNode;

},{"../Decorators":16,"../Token":40,"../misc/Interval":111}],125:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const ATN_1 = require("../atn/ATN");
const CommonToken_1 = require("../CommonToken");
const ErrorNode_1 = require("./ErrorNode");
const Decorators_1 = require("../Decorators");
const Parser_1 = require("../Parser");
const ParserRuleContext_1 = require("../ParserRuleContext");
const RuleNode_1 = require("./RuleNode");
const TerminalNode_1 = require("./TerminalNode");
const Token_1 = require("../Token");
const Utils = require("../misc/Utils");
/** A set of utility routines useful for all kinds of ANTLR trees. */
class Trees {
    /** Print out a whole tree in LISP form. {@link #getNodeText} is used on the
     *  node payloads to get the text for the nodes.  Detect
     *  parse trees and extract data appropriately.
     */
    /** Print out a whole tree in LISP form. {@link #getNodeText} is used on the
     *  node payloads to get the text for the nodes.  Detect
     *  parse trees and extract data appropriately.
     */
    /** Print out a whole tree in LISP form. {@link #getNodeText} is used on the
     *  node payloads to get the text for the nodes.
     */
    static toStringTree(t, arg2) {
        let ruleNames;
        if (arg2 instanceof Parser_1.Parser) {
            ruleNames = arg2.ruleNames;
        }
        else {
            ruleNames = arg2;
        }
        let s = Utils.escapeWhitespace(this.getNodeText(t, ruleNames), false);
        if (t.childCount == 0)
            return s;
        let buf = "";
        buf += ("(");
        s = Utils.escapeWhitespace(this.getNodeText(t, ruleNames), false);
        buf += (s);
        buf += (' ');
        for (let i = 0; i < t.childCount; i++) {
            if (i > 0)
                buf += (' ');
            buf += (this.toStringTree(t.getChild(i), ruleNames));
        }
        buf += (")");
        return buf;
    }
    static getNodeText(t, arg2) {
        let ruleNames;
        if (arg2 instanceof Parser_1.Parser) {
            ruleNames = arg2.ruleNames;
        }
        else if (arg2) {
            ruleNames = arg2;
        }
        else {
            // no recog or rule names
            let payload = t.payload;
            if (typeof payload.text === 'string') {
                return payload.text;
            }
            return t.payload.toString();
            ;
        }
        if (t instanceof RuleNode_1.RuleNode) {
            let ruleContext = t.ruleContext;
            let ruleIndex = ruleContext.ruleIndex;
            let ruleName = ruleNames[ruleIndex];
            let altNumber = ruleContext.altNumber;
            if (altNumber !== ATN_1.ATN.INVALID_ALT_NUMBER) {
                return ruleName + ":" + altNumber;
            }
            return ruleName;
        }
        else if (t instanceof ErrorNode_1.ErrorNode) {
            return t.toString();
        }
        else if (t instanceof TerminalNode_1.TerminalNode) {
            let symbol = t.symbol;
            return symbol.text || "";
        }
        throw new TypeError("Unexpected node type");
    }
    /** Return ordered list of all children of this node */
    static getChildren(t) {
        let kids = [];
        for (let i = 0; i < t.childCount; i++) {
            kids.push(t.getChild(i));
        }
        return kids;
    }
    /** Return a list of all ancestors of this node.  The first node of
     *  list is the root and the last is the parent of this node.
     *
     *  @since 4.5.1
     */
    static getAncestors(t) {
        let ancestors = [];
        let p = t.parent;
        while (p) {
            ancestors.unshift(p); // insert at start
            p = p.parent;
        }
        return ancestors;
    }
    /** Return true if t is u's parent or a node on path to root from u.
     *  Use == not equals().
     *
     *  @since 4.5.1
     */
    static isAncestorOf(t, u) {
        if (!t || !u || !t.parent)
            return false;
        let p = u.parent;
        while (p) {
            if (t === p)
                return true;
            p = p.parent;
        }
        return false;
    }
    static findAllTokenNodes(t, ttype) {
        return Trees.findAllNodes(t, ttype, true);
    }
    static findAllRuleNodes(t, ruleIndex) {
        return Trees.findAllNodes(t, ruleIndex, false);
    }
    static findAllNodes(t, index, findTokens) {
        let nodes = [];
        Trees._findAllNodes(t, index, findTokens, nodes);
        return nodes;
    }
    static _findAllNodes(t, index, findTokens, nodes) {
        // check this node (the root) first
        if (findTokens && t instanceof TerminalNode_1.TerminalNode) {
            if (t.symbol.type === index)
                nodes.push(t);
        }
        else if (!findTokens && t instanceof ParserRuleContext_1.ParserRuleContext) {
            if (t.ruleIndex === index)
                nodes.push(t);
        }
        // check children
        for (let i = 0; i < t.childCount; i++) {
            Trees._findAllNodes(t.getChild(i), index, findTokens, nodes);
        }
    }
    /** Get all descendents; includes t itself.
     *
     * @since 4.5.1
     */
    static getDescendants(t) {
        let nodes = [];
        function recurse(e) {
            nodes.push(e);
            const n = e.childCount;
            for (let i = 0; i < n; i++) {
                recurse(e.getChild(i));
            }
        }
        recurse(t);
        return nodes;
    }
    /** Find smallest subtree of t enclosing range startTokenIndex..stopTokenIndex
    *  inclusively using postorder traversal.  Recursive depth-first-search.
    *
    *  @since 4.5
    */
    static getRootOfSubtreeEnclosingRegion(t, startTokenIndex, // inclusive
        stopTokenIndex // inclusive
    ) {
        let n = t.childCount;
        for (let i = 0; i < n; i++) {
            let child = t.getChild(i);
            let r = Trees.getRootOfSubtreeEnclosingRegion(child, startTokenIndex, stopTokenIndex);
            if (r)
                return r;
        }
        if (t instanceof ParserRuleContext_1.ParserRuleContext) {
            let stopToken = t.stop;
            if (startTokenIndex >= t.start.tokenIndex &&
                (stopToken == null || stopTokenIndex <= stopToken.tokenIndex)) {
                // note: r.stop==null likely implies that we bailed out of parser and there's nothing to the right
                return t;
            }
        }
        return undefined;
    }
    /** Replace any subtree siblings of root that are completely to left
    *  or right of lookahead range with a CommonToken(Token.INVALID_TYPE,"...")
    *  node. The source interval for t is not altered to suit smaller range!
    *
    *  WARNING: destructive to t.
    *
    *  @since 4.5.1
    */
    static stripChildrenOutOfRange(t, root, startIndex, stopIndex) {
        if (!t)
            return;
        let count = t.childCount;
        for (let i = 0; i < count; i++) {
            let child = t.getChild(i);
            let range = child.sourceInterval;
            if (child instanceof ParserRuleContext_1.ParserRuleContext && (range.b < startIndex || range.a > stopIndex)) {
                if (Trees.isAncestorOf(child, root)) {
                    let abbrev = new CommonToken_1.CommonToken(Token_1.Token.INVALID_TYPE, "...");
                    t.children[i] = new TerminalNode_1.TerminalNode(abbrev); // HACK access to private
                }
            }
        }
    }
}
__decorate([
    __param(0, Decorators_1.NotNull)
], Trees, "toStringTree", null);
__decorate([
    Decorators_1.NotNull,
    __param(0, Decorators_1.NotNull)
], Trees, "getAncestors", null);
__decorate([
    __param(0, Decorators_1.NotNull)
], Trees, "getRootOfSubtreeEnclosingRegion", null);
exports.Trees = Trees;

},{"../CommonToken":12,"../Decorators":16,"../Parser":29,"../ParserRuleContext":31,"../Token":40,"../atn/ATN":43,"../misc/Utils":118,"./ErrorNode":120,"./RuleNode":123,"./TerminalNode":124}],126:[function(require,module,exports){
"use strict";
/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./AbstractParseTreeVisitor"));
__export(require("./ErrorNode"));
__export(require("./ParseTreeProperty"));
__export(require("./ParseTreeWalker"));
__export(require("./RuleNode"));
__export(require("./TerminalNode"));
__export(require("./Trees"));

},{"./AbstractParseTreeVisitor":119,"./ErrorNode":120,"./ParseTreeProperty":121,"./ParseTreeWalker":122,"./RuleNode":123,"./TerminalNode":124,"./Trees":125}],127:[function(require,module,exports){
(function (global){
'use strict';

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"util/":131}],128:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],129:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],130:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],131:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":130,"_process":128,"inherits":129}]},{},[5])(5)
});