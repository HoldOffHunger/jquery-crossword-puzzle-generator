100% JQuery Crossword Puzzle Generator and Game

Demo:

http://www.earthfluent.com/crossword-puzzle-demo.html

Example Usage:

	$(document).ready(function(event) {
		var puzzlewords = [
				// word, clue
			['Incomplete', 'Some of us are always meant to be this.'],
			['Ecosystem', 'Any system where life can grow and thrive.'],
			// ... etc..
		];
		crosswordPuzzle(puzzlewords);
	});
