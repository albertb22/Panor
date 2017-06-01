$(document).ready(function() {
	$('.panor').panor({
		'http://panor.dev/demo': {},
		'http://panor.dev/demo/overview.html': {
			'http://panor.dev/demo/content.html': {
				'http://panor.dev/demo/content2.html': {}
			},
			'http://panor.dev/demo/content1.html': {}
		}, 
		'http://panor.dev/demo/contact.html': {}
	}, {
		showMenu: true
	});
});