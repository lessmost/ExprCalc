/**
 * Author : lingdao.lzq
 * Created On : Fri Nov 17 2017
 * File : main.ts
 */
import { execute, translate } from './index';
const str = `
A * B + C / D ;
A * (B + C) / D ;
A * (B + C / D)	;
(5 - 6) * 7 ;
`;
console.log(execute(str));
console.log(translate(str));
//# sourceMappingURL=main.js.map