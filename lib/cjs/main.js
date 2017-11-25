"use strict";
/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : main.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const str = `
A * B + C / D ;
A * (B + C) / D ;
A * (B + C / D)	;
(5 - 6) * 7 ;
`;
console.log(index_1.execute(str));
console.log(index_1.translate(str));
//# sourceMappingURL=main.js.map