let kBoardWidth = 9;
let kBoardHeight = 9;
let kPieceWidth = 50;
let kPieceHeight= 50;
let kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
let kPixelHeight = 1 + (kBoardHeight * kPieceHeight);

let gCanvasElement;
let gDrawingContext;
let cowImg;
let farmImg;

let popupElement;

let gPieces;
let gNumPieces;
let gSelectedPieceIndex;
let gSelectedPieceHasMoved;
let gMoveCount;
let gMoveCountElem;
let gGameInProgress;

function Cell(row, column) {
    this.row = row;
    this.column = column;
}

function getCursorPosition(e) {
    let x;
    let y;

    if (e.pageX != undefined && e.pageY != undefined) {
	    x = e.pageX;
	    y = e.pageY;
    }
    else {
	    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    x -= gCanvasElement.offsetLeft;
    y -= gCanvasElement.offsetTop;
    x = Math.min(x, kBoardWidth * kPieceWidth);
    y = Math.min(y, kBoardHeight * kPieceHeight);
    let cell = new Cell(Math.floor(y / kPieceHeight), Math.floor(x / kPieceWidth));

    return cell;
}

function halmaOnClick(e) {
    let cell = getCursorPosition(e);

    for (let i = 0; i < gNumPieces; i++) {
	    if ((gPieces[i].row == cell.row) && (gPieces[i].column == cell.column)) {
	        clickOnPiece(i);
	        return;
	    }
    }

    clickOnEmptyCell(cell);
}

function clickOnEmptyCell(cell) {
    if (gSelectedPieceIndex == -1) { return; }
    let rowDiff = Math.abs(cell.row - gPieces[gSelectedPieceIndex].row);
    let columnDiff = Math.abs(cell.column - gPieces[gSelectedPieceIndex].column);

    if ((rowDiff <= 1) && (columnDiff <= 1)) {
	    gPieces[gSelectedPieceIndex].row = cell.row;
	    gPieces[gSelectedPieceIndex].column = cell.column;
	    gMoveCount += 1;
	    gSelectedPieceIndex = -1;
	    gSelectedPieceHasMoved = false;
	    drawBoard();
	    return;
    }

    if ((((rowDiff == 2) && (columnDiff == 0)) || ((rowDiff == 0) && (columnDiff == 2)) ||
	 ((rowDiff == 2) && (columnDiff == 2))) && isThereAPieceBetween(gPieces[gSelectedPieceIndex], cell)) {
	    /* this was a valid jump */
	    if (!gSelectedPieceHasMoved) {
	        gMoveCount += 1;
	    }
	    gSelectedPieceHasMoved = true;
	    gPieces[gSelectedPieceIndex].row = cell.row;
	    gPieces[gSelectedPieceIndex].column = cell.column;
	    drawBoard();
	    return;
    }

    gSelectedPieceIndex = -1;
    gSelectedPieceHasMoved = false;
    drawBoard();
}

function clickOnPiece(pieceIndex) {
    if (gSelectedPieceIndex == pieceIndex) { return; }
    gSelectedPieceIndex = pieceIndex;
    gSelectedPieceHasMoved = false;
    drawBoard();
}

function isThereAPieceBetween(cell1, cell2) {
    let rowBetween = (cell1.row + cell2.row) / 2;
    let columnBetween = (cell1.column + cell2.column) / 2;

    for (let i = 0; i < gNumPieces; i++) {
	    if ((gPieces[i].row == rowBetween) && (gPieces[i].column == columnBetween)) {
	        return true;
	    }
    }

    return false;
}

function isTheGameOver() {
    for (let i = 0; i < gNumPieces; i++) {
	    if (gPieces[i].row > 2) {
	        return false;
        }

        if (gPieces[i].column < (kBoardWidth - 3)) {
	        return false;
	    }
    }

    return true;
}

function drawBoard() {
    gDrawingContext.clearRect(0, 0, kPixelWidth, kPixelHeight);
    gDrawingContext.beginPath();
    
    for (let x = 0; x <= kPixelWidth; x += kPieceWidth) {
	    gDrawingContext.moveTo(0.5 + x, 0);
	    gDrawingContext.lineTo(0.5 + x, kPixelHeight);
    }
    
    for (let y = 0; y <= kPixelHeight; y += kPieceHeight) {
	    gDrawingContext.moveTo(0, 0.5 + y);
	    gDrawingContext.lineTo(kPixelWidth, 0.5 +  y);
    }
    
    gDrawingContext.strokeStyle = "#ccc";
    gDrawingContext.stroke();

    gDrawingContext.drawImage(farmImg, 300, 0, 150, 150);

    for (let i = 0; i < 9; i++) {
	    drawPiece(gPieces[i], i == gSelectedPieceIndex);
    }

    gMoveCountElem.innerHTML = gMoveCount;

    if (gGameInProgress && isTheGameOver()) {
        endGame();
        finishPopup();
    }
}

function finishPopup() {
    popupElement = document.getElementById('finish-overlay').style.display = 'block';
    let speech = document.getElementById("final-speech");

    if (gMoveCount > 28) {
        speech.textContent = 'Вы выиграли! Но...у вас больше ходов, чем у игрока уровня бог (это мой папа = 28 ходов, что-то пошло не по плану :))';
    }
}

function drawPiece(p, selected) {
    let x = p.column * kPieceWidth;
    let y = p.row * kPieceHeight;

    gDrawingContext.beginPath();
    gDrawingContext.rect(x, y, kPieceWidth, kPieceHeight);
    gDrawingContext.closePath();

    if (selected) {
        gDrawingContext.fillStyle = "#fff";
	    gDrawingContext.fill();
    }

    gDrawingContext.drawImage(cowImg, x, y, 50, 50);    
}

if (typeof resumeGame != "function") {
    resumeGame = function() {
	    return false;
    }
}

function newGame() {
    gPieces = [new Cell(kBoardHeight - 3, 0),
	       new Cell(kBoardHeight - 2, 0),
	       new Cell(kBoardHeight - 1, 0),
	       new Cell(kBoardHeight - 3, 1),
	       new Cell(kBoardHeight - 2, 1),
	       new Cell(kBoardHeight - 1, 1),
	       new Cell(kBoardHeight - 3, 2),
	       new Cell(kBoardHeight - 2, 2),
	       new Cell(kBoardHeight - 1, 2)];
    gNumPieces = gPieces.length;
    gSelectedPieceIndex = -1;
    gSelectedPieceHasMoved = false;
    gMoveCount = 0;
    gGameInProgress = true;
    drawBoard();
}

function endGame() {
    gSelectedPieceIndex = -1;
    gGameInProgress = false;
}

function initGame(canvasElement, moveCountElement) {
    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
        canvasElement.id = "halma_canvas";
	    document.body.appendChild(canvasElement);
    }

    if (!moveCountElement) {
        moveCountElement = document.createElement("p");
	    document.body.appendChild(moveCountElement);
    }

    gCanvasElement = canvasElement;
    gCanvasElement.width = kPixelWidth;
    gCanvasElement.height = kPixelHeight;   
    gCanvasElement.addEventListener("click", halmaOnClick, false);
    gMoveCountElem = moveCountElement;

    gDrawingContext = gCanvasElement.getContext("2d");
    farmImg = document.getElementById("farm-image");
    cowImg = document.getElementById("cow-image");


    if (!resumeGame()) {
	    newGame();
    }
}