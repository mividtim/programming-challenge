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
        // Set scale relative to square size: radius is size (diameter) / 2
        this.drawCircle(0, 0, size / 2);
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
    constructor(body, header = null, footer = null, margin = 0) {
        super();
        this.body = body;
        const screenWidth = document.documentElement.clientWidth;
        const screenHeight = document.documentElement.clientHeight;
        const headerHeight = margin + (header ? header.getLocalBounds().bottom : 0);
        const footerHeight = margin + (footer ? footer.getLocalBounds().bottom : 0);
        if (header) {
            this.addChild(header);
            header.position = new PIXI.Point(screenWidth / 2, margin);
        }
        this.addChild(body);
        body.position = new PIXI.Point(screenWidth / 2, headerHeight + margin);
        if (footer) {
            this.addChild(footer);
            footer.position = new PIXI.Point(screenWidth / 2, screenHeight - footerHeight - margin);
        }
        this.bodyWidth = screenWidth;
        this.bodyHeight = screenHeight - headerHeight - footerHeight - margin * 6;
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
        if (this.children.length > 0) {
            const fullWidth = this.children
                .map(child => child.getLocalBounds().width)
                .reduce((sum, width) => sum += width, 0)
                + this.margin * (this.children.length - 1);
            let left = -fullWidth / 2;
            for (let c = 0; c < this.children.length; c++) {
                const child = this.children[c];
                const bounds = child.getLocalBounds();
                // Center each item on its position
                child.position.x = left - child.getLocalBounds().x;
                left += bounds.width + this.margin;
            }
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
    constructor(width, height, textStyle, fill = 0x542121, strokeThickness = 0, stroke = 0xededed) {
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
exports.Application = Application;
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
        this.screenLayout = new full_screen_header_footer_1.FullScreenHeaderFooter(new horizontal_center_1.HorizontalCenter(), header, footer, config.margin);
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
        message.anchor.set(.5);
        message.position = new PIXI.Point(0, config.message.fromTop);
        return message;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9jaGVja2Vycy9ib2FyZC1sYXlvdXQudHMiLCJzcmMvY29tcG9uZW50cy9jaGVja2Vycy9jaGVja2VyLWJvYXJkLnRzIiwic3JjL2NvbXBvbmVudHMvY2hlY2tlcnMvY2hlY2tlci1zcXVhcmUudHMiLCJzcmMvY29tcG9uZW50cy9jaGVja2Vycy9jaGVja2VyLnRzIiwic3JjL2NvbXBvbmVudHMvY2hlY2tlcnMvZGlyZWN0ZWQvZGlyZWN0ZWQtY2hlY2tlci1ib2FyZC50cyIsInNyYy9jb21wb25lbnRzL2NoZWNrZXJzL2RpcmVjdGVkL2RpcmVjdGVkLWNoZWNrZXItc3F1YXJlLnRzIiwic3JjL2NvbXBvbmVudHMvbGF5b3V0cy9mdWxsLXNjcmVlbi1oZWFkZXItZm9vdGVyLnRzIiwic3JjL2NvbXBvbmVudHMvbGF5b3V0cy9ob3Jpem9udGFsLWNlbnRlci50cyIsInNyYy9jb21wb25lbnRzL3VpL2Fycm93LnRzIiwic3JjL2NvbXBvbmVudHMvdWkvYnV0dG9uLnRzIiwic3JjL2luZGV4LnRzIiwic3JjL3NpbXVsYXRpb24udHMiLCJzcmMvc291bmQtbWFuYWdlci50cyIsInNyYy92aXN1YWxpemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNJQTtJQUdFLFlBQW1CLEdBQVUsRUFBRSxHQUFVO1FBQ3ZDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDaEIsQ0FBQztDQUNGO0FBUEQsc0NBT0M7Ozs7O0FDWEQsZ0NBQStCO0FBQy9CLGlEQUE0QztBQUU1QyxxREFBOEM7QUFnQjlDLGtCQUF3RCxTQUFRLElBQUksQ0FBQyxTQUFTO0lBWTVFLFlBQ0UsSUFBVyxFQUNYLFNBQWdCLEVBQ2hCLFdBQWtCLFFBQVEsRUFDMUIsWUFBbUIsUUFBUTtRQUMzQiw0REFB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QUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3pFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDM0UsQ0FBQztDQUNGO0FBeE9ELHNDQXdPQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge0RpcmVjdGlvbn0gZnJvbSAnLi4vdWkvYXJyb3cnXG5cbmV4cG9ydCB0eXBlIEJvYXJkTGF5b3V0ID0gRGlyZWN0aW9uW11bXVxuXG5leHBvcnQgY2xhc3MgQm9hcmRQb3NpdGlvbiB7XG4gIHB1YmxpYyByb3c6bnVtYmVyXG4gIHB1YmxpYyBjb2w6bnVtYmVyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcihyb3c6bnVtYmVyLCBjb2w6bnVtYmVyKSB7XG4gICAgdGhpcy5yb3cgPSByb3dcbiAgICB0aGlzLmNvbCA9IGNvbFxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnXG5pbXBvcnQge0JvYXJkUG9zaXRpb259IGZyb20gJy4vYm9hcmQtbGF5b3V0J1xuaW1wb3J0IHtDaGVja2VyfSBmcm9tICcuL2NoZWNrZXInXG5pbXBvcnQge0NoZWNrZXJTcXVhcmV9IGZyb20gJy4vY2hlY2tlci1zcXVhcmUnXG5cbi8vIERlZmluZSBTcXVhcmUgYXMgbmV3YWJsZSB0byBhbGxvdyBcIm5ldyB0aGlzLmNyZWF0ZVNxdWFyZVwiIHRvIGNyZWF0ZSBhIG5ld1xuLy8gU3F1YXJlLiBUaGlzIGZvcmNlcyBTcXVhcmUncyBjb25zdHJ1Y3RvciB0byBzYW1lIHBhcmFtZXRlciBsaXN0IGFzXG4vLyBDaGVja2VyU3F1YXJlLCB3aGljaCB3aWxsIGFsbG93IHRoZSBib2FyZCB0byBjcmVhdGUgc3F1YXJlcyBvZiB0aGVcbi8vIGFwcHJvcHJpYXRlIHR5cGUgKGdlbmVyaWMgU3F1YXJlKVxuaW50ZXJmYWNlIENyZWF0ZVNxdWFyZTxTcXVhcmUgZXh0ZW5kcyBDaGVja2VyU3F1YXJlPiB7XG4gIG5ldyAoXG4gICAgcG9zaXRpb246Qm9hcmRQb3NpdGlvbixcbiAgICBwaXhlbFNpemU6bnVtYmVyLFxuICAgIGV2ZW46Ym9vbGVhbixcbiAgICBvZGRDb2xvcjpudW1iZXIsXG4gICAgZXZlbkNvbG9yOm51bWJlclxuICApOlNxdWFyZVxufVxuXG5leHBvcnQgY2xhc3MgQ2hlY2tlckJvYXJkPFNxdWFyZSBleHRlbmRzIENoZWNrZXJTcXVhcmU+IGV4dGVuZHMgUElYSS5Db250YWluZXIge1xuXG4gIHB1YmxpYyBzaXplOm51bWJlclxuICBwcm90ZWN0ZWQgcGl4ZWxTaXplOm51bWJlclxuICBwcm90ZWN0ZWQgb2RkQ29sb3I6bnVtYmVyXG4gIHByb3RlY3RlZCBldmVuQ29sb3I6bnVtYmVyXG4gIHB1YmxpYyBzcXVhcmVTaXplOm51bWJlclxuICBwcm90ZWN0ZWQgc3F1YXJlczpTcXVhcmVbXVtdID0gW11cbiAgLy8gSSBoYXZlbid0IHlldCBmaWd1cmVkIG91dCBob3cgdG8gc2V0IGEgZGVmYXVsdCB2YWx1ZSBoZXJlXG4gIC8vIChkZXNpcmVkOiBDaGVja2VyU3F1YXJlKTsgc28gSSB1c2UgYSBjb25kaXRpb25hbCBpbiB0aGlzLnNldHVwU3F1YXJlKClcbiAgcHJpdmF0ZSBjcmVhdGVTcXVhcmU6Q3JlYXRlU3F1YXJlPFNxdWFyZT5cblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgc2l6ZTpudW1iZXIsXG4gICAgcGl4ZWxTaXplOm51bWJlcixcbiAgICBvZGRDb2xvcjpudW1iZXIgPSAweDExMTExMSxcbiAgICBldmVuQ29sb3I6bnVtYmVyID0gMHhlZTExMTEsXG4gICAgLy8gSSBoYXZlbid0IHlldCBmaWd1cmVkIG91dCBob3cgdG8gc2V0IGEgZGVmYXVsdCB2YWx1ZSBoZXJlXG4gICAgLy8gKGRlc2lyZWQ6IENoZWNrZXJTcXVhcmUpOyBzbyBJIHVzZSBhIGNvbmRpdGlvbmFsIGluIHRoaXMuc2V0dXBTcXVhcmUoKVxuICAgIGNyZWF0ZVNxdWFyZTpDcmVhdGVTcXVhcmU8U3F1YXJlPiA9IG51bGxcbiAgKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMucGl4ZWxTaXplID0gcGl4ZWxTaXplXG4gICAgdGhpcy5vZGRDb2xvciA9IG9kZENvbG9yXG4gICAgdGhpcy5ldmVuQ29sb3IgPSBldmVuQ29sb3JcbiAgICB0aGlzLmNyZWF0ZVNxdWFyZSA9IGNyZWF0ZVNxdWFyZVxuICAgIHRoaXMucmVzaXplKHNpemUpXG4gIH1cblxuICBwdWJsaWMgcmVzaXplKHNpemU6bnVtYmVyKTp2b2lkIHtcbiAgICB0aGlzLnNpemUgPSBzaXplXG4gICAgdGhpcy5zcXVhcmVTaXplID0gdGhpcy5waXhlbFNpemUgLyB0aGlzLnNpemVcbiAgICB0aGlzLnNocmluaygpXG4gICAgdGhpcy5leHBhbmRBbmRDb2xvcml6ZSgpXG4gIH1cblxuICBwdWJsaWMgdG9Ub3Aob2JqZWN0OlBJWEkuRGlzcGxheU9iamVjdCk6dm9pZCB7XG4gICAgdGhpcy5yZW1vdmVDaGlsZChvYmplY3QpXG4gICAgdGhpcy5hZGRDaGlsZChvYmplY3QpXG4gIH1cblxuICBwdWJsaWMgYm9hcmRQb3NpdGlvblRvUGl4ZWxzKGJvYXJkUG9zaXRpb246Qm9hcmRQb3NpdGlvbik6UElYSS5Qb2ludCB7XG4gICAgcmV0dXJuIG5ldyBQSVhJLlBvaW50KFxuICAgICAgKGJvYXJkUG9zaXRpb24uY29sIC0gdGhpcy5zaXplIC8gMikgKiB0aGlzLnNxdWFyZVNpemUgKyB0aGlzLnNxdWFyZVNpemUgLyAyLFxuICAgICAgKGJvYXJkUG9zaXRpb24ucm93IC0gdGhpcy5zaXplIC8gMikgKiB0aGlzLnNxdWFyZVNpemUgKyB0aGlzLnNxdWFyZVNpemUgLyAyXG4gICAgKVxuICB9XG5cbiAgLy8gRGVzdHJveSBleHRyYSBib2FyZCBwb3NpdGlvbnMgaWYgdGhlIG5ldyBib2FyZCBsYXlvdXQgaXMgc21hbGxlciB0aGFuIHRoZVxuICAvLyBsYXN0IGJvYXJkXG4gIHByaXZhdGUgc2hyaW5rKCk6dm9pZCB7XG4gICAgd2hpbGUodGhpcy5zcXVhcmVzLmxlbmd0aCA+IHRoaXMuc2l6ZSkge1xuICAgICAgLy8gRGVsZXRlIHRoZSBsYXN0IHJvd1xuICAgICAgY29uc3Qgcm93OlNxdWFyZVtdID0gdGhpcy5zcXVhcmVzW3RoaXMuc3F1YXJlcy5sZW5ndGggLSAxXVxuICAgICAgd2hpbGUocm93Lmxlbmd0aCA+IDApXG4gICAgICAgIHJvdy5wb3AoKS5kZXN0cm95KClcbiAgICAgIHRoaXMuc3F1YXJlcy5wb3AoKVxuICAgICAgLy8gRGVsZXRlIHRoZSBsYXN0IGNvbHVtbiBmcm9tIGVhY2ggcm93XG4gICAgICBmb3IobGV0IHJvdyBvZiB0aGlzLnNxdWFyZXMpXG4gICAgICAgIHJvdy5wb3AoKS5kZXN0cm95KClcbiAgICB9XG4gIH1cblxuICAvLyBBZGQgc3F1YXJlcyBvZiB0aGUgYXBwcm9wcmlhdGUgc2l6ZSwgY29sb3IsIGFuZCBwb3NpdGlvbiB0byBmaWxsIHRoZVxuICAvLyBib2FyZCdzIHBpeGVsIHNpemU7IHJlc2l6ZSBhbmQgc2V0IHBvc2l0aW9uIGFuZCBjb2xvciBmb3IgZXhpc3Rpbmcgc3F1YXJlc1xuICBwcml2YXRlIGV4cGFuZEFuZENvbG9yaXplKCk6dm9pZCB7XG4gICAgLy8gZXZlbiB0cmFja3MgdGhlIGFsdGVybmF0aW5nIHNxdWFyZSBjb2xvcnNcbiAgICBsZXQgZXZlbjpib29sZWFuID0gZmFsc2VcbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGJvYXJkIHBvc2l0aW9ucyBmb3IgdGhlIGdpdmVuIGJvYXJkIHNpemVcbiAgICBmb3IobGV0IHJvdzpudW1iZXIgPSAwIDsgcm93IDwgdGhpcy5zaXplIDsgcm93KyspIHtcbiAgICAgIC8vIEFkZCB0aGUgcm93IGlmIG91ciBib2FyZCBpc24ndCB0aGF0IGJpZyB5ZXRcbiAgICAgIGlmKHJvdyA+IHRoaXMuc3F1YXJlcy5sZW5ndGggLSAxKVxuICAgICAgICB0aGlzLnNxdWFyZXMucHVzaChbXSlcbiAgICAgIGZvcihsZXQgY29sOm51bWJlciA9IDAgOyBjb2wgPCB0aGlzLnNpemUgOyBjb2wrKykge1xuICAgICAgICB0aGlzLnNldHVwU3F1YXJlKG5ldyBCb2FyZFBvc2l0aW9uKHJvdywgY29sKSwgZXZlbilcbiAgICAgICAgLy8gU3RhZ2dlciB0aGUgc3F1YXJlIGNvbG9yc1xuICAgICAgICBldmVuID0gIWV2ZW5cbiAgICAgIH1cbiAgICAgIC8vIEZvciBldmVuLXNpemVkIGJvYXJkcywgaGF2ZSB0byBzdGFnZ2VyIHRoZSBzcXVhcmUgY29sb3JzIGJhY2tcbiAgICAgIGlmKHRoaXMuc2l6ZSAlIDIgPT09IDApXG4gICAgICAgIGV2ZW4gPSAhZXZlblxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBTcXVhcmUocG9zaXRpb246Qm9hcmRQb3NpdGlvbiwgZXZlbjpib29sZWFuKTp2b2lkIHtcbiAgICBsZXQgc3F1YXJlOlNxdWFyZVxuICAgIC8vIElmIHdlIGRvbid0IHlldCBoYXZlIGEgc3F1YXJlIGZvciB0aGlzIHBvc2l0aW9uLCBjcmVhdGUgaXRcbiAgICBpZihwb3NpdGlvbi5jb2wgPiB0aGlzLnNxdWFyZXNbcG9zaXRpb24ucm93XS5sZW5ndGggLSAxKSB7XG4gICAgICAvLyBJIGhhdmVuJ3QgeWV0IGZpZ3VyZWQgb3V0IGhvdyB0byBzZXQgYSBkZWZhdWx0IHZhbHVlIGZvclxuICAgICAgLy8gdGhpcy5jcmVhdGVTcXVhcmUsIHNvIEkgdXNlIGEgY29uZGl0aW9uYWwgaGVyZSBmb3IgdGhlIGRlZmF1bHRcbiAgICAgIHNxdWFyZSA9IHRoaXMuY3JlYXRlU3F1YXJlXG4gICAgICAgID8gbmV3IHRoaXMuY3JlYXRlU3F1YXJlKFxuICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgIHRoaXMuc3F1YXJlU2l6ZSxcbiAgICAgICAgICBldmVuLFxuICAgICAgICAgIHRoaXMub2RkQ29sb3IsXG4gICAgICAgICAgdGhpcy5ldmVuQ29sb3JcbiAgICAgICAgKVxuICAgICAgICA6IG5ldyBDaGVja2VyU3F1YXJlKFxuICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgIHRoaXMuc3F1YXJlU2l6ZSxcbiAgICAgICAgICBldmVuLFxuICAgICAgICAgIHRoaXMub2RkQ29sb3IsXG4gICAgICAgICAgdGhpcy5ldmVuQ29sb3JcbiAgICAgICAgKSBhcyBTcXVhcmVcbiAgICAgIHRoaXMuYWRkQ2hpbGQoc3F1YXJlKVxuICAgICAgdGhpcy5zcXVhcmVzW3Bvc2l0aW9uLnJvd10ucHVzaChzcXVhcmUpXG4gICAgfVxuICAgIC8vIElmIHdlIGRvIGhhdmUgYSBzcXVhcmUgYXQgdGhpcyBwb3NpdGlvbiBhbHJlYWR5LCB0ZWxsIGl0IHRvIHJlc2V0XG4gICAgLy8gaXRzIHBvc2l0aW9uLCBjb2xvciwgYW5kIGFycm93IGRpcmVjdGlvbiBpZiBuZWVkZWRcbiAgICBlbHNlIHtcbiAgICAgIHNxdWFyZSA9IHRoaXMuc3F1YXJlc1twb3NpdGlvbi5yb3ddW3Bvc2l0aW9uLmNvbF1cbiAgICAgIHNxdWFyZS5yZXNldCh0aGlzLnNxdWFyZVNpemUsIGV2ZW4pXG4gICAgfVxuICAgIHNxdWFyZS5wb3NpdGlvbiA9IHRoaXMuYm9hcmRQb3NpdGlvblRvUGl4ZWxzKHBvc2l0aW9uKVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnXG5pbXBvcnQge0JvYXJkUG9zaXRpb259IGZyb20gJy4vYm9hcmQtbGF5b3V0J1xuXG5leHBvcnQgY2xhc3MgQ2hlY2tlclNxdWFyZSBleHRlbmRzIFBJWEkuR3JhcGhpY3Mge1xuXG4gIHB1YmxpYyBib2FyZFBvc2l0aW9uOkJvYXJkUG9zaXRpb25cbiAgcHJpdmF0ZSBwaXhlbFNpemU6bnVtYmVyXG4gIHByaXZhdGUgZXZlbjpib29sZWFuXG4gIHByaXZhdGUgb2RkQ29sb3I6bnVtYmVyXG4gIHByaXZhdGUgZXZlbkNvbG9yOm51bWJlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBib2FyZFBvc2l0aW9uOkJvYXJkUG9zaXRpb24sXG4gICAgcGl4ZWxTaXplOm51bWJlcixcbiAgICBldmVuOmJvb2xlYW4sXG4gICAgb2RkQ29sb3I6bnVtYmVyID0gMHgxMTExMTEsXG4gICAgZXZlbkNvbG9yOm51bWJlciA9IDB4ZWUxMTExLFxuICAgIGxpbmVzOmJvb2xlYW4gPSBmYWxzZVxuICApIHtcbiAgICBzdXBlcigpIC8vbGluZXMpXG4gICAgdGhpcy5ib2FyZFBvc2l0aW9uID0gYm9hcmRQb3NpdGlvblxuICAgIHRoaXMucGl4ZWxTaXplID0gcGl4ZWxTaXplXG4gICAgdGhpcy5ldmVuID0gZXZlblxuICAgIHRoaXMub2RkQ29sb3IgPSBvZGRDb2xvclxuICAgIHRoaXMuZXZlbkNvbG9yID0gZXZlbkNvbG9yXG4gICAgdGhpcy5yZWRyYXcoKVxuICB9XG5cbiAgcHVibGljIHJlc2V0KHBpeGVsU2l6ZTpudW1iZXIsIGV2ZW46Ym9vbGVhbik6dm9pZCB7XG4gICAgLy8gSWYgdGhlIHBpeGVsIHNpemUgb3IgY29sb3Igb2YgdGhlIHNxdWFyZSBjaGFuZ2VzLCByZWNyZWF0ZSB0aGUgc3F1YXJlXG4gICAgaWYodGhpcy5waXhlbFNpemUgIT09IHBpeGVsU2l6ZSB8fCB0aGlzLmV2ZW4gIT09IGV2ZW4pIHtcbiAgICAgIHRoaXMucGl4ZWxTaXplID0gcGl4ZWxTaXplXG4gICAgICB0aGlzLmV2ZW4gPSBldmVuXG4gICAgICAvLyBSZWRyYXcgdGhlIHNxdWFyZSBhbmQgYXJyb3cgYXQgdGhlIHByb3BlciBzaXplIGFuZCBwb3NpdGlvblxuICAgICAgdGhpcy5yZWRyYXcoKVxuICAgIH1cbiAgfVxuXG4gIC8vIFdlIGtlZXAgdHJhY2sgb2YgZXZlbi9vZGQgaW4gYW4gaW5zdGFuY2UgdmFyaWFibGUgdG8gc2VlIGlmIHdlIG5lZWQgdG9cbiAgLy8gcmVjcmVhdGUgdGhlIHNxdWFyZTsgSSdkIHByZWZlciB0byBwYXNzIGl0LCBidXQgaGV5IHdlIGFscmVhZHkgaGF2ZSBpdFxuICBwcml2YXRlIHJlZHJhdygpOnZvaWQge1xuICAgIHRoaXMuY2xlYXIoKVxuICAgIHRoaXMuYmVnaW5GaWxsKHRoaXMuZXZlbiA/IHRoaXMuZXZlbkNvbG9yIDogdGhpcy5vZGRDb2xvcilcbiAgICAvLyBDZW50ZXIgaXQgb24gdGhlIGl0cyBwb3NpdGlvblxuICAgIHRoaXMuZHJhd1JlY3QoXG4gICAgICAtdGhpcy5waXhlbFNpemUgLyAyLFxuICAgICAgLXRoaXMucGl4ZWxTaXplIC8gMixcbiAgICAgIHRoaXMucGl4ZWxTaXplLFxuICAgICAgdGhpcy5waXhlbFNpemVcbiAgICApXG4gICAgdGhpcy5lbmRGaWxsKClcbiAgfVxuXG59XG4iLCJpbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnXG5cbmV4cG9ydCBjbGFzcyBDaGVja2VyIGV4dGVuZHMgUElYSS5HcmFwaGljcyB7XG5cbiAgcHJpdmF0ZSBzdHJva2VUaGlja25lc3M6bnVtYmVyXG4gIHByaXZhdGUgc3Ryb2tlOm51bWJlclxuICBwcml2YXRlIGZpbGw6bnVtYmVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHNpemU6bnVtYmVyLFxuICAgIGFscGhhOm51bWJlciA9IDEsXG4gICAgc3Ryb2tlVGhpY2tuZXNzOm51bWJlciA9IDAsXG4gICAgc3Ryb2tlID0gMHgwMDAwMDAsXG4gICAgZmlsbDpudW1iZXIgPSAweDExMTExMSxcbiAgICBsaW5lczpib29sZWFuID0gZmFsc2UsXG4gICkge1xuICAgIHN1cGVyKCkgLy9saW5lcylcbiAgICAvLyBTZW1pLXRyYW5zcGFyZW50IHNvIHRoYXQgdGhlIGFycm93cyBjYW4gYmUgc2VlblxuICAgIHRoaXMuYWxwaGEgPSBhbHBoYVxuICAgIHRoaXMuc3Ryb2tlVGhpY2tuZXNzID0gc3Ryb2tlVGhpY2tuZXNzXG4gICAgdGhpcy5zdHJva2UgPSBzdHJva2VcbiAgICB0aGlzLmZpbGwgPSBmaWxsXG4gICAgdGhpcy5yZXNpemUoc2l6ZSlcbiAgfVxuXG4gIHB1YmxpYyByZXNpemUoc2l6ZTpudW1iZXIpIHtcbiAgICB0aGlzLmNsZWFyKClcbiAgICB0aGlzLmxpbmVTdHlsZSh0aGlzLnN0cm9rZVRoaWNrbmVzcywgdGhpcy5zdHJva2UpXG4gICAgdGhpcy5iZWdpbkZpbGwodGhpcy5maWxsKVxuICAgIC8vIFNldCBzY2FsZSByZWxhdGl2ZSB0byBzcXVhcmUgc2l6ZTogcmFkaXVzIGlzIHNpemUgKGRpYW1ldGVyKSAvIDJcbiAgICB0aGlzLmRyYXdDaXJjbGUoMCwgMCwgc2l6ZSAvIDIpXG4gICAgdGhpcy5lbmRGaWxsKClcbiAgfVxufVxuIiwiaW1wb3J0IHtDaGVja2VyQm9hcmR9IGZyb20gJy4uL2NoZWNrZXItYm9hcmQnXG5pbXBvcnQge0RpcmVjdGVkQ2hlY2tlclNxdWFyZX0gZnJvbSAnLi9kaXJlY3RlZC1jaGVja2VyLXNxdWFyZSdcbmltcG9ydCB7Qm9hcmRMYXlvdXR9IGZyb20gJy4uL2JvYXJkLWxheW91dCdcbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICcuLi8uLi91aS9hcnJvdydcblxuZXhwb3J0IGNsYXNzIERpcmVjdGVkQ2hlY2tlckJvYXJkIGV4dGVuZHMgQ2hlY2tlckJvYXJkPERpcmVjdGVkQ2hlY2tlclNxdWFyZT4ge1xuXG4gIHByaXZhdGUgYm9hcmRMYXlvdXQ6Qm9hcmRMYXlvdXRcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgYm9hcmRMYXlvdXQ6Qm9hcmRMYXlvdXQsXG4gICAgcGl4ZWxTaXplOm51bWJlcixcbiAgICBvZGRDb2xvcjpudW1iZXIgPSAweDExMTExMSxcbiAgICBldmVuQ29sb3I6bnVtYmVyID0gMHhlZTExMTFcbiAgKSB7XG4gICAgc3VwZXIoXG4gICAgICBib2FyZExheW91dC5sZW5ndGgsXG4gICAgICBwaXhlbFNpemUsXG4gICAgICBvZGRDb2xvcixcbiAgICAgIGV2ZW5Db2xvcixcbiAgICAgIERpcmVjdGVkQ2hlY2tlclNxdWFyZVxuICAgIClcbiAgICB0aGlzLnNldEJvYXJkTGF5b3V0KGJvYXJkTGF5b3V0KVxuICB9XG5cbiAgcHVibGljIHNldEJvYXJkTGF5b3V0KGJvYXJkTGF5b3V0OkJvYXJkTGF5b3V0KSB7XG4gICAgZm9yKGxldCByb3c6bnVtYmVyID0gMCA7IHJvdyA8IGJvYXJkTGF5b3V0Lmxlbmd0aCA7IHJvdysrKSB7XG4gICAgICBmb3IobGV0IGNvbDpudW1iZXIgPSAwIDsgY29sIDwgYm9hcmRMYXlvdXQubGVuZ3RoIDsgY29sKyspIHtcbiAgICAgICAgY29uc3Qgc3F1YXJlOkRpcmVjdGVkQ2hlY2tlclNxdWFyZSA9IHRoaXMuc3F1YXJlc1tyb3ddW2NvbF1cbiAgICAgICAgc3F1YXJlLnNldERpcmVjdGlvbihib2FyZExheW91dFtyb3ddW2NvbF0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQge0Fycm93fSBmcm9tICcuLi8uLi91aS9hcnJvdydcbmltcG9ydCB7Q2hlY2tlclNxdWFyZX0gZnJvbSAnLi4vY2hlY2tlci1zcXVhcmUnXG5pbXBvcnQge0JvYXJkUG9zaXRpb259IGZyb20gJy4uL2JvYXJkLWxheW91dCdcbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICcuLi8uLi91aS9hcnJvdydcblxuZXhwb3J0IGNsYXNzIERpcmVjdGVkQ2hlY2tlclNxdWFyZSBleHRlbmRzIENoZWNrZXJTcXVhcmUge1xuXG4gIHByaXZhdGUgYXJyb3c6QXJyb3dcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgcG9zaXRpb246Qm9hcmRQb3NpdGlvbixcbiAgICBwaXhlbFNpemU6bnVtYmVyLFxuICAgIGV2ZW46Ym9vbGVhbixcbiAgICBvZGRDb2xvcjpudW1iZXIgPSAweDExMTExMSxcbiAgICBldmVuQ29sb3I6bnVtYmVyID0gMHhlZTExMTEsXG4gICAgZGlyZWN0aW9uOkRpcmVjdGlvbiA9IERpcmVjdGlvbi5VcCxcbiAgICBhcnJvd0NvbG9yOm51bWJlciA9IDB4ZmZmZmZmLFxuICAgIGxpbmVzOmJvb2xlYW4gPSBmYWxzZVxuICApIHtcbiAgICBzdXBlcihwb3NpdGlvbiwgcGl4ZWxTaXplLCBldmVuLCBvZGRDb2xvciwgZXZlbkNvbG9yLCBsaW5lcylcbiAgICB0aGlzLmFkZENoaWxkKHRoaXMuYXJyb3cgPSBuZXcgQXJyb3cocGl4ZWxTaXplLCBkaXJlY3Rpb24sIGFycm93Q29sb3IpKVxuICB9XG5cbiAgcHVibGljIHJlc2V0KHBpeGVsU2l6ZTpudW1iZXIsIGV2ZW46Ym9vbGVhbikge1xuICAgIHN1cGVyLnJlc2V0KHBpeGVsU2l6ZSwgZXZlbilcbiAgICB0aGlzLmFycm93LnJlZHJhdyhwaXhlbFNpemUpXG4gIH1cblxuICBwdWJsaWMgc2V0RGlyZWN0aW9uKGRpcmVjdGlvbjpEaXJlY3Rpb24pIHtcbiAgICB0aGlzLmFycm93LnNldERpcmVjdGlvbihkaXJlY3Rpb24pXG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIFBJWEkgZnJvbSAncGl4aS5qcydcblxuZXhwb3J0IGNsYXNzIEZ1bGxTY3JlZW5IZWFkZXJGb290ZXIgZXh0ZW5kcyBQSVhJLkNvbnRhaW5lciB7XG5cbiAgcHJpdmF0ZSBib2R5OlBJWEkuQ29udGFpbmVyXG4gIHB1YmxpYyByZWFkb25seSBib2R5V2lkdGg6bnVtYmVyXG4gIHB1YmxpYyByZWFkb25seSBib2R5SGVpZ2h0Om51bWJlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBib2R5OlBJWEkuQ29udGFpbmVyLFxuICAgIGhlYWRlcjpQSVhJLkRpc3BsYXlPYmplY3QgPSBudWxsLFxuICAgIGZvb3RlcjpQSVhJLkRpc3BsYXlPYmplY3QgPSBudWxsLFxuICAgIG1hcmdpbjpudW1iZXIgPSAwXG4gICkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmJvZHkgPSBib2R5XG4gICAgY29uc3Qgc2NyZWVuV2lkdGggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICBjb25zdCBzY3JlZW5IZWlnaHQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICAgY29uc3QgaGVhZGVySGVpZ2h0ID0gbWFyZ2luICsgKGhlYWRlciA/IGhlYWRlci5nZXRMb2NhbEJvdW5kcygpLmJvdHRvbSA6IDApXG4gICAgY29uc3QgZm9vdGVySGVpZ2h0ID0gbWFyZ2luICsgKGZvb3RlciA/IGZvb3Rlci5nZXRMb2NhbEJvdW5kcygpLmJvdHRvbSA6IDApXG4gICAgaWYoaGVhZGVyKSB7XG4gICAgICB0aGlzLmFkZENoaWxkKGhlYWRlcilcbiAgICAgIGhlYWRlci5wb3NpdGlvbiA9IG5ldyBQSVhJLlBvaW50KHNjcmVlbldpZHRoIC8gMiwgbWFyZ2luKVxuICAgIH1cbiAgICB0aGlzLmFkZENoaWxkKGJvZHkpXG4gICAgYm9keS5wb3NpdGlvbiA9IG5ldyBQSVhJLlBvaW50KHNjcmVlbldpZHRoIC8gMiwgaGVhZGVySGVpZ2h0ICsgbWFyZ2luKVxuICAgIGlmKGZvb3Rlcikge1xuICAgICAgdGhpcy5hZGRDaGlsZChmb290ZXIpXG4gICAgICBmb290ZXIucG9zaXRpb24gPSBuZXcgUElYSS5Qb2ludChzY3JlZW5XaWR0aCAvIDIsIHNjcmVlbkhlaWdodCAtIGZvb3RlckhlaWdodCAtIG1hcmdpbilcbiAgICB9XG4gICAgdGhpcy5ib2R5V2lkdGggPSBzY3JlZW5XaWR0aFxuICAgIHRoaXMuYm9keUhlaWdodCA9IHNjcmVlbkhlaWdodCAtIGhlYWRlckhlaWdodCAtIGZvb3RlckhlaWdodCAtIG1hcmdpbiAqIDZcbiAgfVxuXG4gIHB1YmxpYyBhZGRUb0JvZHkoY2hpbGQ6UElYSS5EaXNwbGF5T2JqZWN0KTpQSVhJLkRpc3BsYXlPYmplY3Qge1xuICAgIHJldHVybiB0aGlzLmJvZHkuYWRkQ2hpbGQoY2hpbGQpXG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIFBJWEkgZnJvbSAncGl4aS5qcydcblxuZXhwb3J0IGNsYXNzIEhvcml6b250YWxDZW50ZXIgZXh0ZW5kcyBQSVhJLkNvbnRhaW5lciB7XG5cbiAgcHJpdmF0ZSBtYXJnaW46bnVtYmVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKG1hcmdpbjpudW1iZXIgPSAwKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuc2V0TWFyZ2luKG1hcmdpbilcbiAgICB0aGlzLm9uQ2hpbGRyZW5DaGFuZ2UgPSB0aGlzLnJlcG9zaXRpb25DaGlsZHJlblxuICB9XG5cbiAgcHVibGljIHNldE1hcmdpbihtYXJnaW46bnVtYmVyKSB7XG4gICAgdGhpcy5tYXJnaW4gPSBtYXJnaW5cbiAgICB0aGlzLnJlcG9zaXRpb25DaGlsZHJlbigpXG4gIH1cblxuICBwcml2YXRlIHJlcG9zaXRpb25DaGlsZHJlbigpOnZvaWQge1xuICAgIGlmKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZnVsbFdpZHRoOm51bWJlciA9XG4gICAgICAgIHRoaXMuY2hpbGRyZW5cbiAgICAgICAgICAubWFwKGNoaWxkID0+IGNoaWxkLmdldExvY2FsQm91bmRzKCkud2lkdGgpXG4gICAgICAgICAgLnJlZHVjZSgoc3VtLCB3aWR0aCkgPT4gc3VtICs9IHdpZHRoLCAwKVxuICAgICAgICArIHRoaXMubWFyZ2luICogKHRoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMSlcbiAgICAgIGxldCBsZWZ0Om51bWJlciA9IC1mdWxsV2lkdGggLyAyXG4gICAgICBmb3IobGV0IGM6bnVtYmVyID0gMCA7IGMgPCB0aGlzLmNoaWxkcmVuLmxlbmd0aCA7IGMrKykge1xuICAgICAgICBjb25zdCBjaGlsZDpQSVhJLkRpc3BsYXlPYmplY3QgPSB0aGlzLmNoaWxkcmVuW2NdXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGNoaWxkLmdldExvY2FsQm91bmRzKClcbiAgICAgICAgLy8gQ2VudGVyIGVhY2ggaXRlbSBvbiBpdHMgcG9zaXRpb25cbiAgICAgICAgY2hpbGQucG9zaXRpb24ueCA9IGxlZnQgLSBjaGlsZC5nZXRMb2NhbEJvdW5kcygpLnhcbiAgICAgICAgbGVmdCArPSBib3VuZHMud2lkdGggKyB0aGlzLm1hcmdpblxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJ1xuXG5leHBvcnQgY29uc3QgZW51bSBEaXJlY3Rpb24ge1xuICBVcCA9IDAsXG4gIFJpZ2h0LFxuICBEb3duLFxuICBMZWZ0XG59XG5cbmV4cG9ydCBjbGFzcyBBcnJvdyBleHRlbmRzIFBJWEkuR3JhcGhpY3Mge1xuXG4gIHByaXZhdGUgZGlyZWN0aW9uOkRpcmVjdGlvbiA9IERpcmVjdGlvbi5VcFxuICBwcml2YXRlIGNvbG9yOm51bWJlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBzaXplOm51bWJlcixcbiAgICBkaXJlY3Rpb246RGlyZWN0aW9uID0gRGlyZWN0aW9uLlVwLFxuICAgIGNvbG9yPTB4ZmZmZmZmLFxuICAgIGxpbmVzOmJvb2xlYW4gPSBmYWxzZVxuICApIHtcbiAgICBzdXBlcigpIC8vbGluZXMpXG4gICAgdGhpcy5yZWRyYXcoc2l6ZSwgY29sb3IpXG4gICAgdGhpcy5zZXREaXJlY3Rpb24oZGlyZWN0aW9uKVxuICB9XG5cbiAgLy8gT25seSBpdHMgZmlsbCBjb2xvciBpcyBjb25maWd1cmFibGUsIGFuZCBubyBzdHJva2VcbiAgLy8gQXJyb3cgc2l6ZSBpcyBjYWxjdWxhdGVkIHJlbGF0aXZlIHRvIHNxdWFyZSBzaXplXG4gIC8vIEZ1bGwgb2YgXCJtYWdpYyBudW1iZXJzXCI6IFRCRCB0byBtb3ZlIHRoZXNlIHRvIGNvbmZpZ1xuICBwdWJsaWMgcmVkcmF3KHNpemU6bnVtYmVyLCBjb2xvcjpudW1iZXIgPSBudWxsKSB7XG4gICAgaWYoY29sb3IgPT0gbnVsbClcbiAgICAgIGNvbG9yID0gdGhpcy5jb2xvclxuICAgIGVsc2VcbiAgICAgIHRoaXMuY29sb3IgPSBjb2xvclxuICAgIHRoaXMuY2xlYXIoKVxuICAgIHRoaXMuYmVnaW5GaWxsKGNvbG9yKVxuICAgIC8vIFRoZSBib2R5IG9mIHRoZSBhcnJvd1xuICAgIHRoaXMuZHJhd1JlY3QoLXNpemUgLyAxMiwgLXNpemUgKiAuMiwgc2l6ZSAvIDYsIHNpemUgKiAuNilcbiAgICAvLyBUaGUgYXJyb3doZWFkXG4gICAgdGhpcy5kcmF3UG9seWdvbihbXG4gICAgICBuZXcgUElYSS5Qb2ludCgwLCAtc2l6ZSAqIC40KSxcbiAgICAgIG5ldyBQSVhJLlBvaW50KC1zaXplICogLjI1LCAtc2l6ZSAqIC4xKSxcbiAgICAgIG5ldyBQSVhJLlBvaW50KHNpemUgKiAuMjUsIC1zaXplICogLjEpXG4gICAgXSlcbiAgICB0aGlzLmVuZEZpbGwoKVxuICB9XG5cbiAgcHVibGljIHNldERpcmVjdGlvbihkaXJlY3Rpb246RGlyZWN0aW9uKSB7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb25cbiAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5QSSAvIDIgKiB0aGlzLmRpcmVjdGlvblxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnXG5cbmV4cG9ydCBjbGFzcyBCdXR0b24gZXh0ZW5kcyBQSVhJLkdyYXBoaWNzIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgbGFiZWw6c3RyaW5nLFxuICAgIHN0eWxlOkJ1dHRvblN0eWxlXG4gICkge1xuICAgIHN1cGVyKClcbiAgICAvLyBTZXQgdGhlIHN0eWxlcyBmcm9tIHRoZSBjb25maWcgYW5kIGRyYXcgdG8gY29uZmlndXJlZCBzaXplXG4gICAgdGhpcy5saW5lU3R5bGUoc3R5bGUuc3Ryb2tlVGhpY2tuZXNzLCBzdHlsZS5zdHJva2UpXG4gICAgdGhpcy5iZWdpbkZpbGwoc3R5bGUuZmlsbClcbiAgICB0aGlzLmRyYXdSZWN0KC1zdHlsZS53aWR0aCAvIDIsIC1zdHlsZS5oZWlnaHQgLyAyLCBzdHlsZS53aWR0aCwgc3R5bGUuaGVpZ2h0KVxuICAgIHRoaXMuZW5kRmlsbCgpXG4gICAgLy8gQWRkIHN0eWxlZCBidXR0b24gdGV4dFxuICAgIGNvbnN0IHRleHQ6UElYSS5UZXh0ID0gbmV3IFBJWEkuVGV4dChsYWJlbCwgc3R5bGUudGV4dFN0eWxlKVxuICAgIC8vIENlbnRlciB0aGUgdGV4dCBvbiB0aGUgYnV0dG9uXG4gICAgdGV4dC5hbmNob3Iuc2V0KC41KVxuICAgIHRoaXMuYWRkQ2hpbGQodGV4dClcbiAgICAvLyBTZXQgdXAgdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcbiAgICB0aGlzLm9uKCdtb3VzZXVwJywgKCkgPT4gdGhpcy5lbWl0KCdwcmVzc2VkJykpXG4gICAgdGhpcy5vbigndG91Y2hlbmQnLCAoKSA9PiB0aGlzLmVtaXQoJ3ByZXNzZWQnKSlcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQnV0dG9uU3R5bGUge1xuXG4gIHB1YmxpYyB3aWR0aDpudW1iZXJcbiAgcHVibGljIGhlaWdodDpudW1iZXJcbiAgcHVibGljIHRleHRTdHlsZTpQSVhJLlRleHRTdHlsZVxuICBwdWJsaWMgZmlsbDpudW1iZXJcbiAgcHVibGljIHN0cm9rZTpudW1iZXJcbiAgcHVibGljIHN0cm9rZVRoaWNrbmVzczpudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgd2lkdGg6bnVtYmVyLFxuICAgIGhlaWdodDpudW1iZXIsXG4gICAgdGV4dFN0eWxlOlBJWEkuVGV4dFN0eWxlLFxuICAgIGZpbGw6bnVtYmVyID0gMHg1NDIxMjEsXG4gICAgc3Ryb2tlVGhpY2tuZXNzOm51bWJlciA9IDAsXG4gICAgc3Ryb2tlOm51bWJlciA9IDB4ZWRlZGVkXG4gICkge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aFxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgdGhpcy50ZXh0U3R5bGUgPSB0ZXh0U3R5bGVcbiAgICB0aGlzLmZpbGwgPSBmaWxsXG4gICAgdGhpcy5zdHJva2VUaGlja25lc3MgPSBzdHJva2VUaGlja25lc3NcbiAgICB0aGlzLnN0cm9rZSA9IHN0cm9rZVxuICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi90eXBpbmdzL2luZGV4LmQudHMnIC8+XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcbmltcG9ydCB7U2ltdWxhdGlvbiwgU2ltdWxhdGlvblN0YXRlfSBmcm9tICcuL3NpbXVsYXRpb24nXG5pbXBvcnQge0JvYXJkUG9zaXRpb259IGZyb20gJy4vY29tcG9uZW50cy9jaGVja2Vycy9ib2FyZC1sYXlvdXQnXG5pbXBvcnQge1Zpc3VhbGl6YXRpb259IGZyb20gJy4vdmlzdWFsaXphdGlvbidcblxuY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoJy4vY29uZmlnLmpzb24nLCAndXRmLTgnKSlcblxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uIHtcblxuICBwcml2YXRlIHNpbXVsYXRpb246U2ltdWxhdGlvblxuICBwcml2YXRlIHZpc3VhbGl6YXRpb246VmlzdWFsaXphdGlvblxuICBwcml2YXRlIHRpbWVvdXQ6bnVtYmVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIE51bWJlciBvZiByb3dzIGFuZCBjb2x1bW5zIGZvciB0aGUgc2ltdWxhdGlvbiBib2FyZFxuICAgIHRoaXMuc2ltdWxhdGlvbiA9IG5ldyBTaW11bGF0aW9uKGNvbmZpZy5zaW11bGF0aW9uLmluaXRpYWxTaXplKVxuICAgIC8vIENhbGxlZCBieSB0aGUgc2ltdWxhdGlvbiB3aGVuZXZlciBhIHBvaW50IG1vdmVzXG4gICAgLy8gKGluIG9yZGVyIHRvIGFuaW1hdGUgaXQsIHBlcmhhcHMpXG4gICAgdGhpcy5zaW11bGF0aW9uLm9uKCdtb3ZlJywgdGhpcy5wb2ludGVyTW92ZWQpXG4gICAgdGhpcy5zaW11bGF0aW9uLm9uKCdlbmQnLCB0aGlzLnNpbXVsYXRpb25FbmRlZClcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24gPSBuZXcgVmlzdWFsaXphdGlvbih0aGlzLnNpbXVsYXRpb24uYm9hcmRMYXlvdXQpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLm9uKCdwbGF5JywgdGhpcy5wbGF5KVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5vbignc3RvcCcsIHRoaXMuZm9yY2VTdG9wKVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5vbigncmVzaXplJywgdGhpcy5yZXNpemUpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLm9uKCdzaHVmZmxlJywgdGhpcy5zaHVmZmxlKVxuICAgIHRoaXMucmVzdGFydCgpXG4gIH1cblxuICAvLyBFdmVudCBoYW5kbGluZyBjYWxsYmFja3MgbmVlZCBmYXQgYXJyb3cgdG8ga2VlcCBcInRoaXNcIiBjb250ZXh0XG4gIHByaXZhdGUgcmVzaXplID0gKGFtb3VudDpudW1iZXIpOnZvaWQgPT4ge1xuICAgIHRoaXMuc3RvcCgpXG4gICAgbGV0IGJvYXJkU2l6ZTpudW1iZXIgPSB0aGlzLnNpbXVsYXRpb24uc2l6ZSArIGFtb3VudFxuICAgIGlmKGJvYXJkU2l6ZSA8IDEpXG4gICAgICBib2FyZFNpemUgPSAxXG4gICAgZWxzZSBpZihib2FyZFNpemUgPiBjb25maWcuc2ltdWxhdGlvbi5tYXhTaXplKVxuICAgICAgYm9hcmRTaXplID0gY29uZmlnLnNpbXVsYXRpb24ubWF4U2l6ZVxuICAgIGlmKHRoaXMuc2ltdWxhdGlvbi5zaXplICE9PSBib2FyZFNpemUpXG4gICAgICB0aGlzLnNpbXVsYXRpb24ucmVzaXplKGJvYXJkU2l6ZSlcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2V0Qm9hcmRMYXlvdXQodGhpcy5zaW11bGF0aW9uLmJvYXJkTGF5b3V0KVxuICAgIHRoaXMucmVzdGFydCgpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLnNob3dNZXNzYWdlKCdQcmVzcyBQbGF5IHRvIEJlZ2luJylcbiAgfVxuXG4gIC8vIEV2ZW50IGhhbmRsaW5nIGNhbGxiYWNrcyBuZWVkIGZhdCBhcnJvdyB0byBrZWVwIFwidGhpc1wiIGNvbnRleHRcbiAgcHJpdmF0ZSBzaHVmZmxlID0gKCk6dm9pZCA9PiB7XG4gICAgdGhpcy5zdG9wKClcbiAgICB0aGlzLnNpbXVsYXRpb24uc2h1ZmZsZSgpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLnNldEJvYXJkTGF5b3V0KHRoaXMuc2ltdWxhdGlvbi5ib2FyZExheW91dClcbiAgICB0aGlzLnJlc3RhcnQoKVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5zaG93TWVzc2FnZSgnUHJlc3MgUGxheSB0byBCZWdpbicpXG4gIH1cblxuICAvLyBFdmVudCBoYW5kbGluZyBjYWxsYmFja3MgbmVlZCBmYXQgYXJyb3cgdG8ga2VlcCBcInRoaXNcIiBjb250ZXh0XG4gIHByaXZhdGUgcGxheSA9ICgpOnZvaWQgPT4ge1xuICAgIHRoaXMuc3RvcCgpXG4gICAgdGhpcy5yZXN0YXJ0KClcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2hvd01lc3NhZ2UoJ1J1bm5pbmcnKVxuICAgIHRoaXMubmV4dCgpXG4gIH1cblxuICAvLyBFdmVudCBoYW5kbGluZyBjYWxsYmFja3MgbmVlZCBmYXQgYXJyb3cgdG8ga2VlcCBcInRoaXNcIiBjb250ZXh0XG4gIHByaXZhdGUgZm9yY2VTdG9wID0gKCk6dm9pZCA9PiB7XG4gICAgaWYodGhpcy5zaW11bGF0aW9uLnN0YXRlID09PSBTaW11bGF0aW9uU3RhdGUuUnVubmluZykge1xuICAgICAgdGhpcy5zdG9wKClcbiAgICAgIHRoaXMudmlzdWFsaXphdGlvbi5zaG93TWVzc2FnZSgnU3RvcHBlZCcpXG4gICAgfVxuICB9XG5cbiAgLy8gRXZlbnQgaGFuZGxpbmcgY2FsbGJhY2tzIG5lZWQgZmF0IGFycm93IHRvIGtlZXAgXCJ0aGlzXCIgY29udGV4dFxuICBwcml2YXRlIHBvaW50ZXJNb3ZlZCA9IChudW1iZXI6bnVtYmVyLCBwb3NpdGlvbjpCb2FyZFBvc2l0aW9uKSA9PiB7XG4gICAgdGhpcy52aXN1YWxpemF0aW9uLm1vdmVDaGVja2VyKG51bWJlciwgcG9zaXRpb24pXG4gIH1cblxuICAvLyBGYXQgYXJyb3cgdG8gcHJlc2VydmUgXCJ0aGlzXCIgaW4gc2V0VGltZW91dFxuICBwcml2YXRlIG5leHQgPSAoKTp2b2lkID0+IHtcbiAgICB0aGlzLnNpbXVsYXRpb24ubmV4dCgpXG4gICAgaWYodGhpcy5zaW11bGF0aW9uLnN0YXRlID09PSBTaW11bGF0aW9uU3RhdGUuUnVubmluZylcbiAgICAgIC8vIERlbGF5IGZvciB0aGUgYW5pbWF0aW9uIHRvIGZpbmlzaCwgYW5kIHRyYWNrIHRoZSB0aW1lb3V0IHNvIHdlXG4gICAgICAvLyBjYW4gc3RvcCBpdCBvbiBkZW1hbmRcbiAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQodGhpcy5uZXh0LCBjb25maWcudmlzdWFsaXphdGlvbi5tb3ZlVGltZSlcbiAgfVxuXG4gIC8vIEV2ZW50IGhhbmRsaW5nIGNhbGxiYWNrcyBuZWVkIGZhdCBhcnJvdyB0byBrZWVwIFwidGhpc1wiIGNvbnRleHRcbiAgcHJpdmF0ZSBzaW11bGF0aW9uRW5kZWQgPSAoKTp2b2lkID0+IHtcbiAgICBsZXQgbWVzc2FnZTpzdHJpbmdcbiAgICBzd2l0Y2godGhpcy5zaW11bGF0aW9uLnN0YXRlKSB7XG4gICAgICBjYXNlIFNpbXVsYXRpb25TdGF0ZS5Ob25jaXJjdWxhcjpcbiAgICAgICAgdGhpcy52aXN1YWxpemF0aW9uLnNob3dNZXNzYWdlKCdUaGUgcGF0aCBpcyBub25jaXJjdWxhci4nKVxuICAgICAgICB0aGlzLnZpc3VhbGl6YXRpb24uZmFsbCgpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFNpbXVsYXRpb25TdGF0ZS5DaXJjdWxhcjpcbiAgICAgICAgdGhpcy52aXN1YWxpemF0aW9uLnNob3dNZXNzYWdlKCdUaGUgcGF0aCBpcyBjaXJjdWxhci4nKVxuICAgICAgICB0aGlzLnZpc3VhbGl6YXRpb24uY29sbGlkZSgpXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQodGhpcy5zdG9wLCBjb25maWcudmlzdWFsaXphdGlvbi5tb3ZlVGltZSlcbiAgfVxuXG4gIC8vIEZhdCBhcnJvdyB0byBwcmVzZXJ2ZSBcInRoaXNcIiBpbiBzZXRUaW1lb3V0IGNhbGxcbiAgcHJpdmF0ZSBzdG9wID0gKCkgPT4ge1xuICAgIGlmKHRoaXMudGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICAgIHRoaXMudGltZW91dCA9IG51bGxcbiAgICB9XG4gICAgdGhpcy52aXN1YWxpemF0aW9uLnN0b3AoKVxuICB9XG5cbiAgcHJpdmF0ZSByZXN0YXJ0KCk6dm9pZCB7XG4gICAgLy8gTW92ZSB0aGUgY2hlY2tlcnMgdG8gdGhlaXIgc3RhcnRpbmcgcG9zaXRpb25zXG4gICAgdGhpcy5zaW11bGF0aW9uLnJlc3RhcnQoKVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5yZXN0YXJ0KClcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24ucGxhY2VDaGVja2VyKDEsIHRoaXMuc2ltdWxhdGlvbi5zdGFydGluZ1Bvc2l0aW9uKVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5wbGFjZUNoZWNrZXIoMiwgdGhpcy5zaW11bGF0aW9uLnN0YXJ0aW5nUG9zaXRpb24pXG4gIH1cbn1cblxubmV3IEFwcGxpY2F0aW9uKClcbiIsImltcG9ydCAqIGFzIEV2ZW50c0VtaXR0ZXIgZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IHtCb2FyZExheW91dCwgQm9hcmRQb3NpdGlvbix9IGZyb20gJy4vY29tcG9uZW50cy9jaGVja2Vycy9ib2FyZC1sYXlvdXQnXG5pbXBvcnQge0RpcmVjdGlvbn0gZnJvbSAnLi9jb21wb25lbnRzL3VpL2Fycm93J1xuXG5leHBvcnQgY29uc3QgZW51bSBTaW11bGF0aW9uU3RhdGUge1xuICBSdW5uaW5nLFxuICBDaXJjdWxhcixcbiAgTm9uY2lyY3VsYXJcbn1cblxuZXhwb3J0IGNsYXNzIFNpbXVsYXRpb24gZXh0ZW5kcyBFdmVudHNFbWl0dGVyIHtcblxuICBzaXplOm51bWJlclxuICBib2FyZExheW91dDpCb2FyZExheW91dCA9IFtdXG4gIHN0YXRlOlNpbXVsYXRpb25TdGF0ZVxuICBzdGFydGluZ1Bvc2l0aW9uOkJvYXJkUG9zaXRpb25cbiAgcG9pbnRlck9uZVBvc2l0aW9uOkJvYXJkUG9zaXRpb25cbiAgcG9pbnRlclR3b1Bvc2l0aW9uOkJvYXJkUG9zaXRpb25cbiAgZXZlbk1vdmU6Ym9vbGVhblxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihzaXplOm51bWJlcikge1xuICAgIHN1cGVyKClcbiAgICAvLyBTZXQgaW5pdGlhbCBib2FyZCBsYXlvdXQgdG8gdGhlIHByb3BlciBzaXplOyByZXNpemUgdGFrZXMgY2FyZSBvZlxuICAgIC8vIHNodWZmbGluZ1xuICAgIHRoaXMucmVzaXplKHNpemUpXG4gIH1cblxuICAvLyBXaGVuIHRoZSBzaW11bGF0aW9uIGlzIHJlc2l6ZWQsIHJlc2l6ZSB0aGUgYm9hcmQgbGF5b3V0IGRhdGEgc3RydWN0dXJlXG4gIC8vIGFuZCBzaHVmZmxlIHRoZSBib2FyZCAoYW4gaW1wcm92ZW1lbnQgY291bGQgYmUgdG8gb25seSByYW5kb21pemUgYW55IFwibmV3XCJcbiAgLy8gcG9zaXRpb25zKVxuICBwdWJsaWMgcmVzaXplKHNpemU6bnVtYmVyKTp2b2lkIHtcbiAgICB0aGlzLnNpemUgPSBzaXplXG4gICAgLy8gUmVtb3ZlIHJvd3MgZG93biB0byB0aGUgcHJvcGVyIHNpemVcbiAgICB3aGlsZSh0aGlzLmJvYXJkTGF5b3V0Lmxlbmd0aCA+IHNpemUpXG4gICAgICB0aGlzLmJvYXJkTGF5b3V0LnBvcCgpXG4gICAgZm9yKGxldCByb3c6bnVtYmVyID0gMCA7IHJvdyA8IHRoaXMuYm9hcmRMYXlvdXQubGVuZ3RoIDsgcm93KyspIHtcbiAgICAgIC8vIFJlbW92ZSBjb2x1bW5zIGZyb20gZWFjaCByZW1haW5pbmcgcm93IGRvd24gdG8gdGhlIHByb3BlciBzaXplXG4gICAgICB3aGlsZSh0aGlzLmJvYXJkTGF5b3V0W3Jvd10ubGVuZ3RoID4gc2l6ZSlcbiAgICAgICAgdGhpcy5ib2FyZExheW91dFtyb3ddLnBvcCgpXG4gICAgICAvLyBBZGQgY29sdW1ucyB0byB0aGUgZXhpc3Rpbmcgcm93cyB1cCB0byB0aGUgcHJvcGVyIHNpemVcbiAgICAgIHdoaWxlKHNpemUgPiB0aGlzLmJvYXJkTGF5b3V0W3Jvd10ubGVuZ3RoKVxuICAgICAgICB0aGlzLmJvYXJkTGF5b3V0W3Jvd10ucHVzaCgwKVxuICAgIH1cbiAgICAvLyBBZGQgcm93cyB1cCB0byB0aGUgcHJvcGVyIHNpemVcbiAgICB3aGlsZShzaXplID4gdGhpcy5ib2FyZExheW91dC5sZW5ndGgpXG4gICAgICB0aGlzLmFkZFJvdyh0aGlzLmJvYXJkTGF5b3V0Lmxlbmd0aClcbiAgICB0aGlzLnNodWZmbGUoKVxuICB9XG5cbiAgLy8gU2V0IHJhbmRvbSB2YWx1ZXMgZm9yIGVhY2ggbG9jYXRpb24gb24gdGhlIGJvYXJkXG4gIHB1YmxpYyBzaHVmZmxlKCk6dm9pZCB7XG4gICAgZm9yKGxldCByb3c6bnVtYmVyID0gMCA7IHJvdyA8IHRoaXMuc2l6ZSA7IHJvdysrKVxuICAgICAgZm9yKGxldCBjb2w6bnVtYmVyID0gMCA7IGNvbCA8IHRoaXMuc2l6ZSA7IGNvbCsrKVxuICAgICAgICB0aGlzLmJvYXJkTGF5b3V0W3Jvd11bY29sXSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQpXG4gICAgdGhpcy5zdGFydGluZ1Bvc2l0aW9uID0gdGhpcy5yYW5kb21Qb3NpdGlvbigpXG4gICAgdGhpcy5yZXN0YXJ0KClcbiAgfVxuXG4gIC8vIFNldCB0aGUgc3RhdGUgdG8gUnVubmluZywgYW5kIG1vdmUgdGhlIHBvaW50ZXJzIGJhY2sgdG8gc3RhcnRpbmcgcG9zaXRpb25cbiAgcHVibGljIHJlc3RhcnQoKTp2b2lkIHtcbiAgICB0aGlzLnN0YXRlID0gU2ltdWxhdGlvblN0YXRlLlJ1bm5pbmdcbiAgICB0aGlzLnBvaW50ZXJPbmVQb3NpdGlvbiA9IHRoaXMuc3RhcnRpbmdQb3NpdGlvblxuICAgIHRoaXMucG9pbnRlclR3b1Bvc2l0aW9uID0gdGhpcy5zdGFydGluZ1Bvc2l0aW9uXG4gICAgdGhpcy5ldmVuTW92ZSA9IGZhbHNlXG4gIH1cblxuICBwdWJsaWMgcnVuKCk6dm9pZCB7XG4gICAgdGhpcy5yZXN0YXJ0KClcbiAgICB3aGlsZSh0aGlzLnN0YXRlID09PSBTaW11bGF0aW9uU3RhdGUuUnVubmluZylcbiAgICAgIHRoaXMubmV4dCgpXG4gIH1cblxuICAvLyBUaGUgaXRlcmF0b3IsIHVzZWQgYnkgdGhlIGNvbnRyb2xsZXIgdG8gc3RlcCB0aHJvdWdoIHRoZSBzaW11bGF0aW9uXG4gIC8vIEFuIGltcHJvdmVtZW50IG1pZ2h0IGJlIHRvIGFkZCBhIFwicnVuXCIgbWV0aG9kIHRvIFNpbXVsYXRpb24sIHdoaWNoXG4gIC8vIHdvdWxkIHJ1biB0aGUgZW50aXJlIHNpbXVsYXRpb24gc3luY2hyb25vdXNseVxuICBwdWJsaWMgbmV4dCgpOnZvaWQge1xuICAgIHRoaXMucG9pbnRlck9uZVBvc2l0aW9uID0gdGhpcy5uZXh0UG9zaXRpb24odGhpcy5wb2ludGVyT25lUG9zaXRpb24pXG4gICAgdGhpcy5kZXRlcm1pbmVTdGF0ZSgpXG4gICAgdGhpcy5lbWl0KCdtb3ZlJywgMSwgdGhpcy5wb2ludGVyT25lUG9zaXRpb24pXG4gICAgLy8gSGF2ZSB0byBjaGVjayBiZWZvcmUgbW92aW5nIHRoZSBzZWNvbmQgcG9pbnRlclxuICAgIGlmKHRoaXMuc3RhdGUgPT09IFNpbXVsYXRpb25TdGF0ZS5SdW5uaW5nICYmIHRoaXMuZXZlbk1vdmUpIHtcbiAgICAgIHRoaXMucG9pbnRlclR3b1Bvc2l0aW9uID0gdGhpcy5uZXh0UG9zaXRpb24odGhpcy5wb2ludGVyVHdvUG9zaXRpb24pXG4gICAgICB0aGlzLmRldGVybWluZVN0YXRlKClcbiAgICAgIHRoaXMuZW1pdCgnbW92ZScsIDIsIHRoaXMucG9pbnRlclR3b1Bvc2l0aW9uKVxuICAgIH1cbiAgICB0aGlzLmV2ZW5Nb3ZlID0gIXRoaXMuZXZlbk1vdmVcbiAgICBpZih0aGlzLnN0YXRlICE9PSBTaW11bGF0aW9uU3RhdGUuUnVubmluZylcbiAgICAgIHRoaXMuZW1pdCgnZW5kJywgdGhpcy5zdGF0ZSlcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgc2FtZVBvc2l0aW9uKHBvc2l0aW9uMTpCb2FyZFBvc2l0aW9uLCBwb3NpdGlvbjI6Qm9hcmRQb3NpdGlvbikge1xuICAgIHJldHVybiBwb3NpdGlvbjEucm93ID09PSBwb3NpdGlvbjIucm93ICYmIHBvc2l0aW9uMS5jb2wgPT09IHBvc2l0aW9uMi5jb2xcbiAgfVxuXG4gIHByaXZhdGUgYWRkUm93KHJvdzpudW1iZXIpOnZvaWQge1xuICAgIHRoaXMuYm9hcmRMYXlvdXQucHVzaChbXSlcbiAgICBmb3IobGV0IGNvbDpudW1iZXIgPSAwIDsgY29sIDwgdGhpcy5zaXplIDsgY29sKyspXG4gICAgICB0aGlzLmJvYXJkTGF5b3V0W3Jvd10ucHVzaCgwKVxuICB9XG5cbiAgcHJpdmF0ZSBuZXh0UG9zaXRpb24oY3VycmVudFBvc2l0aW9uOkJvYXJkUG9zaXRpb24pOkJvYXJkUG9zaXRpb24ge1xuICAgIGNvbnN0IGRpcmVjdGlvbjpEaXJlY3Rpb24gPVxuICAgICAgdGhpcy5ib2FyZExheW91dFtjdXJyZW50UG9zaXRpb24ucm93XVtjdXJyZW50UG9zaXRpb24uY29sXVxuICAgIGxldCBuZXh0UG9zaXRpb246Qm9hcmRQb3NpdGlvblxuICAgIHN3aXRjaChkaXJlY3Rpb24pIHtcbiAgICAgIGNhc2UgRGlyZWN0aW9uLlVwOlxuICAgICAgICBuZXh0UG9zaXRpb24gPVxuICAgICAgICAgIG5ldyBCb2FyZFBvc2l0aW9uKGN1cnJlbnRQb3NpdGlvbi5yb3cgLSAxLCBjdXJyZW50UG9zaXRpb24uY29sKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XG4gICAgICAgIG5leHRQb3NpdGlvbiA9XG4gICAgICAgICAgbmV3IEJvYXJkUG9zaXRpb24oY3VycmVudFBvc2l0aW9uLnJvdyArIDEsIGN1cnJlbnRQb3NpdGlvbi5jb2wpXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaXJlY3Rpb24uTGVmdDpcbiAgICAgICAgbmV4dFBvc2l0aW9uID1cbiAgICAgICAgICBuZXcgQm9hcmRQb3NpdGlvbihjdXJyZW50UG9zaXRpb24ucm93LCBjdXJyZW50UG9zaXRpb24uY29sIC0gMSlcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcbiAgICAgICAgbmV4dFBvc2l0aW9uID1cbiAgICAgICAgICBuZXcgQm9hcmRQb3NpdGlvbihjdXJyZW50UG9zaXRpb24ucm93LCBjdXJyZW50UG9zaXRpb24uY29sICsgMSlcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBuZXh0UG9zaXRpb25cbiAgfVxuXG4gIHByaXZhdGUgZGV0ZXJtaW5lU3RhdGUoKTp2b2lkIHtcbiAgICB0aGlzLnN0YXRlID1cbiAgICAgICF0aGlzLnZhbGlkUG9zaXRpb24odGhpcy5wb2ludGVyT25lUG9zaXRpb24pXG4gICAgICAgID8gU2ltdWxhdGlvblN0YXRlLk5vbmNpcmN1bGFyXG4gICAgICA6IFNpbXVsYXRpb24uc2FtZVBvc2l0aW9uKHRoaXMucG9pbnRlck9uZVBvc2l0aW9uLCB0aGlzLnBvaW50ZXJUd29Qb3NpdGlvbilcbiAgICAgICAgPyBTaW11bGF0aW9uU3RhdGUuQ2lyY3VsYXJcbiAgICAgIDogU2ltdWxhdGlvblN0YXRlLlJ1bm5pbmdcbiAgfVxuXG4gIHByaXZhdGUgdmFsaWRQb3NpdGlvbihwb3NpdGlvbjpCb2FyZFBvc2l0aW9uKTpib29sZWFuIHtcbiAgICByZXR1cm4gIShcbiAgICAgIHBvc2l0aW9uLnJvdyA8IDAgfHxcbiAgICAgIHBvc2l0aW9uLnJvdyA+IHRoaXMuc2l6ZSAtIDEgfHxcbiAgICAgIHBvc2l0aW9uLmNvbCA8IDAgfHxcbiAgICAgIHBvc2l0aW9uLmNvbCA+IHRoaXMuc2l6ZSAtIDFcbiAgICApXG4gIH1cblxuICBwcml2YXRlIHJhbmRvbVBvc2l0aW9uKHNpemU6bnVtYmVyID0gMCk6Qm9hcmRQb3NpdGlvbiB7XG4gICAgaWYoc2l6ZSA8IDEpXG4gICAgICBzaXplID0gdGhpcy5zaXplXG4gICAgcmV0dXJuIG5ldyBCb2FyZFBvc2l0aW9uKFxuICAgICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBzaXplKSxcbiAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogc2l6ZSlcbiAgICApXG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBTb3VuZE1hbmFnZXIge1xuXG4gIHByaXZhdGUgc291bmRzOntba2V5OnN0cmluZ106SFRNTEF1ZGlvRWxlbWVudH0gPSB7fVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcihzb3VuZHM6e1trZXk6c3RyaW5nXTpzdHJpbmd9KSB7XG4gICAgZm9yKGxldCBzb3VuZCBpbiBzb3VuZHMpIHtcbiAgICAgIGNvbnN0IGF1ZGlvID0gbmV3IEF1ZGlvKClcbiAgICAgIGF1ZGlvLnNyYyA9IHNvdW5kc1tzb3VuZF1cbiAgICAgIGF1ZGlvLnByZWxvYWQgPSAndHJ1ZSdcbiAgICAgIHRoaXMuc291bmRzW3NvdW5kXSA9IGF1ZGlvXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHBsYXkoc291bmROYW1lKSB7XG4gICAgdGhpcy5zb3VuZHNbc291bmROYW1lXS5wYXVzZSgpXG4gICAgdGhpcy5zb3VuZHNbc291bmROYW1lXS5jdXJyZW50VGltZSA9IDBcbiAgICB0aGlzLnNvdW5kc1tzb3VuZE5hbWVdLnBsYXkoKVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcbmltcG9ydCAqIGFzIEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnXG5pbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnXG5pbXBvcnQge1R3ZWVuTGl0ZX0gZnJvbSAnZ3NhcC9Ud2VlbkxpdGUnXG5pbXBvcnQge1NvdW5kTWFuYWdlcn0gZnJvbSAnLi9zb3VuZC1tYW5hZ2VyJ1xuaW1wb3J0IHtCb2FyZFBvc2l0aW9uLCBCb2FyZExheW91dH0gZnJvbSAnLi9jb21wb25lbnRzL2NoZWNrZXJzL2JvYXJkLWxheW91dCdcbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICcuL2NvbXBvbmVudHMvdWkvYXJyb3cnXG5pbXBvcnQge0J1dHRvbiwgQnV0dG9uU3R5bGV9IGZyb20gJy4vY29tcG9uZW50cy91aS9idXR0b24nXG5pbXBvcnQge0NoZWNrZXJ9IGZyb20gJy4vY29tcG9uZW50cy9jaGVja2Vycy9jaGVja2VyJ1xuaW1wb3J0IHtEaXJlY3RlZENoZWNrZXJCb2FyZH0gZnJvbVxuICAnLi9jb21wb25lbnRzL2NoZWNrZXJzL2RpcmVjdGVkL2RpcmVjdGVkLWNoZWNrZXItYm9hcmQnXG5pbXBvcnQge0hvcml6b250YWxDZW50ZXJ9IGZyb20gJy4vY29tcG9uZW50cy9sYXlvdXRzL2hvcml6b250YWwtY2VudGVyJ1xuaW1wb3J0IHtGdWxsU2NyZWVuSGVhZGVyRm9vdGVyfSBmcm9tXG4gICcuL2NvbXBvbmVudHMvbGF5b3V0cy9mdWxsLXNjcmVlbi1oZWFkZXItZm9vdGVyJ1xuXG5jb25zdCBjb25maWcgPVxuICBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYygnLi9jb25maWcuanNvbicsICd1dGYtOCcpKS52aXN1YWxpemF0aW9uXG5cbmV4cG9ydCBjbGFzcyBWaXN1YWxpemF0aW9uIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICBwcml2YXRlIHNjcmVlbkxheW91dDpGdWxsU2NyZWVuSGVhZGVyRm9vdGVyXG4gIHByaXZhdGUgYm9hcmQ6RGlyZWN0ZWRDaGVja2VyQm9hcmRcbiAgcHJpdmF0ZSBjaGVja2VyMTpDaGVja2VyXG4gIHByaXZhdGUgY2hlY2tlcjI6Q2hlY2tlclxuICBwcml2YXRlIHJlbmRlcmVyOlBJWEkuV2ViR0xSZW5kZXJlclxuICBwcml2YXRlIG1lc3NhZ2U6UElYSS5UZXh0XG4gIHByaXZhdGUgc291bmRNYW5hZ2VyOlNvdW5kTWFuYWdlciA9IG5ldyBTb3VuZE1hbmFnZXIoY29uZmlnLnNvdW5kcylcblxuICBwdWJsaWMgY29uc3RydWN0b3IoYm9hcmRMYXlvdXQ6Qm9hcmRMYXlvdXQpIHtcbiAgICBzdXBlcigpXG4gICAgLy8gVGhpcyBjcmVhdGVzIHRoZSBmdWxsLXNjcmVlbiBsYXlvdXQgYW5kIGFkZHMgdGhlIG1lc3NhZ2UgdG8gdGhlIGhlYWRlclxuICAgIC8vIGFuZCBidXR0b25zIHRvIHRoZSBmb290ZXJcbiAgICB0aGlzLnNldHVwVUkoKVxuICAgIHRoaXMuc2V0dXBCb2FyZChib2FyZExheW91dClcbiAgICB0aGlzLnNldHVwQ2hlY2tlcnMoKVxuICAgIC8vIENyZWF0ZSBhIFdlYkdMIHJlbmRlcmVyIGF0IHdpbmRvdyBkaW1lbnNpb25zOyBiZWdpbiByZW5kZXIgbG9vcFxuICAgIHRoaXMuc3RhcnRSZW5kZXJpbmcoKVxuICB9XG5cbiAgcHVibGljIHNldEJvYXJkTGF5b3V0KGJvYXJkTGF5b3V0OkJvYXJkTGF5b3V0KTp2b2lkIHtcbiAgICAvLyBTdG9wIGFueSBvbmdvaW5nIGFuaW1hdGlvbnNcbiAgICB0aGlzLnN0b3AoKVxuICAgIC8vIFJlc2l6ZSB0aGUgYm9hcmQgYXMgbmVlZGVkIC0gdGhlIGJvYXJkIHRha2VzIGNhcmUgb2YgY3JlYXRpbmcgc3F1YXJlc1xuICAgIGlmKHRoaXMuYm9hcmQuc2l6ZSAhPT0gYm9hcmRMYXlvdXQubGVuZ3RoKVxuICAgICAgdGhpcy5yZXNpemUoYm9hcmRMYXlvdXQubGVuZ3RoKVxuICAgIC8vIFNldCB0aGUgYXJyb3cgZGlyZWN0aW9ucyBvbiB0aGUgYm9hcmRcbiAgICB0aGlzLmJvYXJkLnNldEJvYXJkTGF5b3V0KGJvYXJkTGF5b3V0KVxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgY2hlY2tlcnMgYXJlIG9uIHRvcCBvZiBhbnkgbmV3IHNxdWFyZXNcbiAgICB0aGlzLmJvYXJkLnRvVG9wKHRoaXMuY2hlY2tlcjEpXG4gICAgdGhpcy5ib2FyZC50b1RvcCh0aGlzLmNoZWNrZXIyKVxuICB9XG5cbiAgLy8gUmVzaXplIHRoZSBmaXJzdCBjaGVja2VyIHRvIHNjYWxlIG9uZSwgc2luY2UgaXQgaXMgc2hydW5rIHRvIHplcm8gc2NhbGVcbiAgLy8gd2hlbiBhIHNpbXVsYXRpb24gaXMgc3RhcnRlZFxuICBwdWJsaWMgcmVzdGFydCgpOnZvaWQge1xuICAgIHRoaXMuY2hlY2tlcjEuc2NhbGUuc2V0KDEsIDEpXG4gIH1cblxuICAvLyBTdG9wIGFueSBvbmdvaW5nIGFuaW1hdGlvbnNcbiAgcHVibGljIHN0b3AoKSB7XG4gICAgVHdlZW5MaXRlLmtpbGxUd2VlbnNPZih0aGlzLmNoZWNrZXIxLnBvc2l0aW9uKVxuICAgIFR3ZWVuTGl0ZS5raWxsVHdlZW5zT2YodGhpcy5jaGVja2VyMS5zY2FsZSlcbiAgICBUd2VlbkxpdGUua2lsbFR3ZWVuc09mKHRoaXMuY2hlY2tlcjIucG9zaXRpb24pXG4gIH1cblxuICAvLyBTaG93IHRoZSBnaXZlbiB0ZXh0IGF0IHNjcmVlbiB0b3BcbiAgcHVibGljIHNob3dNZXNzYWdlKG1lc3NhZ2U6c3RyaW5nKTp2b2lkIHtcbiAgICB0aGlzLm1lc3NhZ2UudGV4dCA9IG1lc3NhZ2VcbiAgfVxuXG4gIC8vIFBsYWNlIHRoZSBnaXZlbiBjaGVja2VyIGF0IHRoZSBnaXZlbiBwb3NpdGlvbiwgd2l0aG91dCBhbmltYXRpbmdcbiAgcHVibGljIHBsYWNlQ2hlY2tlcihudW1iZXI6bnVtYmVyLCBwb3NpdGlvbjpCb2FyZFBvc2l0aW9uKSB7XG4gICAgY29uc3QgY2hlY2tlcjpQSVhJLkRpc3BsYXlPYmplY3QgPVxuICAgICAgbnVtYmVyID09PSAxID8gdGhpcy5jaGVja2VyMSA6IHRoaXMuY2hlY2tlcjJcbiAgICBjaGVja2VyLnBvc2l0aW9uID0gdGhpcy5ib2FyZC5ib2FyZFBvc2l0aW9uVG9QaXhlbHMocG9zaXRpb24pXG4gIH1cblxuICAvLyBBbmltYXRlIG1vdmluZyB0aGUgY2hlY2tlciB0byBhIG5ldyBwb3NpdGlvblxuICBwdWJsaWMgbW92ZUNoZWNrZXIobnVtYmVyOm51bWJlciwgcG9zaXRpb246Qm9hcmRQb3NpdGlvbik6dm9pZCB7XG4gICAgY29uc3QgY2hlY2tlcjpQSVhJLkRpc3BsYXlPYmplY3QgPVxuICAgICAgbnVtYmVyID09PSAxID8gdGhpcy5jaGVja2VyMSA6IHRoaXMuY2hlY2tlcjJcbiAgICBjb25zdCBwaXhlbFBvc2l0aW9uOlBJWEkuUG9pbnQgPSB0aGlzLmJvYXJkLmJvYXJkUG9zaXRpb25Ub1BpeGVscyhwb3NpdGlvbilcbiAgICAvLyBVc2UgdGhlIEdyZWVuc29jayBUd2VlbkxpdGUgbGlicmFyeSB0byBhbmltYXRlIHRoZSBtb3ZlbWVudFxuICAgIFR3ZWVuTGl0ZS50byhcbiAgICAgIGNoZWNrZXIucG9zaXRpb24sXG4gICAgICBjb25maWcuY2hlY2tlci5tb3ZlVGltZSxcbiAgICAgIHt4OiBwaXhlbFBvc2l0aW9uLngsIHk6IHBpeGVsUG9zaXRpb24ueX1cbiAgICApXG4gICAgdGhpcy5zb3VuZE1hbmFnZXIucGxheSgnbW92ZScpXG4gIH1cblxuICBwdWJsaWMgY29sbGlkZSgpIHtcbiAgICAvLyBTaHJpbmsgdGhlIGZpcnN0IGNoZWNrZXIgdG8gc2NhbGUgemVyb1xuICAgIFR3ZWVuTGl0ZS50byh0aGlzLmNoZWNrZXIxLnNjYWxlLCAuNSwge3g6IDAsIHk6IDB9KVxuICAgIHRoaXMuc291bmRNYW5hZ2VyLnBsYXkoJ2NvbGxpZGUnKVxuICB9XG5cbiAgcHVibGljIGZhbGwoKSB7XG4gICAgLy8gU2hyaW5rIHRoZSBmaXJzdCBjaGVja2VyIHRvIHNjYWxlIHplcm9cbiAgICBUd2VlbkxpdGUudG8odGhpcy5jaGVja2VyMS5zY2FsZSwgLjUsIHt4OiAwLCB5OiAwfSlcbiAgICB0aGlzLnNvdW5kTWFuYWdlci5wbGF5KCdmYWxsJylcbiAgfVxuXG4gIHByaXZhdGUgc3RhcnRSZW5kZXJpbmcoKTp2b2lkIHtcbiAgICAvLyBUaGUgc2NyZWVuTGF5b3V0IGNvbnRhaW5lciBpcyBwYXNzZWQgaW50byByZW5kZXIoKSBieSByZW5kZXJMb29wKClcbiAgICAvLyBJdCBjb250YWlucyB0aGUgbWVzc2FnZSwgdGhlIGJvYXJkLCBhbmQgdGhlIGJ1dHRvbnNcbiAgICAvLyBTZXQgdXAgdGhlIHJlbmRlcmVyLCBhZGQgdGhlIGNhbnZhcyB0byB0aGUgcGFnZSwgYW5kIHN0YXJ0IHRoZSByZW5kZXJcbiAgICAvLyBsb29wIChyZW5kZXJzIGV2ZXJ5IGZyYW1lIHdpdGggcmVxdWVzdEFuaW1hdGlvbkZyYW1lKVxuICAgIHRoaXMucmVuZGVyZXIgPVxuICAgICAgbmV3IFBJWEkuV2ViR0xSZW5kZXJlcihcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLFxuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LFxuICAgICAgICAvLyBTbW9vdGggZWRnZXMgb2YgY3VydmVzIGNyZWF0ZWQgd2l0aCBQSVhJLkdyYXBoaWNzXG4gICAgICAgIHthbnRpYWxpYXM6IHRydWV9KVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXJlci52aWV3KVxuICAgIHRoaXMucmVuZGVyTG9vcCgpXG4gIH1cblxuICAvLyBGYXQgYXJyb3cgdG8gcHJlc2VydmUgXCJ0aGlzXCJcbiAgcHJpdmF0ZSByZW5kZXJMb29wID0gKCk6dm9pZCA9PiB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucmVuZGVyTG9vcClcbiAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjcmVlbkxheW91dClcbiAgfVxuXG4gIC8vIENyZWF0ZXMgdGhlIG1lc3NhZ2UgYW5kIHRoZSBidXR0b25zLCBhbmQgc2V0IHVwIHRoZSBldmVudCBoYW5kbGluZ1xuICBwcml2YXRlIHNldHVwVUkoKTp2b2lkIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSB0aGlzLmNyZWF0ZU1lc3NhZ2UoKVxuICAgIGNvbnN0IGhlYWRlcjpQSVhJLkNvbnRhaW5lciA9IG5ldyBIb3Jpem9udGFsQ2VudGVyKGNvbmZpZy5tYXJnaW4pXG4gICAgaGVhZGVyLmFkZENoaWxkKHRoaXMubWVzc2FnZSlcbiAgICBjb25zdCBmb290ZXI6UElYSS5Db250YWluZXIgPSB0aGlzLmNyZWF0ZUJ1dHRvbnMoKVxuICAgIHRoaXMuc2NyZWVuTGF5b3V0ID0gbmV3IEZ1bGxTY3JlZW5IZWFkZXJGb290ZXIoXG4gICAgICBuZXcgSG9yaXpvbnRhbENlbnRlcigpLFxuICAgICAgaGVhZGVyLFxuICAgICAgZm9vdGVyLFxuICAgICAgY29uZmlnLm1hcmdpbilcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlTWVzc2FnZSgpOlBJWEkuVGV4dCB7XG4gICAgLy8gTWVzc2FnZSB0aGF0IGFwcGVhcnMgb24gdGhlIHRvcCBvZiB0aGUgc2NyZWVuXG4gICAgLy8gVGhlIG1lc3NhZ2UgdGV4dCBpcyBzZXQgYnkgdGhlIGNvbnRyb2xsZXIgdXNpbmcgc2hvd01lc3NhZ2UoKVxuICAgIGNvbnN0IG1lc3NhZ2U6UElYSS5UZXh0ID0gbmV3IFBJWEkuVGV4dChcbiAgICAgICdQcmVzcyBQbGF5IHRvIEJlZ2luJyxcbiAgICAgIG5ldyBQSVhJLlRleHRTdHlsZSh7XG4gICAgICAgIGFsaWduOiBjb25maWcubWVzc2FnZS5hbGlnbixcbiAgICAgICAgbGluZUpvaW46IGNvbmZpZy5tZXNzYWdlLmxpbmVKb2luLFxuICAgICAgICBmaWxsOiBjb25maWcubWVzc2FnZS5maWxsLm1hcChjb2xvciA9PiBQSVhJLnV0aWxzLnJnYjJoZXgoY29sb3IpKSxcbiAgICAgICAgc3Ryb2tlOiBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLm1lc3NhZ2Uuc3Ryb2tlKSxcbiAgICAgICAgc3Ryb2tlVGhpY2tuZXNzOiBjb25maWcubWVzc2FnZS5zdHJva2VUaGlja25lc3NcbiAgICAgIH0pXG4gICAgKVxuICAgIG1lc3NhZ2UuYW5jaG9yLnNldCguNSlcbiAgICBtZXNzYWdlLnBvc2l0aW9uID0gbmV3IFBJWEkuUG9pbnQoMCwgY29uZmlnLm1lc3NhZ2UuZnJvbVRvcClcbiAgICByZXR1cm4gbWVzc2FnZVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVCdXR0b25zKCk6UElYSS5Db250YWluZXIge1xuICAgIGNvbnN0IGJ1dHRvbnMgPSBuZXcgSG9yaXpvbnRhbENlbnRlcihjb25maWcubWFyZ2luKVxuICAgIGNvbnN0IGJ1dHRvblRleHRTdHlsZTpQSVhJLlRleHRTdHlsZSA9IG5ldyBQSVhJLlRleHRTdHlsZSh7XG4gICAgICBhbGlnbjogY29uZmlnLmJ1dHRvbi50ZXh0LmFsaWduLFxuICAgICAgbGluZUpvaW46IGNvbmZpZy5idXR0b24udGV4dC5saW5lSm9pbixcbiAgICAgIGZpbGw6IFBJWEkudXRpbHMucmdiMmhleChjb25maWcuYnV0dG9uLnRleHQuZmlsbCksXG4gICAgICBzdHJva2U6IFBJWEkudXRpbHMucmdiMmhleChjb25maWcuYnV0dG9uLnRleHQuc3Ryb2tlKSxcbiAgICAgIHN0cm9rZVRoaWNrbmVzczogY29uZmlnLmJ1dHRvbi50ZXh0LnN0cm9rZVRoaWNrbmVzc1xuICAgIH0pXG4gICAgY29uc3QgYnV0dG9uU3R5bGU6QnV0dG9uU3R5bGUgPSBuZXcgQnV0dG9uU3R5bGUoXG4gICAgICBjb25maWcuYnV0dG9uLndpZHRoLFxuICAgICAgY29uZmlnLmJ1dHRvbi5oZWlnaHQsXG4gICAgICBidXR0b25UZXh0U3R5bGUsXG4gICAgICBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmJ1dHRvbi5maWxsKSxcbiAgICAgIGNvbmZpZy5idXR0b24uc3Ryb2tlVGhpY2tuZXNzLFxuICAgICAgUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5idXR0b24uc3Ryb2tlKVxuICAgIClcbiAgICBjb25zdCBzbWFsbEJ1dHRvblN0eWxlOkJ1dHRvblN0eWxlID0gbmV3IEJ1dHRvblN0eWxlKFxuICAgICAgY29uZmlnLmJ1dHRvbi53aWR0aCAvIDIsXG4gICAgICBjb25maWcuYnV0dG9uLmhlaWdodCxcbiAgICAgIGJ1dHRvblRleHRTdHlsZSxcbiAgICAgIFBJWEkudXRpbHMucmdiMmhleChjb25maWcuYnV0dG9uLmZpbGwpLFxuICAgICAgY29uZmlnLmJ1dHRvbi5zdHJva2VUaGlja25lc3MsXG4gICAgICBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmJ1dHRvbi5zdHJva2UpXG4gICAgKVxuICAgIC8vIFJlZHVjZSB0aGUgc2ltdWxhdGlvbiBzaXplIGJ5IG9uZVxuICAgIGNvbnN0IHJlc2l6ZURvd25CdXR0b246QnV0dG9uID0gbmV3IEJ1dHRvbignLScsIHNtYWxsQnV0dG9uU3R5bGUpXG4gICAgcmVzaXplRG93bkJ1dHRvbi5vbigncHJlc3NlZCcsICgpID0+IHRoaXMuZW1pdCgncmVzaXplJywgLTEpKVxuICAgIGJ1dHRvbnMuYWRkQ2hpbGQocmVzaXplRG93bkJ1dHRvbilcbiAgICAvLyBJbmNyZWFzZSB0aGUgc2ltdWxhdGlvbiBzaXplIGJ5IG9uZVxuICAgIGNvbnN0IHJlc2l6ZVVwQnV0dG9uOkJ1dHRvbiA9IG5ldyBCdXR0b24oJysnLCBzbWFsbEJ1dHRvblN0eWxlKVxuICAgIHJlc2l6ZVVwQnV0dG9uLm9uKCdwcmVzc2VkJywgKCkgPT4gdGhpcy5lbWl0KCdyZXNpemUnLCAxKSlcbiAgICBidXR0b25zLmFkZENoaWxkKHJlc2l6ZVVwQnV0dG9uKVxuICAgIC8vIFNodWZmbGUgdGhlIGFycm93IGRpcmVjdGlvbnNcbiAgICBjb25zdCBzaHVmZmxlQnV0dG9uOkJ1dHRvbiA9IG5ldyBCdXR0b24oJ1NodWZmbGUnLCBidXR0b25TdHlsZSlcbiAgICBzaHVmZmxlQnV0dG9uLm9uKCdwcmVzc2VkJywgKCkgPT4gdGhpcy5lbWl0KCdzaHVmZmxlJykpXG4gICAgYnV0dG9ucy5hZGRDaGlsZChzaHVmZmxlQnV0dG9uKVxuICAgIC8vIFN0YXJ0IHRoZSBzaW11bGF0aW9uOyB0aGUgY29udHJvbGxlciB3aWxsIGhhbmRsZSBkZWxheWluZyB0aGVcbiAgICAvLyBzaW11bGF0aW9uJ3MgaXRlcmF0b3IgdG8gYWxsb3cgdGhlIHZpc3VhbGl6YXRpb24gdGltZSB0byBhbmltYXRlXG4gICAgY29uc3QgcGxheUJ1dHRvbjpCdXR0b24gPSBuZXcgQnV0dG9uKCdQbGF5JywgYnV0dG9uU3R5bGUpXG4gICAgcGxheUJ1dHRvbi5vbigncHJlc3NlZCcsICgpID0+IHRoaXMuZW1pdCgncGxheScpKVxuICAgIGJ1dHRvbnMuYWRkQ2hpbGQocGxheUJ1dHRvbilcbiAgICAvLyBTdG9wIHRoZSBzaW1sdWF0aW9uIGFuZCBtb3ZlIHRoZSBjaGVja2VycyBiYWNrIHRvIHN0YXJ0aW5nIHBvc2l0aW9uXG4gICAgY29uc3Qgc3RvcEJ1dHRvbjpCdXR0b24gPSBuZXcgQnV0dG9uKCdTdG9wJywgYnV0dG9uU3R5bGUpXG4gICAgc3RvcEJ1dHRvbi5vbigncHJlc3NlZCcsICgpID0+IHRoaXMuZW1pdCgnc3RvcCcpKVxuICAgIGJ1dHRvbnMuYWRkQ2hpbGQoc3RvcEJ1dHRvbilcbiAgICByZXR1cm4gYnV0dG9uc1xuICB9XG5cbiAgcHJpdmF0ZSBzZXR1cEJvYXJkKGJvYXJkTGF5b3V0OkJvYXJkTGF5b3V0KSB7XG4gICAgLy8gVEJEOiBNb3ZlIHRoaXMgc29ydCBvZiBsb2dpYyB0byBsYXlvdXQgY29udGFpbmVyIGNsYXNzXG4gICAgY29uc3QgYm9hcmRQaXhlbFNpemU6bnVtYmVyID1cbiAgICAgIE1hdGgubWluKHRoaXMuc2NyZWVuTGF5b3V0LmJvZHlXaWR0aCwgdGhpcy5zY3JlZW5MYXlvdXQuYm9keUhlaWdodClcbiAgICAvLyBUaGUgYm9hcmQgd2lsbCBjb250YWluIHRoZSBjaGVja2VycyBhbmQgc3F1YXJlc1xuICAgIHRoaXMuc2NyZWVuTGF5b3V0LmFkZFRvQm9keShcbiAgICAgIHRoaXMuYm9hcmQgPSBuZXcgRGlyZWN0ZWRDaGVja2VyQm9hcmQoXG4gICAgICAgIGJvYXJkTGF5b3V0LFxuICAgICAgICBib2FyZFBpeGVsU2l6ZSxcbiAgICAgICAgUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5ib2FyZC5vZGQuZmlsbCksXG4gICAgICAgIFBJWEkudXRpbHMucmdiMmhleChjb25maWcuYm9hcmQuZXZlbi5maWxsKSxcbiAgICAgIClcbiAgICApXG4gICAgdGhpcy5ib2FyZC5wb3NpdGlvbiA9IG5ldyBQSVhJLlBvaW50KFxuICAgICAgMCxcbiAgICAgIHRoaXMuc2NyZWVuTGF5b3V0LmJvZHlIZWlnaHQgLyAyXG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSBzZXR1cENoZWNrZXJzKCkge1xuICAgIC8vIFRoZSBjaGVja2VycyBhcmUgY2hpbGRyZW4gb2YgdGhlIGJvYXJkIGZvciBwcm9wZXIgcG9zaXRpb25pbmdcbiAgICB0aGlzLmJvYXJkLmFkZENoaWxkKHRoaXMuY2hlY2tlcjEgPSBuZXcgQ2hlY2tlcihcbiAgICAgIHRoaXMuYm9hcmQuc3F1YXJlU2l6ZSAqIGNvbmZpZy5jaGVja2VyLnJlbGF0aXZlU2l6ZSxcbiAgICAgIC8vIFNlbWktdHJhbnNwYXJlbnQgc28gdGhhdCB0aGUgYXJyb3dzIGNhbiBiZSBzZWVuXG4gICAgICBjb25maWcuY2hlY2tlci5hbHBoYSxcbiAgICAgIGNvbmZpZy5jaGVja2VyLnN0cm9rZVRoaWNrbmVzcyxcbiAgICAgIFBJWEkudXRpbHMucmdiMmhleChjb25maWcuY2hlY2tlci5zdHJva2UpLFxuICAgICAgUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5jaGVja2VyLmZpbGwpXG4gICAgKSlcbiAgICB0aGlzLmJvYXJkLmFkZENoaWxkKHRoaXMuY2hlY2tlcjIgPSBuZXcgQ2hlY2tlcihcbiAgICAgIHRoaXMuYm9hcmQuc3F1YXJlU2l6ZSAqIGNvbmZpZy5jaGVja2VyLnJlbGF0aXZlU2l6ZSxcbiAgICAgIC8vIFNlbWktdHJhbnNwYXJlbnQgc28gdGhhdCB0aGUgYXJyb3dzIGNhbiBiZSBzZWVuXG4gICAgICBjb25maWcuY2hlY2tlci5hbHBoYSxcbiAgICAgIGNvbmZpZy5jaGVja2VyLnN0cm9rZVRoaWNrbmVzcyxcbiAgICAgIFBJWEkudXRpbHMucmdiMmhleChjb25maWcuY2hlY2tlci5zdHJva2UpLFxuICAgICAgUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5jaGVja2VyLmZpbGwpXG4gICAgKSlcbiAgfVxuXG4gIHByaXZhdGUgcmVzaXplKHNpemU6bnVtYmVyKTp2b2lkIHtcbiAgICAvLyBDcmVhdGUgc3F1YXJlcyBhcyBuZWVkZWQsIHNldCB0aGVpciBwb3NpdGlvbiBhbmQgY29sb3IsXG4gICAgLy8gYW5kIHNldCBhbGwgYXJyb3cgZGlyZWN0aW9ucyBmcm9tIHRoZSBzaW11bGF0aW9uIGxheW91dFxuICAgIHRoaXMuYm9hcmQucmVzaXplKHNpemUpXG4gICAgdGhpcy5jaGVja2VyMS5yZXNpemUodGhpcy5ib2FyZC5zcXVhcmVTaXplICogY29uZmlnLmNoZWNrZXIucmVsYXRpdmVTaXplKVxuICAgIHRoaXMuY2hlY2tlcjIucmVzaXplKHRoaXMuYm9hcmQuc3F1YXJlU2l6ZSAqIGNvbmZpZy5jaGVja2VyLnJlbGF0aXZlU2l6ZSlcbiAgfVxufVxuIl19
