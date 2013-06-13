# Introduction

Cannolo is an API documentation generation tool. It parses Markdown files to generate the documentation. Panino runs on [Node.js](http://www.nodejs.org), and uses [Jade](http://jade-lang.com/) as its templating engine.

Panino parses your content following a strict, no-crap-allowed grammar that ensures **correct** and **consistent** documentation, because you've written it following a specific syntax. This means that there is a very specific set of rules and expectations as to how to write your documentation. These rules are not terribly hard or unweildly. Keeping documentation parsed through a grammar ensures thorough and consistent docs, no matter who it's written by. 

It parses your files using the [pdoc](https://github.com/tobie/pdoc)-notation for documentation. [This blog post](http://andrewdupont.net/2008/11/16/pdoc-inline-documentation-for-prototype/) identifies some of the advantages over other commenting-to-documentation systems.  The pdoc system was originally based on [ndoc](https://github.com/nodeca/ndoc).

For more help, including syntax and tag definitions, see [the docs](./docs).

# Features

* Creating a separate page for every class
* Support for proper "`[[ ]]`"-notation linking (_e.g. `[[Class.foo]]` renders to a link wrapped in a `<code>` tag)
* Adding "shortened" descriptions, truncating the full description into a single sentance
* Ability to linkify everything (object types in signatures, return types, e.t.c.)
* Allowing to specify a URL to retrieve documentation about global objects (like `Array` or `String`)
* Support for [content references (or conrefs)](http://www.github.com/gjtorikian/markdown_conrefs). Conrefs are a way to write a sentance once, and refer to it in multiple locations. 
* Documentation runs through [a test suite](https://github.com/gjtorikian/functional-docs) to ensure the validity of all links and images
* Support for arbitrary metadata on classes and members (that can be used in templates)
* Support for arbitrary Markdown-to-HTML page conversion

Markdown is converted using [marked](https://github.com/chjj/marked).