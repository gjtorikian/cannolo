var exec = require("child_process").exec;

exec("jison ./lib/cannolo/plugins/parsers/pdoc/pdoc.y", function (error, stdout, stderr) {
    if (error) {
        console.error(stderr)
        process.exit(1);
    }

    exec("mv pdoc.js ./lib/cannolo/plugins/parsers/pdoc/pdoc.js", function (error, stdout, stderr) {
	    if (error) {
	        console.error(stderr)
	        process.exit(1);
	    }
	});
});