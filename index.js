(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jiboProgrammingChallenge = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BoardPosition {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
}
exports.BoardPosition = BoardPosition;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
const board_layout_1 = require("./board-layout");
const checker_square_1 = require("./checker-square");
class CheckerBoard extends PIXI.Container {
    constructor(size, pixelSize, oddColor = 0x111111, evenColor = 0xee1111, 
        // I haven't yet figured out how to set a default value here
        // (desired: CheckerSquare); so I use a conditional in this.setupSquare()
        createSquare = null) {
        super();
        this.squares = [];
        this.pixelSize = pixelSize;
        this.oddColor = oddColor;
        this.evenColor = evenColor;
        this.createSquare = createSquare;
        this.resize(size);
    }
    resize(size) {
        this.size = size;
        this.squareSize = this.pixelSize / this.size;
        this.shrink();
        this.expandAndColorize();
    }
    toTop(object) {
        this.removeChild(object);
        this.addChild(object);
    }
    boardPositionToPixels(boardPosition) {
        return new PIXI.Point((boardPosition.col - this.size / 2) * this.squareSize + this.squareSize / 2, (boardPosition.row - this.size / 2) * this.squareSize + this.squareSize / 2);
    }
    // Destroy extra board positions if the new board layout is smaller than the
    // last board
    shrink() {
        while (this.squares.length > this.size) {
            // Delete the last row
            const row = this.squares[this.squares.length - 1];
            while (row.length > 0)
                row.pop().destroy();
            this.squares.pop();
            // Delete the last column from each row
            for (let row of this.squares)
                row.pop().destroy();
        }
    }
    // Add squares of the appropriate size, color, and position to fill the
    // board's pixel size; resize and set position and color for existing squares
    expandAndColorize() {
        // even tracks the alternating square colors
        let even = false;
        // Iterate over the board positions for the given board size
        for (let row = 0; row < this.size; row++) {
            // Add the row if our board isn't that big yet
            if (row > this.squares.length - 1)
                this.squares.push([]);
            for (let col = 0; col < this.size; col++) {
                this.setupSquare(new board_layout_1.BoardPosition(row, col), even);
                // Stagger the square colors
                even = !even;
            }
            // For even-sized boards, have to stagger the square colors back
            if (this.size % 2 === 0)
                even = !even;
        }
    }
    setupSquare(position, even) {
        let square;
        // If we don't yet have a square for this position, create it
        if (position.col > this.squares[position.row].length - 1) {
            // I haven't yet figured out how to set a default value for
            // this.createSquare, so I use a conditional here for the default
            square = this.createSquare
                ? new this.createSquare(position, this.squareSize, even, this.oddColor, this.evenColor)
                : new checker_square_1.CheckerSquare(position, this.squareSize, even, this.oddColor, this.evenColor);
            this.addChild(square);
            this.squares[position.row].push(square);
        }
        else {
            square = this.squares[position.row][position.col];
            square.reset(this.squareSize, even);
        }
        square.position = this.boardPositionToPixels(position);
    }
}
exports.CheckerBoard = CheckerBoard;

},{"./board-layout":1,"./checker-square":3,"pixi.js":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
class CheckerSquare extends PIXI.Graphics {
    constructor(boardPosition, pixelSize, even, oddColor = 0x111111, evenColor = 0xee1111, lines = false) {
        super(); //lines)
        this.boardPosition = boardPosition;
        this.pixelSize = pixelSize;
        this.even = even;
        this.oddColor = oddColor;
        this.evenColor = evenColor;
        this.redraw();
    }
    reset(pixelSize, even) {
        // If the pixel size or color of the square changes, recreate the square
        if (this.pixelSize !== pixelSize || this.even !== even) {
            this.pixelSize = pixelSize;
            this.even = even;
            // Redraw the square and arrow at the proper size and position
            this.redraw();
        }
    }
    // We keep track of even/odd in an instance variable to see if we need to
    // recreate the square; I'd prefer to pass it, but hey we already have it
    redraw() {
        this.clear();
        this.beginFill(this.even ? this.evenColor : this.oddColor);
        // Center it on the its position
        this.drawRect(-this.pixelSize / 2, -this.pixelSize / 2, this.pixelSize, this.pixelSize);
        this.endFill();
    }
}
exports.CheckerSquare = CheckerSquare;

},{"pixi.js":undefined}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
class Checker extends PIXI.Graphics {
    constructor(size, alpha = 1, strokeThickness = 0, stroke = 0x000000, fill = 0x111111, lines = false) {
        super(); //lines)
        // Semi-transparent so that the arrows can be seen
        this.alpha = alpha;
        this.strokeThickness = strokeThickness;
        this.stroke = stroke;
        this.fill = fill;
        this.resize(size);
    }
    resize(size) {
        this.clear();
        this.lineStyle(this.strokeThickness, this.stroke);
        this.beginFill(this.fill);
        // Set scale relative to square size
        this.drawCircle(0, 0, size);
        this.endFill();
    }
}
exports.Checker = Checker;

},{"pixi.js":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checker_board_1 = require("../checker-board");
const directed_checker_square_1 = require("./directed-checker-square");
class DirectedCheckerBoard extends checker_board_1.CheckerBoard {
    constructor(boardLayout, pixelSize, oddColor = 0x111111, evenColor = 0xee1111) {
        super(boardLayout.length, pixelSize, oddColor, evenColor, directed_checker_square_1.DirectedCheckerSquare);
        this.setBoardLayout(boardLayout);
    }
    setBoardLayout(boardLayout) {
        for (let row = 0; row < boardLayout.length; row++) {
            for (let col = 0; col < boardLayout.length; col++) {
                const square = this.squares[row][col];
                square.setDirection(boardLayout[row][col]);
            }
        }
    }
}
exports.DirectedCheckerBoard = DirectedCheckerBoard;

},{"../checker-board":2,"./directed-checker-square":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const arrow_1 = require("../../ui/arrow");
const checker_square_1 = require("../checker-square");
class DirectedCheckerSquare extends checker_square_1.CheckerSquare {
    constructor(position, pixelSize, even, oddColor = 0x111111, evenColor = 0xee1111, direction = 0 /* Up */, arrowColor = 0xffffff, lines = false) {
        super(position, pixelSize, even, oddColor, evenColor, lines);
        this.addChild(this.arrow = new arrow_1.Arrow(pixelSize, direction, arrowColor));
    }
    reset(pixelSize, even) {
        super.reset(pixelSize, even);
        this.arrow.redraw(pixelSize);
    }
    setDirection(direction) {
        this.arrow.setDirection(direction);
    }
}
exports.DirectedCheckerSquare = DirectedCheckerSquare;

},{"../../ui/arrow":9,"../checker-square":3}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
class FullScreenHeaderFooter extends PIXI.Container {
    constructor(body, header = null, footer = null) {
        super();
        this.body = body;
        const screenWidth = document.documentElement.clientWidth;
        const screenHeight = document.documentElement.clientHeight;
        const headerHeight = header ? header.getLocalBounds().height : 0;
        const footerHeight = footer ? footer.getLocalBounds().height : 0;
        if (header) {
            this.addChild(header);
            header.position = new PIXI.Point(screenWidth / 2, 0);
        }
        this.addChild(body);
        body.position = new PIXI.Point(screenWidth / 2, headerHeight * 2);
        if (footer) {
            this.addChild(footer);
            footer.position = new PIXI.Point(screenWidth / 2, screenHeight - footerHeight / 2);
        }
        this.bodyWidth = screenWidth;
        this.bodyHeight = screenHeight - headerHeight * 2 - footerHeight * 2;
    }
    addToBody(child) {
        return this.body.addChild(child);
    }
}
exports.FullScreenHeaderFooter = FullScreenHeaderFooter;

},{"pixi.js":undefined}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
class HorizontalCenter extends PIXI.Container {
    constructor(margin = 0) {
        super();
        this.setMargin(margin);
        this.onChildrenChange = this.repositionChildren;
    }
    setMargin(margin) {
        this.margin = margin;
        this.repositionChildren();
    }
    repositionChildren() {
        const fullWidth = this.children
            .map(child => child.getLocalBounds().width)
            .reduce((sum, width) => sum += width, 0)
            + this.margin * this.children.length - 1;
        let left = -fullWidth / 2;
        for (let c = 0; c < this.children.length; c++) {
            const child = this.children[c];
            const width = child.getLocalBounds().width;
            // Center each item on its position
            child.position.x = left + width / 2;
            left += width + this.margin;
        }
    }
}
exports.HorizontalCenter = HorizontalCenter;

},{"pixi.js":undefined}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
class Arrow extends PIXI.Graphics {
    constructor(size, direction = 0 /* Up */, color = 0xffffff, lines = false) {
        super(); //lines)
        this.direction = 0 /* Up */;
        this.redraw(size, color);
        this.setDirection(direction);
    }
    // Only its fill color is configurable, and no stroke
    // Arrow size is calculated relative to square size
    // Full of "magic numbers": TBD to move these to config
    redraw(size, color = null) {
        if (color == null)
            color = this.color;
        else
            this.color = color;
        this.clear();
        this.beginFill(color);
        // The body of the arrow
        this.drawRect(-size / 12, -size * .2, size / 6, size * .6);
        // The arrowhead
        this.drawPolygon([
            new PIXI.Point(0, -size * .4),
            new PIXI.Point(-size * .25, -size * .1),
            new PIXI.Point(size * .25, -size * .1)
        ]);
        this.endFill();
    }
    setDirection(direction) {
        this.direction = direction;
        this.rotation = Math.PI / 2 * this.direction;
    }
}
exports.Arrow = Arrow;

},{"pixi.js":undefined}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = require("pixi.js");
class Button extends PIXI.Graphics {
    constructor(label, style) {
        super();
        // Set the styles from the config and draw to configured size
        this.lineStyle(style.strokeThickness, style.stroke);
        this.beginFill(style.fill);
        this.drawRect(-style.width / 2, -style.height / 2, style.width, style.height);
        this.endFill();
        // Add styled button text
        const text = new PIXI.Text(label, style.textStyle);
        // Center the text on the button
        text.anchor.set(.5);
        this.addChild(text);
        // Set up the event handlers
        this.interactive = true;
        this.on('mouseup', () => this.emit('pressed'));
        this.on('touchend', () => this.emit('pressed'));
    }
}
exports.Button = Button;
class ButtonStyle {
    constructor(width, height, textStyle, fill = 0x542121, strokeThickness = 2, stroke = 0xededed) {
        this.width = width;
        this.height = height;
        this.textStyle = textStyle;
        this.fill = fill;
        this.strokeThickness = strokeThickness;
        this.stroke = stroke;
    }
}
exports.ButtonStyle = ButtonStyle;

},{"pixi.js":undefined}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path='../typings/index.d.ts' />
const fs = require("fs");
const simulation_1 = require("./simulation");
const visualization_1 = require("./visualization");
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
class Application {
    constructor() {
        // Event handling callbacks need fat arrow to keep "this" context
        this.resize = (amount) => {
            this.stop();
            let boardSize = this.simulation.size + amount;
            if (boardSize < 1)
                boardSize = 1;
            else if (boardSize > config.simulation.maxSize)
                boardSize = config.simulation.maxSize;
            if (this.simulation.size !== boardSize)
                this.simulation.resize(boardSize);
            this.visualization.setBoardLayout(this.simulation.boardLayout);
            this.restart();
            this.visualization.showMessage('Press Play to Begin');
        };
        // Event handling callbacks need fat arrow to keep "this" context
        this.shuffle = () => {
            this.stop();
            this.simulation.shuffle();
            this.visualization.setBoardLayout(this.simulation.boardLayout);
            this.restart();
            this.visualization.showMessage('Press Play to Begin');
        };
        // Event handling callbacks need fat arrow to keep "this" context
        this.play = () => {
            this.stop();
            this.restart();
            this.visualization.showMessage('Running');
            this.next();
        };
        // Event handling callbacks need fat arrow to keep "this" context
        this.forceStop = () => {
            if (this.simulation.state === 0 /* Running */) {
                this.stop();
                this.visualization.showMessage('Stopped');
            }
        };
        // Event handling callbacks need fat arrow to keep "this" context
        this.pointerMoved = (number, position) => {
            this.visualization.moveChecker(number, position);
        };
        // Fat arrow to preserve "this" in setTimeout
        this.next = () => {
            this.simulation.next();
            if (this.simulation.state === 0 /* Running */)
                // Delay for the animation to finish, and track the timeout so we
                // can stop it on demand
                this.timeout = setTimeout(this.next, config.visualization.moveTime);
        };
        // Event handling callbacks need fat arrow to keep "this" context
        this.simulationEnded = () => {
            let message;
            switch (this.simulation.state) {
                case 2 /* Noncircular */:
                    this.visualization.showMessage('The path is noncircular.');
                    this.visualization.fall();
                    break;
                case 1 /* Circular */:
                    this.visualization.showMessage('The path is circular.');
                    this.visualization.collide();
                    break;
            }
            this.timeout = setTimeout(this.stop, config.visualization.moveTime);
        };
        // Fat arrow to preserve "this" in setTimeout call
        this.stop = () => {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
            this.visualization.stop();
        };
        // Number of rows and columns for the simulation board
        this.simulation = new simulation_1.Simulation(config.simulation.initialSize);
        // Called by the simulation whenever a point moves
        // (in order to animate it, perhaps)
        this.simulation.on('move', this.pointerMoved);
        this.simulation.on('end', this.simulationEnded);
        this.visualization = new visualization_1.Visualization(this.simulation.boardLayout);
        this.visualization.on('play', this.play);
        this.visualization.on('stop', this.forceStop);
        this.visualization.on('resize', this.resize);
        this.visualization.on('shuffle', this.shuffle);
        this.restart();
    }
    restart() {
        // Move the checkers to their starting positions
        this.simulation.restart();
        this.visualization.restart();
        this.visualization.placeChecker(1, this.simulation.startingPosition);
        this.visualization.placeChecker(2, this.simulation.startingPosition);
    }
}
new Application();

},{"./simulation":12,"./visualization":14,"fs":undefined}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventsEmitter = require("events");
const board_layout_1 = require("./components/checkers/board-layout");
class Simulation extends EventsEmitter {
    constructor(size) {
        super();
        this.boardLayout = [];
        // Set initial board layout to the proper size; resize takes care of
        // shuffling
        this.resize(size);
    }
    // When the simulation is resized, resize the board layout data structure
    // and shuffle the board (an improvement could be to only randomize any "new"
    // positions)
    resize(size) {
        this.size = size;
        // Remove rows down to the proper size
        while (this.boardLayout.length > size)
            this.boardLayout.pop();
        for (let row = 0; row < this.boardLayout.length; row++) {
            // Remove columns from each remaining row down to the proper size
            while (this.boardLayout[row].length > size)
                this.boardLayout[row].pop();
            // Add columns to the existing rows up to the proper size
            while (size > this.boardLayout[row].length)
                this.boardLayout[row].push(0);
        }
        // Add rows up to the proper size
        while (size > this.boardLayout.length)
            this.addRow(this.boardLayout.length);
        this.shuffle();
    }
    // Set random values for each location on the board
    shuffle() {
        for (let row = 0; row < this.size; row++)
            for (let col = 0; col < this.size; col++)
                this.boardLayout[row][col] = Math.floor(Math.random() * 4);
        this.startingPosition = this.randomPosition();
        this.restart();
    }
    // Set the state to Running, and move the pointers back to starting position
    restart() {
        this.state = 0 /* Running */;
        this.pointerOnePosition = this.startingPosition;
        this.pointerTwoPosition = this.startingPosition;
        this.evenMove = false;
    }
    run() {
        this.restart();
        while (this.state === 0 /* Running */)
            this.next();
    }
    // The iterator, used by the controller to step through the simulation
    // An improvement might be to add a "run" method to Simulation, which
    // would run the entire simulation synchronously
    next() {
        this.pointerOnePosition = this.nextPosition(this.pointerOnePosition);
        this.determineState();
        this.emit('move', 1, this.pointerOnePosition);
        // Have to check before moving the second pointer
        if (this.state === 0 /* Running */ && this.evenMove) {
            this.pointerTwoPosition = this.nextPosition(this.pointerTwoPosition);
            this.determineState();
            this.emit('move', 2, this.pointerTwoPosition);
        }
        this.evenMove = !this.evenMove;
        if (this.state !== 0 /* Running */)
            this.emit('end', this.state);
    }
    static samePosition(position1, position2) {
        return position1.row === position2.row && position1.col === position2.col;
    }
    addRow(row) {
        this.boardLayout.push([]);
        for (let col = 0; col < this.size; col++)
            this.boardLayout[row].push(0);
    }
    nextPosition(currentPosition) {
        const direction = this.boardLayout[currentPosition.row][currentPosition.col];
        let nextPosition;
        switch (direction) {
            case 0 /* Up */:
                nextPosition =
                    new board_layout_1.BoardPosition(currentPosition.row - 1, currentPosition.col);
                break;
            case 2 /* Down */:
                nextPosition =
                    new board_layout_1.BoardPosition(currentPosition.row + 1, currentPosition.col);
                break;
            case 3 /* Left */:
                nextPosition =
                    new board_layout_1.BoardPosition(currentPosition.row, currentPosition.col - 1);
                break;
            case 1 /* Right */:
                nextPosition =
                    new board_layout_1.BoardPosition(currentPosition.row, currentPosition.col + 1);
                break;
        }
        return nextPosition;
    }
    determineState() {
        this.state =
            !this.validPosition(this.pointerOnePosition)
                ? 2 /* Noncircular */
                : Simulation.samePosition(this.pointerOnePosition, this.pointerTwoPosition)
                    ? 1 /* Circular */
                    : 0 /* Running */;
    }
    validPosition(position) {
        return !(position.row < 0 ||
            position.row > this.size - 1 ||
            position.col < 0 ||
            position.col > this.size - 1);
    }
    randomPosition(size = 0) {
        if (size < 1)
            size = this.size;
        return new board_layout_1.BoardPosition(Math.floor(Math.random() * size), Math.floor(Math.random() * size));
    }
}
exports.Simulation = Simulation;

},{"./components/checkers/board-layout":1,"events":undefined}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SoundManager {
    constructor(sounds) {
        this.sounds = {};
        for (let sound in sounds) {
            const audio = new Audio();
            audio.src = sounds[sound];
            audio.preload = 'true';
            this.sounds[sound] = audio;
        }
    }
    play(soundName) {
        this.sounds[soundName].pause();
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play();
    }
}
exports.SoundManager = SoundManager;

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const EventEmitter = require("events");
const PIXI = require("pixi.js");
const TweenLite_1 = require("gsap/TweenLite");
const sound_manager_1 = require("./sound-manager");
const button_1 = require("./components/ui/button");
const checker_1 = require("./components/checkers/checker");
const directed_checker_board_1 = require("./components/checkers/directed/directed-checker-board");
const horizontal_center_1 = require("./components/layouts/horizontal-center");
const full_screen_header_footer_1 = require("./components/layouts/full-screen-header-footer");
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8')).visualization;
class Visualization extends EventEmitter {
    constructor(boardLayout) {
        super();
        this.soundManager = new sound_manager_1.SoundManager(config.sounds);
        // Fat arrow to preserve "this"
        this.renderLoop = () => {
            requestAnimationFrame(this.renderLoop);
            this.renderer.render(this.screenLayout);
        };
        // This creates the full-screen layout and adds the message to the header
        // and buttons to the footer
        this.setupUI();
        this.setupBoard(boardLayout);
        this.setupCheckers();
        // Create a WebGL renderer at window dimensions; begin render loop
        this.startRendering();
    }
    setBoardLayout(boardLayout) {
        // Stop any ongoing animations
        this.stop();
        // Resize the board as needed - the board takes care of creating squares
        if (this.board.size !== boardLayout.length)
            this.resize(boardLayout.length);
        // Set the arrow directions on the board
        this.board.setBoardLayout(boardLayout);
        // Make sure the checkers are on top of any new squares
        this.board.toTop(this.checker1);
        this.board.toTop(this.checker2);
    }
    // Resize the first checker to scale one, since it is shrunk to zero scale
    // when a simulation is started
    restart() {
        this.checker1.scale.set(1, 1);
    }
    // Stop any ongoing animations
    stop() {
        TweenLite_1.TweenLite.killTweensOf(this.checker1.position);
        TweenLite_1.TweenLite.killTweensOf(this.checker1.scale);
        TweenLite_1.TweenLite.killTweensOf(this.checker2.position);
    }
    // Show the given text at screen top
    showMessage(message) {
        this.message.text = message;
    }
    // Place the given checker at the given position, without animating
    placeChecker(number, position) {
        const checker = number === 1 ? this.checker1 : this.checker2;
        checker.position = this.board.boardPositionToPixels(position);
    }
    // Animate moving the checker to a new position
    moveChecker(number, position) {
        const checker = number === 1 ? this.checker1 : this.checker2;
        const pixelPosition = this.board.boardPositionToPixels(position);
        // Use the Greensock TweenLite library to animate the movement
        TweenLite_1.TweenLite.to(checker.position, config.checker.moveTime, { x: pixelPosition.x, y: pixelPosition.y });
        this.soundManager.play('move');
    }
    collide() {
        // Shrink the first checker to scale zero
        TweenLite_1.TweenLite.to(this.checker1.scale, .5, { x: 0, y: 0 });
        this.soundManager.play('collide');
    }
    fall() {
        // Shrink the first checker to scale zero
        TweenLite_1.TweenLite.to(this.checker1.scale, .5, { x: 0, y: 0 });
        this.soundManager.play('fall');
    }
    startRendering() {
        // The screenLayout container is passed into render() by renderLoop()
        // It contains the message, the board, and the buttons
        // Set up the renderer, add the canvas to the page, and start the render
        // loop (renders every frame with requestAnimationFrame)
        this.renderer =
            new PIXI.WebGLRenderer(document.documentElement.clientWidth, document.documentElement.clientHeight, 
            // Smooth edges of curves created with PIXI.Graphics
            { antialias: true });
        document.body.appendChild(this.renderer.view);
        this.renderLoop();
    }
    // Creates the message and the buttons, and set up the event handling
    setupUI() {
        this.message = this.createMessage();
        const header = new horizontal_center_1.HorizontalCenter(config.margin);
        header.addChild(this.message);
        const footer = this.createButtons();
        this.screenLayout =
            new full_screen_header_footer_1.FullScreenHeaderFooter(new horizontal_center_1.HorizontalCenter, header, footer);
    }
    createButtons() {
        const buttons = new horizontal_center_1.HorizontalCenter(config.margin);
        const buttonTextStyle = new PIXI.TextStyle({
            align: config.button.text.align,
            lineJoin: config.button.text.lineJoin,
            fill: PIXI.utils.rgb2hex(config.button.text.fill),
            stroke: PIXI.utils.rgb2hex(config.button.text.stroke),
            strokeThickness: config.button.text.strokeThickness
        });
        const buttonStyle = new button_1.ButtonStyle(config.button.width, config.button.height, buttonTextStyle, PIXI.utils.rgb2hex(config.button.fill), config.button.strokeThickness, PIXI.utils.rgb2hex(config.button.stroke));
        const smallButtonStyle = new button_1.ButtonStyle(config.button.width / 2, config.button.height, buttonTextStyle, PIXI.utils.rgb2hex(config.button.fill), config.button.strokeThickness, PIXI.utils.rgb2hex(config.button.stroke));
        // Reduce the simulation size by one
        const resizeDownButton = new button_1.Button('-', smallButtonStyle);
        resizeDownButton.on('pressed', () => this.emit('resize', -1));
        buttons.addChild(resizeDownButton);
        // Increase the simulation size by one
        const resizeUpButton = new button_1.Button('+', smallButtonStyle);
        resizeUpButton.on('pressed', () => this.emit('resize', 1));
        buttons.addChild(resizeUpButton);
        // Shuffle the arrow directions
        const shuffleButton = new button_1.Button('Shuffle', buttonStyle);
        shuffleButton.on('pressed', () => this.emit('shuffle'));
        buttons.addChild(shuffleButton);
        // Start the simulation; the controller will handle delaying the
        // simulation's iterator to allow the visualization time to animate
        const playButton = new button_1.Button('Play', buttonStyle);
        playButton.on('pressed', () => this.emit('play'));
        buttons.addChild(playButton);
        // Stop the simluation and move the checkers back to starting position
        const stopButton = new button_1.Button('Stop', buttonStyle);
        stopButton.on('pressed', () => this.emit('stop'));
        buttons.addChild(stopButton);
        return buttons;
    }
    createMessage() {
        // Message that appears on the top of the screen
        // The message text is set by the controller using showMessage()
        const message = new PIXI.Text('Press Play to Begin', new PIXI.TextStyle({
            align: config.message.align,
            lineJoin: config.message.lineJoin,
            fill: config.message.fill.map(color => PIXI.utils.rgb2hex(color)),
            stroke: PIXI.utils.rgb2hex(config.message.stroke),
            strokeThickness: config.message.strokeThickness
        }));
        message.anchor.set(.5, 0);
        message.position = new PIXI.Point(0, config.message.fromTop);
        return message;
    }
    setupBoard(boardLayout) {
        // TBD: Move this sort of logic to layout container class
        const boardPixelSize = Math.min(this.screenLayout.bodyWidth, this.screenLayout.bodyHeight);
        // The board will contain the checkers and squares
        this.screenLayout.addToBody(this.board = new directed_checker_board_1.DirectedCheckerBoard(boardLayout, boardPixelSize, PIXI.utils.rgb2hex(config.board.odd.fill), PIXI.utils.rgb2hex(config.board.even.fill)));
        this.board.position = new PIXI.Point(0, this.screenLayout.bodyHeight / 2);
    }
    setupCheckers() {
        // The checkers are children of the board for proper positioning
        this.board.addChild(this.checker1 = new checker_1.Checker(this.board.squareSize * config.checker.relativeSize, 
        // Semi-transparent so that the arrows can be seen
        config.checker.alpha, config.checker.strokeThickness, PIXI.utils.rgb2hex(config.checker.stroke), PIXI.utils.rgb2hex(config.checker.fill)));
        this.board.addChild(this.checker2 = new checker_1.Checker(this.board.squareSize * config.checker.relativeSize, 
        // Semi-transparent so that the arrows can be seen
        config.checker.alpha, config.checker.strokeThickness, PIXI.utils.rgb2hex(config.checker.stroke), PIXI.utils.rgb2hex(config.checker.fill)));
    }
    resize(size) {
        // Create squares as needed, set their position and color,
        // and set all arrow directions from the simulation layout
        this.board.resize(size);
        this.checker1.resize(this.board.squareSize * config.checker.relativeSize);
        this.checker2.resize(this.board.squareSize * config.checker.relativeSize);
    }
}
exports.Visualization = Visualization;

},{"./components/checkers/checker":4,"./components/checkers/directed/directed-checker-board":5,"./components/layouts/full-screen-header-footer":7,"./components/layouts/horizontal-center":8,"./components/ui/button":10,"./sound-manager":13,"events":undefined,"fs":undefined,"gsap/TweenLite":undefined,"pixi.js":undefined}]},{},[11])(11)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9jaGVja2Vycy9ib2FyZC1sYXlvdXQudHMiLCJzcmMvY29tcG9uZW50cy9jaGVja2Vycy9jaGVja2VyLWJvYXJkLnRzIiwic3JjL2NvbXBvbmVudHMvY2hlY2tlcnMvY2hlY2tlci1zcXVhcmUudHMiLCJzcmMvY29tcG9uZW50cy9jaGVja2Vycy9jaGVja2VyLnRzIiwic3JjL2NvbXBvbmVudHMvY2hlY2tlcnMvZGlyZWN0ZWQvZGlyZWN0ZWQtY2hlY2tlci1ib2FyZC50cyIsInNyYy9jb21wb25lbnRzL2NoZWNrZXJzL2RpcmVjdGVkL2RpcmVjdGVkLWNoZWNrZXItc3F1YXJlLnRzIiwic3JjL2NvbXBvbmVudHMvbGF5b3V0cy9mdWxsLXNjcmVlbi1oZWFkZXItZm9vdGVyLnRzIiwic3JjL2NvbXBvbmVudHMvbGF5b3V0cy9ob3Jpem9udGFsLWNlbnRlci50cyIsInNyYy9jb21wb25lbnRzL3VpL2Fycm93LnRzIiwic3JjL2NvbXBvbmVudHMvdWkvYnV0dG9uLnRzIiwic3JjL2luZGV4LnRzIiwic3JjL3NpbXVsYXRpb24udHMiLCJzcmMvc291bmQtbWFuYWdlci50cyIsInNyYy92aXN1YWxpemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNVQTtJQUdFLFlBQW1CLEdBQUcsRUFBRSxHQUFHO1FBQ3pCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDaEIsQ0FBQztDQUNGO0FBUEQsc0NBT0M7Ozs7O0FDakJELGdDQUErQjtBQUMvQixpREFBNEM7QUFFNUMscURBQThDO0FBZ0I5QyxrQkFBd0QsU0FBUSxJQUFJLENBQUMsU0FBUztJQVk1RSxZQUNFLElBQVcsRUFDWCxTQUFnQixFQUNoQixXQUFrQixRQUFRLEVBQzFCLFlBQW1CLFFBQVE7UUFDM0IsNERB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O0NBQ0Y7QUFyT0Qsc0NBcU9DIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuZXhwb3J0IGNvbnN0IGVudW0gRGlyZWN0aW9uIHtcbiAgVXAgPSAwLFxuICBSaWdodCxcbiAgRG93bixcbiAgTGVmdFxufVxuXG5leHBvcnQgdHlwZSBCb2FyZExheW91dCA9IERpcmVjdGlvbltdW11cblxuZXhwb3J0IGNsYXNzIEJvYXJkUG9zaXRpb24ge1xuICBwdWJsaWMgcm93Om51bWJlclxuICBwdWJsaWMgY29sOm51bWJlclxuICBwdWJsaWMgY29uc3RydWN0b3Iocm93LCBjb2wpIHtcbiAgICB0aGlzLnJvdyA9IHJvd1xuICAgIHRoaXMuY29sID0gY29sXG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIFBJWEkgZnJvbSAncGl4aS5qcydcbmltcG9ydCB7Qm9hcmRQb3NpdGlvbn0gZnJvbSAnLi9ib2FyZC1sYXlvdXQnXG5pbXBvcnQge0NoZWNrZXJ9IGZyb20gJy4vY2hlY2tlcidcbmltcG9ydCB7Q2hlY2tlclNxdWFyZX0gZnJvbSAnLi9jaGVja2VyLXNxdWFyZSdcblxuLy8gRGVmaW5lIFNxdWFyZSBhcyBuZXdhYmxlIHRvIGFsbG93IFwibmV3IHRoaXMuY3JlYXRlU3F1YXJlXCIgdG8gY3JlYXRlIGEgbmV3XG4vLyBTcXVhcmUuIFRoaXMgZm9yY2VzIFNxdWFyZSdzIGNvbnN0cnVjdG9yIHRvIHNhbWUgcGFyYW1ldGVyIGxpc3QgYXNcbi8vIENoZWNrZXJTcXVhcmUsIHdoaWNoIHdpbGwgYWxsb3cgdGhlIGJvYXJkIHRvIGNyZWF0ZSBzcXVhcmVzIG9mIHRoZVxuLy8gYXBwcm9wcmlhdGUgdHlwZSAoZ2VuZXJpYyBTcXVhcmUpXG5pbnRlcmZhY2UgQ3JlYXRlU3F1YXJlPFNxdWFyZSBleHRlbmRzIENoZWNrZXJTcXVhcmU+IHtcbiAgbmV3IChcbiAgICBwb3NpdGlvbjpCb2FyZFBvc2l0aW9uLFxuICAgIHBpeGVsU2l6ZTpudW1iZXIsXG4gICAgZXZlbjpib29sZWFuLFxuICAgIG9kZENvbG9yOm51bWJlcixcbiAgICBldmVuQ29sb3I6bnVtYmVyXG4gICk6U3F1YXJlXG59XG5cbmV4cG9ydCBjbGFzcyBDaGVja2VyQm9hcmQ8U3F1YXJlIGV4dGVuZHMgQ2hlY2tlclNxdWFyZT4gZXh0ZW5kcyBQSVhJLkNvbnRhaW5lciB7XG5cbiAgcHVibGljIHNpemU6bnVtYmVyXG4gIHByb3RlY3RlZCBwaXhlbFNpemU6bnVtYmVyXG4gIHByb3RlY3RlZCBvZGRDb2xvcjpudW1iZXJcbiAgcHJvdGVjdGVkIGV2ZW5Db2xvcjpudW1iZXJcbiAgcHVibGljIHNxdWFyZVNpemU6bnVtYmVyXG4gIHByb3RlY3RlZCBzcXVhcmVzOlNxdWFyZVtdW10gPSBbXVxuICAvLyBJIGhhdmVuJ3QgeWV0IGZpZ3VyZWQgb3V0IGhvdyB0byBzZXQgYSBkZWZhdWx0IHZhbHVlIGhlcmVcbiAgLy8gKGRlc2lyZWQ6IENoZWNrZXJTcXVhcmUpOyBzbyBJIHVzZSBhIGNvbmRpdGlvbmFsIGluIHRoaXMuc2V0dXBTcXVhcmUoKVxuICBwcml2YXRlIGNyZWF0ZVNxdWFyZTpDcmVhdGVTcXVhcmU8U3F1YXJlPlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBzaXplOm51bWJlcixcbiAgICBwaXhlbFNpemU6bnVtYmVyLFxuICAgIG9kZENvbG9yOm51bWJlciA9IDB4MTExMTExLFxuICAgIGV2ZW5Db2xvcjpudW1iZXIgPSAweGVlMTExMSxcbiAgICAvLyBJIGhhdmVuJ3QgeWV0IGZpZ3VyZWQgb3V0IGhvdyB0byBzZXQgYSBkZWZhdWx0IHZhbHVlIGhlcmVcbiAgICAvLyAoZGVzaXJlZDogQ2hlY2tlclNxdWFyZSk7IHNvIEkgdXNlIGEgY29uZGl0aW9uYWwgaW4gdGhpcy5zZXR1cFNxdWFyZSgpXG4gICAgY3JlYXRlU3F1YXJlOkNyZWF0ZVNxdWFyZTxTcXVhcmU+ID0gbnVsbFxuICApIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5waXhlbFNpemUgPSBwaXhlbFNpemVcbiAgICB0aGlzLm9kZENvbG9yID0gb2RkQ29sb3JcbiAgICB0aGlzLmV2ZW5Db2xvciA9IGV2ZW5Db2xvclxuICAgIHRoaXMuY3JlYXRlU3F1YXJlID0gY3JlYXRlU3F1YXJlXG4gICAgdGhpcy5yZXNpemUoc2l6ZSlcbiAgfVxuXG4gIHB1YmxpYyByZXNpemUoc2l6ZTpudW1iZXIpOnZvaWQge1xuICAgIHRoaXMuc2l6ZSA9IHNpemVcbiAgICB0aGlzLnNxdWFyZVNpemUgPSB0aGlzLnBpeGVsU2l6ZSAvIHRoaXMuc2l6ZVxuICAgIHRoaXMuc2hyaW5rKClcbiAgICB0aGlzLmV4cGFuZEFuZENvbG9yaXplKClcbiAgfVxuXG4gIHB1YmxpYyB0b1RvcChvYmplY3Q6UElYSS5EaXNwbGF5T2JqZWN0KTp2b2lkIHtcbiAgICB0aGlzLnJlbW92ZUNoaWxkKG9iamVjdClcbiAgICB0aGlzLmFkZENoaWxkKG9iamVjdClcbiAgfVxuXG4gIHB1YmxpYyBib2FyZFBvc2l0aW9uVG9QaXhlbHMoYm9hcmRQb3NpdGlvbjpCb2FyZFBvc2l0aW9uKTpQSVhJLlBvaW50IHtcbiAgICByZXR1cm4gbmV3IFBJWEkuUG9pbnQoXG4gICAgICAoYm9hcmRQb3NpdGlvbi5jb2wgLSB0aGlzLnNpemUgLyAyKSAqIHRoaXMuc3F1YXJlU2l6ZSArIHRoaXMuc3F1YXJlU2l6ZSAvIDIsXG4gICAgICAoYm9hcmRQb3NpdGlvbi5yb3cgLSB0aGlzLnNpemUgLyAyKSAqIHRoaXMuc3F1YXJlU2l6ZSArIHRoaXMuc3F1YXJlU2l6ZSAvIDJcbiAgICApXG4gIH1cblxuICAvLyBEZXN0cm95IGV4dHJhIGJvYXJkIHBvc2l0aW9ucyBpZiB0aGUgbmV3IGJvYXJkIGxheW91dCBpcyBzbWFsbGVyIHRoYW4gdGhlXG4gIC8vIGxhc3QgYm9hcmRcbiAgcHJpdmF0ZSBzaHJpbmsoKTp2b2lkIHtcbiAgICB3aGlsZSh0aGlzLnNxdWFyZXMubGVuZ3RoID4gdGhpcy5zaXplKSB7XG4gICAgICAvLyBEZWxldGUgdGhlIGxhc3Qgcm93XG4gICAgICBjb25zdCByb3c6U3F1YXJlW10gPSB0aGlzLnNxdWFyZXNbdGhpcy5zcXVhcmVzLmxlbmd0aCAtIDFdXG4gICAgICB3aGlsZShyb3cubGVuZ3RoID4gMClcbiAgICAgICAgcm93LnBvcCgpLmRlc3Ryb3koKVxuICAgICAgdGhpcy5zcXVhcmVzLnBvcCgpXG4gICAgICAvLyBEZWxldGUgdGhlIGxhc3QgY29sdW1uIGZyb20gZWFjaCByb3dcbiAgICAgIGZvcihsZXQgcm93IG9mIHRoaXMuc3F1YXJlcylcbiAgICAgICAgcm93LnBvcCgpLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuXG4gIC8vIEFkZCBzcXVhcmVzIG9mIHRoZSBhcHByb3ByaWF0ZSBzaXplLCBjb2xvciwgYW5kIHBvc2l0aW9uIHRvIGZpbGwgdGhlXG4gIC8vIGJvYXJkJ3MgcGl4ZWwgc2l6ZTsgcmVzaXplIGFuZCBzZXQgcG9zaXRpb24gYW5kIGNvbG9yIGZvciBleGlzdGluZyBzcXVhcmVzXG4gIHByaXZhdGUgZXhwYW5kQW5kQ29sb3JpemUoKTp2b2lkIHtcbiAgICAvLyBldmVuIHRyYWNrcyB0aGUgYWx0ZXJuYXRpbmcgc3F1YXJlIGNvbG9yc1xuICAgIGxldCBldmVuOmJvb2xlYW4gPSBmYWxzZVxuICAgIC8vIEl0ZXJhdGUgb3ZlciB0aGUgYm9hcmQgcG9zaXRpb25zIGZvciB0aGUgZ2l2ZW4gYm9hcmQgc2l6ZVxuICAgIGZvcihsZXQgcm93Om51bWJlciA9IDAgOyByb3cgPCB0aGlzLnNpemUgOyByb3crKykge1xuICAgICAgLy8gQWRkIHRoZSByb3cgaWYgb3VyIGJvYXJkIGlzbid0IHRoYXQgYmlnIHlldFxuICAgICAgaWYocm93ID4gdGhpcy5zcXVhcmVzLmxlbmd0aCAtIDEpXG4gICAgICAgIHRoaXMuc3F1YXJlcy5wdXNoKFtdKVxuICAgICAgZm9yKGxldCBjb2w6bnVtYmVyID0gMCA7IGNvbCA8IHRoaXMuc2l6ZSA7IGNvbCsrKSB7XG4gICAgICAgIHRoaXMuc2V0dXBTcXVhcmUobmV3IEJvYXJkUG9zaXRpb24ocm93LCBjb2wpLCBldmVuKVxuICAgICAgICAvLyBTdGFnZ2VyIHRoZSBzcXVhcmUgY29sb3JzXG4gICAgICAgIGV2ZW4gPSAhZXZlblxuICAgICAgfVxuICAgICAgLy8gRm9yIGV2ZW4tc2l6ZWQgYm9hcmRzLCBoYXZlIHRvIHN0YWdnZXIgdGhlIHNxdWFyZSBjb2xvcnMgYmFja1xuICAgICAgaWYodGhpcy5zaXplICUgMiA9PT0gMClcbiAgICAgICAgZXZlbiA9ICFldmVuXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXR1cFNxdWFyZShwb3NpdGlvbjpCb2FyZFBvc2l0aW9uLCBldmVuOmJvb2xlYW4pOnZvaWQge1xuICAgIGxldCBzcXVhcmU6U3F1YXJlXG4gICAgLy8gSWYgd2UgZG9uJ3QgeWV0IGhhdmUgYSBzcXVhcmUgZm9yIHRoaXMgcG9zaXRpb24sIGNyZWF0ZSBpdFxuICAgIGlmKHBvc2l0aW9uLmNvbCA+IHRoaXMuc3F1YXJlc1twb3NpdGlvbi5yb3ddLmxlbmd0aCAtIDEpIHtcbiAgICAgIC8vIEkgaGF2ZW4ndCB5ZXQgZmlndXJlZCBvdXQgaG93IHRvIHNldCBhIGRlZmF1bHQgdmFsdWUgZm9yXG4gICAgICAvLyB0aGlzLmNyZWF0ZVNxdWFyZSwgc28gSSB1c2UgYSBjb25kaXRpb25hbCBoZXJlIGZvciB0aGUgZGVmYXVsdFxuICAgICAgc3F1YXJlID0gdGhpcy5jcmVhdGVTcXVhcmVcbiAgICAgICAgPyBuZXcgdGhpcy5jcmVhdGVTcXVhcmUoXG4gICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgdGhpcy5zcXVhcmVTaXplLFxuICAgICAgICAgIGV2ZW4sXG4gICAgICAgICAgdGhpcy5vZGRDb2xvcixcbiAgICAgICAgICB0aGlzLmV2ZW5Db2xvclxuICAgICAgICApXG4gICAgICAgIDogbmV3IENoZWNrZXJTcXVhcmUoXG4gICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgdGhpcy5zcXVhcmVTaXplLFxuICAgICAgICAgIGV2ZW4sXG4gICAgICAgICAgdGhpcy5vZGRDb2xvcixcbiAgICAgICAgICB0aGlzLmV2ZW5Db2xvclxuICAgICAgICApIGFzIFNxdWFyZVxuICAgICAgdGhpcy5hZGRDaGlsZChzcXVhcmUpXG4gICAgICB0aGlzLnNxdWFyZXNbcG9zaXRpb24ucm93XS5wdXNoKHNxdWFyZSlcbiAgICB9XG4gICAgLy8gSWYgd2UgZG8gaGF2ZSBhIHNxdWFyZSBhdCB0aGlzIHBvc2l0aW9uIGFscmVhZHksIHRlbGwgaXQgdG8gcmVzZXRcbiAgICAvLyBpdHMgcG9zaXRpb24sIGNvbG9yLCBhbmQgYXJyb3cgZGlyZWN0aW9uIGlmIG5lZWRlZFxuICAgIGVsc2Uge1xuICAgICAgc3F1YXJlID0gdGhpcy5zcXVhcmVzW3Bvc2l0aW9uLnJvd11bcG9zaXRpb24uY29sXVxuICAgICAgc3F1YXJlLnJlc2V0KHRoaXMuc3F1YXJlU2l6ZSwgZXZlbilcbiAgICB9XG4gICAgc3F1YXJlLnBvc2l0aW9uID0gdGhpcy5ib2FyZFBvc2l0aW9uVG9QaXhlbHMocG9zaXRpb24pXG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIFBJWEkgZnJvbSAncGl4aS5qcydcbmltcG9ydCB7Qm9hcmRQb3NpdGlvbn0gZnJvbSAnLi9ib2FyZC1sYXlvdXQnXG5cbmV4cG9ydCBjbGFzcyBDaGVja2VyU3F1YXJlIGV4dGVuZHMgUElYSS5HcmFwaGljcyB7XG5cbiAgcHVibGljIGJvYXJkUG9zaXRpb246Qm9hcmRQb3NpdGlvblxuICBwcml2YXRlIHBpeGVsU2l6ZTpudW1iZXJcbiAgcHJpdmF0ZSBldmVuOmJvb2xlYW5cbiAgcHJpdmF0ZSBvZGRDb2xvcjpudW1iZXJcbiAgcHJpdmF0ZSBldmVuQ29sb3I6bnVtYmVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIGJvYXJkUG9zaXRpb246Qm9hcmRQb3NpdGlvbixcbiAgICBwaXhlbFNpemU6bnVtYmVyLFxuICAgIGV2ZW46Ym9vbGVhbixcbiAgICBvZGRDb2xvcjpudW1iZXIgPSAweDExMTExMSxcbiAgICBldmVuQ29sb3I6bnVtYmVyID0gMHhlZTExMTEsXG4gICAgbGluZXM6Ym9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHN1cGVyKCkgLy9saW5lcylcbiAgICB0aGlzLmJvYXJkUG9zaXRpb24gPSBib2FyZFBvc2l0aW9uXG4gICAgdGhpcy5waXhlbFNpemUgPSBwaXhlbFNpemVcbiAgICB0aGlzLmV2ZW4gPSBldmVuXG4gICAgdGhpcy5vZGRDb2xvciA9IG9kZENvbG9yXG4gICAgdGhpcy5ldmVuQ29sb3IgPSBldmVuQ29sb3JcbiAgICB0aGlzLnJlZHJhdygpXG4gIH1cblxuICBwdWJsaWMgcmVzZXQocGl4ZWxTaXplOm51bWJlciwgZXZlbjpib29sZWFuKTp2b2lkIHtcbiAgICAvLyBJZiB0aGUgcGl4ZWwgc2l6ZSBvciBjb2xvciBvZiB0aGUgc3F1YXJlIGNoYW5nZXMsIHJlY3JlYXRlIHRoZSBzcXVhcmVcbiAgICBpZih0aGlzLnBpeGVsU2l6ZSAhPT0gcGl4ZWxTaXplIHx8IHRoaXMuZXZlbiAhPT0gZXZlbikge1xuICAgICAgdGhpcy5waXhlbFNpemUgPSBwaXhlbFNpemVcbiAgICAgIHRoaXMuZXZlbiA9IGV2ZW5cbiAgICAgIC8vIFJlZHJhdyB0aGUgc3F1YXJlIGFuZCBhcnJvdyBhdCB0aGUgcHJvcGVyIHNpemUgYW5kIHBvc2l0aW9uXG4gICAgICB0aGlzLnJlZHJhdygpXG4gICAgfVxuICB9XG5cbiAgLy8gV2Uga2VlcCB0cmFjayBvZiBldmVuL29kZCBpbiBhbiBpbnN0YW5jZSB2YXJpYWJsZSB0byBzZWUgaWYgd2UgbmVlZCB0b1xuICAvLyByZWNyZWF0ZSB0aGUgc3F1YXJlOyBJJ2QgcHJlZmVyIHRvIHBhc3MgaXQsIGJ1dCBoZXkgd2UgYWxyZWFkeSBoYXZlIGl0XG4gIHByaXZhdGUgcmVkcmF3KCk6dm9pZCB7XG4gICAgdGhpcy5jbGVhcigpXG4gICAgdGhpcy5iZWdpbkZpbGwodGhpcy5ldmVuID8gdGhpcy5ldmVuQ29sb3IgOiB0aGlzLm9kZENvbG9yKVxuICAgIC8vIENlbnRlciBpdCBvbiB0aGUgaXRzIHBvc2l0aW9uXG4gICAgdGhpcy5kcmF3UmVjdChcbiAgICAgIC10aGlzLnBpeGVsU2l6ZSAvIDIsXG4gICAgICAtdGhpcy5waXhlbFNpemUgLyAyLFxuICAgICAgdGhpcy5waXhlbFNpemUsXG4gICAgICB0aGlzLnBpeGVsU2l6ZVxuICAgIClcbiAgICB0aGlzLmVuZEZpbGwoKVxuICB9XG5cbn1cbiIsImltcG9ydCAqIGFzIFBJWEkgZnJvbSAncGl4aS5qcydcblxuZXhwb3J0IGNsYXNzIENoZWNrZXIgZXh0ZW5kcyBQSVhJLkdyYXBoaWNzIHtcblxuICBwcml2YXRlIHN0cm9rZVRoaWNrbmVzczpudW1iZXJcbiAgcHJpdmF0ZSBzdHJva2U6bnVtYmVyXG4gIHByaXZhdGUgZmlsbDpudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgc2l6ZTpudW1iZXIsXG4gICAgYWxwaGE6bnVtYmVyID0gMSxcbiAgICBzdHJva2VUaGlja25lc3M6bnVtYmVyID0gMCxcbiAgICBzdHJva2UgPSAweDAwMDAwMCxcbiAgICBmaWxsOm51bWJlciA9IDB4MTExMTExLFxuICAgIGxpbmVzOmJvb2xlYW4gPSBmYWxzZSxcbiAgKSB7XG4gICAgc3VwZXIoKSAvL2xpbmVzKVxuICAgIC8vIFNlbWktdHJhbnNwYXJlbnQgc28gdGhhdCB0aGUgYXJyb3dzIGNhbiBiZSBzZWVuXG4gICAgdGhpcy5hbHBoYSA9IGFscGhhXG4gICAgdGhpcy5zdHJva2VUaGlja25lc3MgPSBzdHJva2VUaGlja25lc3NcbiAgICB0aGlzLnN0cm9rZSA9IHN0cm9rZVxuICAgIHRoaXMuZmlsbCA9IGZpbGxcbiAgICB0aGlzLnJlc2l6ZShzaXplKVxuICB9XG5cbiAgcHVibGljIHJlc2l6ZShzaXplOm51bWJlcikge1xuICAgIHRoaXMuY2xlYXIoKVxuICAgIHRoaXMubGluZVN0eWxlKHRoaXMuc3Ryb2tlVGhpY2tuZXNzLCB0aGlzLnN0cm9rZSlcbiAgICB0aGlzLmJlZ2luRmlsbCh0aGlzLmZpbGwpXG4gICAgLy8gU2V0IHNjYWxlIHJlbGF0aXZlIHRvIHNxdWFyZSBzaXplXG4gICAgdGhpcy5kcmF3Q2lyY2xlKDAsIDAsIHNpemUpXG4gICAgdGhpcy5lbmRGaWxsKClcbiAgfVxufVxuIiwiaW1wb3J0IHtDaGVja2VyQm9hcmR9IGZyb20gJy4uL2NoZWNrZXItYm9hcmQnXG5pbXBvcnQge0RpcmVjdGVkQ2hlY2tlclNxdWFyZX0gZnJvbSAnLi9kaXJlY3RlZC1jaGVja2VyLXNxdWFyZSdcbmltcG9ydCB7RGlyZWN0aW9uLCBCb2FyZExheW91dH0gZnJvbSAnLi4vYm9hcmQtbGF5b3V0J1xuXG5leHBvcnQgY2xhc3MgRGlyZWN0ZWRDaGVja2VyQm9hcmQgZXh0ZW5kcyBDaGVja2VyQm9hcmQ8RGlyZWN0ZWRDaGVja2VyU3F1YXJlPiB7XG5cbiAgcHJpdmF0ZSBib2FyZExheW91dDpCb2FyZExheW91dFxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBib2FyZExheW91dDpCb2FyZExheW91dCxcbiAgICBwaXhlbFNpemU6bnVtYmVyLFxuICAgIG9kZENvbG9yOm51bWJlciA9IDB4MTExMTExLFxuICAgIGV2ZW5Db2xvcjpudW1iZXIgPSAweGVlMTExMVxuICApIHtcbiAgICBzdXBlcihcbiAgICAgIGJvYXJkTGF5b3V0Lmxlbmd0aCxcbiAgICAgIHBpeGVsU2l6ZSxcbiAgICAgIG9kZENvbG9yLFxuICAgICAgZXZlbkNvbG9yLFxuICAgICAgRGlyZWN0ZWRDaGVja2VyU3F1YXJlXG4gICAgKVxuICAgIHRoaXMuc2V0Qm9hcmRMYXlvdXQoYm9hcmRMYXlvdXQpXG4gIH1cblxuICBwdWJsaWMgc2V0Qm9hcmRMYXlvdXQoYm9hcmRMYXlvdXQ6Qm9hcmRMYXlvdXQpIHtcbiAgICBmb3IobGV0IHJvdzpudW1iZXIgPSAwIDsgcm93IDwgYm9hcmRMYXlvdXQubGVuZ3RoIDsgcm93KyspIHtcbiAgICAgIGZvcihsZXQgY29sOm51bWJlciA9IDAgOyBjb2wgPCBib2FyZExheW91dC5sZW5ndGggOyBjb2wrKykge1xuICAgICAgICBjb25zdCBzcXVhcmU6RGlyZWN0ZWRDaGVja2VyU3F1YXJlID1cbiAgICAgICAgICB0aGlzLnNxdWFyZXNbcm93XVtjb2xdIGFzIERpcmVjdGVkQ2hlY2tlclNxdWFyZVxuICAgICAgICBzcXVhcmUuc2V0RGlyZWN0aW9uKGJvYXJkTGF5b3V0W3Jvd11bY29sXSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7QXJyb3d9IGZyb20gJy4uLy4uL3VpL2Fycm93J1xuaW1wb3J0IHtDaGVja2VyU3F1YXJlfSBmcm9tICcuLi9jaGVja2VyLXNxdWFyZSdcbmltcG9ydCB7Qm9hcmRQb3NpdGlvbiwgRGlyZWN0aW9ufSBmcm9tICcuLi9ib2FyZC1sYXlvdXQnXG5cbmV4cG9ydCBjbGFzcyBEaXJlY3RlZENoZWNrZXJTcXVhcmUgZXh0ZW5kcyBDaGVja2VyU3F1YXJlIHtcblxuICBwcml2YXRlIGFycm93OkFycm93XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHBvc2l0aW9uOkJvYXJkUG9zaXRpb24sXG4gICAgcGl4ZWxTaXplOm51bWJlcixcbiAgICBldmVuOmJvb2xlYW4sXG4gICAgb2RkQ29sb3I6bnVtYmVyID0gMHgxMTExMTEsXG4gICAgZXZlbkNvbG9yOm51bWJlciA9IDB4ZWUxMTExLFxuICAgIGRpcmVjdGlvbjpEaXJlY3Rpb24gPSBEaXJlY3Rpb24uVXAsXG4gICAgYXJyb3dDb2xvcjpudW1iZXIgPSAweGZmZmZmZixcbiAgICBsaW5lczpib29sZWFuID0gZmFsc2VcbiAgKSB7XG4gICAgc3VwZXIocG9zaXRpb24sIHBpeGVsU2l6ZSwgZXZlbiwgb2RkQ29sb3IsIGV2ZW5Db2xvciwgbGluZXMpXG4gICAgdGhpcy5hZGRDaGlsZCh0aGlzLmFycm93ID0gbmV3IEFycm93KHBpeGVsU2l6ZSwgZGlyZWN0aW9uLCBhcnJvd0NvbG9yKSlcbiAgfVxuXG4gIHB1YmxpYyByZXNldChwaXhlbFNpemU6bnVtYmVyLCBldmVuOmJvb2xlYW4pIHtcbiAgICBzdXBlci5yZXNldChwaXhlbFNpemUsIGV2ZW4pXG4gICAgdGhpcy5hcnJvdy5yZWRyYXcocGl4ZWxTaXplKVxuICB9XG5cbiAgcHVibGljIHNldERpcmVjdGlvbihkaXJlY3Rpb246RGlyZWN0aW9uKSB7XG4gICAgdGhpcy5hcnJvdy5zZXREaXJlY3Rpb24oZGlyZWN0aW9uKVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnXG5cbmV4cG9ydCBjbGFzcyBGdWxsU2NyZWVuSGVhZGVyRm9vdGVyIGV4dGVuZHMgUElYSS5Db250YWluZXIge1xuXG4gIHByaXZhdGUgYm9keTpQSVhJLkNvbnRhaW5lclxuICBwdWJsaWMgcmVhZG9ubHkgYm9keVdpZHRoOm51bWJlclxuICBwdWJsaWMgcmVhZG9ubHkgYm9keUhlaWdodDpudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgYm9keTpQSVhJLkNvbnRhaW5lcixcbiAgICBoZWFkZXI6UElYSS5EaXNwbGF5T2JqZWN0ID0gbnVsbCxcbiAgICBmb290ZXI6UElYSS5EaXNwbGF5T2JqZWN0ID0gbnVsbCxcbiAgKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuYm9keSA9IGJvZHlcbiAgICBjb25zdCBzY3JlZW5XaWR0aCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aFxuICAgIGNvbnN0IHNjcmVlbkhlaWdodCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICBjb25zdCBoZWFkZXJIZWlnaHQgPSBoZWFkZXIgPyBoZWFkZXIuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQgOiAwXG4gICAgY29uc3QgZm9vdGVySGVpZ2h0ID0gZm9vdGVyID8gZm9vdGVyLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0IDogMFxuICAgIGlmKGhlYWRlcikge1xuICAgICAgdGhpcy5hZGRDaGlsZChoZWFkZXIpXG4gICAgICBoZWFkZXIucG9zaXRpb24gPSBuZXcgUElYSS5Qb2ludChzY3JlZW5XaWR0aCAvIDIsIDApXG4gICAgfVxuICAgIHRoaXMuYWRkQ2hpbGQoYm9keSlcbiAgICBib2R5LnBvc2l0aW9uID0gbmV3IFBJWEkuUG9pbnQoc2NyZWVuV2lkdGggLyAyLCBoZWFkZXJIZWlnaHQgKiAyKVxuICAgIGlmKGZvb3Rlcikge1xuICAgICAgdGhpcy5hZGRDaGlsZChmb290ZXIpXG4gICAgICBmb290ZXIucG9zaXRpb24gPSBuZXcgUElYSS5Qb2ludChzY3JlZW5XaWR0aCAvIDIsIHNjcmVlbkhlaWdodCAtIGZvb3RlckhlaWdodCAvIDIpXG4gICAgfVxuICAgIHRoaXMuYm9keVdpZHRoID0gc2NyZWVuV2lkdGhcbiAgICB0aGlzLmJvZHlIZWlnaHQgPSBzY3JlZW5IZWlnaHQgLSBoZWFkZXJIZWlnaHQgKiAyIC0gZm9vdGVySGVpZ2h0ICogMlxuICB9XG5cbiAgcHVibGljIGFkZFRvQm9keShjaGlsZDpQSVhJLkRpc3BsYXlPYmplY3QpOlBJWEkuRGlzcGxheU9iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMuYm9keS5hZGRDaGlsZChjaGlsZClcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJ1xuXG5leHBvcnQgY2xhc3MgSG9yaXpvbnRhbENlbnRlciBleHRlbmRzIFBJWEkuQ29udGFpbmVyIHtcblxuICBwcml2YXRlIG1hcmdpbjpudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IobWFyZ2luOm51bWJlciA9IDApIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5zZXRNYXJnaW4obWFyZ2luKVxuICAgIHRoaXMub25DaGlsZHJlbkNoYW5nZSA9IHRoaXMucmVwb3NpdGlvbkNoaWxkcmVuXG4gIH1cblxuICBwdWJsaWMgc2V0TWFyZ2luKG1hcmdpbjpudW1iZXIpIHtcbiAgICB0aGlzLm1hcmdpbiA9IG1hcmdpblxuICAgIHRoaXMucmVwb3NpdGlvbkNoaWxkcmVuKClcbiAgfVxuXG4gIHByaXZhdGUgcmVwb3NpdGlvbkNoaWxkcmVuKCk6dm9pZCB7XG4gICAgY29uc3QgZnVsbFdpZHRoOm51bWJlciA9XG4gICAgICB0aGlzLmNoaWxkcmVuXG4gICAgICAgIC5tYXAoY2hpbGQgPT4gY2hpbGQuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aClcbiAgICAgICAgLnJlZHVjZSgoc3VtLCB3aWR0aCkgPT4gc3VtICs9IHdpZHRoLCAwKVxuICAgICAgKyB0aGlzLm1hcmdpbiAqIHRoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMVxuICAgIGxldCBsZWZ0Om51bWJlciA9IC1mdWxsV2lkdGggLyAyXG4gICAgZm9yKGxldCBjOm51bWJlciA9IDAgOyBjIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGggOyBjKyspIHtcbiAgICAgIGNvbnN0IGNoaWxkOlBJWEkuRGlzcGxheU9iamVjdCA9IHRoaXMuY2hpbGRyZW5bY11cbiAgICAgIGNvbnN0IHdpZHRoID0gY2hpbGQuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aFxuICAgICAgLy8gQ2VudGVyIGVhY2ggaXRlbSBvbiBpdHMgcG9zaXRpb25cbiAgICAgIGNoaWxkLnBvc2l0aW9uLnggPSBsZWZ0ICsgd2lkdGggLyAyXG4gICAgICBsZWZ0ICs9IHdpZHRoICsgdGhpcy5tYXJnaW5cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIFBJWEkgZnJvbSAncGl4aS5qcydcbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICcuLi9jaGVja2Vycy9ib2FyZC1sYXlvdXQnXG5cbmV4cG9ydCBjbGFzcyBBcnJvdyBleHRlbmRzIFBJWEkuR3JhcGhpY3Mge1xuICBkaXJlY3Rpb246RGlyZWN0aW9uID0gRGlyZWN0aW9uLlVwXG4gIGNvbG9yOm51bWJlclxuICBjb25zdHJ1Y3RvcihcbiAgICBzaXplOm51bWJlcixcbiAgICBkaXJlY3Rpb246RGlyZWN0aW9uID0gRGlyZWN0aW9uLlVwLFxuICAgIGNvbG9yPTB4ZmZmZmZmLFxuICAgIGxpbmVzOmJvb2xlYW4gPSBmYWxzZVxuICApIHtcbiAgICBzdXBlcigpIC8vbGluZXMpXG4gICAgdGhpcy5yZWRyYXcoc2l6ZSwgY29sb3IpXG4gICAgdGhpcy5zZXREaXJlY3Rpb24oZGlyZWN0aW9uKVxuICB9XG5cbiAgLy8gT25seSBpdHMgZmlsbCBjb2xvciBpcyBjb25maWd1cmFibGUsIGFuZCBubyBzdHJva2VcbiAgLy8gQXJyb3cgc2l6ZSBpcyBjYWxjdWxhdGVkIHJlbGF0aXZlIHRvIHNxdWFyZSBzaXplXG4gIC8vIEZ1bGwgb2YgXCJtYWdpYyBudW1iZXJzXCI6IFRCRCB0byBtb3ZlIHRoZXNlIHRvIGNvbmZpZ1xuICBwdWJsaWMgcmVkcmF3KHNpemU6bnVtYmVyLCBjb2xvcjpudW1iZXIgPSBudWxsKSB7XG4gICAgaWYoY29sb3IgPT0gbnVsbClcbiAgICAgIGNvbG9yID0gdGhpcy5jb2xvclxuICAgIGVsc2VcbiAgICAgIHRoaXMuY29sb3IgPSBjb2xvclxuICAgIHRoaXMuY2xlYXIoKVxuICAgIHRoaXMuYmVnaW5GaWxsKGNvbG9yKVxuICAgIC8vIFRoZSBib2R5IG9mIHRoZSBhcnJvd1xuICAgIHRoaXMuZHJhd1JlY3QoLXNpemUgLyAxMiwgLXNpemUgKiAuMiwgc2l6ZSAvIDYsIHNpemUgKiAuNilcbiAgICAvLyBUaGUgYXJyb3doZWFkXG4gICAgdGhpcy5kcmF3UG9seWdvbihbXG4gICAgICBuZXcgUElYSS5Qb2ludCgwLCAtc2l6ZSAqIC40KSxcbiAgICAgIG5ldyBQSVhJLlBvaW50KC1zaXplICogLjI1LCAtc2l6ZSAqIC4xKSxcbiAgICAgIG5ldyBQSVhJLlBvaW50KHNpemUgKiAuMjUsIC1zaXplICogLjEpXG4gICAgXSlcbiAgICB0aGlzLmVuZEZpbGwoKVxuICB9XG5cbiAgcHVibGljIHNldERpcmVjdGlvbihkaXJlY3Rpb246RGlyZWN0aW9uKSB7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb25cbiAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5QSSAvIDIgKiB0aGlzLmRpcmVjdGlvblxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnXG5cbmV4cG9ydCBjbGFzcyBCdXR0b24gZXh0ZW5kcyBQSVhJLkdyYXBoaWNzIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgbGFiZWw6c3RyaW5nLFxuICAgIHN0eWxlOkJ1dHRvblN0eWxlXG4gICkge1xuICAgIHN1cGVyKClcbiAgICAvLyBTZXQgdGhlIHN0eWxlcyBmcm9tIHRoZSBjb25maWcgYW5kIGRyYXcgdG8gY29uZmlndXJlZCBzaXplXG4gICAgdGhpcy5saW5lU3R5bGUoc3R5bGUuc3Ryb2tlVGhpY2tuZXNzLCBzdHlsZS5zdHJva2UpXG4gICAgdGhpcy5iZWdpbkZpbGwoc3R5bGUuZmlsbClcbiAgICB0aGlzLmRyYXdSZWN0KC1zdHlsZS53aWR0aCAvIDIsIC1zdHlsZS5oZWlnaHQgLyAyLCBzdHlsZS53aWR0aCwgc3R5bGUuaGVpZ2h0KVxuICAgIHRoaXMuZW5kRmlsbCgpXG4gICAgLy8gQWRkIHN0eWxlZCBidXR0b24gdGV4dFxuICAgIGNvbnN0IHRleHQ6UElYSS5UZXh0ID0gbmV3IFBJWEkuVGV4dChsYWJlbCwgc3R5bGUudGV4dFN0eWxlKVxuICAgIC8vIENlbnRlciB0aGUgdGV4dCBvbiB0aGUgYnV0dG9uXG4gICAgdGV4dC5hbmNob3Iuc2V0KC41KVxuICAgIHRoaXMuYWRkQ2hpbGQodGV4dClcbiAgICAvLyBTZXQgdXAgdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcbiAgICB0aGlzLm9uKCdtb3VzZXVwJywgKCkgPT4gdGhpcy5lbWl0KCdwcmVzc2VkJykpXG4gICAgdGhpcy5vbigndG91Y2hlbmQnLCAoKSA9PiB0aGlzLmVtaXQoJ3ByZXNzZWQnKSlcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQnV0dG9uU3R5bGUge1xuXG4gIHB1YmxpYyB3aWR0aDpudW1iZXJcbiAgcHVibGljIGhlaWdodDpudW1iZXJcbiAgcHVibGljIHRleHRTdHlsZTpQSVhJLlRleHRTdHlsZVxuICBwdWJsaWMgZmlsbDpudW1iZXJcbiAgcHVibGljIHN0cm9rZTpudW1iZXJcbiAgcHVibGljIHN0cm9rZVRoaWNrbmVzczpudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgd2lkdGg6bnVtYmVyLFxuICAgIGhlaWdodDpudW1iZXIsXG4gICAgdGV4dFN0eWxlOlBJWEkuVGV4dFN0eWxlLFxuICAgIGZpbGw6bnVtYmVyID0gMHg1NDIxMjEsXG4gICAgc3Ryb2tlVGhpY2tuZXNzOm51bWJlciA9IDIsXG4gICAgc3Ryb2tlOm51bWJlciA9IDB4ZWRlZGVkXG4gICkge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aFxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgdGhpcy50ZXh0U3R5bGUgPSB0ZXh0U3R5bGVcbiAgICB0aGlzLmZpbGwgPSBmaWxsXG4gICAgdGhpcy5zdHJva2VUaGlja25lc3MgPSBzdHJva2VUaGlja25lc3NcbiAgICB0aGlzLnN0cm9rZSA9IHN0cm9rZVxuICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi90eXBpbmdzL2luZGV4LmQudHMnIC8+XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcbmltcG9ydCB7U2ltdWxhdGlvbiwgU2ltdWxhdGlvblN0YXRlfSBmcm9tICcuL3NpbXVsYXRpb24nXG5pbXBvcnQge0JvYXJkUG9zaXRpb259IGZyb20gJy4vY29tcG9uZW50cy9jaGVja2Vycy9ib2FyZC1sYXlvdXQnXG5pbXBvcnQge1Zpc3VhbGl6YXRpb259IGZyb20gJy4vdmlzdWFsaXphdGlvbidcblxuY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoJy4vY29uZmlnLmpzb24nLCAndXRmLTgnKSlcblxuY2xhc3MgQXBwbGljYXRpb24ge1xuXG4gIHByaXZhdGUgc2ltdWxhdGlvbjpTaW11bGF0aW9uXG4gIHByaXZhdGUgdmlzdWFsaXphdGlvbjpWaXN1YWxpemF0aW9uXG4gIHByaXZhdGUgdGltZW91dDpudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gTnVtYmVyIG9mIHJvd3MgYW5kIGNvbHVtbnMgZm9yIHRoZSBzaW11bGF0aW9uIGJvYXJkXG4gICAgdGhpcy5zaW11bGF0aW9uID0gbmV3IFNpbXVsYXRpb24oY29uZmlnLnNpbXVsYXRpb24uaW5pdGlhbFNpemUpXG4gICAgLy8gQ2FsbGVkIGJ5IHRoZSBzaW11bGF0aW9uIHdoZW5ldmVyIGEgcG9pbnQgbW92ZXNcbiAgICAvLyAoaW4gb3JkZXIgdG8gYW5pbWF0ZSBpdCwgcGVyaGFwcylcbiAgICB0aGlzLnNpbXVsYXRpb24ub24oJ21vdmUnLCB0aGlzLnBvaW50ZXJNb3ZlZClcbiAgICB0aGlzLnNpbXVsYXRpb24ub24oJ2VuZCcsIHRoaXMuc2ltdWxhdGlvbkVuZGVkKVxuICAgIHRoaXMudmlzdWFsaXphdGlvbiA9IG5ldyBWaXN1YWxpemF0aW9uKHRoaXMuc2ltdWxhdGlvbi5ib2FyZExheW91dClcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24ub24oJ3BsYXknLCB0aGlzLnBsYXkpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLm9uKCdzdG9wJywgdGhpcy5mb3JjZVN0b3ApXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLm9uKCdyZXNpemUnLCB0aGlzLnJlc2l6ZSlcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24ub24oJ3NodWZmbGUnLCB0aGlzLnNodWZmbGUpXG4gICAgdGhpcy5yZXN0YXJ0KClcbiAgfVxuXG4gIC8vIEV2ZW50IGhhbmRsaW5nIGNhbGxiYWNrcyBuZWVkIGZhdCBhcnJvdyB0byBrZWVwIFwidGhpc1wiIGNvbnRleHRcbiAgcHJpdmF0ZSByZXNpemUgPSAoYW1vdW50Om51bWJlcik6dm9pZCA9PiB7XG4gICAgdGhpcy5zdG9wKClcbiAgICBsZXQgYm9hcmRTaXplOm51bWJlciA9IHRoaXMuc2ltdWxhdGlvbi5zaXplICsgYW1vdW50XG4gICAgaWYoYm9hcmRTaXplIDwgMSlcbiAgICAgIGJvYXJkU2l6ZSA9IDFcbiAgICBlbHNlIGlmKGJvYXJkU2l6ZSA+IGNvbmZpZy5zaW11bGF0aW9uLm1heFNpemUpXG4gICAgICBib2FyZFNpemUgPSBjb25maWcuc2ltdWxhdGlvbi5tYXhTaXplXG4gICAgaWYodGhpcy5zaW11bGF0aW9uLnNpemUgIT09IGJvYXJkU2l6ZSlcbiAgICAgIHRoaXMuc2ltdWxhdGlvbi5yZXNpemUoYm9hcmRTaXplKVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5zZXRCb2FyZExheW91dCh0aGlzLnNpbXVsYXRpb24uYm9hcmRMYXlvdXQpXG4gICAgdGhpcy5yZXN0YXJ0KClcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2hvd01lc3NhZ2UoJ1ByZXNzIFBsYXkgdG8gQmVnaW4nKVxuICB9XG5cbiAgLy8gRXZlbnQgaGFuZGxpbmcgY2FsbGJhY2tzIG5lZWQgZmF0IGFycm93IHRvIGtlZXAgXCJ0aGlzXCIgY29udGV4dFxuICBwcml2YXRlIHNodWZmbGUgPSAoKTp2b2lkID0+IHtcbiAgICB0aGlzLnN0b3AoKVxuICAgIHRoaXMuc2ltdWxhdGlvbi5zaHVmZmxlKClcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2V0Qm9hcmRMYXlvdXQodGhpcy5zaW11bGF0aW9uLmJvYXJkTGF5b3V0KVxuICAgIHRoaXMucmVzdGFydCgpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLnNob3dNZXNzYWdlKCdQcmVzcyBQbGF5IHRvIEJlZ2luJylcbiAgfVxuXG4gIC8vIEV2ZW50IGhhbmRsaW5nIGNhbGxiYWNrcyBuZWVkIGZhdCBhcnJvdyB0byBrZWVwIFwidGhpc1wiIGNvbnRleHRcbiAgcHJpdmF0ZSBwbGF5ID0gKCk6dm9pZCA9PiB7XG4gICAgdGhpcy5zdG9wKClcbiAgICB0aGlzLnJlc3RhcnQoKVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5zaG93TWVzc2FnZSgnUnVubmluZycpXG4gICAgdGhpcy5uZXh0KClcbiAgfVxuXG4gIC8vIEV2ZW50IGhhbmRsaW5nIGNhbGxiYWNrcyBuZWVkIGZhdCBhcnJvdyB0byBrZWVwIFwidGhpc1wiIGNvbnRleHRcbiAgcHJpdmF0ZSBmb3JjZVN0b3AgPSAoKTp2b2lkID0+IHtcbiAgICBpZih0aGlzLnNpbXVsYXRpb24uc3RhdGUgPT09IFNpbXVsYXRpb25TdGF0ZS5SdW5uaW5nKSB7XG4gICAgICB0aGlzLnN0b3AoKVxuICAgICAgdGhpcy52aXN1YWxpemF0aW9uLnNob3dNZXNzYWdlKCdTdG9wcGVkJylcbiAgICB9XG4gIH1cblxuICAvLyBFdmVudCBoYW5kbGluZyBjYWxsYmFja3MgbmVlZCBmYXQgYXJyb3cgdG8ga2VlcCBcInRoaXNcIiBjb250ZXh0XG4gIHByaXZhdGUgcG9pbnRlck1vdmVkID0gKG51bWJlcjpudW1iZXIsIHBvc2l0aW9uOkJvYXJkUG9zaXRpb24pID0+IHtcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24ubW92ZUNoZWNrZXIobnVtYmVyLCBwb3NpdGlvbilcbiAgfVxuXG4gIC8vIEZhdCBhcnJvdyB0byBwcmVzZXJ2ZSBcInRoaXNcIiBpbiBzZXRUaW1lb3V0XG4gIHByaXZhdGUgbmV4dCA9ICgpOnZvaWQgPT4ge1xuICAgIHRoaXMuc2ltdWxhdGlvbi5uZXh0KClcbiAgICBpZih0aGlzLnNpbXVsYXRpb24uc3RhdGUgPT09IFNpbXVsYXRpb25TdGF0ZS5SdW5uaW5nKVxuICAgICAgLy8gRGVsYXkgZm9yIHRoZSBhbmltYXRpb24gdG8gZmluaXNoLCBhbmQgdHJhY2sgdGhlIHRpbWVvdXQgc28gd2VcbiAgICAgIC8vIGNhbiBzdG9wIGl0IG9uIGRlbWFuZFxuICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCh0aGlzLm5leHQsIGNvbmZpZy52aXN1YWxpemF0aW9uLm1vdmVUaW1lKVxuICB9XG5cbiAgLy8gRXZlbnQgaGFuZGxpbmcgY2FsbGJhY2tzIG5lZWQgZmF0IGFycm93IHRvIGtlZXAgXCJ0aGlzXCIgY29udGV4dFxuICBwcml2YXRlIHNpbXVsYXRpb25FbmRlZCA9ICgpOnZvaWQgPT4ge1xuICAgIGxldCBtZXNzYWdlOnN0cmluZ1xuICAgIHN3aXRjaCh0aGlzLnNpbXVsYXRpb24uc3RhdGUpIHtcbiAgICAgIGNhc2UgU2ltdWxhdGlvblN0YXRlLk5vbmNpcmN1bGFyOlxuICAgICAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2hvd01lc3NhZ2UoJ1RoZSBwYXRoIGlzIG5vbmNpcmN1bGFyLicpXG4gICAgICAgIHRoaXMudmlzdWFsaXphdGlvbi5mYWxsKClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgU2ltdWxhdGlvblN0YXRlLkNpcmN1bGFyOlxuICAgICAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2hvd01lc3NhZ2UoJ1RoZSBwYXRoIGlzIGNpcmN1bGFyLicpXG4gICAgICAgIHRoaXMudmlzdWFsaXphdGlvbi5jb2xsaWRlKClcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCh0aGlzLnN0b3AsIGNvbmZpZy52aXN1YWxpemF0aW9uLm1vdmVUaW1lKVxuICB9XG5cbiAgLy8gRmF0IGFycm93IHRvIHByZXNlcnZlIFwidGhpc1wiIGluIHNldFRpbWVvdXQgY2FsbFxuICBwcml2YXRlIHN0b3AgPSAoKSA9PiB7XG4gICAgaWYodGhpcy50aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxuICAgICAgdGhpcy50aW1lb3V0ID0gbnVsbFxuICAgIH1cbiAgICB0aGlzLnZpc3VhbGl6YXRpb24uc3RvcCgpXG4gIH1cblxuICBwcml2YXRlIHJlc3RhcnQoKTp2b2lkIHtcbiAgICAvLyBNb3ZlIHRoZSBjaGVja2VycyB0byB0aGVpciBzdGFydGluZyBwb3NpdGlvbnNcbiAgICB0aGlzLnNpbXVsYXRpb24ucmVzdGFydCgpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLnJlc3RhcnQoKVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5wbGFjZUNoZWNrZXIoMSwgdGhpcy5zaW11bGF0aW9uLnN0YXJ0aW5nUG9zaXRpb24pXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLnBsYWNlQ2hlY2tlcigyLCB0aGlzLnNpbXVsYXRpb24uc3RhcnRpbmdQb3NpdGlvbilcbiAgfVxufVxuXG5uZXcgQXBwbGljYXRpb24oKVxuIiwiaW1wb3J0ICogYXMgRXZlbnRzRW1pdHRlciBmcm9tICdldmVudHMnXG5pbXBvcnQge1xuICBCb2FyZExheW91dCxcbiAgQm9hcmRQb3NpdGlvbixcbiAgRGlyZWN0aW9uXG59IGZyb20gJy4vY29tcG9uZW50cy9jaGVja2Vycy9ib2FyZC1sYXlvdXQnXG5cbmV4cG9ydCBjb25zdCBlbnVtIFNpbXVsYXRpb25TdGF0ZSB7XG4gIFJ1bm5pbmcsXG4gIENpcmN1bGFyLFxuICBOb25jaXJjdWxhclxufVxuXG5leHBvcnQgY2xhc3MgU2ltdWxhdGlvbiBleHRlbmRzIEV2ZW50c0VtaXR0ZXIge1xuXG4gIHNpemU6bnVtYmVyXG4gIGJvYXJkTGF5b3V0OkJvYXJkTGF5b3V0ID0gW11cbiAgc3RhdGU6U2ltdWxhdGlvblN0YXRlXG4gIHN0YXJ0aW5nUG9zaXRpb246Qm9hcmRQb3NpdGlvblxuICBwb2ludGVyT25lUG9zaXRpb246Qm9hcmRQb3NpdGlvblxuICBwb2ludGVyVHdvUG9zaXRpb246Qm9hcmRQb3NpdGlvblxuICBldmVuTW92ZTpib29sZWFuXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKHNpemU6bnVtYmVyKSB7XG4gICAgc3VwZXIoKVxuICAgIC8vIFNldCBpbml0aWFsIGJvYXJkIGxheW91dCB0byB0aGUgcHJvcGVyIHNpemU7IHJlc2l6ZSB0YWtlcyBjYXJlIG9mXG4gICAgLy8gc2h1ZmZsaW5nXG4gICAgdGhpcy5yZXNpemUoc2l6ZSlcbiAgfVxuXG4gIC8vIFdoZW4gdGhlIHNpbXVsYXRpb24gaXMgcmVzaXplZCwgcmVzaXplIHRoZSBib2FyZCBsYXlvdXQgZGF0YSBzdHJ1Y3R1cmVcbiAgLy8gYW5kIHNodWZmbGUgdGhlIGJvYXJkIChhbiBpbXByb3ZlbWVudCBjb3VsZCBiZSB0byBvbmx5IHJhbmRvbWl6ZSBhbnkgXCJuZXdcIlxuICAvLyBwb3NpdGlvbnMpXG4gIHB1YmxpYyByZXNpemUoc2l6ZTpudW1iZXIpOnZvaWQge1xuICAgIHRoaXMuc2l6ZSA9IHNpemVcbiAgICAvLyBSZW1vdmUgcm93cyBkb3duIHRvIHRoZSBwcm9wZXIgc2l6ZVxuICAgIHdoaWxlKHRoaXMuYm9hcmRMYXlvdXQubGVuZ3RoID4gc2l6ZSlcbiAgICAgIHRoaXMuYm9hcmRMYXlvdXQucG9wKClcbiAgICBmb3IobGV0IHJvdzpudW1iZXIgPSAwIDsgcm93IDwgdGhpcy5ib2FyZExheW91dC5sZW5ndGggOyByb3crKykge1xuICAgICAgLy8gUmVtb3ZlIGNvbHVtbnMgZnJvbSBlYWNoIHJlbWFpbmluZyByb3cgZG93biB0byB0aGUgcHJvcGVyIHNpemVcbiAgICAgIHdoaWxlKHRoaXMuYm9hcmRMYXlvdXRbcm93XS5sZW5ndGggPiBzaXplKVxuICAgICAgICB0aGlzLmJvYXJkTGF5b3V0W3Jvd10ucG9wKClcbiAgICAgIC8vIEFkZCBjb2x1bW5zIHRvIHRoZSBleGlzdGluZyByb3dzIHVwIHRvIHRoZSBwcm9wZXIgc2l6ZVxuICAgICAgd2hpbGUoc2l6ZSA+IHRoaXMuYm9hcmRMYXlvdXRbcm93XS5sZW5ndGgpXG4gICAgICAgIHRoaXMuYm9hcmRMYXlvdXRbcm93XS5wdXNoKDApXG4gICAgfVxuICAgIC8vIEFkZCByb3dzIHVwIHRvIHRoZSBwcm9wZXIgc2l6ZVxuICAgIHdoaWxlKHNpemUgPiB0aGlzLmJvYXJkTGF5b3V0Lmxlbmd0aClcbiAgICAgIHRoaXMuYWRkUm93KHRoaXMuYm9hcmRMYXlvdXQubGVuZ3RoKVxuICAgIHRoaXMuc2h1ZmZsZSgpXG4gIH1cblxuICAvLyBTZXQgcmFuZG9tIHZhbHVlcyBmb3IgZWFjaCBsb2NhdGlvbiBvbiB0aGUgYm9hcmRcbiAgcHVibGljIHNodWZmbGUoKTp2b2lkIHtcbiAgICBmb3IobGV0IHJvdzpudW1iZXIgPSAwIDsgcm93IDwgdGhpcy5zaXplIDsgcm93KyspXG4gICAgICBmb3IobGV0IGNvbDpudW1iZXIgPSAwIDsgY29sIDwgdGhpcy5zaXplIDsgY29sKyspXG4gICAgICAgIHRoaXMuYm9hcmRMYXlvdXRbcm93XVtjb2xdID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNClcbiAgICB0aGlzLnN0YXJ0aW5nUG9zaXRpb24gPSB0aGlzLnJhbmRvbVBvc2l0aW9uKClcbiAgICB0aGlzLnJlc3RhcnQoKVxuICB9XG5cbiAgLy8gU2V0IHRoZSBzdGF0ZSB0byBSdW5uaW5nLCBhbmQgbW92ZSB0aGUgcG9pbnRlcnMgYmFjayB0byBzdGFydGluZyBwb3NpdGlvblxuICBwdWJsaWMgcmVzdGFydCgpOnZvaWQge1xuICAgIHRoaXMuc3RhdGUgPSBTaW11bGF0aW9uU3RhdGUuUnVubmluZ1xuICAgIHRoaXMucG9pbnRlck9uZVBvc2l0aW9uID0gdGhpcy5zdGFydGluZ1Bvc2l0aW9uXG4gICAgdGhpcy5wb2ludGVyVHdvUG9zaXRpb24gPSB0aGlzLnN0YXJ0aW5nUG9zaXRpb25cbiAgICB0aGlzLmV2ZW5Nb3ZlID0gZmFsc2VcbiAgfVxuXG4gIHB1YmxpYyBydW4oKTp2b2lkIHtcbiAgICB0aGlzLnJlc3RhcnQoKVxuICAgIHdoaWxlKHRoaXMuc3RhdGUgPT09IFNpbXVsYXRpb25TdGF0ZS5SdW5uaW5nKVxuICAgICAgdGhpcy5uZXh0KClcbiAgfVxuXG4gIC8vIFRoZSBpdGVyYXRvciwgdXNlZCBieSB0aGUgY29udHJvbGxlciB0byBzdGVwIHRocm91Z2ggdGhlIHNpbXVsYXRpb25cbiAgLy8gQW4gaW1wcm92ZW1lbnQgbWlnaHQgYmUgdG8gYWRkIGEgXCJydW5cIiBtZXRob2QgdG8gU2ltdWxhdGlvbiwgd2hpY2hcbiAgLy8gd291bGQgcnVuIHRoZSBlbnRpcmUgc2ltdWxhdGlvbiBzeW5jaHJvbm91c2x5XG4gIHB1YmxpYyBuZXh0KCk6dm9pZCB7XG4gICAgdGhpcy5wb2ludGVyT25lUG9zaXRpb24gPSB0aGlzLm5leHRQb3NpdGlvbih0aGlzLnBvaW50ZXJPbmVQb3NpdGlvbilcbiAgICB0aGlzLmRldGVybWluZVN0YXRlKClcbiAgICB0aGlzLmVtaXQoJ21vdmUnLCAxLCB0aGlzLnBvaW50ZXJPbmVQb3NpdGlvbilcbiAgICAvLyBIYXZlIHRvIGNoZWNrIGJlZm9yZSBtb3ZpbmcgdGhlIHNlY29uZCBwb2ludGVyXG4gICAgaWYodGhpcy5zdGF0ZSA9PT0gU2ltdWxhdGlvblN0YXRlLlJ1bm5pbmcgJiYgdGhpcy5ldmVuTW92ZSkge1xuICAgICAgdGhpcy5wb2ludGVyVHdvUG9zaXRpb24gPSB0aGlzLm5leHRQb3NpdGlvbih0aGlzLnBvaW50ZXJUd29Qb3NpdGlvbilcbiAgICAgIHRoaXMuZGV0ZXJtaW5lU3RhdGUoKVxuICAgICAgdGhpcy5lbWl0KCdtb3ZlJywgMiwgdGhpcy5wb2ludGVyVHdvUG9zaXRpb24pXG4gICAgfVxuICAgIHRoaXMuZXZlbk1vdmUgPSAhdGhpcy5ldmVuTW92ZVxuICAgIGlmKHRoaXMuc3RhdGUgIT09IFNpbXVsYXRpb25TdGF0ZS5SdW5uaW5nKVxuICAgICAgdGhpcy5lbWl0KCdlbmQnLCB0aGlzLnN0YXRlKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBzYW1lUG9zaXRpb24ocG9zaXRpb24xOkJvYXJkUG9zaXRpb24sIHBvc2l0aW9uMjpCb2FyZFBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIHBvc2l0aW9uMS5yb3cgPT09IHBvc2l0aW9uMi5yb3cgJiYgcG9zaXRpb24xLmNvbCA9PT0gcG9zaXRpb24yLmNvbFxuICB9XG5cbiAgcHJpdmF0ZSBhZGRSb3cocm93Om51bWJlcik6dm9pZCB7XG4gICAgdGhpcy5ib2FyZExheW91dC5wdXNoKFtdKVxuICAgIGZvcihsZXQgY29sOm51bWJlciA9IDAgOyBjb2wgPCB0aGlzLnNpemUgOyBjb2wrKylcbiAgICAgIHRoaXMuYm9hcmRMYXlvdXRbcm93XS5wdXNoKDApXG4gIH1cblxuICBwcml2YXRlIG5leHRQb3NpdGlvbihjdXJyZW50UG9zaXRpb246Qm9hcmRQb3NpdGlvbik6Qm9hcmRQb3NpdGlvbiB7XG4gICAgY29uc3QgZGlyZWN0aW9uOkRpcmVjdGlvbiA9XG4gICAgICB0aGlzLmJvYXJkTGF5b3V0W2N1cnJlbnRQb3NpdGlvbi5yb3ddW2N1cnJlbnRQb3NpdGlvbi5jb2xdXG4gICAgbGV0IG5leHRQb3NpdGlvbjpCb2FyZFBvc2l0aW9uXG4gICAgc3dpdGNoKGRpcmVjdGlvbikge1xuICAgICAgY2FzZSBEaXJlY3Rpb24uVXA6XG4gICAgICAgIG5leHRQb3NpdGlvbiA9XG4gICAgICAgICAgbmV3IEJvYXJkUG9zaXRpb24oY3VycmVudFBvc2l0aW9uLnJvdyAtIDEsIGN1cnJlbnRQb3NpdGlvbi5jb2wpXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcbiAgICAgICAgbmV4dFBvc2l0aW9uID1cbiAgICAgICAgICBuZXcgQm9hcmRQb3NpdGlvbihjdXJyZW50UG9zaXRpb24ucm93ICsgMSwgY3VycmVudFBvc2l0aW9uLmNvbClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpcmVjdGlvbi5MZWZ0OlxuICAgICAgICBuZXh0UG9zaXRpb24gPVxuICAgICAgICAgIG5ldyBCb2FyZFBvc2l0aW9uKGN1cnJlbnRQb3NpdGlvbi5yb3csIGN1cnJlbnRQb3NpdGlvbi5jb2wgLSAxKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxuICAgICAgICBuZXh0UG9zaXRpb24gPVxuICAgICAgICAgIG5ldyBCb2FyZFBvc2l0aW9uKGN1cnJlbnRQb3NpdGlvbi5yb3csIGN1cnJlbnRQb3NpdGlvbi5jb2wgKyAxKVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG5leHRQb3NpdGlvblxuICB9XG5cbiAgcHJpdmF0ZSBkZXRlcm1pbmVTdGF0ZSgpOnZvaWQge1xuICAgIHRoaXMuc3RhdGUgPVxuICAgICAgIXRoaXMudmFsaWRQb3NpdGlvbih0aGlzLnBvaW50ZXJPbmVQb3NpdGlvbilcbiAgICAgICAgPyBTaW11bGF0aW9uU3RhdGUuTm9uY2lyY3VsYXJcbiAgICAgIDogU2ltdWxhdGlvbi5zYW1lUG9zaXRpb24odGhpcy5wb2ludGVyT25lUG9zaXRpb24sIHRoaXMucG9pbnRlclR3b1Bvc2l0aW9uKVxuICAgICAgICA/IFNpbXVsYXRpb25TdGF0ZS5DaXJjdWxhclxuICAgICAgOiBTaW11bGF0aW9uU3RhdGUuUnVubmluZ1xuICB9XG5cbiAgcHJpdmF0ZSB2YWxpZFBvc2l0aW9uKHBvc2l0aW9uOkJvYXJkUG9zaXRpb24pOmJvb2xlYW4ge1xuICAgIHJldHVybiAhKFxuICAgICAgcG9zaXRpb24ucm93IDwgMCB8fFxuICAgICAgcG9zaXRpb24ucm93ID4gdGhpcy5zaXplIC0gMSB8fFxuICAgICAgcG9zaXRpb24uY29sIDwgMCB8fFxuICAgICAgcG9zaXRpb24uY29sID4gdGhpcy5zaXplIC0gMVxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgcmFuZG9tUG9zaXRpb24oc2l6ZTpudW1iZXIgPSAwKTpCb2FyZFBvc2l0aW9uIHtcbiAgICBpZihzaXplIDwgMSlcbiAgICAgIHNpemUgPSB0aGlzLnNpemVcbiAgICByZXR1cm4gbmV3IEJvYXJkUG9zaXRpb24oXG4gICAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHNpemUpLFxuICAgICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBzaXplKVxuICAgIClcbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFNvdW5kTWFuYWdlciB7XG5cbiAgc291bmRzOntba2V5OnN0cmluZ106SFRNTEF1ZGlvRWxlbWVudH0gPSB7fVxuXG4gIGNvbnN0cnVjdG9yKHNvdW5kczp7W2tleTpzdHJpbmddOnN0cmluZ30pIHtcbiAgICBmb3IobGV0IHNvdW5kIGluIHNvdW5kcykge1xuICAgICAgY29uc3QgYXVkaW8gPSBuZXcgQXVkaW8oKVxuICAgICAgYXVkaW8uc3JjID0gc291bmRzW3NvdW5kXVxuICAgICAgYXVkaW8ucHJlbG9hZCA9ICd0cnVlJ1xuICAgICAgdGhpcy5zb3VuZHNbc291bmRdID0gYXVkaW9cbiAgICB9XG4gIH1cbiAgXG4gIHBsYXkoc291bmROYW1lKSB7XG4gICAgdGhpcy5zb3VuZHNbc291bmROYW1lXS5wYXVzZSgpXG4gICAgdGhpcy5zb3VuZHNbc291bmROYW1lXS5jdXJyZW50VGltZSA9IDBcbiAgICB0aGlzLnNvdW5kc1tzb3VuZE5hbWVdLnBsYXkoKVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcbmltcG9ydCAqIGFzIEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnXG5pbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnXG5pbXBvcnQge1R3ZWVuTGl0ZX0gZnJvbSAnZ3NhcC9Ud2VlbkxpdGUnXG5pbXBvcnQge1NvdW5kTWFuYWdlcn0gZnJvbSAnLi9zb3VuZC1tYW5hZ2VyJ1xuaW1wb3J0IHtcbiAgQm9hcmRQb3NpdGlvbixcbiAgRGlyZWN0aW9uLFxuICBCb2FyZExheW91dFxufSBmcm9tICcuL2NvbXBvbmVudHMvY2hlY2tlcnMvYm9hcmQtbGF5b3V0J1xuaW1wb3J0IHtCdXR0b24sIEJ1dHRvblN0eWxlfSBmcm9tICcuL2NvbXBvbmVudHMvdWkvYnV0dG9uJ1xuaW1wb3J0IHtDaGVja2VyfSBmcm9tICcuL2NvbXBvbmVudHMvY2hlY2tlcnMvY2hlY2tlcidcbmltcG9ydCB7RGlyZWN0ZWRDaGVja2VyQm9hcmR9IGZyb21cbiAgJy4vY29tcG9uZW50cy9jaGVja2Vycy9kaXJlY3RlZC9kaXJlY3RlZC1jaGVja2VyLWJvYXJkJ1xuaW1wb3J0IHtIb3Jpem9udGFsQ2VudGVyfSBmcm9tICcuL2NvbXBvbmVudHMvbGF5b3V0cy9ob3Jpem9udGFsLWNlbnRlcidcbmltcG9ydCB7RnVsbFNjcmVlbkhlYWRlckZvb3Rlcn0gZnJvbVxuICAnLi9jb21wb25lbnRzL2xheW91dHMvZnVsbC1zY3JlZW4taGVhZGVyLWZvb3RlcidcblxuY29uc3QgY29uZmlnID1cbiAgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoJy4vY29uZmlnLmpzb24nLCAndXRmLTgnKSkudmlzdWFsaXphdGlvblxuXG5leHBvcnQgY2xhc3MgVmlzdWFsaXphdGlvbiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgcHJpdmF0ZSBzY3JlZW5MYXlvdXQ6RnVsbFNjcmVlbkhlYWRlckZvb3RlclxuICBwcml2YXRlIGJvYXJkOkRpcmVjdGVkQ2hlY2tlckJvYXJkXG4gIHByaXZhdGUgY2hlY2tlcjE6Q2hlY2tlclxuICBwcml2YXRlIGNoZWNrZXIyOkNoZWNrZXJcbiAgcHJpdmF0ZSByZW5kZXJlcjpQSVhJLldlYkdMUmVuZGVyZXJcbiAgcHJpdmF0ZSBtZXNzYWdlOlBJWEkuVGV4dFxuICBwcml2YXRlIHNvdW5kTWFuYWdlcjpTb3VuZE1hbmFnZXIgPSBuZXcgU291bmRNYW5hZ2VyKGNvbmZpZy5zb3VuZHMpXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKGJvYXJkTGF5b3V0OkJvYXJkTGF5b3V0KSB7XG4gICAgc3VwZXIoKVxuICAgIC8vIFRoaXMgY3JlYXRlcyB0aGUgZnVsbC1zY3JlZW4gbGF5b3V0IGFuZCBhZGRzIHRoZSBtZXNzYWdlIHRvIHRoZSBoZWFkZXJcbiAgICAvLyBhbmQgYnV0dG9ucyB0byB0aGUgZm9vdGVyXG4gICAgdGhpcy5zZXR1cFVJKClcbiAgICB0aGlzLnNldHVwQm9hcmQoYm9hcmRMYXlvdXQpXG4gICAgdGhpcy5zZXR1cENoZWNrZXJzKClcbiAgICAvLyBDcmVhdGUgYSBXZWJHTCByZW5kZXJlciBhdCB3aW5kb3cgZGltZW5zaW9uczsgYmVnaW4gcmVuZGVyIGxvb3BcbiAgICB0aGlzLnN0YXJ0UmVuZGVyaW5nKClcbiAgfVxuXG4gIHB1YmxpYyBzZXRCb2FyZExheW91dChib2FyZExheW91dDpCb2FyZExheW91dCk6dm9pZCB7XG4gICAgLy8gU3RvcCBhbnkgb25nb2luZyBhbmltYXRpb25zXG4gICAgdGhpcy5zdG9wKClcbiAgICAvLyBSZXNpemUgdGhlIGJvYXJkIGFzIG5lZWRlZCAtIHRoZSBib2FyZCB0YWtlcyBjYXJlIG9mIGNyZWF0aW5nIHNxdWFyZXNcbiAgICBpZih0aGlzLmJvYXJkLnNpemUgIT09IGJvYXJkTGF5b3V0Lmxlbmd0aClcbiAgICAgIHRoaXMucmVzaXplKGJvYXJkTGF5b3V0Lmxlbmd0aClcbiAgICAvLyBTZXQgdGhlIGFycm93IGRpcmVjdGlvbnMgb24gdGhlIGJvYXJkXG4gICAgdGhpcy5ib2FyZC5zZXRCb2FyZExheW91dChib2FyZExheW91dClcbiAgICAvLyBNYWtlIHN1cmUgdGhlIGNoZWNrZXJzIGFyZSBvbiB0b3Agb2YgYW55IG5ldyBzcXVhcmVzXG4gICAgdGhpcy5ib2FyZC50b1RvcCh0aGlzLmNoZWNrZXIxKVxuICAgIHRoaXMuYm9hcmQudG9Ub3AodGhpcy5jaGVja2VyMilcbiAgfVxuXG4gIC8vIFJlc2l6ZSB0aGUgZmlyc3QgY2hlY2tlciB0byBzY2FsZSBvbmUsIHNpbmNlIGl0IGlzIHNocnVuayB0byB6ZXJvIHNjYWxlXG4gIC8vIHdoZW4gYSBzaW11bGF0aW9uIGlzIHN0YXJ0ZWRcbiAgcHVibGljIHJlc3RhcnQoKTp2b2lkIHtcbiAgICB0aGlzLmNoZWNrZXIxLnNjYWxlLnNldCgxLCAxKVxuICB9XG5cbiAgLy8gU3RvcCBhbnkgb25nb2luZyBhbmltYXRpb25zXG4gIHB1YmxpYyBzdG9wKCkge1xuICAgIFR3ZWVuTGl0ZS5raWxsVHdlZW5zT2YodGhpcy5jaGVja2VyMS5wb3NpdGlvbilcbiAgICBUd2VlbkxpdGUua2lsbFR3ZWVuc09mKHRoaXMuY2hlY2tlcjEuc2NhbGUpXG4gICAgVHdlZW5MaXRlLmtpbGxUd2VlbnNPZih0aGlzLmNoZWNrZXIyLnBvc2l0aW9uKVxuICB9XG5cbiAgLy8gU2hvdyB0aGUgZ2l2ZW4gdGV4dCBhdCBzY3JlZW4gdG9wXG4gIHB1YmxpYyBzaG93TWVzc2FnZShtZXNzYWdlOnN0cmluZyk6dm9pZCB7XG4gICAgdGhpcy5tZXNzYWdlLnRleHQgPSBtZXNzYWdlXG4gIH1cblxuICAvLyBQbGFjZSB0aGUgZ2l2ZW4gY2hlY2tlciBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24sIHdpdGhvdXQgYW5pbWF0aW5nXG4gIHB1YmxpYyBwbGFjZUNoZWNrZXIobnVtYmVyOm51bWJlciwgcG9zaXRpb246Qm9hcmRQb3NpdGlvbikge1xuICAgIGNvbnN0IGNoZWNrZXI6UElYSS5EaXNwbGF5T2JqZWN0ID1cbiAgICAgIG51bWJlciA9PT0gMSA/IHRoaXMuY2hlY2tlcjEgOiB0aGlzLmNoZWNrZXIyXG4gICAgY2hlY2tlci5wb3NpdGlvbiA9IHRoaXMuYm9hcmQuYm9hcmRQb3NpdGlvblRvUGl4ZWxzKHBvc2l0aW9uKVxuICB9XG5cbiAgLy8gQW5pbWF0ZSBtb3ZpbmcgdGhlIGNoZWNrZXIgdG8gYSBuZXcgcG9zaXRpb25cbiAgcHVibGljIG1vdmVDaGVja2VyKG51bWJlcjpudW1iZXIsIHBvc2l0aW9uOkJvYXJkUG9zaXRpb24pOnZvaWQge1xuICAgIGNvbnN0IGNoZWNrZXI6UElYSS5EaXNwbGF5T2JqZWN0ID1cbiAgICAgIG51bWJlciA9PT0gMSA/IHRoaXMuY2hlY2tlcjEgOiB0aGlzLmNoZWNrZXIyXG4gICAgY29uc3QgcGl4ZWxQb3NpdGlvbjpQSVhJLlBvaW50ID0gdGhpcy5ib2FyZC5ib2FyZFBvc2l0aW9uVG9QaXhlbHMocG9zaXRpb24pXG4gICAgLy8gVXNlIHRoZSBHcmVlbnNvY2sgVHdlZW5MaXRlIGxpYnJhcnkgdG8gYW5pbWF0ZSB0aGUgbW92ZW1lbnRcbiAgICBUd2VlbkxpdGUudG8oXG4gICAgICBjaGVja2VyLnBvc2l0aW9uLFxuICAgICAgY29uZmlnLmNoZWNrZXIubW92ZVRpbWUsXG4gICAgICB7eDogcGl4ZWxQb3NpdGlvbi54LCB5OiBwaXhlbFBvc2l0aW9uLnl9XG4gICAgKVxuICAgIHRoaXMuc291bmRNYW5hZ2VyLnBsYXkoJ21vdmUnKVxuICB9XG5cbiAgcHVibGljIGNvbGxpZGUoKSB7XG4gICAgLy8gU2hyaW5rIHRoZSBmaXJzdCBjaGVja2VyIHRvIHNjYWxlIHplcm9cbiAgICBUd2VlbkxpdGUudG8odGhpcy5jaGVja2VyMS5zY2FsZSwgLjUsIHt4OiAwLCB5OiAwfSlcbiAgICB0aGlzLnNvdW5kTWFuYWdlci5wbGF5KCdjb2xsaWRlJylcbiAgfVxuXG4gIHB1YmxpYyBmYWxsKCkge1xuICAgIC8vIFNocmluayB0aGUgZmlyc3QgY2hlY2tlciB0byBzY2FsZSB6ZXJvXG4gICAgVHdlZW5MaXRlLnRvKHRoaXMuY2hlY2tlcjEuc2NhbGUsIC41LCB7eDogMCwgeTogMH0pXG4gICAgdGhpcy5zb3VuZE1hbmFnZXIucGxheSgnZmFsbCcpXG4gIH1cblxuICBwcml2YXRlIHN0YXJ0UmVuZGVyaW5nKCk6dm9pZCB7XG4gICAgLy8gVGhlIHNjcmVlbkxheW91dCBjb250YWluZXIgaXMgcGFzc2VkIGludG8gcmVuZGVyKCkgYnkgcmVuZGVyTG9vcCgpXG4gICAgLy8gSXQgY29udGFpbnMgdGhlIG1lc3NhZ2UsIHRoZSBib2FyZCwgYW5kIHRoZSBidXR0b25zXG4gICAgLy8gU2V0IHVwIHRoZSByZW5kZXJlciwgYWRkIHRoZSBjYW52YXMgdG8gdGhlIHBhZ2UsIGFuZCBzdGFydCB0aGUgcmVuZGVyXG4gICAgLy8gbG9vcCAocmVuZGVycyBldmVyeSBmcmFtZSB3aXRoIHJlcXVlc3RBbmltYXRpb25GcmFtZSlcbiAgICB0aGlzLnJlbmRlcmVyID1cbiAgICAgIG5ldyBQSVhJLldlYkdMUmVuZGVyZXIoXG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCxcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCxcbiAgICAgICAgLy8gU21vb3RoIGVkZ2VzIG9mIGN1cnZlcyBjcmVhdGVkIHdpdGggUElYSS5HcmFwaGljc1xuICAgICAgICB7YW50aWFsaWFzOiB0cnVlfSlcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMucmVuZGVyZXIudmlldylcbiAgICB0aGlzLnJlbmRlckxvb3AoKVxuICB9XG5cbiAgLy8gRmF0IGFycm93IHRvIHByZXNlcnZlIFwidGhpc1wiXG4gIHByaXZhdGUgcmVuZGVyTG9vcCA9ICgpOnZvaWQgPT4ge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnJlbmRlckxvb3ApXG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY3JlZW5MYXlvdXQpXG4gIH1cblxuICAvLyBDcmVhdGVzIHRoZSBtZXNzYWdlIGFuZCB0aGUgYnV0dG9ucywgYW5kIHNldCB1cCB0aGUgZXZlbnQgaGFuZGxpbmdcbiAgcHJpdmF0ZSBzZXR1cFVJKCk6dm9pZCB7XG4gICAgdGhpcy5tZXNzYWdlID0gdGhpcy5jcmVhdGVNZXNzYWdlKClcbiAgICBjb25zdCBoZWFkZXI6UElYSS5Db250YWluZXIgPSBuZXcgSG9yaXpvbnRhbENlbnRlcihjb25maWcubWFyZ2luKVxuICAgIGhlYWRlci5hZGRDaGlsZCh0aGlzLm1lc3NhZ2UpXG4gICAgY29uc3QgZm9vdGVyOlBJWEkuQ29udGFpbmVyID0gdGhpcy5jcmVhdGVCdXR0b25zKClcbiAgICB0aGlzLnNjcmVlbkxheW91dCA9XG4gICAgICBuZXcgRnVsbFNjcmVlbkhlYWRlckZvb3RlcihuZXcgSG9yaXpvbnRhbENlbnRlciwgaGVhZGVyLCBmb290ZXIpXG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUJ1dHRvbnMoKTpQSVhJLkNvbnRhaW5lciB7XG4gICAgY29uc3QgYnV0dG9ucyA9IG5ldyBIb3Jpem9udGFsQ2VudGVyKGNvbmZpZy5tYXJnaW4pXG4gICAgY29uc3QgYnV0dG9uVGV4dFN0eWxlOlBJWEkuVGV4dFN0eWxlID0gbmV3IFBJWEkuVGV4dFN0eWxlKHtcbiAgICAgIGFsaWduOiBjb25maWcuYnV0dG9uLnRleHQuYWxpZ24sXG4gICAgICBsaW5lSm9pbjogY29uZmlnLmJ1dHRvbi50ZXh0LmxpbmVKb2luLFxuICAgICAgZmlsbDogUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5idXR0b24udGV4dC5maWxsKSxcbiAgICAgIHN0cm9rZTogUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5idXR0b24udGV4dC5zdHJva2UpLFxuICAgICAgc3Ryb2tlVGhpY2tuZXNzOiBjb25maWcuYnV0dG9uLnRleHQuc3Ryb2tlVGhpY2tuZXNzXG4gICAgfSlcbiAgICBjb25zdCBidXR0b25TdHlsZTpCdXR0b25TdHlsZSA9IG5ldyBCdXR0b25TdHlsZShcbiAgICAgIGNvbmZpZy5idXR0b24ud2lkdGgsXG4gICAgICBjb25maWcuYnV0dG9uLmhlaWdodCxcbiAgICAgIGJ1dHRvblRleHRTdHlsZSxcbiAgICAgIFBJWEkudXRpbHMucmdiMmhleChjb25maWcuYnV0dG9uLmZpbGwpLFxuICAgICAgY29uZmlnLmJ1dHRvbi5zdHJva2VUaGlja25lc3MsXG4gICAgICBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmJ1dHRvbi5zdHJva2UpXG4gICAgKVxuICAgIGNvbnN0IHNtYWxsQnV0dG9uU3R5bGU6QnV0dG9uU3R5bGUgPSBuZXcgQnV0dG9uU3R5bGUoXG4gICAgICBjb25maWcuYnV0dG9uLndpZHRoIC8gMixcbiAgICAgIGNvbmZpZy5idXR0b24uaGVpZ2h0LFxuICAgICAgYnV0dG9uVGV4dFN0eWxlLFxuICAgICAgUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5idXR0b24uZmlsbCksXG4gICAgICBjb25maWcuYnV0dG9uLnN0cm9rZVRoaWNrbmVzcyxcbiAgICAgIFBJWEkudXRpbHMucmdiMmhleChjb25maWcuYnV0dG9uLnN0cm9rZSlcbiAgICApXG4gICAgLy8gUmVkdWNlIHRoZSBzaW11bGF0aW9uIHNpemUgYnkgb25lXG4gICAgY29uc3QgcmVzaXplRG93bkJ1dHRvbjpCdXR0b24gPSBuZXcgQnV0dG9uKCctJywgc21hbGxCdXR0b25TdHlsZSlcbiAgICByZXNpemVEb3duQnV0dG9uLm9uKCdwcmVzc2VkJywgKCkgPT4gdGhpcy5lbWl0KCdyZXNpemUnLCAtMSkpXG4gICAgYnV0dG9ucy5hZGRDaGlsZChyZXNpemVEb3duQnV0dG9uKVxuICAgIC8vIEluY3JlYXNlIHRoZSBzaW11bGF0aW9uIHNpemUgYnkgb25lXG4gICAgY29uc3QgcmVzaXplVXBCdXR0b246QnV0dG9uID0gbmV3IEJ1dHRvbignKycsIHNtYWxsQnV0dG9uU3R5bGUpXG4gICAgcmVzaXplVXBCdXR0b24ub24oJ3ByZXNzZWQnLCAoKSA9PiB0aGlzLmVtaXQoJ3Jlc2l6ZScsIDEpKVxuICAgIGJ1dHRvbnMuYWRkQ2hpbGQocmVzaXplVXBCdXR0b24pXG4gICAgLy8gU2h1ZmZsZSB0aGUgYXJyb3cgZGlyZWN0aW9uc1xuICAgIGNvbnN0IHNodWZmbGVCdXR0b246QnV0dG9uID0gbmV3IEJ1dHRvbignU2h1ZmZsZScsIGJ1dHRvblN0eWxlKVxuICAgIHNodWZmbGVCdXR0b24ub24oJ3ByZXNzZWQnLCAoKSA9PiB0aGlzLmVtaXQoJ3NodWZmbGUnKSlcbiAgICBidXR0b25zLmFkZENoaWxkKHNodWZmbGVCdXR0b24pXG4gICAgLy8gU3RhcnQgdGhlIHNpbXVsYXRpb247IHRoZSBjb250cm9sbGVyIHdpbGwgaGFuZGxlIGRlbGF5aW5nIHRoZVxuICAgIC8vIHNpbXVsYXRpb24ncyBpdGVyYXRvciB0byBhbGxvdyB0aGUgdmlzdWFsaXphdGlvbiB0aW1lIHRvIGFuaW1hdGVcbiAgICBjb25zdCBwbGF5QnV0dG9uOkJ1dHRvbiA9IG5ldyBCdXR0b24oJ1BsYXknLCBidXR0b25TdHlsZSlcbiAgICBwbGF5QnV0dG9uLm9uKCdwcmVzc2VkJywgKCkgPT4gdGhpcy5lbWl0KCdwbGF5JykpXG4gICAgYnV0dG9ucy5hZGRDaGlsZChwbGF5QnV0dG9uKVxuICAgIC8vIFN0b3AgdGhlIHNpbWx1YXRpb24gYW5kIG1vdmUgdGhlIGNoZWNrZXJzIGJhY2sgdG8gc3RhcnRpbmcgcG9zaXRpb25cbiAgICBjb25zdCBzdG9wQnV0dG9uOkJ1dHRvbiA9IG5ldyBCdXR0b24oJ1N0b3AnLCBidXR0b25TdHlsZSlcbiAgICBzdG9wQnV0dG9uLm9uKCdwcmVzc2VkJywgKCkgPT4gdGhpcy5lbWl0KCdzdG9wJykpXG4gICAgYnV0dG9ucy5hZGRDaGlsZChzdG9wQnV0dG9uKVxuICAgIHJldHVybiBidXR0b25zXG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZU1lc3NhZ2UoKTpQSVhJLlRleHQge1xuICAgIC8vIE1lc3NhZ2UgdGhhdCBhcHBlYXJzIG9uIHRoZSB0b3Agb2YgdGhlIHNjcmVlblxuICAgIC8vIFRoZSBtZXNzYWdlIHRleHQgaXMgc2V0IGJ5IHRoZSBjb250cm9sbGVyIHVzaW5nIHNob3dNZXNzYWdlKClcbiAgICBjb25zdCBtZXNzYWdlOlBJWEkuVGV4dCA9IG5ldyBQSVhJLlRleHQoXG4gICAgICAnUHJlc3MgUGxheSB0byBCZWdpbicsXG4gICAgICBuZXcgUElYSS5UZXh0U3R5bGUoe1xuICAgICAgICBhbGlnbjogY29uZmlnLm1lc3NhZ2UuYWxpZ24sXG4gICAgICAgIGxpbmVKb2luOiBjb25maWcubWVzc2FnZS5saW5lSm9pbixcbiAgICAgICAgZmlsbDogY29uZmlnLm1lc3NhZ2UuZmlsbC5tYXAoY29sb3IgPT4gUElYSS51dGlscy5yZ2IyaGV4KGNvbG9yKSksXG4gICAgICAgIHN0cm9rZTogUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5tZXNzYWdlLnN0cm9rZSksXG4gICAgICAgIHN0cm9rZVRoaWNrbmVzczogY29uZmlnLm1lc3NhZ2Uuc3Ryb2tlVGhpY2tuZXNzXG4gICAgICB9KVxuICAgIClcbiAgICBtZXNzYWdlLmFuY2hvci5zZXQoLjUsIDApXG4gICAgbWVzc2FnZS5wb3NpdGlvbiA9IG5ldyBQSVhJLlBvaW50KDAsIGNvbmZpZy5tZXNzYWdlLmZyb21Ub3ApXG4gICAgcmV0dXJuIG1lc3NhZ2VcbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBCb2FyZChib2FyZExheW91dDpCb2FyZExheW91dCkge1xuICAgIC8vIFRCRDogTW92ZSB0aGlzIHNvcnQgb2YgbG9naWMgdG8gbGF5b3V0IGNvbnRhaW5lciBjbGFzc1xuICAgIGNvbnN0IGJvYXJkUGl4ZWxTaXplOm51bWJlciA9XG4gICAgICBNYXRoLm1pbih0aGlzLnNjcmVlbkxheW91dC5ib2R5V2lkdGgsIHRoaXMuc2NyZWVuTGF5b3V0LmJvZHlIZWlnaHQpXG4gICAgLy8gVGhlIGJvYXJkIHdpbGwgY29udGFpbiB0aGUgY2hlY2tlcnMgYW5kIHNxdWFyZXNcbiAgICB0aGlzLnNjcmVlbkxheW91dC5hZGRUb0JvZHkoXG4gICAgICB0aGlzLmJvYXJkID0gbmV3IERpcmVjdGVkQ2hlY2tlckJvYXJkKFxuICAgICAgICBib2FyZExheW91dCxcbiAgICAgICAgYm9hcmRQaXhlbFNpemUsXG4gICAgICAgIFBJWEkudXRpbHMucmdiMmhleChjb25maWcuYm9hcmQub2RkLmZpbGwpLFxuICAgICAgICBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmJvYXJkLmV2ZW4uZmlsbCksXG4gICAgICApXG4gICAgKVxuICAgIHRoaXMuYm9hcmQucG9zaXRpb24gPSBuZXcgUElYSS5Qb2ludChcbiAgICAgIDAsXG4gICAgICB0aGlzLnNjcmVlbkxheW91dC5ib2R5SGVpZ2h0IC8gMlxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBDaGVja2VycygpIHtcbiAgICAvLyBUaGUgY2hlY2tlcnMgYXJlIGNoaWxkcmVuIG9mIHRoZSBib2FyZCBmb3IgcHJvcGVyIHBvc2l0aW9uaW5nXG4gICAgdGhpcy5ib2FyZC5hZGRDaGlsZCh0aGlzLmNoZWNrZXIxID0gbmV3IENoZWNrZXIoXG4gICAgICB0aGlzLmJvYXJkLnNxdWFyZVNpemUgKiBjb25maWcuY2hlY2tlci5yZWxhdGl2ZVNpemUsXG4gICAgICAvLyBTZW1pLXRyYW5zcGFyZW50IHNvIHRoYXQgdGhlIGFycm93cyBjYW4gYmUgc2VlblxuICAgICAgY29uZmlnLmNoZWNrZXIuYWxwaGEsXG4gICAgICBjb25maWcuY2hlY2tlci5zdHJva2VUaGlja25lc3MsXG4gICAgICBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmNoZWNrZXIuc3Ryb2tlKSxcbiAgICAgIFBJWEkudXRpbHMucmdiMmhleChjb25maWcuY2hlY2tlci5maWxsKVxuICAgICkpXG4gICAgdGhpcy5ib2FyZC5hZGRDaGlsZCh0aGlzLmNoZWNrZXIyID0gbmV3IENoZWNrZXIoXG4gICAgICB0aGlzLmJvYXJkLnNxdWFyZVNpemUgKiBjb25maWcuY2hlY2tlci5yZWxhdGl2ZVNpemUsXG4gICAgICAvLyBTZW1pLXRyYW5zcGFyZW50IHNvIHRoYXQgdGhlIGFycm93cyBjYW4gYmUgc2VlblxuICAgICAgY29uZmlnLmNoZWNrZXIuYWxwaGEsXG4gICAgICBjb25maWcuY2hlY2tlci5zdHJva2VUaGlja25lc3MsXG4gICAgICBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmNoZWNrZXIuc3Ryb2tlKSxcbiAgICAgIFBJWEkudXRpbHMucmdiMmhleChjb25maWcuY2hlY2tlci5maWxsKVxuICAgICkpXG4gIH1cblxuICBwcml2YXRlIHJlc2l6ZShzaXplOm51bWJlcik6dm9pZCB7XG4gICAgLy8gQ3JlYXRlIHNxdWFyZXMgYXMgbmVlZGVkLCBzZXQgdGhlaXIgcG9zaXRpb24gYW5kIGNvbG9yLFxuICAgIC8vIGFuZCBzZXQgYWxsIGFycm93IGRpcmVjdGlvbnMgZnJvbSB0aGUgc2ltdWxhdGlvbiBsYXlvdXRcbiAgICB0aGlzLmJvYXJkLnJlc2l6ZShzaXplKVxuICAgIHRoaXMuY2hlY2tlcjEucmVzaXplKHRoaXMuYm9hcmQuc3F1YXJlU2l6ZSAqIGNvbmZpZy5jaGVja2VyLnJlbGF0aXZlU2l6ZSlcbiAgICB0aGlzLmNoZWNrZXIyLnJlc2l6ZSh0aGlzLmJvYXJkLnNxdWFyZVNpemUgKiBjb25maWcuY2hlY2tlci5yZWxhdGl2ZVNpemUpXG4gIH1cbn1cbiJdfQ==
