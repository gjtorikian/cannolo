/**
 *  cli
 *
 *  Instance of ArgumentParser with some small improvements and additional
 *  methods.
 *
 *
 *  #### Extra Actions
 *
 *  We provide some extra-actions for our instance of ArgumentParser.
 *
 *
 *  ###### store+lazyChoices
 *
 *  Allows you define actions with lambda-like choices
 *
 *      cli.addArgument(['--foobar', {
 *        // ...
 *        choices: function () { return ['a', 'b', 'c']; }
 *      });
 *
 *
 *  ###### store+readJSON
 *
 *  Allows specify an action that set value as an object from the file specified
 *  in the argument.
 *
 *
 *  ###### store+readFile
 *
 *  Allows specify an action that will set value as a string read from the file
 *  specified in the argument.
 *
 *
 *  #### See Also
 *
 *  - [ArgumentParser](http://nodeca.github.com/argparse/)
 **/


'use strict';


// stdlib
var fs   = require('fs');
var path = require('path');


// 3rd-party
var _               = require('underscore');
var FsTools         = require('fs-tools');
var argparse        = require('argparse');
var minimatch       = require('minimatch');
var ArgumentParser  = argparse.ArgumentParser;


// internal
var renderers = require('./renderers');


////////////////////////////////////////////////////////////////////////////////


var cli = module.exports = new ArgumentParser({
  version:  require('./version'),
  addHelp:  true,
  formatterClass: function(options) {
    options['maxHelpPosition'] = 40;
    return new argparse.HelpFormatter(options);
  }
});


cli.register('action', 'store+lazyChoices',   require('./cli/lazy-choices'));
cli.register('action', 'store+readJSON',      require('./cli/read-json'));
cli.register('action', 'store+readFile',      require('./cli/read-file'));


////////////////////////////////////////////////////////////////////////////////


cli.addArgument(['paths'], {
  help:         'Source files location',
  metavar:      'PATH',
  action:       'append',
  nargs:        '+'
});


cli.addArgument(['--exclude'], {
  help:         'Glob patterns of filenames to exclude ' +
                '(you can use wildcards: ?, *, **).',
  dest:         'exclude',
  metavar:      'PATTERN',
  action:       'append',
  defaultValue: []
});


cli.addArgument(['-o', '--output'], {
  help:         'Resulting file(s) location.',
  dest:         'output',
  metavar:      'PATH',
  defaultValue: 'out'
});

cli.addArgument(['--skin'], {
  help:         'Location for your primary Jade template.',
  dest:         'skin',
  metavar:      'PATH'
});

cli.addArgument(['-u', '--assets'], {
  help:         'Location for your assets.',
  dest:         'assets',
  metavar:      'PATH'
});

cli.addArgument(['-e', '--resources'], {
  help:         'An array of directories to also copy into the _/out_ directory. This is usually used for accompanying or inline images.',
  dest:         'resources',
  metavar:      'PATH'
});

cli.addArgument(['-a', '--additionalObjs'], {
  help:         'The path to a JSON file containing a structure defining documentation sources for additional objects.',
  dest:         'additionalObjs',
  metavar:      'PATH',
  defaultValue: path.join(__dirname, 'plugins/parsers/defaultObjs.json')
});

cli.addArgument(['-r', '--render'], {
  dest:         'renderer',
  help:         'Documentation renderer (html, json). More can be added by ' +
                'custom plugins.',
  choices:      function () { return _.keys(renderers).join(','); },
  metavar:      'RENDERER',
  action:       'store+lazyChoices',
  defaultValue: 'html'
});

cli.addArgument(['--link-format'], {
  help:         'A function that allows you to transform template links. Takes one argument: the link HTML obj. Should return the modified obj back. See docs for more info',
  dest:         'linkFormat',
  metavar:      'FORMAT',
  defaultValue: null
});

cli.addArgument(['-t', '--title'], {
  help:         'Documentation title template. You can use any of ' +
                '`{package.*}` variables for interpolation. ' +
                'DEFAULT: `{package.name} {package.version} API documentation`',
  metavar:      'TEMPLATE',
  defaultValue: '{package.name} {package.version} API documentation'
});

cli.addArgument(['-s', '--split'], {
  help:         'Splits the output into a file per class',
  dest:         'split',
  action:       'storeTrue',
  defaultValue: true
});

cli.addArgument(['-d', '--disableTests'], {
  help:         'Disables the test suite that runs at the end of an HTML build. This is NOT recommended.',
  dest:         'disableTests',
  action:       'storeTrue',
  defaultValue: false
});

