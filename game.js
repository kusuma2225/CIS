(function(){
    'use strict';
    var WIDTH = 10, HEIGHT = 10, SPACE = 70, SIZE = 5, PADDING = 3, NEAR = 0.1,
        NEAR_BOTTOM = SPACE * NEAR + SIZE,
        NEAR_TOP = SPACE * (1 - NEAR),
        NEAR_LEFT = NEAR_TOP, NEAR_RIGHT = NEAR_BOTTOM,
        OFFSET_X, OFFSET_Y,
        LAST_HOVER_X, LAST_HOVER_Y, LAST_HOVER_RIGHT, LAST_HOVER_DOWN, HOVER, 
        PLAYER_COUNT = parseInt(prompt("How many players?", 2)),
        PLAYER_COLORS = ['red', 'green', 'blue', 'yellow', 'violet'],
        PLAYER_NOW = -1,
        PLAYERS_SCORE = [],
        lines = {}, mouse = {}, which_player;

    if(PLAYER_COUNT > PLAYER_COLORS.length) 
        return alert("There can be at most " + PLAYER_COLORS.length + " players!");

    function drawDots(context) {
        for (var i = 0, len = WIDTH * SPACE; i < len; i += SPACE) {
            for (var j = 0, len_j = HEIGHT * SPACE; j < len_j; j += SPACE) {
                context.rect(i, j, SIZE, SIZE);
            }
        }
        context.fill();
    }

    function fromNode2(a, b) {
        var x = a, y = b;
        if(typeof a == 'object') {
            x = a.x; 
            y = a.y;
        }
        return y * WIDTH + x;
    }

    function toNode2(nodeIndex) {
        return { x: nodeIndex % WIDTH, y: Math.floor(nodeIndex / WIDTH) };
    }

    function thereIsNode(pointA, pointB) {
        if(typeof pointA != 'number' || typeof pointB != 'number') throw 'pointA or pointB is not a number!';
        return lines[pointA] && lines[pointA].indexOf(pointB) > -1;
    }

    function drawSquare(context, pointA) {
        if(typeof pointA == "number") pointA = toNode2(pointA);
        context.fillStyle = PLAYER_COLORS[PLAYER_NOW];
        var x = pointA.x * SPACE + SIZE, y = pointA.y * SPACE + SIZE;
        // console.log("Space is: ", SPACE, ", coords: ", x1, y1, x2, y2);
        context.fillRect(x, y, SPACE - SIZE, SPACE - SIZE);
        PLAYERS_SCORE[PLAYER_NOW] = PLAYERS_SCORE[PLAYER_NOW] ? PLAYERS_SCORE[PLAYER_NOW] + 1 : 1;
        drawInfoDiv();
    }

    function surfaceClicked(context) {
        if(!HOVER) return;

        var goesRight = Math.round(LAST_HOVER_RIGHT / SPACE) == 1,
            horizontal = goesRight,
            dotFirst = {
                x: Math.round(LAST_HOVER_X / SPACE),
                y: Math.round(LAST_HOVER_Y / SPACE),
            }, 
            dotSecond = {
                x: dotFirst.x + goesRight,
                y: dotFirst.y + !goesRight, 
            }, 
            dotFirstIndex = fromNode2(dotFirst), 
            dotSecondIndex = fromNode2(dotSecond); 

        if(!lines[dotFirstIndex]) lines[dotFirstIndex] = [dotSecondIndex];
        else lines[dotFirstIndex].push(dotSecondIndex);
        if(!lines[dotSecondIndex]) lines[dotSecondIndex] = [dotFirstIndex];
        else lines[dotSecondIndex].push(dotFirstIndex);

        context.fillStyle = 'black';
        context.fillRect(LAST_HOVER_X, LAST_HOVER_Y, LAST_HOVER_RIGHT, LAST_HOVER_DOWN);

        var topLeft, topRight, bottomLeft, bottomRight, has_made_square = false;
        if(horizontal) {
            topLeft = fromNode2(dotFirst.x, dotFirst.y - 1);
            topRight = fromNode2(dotSecond.x, dotSecond.y - 1);
            bottomLeft = fromNode2(dotFirst.x, dotFirst.y + 1);
            bottomRight = fromNode2(dotSecond.x, dotSecond.y + 1);

            if(thereIsNode(dotFirstIndex, topLeft) && thereIsNode(topLeft, topRight) && thereIsNode(topRight, dotSecondIndex)) {
                // square on the top
                drawSquare(context, topLeft);
                has_made_square = true;
            }
            if(thereIsNode(dotFirstIndex, bottomLeft) && thereIsNode(bottomLeft, bottomRight) && thereIsNode(bottomRight, dotSecondIndex)) {
                // square on the bottom
                drawSquare(context, dotFirst);
                has_made_square = true;
            }
        } else {
            topLeft = fromNode2(dotFirst.x - 1, dotFirst.y);
            topRight = fromNode2(dotFirst.x + 1, dotFirst.y);
            bottomLeft = fromNode2(dotSecond.x - 1, dotSecond.y);
            bottomRight = fromNode2(dotSecond.x + 1, dotSecond.y);

            if(thereIsNode(dotFirstIndex, topLeft) && thereIsNode(topLeft, bottomLeft) && thereIsNode(bottomLeft, dotSecondIndex)) {
                // square on the left
                drawSquare(context, topLeft);
                has_made_square = true;
            }
            if(thereIsNode(dotFirstIndex, topRight) && thereIsNode(topRight, bottomRight) && thereIsNode(bottomRight, dotSecondIndex)) {
                // square on the right
                drawSquare(context, dotFirst);
                has_made_square = true;
            }
        }

        if(!has_made_square) nextPlayer();
    }

    function nextPlayer () {
        PLAYER_NOW = (++PLAYER_NOW) % PLAYER_COUNT;
        drawInfoDiv();
    }

    function drawInfoDiv() {
        var html = '';
        for (var i = 0; i < PLAYER_COUNT; i++) {
            html += '<font color="' + PLAYER_COLORS[i] + '">' + (1+i) + ': ' + (PLAYERS_SCORE[i]||0) + '</font>';
            if(i == PLAYER_NOW) html += ' - YOUR TURN';
            html += '<br>';
        }
        which_player.innerHTML = html;
    }

    function mouseMove(context, x, y) {
        var relativeX = x % SPACE, relativeY = y % SPACE,
        lineX = x - relativeX, lineY = y - relativeY;

        context.clearRect(LAST_HOVER_X, LAST_HOVER_Y, LAST_HOVER_RIGHT, LAST_HOVER_DOWN);

        HOVER = true;

        if(relativeY < NEAR_BOTTOM){
            LAST_HOVER_X = lineX + SIZE;
            LAST_HOVER_Y = lineY;
            LAST_HOVER_RIGHT = SPACE - SIZE;
            LAST_HOVER_DOWN = SIZE;
        } else if (relativeY > NEAR_TOP) {
            LAST_HOVER_X = lineX + SIZE;
            LAST_HOVER_Y = lineY + SPACE;
            LAST_HOVER_RIGHT = SPACE - SIZE;
            LAST_HOVER_DOWN = SIZE;
        } else if (relativeX < NEAR_RIGHT ) {
            LAST_HOVER_X = lineX;
            LAST_HOVER_Y = lineY + SIZE;
            LAST_HOVER_RIGHT = SIZE;
            LAST_HOVER_DOWN = SPACE - SIZE;
        } else if (relativeX > NEAR_LEFT) {
            LAST_HOVER_X = lineX + SPACE;
            LAST_HOVER_Y = lineY + SIZE;
            LAST_HOVER_RIGHT = SIZE;
            LAST_HOVER_DOWN = SPACE - SIZE;
        } else {
            HOVER = false;
        }

        if(HOVER) {
            if(thereIsNode(
                fromNode2(Math.round(LAST_HOVER_X / SPACE), Math.round(LAST_HOVER_Y / SPACE)),
                fromNode2(Math.round((LAST_HOVER_X + LAST_HOVER_RIGHT) / SPACE), Math.round(( LAST_HOVER_Y + LAST_HOVER_DOWN) / SPACE))
                )) {
                HOVER = false;
                return;
            }
            context.fillStyle = PLAYER_COLORS[PLAYER_NOW];
            context.fillRect(LAST_HOVER_X, LAST_HOVER_Y, LAST_HOVER_RIGHT, LAST_HOVER_DOWN);
        }
    }

    window.addEventListener('load', function () {
        var canvas = document.createElement('canvas');
        canvas.width = SPACE * (WIDTH - 1) + SIZE;
        canvas.height = SPACE * (HEIGHT - 1) + SIZE;
        canvas.style = 'display: table; margin: auto; border: 1px solid black;';
        canvas.style.padding = PADDING + 'px';
        document.body.appendChild(canvas);

        OFFSET_X = canvas.offsetLeft + PADDING;
        OFFSET_Y = canvas.offsetTop + PADDING;

        var context = canvas.getContext('2d');

        drawDots(context);

        var canvas_hover = canvas.cloneNode(false);
        canvas_hover.style.position = 'absolute';
        canvas_hover.style.top = canvas.offsetTop + 'px';
        canvas_hover.style.left = canvas.offsetLeft + 'px';
        document.body.appendChild(canvas_hover);

        var hover_context = canvas_hover.getContext('2d');

        canvas_hover.addEventListener('mousemove', function (e) {
            mouseMove(hover_context, e.pageX - OFFSET_X, e.pageY - OFFSET_Y);
        });
        canvas_hover.addEventListener('click', function(e) {
            surfaceClicked(context);
        });

        which_player = document.getElementById('which_player');

        nextPlayer();
    });
})();
