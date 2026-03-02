/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
// 2026/03/02 11:25:27
type TNativeResultProcessor = (result: string) => string;

type TNativeLocaleDetector = <
  IsAsync extends true | void,
  R extends SelectIf<IsAsync, Promise<string>, string>
>(isAsync?: IsAsync) => R;

type TEmitLocalDetector = (
  command: string,
  processor: TNativeResultProcessor,
  // fallbackCommand?: string
) => TNativeLocaleDetector;
