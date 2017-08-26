const diceFaces = [
	"https://bit.ly/dice-unknown",
	"https://bit.ly/dice-one",
	"https://bit.ly/dice-two",
	"https://bit.ly/dice-three",
	"https://bit.ly/dice-four",
	"https://bit.ly/dice-five",
	"https://bit.ly/dice-six"
];

$(document).ready(() => {

	$('.button').click(() => {
		$('#status').text('Loading...');
		$('#dice').addClass('spin');

		setTimeout(() => $('#dice').removeClass('spin'), 500);

		$.get('/getNewNumber').done((response) => {
			console.log(response.number);

			$('#dice').attr('src', diceFaces[response.number]);

			let postText = 'You WIN!'

			if (response.number <= 3) {
				postText = 'You LOSE!'
			}

			$('#status').text(`You rolled a ${response.number}. ${postText}`);
		});

	});

});