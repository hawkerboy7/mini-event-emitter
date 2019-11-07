require('de-builder')({
	"less": {
		"enabled": false
	},
	"forever": {
		"enabled": false
	},
	"browserSync": {
		"enabled": false
	}
});


// require('de-builder')({
// 	"src": "src",
// 	"build": "build",
// 	"client": "client",
// 	"server": "server",
// 	"less": {
// 		"file": "app.css",
// 		"entry": "app.less",
// 		"folder": "styles"
// 	},
// 	"browserify": {
// 		"single": {
// 			"entry": "app.coffee",
// 			"bundle": "app.bundle.js"
// 		},
// 		"multi": "bundle.js",
// 		"debug": true,
// 		"folder": "js"
// 	},
// 	"forever": {
// 		"entry": "app.js",
// 		"enabled": true
// 	},
// 	"browserSync": {
// 		"enabled": true,
// 		"ui": 9000,
// 		"server": 9001,
// 		"multi": [
// 			"vendor"
// 		]
// 	},
// 	"type": 1,
// 	"debug": false
// });

