/** internal, section: Plugins
 *  Renderers.html(Cannolo) -> Void
 *
 *  Registers HTML renderer as `html`.
 *
 *
 *  ##### Example
 *
 *      Cannolo.render('html', ast, options, function (err) {
 *        // ...
 *      });
 *
 *
 **/


'use strict';

module.exports = function html(Cannolo) {
  Cannolo.registerRenderer('html', require("render-html-from-ast"));
};