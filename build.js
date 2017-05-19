require("../../opensource/de-builder")({
	io: 8002,
	forever: {
		entry   : "test.js",
		enabled : true
	},
	type: 2
});
