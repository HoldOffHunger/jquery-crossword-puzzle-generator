// Author: HoldOffHunger
// License: BSD 3-Clause

			// Set Globals
			// --------------------------------------------
			
var crosswordclues = [];

			// Set Randomization Configs
			// --------------------------------------------

	/* areWeInGodMode()
		
		Turn on to show the crossword puzzle completed, which makes debugging and coding much easier.
		
	*/

function areWeInGodMode() {
	return false;
	return true;
}

	/* areWeRandomizingPuzzleWords()
	
		On/off switch for determining whether we randomize the puzzle words themselves (to increase the randomness of the overall resultant crossword puzzle).
	
	*/

function areWeRandomizingPuzzleWords() {
	return true;
}

	/* areWeRandomizingPuzzlePieces
	
		On/off switch for determining whether we are randomizing the puzzle pieces themselves, similarly to increase randomness.
	
	*/

function areWeRandomizingPuzzlePieces() {
	return true;
}

	/* areWeRandomizingAcrossDownChoices()
	
		On/off switch for determining if we are randomizing "spine" words from being either across or down.
	
	*/

function areWeRandomizingAcrossDownChoices() {
	return true;
}

	/* areWeRandomizingAcrossDownLists()
	
		On/off switch for determining if we randomize choices of the across and down phrase lists.
	
	*/

function areWeRandomizingAcrossDownLists() {
	return true;
}

			// Main()
			// --------------------------------------------

	/* crosswordPuzzle(puzzlewords)
	
		Main function that receives the list of puzzlewords and then displays the crossword puzzle itself.
	
	*/

function crosswordPuzzle(puzzlewords) {
	var wordcount = puzzlewords.length;
	
	if(!puzzlewords || !wordcount) {
		console.log("Developer Error : Did you forget to load words?");
		return false;
	}
	
	if(areWeRandomizingPuzzleWords()) {
		puzzlewords = shuffle(puzzlewords);
	}
	
	var crosswords = generateCrosswordBlockSources(puzzlewords);
	
	var crosswordblocks = crosswords['blocks'];
	var crosswordclues = crosswords['clues'];
	
	var graphs = buildCrosswordBlocks(crosswordblocks);
	graphs = compactCrosswordBlockSources(graphs);
	
	if(areWeRandomizingPuzzlePieces()) {
		graphs = shuffle(graphs);
	}
	
	if(!graphs || !graphs.length) {
		console.log("Developer Error : Your words could not be made into graphs.");
		return false;
	}
	
	var fullgraph = buildCrosswordBlockGraphs(graphs);
	var wordlists = buildCrosswordLists(fullgraph['matrixpositions']);
	
	showCrossWordPuzzle(fullgraph['matrix']);
	showCrossWordLists(wordlists, crosswordclues);
	showCrossWordOptions();
	
	return true;
}

			// User Form Actions
			// --------------------------------------------

	/* showCrossWordOptions()
	
		Show the crossword puzzle and the lists.
	
	*/

function showCrossWordOptions() {
		/* solvefunction()
		
			User clicked the "solve" button for a phrase on the across or down list. Provide a prompt for solving the clue.
		
		*/
		
	var solvefunction = function() {
		$('#solution-answer').val('');
		$('#answer-results').hide();
		$('#answer-results').html('');
		
		var word = $(this).attr('data-word');
		var acrosstext = $(this).attr('data-across') == 'false' ? 'Down' : 'Across';
		$('#position-and-clue').html('<b>' + acrosstext + '</b> : ' + $(this).attr('data-clue'));
		$('#answer-form').show();
		
		if($(this).children('span').attr('data-solved')) {
			$('#answer-button').attr('disabled', true);
			$('#reveal-answer-button').attr('disabled', true);
			
			$('#answer-results').show();
			$('#answer-results').html('You have already solved this problem.');
			
			$('#solution-answer').val(word);
		} else {
			$('#solution-answer').attr('maxlength', word.length);
			
			$('#answer-button').attr('data-word', word);
			$('#reveal-answer-button').attr('data-word', word);
			
			var datax = $(this).attr('data-x');
			
			$('#answer-button').attr('data-x', datax);
			$('#reveal-answer-button').attr('data-x', datax);
			
			var datay = $(this).attr('data-y');
			
			$('#answer-button').attr('data-y', datay);
			$('#reveal-answer-button').attr('data-y', datay);
			
			var across = $(this).attr('data-across');
			
			$('#answer-button').attr('data-across', across);
			$('#reveal-answer-button').attr('data-across', across);
			
			$('#solution-answer').focus();
			
			$('#answer-button').attr('disabled', false);
			$('#reveal-answer-button').attr('disabled', false);
		}
		
		return false;
	}
	
		/* closesolvefunction()
		
			User clicked "close" on the "solve phrase" dialogue that was brought up by solvefunction().
		
		*/
	
	var closesolvefunction = function() {
		$('#answer-results').hide();
		$('#answer-form').hide();
		return false;
	}
	
		/* answerfunction()
		
			User clicked "answer" on the "solve phrase" dialogue that was brought up by solvefunction().
		
		*/
	
	var answerfunction = function() {
		var word = $(this).attr('data-word');
		var answer = $('#solution-answer').val().toLowerCase();
		
		if(answer == word) {
			var across = $(this).attr('data-across');
			
			var x = parseInt($(this).attr('data-x'), 10);
			var y = parseInt($(this).attr('data-y'), 10);
			
			if(across && across != 'false') {
				for(var i = 0; i < answer.length; i++) {
					var newheight = y + i ;
					var letterposition = 'letter-position-' + x + '-' + newheight;
					$('#' + letterposition).text(answer[i]);
				}
			} else {
				for(var i = 0; i < answer.length; i++) {
					var newwidth = x + i ;
					var letterposition = 'letter-position-' + newwidth + '-' + y;
					$('#' + letterposition).text(answer[i]);
				}
			}
			
			$('#' + word + '-listing').addClass('strikeout');
			$('#' + word + '-listing').attr('data-solved', true);
			
			$('#answer-form').hide();
		} else {
			if(!$('#answer-results').is(':visible')) {
				$('#answer-results').show();
				$('#answer-results').html('Incorrect Answer, Please Try Again');
			}
		}
		
		return false;
	}
	
		/* revealanswerfunction()
		
			User clicked "reveal answer" on the "solve phrase" dialogue that was brought up by solvefunction().
		
		*/
	
	var revealanswerfunction = function() {
		var word = $(this).attr('data-word');
		var across = $(this).attr('data-across');
		
		var x = parseInt($(this).attr('data-x'), 10);
		var y = parseInt($(this).attr('data-y'), 10);
		
		if(across && across != 'false') {
			for(var i = 0; i < word.length; i++) {
				var newheight = y + i ;
				var letterposition = 'letter-position-' + x + '-' + newheight;
				$('#' + letterposition).text(word[i]);
			}
		} else {
			for(var i = 0; i < word.length; i++) {
				var newwidth = x + i ;
				var letterposition = 'letter-position-' + newwidth + '-' + y;
				$('#' + letterposition).text(word[i]);
			}
		}
		
		$('#' + word + '-listing').addClass('red-strikeout');
		$('#' + word + '-listing').attr('data-solved', true);
		
		$('#answer-form').hide();
	}
	
	$('.word-clue').click(solvefunction);
	$('#cancel-button').click(closesolvefunction);
	$('#answer-button').click(answerfunction);
	$('#reveal-answer-button').click(revealanswerfunction);
}

			// Show Crossword Lists
			// --------------------------------------------

	/* showCrossWordLists(wordlists, clues)
	
		Fill in the numbers for the crossword puzzle and then display the lists of words associated with those numbers.
	
	*/

