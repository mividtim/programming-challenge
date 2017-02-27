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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9jaGVja2Vycy9ib2FyZC1sYXlvdXQudHMiLCJzcmMvY29tcG9uZW50cy9jaGVja2Vycy9jaGVja2VyLWJvYXJkLnRzIiwic3JjL2NvbXBvbmVudHMvY2hlY2tlcnMvY2hlY2tlci1zcXVhcmUudHMiLCJzcmMvY29tcG9uZW50cy9jaGVja2Vycy9jaGVja2VyLnRzIiwic3JjL2NvbXBvbmVudHMvY2hlY2tlcnMvZGlyZWN0ZWQvZGlyZWN0ZWQtY2hlY2tlci1ib2FyZC50cyIsInNyYy9jb21wb25lbnRzL2NoZWNrZXJzL2RpcmVjdGVkL2RpcmVjdGVkLWNoZWNrZXItc3F1YXJlLnRzIiwic3JjL2NvbXBvbmVudHMvbGF5b3V0cy9mdWxsLXNjcmVlbi1oZWFkZXItZm9vdGVyLnRzIiwic3JjL2NvbXBvbmVudHMvbGF5b3V0cy9ob3Jpem9udGFsLWNlbnRlci50cyIsInNyYy9jb21wb25lbnRzL3VpL2Fycm93LnRzIiwic3JjL2NvbXBvbmVudHMvdWkvYnV0dG9uLnRzIiwic3JjL2luZGV4LnRzIiwic3JjL3NpbXVsYXRpb24udHMiLCJzcmMvc291bmQtbWFuYWdlci50cyIsInNyYy92aXN1YWxpemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNVQTtJQUdFLFlBQW1CLEdBQUcsRUFBRSxHQUFHO1FBQ3pCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDaEIsQ0FBQztDQUNGO0FBUEQsc0NBT0M7Ozs7O0FDakJELGdDQUErQjtBQUMvQixpREFBNEM7QUFFNUMscURBQThDO0FBZ0I5QyxrQkFBd0QsU0FBUSxJQUFJLENBQUMsU0FBUztJQVk1RSxZQUNFLElBQVcsRUFDWCxTQUFnQixFQUNoQixXQUFrQixRQUFRLEVBQzFCLFlBQW1CLFFBQVE7UUFDM0IsNERB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UUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUN6RSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQzNFLENBQUM7Q0FDRjtBQXhPRCxzQ0F3T0MiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5leHBvcnQgY29uc3QgZW51bSBEaXJlY3Rpb24ge1xuICBVcCA9IDAsXG4gIFJpZ2h0LFxuICBEb3duLFxuICBMZWZ0XG59XG5cbmV4cG9ydCB0eXBlIEJvYXJkTGF5b3V0ID0gRGlyZWN0aW9uW11bXVxuXG5leHBvcnQgY2xhc3MgQm9hcmRQb3NpdGlvbiB7XG4gIHB1YmxpYyByb3c6bnVtYmVyXG4gIHB1YmxpYyBjb2w6bnVtYmVyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcihyb3csIGNvbCkge1xuICAgIHRoaXMucm93ID0gcm93XG4gICAgdGhpcy5jb2wgPSBjb2xcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJ1xuaW1wb3J0IHtCb2FyZFBvc2l0aW9ufSBmcm9tICcuL2JvYXJkLWxheW91dCdcbmltcG9ydCB7Q2hlY2tlcn0gZnJvbSAnLi9jaGVja2VyJ1xuaW1wb3J0IHtDaGVja2VyU3F1YXJlfSBmcm9tICcuL2NoZWNrZXItc3F1YXJlJ1xuXG4vLyBEZWZpbmUgU3F1YXJlIGFzIG5ld2FibGUgdG8gYWxsb3cgXCJuZXcgdGhpcy5jcmVhdGVTcXVhcmVcIiB0byBjcmVhdGUgYSBuZXdcbi8vIFNxdWFyZS4gVGhpcyBmb3JjZXMgU3F1YXJlJ3MgY29uc3RydWN0b3IgdG8gc2FtZSBwYXJhbWV0ZXIgbGlzdCBhc1xuLy8gQ2hlY2tlclNxdWFyZSwgd2hpY2ggd2lsbCBhbGxvdyB0aGUgYm9hcmQgdG8gY3JlYXRlIHNxdWFyZXMgb2YgdGhlXG4vLyBhcHByb3ByaWF0ZSB0eXBlIChnZW5lcmljIFNxdWFyZSlcbmludGVyZmFjZSBDcmVhdGVTcXVhcmU8U3F1YXJlIGV4dGVuZHMgQ2hlY2tlclNxdWFyZT4ge1xuICBuZXcgKFxuICAgIHBvc2l0aW9uOkJvYXJkUG9zaXRpb24sXG4gICAgcGl4ZWxTaXplOm51bWJlcixcbiAgICBldmVuOmJvb2xlYW4sXG4gICAgb2RkQ29sb3I6bnVtYmVyLFxuICAgIGV2ZW5Db2xvcjpudW1iZXJcbiAgKTpTcXVhcmVcbn1cblxuZXhwb3J0IGNsYXNzIENoZWNrZXJCb2FyZDxTcXVhcmUgZXh0ZW5kcyBDaGVja2VyU3F1YXJlPiBleHRlbmRzIFBJWEkuQ29udGFpbmVyIHtcblxuICBwdWJsaWMgc2l6ZTpudW1iZXJcbiAgcHJvdGVjdGVkIHBpeGVsU2l6ZTpudW1iZXJcbiAgcHJvdGVjdGVkIG9kZENvbG9yOm51bWJlclxuICBwcm90ZWN0ZWQgZXZlbkNvbG9yOm51bWJlclxuICBwdWJsaWMgc3F1YXJlU2l6ZTpudW1iZXJcbiAgcHJvdGVjdGVkIHNxdWFyZXM6U3F1YXJlW11bXSA9IFtdXG4gIC8vIEkgaGF2ZW4ndCB5ZXQgZmlndXJlZCBvdXQgaG93IHRvIHNldCBhIGRlZmF1bHQgdmFsdWUgaGVyZVxuICAvLyAoZGVzaXJlZDogQ2hlY2tlclNxdWFyZSk7IHNvIEkgdXNlIGEgY29uZGl0aW9uYWwgaW4gdGhpcy5zZXR1cFNxdWFyZSgpXG4gIHByaXZhdGUgY3JlYXRlU3F1YXJlOkNyZWF0ZVNxdWFyZTxTcXVhcmU+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHNpemU6bnVtYmVyLFxuICAgIHBpeGVsU2l6ZTpudW1iZXIsXG4gICAgb2RkQ29sb3I6bnVtYmVyID0gMHgxMTExMTEsXG4gICAgZXZlbkNvbG9yOm51bWJlciA9IDB4ZWUxMTExLFxuICAgIC8vIEkgaGF2ZW4ndCB5ZXQgZmlndXJlZCBvdXQgaG93IHRvIHNldCBhIGRlZmF1bHQgdmFsdWUgaGVyZVxuICAgIC8vIChkZXNpcmVkOiBDaGVja2VyU3F1YXJlKTsgc28gSSB1c2UgYSBjb25kaXRpb25hbCBpbiB0aGlzLnNldHVwU3F1YXJlKClcbiAgICBjcmVhdGVTcXVhcmU6Q3JlYXRlU3F1YXJlPFNxdWFyZT4gPSBudWxsXG4gICkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnBpeGVsU2l6ZSA9IHBpeGVsU2l6ZVxuICAgIHRoaXMub2RkQ29sb3IgPSBvZGRDb2xvclxuICAgIHRoaXMuZXZlbkNvbG9yID0gZXZlbkNvbG9yXG4gICAgdGhpcy5jcmVhdGVTcXVhcmUgPSBjcmVhdGVTcXVhcmVcbiAgICB0aGlzLnJlc2l6ZShzaXplKVxuICB9XG5cbiAgcHVibGljIHJlc2l6ZShzaXplOm51bWJlcik6dm9pZCB7XG4gICAgdGhpcy5zaXplID0gc2l6ZVxuICAgIHRoaXMuc3F1YXJlU2l6ZSA9IHRoaXMucGl4ZWxTaXplIC8gdGhpcy5zaXplXG4gICAgdGhpcy5zaHJpbmsoKVxuICAgIHRoaXMuZXhwYW5kQW5kQ29sb3JpemUoKVxuICB9XG5cbiAgcHVibGljIHRvVG9wKG9iamVjdDpQSVhJLkRpc3BsYXlPYmplY3QpOnZvaWQge1xuICAgIHRoaXMucmVtb3ZlQ2hpbGQob2JqZWN0KVxuICAgIHRoaXMuYWRkQ2hpbGQob2JqZWN0KVxuICB9XG5cbiAgcHVibGljIGJvYXJkUG9zaXRpb25Ub1BpeGVscyhib2FyZFBvc2l0aW9uOkJvYXJkUG9zaXRpb24pOlBJWEkuUG9pbnQge1xuICAgIHJldHVybiBuZXcgUElYSS5Qb2ludChcbiAgICAgIChib2FyZFBvc2l0aW9uLmNvbCAtIHRoaXMuc2l6ZSAvIDIpICogdGhpcy5zcXVhcmVTaXplICsgdGhpcy5zcXVhcmVTaXplIC8gMixcbiAgICAgIChib2FyZFBvc2l0aW9uLnJvdyAtIHRoaXMuc2l6ZSAvIDIpICogdGhpcy5zcXVhcmVTaXplICsgdGhpcy5zcXVhcmVTaXplIC8gMlxuICAgIClcbiAgfVxuXG4gIC8vIERlc3Ryb3kgZXh0cmEgYm9hcmQgcG9zaXRpb25zIGlmIHRoZSBuZXcgYm9hcmQgbGF5b3V0IGlzIHNtYWxsZXIgdGhhbiB0aGVcbiAgLy8gbGFzdCBib2FyZFxuICBwcml2YXRlIHNocmluaygpOnZvaWQge1xuICAgIHdoaWxlKHRoaXMuc3F1YXJlcy5sZW5ndGggPiB0aGlzLnNpemUpIHtcbiAgICAgIC8vIERlbGV0ZSB0aGUgbGFzdCByb3dcbiAgICAgIGNvbnN0IHJvdzpTcXVhcmVbXSA9IHRoaXMuc3F1YXJlc1t0aGlzLnNxdWFyZXMubGVuZ3RoIC0gMV1cbiAgICAgIHdoaWxlKHJvdy5sZW5ndGggPiAwKVxuICAgICAgICByb3cucG9wKCkuZGVzdHJveSgpXG4gICAgICB0aGlzLnNxdWFyZXMucG9wKClcbiAgICAgIC8vIERlbGV0ZSB0aGUgbGFzdCBjb2x1bW4gZnJvbSBlYWNoIHJvd1xuICAgICAgZm9yKGxldCByb3cgb2YgdGhpcy5zcXVhcmVzKVxuICAgICAgICByb3cucG9wKCkuZGVzdHJveSgpXG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIHNxdWFyZXMgb2YgdGhlIGFwcHJvcHJpYXRlIHNpemUsIGNvbG9yLCBhbmQgcG9zaXRpb24gdG8gZmlsbCB0aGVcbiAgLy8gYm9hcmQncyBwaXhlbCBzaXplOyByZXNpemUgYW5kIHNldCBwb3NpdGlvbiBhbmQgY29sb3IgZm9yIGV4aXN0aW5nIHNxdWFyZXNcbiAgcHJpdmF0ZSBleHBhbmRBbmRDb2xvcml6ZSgpOnZvaWQge1xuICAgIC8vIGV2ZW4gdHJhY2tzIHRoZSBhbHRlcm5hdGluZyBzcXVhcmUgY29sb3JzXG4gICAgbGV0IGV2ZW46Ym9vbGVhbiA9IGZhbHNlXG4gICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBib2FyZCBwb3NpdGlvbnMgZm9yIHRoZSBnaXZlbiBib2FyZCBzaXplXG4gICAgZm9yKGxldCByb3c6bnVtYmVyID0gMCA7IHJvdyA8IHRoaXMuc2l6ZSA7IHJvdysrKSB7XG4gICAgICAvLyBBZGQgdGhlIHJvdyBpZiBvdXIgYm9hcmQgaXNuJ3QgdGhhdCBiaWcgeWV0XG4gICAgICBpZihyb3cgPiB0aGlzLnNxdWFyZXMubGVuZ3RoIC0gMSlcbiAgICAgICAgdGhpcy5zcXVhcmVzLnB1c2goW10pXG4gICAgICBmb3IobGV0IGNvbDpudW1iZXIgPSAwIDsgY29sIDwgdGhpcy5zaXplIDsgY29sKyspIHtcbiAgICAgICAgdGhpcy5zZXR1cFNxdWFyZShuZXcgQm9hcmRQb3NpdGlvbihyb3csIGNvbCksIGV2ZW4pXG4gICAgICAgIC8vIFN0YWdnZXIgdGhlIHNxdWFyZSBjb2xvcnNcbiAgICAgICAgZXZlbiA9ICFldmVuXG4gICAgICB9XG4gICAgICAvLyBGb3IgZXZlbi1zaXplZCBib2FyZHMsIGhhdmUgdG8gc3RhZ2dlciB0aGUgc3F1YXJlIGNvbG9ycyBiYWNrXG4gICAgICBpZih0aGlzLnNpemUgJSAyID09PSAwKVxuICAgICAgICBldmVuID0gIWV2ZW5cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldHVwU3F1YXJlKHBvc2l0aW9uOkJvYXJkUG9zaXRpb24sIGV2ZW46Ym9vbGVhbik6dm9pZCB7XG4gICAgbGV0IHNxdWFyZTpTcXVhcmVcbiAgICAvLyBJZiB3ZSBkb24ndCB5ZXQgaGF2ZSBhIHNxdWFyZSBmb3IgdGhpcyBwb3NpdGlvbiwgY3JlYXRlIGl0XG4gICAgaWYocG9zaXRpb24uY29sID4gdGhpcy5zcXVhcmVzW3Bvc2l0aW9uLnJvd10ubGVuZ3RoIC0gMSkge1xuICAgICAgLy8gSSBoYXZlbid0IHlldCBmaWd1cmVkIG91dCBob3cgdG8gc2V0IGEgZGVmYXVsdCB2YWx1ZSBmb3JcbiAgICAgIC8vIHRoaXMuY3JlYXRlU3F1YXJlLCBzbyBJIHVzZSBhIGNvbmRpdGlvbmFsIGhlcmUgZm9yIHRoZSBkZWZhdWx0XG4gICAgICBzcXVhcmUgPSB0aGlzLmNyZWF0ZVNxdWFyZVxuICAgICAgICA/IG5ldyB0aGlzLmNyZWF0ZVNxdWFyZShcbiAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICB0aGlzLnNxdWFyZVNpemUsXG4gICAgICAgICAgZXZlbixcbiAgICAgICAgICB0aGlzLm9kZENvbG9yLFxuICAgICAgICAgIHRoaXMuZXZlbkNvbG9yXG4gICAgICAgIClcbiAgICAgICAgOiBuZXcgQ2hlY2tlclNxdWFyZShcbiAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICB0aGlzLnNxdWFyZVNpemUsXG4gICAgICAgICAgZXZlbixcbiAgICAgICAgICB0aGlzLm9kZENvbG9yLFxuICAgICAgICAgIHRoaXMuZXZlbkNvbG9yXG4gICAgICAgICkgYXMgU3F1YXJlXG4gICAgICB0aGlzLmFkZENoaWxkKHNxdWFyZSlcbiAgICAgIHRoaXMuc3F1YXJlc1twb3NpdGlvbi5yb3ddLnB1c2goc3F1YXJlKVxuICAgIH1cbiAgICAvLyBJZiB3ZSBkbyBoYXZlIGEgc3F1YXJlIGF0IHRoaXMgcG9zaXRpb24gYWxyZWFkeSwgdGVsbCBpdCB0byByZXNldFxuICAgIC8vIGl0cyBwb3NpdGlvbiwgY29sb3IsIGFuZCBhcnJvdyBkaXJlY3Rpb24gaWYgbmVlZGVkXG4gICAgZWxzZSB7XG4gICAgICBzcXVhcmUgPSB0aGlzLnNxdWFyZXNbcG9zaXRpb24ucm93XVtwb3NpdGlvbi5jb2xdXG4gICAgICBzcXVhcmUucmVzZXQodGhpcy5zcXVhcmVTaXplLCBldmVuKVxuICAgIH1cbiAgICBzcXVhcmUucG9zaXRpb24gPSB0aGlzLmJvYXJkUG9zaXRpb25Ub1BpeGVscyhwb3NpdGlvbilcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJ1xuaW1wb3J0IHtCb2FyZFBvc2l0aW9ufSBmcm9tICcuL2JvYXJkLWxheW91dCdcblxuZXhwb3J0IGNsYXNzIENoZWNrZXJTcXVhcmUgZXh0ZW5kcyBQSVhJLkdyYXBoaWNzIHtcblxuICBwdWJsaWMgYm9hcmRQb3NpdGlvbjpCb2FyZFBvc2l0aW9uXG4gIHByaXZhdGUgcGl4ZWxTaXplOm51bWJlclxuICBwcml2YXRlIGV2ZW46Ym9vbGVhblxuICBwcml2YXRlIG9kZENvbG9yOm51bWJlclxuICBwcml2YXRlIGV2ZW5Db2xvcjpudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgYm9hcmRQb3NpdGlvbjpCb2FyZFBvc2l0aW9uLFxuICAgIHBpeGVsU2l6ZTpudW1iZXIsXG4gICAgZXZlbjpib29sZWFuLFxuICAgIG9kZENvbG9yOm51bWJlciA9IDB4MTExMTExLFxuICAgIGV2ZW5Db2xvcjpudW1iZXIgPSAweGVlMTExMSxcbiAgICBsaW5lczpib29sZWFuID0gZmFsc2VcbiAgKSB7XG4gICAgc3VwZXIoKSAvL2xpbmVzKVxuICAgIHRoaXMuYm9hcmRQb3NpdGlvbiA9IGJvYXJkUG9zaXRpb25cbiAgICB0aGlzLnBpeGVsU2l6ZSA9IHBpeGVsU2l6ZVxuICAgIHRoaXMuZXZlbiA9IGV2ZW5cbiAgICB0aGlzLm9kZENvbG9yID0gb2RkQ29sb3JcbiAgICB0aGlzLmV2ZW5Db2xvciA9IGV2ZW5Db2xvclxuICAgIHRoaXMucmVkcmF3KClcbiAgfVxuXG4gIHB1YmxpYyByZXNldChwaXhlbFNpemU6bnVtYmVyLCBldmVuOmJvb2xlYW4pOnZvaWQge1xuICAgIC8vIElmIHRoZSBwaXhlbCBzaXplIG9yIGNvbG9yIG9mIHRoZSBzcXVhcmUgY2hhbmdlcywgcmVjcmVhdGUgdGhlIHNxdWFyZVxuICAgIGlmKHRoaXMucGl4ZWxTaXplICE9PSBwaXhlbFNpemUgfHwgdGhpcy5ldmVuICE9PSBldmVuKSB7XG4gICAgICB0aGlzLnBpeGVsU2l6ZSA9IHBpeGVsU2l6ZVxuICAgICAgdGhpcy5ldmVuID0gZXZlblxuICAgICAgLy8gUmVkcmF3IHRoZSBzcXVhcmUgYW5kIGFycm93IGF0IHRoZSBwcm9wZXIgc2l6ZSBhbmQgcG9zaXRpb25cbiAgICAgIHRoaXMucmVkcmF3KClcbiAgICB9XG4gIH1cblxuICAvLyBXZSBrZWVwIHRyYWNrIG9mIGV2ZW4vb2RkIGluIGFuIGluc3RhbmNlIHZhcmlhYmxlIHRvIHNlZSBpZiB3ZSBuZWVkIHRvXG4gIC8vIHJlY3JlYXRlIHRoZSBzcXVhcmU7IEknZCBwcmVmZXIgdG8gcGFzcyBpdCwgYnV0IGhleSB3ZSBhbHJlYWR5IGhhdmUgaXRcbiAgcHJpdmF0ZSByZWRyYXcoKTp2b2lkIHtcbiAgICB0aGlzLmNsZWFyKClcbiAgICB0aGlzLmJlZ2luRmlsbCh0aGlzLmV2ZW4gPyB0aGlzLmV2ZW5Db2xvciA6IHRoaXMub2RkQ29sb3IpXG4gICAgLy8gQ2VudGVyIGl0IG9uIHRoZSBpdHMgcG9zaXRpb25cbiAgICB0aGlzLmRyYXdSZWN0KFxuICAgICAgLXRoaXMucGl4ZWxTaXplIC8gMixcbiAgICAgIC10aGlzLnBpeGVsU2l6ZSAvIDIsXG4gICAgICB0aGlzLnBpeGVsU2l6ZSxcbiAgICAgIHRoaXMucGl4ZWxTaXplXG4gICAgKVxuICAgIHRoaXMuZW5kRmlsbCgpXG4gIH1cblxufVxuIiwiaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJ1xuXG5leHBvcnQgY2xhc3MgQ2hlY2tlciBleHRlbmRzIFBJWEkuR3JhcGhpY3Mge1xuXG4gIHByaXZhdGUgc3Ryb2tlVGhpY2tuZXNzOm51bWJlclxuICBwcml2YXRlIHN0cm9rZTpudW1iZXJcbiAgcHJpdmF0ZSBmaWxsOm51bWJlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBzaXplOm51bWJlcixcbiAgICBhbHBoYTpudW1iZXIgPSAxLFxuICAgIHN0cm9rZVRoaWNrbmVzczpudW1iZXIgPSAwLFxuICAgIHN0cm9rZSA9IDB4MDAwMDAwLFxuICAgIGZpbGw6bnVtYmVyID0gMHgxMTExMTEsXG4gICAgbGluZXM6Ym9vbGVhbiA9IGZhbHNlLFxuICApIHtcbiAgICBzdXBlcigpIC8vbGluZXMpXG4gICAgLy8gU2VtaS10cmFuc3BhcmVudCBzbyB0aGF0IHRoZSBhcnJvd3MgY2FuIGJlIHNlZW5cbiAgICB0aGlzLmFscGhhID0gYWxwaGFcbiAgICB0aGlzLnN0cm9rZVRoaWNrbmVzcyA9IHN0cm9rZVRoaWNrbmVzc1xuICAgIHRoaXMuc3Ryb2tlID0gc3Ryb2tlXG4gICAgdGhpcy5maWxsID0gZmlsbFxuICAgIHRoaXMucmVzaXplKHNpemUpXG4gIH1cblxuICBwdWJsaWMgcmVzaXplKHNpemU6bnVtYmVyKSB7XG4gICAgdGhpcy5jbGVhcigpXG4gICAgdGhpcy5saW5lU3R5bGUodGhpcy5zdHJva2VUaGlja25lc3MsIHRoaXMuc3Ryb2tlKVxuICAgIHRoaXMuYmVnaW5GaWxsKHRoaXMuZmlsbClcbiAgICAvLyBTZXQgc2NhbGUgcmVsYXRpdmUgdG8gc3F1YXJlIHNpemU6IHJhZGl1cyBpcyBzaXplIChkaWFtZXRlcikgLyAyXG4gICAgdGhpcy5kcmF3Q2lyY2xlKDAsIDAsIHNpemUgLyAyKVxuICAgIHRoaXMuZW5kRmlsbCgpXG4gIH1cbn1cbiIsImltcG9ydCB7Q2hlY2tlckJvYXJkfSBmcm9tICcuLi9jaGVja2VyLWJvYXJkJ1xuaW1wb3J0IHtEaXJlY3RlZENoZWNrZXJTcXVhcmV9IGZyb20gJy4vZGlyZWN0ZWQtY2hlY2tlci1zcXVhcmUnXG5pbXBvcnQge0RpcmVjdGlvbiwgQm9hcmRMYXlvdXR9IGZyb20gJy4uL2JvYXJkLWxheW91dCdcblxuZXhwb3J0IGNsYXNzIERpcmVjdGVkQ2hlY2tlckJvYXJkIGV4dGVuZHMgQ2hlY2tlckJvYXJkPERpcmVjdGVkQ2hlY2tlclNxdWFyZT4ge1xuXG4gIHByaXZhdGUgYm9hcmRMYXlvdXQ6Qm9hcmRMYXlvdXRcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgYm9hcmRMYXlvdXQ6Qm9hcmRMYXlvdXQsXG4gICAgcGl4ZWxTaXplOm51bWJlcixcbiAgICBvZGRDb2xvcjpudW1iZXIgPSAweDExMTExMSxcbiAgICBldmVuQ29sb3I6bnVtYmVyID0gMHhlZTExMTFcbiAgKSB7XG4gICAgc3VwZXIoXG4gICAgICBib2FyZExheW91dC5sZW5ndGgsXG4gICAgICBwaXhlbFNpemUsXG4gICAgICBvZGRDb2xvcixcbiAgICAgIGV2ZW5Db2xvcixcbiAgICAgIERpcmVjdGVkQ2hlY2tlclNxdWFyZVxuICAgIClcbiAgICB0aGlzLnNldEJvYXJkTGF5b3V0KGJvYXJkTGF5b3V0KVxuICB9XG5cbiAgcHVibGljIHNldEJvYXJkTGF5b3V0KGJvYXJkTGF5b3V0OkJvYXJkTGF5b3V0KSB7XG4gICAgZm9yKGxldCByb3c6bnVtYmVyID0gMCA7IHJvdyA8IGJvYXJkTGF5b3V0Lmxlbmd0aCA7IHJvdysrKSB7XG4gICAgICBmb3IobGV0IGNvbDpudW1iZXIgPSAwIDsgY29sIDwgYm9hcmRMYXlvdXQubGVuZ3RoIDsgY29sKyspIHtcbiAgICAgICAgY29uc3Qgc3F1YXJlOkRpcmVjdGVkQ2hlY2tlclNxdWFyZSA9IHRoaXMuc3F1YXJlc1tyb3ddW2NvbF1cbiAgICAgICAgc3F1YXJlLnNldERpcmVjdGlvbihib2FyZExheW91dFtyb3ddW2NvbF0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQge0Fycm93fSBmcm9tICcuLi8uLi91aS9hcnJvdydcbmltcG9ydCB7Q2hlY2tlclNxdWFyZX0gZnJvbSAnLi4vY2hlY2tlci1zcXVhcmUnXG5pbXBvcnQge0JvYXJkUG9zaXRpb24sIERpcmVjdGlvbn0gZnJvbSAnLi4vYm9hcmQtbGF5b3V0J1xuXG5leHBvcnQgY2xhc3MgRGlyZWN0ZWRDaGVja2VyU3F1YXJlIGV4dGVuZHMgQ2hlY2tlclNxdWFyZSB7XG5cbiAgcHJpdmF0ZSBhcnJvdzpBcnJvd1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBwb3NpdGlvbjpCb2FyZFBvc2l0aW9uLFxuICAgIHBpeGVsU2l6ZTpudW1iZXIsXG4gICAgZXZlbjpib29sZWFuLFxuICAgIG9kZENvbG9yOm51bWJlciA9IDB4MTExMTExLFxuICAgIGV2ZW5Db2xvcjpudW1iZXIgPSAweGVlMTExMSxcbiAgICBkaXJlY3Rpb246RGlyZWN0aW9uID0gRGlyZWN0aW9uLlVwLFxuICAgIGFycm93Q29sb3I6bnVtYmVyID0gMHhmZmZmZmYsXG4gICAgbGluZXM6Ym9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHN1cGVyKHBvc2l0aW9uLCBwaXhlbFNpemUsIGV2ZW4sIG9kZENvbG9yLCBldmVuQ29sb3IsIGxpbmVzKVxuICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5hcnJvdyA9IG5ldyBBcnJvdyhwaXhlbFNpemUsIGRpcmVjdGlvbiwgYXJyb3dDb2xvcikpXG4gIH1cblxuICBwdWJsaWMgcmVzZXQocGl4ZWxTaXplOm51bWJlciwgZXZlbjpib29sZWFuKSB7XG4gICAgc3VwZXIucmVzZXQocGl4ZWxTaXplLCBldmVuKVxuICAgIHRoaXMuYXJyb3cucmVkcmF3KHBpeGVsU2l6ZSlcbiAgfVxuXG4gIHB1YmxpYyBzZXREaXJlY3Rpb24oZGlyZWN0aW9uOkRpcmVjdGlvbikge1xuICAgIHRoaXMuYXJyb3cuc2V0RGlyZWN0aW9uKGRpcmVjdGlvbilcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJ1xuXG5leHBvcnQgY2xhc3MgRnVsbFNjcmVlbkhlYWRlckZvb3RlciBleHRlbmRzIFBJWEkuQ29udGFpbmVyIHtcblxuICBwcml2YXRlIGJvZHk6UElYSS5Db250YWluZXJcbiAgcHVibGljIHJlYWRvbmx5IGJvZHlXaWR0aDpudW1iZXJcbiAgcHVibGljIHJlYWRvbmx5IGJvZHlIZWlnaHQ6bnVtYmVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIGJvZHk6UElYSS5Db250YWluZXIsXG4gICAgaGVhZGVyOlBJWEkuRGlzcGxheU9iamVjdCA9IG51bGwsXG4gICAgZm9vdGVyOlBJWEkuRGlzcGxheU9iamVjdCA9IG51bGwsXG4gICAgbWFyZ2luOm51bWJlciA9IDBcbiAgKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuYm9keSA9IGJvZHlcbiAgICBjb25zdCBzY3JlZW5XaWR0aCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aFxuICAgIGNvbnN0IHNjcmVlbkhlaWdodCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICBjb25zdCBoZWFkZXJIZWlnaHQgPSBtYXJnaW4gKyAoaGVhZGVyID8gaGVhZGVyLmdldExvY2FsQm91bmRzKCkuYm90dG9tIDogMClcbiAgICBjb25zdCBmb290ZXJIZWlnaHQgPSBtYXJnaW4gKyAoZm9vdGVyID8gZm9vdGVyLmdldExvY2FsQm91bmRzKCkuYm90dG9tIDogMClcbiAgICBpZihoZWFkZXIpIHtcbiAgICAgIHRoaXMuYWRkQ2hpbGQoaGVhZGVyKVxuICAgICAgaGVhZGVyLnBvc2l0aW9uID0gbmV3IFBJWEkuUG9pbnQoc2NyZWVuV2lkdGggLyAyLCBtYXJnaW4pXG4gICAgfVxuICAgIHRoaXMuYWRkQ2hpbGQoYm9keSlcbiAgICBib2R5LnBvc2l0aW9uID0gbmV3IFBJWEkuUG9pbnQoc2NyZWVuV2lkdGggLyAyLCBoZWFkZXJIZWlnaHQgKyBtYXJnaW4pXG4gICAgaWYoZm9vdGVyKSB7XG4gICAgICB0aGlzLmFkZENoaWxkKGZvb3RlcilcbiAgICAgIGZvb3Rlci5wb3NpdGlvbiA9IG5ldyBQSVhJLlBvaW50KHNjcmVlbldpZHRoIC8gMiwgc2NyZWVuSGVpZ2h0IC0gZm9vdGVySGVpZ2h0IC0gbWFyZ2luKVxuICAgIH1cbiAgICB0aGlzLmJvZHlXaWR0aCA9IHNjcmVlbldpZHRoXG4gICAgdGhpcy5ib2R5SGVpZ2h0ID0gc2NyZWVuSGVpZ2h0IC0gaGVhZGVySGVpZ2h0IC0gZm9vdGVySGVpZ2h0IC0gbWFyZ2luICogNlxuICB9XG5cbiAgcHVibGljIGFkZFRvQm9keShjaGlsZDpQSVhJLkRpc3BsYXlPYmplY3QpOlBJWEkuRGlzcGxheU9iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMuYm9keS5hZGRDaGlsZChjaGlsZClcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJ1xuXG5leHBvcnQgY2xhc3MgSG9yaXpvbnRhbENlbnRlciBleHRlbmRzIFBJWEkuQ29udGFpbmVyIHtcblxuICBwcml2YXRlIG1hcmdpbjpudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IobWFyZ2luOm51bWJlciA9IDApIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5zZXRNYXJnaW4obWFyZ2luKVxuICAgIHRoaXMub25DaGlsZHJlbkNoYW5nZSA9IHRoaXMucmVwb3NpdGlvbkNoaWxkcmVuXG4gIH1cblxuICBwdWJsaWMgc2V0TWFyZ2luKG1hcmdpbjpudW1iZXIpIHtcbiAgICB0aGlzLm1hcmdpbiA9IG1hcmdpblxuICAgIHRoaXMucmVwb3NpdGlvbkNoaWxkcmVuKClcbiAgfVxuXG4gIHByaXZhdGUgcmVwb3NpdGlvbkNoaWxkcmVuKCk6dm9pZCB7XG4gICAgaWYodGhpcy5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBmdWxsV2lkdGg6bnVtYmVyID1cbiAgICAgICAgdGhpcy5jaGlsZHJlblxuICAgICAgICAgIC5tYXAoY2hpbGQgPT4gY2hpbGQuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aClcbiAgICAgICAgICAucmVkdWNlKChzdW0sIHdpZHRoKSA9PiBzdW0gKz0gd2lkdGgsIDApXG4gICAgICAgICsgdGhpcy5tYXJnaW4gKiAodGhpcy5jaGlsZHJlbi5sZW5ndGggLSAxKVxuICAgICAgbGV0IGxlZnQ6bnVtYmVyID0gLWZ1bGxXaWR0aCAvIDJcbiAgICAgIGZvcihsZXQgYzpudW1iZXIgPSAwIDsgYyA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIDsgYysrKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkOlBJWEkuRGlzcGxheU9iamVjdCA9IHRoaXMuY2hpbGRyZW5bY11cbiAgICAgICAgY29uc3QgYm91bmRzID0gY2hpbGQuZ2V0TG9jYWxCb3VuZHMoKVxuICAgICAgICAvLyBDZW50ZXIgZWFjaCBpdGVtIG9uIGl0cyBwb3NpdGlvblxuICAgICAgICBjaGlsZC5wb3NpdGlvbi54ID0gbGVmdCAtIGNoaWxkLmdldExvY2FsQm91bmRzKCkueFxuICAgICAgICBsZWZ0ICs9IGJvdW5kcy53aWR0aCArIHRoaXMubWFyZ2luXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBQSVhJIGZyb20gJ3BpeGkuanMnXG5pbXBvcnQge0RpcmVjdGlvbn0gZnJvbSAnLi4vY2hlY2tlcnMvYm9hcmQtbGF5b3V0J1xuXG5leHBvcnQgY2xhc3MgQXJyb3cgZXh0ZW5kcyBQSVhJLkdyYXBoaWNzIHtcblxuICBwcml2YXRlIGRpcmVjdGlvbjpEaXJlY3Rpb24gPSBEaXJlY3Rpb24uVXBcbiAgcHJpdmF0ZSBjb2xvcjpudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgc2l6ZTpudW1iZXIsXG4gICAgZGlyZWN0aW9uOkRpcmVjdGlvbiA9IERpcmVjdGlvbi5VcCxcbiAgICBjb2xvcj0weGZmZmZmZixcbiAgICBsaW5lczpib29sZWFuID0gZmFsc2VcbiAgKSB7XG4gICAgc3VwZXIoKSAvL2xpbmVzKVxuICAgIHRoaXMucmVkcmF3KHNpemUsIGNvbG9yKVxuICAgIHRoaXMuc2V0RGlyZWN0aW9uKGRpcmVjdGlvbilcbiAgfVxuXG4gIC8vIE9ubHkgaXRzIGZpbGwgY29sb3IgaXMgY29uZmlndXJhYmxlLCBhbmQgbm8gc3Ryb2tlXG4gIC8vIEFycm93IHNpemUgaXMgY2FsY3VsYXRlZCByZWxhdGl2ZSB0byBzcXVhcmUgc2l6ZVxuICAvLyBGdWxsIG9mIFwibWFnaWMgbnVtYmVyc1wiOiBUQkQgdG8gbW92ZSB0aGVzZSB0byBjb25maWdcbiAgcHVibGljIHJlZHJhdyhzaXplOm51bWJlciwgY29sb3I6bnVtYmVyID0gbnVsbCkge1xuICAgIGlmKGNvbG9yID09IG51bGwpXG4gICAgICBjb2xvciA9IHRoaXMuY29sb3JcbiAgICBlbHNlXG4gICAgICB0aGlzLmNvbG9yID0gY29sb3JcbiAgICB0aGlzLmNsZWFyKClcbiAgICB0aGlzLmJlZ2luRmlsbChjb2xvcilcbiAgICAvLyBUaGUgYm9keSBvZiB0aGUgYXJyb3dcbiAgICB0aGlzLmRyYXdSZWN0KC1zaXplIC8gMTIsIC1zaXplICogLjIsIHNpemUgLyA2LCBzaXplICogLjYpXG4gICAgLy8gVGhlIGFycm93aGVhZFxuICAgIHRoaXMuZHJhd1BvbHlnb24oW1xuICAgICAgbmV3IFBJWEkuUG9pbnQoMCwgLXNpemUgKiAuNCksXG4gICAgICBuZXcgUElYSS5Qb2ludCgtc2l6ZSAqIC4yNSwgLXNpemUgKiAuMSksXG4gICAgICBuZXcgUElYSS5Qb2ludChzaXplICogLjI1LCAtc2l6ZSAqIC4xKVxuICAgIF0pXG4gICAgdGhpcy5lbmRGaWxsKClcbiAgfVxuXG4gIHB1YmxpYyBzZXREaXJlY3Rpb24oZGlyZWN0aW9uOkRpcmVjdGlvbikge1xuICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uXG4gICAgdGhpcy5yb3RhdGlvbiA9IE1hdGguUEkgLyAyICogdGhpcy5kaXJlY3Rpb25cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJ1xuXG5leHBvcnQgY2xhc3MgQnV0dG9uIGV4dGVuZHMgUElYSS5HcmFwaGljcyB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIGxhYmVsOnN0cmluZyxcbiAgICBzdHlsZTpCdXR0b25TdHlsZVxuICApIHtcbiAgICBzdXBlcigpXG4gICAgLy8gU2V0IHRoZSBzdHlsZXMgZnJvbSB0aGUgY29uZmlnIGFuZCBkcmF3IHRvIGNvbmZpZ3VyZWQgc2l6ZVxuICAgIHRoaXMubGluZVN0eWxlKHN0eWxlLnN0cm9rZVRoaWNrbmVzcywgc3R5bGUuc3Ryb2tlKVxuICAgIHRoaXMuYmVnaW5GaWxsKHN0eWxlLmZpbGwpXG4gICAgdGhpcy5kcmF3UmVjdCgtc3R5bGUud2lkdGggLyAyLCAtc3R5bGUuaGVpZ2h0IC8gMiwgc3R5bGUud2lkdGgsIHN0eWxlLmhlaWdodClcbiAgICB0aGlzLmVuZEZpbGwoKVxuICAgIC8vIEFkZCBzdHlsZWQgYnV0dG9uIHRleHRcbiAgICBjb25zdCB0ZXh0OlBJWEkuVGV4dCA9IG5ldyBQSVhJLlRleHQobGFiZWwsIHN0eWxlLnRleHRTdHlsZSlcbiAgICAvLyBDZW50ZXIgdGhlIHRleHQgb24gdGhlIGJ1dHRvblxuICAgIHRleHQuYW5jaG9yLnNldCguNSlcbiAgICB0aGlzLmFkZENoaWxkKHRleHQpXG4gICAgLy8gU2V0IHVwIHRoZSBldmVudCBoYW5kbGVyc1xuICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXG4gICAgdGhpcy5vbignbW91c2V1cCcsICgpID0+IHRoaXMuZW1pdCgncHJlc3NlZCcpKVxuICAgIHRoaXMub24oJ3RvdWNoZW5kJywgKCkgPT4gdGhpcy5lbWl0KCdwcmVzc2VkJykpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJ1dHRvblN0eWxlIHtcblxuICBwdWJsaWMgd2lkdGg6bnVtYmVyXG4gIHB1YmxpYyBoZWlnaHQ6bnVtYmVyXG4gIHB1YmxpYyB0ZXh0U3R5bGU6UElYSS5UZXh0U3R5bGVcbiAgcHVibGljIGZpbGw6bnVtYmVyXG4gIHB1YmxpYyBzdHJva2U6bnVtYmVyXG4gIHB1YmxpYyBzdHJva2VUaGlja25lc3M6bnVtYmVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHdpZHRoOm51bWJlcixcbiAgICBoZWlnaHQ6bnVtYmVyLFxuICAgIHRleHRTdHlsZTpQSVhJLlRleHRTdHlsZSxcbiAgICBmaWxsOm51bWJlciA9IDB4NTQyMTIxLFxuICAgIHN0cm9rZVRoaWNrbmVzczpudW1iZXIgPSAwLFxuICAgIHN0cm9rZTpudW1iZXIgPSAweGVkZWRlZFxuICApIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGhcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodFxuICAgIHRoaXMudGV4dFN0eWxlID0gdGV4dFN0eWxlXG4gICAgdGhpcy5maWxsID0gZmlsbFxuICAgIHRoaXMuc3Ryb2tlVGhpY2tuZXNzID0gc3Ryb2tlVGhpY2tuZXNzXG4gICAgdGhpcy5zdHJva2UgPSBzdHJva2VcbiAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vdHlwaW5ncy9pbmRleC5kLnRzJyAvPlxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnXG5pbXBvcnQge1NpbXVsYXRpb24sIFNpbXVsYXRpb25TdGF0ZX0gZnJvbSAnLi9zaW11bGF0aW9uJ1xuaW1wb3J0IHtCb2FyZFBvc2l0aW9ufSBmcm9tICcuL2NvbXBvbmVudHMvY2hlY2tlcnMvYm9hcmQtbGF5b3V0J1xuaW1wb3J0IHtWaXN1YWxpemF0aW9ufSBmcm9tICcuL3Zpc3VhbGl6YXRpb24nXG5cbmNvbnN0IGNvbmZpZyA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKCcuL2NvbmZpZy5qc29uJywgJ3V0Zi04JykpXG5cbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbiB7XG5cbiAgcHJpdmF0ZSBzaW11bGF0aW9uOlNpbXVsYXRpb25cbiAgcHJpdmF0ZSB2aXN1YWxpemF0aW9uOlZpc3VhbGl6YXRpb25cbiAgcHJpdmF0ZSB0aW1lb3V0Om51bWJlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICAvLyBOdW1iZXIgb2Ygcm93cyBhbmQgY29sdW1ucyBmb3IgdGhlIHNpbXVsYXRpb24gYm9hcmRcbiAgICB0aGlzLnNpbXVsYXRpb24gPSBuZXcgU2ltdWxhdGlvbihjb25maWcuc2ltdWxhdGlvbi5pbml0aWFsU2l6ZSlcbiAgICAvLyBDYWxsZWQgYnkgdGhlIHNpbXVsYXRpb24gd2hlbmV2ZXIgYSBwb2ludCBtb3Zlc1xuICAgIC8vIChpbiBvcmRlciB0byBhbmltYXRlIGl0LCBwZXJoYXBzKVxuICAgIHRoaXMuc2ltdWxhdGlvbi5vbignbW92ZScsIHRoaXMucG9pbnRlck1vdmVkKVxuICAgIHRoaXMuc2ltdWxhdGlvbi5vbignZW5kJywgdGhpcy5zaW11bGF0aW9uRW5kZWQpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uID0gbmV3IFZpc3VhbGl6YXRpb24odGhpcy5zaW11bGF0aW9uLmJvYXJkTGF5b3V0KVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5vbigncGxheScsIHRoaXMucGxheSlcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24ub24oJ3N0b3AnLCB0aGlzLmZvcmNlU3RvcClcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24ub24oJ3Jlc2l6ZScsIHRoaXMucmVzaXplKVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5vbignc2h1ZmZsZScsIHRoaXMuc2h1ZmZsZSlcbiAgICB0aGlzLnJlc3RhcnQoKVxuICB9XG5cbiAgLy8gRXZlbnQgaGFuZGxpbmcgY2FsbGJhY2tzIG5lZWQgZmF0IGFycm93IHRvIGtlZXAgXCJ0aGlzXCIgY29udGV4dFxuICBwcml2YXRlIHJlc2l6ZSA9IChhbW91bnQ6bnVtYmVyKTp2b2lkID0+IHtcbiAgICB0aGlzLnN0b3AoKVxuICAgIGxldCBib2FyZFNpemU6bnVtYmVyID0gdGhpcy5zaW11bGF0aW9uLnNpemUgKyBhbW91bnRcbiAgICBpZihib2FyZFNpemUgPCAxKVxuICAgICAgYm9hcmRTaXplID0gMVxuICAgIGVsc2UgaWYoYm9hcmRTaXplID4gY29uZmlnLnNpbXVsYXRpb24ubWF4U2l6ZSlcbiAgICAgIGJvYXJkU2l6ZSA9IGNvbmZpZy5zaW11bGF0aW9uLm1heFNpemVcbiAgICBpZih0aGlzLnNpbXVsYXRpb24uc2l6ZSAhPT0gYm9hcmRTaXplKVxuICAgICAgdGhpcy5zaW11bGF0aW9uLnJlc2l6ZShib2FyZFNpemUpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLnNldEJvYXJkTGF5b3V0KHRoaXMuc2ltdWxhdGlvbi5ib2FyZExheW91dClcbiAgICB0aGlzLnJlc3RhcnQoKVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5zaG93TWVzc2FnZSgnUHJlc3MgUGxheSB0byBCZWdpbicpXG4gIH1cblxuICAvLyBFdmVudCBoYW5kbGluZyBjYWxsYmFja3MgbmVlZCBmYXQgYXJyb3cgdG8ga2VlcCBcInRoaXNcIiBjb250ZXh0XG4gIHByaXZhdGUgc2h1ZmZsZSA9ICgpOnZvaWQgPT4ge1xuICAgIHRoaXMuc3RvcCgpXG4gICAgdGhpcy5zaW11bGF0aW9uLnNodWZmbGUoKVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5zZXRCb2FyZExheW91dCh0aGlzLnNpbXVsYXRpb24uYm9hcmRMYXlvdXQpXG4gICAgdGhpcy5yZXN0YXJ0KClcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2hvd01lc3NhZ2UoJ1ByZXNzIFBsYXkgdG8gQmVnaW4nKVxuICB9XG5cbiAgLy8gRXZlbnQgaGFuZGxpbmcgY2FsbGJhY2tzIG5lZWQgZmF0IGFycm93IHRvIGtlZXAgXCJ0aGlzXCIgY29udGV4dFxuICBwcml2YXRlIHBsYXkgPSAoKTp2b2lkID0+IHtcbiAgICB0aGlzLnN0b3AoKVxuICAgIHRoaXMucmVzdGFydCgpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLnNob3dNZXNzYWdlKCdSdW5uaW5nJylcbiAgICB0aGlzLm5leHQoKVxuICB9XG5cbiAgLy8gRXZlbnQgaGFuZGxpbmcgY2FsbGJhY2tzIG5lZWQgZmF0IGFycm93IHRvIGtlZXAgXCJ0aGlzXCIgY29udGV4dFxuICBwcml2YXRlIGZvcmNlU3RvcCA9ICgpOnZvaWQgPT4ge1xuICAgIGlmKHRoaXMuc2ltdWxhdGlvbi5zdGF0ZSA9PT0gU2ltdWxhdGlvblN0YXRlLlJ1bm5pbmcpIHtcbiAgICAgIHRoaXMuc3RvcCgpXG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2hvd01lc3NhZ2UoJ1N0b3BwZWQnKVxuICAgIH1cbiAgfVxuXG4gIC8vIEV2ZW50IGhhbmRsaW5nIGNhbGxiYWNrcyBuZWVkIGZhdCBhcnJvdyB0byBrZWVwIFwidGhpc1wiIGNvbnRleHRcbiAgcHJpdmF0ZSBwb2ludGVyTW92ZWQgPSAobnVtYmVyOm51bWJlciwgcG9zaXRpb246Qm9hcmRQb3NpdGlvbikgPT4ge1xuICAgIHRoaXMudmlzdWFsaXphdGlvbi5tb3ZlQ2hlY2tlcihudW1iZXIsIHBvc2l0aW9uKVxuICB9XG5cbiAgLy8gRmF0IGFycm93IHRvIHByZXNlcnZlIFwidGhpc1wiIGluIHNldFRpbWVvdXRcbiAgcHJpdmF0ZSBuZXh0ID0gKCk6dm9pZCA9PiB7XG4gICAgdGhpcy5zaW11bGF0aW9uLm5leHQoKVxuICAgIGlmKHRoaXMuc2ltdWxhdGlvbi5zdGF0ZSA9PT0gU2ltdWxhdGlvblN0YXRlLlJ1bm5pbmcpXG4gICAgICAvLyBEZWxheSBmb3IgdGhlIGFuaW1hdGlvbiB0byBmaW5pc2gsIGFuZCB0cmFjayB0aGUgdGltZW91dCBzbyB3ZVxuICAgICAgLy8gY2FuIHN0b3AgaXQgb24gZGVtYW5kXG4gICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMubmV4dCwgY29uZmlnLnZpc3VhbGl6YXRpb24ubW92ZVRpbWUpXG4gIH1cblxuICAvLyBFdmVudCBoYW5kbGluZyBjYWxsYmFja3MgbmVlZCBmYXQgYXJyb3cgdG8ga2VlcCBcInRoaXNcIiBjb250ZXh0XG4gIHByaXZhdGUgc2ltdWxhdGlvbkVuZGVkID0gKCk6dm9pZCA9PiB7XG4gICAgbGV0IG1lc3NhZ2U6c3RyaW5nXG4gICAgc3dpdGNoKHRoaXMuc2ltdWxhdGlvbi5zdGF0ZSkge1xuICAgICAgY2FzZSBTaW11bGF0aW9uU3RhdGUuTm9uY2lyY3VsYXI6XG4gICAgICAgIHRoaXMudmlzdWFsaXphdGlvbi5zaG93TWVzc2FnZSgnVGhlIHBhdGggaXMgbm9uY2lyY3VsYXIuJylcbiAgICAgICAgdGhpcy52aXN1YWxpemF0aW9uLmZhbGwoKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBTaW11bGF0aW9uU3RhdGUuQ2lyY3VsYXI6XG4gICAgICAgIHRoaXMudmlzdWFsaXphdGlvbi5zaG93TWVzc2FnZSgnVGhlIHBhdGggaXMgY2lyY3VsYXIuJylcbiAgICAgICAgdGhpcy52aXN1YWxpemF0aW9uLmNvbGxpZGUoKVxuICAgICAgICBicmVha1xuICAgIH1cbiAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMuc3RvcCwgY29uZmlnLnZpc3VhbGl6YXRpb24ubW92ZVRpbWUpXG4gIH1cblxuICAvLyBGYXQgYXJyb3cgdG8gcHJlc2VydmUgXCJ0aGlzXCIgaW4gc2V0VGltZW91dCBjYWxsXG4gIHByaXZhdGUgc3RvcCA9ICgpID0+IHtcbiAgICBpZih0aGlzLnRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgICB0aGlzLnRpbWVvdXQgPSBudWxsXG4gICAgfVxuICAgIHRoaXMudmlzdWFsaXphdGlvbi5zdG9wKClcbiAgfVxuXG4gIHByaXZhdGUgcmVzdGFydCgpOnZvaWQge1xuICAgIC8vIE1vdmUgdGhlIGNoZWNrZXJzIHRvIHRoZWlyIHN0YXJ0aW5nIHBvc2l0aW9uc1xuICAgIHRoaXMuc2ltdWxhdGlvbi5yZXN0YXJ0KClcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24ucmVzdGFydCgpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLnBsYWNlQ2hlY2tlcigxLCB0aGlzLnNpbXVsYXRpb24uc3RhcnRpbmdQb3NpdGlvbilcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24ucGxhY2VDaGVja2VyKDIsIHRoaXMuc2ltdWxhdGlvbi5zdGFydGluZ1Bvc2l0aW9uKVxuICB9XG59XG5cbm5ldyBBcHBsaWNhdGlvbigpXG4iLCJpbXBvcnQgKiBhcyBFdmVudHNFbWl0dGVyIGZyb20gJ2V2ZW50cydcbmltcG9ydCB7XG4gIEJvYXJkTGF5b3V0LFxuICBCb2FyZFBvc2l0aW9uLFxuICBEaXJlY3Rpb25cbn0gZnJvbSAnLi9jb21wb25lbnRzL2NoZWNrZXJzL2JvYXJkLWxheW91dCdcblxuZXhwb3J0IGNvbnN0IGVudW0gU2ltdWxhdGlvblN0YXRlIHtcbiAgUnVubmluZyxcbiAgQ2lyY3VsYXIsXG4gIE5vbmNpcmN1bGFyXG59XG5cbmV4cG9ydCBjbGFzcyBTaW11bGF0aW9uIGV4dGVuZHMgRXZlbnRzRW1pdHRlciB7XG5cbiAgc2l6ZTpudW1iZXJcbiAgYm9hcmRMYXlvdXQ6Qm9hcmRMYXlvdXQgPSBbXVxuICBzdGF0ZTpTaW11bGF0aW9uU3RhdGVcbiAgc3RhcnRpbmdQb3NpdGlvbjpCb2FyZFBvc2l0aW9uXG4gIHBvaW50ZXJPbmVQb3NpdGlvbjpCb2FyZFBvc2l0aW9uXG4gIHBvaW50ZXJUd29Qb3NpdGlvbjpCb2FyZFBvc2l0aW9uXG4gIGV2ZW5Nb3ZlOmJvb2xlYW5cblxuICBwdWJsaWMgY29uc3RydWN0b3Ioc2l6ZTpudW1iZXIpIHtcbiAgICBzdXBlcigpXG4gICAgLy8gU2V0IGluaXRpYWwgYm9hcmQgbGF5b3V0IHRvIHRoZSBwcm9wZXIgc2l6ZTsgcmVzaXplIHRha2VzIGNhcmUgb2ZcbiAgICAvLyBzaHVmZmxpbmdcbiAgICB0aGlzLnJlc2l6ZShzaXplKVxuICB9XG5cbiAgLy8gV2hlbiB0aGUgc2ltdWxhdGlvbiBpcyByZXNpemVkLCByZXNpemUgdGhlIGJvYXJkIGxheW91dCBkYXRhIHN0cnVjdHVyZVxuICAvLyBhbmQgc2h1ZmZsZSB0aGUgYm9hcmQgKGFuIGltcHJvdmVtZW50IGNvdWxkIGJlIHRvIG9ubHkgcmFuZG9taXplIGFueSBcIm5ld1wiXG4gIC8vIHBvc2l0aW9ucylcbiAgcHVibGljIHJlc2l6ZShzaXplOm51bWJlcik6dm9pZCB7XG4gICAgdGhpcy5zaXplID0gc2l6ZVxuICAgIC8vIFJlbW92ZSByb3dzIGRvd24gdG8gdGhlIHByb3BlciBzaXplXG4gICAgd2hpbGUodGhpcy5ib2FyZExheW91dC5sZW5ndGggPiBzaXplKVxuICAgICAgdGhpcy5ib2FyZExheW91dC5wb3AoKVxuICAgIGZvcihsZXQgcm93Om51bWJlciA9IDAgOyByb3cgPCB0aGlzLmJvYXJkTGF5b3V0Lmxlbmd0aCA7IHJvdysrKSB7XG4gICAgICAvLyBSZW1vdmUgY29sdW1ucyBmcm9tIGVhY2ggcmVtYWluaW5nIHJvdyBkb3duIHRvIHRoZSBwcm9wZXIgc2l6ZVxuICAgICAgd2hpbGUodGhpcy5ib2FyZExheW91dFtyb3ddLmxlbmd0aCA+IHNpemUpXG4gICAgICAgIHRoaXMuYm9hcmRMYXlvdXRbcm93XS5wb3AoKVxuICAgICAgLy8gQWRkIGNvbHVtbnMgdG8gdGhlIGV4aXN0aW5nIHJvd3MgdXAgdG8gdGhlIHByb3BlciBzaXplXG4gICAgICB3aGlsZShzaXplID4gdGhpcy5ib2FyZExheW91dFtyb3ddLmxlbmd0aClcbiAgICAgICAgdGhpcy5ib2FyZExheW91dFtyb3ddLnB1c2goMClcbiAgICB9XG4gICAgLy8gQWRkIHJvd3MgdXAgdG8gdGhlIHByb3BlciBzaXplXG4gICAgd2hpbGUoc2l6ZSA+IHRoaXMuYm9hcmRMYXlvdXQubGVuZ3RoKVxuICAgICAgdGhpcy5hZGRSb3codGhpcy5ib2FyZExheW91dC5sZW5ndGgpXG4gICAgdGhpcy5zaHVmZmxlKClcbiAgfVxuXG4gIC8vIFNldCByYW5kb20gdmFsdWVzIGZvciBlYWNoIGxvY2F0aW9uIG9uIHRoZSBib2FyZFxuICBwdWJsaWMgc2h1ZmZsZSgpOnZvaWQge1xuICAgIGZvcihsZXQgcm93Om51bWJlciA9IDAgOyByb3cgPCB0aGlzLnNpemUgOyByb3crKylcbiAgICAgIGZvcihsZXQgY29sOm51bWJlciA9IDAgOyBjb2wgPCB0aGlzLnNpemUgOyBjb2wrKylcbiAgICAgICAgdGhpcy5ib2FyZExheW91dFtyb3ddW2NvbF0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KVxuICAgIHRoaXMuc3RhcnRpbmdQb3NpdGlvbiA9IHRoaXMucmFuZG9tUG9zaXRpb24oKVxuICAgIHRoaXMucmVzdGFydCgpXG4gIH1cblxuICAvLyBTZXQgdGhlIHN0YXRlIHRvIFJ1bm5pbmcsIGFuZCBtb3ZlIHRoZSBwb2ludGVycyBiYWNrIHRvIHN0YXJ0aW5nIHBvc2l0aW9uXG4gIHB1YmxpYyByZXN0YXJ0KCk6dm9pZCB7XG4gICAgdGhpcy5zdGF0ZSA9IFNpbXVsYXRpb25TdGF0ZS5SdW5uaW5nXG4gICAgdGhpcy5wb2ludGVyT25lUG9zaXRpb24gPSB0aGlzLnN0YXJ0aW5nUG9zaXRpb25cbiAgICB0aGlzLnBvaW50ZXJUd29Qb3NpdGlvbiA9IHRoaXMuc3RhcnRpbmdQb3NpdGlvblxuICAgIHRoaXMuZXZlbk1vdmUgPSBmYWxzZVxuICB9XG5cbiAgcHVibGljIHJ1bigpOnZvaWQge1xuICAgIHRoaXMucmVzdGFydCgpXG4gICAgd2hpbGUodGhpcy5zdGF0ZSA9PT0gU2ltdWxhdGlvblN0YXRlLlJ1bm5pbmcpXG4gICAgICB0aGlzLm5leHQoKVxuICB9XG5cbiAgLy8gVGhlIGl0ZXJhdG9yLCB1c2VkIGJ5IHRoZSBjb250cm9sbGVyIHRvIHN0ZXAgdGhyb3VnaCB0aGUgc2ltdWxhdGlvblxuICAvLyBBbiBpbXByb3ZlbWVudCBtaWdodCBiZSB0byBhZGQgYSBcInJ1blwiIG1ldGhvZCB0byBTaW11bGF0aW9uLCB3aGljaFxuICAvLyB3b3VsZCBydW4gdGhlIGVudGlyZSBzaW11bGF0aW9uIHN5bmNocm9ub3VzbHlcbiAgcHVibGljIG5leHQoKTp2b2lkIHtcbiAgICB0aGlzLnBvaW50ZXJPbmVQb3NpdGlvbiA9IHRoaXMubmV4dFBvc2l0aW9uKHRoaXMucG9pbnRlck9uZVBvc2l0aW9uKVxuICAgIHRoaXMuZGV0ZXJtaW5lU3RhdGUoKVxuICAgIHRoaXMuZW1pdCgnbW92ZScsIDEsIHRoaXMucG9pbnRlck9uZVBvc2l0aW9uKVxuICAgIC8vIEhhdmUgdG8gY2hlY2sgYmVmb3JlIG1vdmluZyB0aGUgc2Vjb25kIHBvaW50ZXJcbiAgICBpZih0aGlzLnN0YXRlID09PSBTaW11bGF0aW9uU3RhdGUuUnVubmluZyAmJiB0aGlzLmV2ZW5Nb3ZlKSB7XG4gICAgICB0aGlzLnBvaW50ZXJUd29Qb3NpdGlvbiA9IHRoaXMubmV4dFBvc2l0aW9uKHRoaXMucG9pbnRlclR3b1Bvc2l0aW9uKVxuICAgICAgdGhpcy5kZXRlcm1pbmVTdGF0ZSgpXG4gICAgICB0aGlzLmVtaXQoJ21vdmUnLCAyLCB0aGlzLnBvaW50ZXJUd29Qb3NpdGlvbilcbiAgICB9XG4gICAgdGhpcy5ldmVuTW92ZSA9ICF0aGlzLmV2ZW5Nb3ZlXG4gICAgaWYodGhpcy5zdGF0ZSAhPT0gU2ltdWxhdGlvblN0YXRlLlJ1bm5pbmcpXG4gICAgICB0aGlzLmVtaXQoJ2VuZCcsIHRoaXMuc3RhdGUpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHNhbWVQb3NpdGlvbihwb3NpdGlvbjE6Qm9hcmRQb3NpdGlvbiwgcG9zaXRpb24yOkJvYXJkUG9zaXRpb24pIHtcbiAgICByZXR1cm4gcG9zaXRpb24xLnJvdyA9PT0gcG9zaXRpb24yLnJvdyAmJiBwb3NpdGlvbjEuY29sID09PSBwb3NpdGlvbjIuY29sXG4gIH1cblxuICBwcml2YXRlIGFkZFJvdyhyb3c6bnVtYmVyKTp2b2lkIHtcbiAgICB0aGlzLmJvYXJkTGF5b3V0LnB1c2goW10pXG4gICAgZm9yKGxldCBjb2w6bnVtYmVyID0gMCA7IGNvbCA8IHRoaXMuc2l6ZSA7IGNvbCsrKVxuICAgICAgdGhpcy5ib2FyZExheW91dFtyb3ddLnB1c2goMClcbiAgfVxuXG4gIHByaXZhdGUgbmV4dFBvc2l0aW9uKGN1cnJlbnRQb3NpdGlvbjpCb2FyZFBvc2l0aW9uKTpCb2FyZFBvc2l0aW9uIHtcbiAgICBjb25zdCBkaXJlY3Rpb246RGlyZWN0aW9uID1cbiAgICAgIHRoaXMuYm9hcmRMYXlvdXRbY3VycmVudFBvc2l0aW9uLnJvd11bY3VycmVudFBvc2l0aW9uLmNvbF1cbiAgICBsZXQgbmV4dFBvc2l0aW9uOkJvYXJkUG9zaXRpb25cbiAgICBzd2l0Y2goZGlyZWN0aW9uKSB7XG4gICAgICBjYXNlIERpcmVjdGlvbi5VcDpcbiAgICAgICAgbmV4dFBvc2l0aW9uID1cbiAgICAgICAgICBuZXcgQm9hcmRQb3NpdGlvbihjdXJyZW50UG9zaXRpb24ucm93IC0gMSwgY3VycmVudFBvc2l0aW9uLmNvbClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpcmVjdGlvbi5Eb3duOlxuICAgICAgICBuZXh0UG9zaXRpb24gPVxuICAgICAgICAgIG5ldyBCb2FyZFBvc2l0aW9uKGN1cnJlbnRQb3NpdGlvbi5yb3cgKyAxLCBjdXJyZW50UG9zaXRpb24uY29sKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XG4gICAgICAgIG5leHRQb3NpdGlvbiA9XG4gICAgICAgICAgbmV3IEJvYXJkUG9zaXRpb24oY3VycmVudFBvc2l0aW9uLnJvdywgY3VycmVudFBvc2l0aW9uLmNvbCAtIDEpXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaXJlY3Rpb24uUmlnaHQ6XG4gICAgICAgIG5leHRQb3NpdGlvbiA9XG4gICAgICAgICAgbmV3IEJvYXJkUG9zaXRpb24oY3VycmVudFBvc2l0aW9uLnJvdywgY3VycmVudFBvc2l0aW9uLmNvbCArIDEpXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbmV4dFBvc2l0aW9uXG4gIH1cblxuICBwcml2YXRlIGRldGVybWluZVN0YXRlKCk6dm9pZCB7XG4gICAgdGhpcy5zdGF0ZSA9XG4gICAgICAhdGhpcy52YWxpZFBvc2l0aW9uKHRoaXMucG9pbnRlck9uZVBvc2l0aW9uKVxuICAgICAgICA/IFNpbXVsYXRpb25TdGF0ZS5Ob25jaXJjdWxhclxuICAgICAgOiBTaW11bGF0aW9uLnNhbWVQb3NpdGlvbih0aGlzLnBvaW50ZXJPbmVQb3NpdGlvbiwgdGhpcy5wb2ludGVyVHdvUG9zaXRpb24pXG4gICAgICAgID8gU2ltdWxhdGlvblN0YXRlLkNpcmN1bGFyXG4gICAgICA6IFNpbXVsYXRpb25TdGF0ZS5SdW5uaW5nXG4gIH1cblxuICBwcml2YXRlIHZhbGlkUG9zaXRpb24ocG9zaXRpb246Qm9hcmRQb3NpdGlvbik6Ym9vbGVhbiB7XG4gICAgcmV0dXJuICEoXG4gICAgICBwb3NpdGlvbi5yb3cgPCAwIHx8XG4gICAgICBwb3NpdGlvbi5yb3cgPiB0aGlzLnNpemUgLSAxIHx8XG4gICAgICBwb3NpdGlvbi5jb2wgPCAwIHx8XG4gICAgICBwb3NpdGlvbi5jb2wgPiB0aGlzLnNpemUgLSAxXG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSByYW5kb21Qb3NpdGlvbihzaXplOm51bWJlciA9IDApOkJvYXJkUG9zaXRpb24ge1xuICAgIGlmKHNpemUgPCAxKVxuICAgICAgc2l6ZSA9IHRoaXMuc2l6ZVxuICAgIHJldHVybiBuZXcgQm9hcmRQb3NpdGlvbihcbiAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogc2l6ZSksXG4gICAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHNpemUpXG4gICAgKVxuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgU291bmRNYW5hZ2VyIHtcblxuICBwcml2YXRlIHNvdW5kczp7W2tleTpzdHJpbmddOkhUTUxBdWRpb0VsZW1lbnR9ID0ge31cblxuICBwdWJsaWMgY29uc3RydWN0b3Ioc291bmRzOntba2V5OnN0cmluZ106c3RyaW5nfSkge1xuICAgIGZvcihsZXQgc291bmQgaW4gc291bmRzKSB7XG4gICAgICBjb25zdCBhdWRpbyA9IG5ldyBBdWRpbygpXG4gICAgICBhdWRpby5zcmMgPSBzb3VuZHNbc291bmRdXG4gICAgICBhdWRpby5wcmVsb2FkID0gJ3RydWUnXG4gICAgICB0aGlzLnNvdW5kc1tzb3VuZF0gPSBhdWRpb1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBwbGF5KHNvdW5kTmFtZSkge1xuICAgIHRoaXMuc291bmRzW3NvdW5kTmFtZV0ucGF1c2UoKVxuICAgIHRoaXMuc291bmRzW3NvdW5kTmFtZV0uY3VycmVudFRpbWUgPSAwXG4gICAgdGhpcy5zb3VuZHNbc291bmROYW1lXS5wbGF5KClcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnXG5pbXBvcnQgKiBhcyBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJ1xuaW1wb3J0ICogYXMgUElYSSBmcm9tICdwaXhpLmpzJ1xuaW1wb3J0IHtUd2VlbkxpdGV9IGZyb20gJ2dzYXAvVHdlZW5MaXRlJ1xuaW1wb3J0IHtTb3VuZE1hbmFnZXJ9IGZyb20gJy4vc291bmQtbWFuYWdlcidcbmltcG9ydCB7XG4gIEJvYXJkUG9zaXRpb24sXG4gIERpcmVjdGlvbixcbiAgQm9hcmRMYXlvdXRcbn0gZnJvbSAnLi9jb21wb25lbnRzL2NoZWNrZXJzL2JvYXJkLWxheW91dCdcbmltcG9ydCB7QnV0dG9uLCBCdXR0b25TdHlsZX0gZnJvbSAnLi9jb21wb25lbnRzL3VpL2J1dHRvbidcbmltcG9ydCB7Q2hlY2tlcn0gZnJvbSAnLi9jb21wb25lbnRzL2NoZWNrZXJzL2NoZWNrZXInXG5pbXBvcnQge0RpcmVjdGVkQ2hlY2tlckJvYXJkfSBmcm9tXG4gICcuL2NvbXBvbmVudHMvY2hlY2tlcnMvZGlyZWN0ZWQvZGlyZWN0ZWQtY2hlY2tlci1ib2FyZCdcbmltcG9ydCB7SG9yaXpvbnRhbENlbnRlcn0gZnJvbSAnLi9jb21wb25lbnRzL2xheW91dHMvaG9yaXpvbnRhbC1jZW50ZXInXG5pbXBvcnQge0Z1bGxTY3JlZW5IZWFkZXJGb290ZXJ9IGZyb21cbiAgJy4vY29tcG9uZW50cy9sYXlvdXRzL2Z1bGwtc2NyZWVuLWhlYWRlci1mb290ZXInXG5cbmNvbnN0IGNvbmZpZyA9XG4gIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKCcuL2NvbmZpZy5qc29uJywgJ3V0Zi04JykpLnZpc3VhbGl6YXRpb25cblxuZXhwb3J0IGNsYXNzIFZpc3VhbGl6YXRpb24gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIHByaXZhdGUgc2NyZWVuTGF5b3V0OkZ1bGxTY3JlZW5IZWFkZXJGb290ZXJcbiAgcHJpdmF0ZSBib2FyZDpEaXJlY3RlZENoZWNrZXJCb2FyZFxuICBwcml2YXRlIGNoZWNrZXIxOkNoZWNrZXJcbiAgcHJpdmF0ZSBjaGVja2VyMjpDaGVja2VyXG4gIHByaXZhdGUgcmVuZGVyZXI6UElYSS5XZWJHTFJlbmRlcmVyXG4gIHByaXZhdGUgbWVzc2FnZTpQSVhJLlRleHRcbiAgcHJpdmF0ZSBzb3VuZE1hbmFnZXI6U291bmRNYW5hZ2VyID0gbmV3IFNvdW5kTWFuYWdlcihjb25maWcuc291bmRzKVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcihib2FyZExheW91dDpCb2FyZExheW91dCkge1xuICAgIHN1cGVyKClcbiAgICAvLyBUaGlzIGNyZWF0ZXMgdGhlIGZ1bGwtc2NyZWVuIGxheW91dCBhbmQgYWRkcyB0aGUgbWVzc2FnZSB0byB0aGUgaGVhZGVyXG4gICAgLy8gYW5kIGJ1dHRvbnMgdG8gdGhlIGZvb3RlclxuICAgIHRoaXMuc2V0dXBVSSgpXG4gICAgdGhpcy5zZXR1cEJvYXJkKGJvYXJkTGF5b3V0KVxuICAgIHRoaXMuc2V0dXBDaGVja2VycygpXG4gICAgLy8gQ3JlYXRlIGEgV2ViR0wgcmVuZGVyZXIgYXQgd2luZG93IGRpbWVuc2lvbnM7IGJlZ2luIHJlbmRlciBsb29wXG4gICAgdGhpcy5zdGFydFJlbmRlcmluZygpXG4gIH1cblxuICBwdWJsaWMgc2V0Qm9hcmRMYXlvdXQoYm9hcmRMYXlvdXQ6Qm9hcmRMYXlvdXQpOnZvaWQge1xuICAgIC8vIFN0b3AgYW55IG9uZ29pbmcgYW5pbWF0aW9uc1xuICAgIHRoaXMuc3RvcCgpXG4gICAgLy8gUmVzaXplIHRoZSBib2FyZCBhcyBuZWVkZWQgLSB0aGUgYm9hcmQgdGFrZXMgY2FyZSBvZiBjcmVhdGluZyBzcXVhcmVzXG4gICAgaWYodGhpcy5ib2FyZC5zaXplICE9PSBib2FyZExheW91dC5sZW5ndGgpXG4gICAgICB0aGlzLnJlc2l6ZShib2FyZExheW91dC5sZW5ndGgpXG4gICAgLy8gU2V0IHRoZSBhcnJvdyBkaXJlY3Rpb25zIG9uIHRoZSBib2FyZFxuICAgIHRoaXMuYm9hcmQuc2V0Qm9hcmRMYXlvdXQoYm9hcmRMYXlvdXQpXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBjaGVja2VycyBhcmUgb24gdG9wIG9mIGFueSBuZXcgc3F1YXJlc1xuICAgIHRoaXMuYm9hcmQudG9Ub3AodGhpcy5jaGVja2VyMSlcbiAgICB0aGlzLmJvYXJkLnRvVG9wKHRoaXMuY2hlY2tlcjIpXG4gIH1cblxuICAvLyBSZXNpemUgdGhlIGZpcnN0IGNoZWNrZXIgdG8gc2NhbGUgb25lLCBzaW5jZSBpdCBpcyBzaHJ1bmsgdG8gemVybyBzY2FsZVxuICAvLyB3aGVuIGEgc2ltdWxhdGlvbiBpcyBzdGFydGVkXG4gIHB1YmxpYyByZXN0YXJ0KCk6dm9pZCB7XG4gICAgdGhpcy5jaGVja2VyMS5zY2FsZS5zZXQoMSwgMSlcbiAgfVxuXG4gIC8vIFN0b3AgYW55IG9uZ29pbmcgYW5pbWF0aW9uc1xuICBwdWJsaWMgc3RvcCgpIHtcbiAgICBUd2VlbkxpdGUua2lsbFR3ZWVuc09mKHRoaXMuY2hlY2tlcjEucG9zaXRpb24pXG4gICAgVHdlZW5MaXRlLmtpbGxUd2VlbnNPZih0aGlzLmNoZWNrZXIxLnNjYWxlKVxuICAgIFR3ZWVuTGl0ZS5raWxsVHdlZW5zT2YodGhpcy5jaGVja2VyMi5wb3NpdGlvbilcbiAgfVxuXG4gIC8vIFNob3cgdGhlIGdpdmVuIHRleHQgYXQgc2NyZWVuIHRvcFxuICBwdWJsaWMgc2hvd01lc3NhZ2UobWVzc2FnZTpzdHJpbmcpOnZvaWQge1xuICAgIHRoaXMubWVzc2FnZS50ZXh0ID0gbWVzc2FnZVxuICB9XG5cbiAgLy8gUGxhY2UgdGhlIGdpdmVuIGNoZWNrZXIgYXQgdGhlIGdpdmVuIHBvc2l0aW9uLCB3aXRob3V0IGFuaW1hdGluZ1xuICBwdWJsaWMgcGxhY2VDaGVja2VyKG51bWJlcjpudW1iZXIsIHBvc2l0aW9uOkJvYXJkUG9zaXRpb24pIHtcbiAgICBjb25zdCBjaGVja2VyOlBJWEkuRGlzcGxheU9iamVjdCA9XG4gICAgICBudW1iZXIgPT09IDEgPyB0aGlzLmNoZWNrZXIxIDogdGhpcy5jaGVja2VyMlxuICAgIGNoZWNrZXIucG9zaXRpb24gPSB0aGlzLmJvYXJkLmJvYXJkUG9zaXRpb25Ub1BpeGVscyhwb3NpdGlvbilcbiAgfVxuXG4gIC8vIEFuaW1hdGUgbW92aW5nIHRoZSBjaGVja2VyIHRvIGEgbmV3IHBvc2l0aW9uXG4gIHB1YmxpYyBtb3ZlQ2hlY2tlcihudW1iZXI6bnVtYmVyLCBwb3NpdGlvbjpCb2FyZFBvc2l0aW9uKTp2b2lkIHtcbiAgICBjb25zdCBjaGVja2VyOlBJWEkuRGlzcGxheU9iamVjdCA9XG4gICAgICBudW1iZXIgPT09IDEgPyB0aGlzLmNoZWNrZXIxIDogdGhpcy5jaGVja2VyMlxuICAgIGNvbnN0IHBpeGVsUG9zaXRpb246UElYSS5Qb2ludCA9IHRoaXMuYm9hcmQuYm9hcmRQb3NpdGlvblRvUGl4ZWxzKHBvc2l0aW9uKVxuICAgIC8vIFVzZSB0aGUgR3JlZW5zb2NrIFR3ZWVuTGl0ZSBsaWJyYXJ5IHRvIGFuaW1hdGUgdGhlIG1vdmVtZW50XG4gICAgVHdlZW5MaXRlLnRvKFxuICAgICAgY2hlY2tlci5wb3NpdGlvbixcbiAgICAgIGNvbmZpZy5jaGVja2VyLm1vdmVUaW1lLFxuICAgICAge3g6IHBpeGVsUG9zaXRpb24ueCwgeTogcGl4ZWxQb3NpdGlvbi55fVxuICAgIClcbiAgICB0aGlzLnNvdW5kTWFuYWdlci5wbGF5KCdtb3ZlJylcbiAgfVxuXG4gIHB1YmxpYyBjb2xsaWRlKCkge1xuICAgIC8vIFNocmluayB0aGUgZmlyc3QgY2hlY2tlciB0byBzY2FsZSB6ZXJvXG4gICAgVHdlZW5MaXRlLnRvKHRoaXMuY2hlY2tlcjEuc2NhbGUsIC41LCB7eDogMCwgeTogMH0pXG4gICAgdGhpcy5zb3VuZE1hbmFnZXIucGxheSgnY29sbGlkZScpXG4gIH1cblxuICBwdWJsaWMgZmFsbCgpIHtcbiAgICAvLyBTaHJpbmsgdGhlIGZpcnN0IGNoZWNrZXIgdG8gc2NhbGUgemVyb1xuICAgIFR3ZWVuTGl0ZS50byh0aGlzLmNoZWNrZXIxLnNjYWxlLCAuNSwge3g6IDAsIHk6IDB9KVxuICAgIHRoaXMuc291bmRNYW5hZ2VyLnBsYXkoJ2ZhbGwnKVxuICB9XG5cbiAgcHJpdmF0ZSBzdGFydFJlbmRlcmluZygpOnZvaWQge1xuICAgIC8vIFRoZSBzY3JlZW5MYXlvdXQgY29udGFpbmVyIGlzIHBhc3NlZCBpbnRvIHJlbmRlcigpIGJ5IHJlbmRlckxvb3AoKVxuICAgIC8vIEl0IGNvbnRhaW5zIHRoZSBtZXNzYWdlLCB0aGUgYm9hcmQsIGFuZCB0aGUgYnV0dG9uc1xuICAgIC8vIFNldCB1cCB0aGUgcmVuZGVyZXIsIGFkZCB0aGUgY2FudmFzIHRvIHRoZSBwYWdlLCBhbmQgc3RhcnQgdGhlIHJlbmRlclxuICAgIC8vIGxvb3AgKHJlbmRlcnMgZXZlcnkgZnJhbWUgd2l0aCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgdGhpcy5yZW5kZXJlciA9XG4gICAgICBuZXcgUElYSS5XZWJHTFJlbmRlcmVyKFxuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsXG4gICAgICAgIC8vIFNtb290aCBlZGdlcyBvZiBjdXJ2ZXMgY3JlYXRlZCB3aXRoIFBJWEkuR3JhcGhpY3NcbiAgICAgICAge2FudGlhbGlhczogdHJ1ZX0pXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnJlbmRlcmVyLnZpZXcpXG4gICAgdGhpcy5yZW5kZXJMb29wKClcbiAgfVxuXG4gIC8vIEZhdCBhcnJvdyB0byBwcmVzZXJ2ZSBcInRoaXNcIlxuICBwcml2YXRlIHJlbmRlckxvb3AgPSAoKTp2b2lkID0+IHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5yZW5kZXJMb29wKVxuICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NyZWVuTGF5b3V0KVxuICB9XG5cbiAgLy8gQ3JlYXRlcyB0aGUgbWVzc2FnZSBhbmQgdGhlIGJ1dHRvbnMsIGFuZCBzZXQgdXAgdGhlIGV2ZW50IGhhbmRsaW5nXG4gIHByaXZhdGUgc2V0dXBVSSgpOnZvaWQge1xuICAgIHRoaXMubWVzc2FnZSA9IHRoaXMuY3JlYXRlTWVzc2FnZSgpXG4gICAgY29uc3QgaGVhZGVyOlBJWEkuQ29udGFpbmVyID0gbmV3IEhvcml6b250YWxDZW50ZXIoY29uZmlnLm1hcmdpbilcbiAgICBoZWFkZXIuYWRkQ2hpbGQodGhpcy5tZXNzYWdlKVxuICAgIGNvbnN0IGZvb3RlcjpQSVhJLkNvbnRhaW5lciA9IHRoaXMuY3JlYXRlQnV0dG9ucygpXG4gICAgdGhpcy5zY3JlZW5MYXlvdXQgPSBuZXcgRnVsbFNjcmVlbkhlYWRlckZvb3RlcihcbiAgICAgIG5ldyBIb3Jpem9udGFsQ2VudGVyKCksXG4gICAgICBoZWFkZXIsXG4gICAgICBmb290ZXIsXG4gICAgICBjb25maWcubWFyZ2luKVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVNZXNzYWdlKCk6UElYSS5UZXh0IHtcbiAgICAvLyBNZXNzYWdlIHRoYXQgYXBwZWFycyBvbiB0aGUgdG9wIG9mIHRoZSBzY3JlZW5cbiAgICAvLyBUaGUgbWVzc2FnZSB0ZXh0IGlzIHNldCBieSB0aGUgY29udHJvbGxlciB1c2luZyBzaG93TWVzc2FnZSgpXG4gICAgY29uc3QgbWVzc2FnZTpQSVhJLlRleHQgPSBuZXcgUElYSS5UZXh0KFxuICAgICAgJ1ByZXNzIFBsYXkgdG8gQmVnaW4nLFxuICAgICAgbmV3IFBJWEkuVGV4dFN0eWxlKHtcbiAgICAgICAgYWxpZ246IGNvbmZpZy5tZXNzYWdlLmFsaWduLFxuICAgICAgICBsaW5lSm9pbjogY29uZmlnLm1lc3NhZ2UubGluZUpvaW4sXG4gICAgICAgIGZpbGw6IGNvbmZpZy5tZXNzYWdlLmZpbGwubWFwKGNvbG9yID0+IFBJWEkudXRpbHMucmdiMmhleChjb2xvcikpLFxuICAgICAgICBzdHJva2U6IFBJWEkudXRpbHMucmdiMmhleChjb25maWcubWVzc2FnZS5zdHJva2UpLFxuICAgICAgICBzdHJva2VUaGlja25lc3M6IGNvbmZpZy5tZXNzYWdlLnN0cm9rZVRoaWNrbmVzc1xuICAgICAgfSlcbiAgICApXG4gICAgbWVzc2FnZS5hbmNob3Iuc2V0KC41KVxuICAgIG1lc3NhZ2UucG9zaXRpb24gPSBuZXcgUElYSS5Qb2ludCgwLCBjb25maWcubWVzc2FnZS5mcm9tVG9wKVxuICAgIHJldHVybiBtZXNzYWdlXG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUJ1dHRvbnMoKTpQSVhJLkNvbnRhaW5lciB7XG4gICAgY29uc3QgYnV0dG9ucyA9IG5ldyBIb3Jpem9udGFsQ2VudGVyKGNvbmZpZy5tYXJnaW4pXG4gICAgY29uc3QgYnV0dG9uVGV4dFN0eWxlOlBJWEkuVGV4dFN0eWxlID0gbmV3IFBJWEkuVGV4dFN0eWxlKHtcbiAgICAgIGFsaWduOiBjb25maWcuYnV0dG9uLnRleHQuYWxpZ24sXG4gICAgICBsaW5lSm9pbjogY29uZmlnLmJ1dHRvbi50ZXh0LmxpbmVKb2luLFxuICAgICAgZmlsbDogUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5idXR0b24udGV4dC5maWxsKSxcbiAgICAgIHN0cm9rZTogUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5idXR0b24udGV4dC5zdHJva2UpLFxuICAgICAgc3Ryb2tlVGhpY2tuZXNzOiBjb25maWcuYnV0dG9uLnRleHQuc3Ryb2tlVGhpY2tuZXNzXG4gICAgfSlcbiAgICBjb25zdCBidXR0b25TdHlsZTpCdXR0b25TdHlsZSA9IG5ldyBCdXR0b25TdHlsZShcbiAgICAgIGNvbmZpZy5idXR0b24ud2lkdGgsXG4gICAgICBjb25maWcuYnV0dG9uLmhlaWdodCxcbiAgICAgIGJ1dHRvblRleHRTdHlsZSxcbiAgICAgIFBJWEkudXRpbHMucmdiMmhleChjb25maWcuYnV0dG9uLmZpbGwpLFxuICAgICAgY29uZmlnLmJ1dHRvbi5zdHJva2VUaGlja25lc3MsXG4gICAgICBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmJ1dHRvbi5zdHJva2UpXG4gICAgKVxuICAgIGNvbnN0IHNtYWxsQnV0dG9uU3R5bGU6QnV0dG9uU3R5bGUgPSBuZXcgQnV0dG9uU3R5bGUoXG4gICAgICBjb25maWcuYnV0dG9uLndpZHRoIC8gMixcbiAgICAgIGNvbmZpZy5idXR0b24uaGVpZ2h0LFxuICAgICAgYnV0dG9uVGV4dFN0eWxlLFxuICAgICAgUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5idXR0b24uZmlsbCksXG4gICAgICBjb25maWcuYnV0dG9uLnN0cm9rZVRoaWNrbmVzcyxcbiAgICAgIFBJWEkudXRpbHMucmdiMmhleChjb25maWcuYnV0dG9uLnN0cm9rZSlcbiAgICApXG4gICAgLy8gUmVkdWNlIHRoZSBzaW11bGF0aW9uIHNpemUgYnkgb25lXG4gICAgY29uc3QgcmVzaXplRG93bkJ1dHRvbjpCdXR0b24gPSBuZXcgQnV0dG9uKCctJywgc21hbGxCdXR0b25TdHlsZSlcbiAgICByZXNpemVEb3duQnV0dG9uLm9uKCdwcmVzc2VkJywgKCkgPT4gdGhpcy5lbWl0KCdyZXNpemUnLCAtMSkpXG4gICAgYnV0dG9ucy5hZGRDaGlsZChyZXNpemVEb3duQnV0dG9uKVxuICAgIC8vIEluY3JlYXNlIHRoZSBzaW11bGF0aW9uIHNpemUgYnkgb25lXG4gICAgY29uc3QgcmVzaXplVXBCdXR0b246QnV0dG9uID0gbmV3IEJ1dHRvbignKycsIHNtYWxsQnV0dG9uU3R5bGUpXG4gICAgcmVzaXplVXBCdXR0b24ub24oJ3ByZXNzZWQnLCAoKSA9PiB0aGlzLmVtaXQoJ3Jlc2l6ZScsIDEpKVxuICAgIGJ1dHRvbnMuYWRkQ2hpbGQocmVzaXplVXBCdXR0b24pXG4gICAgLy8gU2h1ZmZsZSB0aGUgYXJyb3cgZGlyZWN0aW9uc1xuICAgIGNvbnN0IHNodWZmbGVCdXR0b246QnV0dG9uID0gbmV3IEJ1dHRvbignU2h1ZmZsZScsIGJ1dHRvblN0eWxlKVxuICAgIHNodWZmbGVCdXR0b24ub24oJ3ByZXNzZWQnLCAoKSA9PiB0aGlzLmVtaXQoJ3NodWZmbGUnKSlcbiAgICBidXR0b25zLmFkZENoaWxkKHNodWZmbGVCdXR0b24pXG4gICAgLy8gU3RhcnQgdGhlIHNpbXVsYXRpb247IHRoZSBjb250cm9sbGVyIHdpbGwgaGFuZGxlIGRlbGF5aW5nIHRoZVxuICAgIC8vIHNpbXVsYXRpb24ncyBpdGVyYXRvciB0byBhbGxvdyB0aGUgdmlzdWFsaXphdGlvbiB0aW1lIHRvIGFuaW1hdGVcbiAgICBjb25zdCBwbGF5QnV0dG9uOkJ1dHRvbiA9IG5ldyBCdXR0b24oJ1BsYXknLCBidXR0b25TdHlsZSlcbiAgICBwbGF5QnV0dG9uLm9uKCdwcmVzc2VkJywgKCkgPT4gdGhpcy5lbWl0KCdwbGF5JykpXG4gICAgYnV0dG9ucy5hZGRDaGlsZChwbGF5QnV0dG9uKVxuICAgIC8vIFN0b3AgdGhlIHNpbWx1YXRpb24gYW5kIG1vdmUgdGhlIGNoZWNrZXJzIGJhY2sgdG8gc3RhcnRpbmcgcG9zaXRpb25cbiAgICBjb25zdCBzdG9wQnV0dG9uOkJ1dHRvbiA9IG5ldyBCdXR0b24oJ1N0b3AnLCBidXR0b25TdHlsZSlcbiAgICBzdG9wQnV0dG9uLm9uKCdwcmVzc2VkJywgKCkgPT4gdGhpcy5lbWl0KCdzdG9wJykpXG4gICAgYnV0dG9ucy5hZGRDaGlsZChzdG9wQnV0dG9uKVxuICAgIHJldHVybiBidXR0b25zXG4gIH1cblxuICBwcml2YXRlIHNldHVwQm9hcmQoYm9hcmRMYXlvdXQ6Qm9hcmRMYXlvdXQpIHtcbiAgICAvLyBUQkQ6IE1vdmUgdGhpcyBzb3J0IG9mIGxvZ2ljIHRvIGxheW91dCBjb250YWluZXIgY2xhc3NcbiAgICBjb25zdCBib2FyZFBpeGVsU2l6ZTpudW1iZXIgPVxuICAgICAgTWF0aC5taW4odGhpcy5zY3JlZW5MYXlvdXQuYm9keVdpZHRoLCB0aGlzLnNjcmVlbkxheW91dC5ib2R5SGVpZ2h0KVxuICAgIC8vIFRoZSBib2FyZCB3aWxsIGNvbnRhaW4gdGhlIGNoZWNrZXJzIGFuZCBzcXVhcmVzXG4gICAgdGhpcy5zY3JlZW5MYXlvdXQuYWRkVG9Cb2R5KFxuICAgICAgdGhpcy5ib2FyZCA9IG5ldyBEaXJlY3RlZENoZWNrZXJCb2FyZChcbiAgICAgICAgYm9hcmRMYXlvdXQsXG4gICAgICAgIGJvYXJkUGl4ZWxTaXplLFxuICAgICAgICBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmJvYXJkLm9kZC5maWxsKSxcbiAgICAgICAgUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5ib2FyZC5ldmVuLmZpbGwpLFxuICAgICAgKVxuICAgIClcbiAgICB0aGlzLmJvYXJkLnBvc2l0aW9uID0gbmV3IFBJWEkuUG9pbnQoXG4gICAgICAwLFxuICAgICAgdGhpcy5zY3JlZW5MYXlvdXQuYm9keUhlaWdodCAvIDJcbiAgICApXG4gIH1cblxuICBwcml2YXRlIHNldHVwQ2hlY2tlcnMoKSB7XG4gICAgLy8gVGhlIGNoZWNrZXJzIGFyZSBjaGlsZHJlbiBvZiB0aGUgYm9hcmQgZm9yIHByb3BlciBwb3NpdGlvbmluZ1xuICAgIHRoaXMuYm9hcmQuYWRkQ2hpbGQodGhpcy5jaGVja2VyMSA9IG5ldyBDaGVja2VyKFxuICAgICAgdGhpcy5ib2FyZC5zcXVhcmVTaXplICogY29uZmlnLmNoZWNrZXIucmVsYXRpdmVTaXplLFxuICAgICAgLy8gU2VtaS10cmFuc3BhcmVudCBzbyB0aGF0IHRoZSBhcnJvd3MgY2FuIGJlIHNlZW5cbiAgICAgIGNvbmZpZy5jaGVja2VyLmFscGhhLFxuICAgICAgY29uZmlnLmNoZWNrZXIuc3Ryb2tlVGhpY2tuZXNzLFxuICAgICAgUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5jaGVja2VyLnN0cm9rZSksXG4gICAgICBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmNoZWNrZXIuZmlsbClcbiAgICApKVxuICAgIHRoaXMuYm9hcmQuYWRkQ2hpbGQodGhpcy5jaGVja2VyMiA9IG5ldyBDaGVja2VyKFxuICAgICAgdGhpcy5ib2FyZC5zcXVhcmVTaXplICogY29uZmlnLmNoZWNrZXIucmVsYXRpdmVTaXplLFxuICAgICAgLy8gU2VtaS10cmFuc3BhcmVudCBzbyB0aGF0IHRoZSBhcnJvd3MgY2FuIGJlIHNlZW5cbiAgICAgIGNvbmZpZy5jaGVja2VyLmFscGhhLFxuICAgICAgY29uZmlnLmNoZWNrZXIuc3Ryb2tlVGhpY2tuZXNzLFxuICAgICAgUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5jaGVja2VyLnN0cm9rZSksXG4gICAgICBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmNoZWNrZXIuZmlsbClcbiAgICApKVxuICB9XG5cbiAgcHJpdmF0ZSByZXNpemUoc2l6ZTpudW1iZXIpOnZvaWQge1xuICAgIC8vIENyZWF0ZSBzcXVhcmVzIGFzIG5lZWRlZCwgc2V0IHRoZWlyIHBvc2l0aW9uIGFuZCBjb2xvcixcbiAgICAvLyBhbmQgc2V0IGFsbCBhcnJvdyBkaXJlY3Rpb25zIGZyb20gdGhlIHNpbXVsYXRpb24gbGF5b3V0XG4gICAgdGhpcy5ib2FyZC5yZXNpemUoc2l6ZSlcbiAgICB0aGlzLmNoZWNrZXIxLnJlc2l6ZSh0aGlzLmJvYXJkLnNxdWFyZVNpemUgKiBjb25maWcuY2hlY2tlci5yZWxhdGl2ZVNpemUpXG4gICAgdGhpcy5jaGVja2VyMi5yZXNpemUodGhpcy5ib2FyZC5zcXVhcmVTaXplICogY29uZmlnLmNoZWNrZXIucmVsYXRpdmVTaXplKVxuICB9XG59XG4iXX0=
