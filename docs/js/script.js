$(document).ready(function() {
	$('.panor').panor({
		'https://albertb22.github.io/Panor/': {},
		'https://albertb22.github.io/Panor/overview.html': {
			'https://albertb22.github.io/Panor/content.html': {
				'https://albertb22.github.io/Panor/content2.html': {}
			},
			'https://albertb22.github.io/Panor/content1.html': {}
		}, 
		'https://albertb22.github.io/Panor/contact.html': {}
	}, {
		showMenu: true
	});
});