function showCrossWordLists(wordlists, clues) {
	var acrosslist = wordlists['across'];
	var downlist = wordlists['down'];
	
	if(areWeRandomizingAcrossDownLists()) {
		acrosslist = shuffle(acrosslist);
		downlist = shuffle(downlist);
	}
	
	var acrosslistordered = fillInCrossWordNumbers(acrosslist);
	var downlistordered = fillInCrossWordNumbers(downlist, acrosslist, acrosslistordered);
	
	var acrosslistorderedelement = getViewableCrossWordList(acrosslistordered, clues, true);
	var downlistorderedelement = getViewableCrossWordList(downlistordered, clues, false);
	
	$('#left-list').append(acrosslistorderedelement);
	$('#right-list').append(downlistorderedelement);
}

	/* getViewableCrossWordList(listitems, clues, across)
	
		Get a single crossword list, which may be used for either across or down lists.
	
	*/

function getViewableCrossWordList(listitems, clues, across) {
	var numbers = Object.keys(listitems);
	
	var element = '<ul>';
	
	for(var i = 0; i < numbers.length; i++) {
		var number = numbers[i];
		var wordinfo = listitems[number];
		var word = wordinfo['word'];
		var coordinates = wordinfo['coordinates'];
		var clue = clues[word];
		
		element += '<li ';
		element += 'data-word="' + word.replace(/"/g, '&quot;') + '" ';
		element += 'data-clue="' + clue.replace(/"/g, '&quot;') + '" ';
		element += 'data-x="' + coordinates[0] + '" ';
		element += 'data-y="' + coordinates[1] + '" ';
		element += 'data-across="' + across + '" ';
		element += 'class="word-clue clickable" ';
		element += '>';
		element += number + ' : ' ;
		element += '<span id="';
		element += word + '-listing';
		element += '" ';
		element += 'class="linkable">';
		element += clue;
		element += '</span>';
		element += '</li>';
	}
	
	element += '</ul>';
	
	return element;
}

	/* fillInCrossWordNumbers(listitems, blockitems, blockitemsordered)
	
		Fill in the numbers in the crossword puzzle boxes that are each individually associated with a particular clue from the across or down lists.
	
	*/

function fillInCrossWordNumbers(listitems, blockitems, blockitemsordered) {
	var orderedlist = [];
	var listnumber = 0;
	for(var i = 0; i < listitems.length; i++) {
		listnumber++;
		
		var listitem = listitems[i];
		var word = listitem['word'];
		var coordinates = listitem['position'];
		
		var blockingitemnumber = getBlockingItemNumber(coordinates, blockitems, blockitemsordered);
		
		fillnumber = listnumber;
		if(blockingitemnumber) {
			fillnumber = blockingitemnumber;
		}
		
		var element = '<div class="background-text"><span class="crossword-grid-cell-number">' + fillnumber + '</span></div>';
		
		var parentelement;
		
		parentelement = $('#cell-position-' + coordinates[0] + '-' + coordinates[1]);
		
		if(parentelement && $(parentelement).attr('id')) {
			$(parentelement).prepend(element);
		}
		
		orderedlist[listnumber] = {
			'word':word,
			'coordinates':coordinates,
		};
	}
	
	return orderedlist;
}

	/* getBlockingItemNumber(coordinates, blockitems, blockitemsordered)
	
		It is possible for a grid cell to be the start position for one item from the across list and one item from the down list. In this case, a "blocking number" is already assigned to the grid cell. We resolve this by placing the number on the opposite side in the cell, so all cells have a number in the top-left corner, but this one has a number in the top-left and the top-right.
	
	*/

function getBlockingItemNumber(coordinates, blockitems, blockitemsordered) {
	if(!blockitems || !blockitems.length || !blockitemsordered || !blockitemsordered.length) {
		return false;
	}
	for (var i = 0; i < blockitems.length; i++) {
		var blockitem = blockitems[i];
		
		var blockcoordinates = blockitem['position'];
		
		if(blockcoordinates[0] == coordinates[0] && blockcoordinates[1] == coordinates[1]) {
			return getBlockItemNumberPosition(blockitem['word'], blockitemsordered);
		}
	}
	
	return false;
}

	/* getBlockItemNumberPosition(word, items)
	
		This returns the number position of the blocking item.
	
	*/

function getBlockItemNumberPosition(word, items) {
	var itemkeys = Object.keys(items);
	
	for(var i = 0; i < itemkeys.length; i++) {
		var itemkey = itemkeys[i];
		
		var itemword = items[itemkey];
		
		if(itemword.word == word) {
			return itemkey;
		}
	}
}

			// Show Crossword Puzzle
			// --------------------------------------------

	/* showCrossWordPuzzle(matrix)
	
		Show the crossword puzzle itself. Only display the answers if we are in god mode.
	
	*/

function showCrossWordPuzzle(matrix) {
	var widestline = getWidestLine(matrix);
	var tallestline = getTallestLine(matrix);
	
	var table = $('<table class="puzzle" border="1" cellpadding="0" cellspacing="0"></table>');
	
	for(var i = 0; i < tallestline; i++) {
		var tablerow = '<tr class="letter-row">';
		
		for(var j = 0; j < widestline; j++) {
			var cellclass = 'letter-cell';
			
			if(!matrix[i][j] || matrix[i][j] == ' ') {
				cellclass += ' blank-cell';
				
			}
			tablerow += '<td id="cell-position-' + i + '-' + j + '" class="relative-position ' + cellclass + '">';
			
			tablerow += '<span class="letter-text" id="letter-position-' + i + '-' + j + '">';
			
			if(areWeInGodMode() && matrix[i][j] && matrix[i][j] != ' ') {
				tablerow += matrix[i][j];
			}
			
			tablerow += '</span>';
			
			tablerow += '</td>';
		}
		
		tablerow += '</tr>';
		
		$(table).append(tablerow);
	}
	
	$('#root').append(table);
	
	return true;
}

	/* buildCrosswordLists(matrixpositions)
	
		From the crossword puzzle, build the lists of across and down.
	
	*/

function buildCrosswordLists(matrixpositions) {
	var acrosslist = [];
	var downlist = [];
	
	for(var i = 0; i < matrixpositions.length; i++) {
		var matrixposition = matrixpositions[i];
		
		var across = matrixposition['across'];
		var word = matrixposition['word'];
		var positions = matrixposition['matrixpositions'];
		
		var primaryelement = {
			'word':word,
			'position':positions[word],
		}
		
		delete positions[word];
		if(across) {
			if(word != '(unmatched)') {
				acrosslist.push(primaryelement);
			}
			downlist = buildCrosswordList(downlist, positions);
		} else {
			if(word != '(unmatched)') {
				downlist.push(primaryelement);
			}
			acrosslist = buildCrosswordList(acrosslist, positions);
		}
	}
	
	return {
		'across':acrosslist,
		'down':downlist,
	};
}

	/* buildCrosswordList(list, positions)
	
		Build a single crossword list, either for across or down.
	
	*/

function buildCrosswordList(list, positions) {
	var matrixpositionwords = Object.keys(positions);
	
	for(var i = 0; i < matrixpositionwords.length; i++) {
		var matrixpositionword = matrixpositionwords[i];
		
		var coordinates = positions[matrixpositionword];
		
		list.push({
			'word':matrixpositionword,
			'position':coordinates,
		});
	}
	
	return list;
}

			// Build Crossword
			// --------------------------------------------

	/* buildCrosswordBlockGraphs(graphs)
	
		Given groups of words, each with a "spine" word, assemble these into a single crossword puzzle block graph.
	
	*/

function buildCrosswordBlockGraphs(graphs) {
	var firstgraph = graphs.shift();
	
	var fullmatrix = firstgraph['matrix'];
	var fullmatrixpositions = [{
		'matrixpositions':firstgraph['matrixpositions'],
		'across':firstgraph['across'],
		'word':firstgraph['word'],
	}];
	
	for(var i = 0; i < graphs.length; i++) {
		var graph = graphs[i];
		
		var matrix = graph['matrix'];
		var matrixpositions = graph['matrixpositions'];
		var across = graph['across'];
		var word = graph['word'];
		
		console.log("BT: BUILD BLOCK GRAPH...|" + i + "|" + word + "|");
		console.info(matrixpositions);
		
		var widestline = getWidestLine(fullmatrix);
		var tallestline = getTallestLine(fullmatrix);
		
		var buildvertically = checkToBuildVertically(fullmatrix, matrix, widestline, tallestline);
		var built = false;
		
		if(!buildvertically) {
						// I AM LEAF!!!
			var possiblefullmatrixsolution = false;
			var possiblefullmatrixcoordinates = [];
			var shortestlinelength = 99999999;
			
			for(var j = 0; j < fullmatrix.length; j++) {
				var trimmedfullmatrixline = rtrim(fullmatrix[j]);
				if(trimmedfullmatrixline.length > 0 && trimmedfullmatrixline.length < shortestlinelength) {
					var solutioncoordinates = [trimmedfullmatrixline.length,j + i];
					var newerpossiblefullmatrixsolution = joinHorizontalMatrices(fullmatrix, matrix, solutioncoordinates);
					if(newerpossiblefullmatrixsolution) {
						shortestlinelength = getThinnestLine(newerpossiblefullmatrixsolution);
						possiblefullmatrixsolution = newerpossiblefullmatrixsolution;
						possiblefullmatrixcoordinates = solutioncoordinates;
						
						canmutate = true;
						var leftpushback = 1;
						
						while(canmutate && (trimmedfullmatrixline.length - leftpushback) >= 0) {
							console.log("BT: Across ALPHA.");
							solutioncoordinates = [trimmedfullmatrixline.length - leftpushback,j + i];
							var newestpossiblefullmatrixsolution = joinHorizontalMatrices(fullmatrix, matrix, solutioncoordinates);
							if(newestpossiblefullmatrixsolution) {
								shortestlinelength = getThinnestLine(newestpossiblefullmatrixsolution);
								possiblefullmatrixsolution = newestpossiblefullmatrixsolution;
								possiblefullmatrixcoordinates = solutioncoordinates;
								leftpushback++;
							} else {
								canmutate = false;
								leftpushback--;
							}
						}
						
						var toppushback = 1;
						
						while((j + i) - toppushback > 0) {
							solutioncoordinates = [trimmedfullmatrixline.length - leftpushback,(j + i) - toppushback];
							var newestpossiblefullmatrixsolution = joinHorizontalMatrices(fullmatrix, matrix, solutioncoordinates);
							if(newestpossiblefullmatrixsolution) {
								shortestlinelength = getThinnestLine(newestpossiblefullmatrixsolution);
								possiblefullmatrixsolution = newestpossiblefullmatrixsolution;
								possiblefullmatrixcoordinates = solutioncoordinates;
							}
							
							toppushback++;
						}
						
						toppushback--;
						
						canmutate = true;
						var leftpushback = 1;
						
						while(canmutate && (trimmedfullmatrixline.length - leftpushback) >= 0) {
							solutioncoordinates = [trimmedfullmatrixline.length - leftpushback,j + i - toppushback];
							var newestpossiblefullmatrixsolution = joinHorizontalMatrices(fullmatrix, matrix, solutioncoordinates);
							if(newestpossiblefullmatrixsolution) {
								shortestlinelength = getThinnestLine(newestpossiblefullmatrixsolution);
								possiblefullmatrixsolution = newestpossiblefullmatrixsolution;
								possiblefullmatrixcoordinates = solutioncoordinates;
								leftpushback++;
							} else {
								canmutate = false;
								leftpushback--;
							}
						}
					}
				}
			}
			
			if(possiblefullmatrixsolution) {
				fullmatrix = possiblefullmatrixsolution;
				console.info(matrixpositions);
				matrixpositions = interpolateMatrixPositions(matrixpositions, [possiblefullmatrixcoordinates[1], possiblefullmatrixcoordinates[0]]);
				fullmatrixpositions.push({
					'matrixpositions':matrixpositions,
					'across':across,
					'word':word,
				});
				built = true;
			}
		}
		
		if(buildvertically || !built) {
				console.log("BT: Vertical ALPHA.");
						// AND I AM TWIG!!!
			var oldlength = fullmatrix.length;
			fullmatrixbottom = fullmatrix[fullmatrix.length - 1];
			for(var j = 0; j < widestline; j++) {
				var smallmatrixtop = matrix[0];
				if(nonConflictingRows(fullmatrixbottom, smallmatrixtop)) {
					fullmatrix = joinVerticalMatrices(fullmatrix, matrix);
					solutioncoordinates = [oldlength, j];
					matrixpositions = interpolateMatrixPositions(matrixpositions, solutioncoordinates);
					fullmatrixpositions.push({
						'matrixpositions':matrixpositions,
						'across':across,
						'word':word,
					});
					j = widestline;
					built = true;
				} else {
					matrix = incrementMatrixHorizontally(matrix);
				}
			}
			
			if(!built) {
				viewPuzzle(matrix);

				solutioncoordinates = [fullmatrix.length + 1, 0];
				matrix = compactCrosswordBlockSource({'matrix':matrix})['matrix'];
				fullmatrix.push('');
				fullmatrix = joinVerticalMatrices(fullmatrix, matrix);

				matrixpositions = interpolateMatrixPositions(matrixpositions, solutioncoordinates);

				console.info(matrixpositions);
				fullmatrixpositions.push({
					'matrixpositions':matrixpositions,
					'across':across,
					'word':word,
				});
			}
		}
		
		fullmatrix = compactCrosswordBlockSource({'matrix':fullmatrix})['matrix'];
	}
	
	var fullgraph = {
		'matrix':fullmatrix,
		'matrixpositions':fullmatrixpositions,
	};
	
	return fullgraph;
}

	/* interpolateMatrixPositions(matrixpositions, coordinates, word)
	
		Shift the entire matrix of crossword puzzle words by some coordinates. For example, move each row up by 1 and left by 5, which would retain the relationship among the words, since they are all moved by the same amount and in the same directions.
	
	*/

function interpolateMatrixPositions(matrixpositions, coordinates, word) {
	var matrixpositionwords = Object.keys(matrixpositions);
	
	for(var i = 0; i < matrixpositionwords.length; i++) {
		var matrixpositionword = matrixpositionwords[i];
		var matrixpositioncoordinates = matrixpositions[matrixpositionword];
		matrixpositioncoordinates[0] += coordinates[0];
		matrixpositioncoordinates[1] += coordinates[1];
	}
	
	return matrixpositions;
}

	/* viewPuzzle(puzzle)
	
		Debugging tool to view the puzzle.
	
	*/

function viewPuzzle(puzzle) {
	console.log("Viewing puzzle from...|" + arguments.callee.caller.name + "|");
	console.info(JSON.stringify(puzzle).replace(/,/g, ",\n"));
}

	/* rtrim(string)
	
		Right-trim a string.
		
	*/

function rtrim(string) {
	if(!string) {
		return "";
	}
	return string.replace(/\s+$/, '');
}

	/* joinHorizontalMatrices(fullmatrix, matrix, coordinates)
	
		Given two matrices of crossword puzzle graphs, join them horizontally.
	
	*/

function joinHorizontalMatrices(fullmatrix, matrix, coordinates) {
	if(coordinates[0] == 0 || coordinates[1] == 0) {
		return false;
	}
	originalfullmatrix = fullmatrix;
	var maxheight = fullmatrix.length + matrix.length;
	fullmatrix = fullmatrix.slice();
	for(var i = 0; i < matrix.length; i++) {
		var line = matrix[i];
		
		for(var j = 0; j < line.length; j++) {
			var x = coordinates[0];
			var y = coordinates[1];
								
			x += j;
			y += i;
			
			if(!fullmatrix[y]) {
				fullmatrix[y] = "";
			}
			
			if(fullmatrix[y] && fullmatrix[y][x] && fullmatrix[y][x] != ' ' && matrix[i][j] != ' ') {
				return false;
			} else {
				if(matrix[i][j] != ' ') {
					if(originalfullmatrix[y - 1] && originalfullmatrix[y - 1][x] && originalfullmatrix[y - 1][x] != ' ') {
						return false;
					}
					
					if(originalfullmatrix[y + 1] && originalfullmatrix[y + 1][x] && originalfullmatrix[y + 1][x] != ' ') {
						return false;
					}
					
					if(originalfullmatrix[y] && originalfullmatrix[y][x - 1] && originalfullmatrix[y][x - 1] != ' ') {
						return false;
					}
					
					if(originalfullmatrix[y] && originalfullmatrix[y][x + 1] && originalfullmatrix[y][x + 1] != ' ') {
						return false;
					}
				}
			}
			
			while(!fullmatrix[y][x]) {
				fullmatrix[y] += ' ';
			}
			if(matrix[i][j] != ' ') {
				fullmatrix[y] = insertLetterAtStringPosition(matrix[i][j], fullmatrix[y], x);
			}
		}
	}
	
	return fullmatrix;
}

	/* joinVerticalMatrices(bigmatrix, smallmatrix)
	
		Given two matrices of crossword puzzle graphs, join them vertically.
	
	*/

function joinVerticalMatrices(bigmatrix, smallmatrix) {
	var height = bigmatrix.length;
	
	for(var i = 0; i < smallmatrix.length; i++) {
		bigmatrix[height + i] = smallmatrix[i];
	}
	
	return bigmatrix;
}

	/* nonConflictingRows(toprow, bottomrow)
		
		Are these two rows without conflicts between each other? A conflict is when one of the words from one row touch the words of another row (which breaks the crossword puzzle rule that only corners and edges may be the origin of a word, and never the center of the grid block).
		
	*/

function nonConflictingRows(toprow, bottomrow) {
	var rowtocheck;
	
	if(toprow[bottomrow.length] && toprow[bottomrow.length] == ' ') {
		return false;
	}
	
	if(toprow.length > bottomrow.length) {
		rowtocheck = bottomrow;
		altrowtocheck = toprow;
	} else {
		rowtocheck = toprow;
		altrowtocheck = bottomrow;
	}
	
	for(var i = 0; i < rowtocheck.length; i++) {
		if(rowtocheck[i] && altrowtocheck[i]) {
			if(rowtocheck[i] != ' ' && altrowtocheck[i] != ' ') {
				return false;
			}
		}
	}
	
	return true;
}

	/* incrementMatrixHorizontally(matrix)
	
		Add another blank column to the crossword puzzle grid.
	
	*/

function incrementMatrixHorizontally(matrix) {
	for(var i = 0; i < matrix.length; i++) {
		matrix[i] = ' ' + matrix[i];
	}
	
	return matrix;
}

	/* checkToBuildVertically(matrix, smallmatrix, widestline, tallestline)
	
		Should we build vertically? We should do so if the crossword puzzle is wider than it is taller, which will give us the most compact crossword puzzle possibility.
	
	*/

function checkToBuildVertically(matrix, smallmatrix, widestline, tallestline) {
	if(matrix.length <= smallmatrix.length) {
		return true;
	} else if(tallestline < widestline) {
		return true;
	} else if(widestline < tallestline) {
		return false;
	}	
	
	return randomTrueFalse();
}

	/* randomTrueFalse()
	
		Random yes/no generator.
	
	*/

function randomTrueFalse() {
	return Math.random() > 0.5 ? true : false;
}

	/* getWidestLine(matrix)
	
		Given a matrix, returns the widest line.
	
	*/

function getWidestLine(matrix) {
	var widestlength = 0;
	
	for(var i = 0; i < matrix.length; i++) {
		var row = matrix[i];
		if(row && row.length && row.length > widestlength) {
			widestlength = row.length;
		}
	}
	
	return widestlength;
}

	/* getThinnestLine(matrix)
	
		Given a matrix, returns the thinnest line. This is the line with the most amount of black space to its right.
	
	*/

function getThinnestLine(matrix) {
	var thinnestlength = 999999;
	
	for(var i = 0; i < matrix.length; i++) {
		var row = matrix[i];
		if(row && row.length < thinnestlength) {
			thinnestlength = row.length;
		}
	}
	
	return thinnestlength;
}

	/* getTallestLine(matrix)
	
		Given a matrix, return the tallest line. This is the line with the least amount of blank space below it.
	
	*/

function getTallestLine(matrix) {
	return matrix.length;
}

	/* buildCrosswordBlocks(crosswordblocks)
	
		Build groups of words, each with one spine word.
	
	*/

function buildCrosswordBlocks(crosswordblocks) {
	var graphs = [];
	var lastacross = false;
	
	for (var word in crosswordblocks) {
		if (!crosswordblocks.hasOwnProperty(word) || word == '(unmatched)') continue;
		
		var subwords = crosswordblocks[word];
		var longestwordlength = getLongestWordLength(subwords);
		
		var across = true;
		
		if(areWeRandomizingAcrossDownChoices()) {
			across = randomTrueFalse();
		}
		
		var matrix = [];
		var matrixpositions = [];
		
		if(across) {
			matrix[longestwordlength - 1] = word;
			matrixpositions[word] = [longestwordlength - 1, 0];
			
			for(var i = 0; i < subwords.length; i++) {
				var subwordentry = subwords[i];
				
				var subword = subwordentry[0];
				var subletter = subwordentry[1];
				
				var matchingposition = findMatchingLetterMatrixPosition(matrix, word, subletter, longestwordlength - 2);
				var matchingoffset = findMatchingOffset(subword, subletter);
				matrixpositions[subword] = [longestwordlength - matchingoffset - 1, matchingposition];
				matrix = setLetterMatrixVertically(matrix, subword, longestwordlength - matchingoffset - 1, matchingposition);
			}
		} else {
			matrix = fillLetterMatrixVertically(matrix, word, longestwordlength + 1, 0);
			matrixpositions[word] = [0, longestwordlength];
			
			for(var i = 0; i < subwords.length; i++) {
				var subwordentry = subwords[i];
				
				var subword = subwordentry[0];
				var subletter = subwordentry[1];
				var matchingposition = findMatchingLetterMatrixPositionVertical(matrix, word, subletter, longestwordlength - 1);
				var matchingoffset = findMatchingOffset(subword, subletter);
				matrixpositions[subword] = [matchingposition, longestwordlength - matchingoffset];
				matrix = setLetterMatrixHorizontally(matrix, subword, matchingposition, longestwordlength - matchingoffset);
			}
		}
		var graph = {
			'matrix':matrix,
			'matrixpositions':matrixpositions,
			'across':across,
			'word':word,
		};
		
		graphs.push(graph);
	}
	
	if(crosswordblocks['(unmatched)']) {
		var graph = buildUnassignedCrosswordBlock(crosswordblocks['(unmatched)']);
		graphs.push(graph);
	}
	
	return graphs;
}

	/* buildUnassignedCrosswordBlock(unmatchedcrosswords)
		
		At the end of making our groups of words with spine words, we have smoe that could not be matched at all. Group these together as a block.
		
	*/

function buildUnassignedCrosswordBlock(unmatchedcrosswords) {
	var across = true;
	
	if(areWeRandomizingAcrossDownChoices()) {
		across = randomTrueFalse();
	}
	
	var longestwordlength = getLongestWordLength(unmatchedcrosswords);
	
	var matrix = [];
	var matrixpositions = [];
	
	if(across) {
		for(var i = 0; i < unmatchedcrosswords.length; i++) {
			var unmatchedcrossword = unmatchedcrosswords[i];
			matrix[i] = unmatchedcrossword;
			matrixpositions[unmatchedcrossword] = [0,i];
		}
	} else {
		for(var i = 0; i < unmatchedcrosswords.length; i++) {
			var unmatchedcrossword = unmatchedcrosswords[i];
			matrix = setLetterMatrixVertically(matrix, unmatchedcrossword, 0, i);
			matrixpositions[unmatchedcrossword] = [i,0];
		}
	}
	
	var graph = {
		'matrix':matrix,
		'matrixpositions':matrixpositions,
		'across':!across,
		'word':'(unmatched)',
	};
	
	return graph;
}

	/* insertLetterAtStringPosition(letter, string, position)
		
		Arrays are immutable within JavaScript. So, this method allows us to edit strings by inserting letters at positions.
		
	*/

function insertLetterAtStringPosition(letter, string, position) {
	if(!letter) {
		letter = ' ';
	}
	return string.substr(0, position) + letter + string.substr(position + 1);
}

	/* setLetterMatrixHorizontally(matrix, word, y, x)
	
		Build a graph from a group of words horizontally.
	
	*/

function setLetterMatrixHorizontally(matrix, word, y, x) {
	for(var i = 0; i < word.length; i++) {
		var position = i + x;
		if(!matrix[y]) {
			matrix[y] = '';
		}
		letters = matrix[y];
		
		if(letters.length < position) {
			while(letters.length < position) {
				letters += ' ';
			}
			letters += word[i];
		} else {
			letters = insertLetterAtStringPosition(word[i], letters, position);
		}
		
		matrix[y] = letters;
	}
	return matrix;
}

	/* setLetterMatrixVertically(matrix, word, y, x)
		
		Build a group from a group of words vertically.
		
	*/

function setLetterMatrixVertically(matrix, word, y, x) {
	for(var i = 0; i < word.length; i++) {
		var position = i + y;
		if(!matrix[position]) {
			matrix[position] = '';
		}
		letters = matrix[position];
		
		if(letters.length < x) {
			while(letters.length < x) {
				letters += ' ';
			}
			
			letters += word[i];
		} else {
			letters = insertLetterAtStringPosition(word[i], letters, x);
		}
		
		matrix[position] = letters;
	}
	return matrix;
}

	/* findMatchingOffset(word, letter)
	
		Find the position of a letter in a word.
	
	*/

function findMatchingOffset(word, letter) {
	for(var i = 0; i < word.length; i++) {
		if(word[i] == letter) {
			return i;
		}
	}
	return false;
}

	/* findMatchingLetterMatrixPositionVertical(matrix, word, subletter, index)
	
		Find the vertical position of a letter.
	
	*/

function findMatchingLetterMatrixPositionVertical(matrix, word, subletter, index) {
	for(var i = 0; i < word.length; i++) {
		var letter = word[i];
		if(!matrix[i]) {
			matrix[i] = '';
		}
		
		if(subletter == letter && (!matrix[i][index] || matrix[i][index] == ' ') && (!matrix[i][index + 2] || matrix[i][index + 2] == ' ')) {
			return i;
		}
	}
	return false;
}

	/* findMatchingLetterMatrixPosition(matrix, word, subletter, index)
	
		Find the horizontal position of a letter.
	
	*/

function findMatchingLetterMatrixPosition(matrix, word, subletter, index) {
	for(var i = 0; i < word.length; i++) {
		var letter = word[i];
		if(!matrix[index]) {
			matrix[index] = '';
		}
		if(subletter == letter && (!matrix[index][i] || matrix[index][i] == ' ') && (!matrix[index + 2] || !matrix[index + 2][i] || matrix[index + 2][i] == ' ')) {
			return i;
		}
	}
	return false;
}

	/* fillLetterMatrixVertically(matrix, word, index)
	
		Fill a matrix with the appropriate amount of white space to make it into a perfect rectangular block.
	
	*/

function fillLetterMatrixVertically(matrix, word, index) {
	var spacing = Array(index).join(" ");
	for(var i = 0; i < word.length; i++) {
		matrix[i] = spacing + word[i];
	}
	return matrix;
}

	/* buildUnmatchedBlock(unmatchedblock)
	
		Compose the unmatched block. Since nothing matches, there's nothing to build here.
	
	*/

function buildUnmatchedBlock(unmatchedblock) {
	return unmatchedblock;
}

	/* getLongestWordLength(words)
	
		Get the length of the longest word.
	
	*/

function getLongestWordLength(words) {
	var length = 0;
	
	for(var i = 0; i < words.length; i++) {
		var word = words[i];
		var wordlength = word[0].length;
		if(wordlength > length) {
			length = wordlength;
		}
	}
	
	return length;
}

	/* compactCrosswordBlockSources(graphs)
	
		Compact the graphs that will be used to make the full crossword puzzle graph.
	
	*/

function compactCrosswordBlockSources(graphs) {
	for(var i = 0; i < graphs.length; i++) {
		var graph = graphs[i];
		
		var matrix = graph['matrix'];
		
		graph = compactCrosswordBlockSource(graph);
		
		graphs[i] = graph;
	}
	return graphs;
}

	/* compactCrosswordBlockSource(graph)
	
		Compact a single crossword block source graph.
	
	*/

function compactCrosswordBlockSource(graph) {
	graph = compactCrosswordBlockBottom(graph);
	graph = compactCrosswordBlockTop(graph);
	graph = compactCrosswordBlockLeft(graph);
	graph = compactCrosswordBlockRight(graph);
	return graph;
}

	/* compactCrosswordBlockTop(graph)
	
		Compact the crossword block from the top.
	
	*/

function compactCrosswordBlockTop(graph) {
	var crosswordblock = graph['matrix'];
	var crosswordblocksolutions = graph['matrixpositions'];
	var crosswordblockacross = graph['across'];
	
	var crosswordblocklength = crosswordblock.length;
	
	for(var i = 0; i < crosswordblocklength; i++) {
		var row = crosswordblock[i];
		var trimmedrow = $.trim(row);
		if(!row || !trimmedrow.length) {
			crosswordblock.splice(i, 1);
			crosswordblocksolutions = incrementCrossWordBlockHeights(crosswordblocksolutions);
			i--;
			crosswordblocklength--;
		} else {
			i = crosswordblocklength;
		}
	}
	
	graph['matrix'] = crosswordblock;
	graph['matrixpositions'] = crosswordblocksolutions;
	
	return graph;
}

	/* incrementCrossWordBlockHeights(crosswordblocksolutions)
	
		Increase the vertical position of the words in a crossword block by one.
	
	*/

function incrementCrossWordBlockHeights(crosswordblocksolutions) {
	if(!crosswordblocksolutions) {
		return crosswordblocksolutions;
	}
	
	crosswordblockwords = Object.keys(crosswordblocksolutions);
	for(var i = 0; i < crosswordblockwords.length; i++) {
		var crosswordblockword = crosswordblockwords[i];
		
		crosswordblocksolutions[crosswordblockword][0]--;
	}
	return crosswordblocksolutions;
}

	/* incrementCrossWordBlockLengths(crosswordblocksolutions)
	
		Increase the horizontal position of the words in a crossword block by one.
	
	*/

function incrementCrossWordBlockLengths(crosswordblocksolutions) {
	if(!crosswordblocksolutions) {
		return crosswordblocksolutions;
	}
	
	crosswordblockwords = Object.keys(crosswordblocksolutions);
	for(var i = 0; i < crosswordblockwords.length; i++) {
		var crosswordblockword = crosswordblockwords[i];
		
		crosswordblocksolutions[crosswordblockword][1]--;
	}
	return crosswordblocksolutions;
}

	/* compactCrosswordBlockBottom(graph)
	
		Compact a crossword block on the bottom.
	
	*/

function compactCrosswordBlockBottom(graph) {
	var crosswordblock = graph['matrix'];
	var crosswordblocksolutions = graph['matrixpositions'];
	var crosswordblockacross = graph['across'];
	
	var crosswordblocklength = crosswordblock.length;
	for(var i = crosswordblocklength - 1; i >= 0; i--) {
		var row = crosswordblock[i];
		var trimmedrow = $.trim(row);
		if(!trimmedrow.length) {
			crosswordblock.splice(i, 1);
		} else {
			i = -1;
		}
	}
	
	graph['matrix'] = crosswordblock;
	graph['matrixpositions'] = crosswordblocksolutions;
	
	return graph;
}

	/* compactCrosswordBlockLeft(graph)
	
		Compact a crossword block on the left.
	
	*/

function compactCrosswordBlockLeft(graph) {
	var crosswordblock = graph['matrix'];
	var crosswordblocksolutions = graph['matrixpositions'];
	var crosswordblockacross = graph['across'];
	
	var crosswordblocklength = crosswordblock.length;
	
	var shorten = true;
	
	while(shorten) {
		if(crosswordblocklength) {
			for(var i = 0; i < crosswordblocklength; i++) {
				if(crosswordblock[i]) {
					var crosswordrow = crosswordblock[i];
					if(crosswordrow && crosswordrow[0] && crosswordrow[0] != ' ') {
						shorten = false;
						i = crosswordblocklength;
					}
				}
			}
		} else {
			shorten = false;
		}
		
		if(shorten) {
			for(var i = 0; i < crosswordblocklength; i++) {
				var crosswordrow = crosswordblock[i];
				crosswordblock[i] = crosswordrow.substr(1, crosswordrow.length);
			}
			
			crosswordblocksolutions = incrementCrossWordBlockLengths(crosswordblocksolutions);
		}
	}
	
	graph['matrix'] = crosswordblock;
	graph['matrixpositions'] = crosswordblocksolutions;
	
	return graph;
}

	/* compactCrosswordBlockRight(graph)
	
		Compact a crossword block on the right.
	
	*/

function compactCrosswordBlockRight(graph) {
	var crosswordblock = graph['matrix'];
	var crosswordblocksolutions = graph['matrixpositions'];
	var crosswordblockacross = graph['across'];
	
	var longestpiece = getWidestLine(crosswordblock) - 1;
	var crosswordblocklength = crosswordblock.length;
	
	var shorten = true;
	
	while(shorten) {
		if(crosswordblocklength) {
			for(var i = 0; i < crosswordblocklength; i++) {
				if(crosswordblock[i]) {
					var crosswordrow = crosswordblock[i];
					if(crosswordrow[longestpiece] && crosswordrow[longestpiece] != ' ') {
						shorten = false;
						i = crosswordblocklength;
					}
				}
			}
		} else {
			shorten = false;
		}
		if(shorten) {
			longestpiece--;
			for(var i = 0; i < crosswordblocklength; i++) {
				var crosswordrow = crosswordblock[i];
				crosswordblock[i] = crosswordrow.substr(0, crosswordrow.length - 1);
			}
		}
	}
	
	graph['matrix'] = crosswordblock;
	graph['matrixpositions'] = crosswordblocksolutions;
	
	return graph;
}

	/* generateCrosswordBlockSources(shuffledwords)
	
		Make the crossword block sources, which are the sub-graphs or mini-graphs. These will be put together to make the full crossword puzzle.
	
	*/

function generateCrosswordBlockSources(shuffledwords) {
	var crosswordblocks = [];
	var checkedcrosswords = [];
	var clues = [];
	for(var i = 0; i < shuffledwords.length; i++) {
		var shuffledword = shuffledwords[i];
		var word = shuffledword[0].toLowerCase();
		var clue = shuffledword[1];
		clues[word] = clue;
		
		crosswordclues[word] = clue;
		
		var checkedcrosswordkey = word + '-' + clue;
		
		var unmatchedwords = [];
		
		if(!checkedcrosswords[checkedcrosswordkey]) {
			var wordletters = getLettersHashCountForWord(word);
			var crosswordblock = [];
			
			for(var j = i + 1; j < shuffledwords.length; j++) {
				var nextshuffledword = shuffledwords[j];
				
				var nextword = nextshuffledword[0].toLowerCase();
				var nextclue = nextshuffledword[1];
				var nextcrosswordkey = nextword + '-' + nextclue;
				
				if(!checkedcrosswords[nextcrosswordkey]) {
					var matchingletter = getMatchingLetter(wordletters, nextword);
					if(matchingletter && matchingletter.length) {
						wordletters[matchingletter]--;
						checkedcrosswords[nextcrosswordkey] = true;
						crosswordblock.push([nextword, matchingletter]);
					}
				}
			}
			
			if(crosswordblock.length) {
				crosswordblocks[word] = crosswordblock;
			} else {
				unmatchedwords.push(word);
			}
			checkedcrosswords[checkedcrosswordkey] = true;
		}
		
		if(unmatchedwords.length) {
			crosswordblocks['(unmatched)'] = unmatchedwords;
		}
	}
	
	return {
		'blocks':crosswordblocks,
		'clues':clues,
	};
}

	/* getLettersHashPositionsForWord(word)
		
		Get a hash of the letters and the positions of the letters of a word.
		
	*/

function getLettersHashPositionsForWord(word) {
	var lettershash = [];
	
	for(var i = 0; i < word.length; i++) {
		var letter = word[i];
		if(lettershash[letter]) {
			lettershash[letter].push(i);
		} else {
			lettershash[letter] = [i];
		}
	}
				
	return lettershash;
}

	/* getLettersHashCountForWord(word)
	
		Get a hash of the counts for the letters of a word.
	
	*/

function getLettersHashCountForWord(word) {
	var lettershash = [];
	
	for(var i = 0; i < word.length; i++) {
		var letter = word[i];
		if(lettershash[letter]) {
			lettershash[letter]++;
		} else {
			lettershash[letter] = 1;
		}
	}
				
	return lettershash;
}

	/* getMatchingLetter(letters, nextword)
	
		Get the matching letter between two overlapping words.
	
	*/

function getMatchingLetter(letters, nextword) {
	var matchingletter = '';
	
	for(var i = 0; i < nextword.length; i++) {
		var letter = nextword[i];
		if(letters[letter]) {
			return letter;
		}
	}
	
	return matchingletter;
}

	/* shuffle(array)
	
		Randomize array.
	
	*/

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	
	return array;
}