cli.addArgument(['--prefix'], {
  help:         'Prepends the output file with a prefix string',
  dest:         'prefix'
});

cli.addArgument(['--suffix'], {
  help:         'Appends the output file with a suffix string',
  dest:         'suffix'
});

cli.addArgument(['--keepOutDir'], {
  help:         'Does not wipe output directory before building',
  dest:         'keepOutDir',
  action:       'storeTrue',
  defaultValue: false
});

////////////////////////////////////////////////////////////////////////////////


/**
 *  cli.findFiles(paths[, excludes], callback(err, files)) -> Void
 *  - paths (Array): List of directories/files
 *  - excludes (Array): List of glob patterns.
 *  - callback (Function)
 *
 *  Finds all files within given `paths` excluding patterns provided as
 *  `excludes`.
 *
 *
 *  ##### Excluding paths
 *
 *  Each element of `excludes` list might be either a `String` pattern with
 *  wildcards (`*`, `**`, `?`, etc., see minimatch module for pattern syntax) or
 *  a `Function` that returns boolean (whenever excude or not) and executed with
 *  `(filename, lstats)`.
 *
 *
 *      var excludes = [
 *        'lib/parser-*.js',
 *        function (filename, lstats) {
 *          // skip any symlink
 *          return lstats.isSymbolicLink());
 *        }
 *      ];
 *
 *
 *  ##### See Also
 *
 *  - [minimatch](https://github.com/isaacs/minimatch)
 **/
cli.findFiles = function findFiles(paths, excludes, callback) {
  var entries = [];

  // SCENARIO: findFiles(['lib'], callback);
  if (_.isFunction(excludes)) {
    callback = excludes;
    // set default value later
    excludes = null;
  }

  // prepare matchers matchers
  excludes = _.map(excludes || [], function (p) {
    return _.isFunction(p) ? {test: p} : minimatch.makeRe(p);
  });

  // make a copy consisting valueble paths only
  paths = _.filter(paths, function (p) { return !!p; });

  function process(filename, lstats) {
    var include = true;

    if (0 < excludes.length) {
      include = !_.any(excludes, function (filter) {
        return filter.test(filename, lstats);
      });
    }

    if (include) {
      entries.push(filename);
    }
  }

  function walk(err) {
    var pathname, lstats;

    // get next path
    pathname = paths.shift();

    // skip empty path or report real error
    if (err || !pathname) {
      callback(err, entries.sort());
      return;
    }

    // get lstats of the pathname
    lstats = fs.lstatSync(pathname);

    if (!lstats.isDirectory()) {
      // process non-directories directly
      process(pathname, lstats);
      walk();
      return;
    }

    FsTools.walk(pathname, function (filename, lstats, next) {
      process(filename, lstats);
      next();
    }, walk);
  }

  walk();
};


////////////////////////////////////////////////////////////////////////////////


// parse string in a BASH style
// inspired by Shellwords module of Ruby
var SHELLWORDS_PATTERN = /\s*(?:([^\s\\\'\"]+)|'((?:[^\'\\]|\\.)*)'|"((?:[^\"\\]|\\.)*)")/;
function shellwords(line) {
  var words = [], match, field;

  while (line) {
    match = SHELLWORDS_PATTERN.exec(line);

    if (!match || !match[0]) {
      line = false;
    } else {
      line  = line.substr(match[0].length);
      field = (match[1] || match[2] || match[3] || '').replace(/\\(.)/, '$1');

      words.push(field);
    }
  }

  return words;
}


////////////////////////////////////////////////////////////////////////////////


/**
 *  cli.readEnvFile(file) -> Void
 *  - file (String): File with CLI arguments
 *
 *  Inject CLI arguments from given `file` into aprocess.argv.
 *  Arguments can be listed on multi-lines.
 *  All lines starting with `#` will be treaten as comments.
 *
 *
 *  ##### Example
 *
 *      # file: .cannolorc
 *      --title "Foobar #123"
 *
 *      # We can have empty line, and comments
 *      # as much as we need.
 *
 *      lib
 *
 *  Above, equals to:
 *
 *      --title "Foobar #123" lib
 **/
cli.readEnvFile = function (file) {
  var str = fs.readFileSync(file, 'utf8').replace(/^#.*/gm, '');
  [].splice.apply(process.argv, [2, 0].concat(shellwords(str)));
};
