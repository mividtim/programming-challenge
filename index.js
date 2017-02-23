(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jiboProgrammingChallenge = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path='../typings/index.d.ts' />
const fs = require("fs");
const simulation_1 = require("./simulation");
const types_1 = require("./types");
const visualization_1 = require("./visualization");
(function () {
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
    class Controller {
        constructor() {
            // Event handling callbacks need fat arrow to keep "this" context
            this.resize = (amount) => {
                this.stop();
                let boardSize = this.simulation.size + amount;
                if (boardSize < 1)
                    boardSize = 1;
                else if (boardSize > config.simulation.maxSize)
                    boardSize = config.simulation.maxSize;
                if (this.simulation.size !== boardSize) {
                    this.simulation.resize(boardSize, this.randomPosition(boardSize));
                    this.visualization.refresh();
                }
                this.visualization.restart();
                this.visualization.showMessage('Press Play to Begin');
            };
            // Event handling callbacks need fat arrow to keep "this" context
            this.shuffle = () => {
                this.stop();
                this.simulation.shuffle(this.randomPosition());
                this.visualization.refresh();
                this.visualization.restart();
                this.visualization.showMessage('Press Play to Begin');
            };
            // Event handling callbacks need fat arrow to keep "this" context
            this.play = () => {
                this.stop();
                this.visualization.showMessage('Running');
                this.next();
            };
            // Event handling callbacks need fat arrow to keep "this" context
            this.forceStop = () => {
                this.stop();
                this.visualization.showMessage('Stopped');
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
                else
                    this.simulationEnded();
            };
            // Fat arrow to preserve "this" in setTimeout call
            this.stop = () => {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = null;
                }
                this.simulation.restart();
                this.visualization.restart();
            };
            this.simulation = new simulation_1.Simulation(
            // Number of rows and columns for the simulation board
            config.simulation.initialSize, 
            // Starting position for the pointers
            this.randomPosition(config.simulation.initialSize), 
            // Called by the simulation whenever a point moves
            // (in order to animate it, perhaps)
            this.pointerMoved);
            this.visualization = new visualization_1.Visualization(this.simulation, 
            // Event handlers for the buttons
            this.play, this.forceStop, this.resize, this.shuffle);
        }
        simulationEnded() {
            let message;
            switch (this.simulation.state) {
                case 2 /* Noncircular */:
                    message = 'The path is noncircular.';
                    break;
                case 1 /* Circular */:
                    message = 'The path is circular.';
                    break;
            }
            this.visualization.endVisualization(this.simulation.state);
            this.visualization.showMessage(message);
            this.timeout = setTimeout(this.stop, config.visualization.moveTime);
        }
        randomPosition(size = 0) {
            if (size < 1)
                size = this.simulation.size;
            return new types_1.Position(Math.floor(Math.random() * size), Math.floor(Math.random() * size));
        }
    }
    new Controller();
})();

},{"./simulation":2,"./types":5,"./visualization":6,"fs":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class Simulation {
    constructor(size, startingPosition, onmove) {
        this.layout = [];
        // resize() will reset(), so set the starting position first
        this.startingPosition = startingPosition;
        // Set initial layout to the proper size; resize takes care of shuffling
        this.resize(size);
        // Call the controller back whenever a pointer moves, in case we're
        // visualizing
        this.onmove = onmove;
    }
    // When the simulation is resized, resize the layout data structure
    // and shuffle the board (an improvement could be to only randomize any "new"
    // positions)
    resize(size, startingPosition = null) {
        this.size = size;
        while (this.layout.length > size)
            this.layout.pop();
        while (size > this.layout.length)
            this.addRow(this.layout.length);
        this.shuffle(startingPosition);
    }
    // Set random values for each location on the board
    shuffle(startingPosition = null) {
        for (let row = 0; row < this.size; row++)
            for (let col = 0; col < this.size; col++)
                this.layout[row][col] = Math.floor(Math.random() * 4);
        if (startingPosition !== null)
            this.startingPosition = startingPosition;
        this.restart();
    }
    // Set the state to Running, and move the pointers back to starting position
    restart() {
        this.state = 0 /* Running */;
        this.pointerOnePosition = this.startingPosition;
        this.pointerTwoPosition = this.startingPosition;
        this.evenMove = false;
    }
    // The iterator, used by the controller to step through the simulation
    // An improvement might be to add a "run" method to Simulation, which
    // would run the entire simulation synchronously
    next() {
        this.onmove(1, this.pointerOnePosition = this.nextPosition(this.pointerOnePosition));
        this.determineState();
        // Have to check before moving the second pointer
        if (this.state === 0 /* Running */ && this.evenMove) {
            this.onmove(2, this.pointerTwoPosition = this.nextPosition(this.pointerTwoPosition));
            this.determineState();
        }
        this.evenMove = !this.evenMove;
    }
    addRow(row) {
        this.layout.push([]);
        for (let col = 0; col < this.size; col++)
            this.layout[row].push(0);
    }
    nextPosition(currentPosition) {
        const direction = this.layout[currentPosition.row][currentPosition.col];
        let nextPosition;
        switch (direction) {
            case 0 /* Up */:
                nextPosition =
                    new types_1.Position(currentPosition.row - 1, currentPosition.col);
                break;
            case 2 /* Down */:
                nextPosition =
                    new types_1.Position(currentPosition.row + 1, currentPosition.col);
                break;
            case 3 /* Left */:
                nextPosition =
                    new types_1.Position(currentPosition.row, currentPosition.col - 1);
                break;
            case 1 /* Right */:
                nextPosition =
                    new types_1.Position(currentPosition.row, currentPosition.col + 1);
                break;
        }
        return nextPosition;
    }
    determineState() {
        this.state =
            !this.validPosition(this.pointerOnePosition)
                ? 2 /* Noncircular */
                : this.samePosition(this.pointerOnePosition, this.pointerTwoPosition)
                    ? 1 /* Circular */
                    : 0 /* Running */;
    }
    validPosition(position) {
        return !(position.row < 0 ||
            position.row > this.size - 1 ||
            position.col < 0 ||
            position.col > this.size - 1);
    }
    samePosition(position1, position2) {
        return position1.row === position2.row && position1.col === position2.col;
    }
}
exports.Simulation = Simulation;

},{"./types":5}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const PIXI = require("pixi.js");
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8')).visualization;
class Square {
    constructor(visualization, position, even, direction = 0 /* Up */) {
        this.visualization = visualization;
        this.pixelSize = this.visualization.squareSize;
        this.position = position;
        this.even = even;
        // No need to keep track of direction - we can safely set rotation on every
        // reset
        this.createSquare();
        this.reset(this.even, direction);
    }
    reset(even, direction) {
        // If the pixel size or color of the square changes, recreate the square
        if (this.pixelSize !== this.visualization.squareSize
            || this.even !== even) {
            this.pixelSize = this.visualization.squareSize;
            this.even = even;
            // Recreate the square and arrow at the proper size and position
            this.destroy();
            this.createSquare();
        }
        // We can always safely set the rotation based on the direction without
        // keeping track of its previous position - no need to recreate it
        this.arrow.rotation = Math.PI / 2 * direction;
    }
    destroy() {
        this.square.removeChild(this.arrow);
        this.arrow.destroy();
        this.visualization.board.removeChild(this.square);
        this.square.destroy();
    }
    // We keep track of even/odd in an instance variable to see if we need to
    // recreate the square; I'd prefer to pass it, but hey we already have it
    createSquare() {
        this.square = new PIXI.Graphics();
        this.square.position =
            this.visualization.boardPositionToPixels(this.position);
        this.square.beginFill(PIXI.utils.rgb2hex(this.even
            ? config.square.even.fill
            : config.square.odd.fill));
        // Center it on the pixel position for the board position
        this.square.drawRect(-this.pixelSize / 2, -this.pixelSize / 2, this.pixelSize, this.pixelSize);
        this.square.endFill();
        this.createArrow();
        this.visualization.board.addChild(this.square);
    }
    // Arrow size is calculated relative to square size
    // Full of "magic numbers": TBD to move these to config
    createArrow() {
        // Currently, only its color is configurable, and no stroke
        this.arrow = new PIXI.Graphics();
        this.arrow.beginFill(PIXI.utils.rgb2hex(config.arrow.fill));
        // The body of the arrow
        this.arrow.drawRect(-this.visualization.squareSize / 12, -this.visualization.squareSize * .2, this.visualization.squareSize / 6, this.visualization.squareSize * .6);
        // The arrowhead
        this.arrow.drawPolygon([
            new PIXI.Point(0, -this.visualization.squareSize * .4),
            new PIXI.Point(-this.visualization.squareSize * .25, -this.visualization.squareSize * .1),
            new PIXI.Point(this.visualization.squareSize * .25, -this.visualization.squareSize * .1)
        ]);
        this.arrow.endFill();
        // The reset() instance method sets the arrow's rotation on a
        // resize or shuffle; no need to set it here
        this.square.addChild(this.arrow);
    }
}
exports.Square = Square;

},{"fs":undefined,"pixi.js":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Position {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
}
exports.Position = Position;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const PIXI = require("pixi.js");
const TweenLite_1 = require("gsap/TweenLite");
const types_1 = require("./types");
const sound_manager_1 = require("./sound-manager");
const square_1 = require("./square");
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8')).visualization;
class Visualization {
    constructor(simulation, onplay, onstop, onresize, onshuffle) {
        this.squares = [];
        this.soundManager = new sound_manager_1.SoundManager(config.sounds);
        // Fat arrow to preserve "this"
        this.renderLoop = () => {
            requestAnimationFrame(this.renderLoop);
            this.renderer.render(this.stage);
        };
        // Keep a copy of the simulation for reference by instance methods
        this.simulation = simulation;
        // Set up the button event handlers to we can tell the controller when
        // they're pressed
        this.onplay = onplay;
        this.onstop = onstop;
        this.onresize = onresize;
        this.onshuffle = onshuffle;
        // The root stage container is passed into render() by renderLoop()
        // It will contain the message, the board, and the buttons
        this.stage = new PIXI.Container();
        // Set up the renderer, add the canvas to the page, and start the render
        // loop (renders every frame with requestAnimationFrame)
        this.renderer =
            new PIXI.WebGLRenderer(document.documentElement.clientWidth, document.documentElement.clientHeight, { antialias: true });
        document.body.appendChild(this.renderer.view);
        this.renderLoop();
        // This adds the message and buttons to the stage
        this.createUI();
        // The board will contain the checkers and squares
        this.stage.addChild(this.board = new PIXI.Container());
        this.board.position = new PIXI.Point(this.renderer.width / 2, this.renderer.height / 2 - config.button.height / 2);
        // refresh() adds the squares, and their arrows, to the board
        // It will add squares of the appropriate size and position themselves to
        // fill the simulation size. It will also destroy extra squares when the
        // simulation is downsized.
        this.refresh();
        // restart() moves the checkers to the starting position and places them
        // on top of all board squares (including new ones)
        this.restart();
    }
    refresh() {
        // Determine the square size based on the window size and simulation size
        const boardSize = Math.min(this.renderer.width, this.renderer.height)
            - this.message.height
            - config.button.height
            - config.button.fromBottom
            - config.message.fromTop
            - config.margin * 2;
        this.squareSize = boardSize / this.simulation.size;
        if (this.checker1) {
            this.board.removeChild(this.checker1);
            this.board.removeChild(this.checker2);
            this.checker1.destroy();
            this.checker2.destroy();
        }
        // The checkers are children of the board so they can be positioned
        // using the same routine as the squares, boardPositionToPixels()
        this.checker1 = this.createChecker();
        this.checker2 = this.createChecker();
        // Delete any squares that exceed the current simulation layout size
        this.shrinkBoardAsNeeded();
        // Create squares as needed, set their position and color,
        // and set all arrow directions from the simulation layout
        this.setupBoard();
    }
    restart() {
        // Stop any ongoing animations
        TweenLite_1.TweenLite.killTweensOf(this.checker1.position);
        TweenLite_1.TweenLite.killTweensOf(this.checker1.scale);
        TweenLite_1.TweenLite.killTweensOf(this.checker2.position);
        // Move the checkers to the simulation starting positions
        const pixelPosition = this.boardPositionToPixels(this.simulation.startingPosition);
        this.checker1.position = pixelPosition;
        this.checker2.position = pixelPosition;
        this.board.removeChild(this.checker1);
        this.board.removeChild(this.checker2);
        this.board.addChild(this.checker1);
        this.board.addChild(this.checker2);
        // Resize the first checker to scale one, since it is shrunk to zero scale
        // when a simulation is completed
        this.checker1.scale.set(1, 1);
    }
    // Called by the controller to set the appropriate text at screen top
    showMessage(message) {
        this.message.text = message;
    }
    // Called by the controller to move the checker to a new position
    moveChecker(number, position) {
        const checker = number === 1 ? this.checker1 : this.checker2;
        const pixelPosition = this.boardPositionToPixels(position);
        // Use the Greensock TweenLite library to animate the movement
        TweenLite_1.TweenLite.to(checker.position, config.checker.moveTime, { x: pixelPosition.x, y: pixelPosition.y });
        this.soundManager.play('move');
    }
    // Called by the controller when the simulation ends
    // The state is a determination of whether or not the path is circular
    endVisualization(state) {
        // Shrink the first checker to scale zero
        TweenLite_1.TweenLite.to(this.checker1.scale, .5, { x: 0, y: 0 });
        // Play collision or fall sound
        switch (state) {
            case 1 /* Circular */:
                this.soundManager.play('collide');
                break;
            case 2 /* Noncircular */:
                this.soundManager.play('fall');
                break;
        }
    }
    boardPositionToPixels(boardPosition) {
        return new PIXI.Point((boardPosition.col - this.simulation.size / 2) * this.squareSize + this.squareSize / 2, (boardPosition.row - this.simulation.size / 2) * this.squareSize + this.squareSize / 2);
    }
    // Creates the message and the buttons, and set up the event handling
    // The positioning could certainly use some enhancement - TDB
    // Dynamically centering them as they are added to a container, for example
    createUI() {
        const positionY = this.renderer.height - config.button.fromBottom - config.button.height / 2;
        // Resize+ Button
        // Reduce the simulation size by one when pressed
        this.createButton(new PIXI.Point(this.renderer.width / 2
            - config.button.width * 1.5
            - config.margin * 1.5, positionY), '-', () => this.onresize(-1), true // small button
        );
        // Resize- Button
        // Increase the simulation size by one when pressed
        this.createButton(new PIXI.Point(this.renderer.width / 2 - config.button.width * 2 - config.margin, positionY), '+', () => this.onresize(1), true // small button
        );
        // Shuffle Button
        // Shuffle the arrow directions
        this.createButton(new PIXI.Point(this.renderer.width / 2 - config.button.width / 2 - config.margin / 2, positionY), 'Shuffle', this.onshuffle);
        // Play Button
        // Start the simulation; the controller will handle delaying the
        // simulation's iterator to allow the visualization time to animate
        this.createButton(new PIXI.Point(this.renderer.width / 2 + config.button.width / 2 + config.margin / 2, positionY), 'Play', this.onplay);
        // Stop Button
        // Stop the simluation and move the checkers back to starting position
        this.createButton(new PIXI.Point(this.renderer.width / 2 + config.button.width * 1.5 + config.margin, positionY), 'Stop', this.onstop);
        // Message that appears on the top of the screen
        // The message text is set by the controller using showMessage()
        this.stage.addChild(this.message = new PIXI.Text('Press Play to Begin', {
            align: config.message.align,
            lineJoin: config.message.lineJoin,
            fill: config.message.fill.map(color => PIXI.utils.rgb2hex(color)),
            stroke: PIXI.utils.rgb2hex(config.message.stroke),
            strokeThickness: config.message.strokeThickness
        }));
        this.message.anchor.set(.5, 0);
        this.message.position = new PIXI.Point(this.renderer.width / 2, config.message.fromTop);
    }
    createButton(position, label, action, small = false) {
        const button = new PIXI.Graphics();
        // Small buttons are half the configured width
        const width = config.button.width * (small ? .5 : 1);
        // Center the button at the given position
        // Keeps centering of text simpler than moving top/left of drawRect
        button.position = new PIXI.Point(position.x - width / 2, position.y - config.button.height / 2);
        // Set the styles from the config and draw to configured size
        button.lineStyle(config.button.strokeThickness, PIXI.utils.rgb2hex(config.button.stroke));
        button.beginFill(PIXI.utils.rgb2hex(config.button.fill));
        button.drawRect(0, 0, width, config.button.height);
        button.endFill();
        // Add styled button text
        const text = new PIXI.Text(label, {
            align: config.button.text.align,
            lineJoin: config.button.text.lineJoin,
            fill: PIXI.utils.rgb2hex(config.button.text.fill),
            stroke: PIXI.utils.rgb2hex(config.button.text.stroke),
            strokeThickness: config.button.text.strokeThickness
        });
        // Center the text on the button
        text.position = new PIXI.Point(width / 2, config.button.height / 2);
        text.anchor.set(.5);
        button.addChild(text);
        // Set up the event handlers
        button.interactive = true;
        button.on('mouseup', action);
        button.on('touchend', action);
        this.stage.addChild(button);
        return button;
    }
    createChecker() {
        const checker = new PIXI.Graphics();
        // Semi-transparent so that the arrows can be seen
        checker.alpha = config.checker.alpha;
        checker.lineStyle(config.checker.strokeThickness, PIXI.utils.rgb2hex(config.checker.stroke));
        checker.beginFill(PIXI.utils.rgb2hex(config.checker.fill));
        // Set scale relative to square size
        checker.drawCircle(0, 0, this.squareSize * config.checker.relativeSize);
        checker.endFill();
        this.board.addChild(checker);
        return checker;
    }
    shrinkBoardAsNeeded() {
        // Destroy extra board positions if the new layout is smaller than the
        // last board
        while (this.squares.length > this.simulation.size) {
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
    setupBoard() {
        // even tracks the alternating square colors
        let even = false;
        // Iterate over the board positions for the given board size
        for (let row = 0; row < this.simulation.size; row++) {
            // Add the row if our board isn't that big yet
            if (row > this.squares.length - 1)
                this.squares.push([]);
            for (let col = 0; col < this.simulation.size; col++) {
                const position = new types_1.Position(row, col);
                // The simulation layout gives us the arrow direction to draw
                const direction = this.simulation.layout[row][col];
                this.setupSquare(position, even, direction);
                // Stagger the square colors
                even = !even;
            }
            // For even-sized boards, have to stagger the square colors back
            if (this.simulation.size % 2 === 0)
                even = !even;
        }
    }
    setupSquare(position, even, direction) {
        // If we don't yet have a square for this position, create it
        if (position.col > this.squares[position.row].length - 1) {
            this.squares[position.row].push(new square_1.Square(this, position, even, direction));
        }
        else {
            this.squares[position.row][position.col].reset(even, direction);
        }
    }
}
exports.Visualization = Visualization;

},{"./sound-manager":3,"./square":4,"./types":5,"fs":undefined,"gsap/TweenLite":undefined,"pixi.js":undefined}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXgudHMiLCJzcmMvc2ltdWxhdGlvbi50cyIsInNyYy9zb3VuZC1tYW5hZ2VyLnRzIiwic3JjL3NxdWFyZS50cyIsInNyYy90eXBlcy50cyIsInNyYy92aXN1YWxpemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSw4Q0FBOEM7QUFDOUMseUJBQXdCO0FBQ3hCLDZDQUF1QztBQUN2QyxtQ0FBaUQ7QUFDakQsbURBQTZDO0FBRTdDLENBQUM7SUFFQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFFcEU7UUFNRTtZQW9CQSxpRUFBaUU7WUFDekQsV0FBTSxHQUFHLENBQUMsTUFBYTtnQkFDN0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO2dCQUNYLElBQUksU0FBUyxHQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQTtnQkFDcEQsRUFBRSxDQUFBLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztvQkFDZixTQUFTLEdBQUcsQ0FBQyxDQUFBO2dCQUNmLElBQUksQ0FBQyxFQUFFLENBQUEsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7b0JBQzVDLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQTtnQkFDdkMsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtvQkFDakUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FB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Q0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDakUsQ0FBQztJQUNILENBQUM7Q0FPRjtBQTdWRCxzQ0E2VkMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vdHlwaW5ncy9pbmRleC5kLnRzJyAvPlxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnXG5pbXBvcnQge1NpbXVsYXRpb259IGZyb20gJy4vc2ltdWxhdGlvbidcbmltcG9ydCB7UG9zaXRpb24sIFNpbXVsYXRpb25TdGF0ZX0gZnJvbSAnLi90eXBlcydcbmltcG9ydCB7VmlzdWFsaXphdGlvbn0gZnJvbSAnLi92aXN1YWxpemF0aW9uJ1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoJy4vY29uZmlnLmpzb24nLCAndXRmLTgnKSlcblxuICBjbGFzcyBDb250cm9sbGVyIHtcblxuICAgIHByaXZhdGUgc2ltdWxhdGlvbjpTaW11bGF0aW9uXG4gICAgcHJpdmF0ZSB2aXN1YWxpemF0aW9uOlZpc3VhbGl6YXRpb25cbiAgICBwcml2YXRlIHRpbWVvdXQ6bnVtYmVyXG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgICB0aGlzLnNpbXVsYXRpb24gPSBuZXcgU2ltdWxhdGlvbihcbiAgICAgICAgLy8gTnVtYmVyIG9mIHJvd3MgYW5kIGNvbHVtbnMgZm9yIHRoZSBzaW11bGF0aW9uIGJvYXJkXG4gICAgICAgIGNvbmZpZy5zaW11bGF0aW9uLmluaXRpYWxTaXplLFxuICAgICAgICAvLyBTdGFydGluZyBwb3NpdGlvbiBmb3IgdGhlIHBvaW50ZXJzXG4gICAgICAgIHRoaXMucmFuZG9tUG9zaXRpb24oY29uZmlnLnNpbXVsYXRpb24uaW5pdGlhbFNpemUpLFxuICAgICAgICAvLyBDYWxsZWQgYnkgdGhlIHNpbXVsYXRpb24gd2hlbmV2ZXIgYSBwb2ludCBtb3Zlc1xuICAgICAgICAvLyAoaW4gb3JkZXIgdG8gYW5pbWF0ZSBpdCwgcGVyaGFwcylcbiAgICAgICAgdGhpcy5wb2ludGVyTW92ZWRcbiAgICAgIClcbiAgICAgIHRoaXMudmlzdWFsaXphdGlvbiA9IG5ldyBWaXN1YWxpemF0aW9uKFxuICAgICAgICB0aGlzLnNpbXVsYXRpb24sXG4gICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzIGZvciB0aGUgYnV0dG9uc1xuICAgICAgICB0aGlzLnBsYXksXG4gICAgICAgIHRoaXMuZm9yY2VTdG9wLFxuICAgICAgICB0aGlzLnJlc2l6ZSxcbiAgICAgICAgdGhpcy5zaHVmZmxlXG4gICAgICApXG4gICAgfVxuXG4gICAgLy8gRXZlbnQgaGFuZGxpbmcgY2FsbGJhY2tzIG5lZWQgZmF0IGFycm93IHRvIGtlZXAgXCJ0aGlzXCIgY29udGV4dFxuICAgIHByaXZhdGUgcmVzaXplID0gKGFtb3VudDpudW1iZXIpOnZvaWQgPT4ge1xuICAgICAgdGhpcy5zdG9wKClcbiAgICAgIGxldCBib2FyZFNpemU6bnVtYmVyID0gdGhpcy5zaW11bGF0aW9uLnNpemUgKyBhbW91bnRcbiAgICAgIGlmKGJvYXJkU2l6ZSA8IDEpXG4gICAgICAgIGJvYXJkU2l6ZSA9IDFcbiAgICAgIGVsc2UgaWYoYm9hcmRTaXplID4gY29uZmlnLnNpbXVsYXRpb24ubWF4U2l6ZSlcbiAgICAgICAgYm9hcmRTaXplID0gY29uZmlnLnNpbXVsYXRpb24ubWF4U2l6ZVxuICAgICAgaWYodGhpcy5zaW11bGF0aW9uLnNpemUgIT09IGJvYXJkU2l6ZSkge1xuICAgICAgICB0aGlzLnNpbXVsYXRpb24ucmVzaXplKGJvYXJkU2l6ZSwgdGhpcy5yYW5kb21Qb3NpdGlvbihib2FyZFNpemUpKVxuICAgICAgICB0aGlzLnZpc3VhbGl6YXRpb24ucmVmcmVzaCgpXG4gICAgICB9XG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24ucmVzdGFydCgpXG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2hvd01lc3NhZ2UoJ1ByZXNzIFBsYXkgdG8gQmVnaW4nKVxuICAgIH1cblxuICAgIC8vIEV2ZW50IGhhbmRsaW5nIGNhbGxiYWNrcyBuZWVkIGZhdCBhcnJvdyB0byBrZWVwIFwidGhpc1wiIGNvbnRleHRcbiAgICBwcml2YXRlIHNodWZmbGUgPSAoKTp2b2lkID0+IHtcbiAgICAgIHRoaXMuc3RvcCgpXG4gICAgICB0aGlzLnNpbXVsYXRpb24uc2h1ZmZsZSh0aGlzLnJhbmRvbVBvc2l0aW9uKCkpXG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24ucmVmcmVzaCgpXG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24ucmVzdGFydCgpXG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2hvd01lc3NhZ2UoJ1ByZXNzIFBsYXkgdG8gQmVnaW4nKVxuICAgIH1cblxuICAgIC8vIEV2ZW50IGhhbmRsaW5nIGNhbGxiYWNrcyBuZWVkIGZhdCBhcnJvdyB0byBrZWVwIFwidGhpc1wiIGNvbnRleHRcbiAgICBwcml2YXRlIHBsYXkgPSAoKTp2b2lkID0+IHtcbiAgICAgIHRoaXMuc3RvcCgpXG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2hvd01lc3NhZ2UoJ1J1bm5pbmcnKVxuICAgICAgdGhpcy5uZXh0KClcbiAgICB9XG5cbiAgICAvLyBFdmVudCBoYW5kbGluZyBjYWxsYmFja3MgbmVlZCBmYXQgYXJyb3cgdG8ga2VlcCBcInRoaXNcIiBjb250ZXh0XG4gICAgcHJpdmF0ZSBmb3JjZVN0b3AgPSAoKTp2b2lkID0+IHtcbiAgICAgIHRoaXMuc3RvcCgpXG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2hvd01lc3NhZ2UoJ1N0b3BwZWQnKVxuICAgIH1cblxuICAgIC8vIEV2ZW50IGhhbmRsaW5nIGNhbGxiYWNrcyBuZWVkIGZhdCBhcnJvdyB0byBrZWVwIFwidGhpc1wiIGNvbnRleHRcbiAgICBwcml2YXRlIHBvaW50ZXJNb3ZlZCA9IChudW1iZXI6bnVtYmVyLCBwb3NpdGlvbjpQb3NpdGlvbikgPT4ge1xuICAgICAgdGhpcy52aXN1YWxpemF0aW9uLm1vdmVDaGVja2VyKG51bWJlciwgcG9zaXRpb24pXG4gICAgfVxuXG4gICAgLy8gRmF0IGFycm93IHRvIHByZXNlcnZlIFwidGhpc1wiIGluIHNldFRpbWVvdXRcbiAgICBwcml2YXRlIG5leHQgPSAoKTp2b2lkID0+IHtcbiAgICAgIHRoaXMuc2ltdWxhdGlvbi5uZXh0KClcbiAgICAgIGlmKHRoaXMuc2ltdWxhdGlvbi5zdGF0ZSA9PT0gU2ltdWxhdGlvblN0YXRlLlJ1bm5pbmcpXG4gICAgICAgIC8vIERlbGF5IGZvciB0aGUgYW5pbWF0aW9uIHRvIGZpbmlzaCwgYW5kIHRyYWNrIHRoZSB0aW1lb3V0IHNvIHdlXG4gICAgICAgIC8vIGNhbiBzdG9wIGl0IG9uIGRlbWFuZFxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMubmV4dCwgY29uZmlnLnZpc3VhbGl6YXRpb24ubW92ZVRpbWUpXG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuc2ltdWxhdGlvbkVuZGVkKClcbiAgICB9XG5cbiAgICBwcml2YXRlIHNpbXVsYXRpb25FbmRlZCgpOnZvaWQge1xuICAgICAgbGV0IG1lc3NhZ2U6c3RyaW5nXG4gICAgICBzd2l0Y2godGhpcy5zaW11bGF0aW9uLnN0YXRlKSB7XG4gICAgICAgIGNhc2UgU2ltdWxhdGlvblN0YXRlLk5vbmNpcmN1bGFyOlxuICAgICAgICAgIG1lc3NhZ2UgPSAnVGhlIHBhdGggaXMgbm9uY2lyY3VsYXIuJ1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgU2ltdWxhdGlvblN0YXRlLkNpcmN1bGFyOlxuICAgICAgICAgIG1lc3NhZ2UgPSAnVGhlIHBhdGggaXMgY2lyY3VsYXIuJ1xuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24uZW5kVmlzdWFsaXphdGlvbih0aGlzLnNpbXVsYXRpb24uc3RhdGUpXG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24uc2hvd01lc3NhZ2UobWVzc2FnZSlcbiAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQodGhpcy5zdG9wLCBjb25maWcudmlzdWFsaXphdGlvbi5tb3ZlVGltZSlcbiAgICB9XG5cbiAgICAvLyBGYXQgYXJyb3cgdG8gcHJlc2VydmUgXCJ0aGlzXCIgaW4gc2V0VGltZW91dCBjYWxsXG4gICAgcHJpdmF0ZSBzdG9wID0gKCkgPT4ge1xuICAgICAgaWYodGhpcy50aW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgICAgIHRoaXMudGltZW91dCA9IG51bGxcbiAgICAgIH1cbiAgICAgIHRoaXMuc2ltdWxhdGlvbi5yZXN0YXJ0KClcbiAgICAgIHRoaXMudmlzdWFsaXphdGlvbi5yZXN0YXJ0KClcbiAgICB9XG5cbiAgICBwcml2YXRlIHJhbmRvbVBvc2l0aW9uKHNpemU6bnVtYmVyID0gMCk6UG9zaXRpb24ge1xuICAgICAgaWYoc2l6ZSA8IDEpXG4gICAgICAgIHNpemUgPSB0aGlzLnNpbXVsYXRpb24uc2l6ZVxuICAgICAgcmV0dXJuIG5ldyBQb3NpdGlvbihcbiAgICAgICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBzaXplKSxcbiAgICAgICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBzaXplKVxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIG5ldyBDb250cm9sbGVyKClcblxufSkoKVxuIiwiaW1wb3J0IHtMYXlvdXQsIFBvc2l0aW9uLCBEaXJlY3Rpb24sIFNpbXVsYXRpb25TdGF0ZX0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGNsYXNzIFNpbXVsYXRpb24ge1xuXG4gIHNpemU6bnVtYmVyXG4gIGxheW91dDpMYXlvdXQgPSBbXVxuICBzdGFydGluZ1Bvc2l0aW9uOlBvc2l0aW9uXG4gIHN0YXRlOlNpbXVsYXRpb25TdGF0ZVxuICBwb2ludGVyT25lUG9zaXRpb246UG9zaXRpb25cbiAgcG9pbnRlclR3b1Bvc2l0aW9uOlBvc2l0aW9uXG4gIGV2ZW5Nb3ZlOmJvb2xlYW5cbiAgb25tb3ZlOihudW1iZXIsUG9zaXRpb24pPT52b2lkXG4gIG9uZW5kOihTaW11bGF0aW9uU3RhdGUpPT52b2lkXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHNpemU6bnVtYmVyLFxuICAgIHN0YXJ0aW5nUG9zaXRpb246UG9zaXRpb24sXG4gICAgb25tb3ZlOihudW1iZXIsUG9zaXRpb24pPT52b2lkXG4gICkge1xuICAgIC8vIHJlc2l6ZSgpIHdpbGwgcmVzZXQoKSwgc28gc2V0IHRoZSBzdGFydGluZyBwb3NpdGlvbiBmaXJzdFxuICAgIHRoaXMuc3RhcnRpbmdQb3NpdGlvbiA9IHN0YXJ0aW5nUG9zaXRpb25cbiAgICAvLyBTZXQgaW5pdGlhbCBsYXlvdXQgdG8gdGhlIHByb3BlciBzaXplOyByZXNpemUgdGFrZXMgY2FyZSBvZiBzaHVmZmxpbmdcbiAgICB0aGlzLnJlc2l6ZShzaXplKVxuICAgIC8vIENhbGwgdGhlIGNvbnRyb2xsZXIgYmFjayB3aGVuZXZlciBhIHBvaW50ZXIgbW92ZXMsIGluIGNhc2Ugd2UncmVcbiAgICAvLyB2aXN1YWxpemluZ1xuICAgIHRoaXMub25tb3ZlID0gb25tb3ZlXG4gIH1cblxuICAvLyBXaGVuIHRoZSBzaW11bGF0aW9uIGlzIHJlc2l6ZWQsIHJlc2l6ZSB0aGUgbGF5b3V0IGRhdGEgc3RydWN0dXJlXG4gIC8vIGFuZCBzaHVmZmxlIHRoZSBib2FyZCAoYW4gaW1wcm92ZW1lbnQgY291bGQgYmUgdG8gb25seSByYW5kb21pemUgYW55IFwibmV3XCJcbiAgLy8gcG9zaXRpb25zKVxuICBwdWJsaWMgcmVzaXplKHNpemU6bnVtYmVyLCBzdGFydGluZ1Bvc2l0aW9uOlBvc2l0aW9uID0gbnVsbCk6dm9pZCB7XG4gICAgdGhpcy5zaXplID0gc2l6ZVxuICAgIHdoaWxlKHRoaXMubGF5b3V0Lmxlbmd0aCA+IHNpemUpXG4gICAgICB0aGlzLmxheW91dC5wb3AoKVxuICAgIHdoaWxlKHNpemUgPiB0aGlzLmxheW91dC5sZW5ndGgpXG4gICAgICB0aGlzLmFkZFJvdyh0aGlzLmxheW91dC5sZW5ndGgpXG4gICAgdGhpcy5zaHVmZmxlKHN0YXJ0aW5nUG9zaXRpb24pXG4gIH1cblxuICAvLyBTZXQgcmFuZG9tIHZhbHVlcyBmb3IgZWFjaCBsb2NhdGlvbiBvbiB0aGUgYm9hcmRcbiAgcHVibGljIHNodWZmbGUoc3RhcnRpbmdQb3NpdGlvbjpQb3NpdGlvbiA9IG51bGwpOnZvaWQge1xuICAgIGZvcihsZXQgcm93Om51bWJlciA9IDAgOyByb3cgPCB0aGlzLnNpemUgOyByb3crKylcbiAgICAgIGZvcihsZXQgY29sOm51bWJlciA9IDAgOyBjb2wgPCB0aGlzLnNpemUgOyBjb2wrKylcbiAgICAgICAgdGhpcy5sYXlvdXRbcm93XVtjb2xdID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNClcbiAgICBpZihzdGFydGluZ1Bvc2l0aW9uICE9PSBudWxsKVxuICAgICAgdGhpcy5zdGFydGluZ1Bvc2l0aW9uID0gc3RhcnRpbmdQb3NpdGlvblxuICAgIHRoaXMucmVzdGFydCgpXG4gIH1cblxuICAvLyBTZXQgdGhlIHN0YXRlIHRvIFJ1bm5pbmcsIGFuZCBtb3ZlIHRoZSBwb2ludGVycyBiYWNrIHRvIHN0YXJ0aW5nIHBvc2l0aW9uXG4gIHB1YmxpYyByZXN0YXJ0KCk6dm9pZCB7XG4gICAgdGhpcy5zdGF0ZSA9IFNpbXVsYXRpb25TdGF0ZS5SdW5uaW5nXG4gICAgdGhpcy5wb2ludGVyT25lUG9zaXRpb24gPSB0aGlzLnN0YXJ0aW5nUG9zaXRpb25cbiAgICB0aGlzLnBvaW50ZXJUd29Qb3NpdGlvbiA9IHRoaXMuc3RhcnRpbmdQb3NpdGlvblxuICAgIHRoaXMuZXZlbk1vdmUgPSBmYWxzZVxuICB9XG5cbiAgLy8gVGhlIGl0ZXJhdG9yLCB1c2VkIGJ5IHRoZSBjb250cm9sbGVyIHRvIHN0ZXAgdGhyb3VnaCB0aGUgc2ltdWxhdGlvblxuICAvLyBBbiBpbXByb3ZlbWVudCBtaWdodCBiZSB0byBhZGQgYSBcInJ1blwiIG1ldGhvZCB0byBTaW11bGF0aW9uLCB3aGljaFxuICAvLyB3b3VsZCBydW4gdGhlIGVudGlyZSBzaW11bGF0aW9uIHN5bmNocm9ub3VzbHlcbiAgcHVibGljIG5leHQoKTp2b2lkIHtcbiAgICB0aGlzLm9ubW92ZShcbiAgICAgIDEsXG4gICAgICB0aGlzLnBvaW50ZXJPbmVQb3NpdGlvbiA9IHRoaXMubmV4dFBvc2l0aW9uKHRoaXMucG9pbnRlck9uZVBvc2l0aW9uKVxuICAgIClcbiAgICB0aGlzLmRldGVybWluZVN0YXRlKClcbiAgICAvLyBIYXZlIHRvIGNoZWNrIGJlZm9yZSBtb3ZpbmcgdGhlIHNlY29uZCBwb2ludGVyXG4gICAgaWYodGhpcy5zdGF0ZSA9PT0gU2ltdWxhdGlvblN0YXRlLlJ1bm5pbmcgJiYgdGhpcy5ldmVuTW92ZSkge1xuICAgICAgdGhpcy5vbm1vdmUoXG4gICAgICAgIDIsXG4gICAgICAgIHRoaXMucG9pbnRlclR3b1Bvc2l0aW9uID0gdGhpcy5uZXh0UG9zaXRpb24odGhpcy5wb2ludGVyVHdvUG9zaXRpb24pXG4gICAgICApXG4gICAgICB0aGlzLmRldGVybWluZVN0YXRlKClcbiAgICB9XG4gICAgdGhpcy5ldmVuTW92ZSA9ICF0aGlzLmV2ZW5Nb3ZlXG4gIH1cblxuICBwcml2YXRlIGFkZFJvdyhyb3c6bnVtYmVyKTp2b2lkIHtcbiAgICB0aGlzLmxheW91dC5wdXNoKFtdKVxuICAgIGZvcihsZXQgY29sOm51bWJlciA9IDAgOyBjb2wgPCB0aGlzLnNpemUgOyBjb2wrKylcbiAgICAgIHRoaXMubGF5b3V0W3Jvd10ucHVzaCgwKVxuICB9XG5cbiAgcHJpdmF0ZSBuZXh0UG9zaXRpb24oY3VycmVudFBvc2l0aW9uOlBvc2l0aW9uKTpQb3NpdGlvbiB7XG4gICAgY29uc3QgZGlyZWN0aW9uOkRpcmVjdGlvbiA9XG4gICAgICB0aGlzLmxheW91dFtjdXJyZW50UG9zaXRpb24ucm93XVtjdXJyZW50UG9zaXRpb24uY29sXVxuICAgIGxldCBuZXh0UG9zaXRpb246UG9zaXRpb25cbiAgICBzd2l0Y2goZGlyZWN0aW9uKSB7XG4gICAgICBjYXNlIERpcmVjdGlvbi5VcDpcbiAgICAgICAgbmV4dFBvc2l0aW9uID1cbiAgICAgICAgICBuZXcgUG9zaXRpb24oY3VycmVudFBvc2l0aW9uLnJvdyAtIDEsIGN1cnJlbnRQb3NpdGlvbi5jb2wpXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcbiAgICAgICAgbmV4dFBvc2l0aW9uID1cbiAgICAgICAgICBuZXcgUG9zaXRpb24oY3VycmVudFBvc2l0aW9uLnJvdyArIDEsIGN1cnJlbnRQb3NpdGlvbi5jb2wpXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaXJlY3Rpb24uTGVmdDpcbiAgICAgICAgbmV4dFBvc2l0aW9uID1cbiAgICAgICAgICBuZXcgUG9zaXRpb24oY3VycmVudFBvc2l0aW9uLnJvdywgY3VycmVudFBvc2l0aW9uLmNvbCAtIDEpXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaXJlY3Rpb24uUmlnaHQ6XG4gICAgICAgIG5leHRQb3NpdGlvbiA9XG4gICAgICAgICAgbmV3IFBvc2l0aW9uKGN1cnJlbnRQb3NpdGlvbi5yb3csIGN1cnJlbnRQb3NpdGlvbi5jb2wgKyAxKVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG5leHRQb3NpdGlvblxuICB9XG5cbiAgcHJpdmF0ZSBkZXRlcm1pbmVTdGF0ZSgpOnZvaWQge1xuICAgIHRoaXMuc3RhdGUgPVxuICAgICAgIXRoaXMudmFsaWRQb3NpdGlvbih0aGlzLnBvaW50ZXJPbmVQb3NpdGlvbilcbiAgICAgICAgPyBTaW11bGF0aW9uU3RhdGUuTm9uY2lyY3VsYXJcbiAgICAgIDogdGhpcy5zYW1lUG9zaXRpb24odGhpcy5wb2ludGVyT25lUG9zaXRpb24sIHRoaXMucG9pbnRlclR3b1Bvc2l0aW9uKVxuICAgICAgICA/IFNpbXVsYXRpb25TdGF0ZS5DaXJjdWxhclxuICAgICAgOiBTaW11bGF0aW9uU3RhdGUuUnVubmluZ1xuICB9XG5cbiAgcHJpdmF0ZSB2YWxpZFBvc2l0aW9uKHBvc2l0aW9uOlBvc2l0aW9uKTpib29sZWFuIHtcbiAgICByZXR1cm4gIShcbiAgICAgIHBvc2l0aW9uLnJvdyA8IDAgfHxcbiAgICAgIHBvc2l0aW9uLnJvdyA+IHRoaXMuc2l6ZSAtIDEgfHxcbiAgICAgIHBvc2l0aW9uLmNvbCA8IDAgfHxcbiAgICAgIHBvc2l0aW9uLmNvbCA+IHRoaXMuc2l6ZSAtIDFcbiAgICApXG4gIH1cblxuICBwcml2YXRlIHNhbWVQb3NpdGlvbihwb3NpdGlvbjE6UG9zaXRpb24sIHBvc2l0aW9uMjpQb3NpdGlvbikge1xuICAgIHJldHVybiBwb3NpdGlvbjEucm93ID09PSBwb3NpdGlvbjIucm93ICYmIHBvc2l0aW9uMS5jb2wgPT09IHBvc2l0aW9uMi5jb2xcbiAgfVxuXG59XG4iLCJleHBvcnQgY2xhc3MgU291bmRNYW5hZ2VyIHtcbiAgc291bmRzOntba2V5OnN0cmluZ106SFRNTEF1ZGlvRWxlbWVudH0gPSB7fVxuICBjb25zdHJ1Y3Rvcihzb3VuZHM6e1trZXk6c3RyaW5nXTpzdHJpbmd9KSB7XG4gICAgZm9yKGxldCBzb3VuZCBpbiBzb3VuZHMpIHtcbiAgICAgIGNvbnN0IGF1ZGlvID0gbmV3IEF1ZGlvKClcbiAgICAgIGF1ZGlvLnNyYyA9IHNvdW5kc1tzb3VuZF1cbiAgICAgIGF1ZGlvLnByZWxvYWQgPSAndHJ1ZSdcbiAgICAgIHRoaXMuc291bmRzW3NvdW5kXSA9IGF1ZGlvXG4gICAgfVxuICB9XG4gIHBsYXkoc291bmROYW1lKSB7XG4gICAgdGhpcy5zb3VuZHNbc291bmROYW1lXS5wYXVzZSgpXG4gICAgdGhpcy5zb3VuZHNbc291bmROYW1lXS5jdXJyZW50VGltZSA9IDBcbiAgICB0aGlzLnNvdW5kc1tzb3VuZE5hbWVdLnBsYXkoKVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcbmltcG9ydCAqIGFzIFBJWEkgZnJvbSAncGl4aS5qcydcbmltcG9ydCB7UG9zaXRpb24sIERpcmVjdGlvbn0gZnJvbSAnLi90eXBlcydcbmltcG9ydCB7VmlzdWFsaXphdGlvbn0gZnJvbSAnLi92aXN1YWxpemF0aW9uJ1xuXG5jb25zdCBjb25maWcgPVxuICBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYygnLi9jb25maWcuanNvbicsICd1dGYtOCcpKS52aXN1YWxpemF0aW9uXG5cbmV4cG9ydCBjbGFzcyBTcXVhcmUge1xuXG4gIHB1YmxpYyBzcXVhcmU6UElYSS5HcmFwaGljc1xuICBwcml2YXRlIHZpc3VhbGl6YXRpb246VmlzdWFsaXphdGlvblxuICBwcml2YXRlIHBvc2l0aW9uOlBvc2l0aW9uXG4gIHByaXZhdGUgcGl4ZWxTaXplOm51bWJlclxuICBwcml2YXRlIGV2ZW46Ym9vbGVhblxuICBwcml2YXRlIGFycm93OlBJWEkuR3JhcGhpY3NcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgdmlzdWFsaXphdGlvbjpWaXN1YWxpemF0aW9uLFxuICAgIHBvc2l0aW9uOlBvc2l0aW9uLFxuICAgIGV2ZW46Ym9vbGVhbixcbiAgICBkaXJlY3Rpb246RGlyZWN0aW9uID0gRGlyZWN0aW9uLlVwXG4gICkge1xuICAgIHRoaXMudmlzdWFsaXphdGlvbiA9IHZpc3VhbGl6YXRpb25cbiAgICB0aGlzLnBpeGVsU2l6ZSA9IHRoaXMudmlzdWFsaXphdGlvbi5zcXVhcmVTaXplXG4gICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uXG4gICAgdGhpcy5ldmVuID0gZXZlblxuICAgIC8vIE5vIG5lZWQgdG8ga2VlcCB0cmFjayBvZiBkaXJlY3Rpb24gLSB3ZSBjYW4gc2FmZWx5IHNldCByb3RhdGlvbiBvbiBldmVyeVxuICAgIC8vIHJlc2V0XG4gICAgdGhpcy5jcmVhdGVTcXVhcmUoKVxuICAgIHRoaXMucmVzZXQodGhpcy5ldmVuLCBkaXJlY3Rpb24pXG4gIH1cblxuICBwdWJsaWMgcmVzZXQoZXZlbjpib29sZWFuLCBkaXJlY3Rpb246RGlyZWN0aW9uKTp2b2lkIHtcbiAgICAvLyBJZiB0aGUgcGl4ZWwgc2l6ZSBvciBjb2xvciBvZiB0aGUgc3F1YXJlIGNoYW5nZXMsIHJlY3JlYXRlIHRoZSBzcXVhcmVcbiAgICBpZih0aGlzLnBpeGVsU2l6ZSAhPT0gdGhpcy52aXN1YWxpemF0aW9uLnNxdWFyZVNpemVcbiAgICB8fCB0aGlzLmV2ZW4gIT09IGV2ZW4pIHtcbiAgICAgIHRoaXMucGl4ZWxTaXplID0gdGhpcy52aXN1YWxpemF0aW9uLnNxdWFyZVNpemVcbiAgICAgIHRoaXMuZXZlbiA9IGV2ZW5cbiAgICAgIC8vIFJlY3JlYXRlIHRoZSBzcXVhcmUgYW5kIGFycm93IGF0IHRoZSBwcm9wZXIgc2l6ZSBhbmQgcG9zaXRpb25cbiAgICAgIHRoaXMuZGVzdHJveSgpXG4gICAgICB0aGlzLmNyZWF0ZVNxdWFyZSgpXG4gICAgfVxuICAgIC8vIFdlIGNhbiBhbHdheXMgc2FmZWx5IHNldCB0aGUgcm90YXRpb24gYmFzZWQgb24gdGhlIGRpcmVjdGlvbiB3aXRob3V0XG4gICAgLy8ga2VlcGluZyB0cmFjayBvZiBpdHMgcHJldmlvdXMgcG9zaXRpb24gLSBubyBuZWVkIHRvIHJlY3JlYXRlIGl0XG4gICAgdGhpcy5hcnJvdy5yb3RhdGlvbiA9IE1hdGguUEkgLyAyICogZGlyZWN0aW9uXG4gIH1cblxuICBwdWJsaWMgZGVzdHJveSgpOnZvaWQge1xuICAgIHRoaXMuc3F1YXJlLnJlbW92ZUNoaWxkKHRoaXMuYXJyb3cpXG4gICAgdGhpcy5hcnJvdy5kZXN0cm95KClcbiAgICB0aGlzLnZpc3VhbGl6YXRpb24uYm9hcmQucmVtb3ZlQ2hpbGQodGhpcy5zcXVhcmUpXG4gICAgdGhpcy5zcXVhcmUuZGVzdHJveSgpXG4gIH1cblxuICAvLyBXZSBrZWVwIHRyYWNrIG9mIGV2ZW4vb2RkIGluIGFuIGluc3RhbmNlIHZhcmlhYmxlIHRvIHNlZSBpZiB3ZSBuZWVkIHRvXG4gIC8vIHJlY3JlYXRlIHRoZSBzcXVhcmU7IEknZCBwcmVmZXIgdG8gcGFzcyBpdCwgYnV0IGhleSB3ZSBhbHJlYWR5IGhhdmUgaXRcbiAgcHJpdmF0ZSBjcmVhdGVTcXVhcmUoKTp2b2lkIHtcbiAgICB0aGlzLnNxdWFyZSA9IG5ldyBQSVhJLkdyYXBoaWNzKClcbiAgICB0aGlzLnNxdWFyZS5wb3NpdGlvbiA9XG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24uYm9hcmRQb3NpdGlvblRvUGl4ZWxzKHRoaXMucG9zaXRpb24pXG4gICAgdGhpcy5zcXVhcmUuYmVnaW5GaWxsKFBJWEkudXRpbHMucmdiMmhleChcbiAgICAgIHRoaXMuZXZlblxuICAgICAgICA/IGNvbmZpZy5zcXVhcmUuZXZlbi5maWxsXG4gICAgICAgIDogY29uZmlnLnNxdWFyZS5vZGQuZmlsbFxuICAgICkpXG4gICAgLy8gQ2VudGVyIGl0IG9uIHRoZSBwaXhlbCBwb3NpdGlvbiBmb3IgdGhlIGJvYXJkIHBvc2l0aW9uXG4gICAgdGhpcy5zcXVhcmUuZHJhd1JlY3QoXG4gICAgICAtdGhpcy5waXhlbFNpemUgLyAyLFxuICAgICAgLXRoaXMucGl4ZWxTaXplIC8gMixcbiAgICAgIHRoaXMucGl4ZWxTaXplLFxuICAgICAgdGhpcy5waXhlbFNpemVcbiAgICApXG4gICAgdGhpcy5zcXVhcmUuZW5kRmlsbCgpXG4gICAgdGhpcy5jcmVhdGVBcnJvdygpXG4gICAgdGhpcy52aXN1YWxpemF0aW9uLmJvYXJkLmFkZENoaWxkKHRoaXMuc3F1YXJlKVxuICB9XG5cbiAgLy8gQXJyb3cgc2l6ZSBpcyBjYWxjdWxhdGVkIHJlbGF0aXZlIHRvIHNxdWFyZSBzaXplXG4gIC8vIEZ1bGwgb2YgXCJtYWdpYyBudW1iZXJzXCI6IFRCRCB0byBtb3ZlIHRoZXNlIHRvIGNvbmZpZ1xuICBwcml2YXRlIGNyZWF0ZUFycm93KCk6dm9pZCB7XG4gICAgLy8gQ3VycmVudGx5LCBvbmx5IGl0cyBjb2xvciBpcyBjb25maWd1cmFibGUsIGFuZCBubyBzdHJva2VcbiAgICB0aGlzLmFycm93ID0gbmV3IFBJWEkuR3JhcGhpY3MoKVxuICAgIHRoaXMuYXJyb3cuYmVnaW5GaWxsKFBJWEkudXRpbHMucmdiMmhleChjb25maWcuYXJyb3cuZmlsbCkpXG4gICAgLy8gVGhlIGJvZHkgb2YgdGhlIGFycm93XG4gICAgdGhpcy5hcnJvdy5kcmF3UmVjdChcbiAgICAgIC10aGlzLnZpc3VhbGl6YXRpb24uc3F1YXJlU2l6ZSAvIDEyLFxuICAgICAgLXRoaXMudmlzdWFsaXphdGlvbi5zcXVhcmVTaXplICogLjIsXG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24uc3F1YXJlU2l6ZSAvIDYsXG4gICAgICB0aGlzLnZpc3VhbGl6YXRpb24uc3F1YXJlU2l6ZSAqIC42KVxuICAgIC8vIFRoZSBhcnJvd2hlYWRcbiAgICB0aGlzLmFycm93LmRyYXdQb2x5Z29uKFtcbiAgICAgIG5ldyBQSVhJLlBvaW50KDAsIC10aGlzLnZpc3VhbGl6YXRpb24uc3F1YXJlU2l6ZSAqIC40KSxcbiAgICAgIG5ldyBQSVhJLlBvaW50KFxuICAgICAgICAtdGhpcy52aXN1YWxpemF0aW9uLnNxdWFyZVNpemUgKiAuMjUsXG4gICAgICAgIC10aGlzLnZpc3VhbGl6YXRpb24uc3F1YXJlU2l6ZSAqIC4xXG4gICAgICApLFxuICAgICAgbmV3IFBJWEkuUG9pbnQoXG4gICAgICAgIHRoaXMudmlzdWFsaXphdGlvbi5zcXVhcmVTaXplICogLjI1LFxuICAgICAgICAtdGhpcy52aXN1YWxpemF0aW9uLnNxdWFyZVNpemUgKiAuMVxuICAgICAgKVxuICAgIF0pXG4gICAgdGhpcy5hcnJvdy5lbmRGaWxsKClcbiAgICAvLyBUaGUgcmVzZXQoKSBpbnN0YW5jZSBtZXRob2Qgc2V0cyB0aGUgYXJyb3cncyByb3RhdGlvbiBvbiBhXG4gICAgLy8gcmVzaXplIG9yIHNodWZmbGU7IG5vIG5lZWQgdG8gc2V0IGl0IGhlcmVcbiAgICB0aGlzLnNxdWFyZS5hZGRDaGlsZCh0aGlzLmFycm93KVxuICB9XG59XG4iLCJcbmV4cG9ydCBjbGFzcyBQb3NpdGlvbiB7XG4gIHB1YmxpYyByb3c6bnVtYmVyXG4gIHB1YmxpYyBjb2w6bnVtYmVyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcihyb3csIGNvbCkge1xuICAgIHRoaXMucm93ID0gcm93XG4gICAgdGhpcy5jb2wgPSBjb2xcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBMYXlvdXQgPSBudW1iZXJbXVtdXG5cbmV4cG9ydCBjb25zdCBlbnVtIERpcmVjdGlvbiB7XG4gIFVwID0gMCxcbiAgUmlnaHQsXG4gIERvd24sXG4gIExlZnRcbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gU2ltdWxhdGlvblN0YXRlIHtcbiAgUnVubmluZyxcbiAgQ2lyY3VsYXIsXG4gIE5vbmNpcmN1bGFyXG59XG4iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcbmltcG9ydCAqIGFzIFBJWEkgZnJvbSAncGl4aS5qcydcbmltcG9ydCB7VHdlZW5MaXRlfSBmcm9tICdnc2FwL1R3ZWVuTGl0ZSdcbmltcG9ydCB7RGlyZWN0aW9uLCBQb3NpdGlvbiwgU2ltdWxhdGlvblN0YXRlfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHtTaW11bGF0aW9ufSBmcm9tICcuL3NpbXVsYXRpb24nXG5pbXBvcnQge1NvdW5kTWFuYWdlcn0gZnJvbSAnLi9zb3VuZC1tYW5hZ2VyJ1xuaW1wb3J0IHtTcXVhcmV9IGZyb20gJy4vc3F1YXJlJ1xuXG5jb25zdCBjb25maWcgPVxuICBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYygnLi9jb25maWcuanNvbicsICd1dGYtOCcpKS52aXN1YWxpemF0aW9uXG5cbmV4cG9ydCBjbGFzcyBWaXN1YWxpemF0aW9uIHtcblxuICBwcml2YXRlIHNpbXVsYXRpb246U2ltdWxhdGlvblxuICAvLyBFdmVudCBoYW5kbGVycyBmb3IgdGhlIGJ1dHRvbnMsIHBhc3NlZCBmcm9tIHRoZSBjb250cm9sbGVyXG4gIHByaXZhdGUgb25wbGF5OigpPT52b2lkXG4gIHByaXZhdGUgb25zdG9wOigpPT52b2lkXG4gIHByaXZhdGUgb25yZXNpemU6KGFtb3VudDpudW1iZXIpPT52b2lkXG4gIHByaXZhdGUgb25zaHVmZmxlOigpPT52b2lkXG4gIHByaXZhdGUgc3RhZ2U6UElYSS5Db250YWluZXJcbiAgLy8gQm9hcmQgaXMgcHVibGljIHNvIFNxdWFyZXMgY2FuIGhhbmRsaW5nIGFkZGluZyB0aGVpciBzcXVhcmU6UElYSS5HcmFwaGljc1xuICAvLyB0byBpdDsgY291bGQgdXNlIHNvbWUgaW5zdGFuZSBtZXRob2RzIGhlcmUgdG8gcHJvdGVjdCBpdCwgaW5zdGVhZFxuICBwdWJsaWMgYm9hcmQ6UElYSS5Db250YWluZXJcbiAgcHJpdmF0ZSBjaGVja2VyMTpQSVhJLkRpc3BsYXlPYmplY3RcbiAgcHJpdmF0ZSBjaGVja2VyMjpQSVhJLkRpc3BsYXlPYmplY3RcbiAgLy8gUHVibGljIHNvIFNxdWFyZXMgY2FuIHNlZTsgY291bGQgdXNlIGFuIGluc3RhbmNlIG1ldGhvZCB0byBwcm90ZWN0IGl0XG4gIHB1YmxpYyBzcXVhcmVTaXplOm51bWJlclxuICBwcml2YXRlIHJlbmRlcmVyOlBJWEkuV2ViR0xSZW5kZXJlclxuICBwcml2YXRlIHNxdWFyZXM6U3F1YXJlW11bXSA9IFtdXG4gIHByaXZhdGUgbWVzc2FnZTpQSVhJLlRleHRcbiAgcHJpdmF0ZSBzb3VuZE1hbmFnZXI6U291bmRNYW5hZ2VyID0gbmV3IFNvdW5kTWFuYWdlcihjb25maWcuc291bmRzKVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBzaW11bGF0aW9uOlNpbXVsYXRpb24sXG4gICAgb25wbGF5OigpPT52b2lkLFxuICAgIG9uc3RvcDooKT0+dm9pZCxcbiAgICBvbnJlc2l6ZTooYW1vdW50Om51bWJlcik9PnZvaWQsXG4gICAgb25zaHVmZmxlOigpPT52b2lkXG4gICkge1xuICAgIC8vIEtlZXAgYSBjb3B5IG9mIHRoZSBzaW11bGF0aW9uIGZvciByZWZlcmVuY2UgYnkgaW5zdGFuY2UgbWV0aG9kc1xuICAgIHRoaXMuc2ltdWxhdGlvbiA9IHNpbXVsYXRpb25cbiAgICAvLyBTZXQgdXAgdGhlIGJ1dHRvbiBldmVudCBoYW5kbGVycyB0byB3ZSBjYW4gdGVsbCB0aGUgY29udHJvbGxlciB3aGVuXG4gICAgLy8gdGhleSdyZSBwcmVzc2VkXG4gICAgdGhpcy5vbnBsYXkgPSBvbnBsYXlcbiAgICB0aGlzLm9uc3RvcCA9IG9uc3RvcFxuICAgIHRoaXMub25yZXNpemUgPSBvbnJlc2l6ZVxuICAgIHRoaXMub25zaHVmZmxlID0gb25zaHVmZmxlXG4gICAgLy8gVGhlIHJvb3Qgc3RhZ2UgY29udGFpbmVyIGlzIHBhc3NlZCBpbnRvIHJlbmRlcigpIGJ5IHJlbmRlckxvb3AoKVxuICAgIC8vIEl0IHdpbGwgY29udGFpbiB0aGUgbWVzc2FnZSwgdGhlIGJvYXJkLCBhbmQgdGhlIGJ1dHRvbnNcbiAgICB0aGlzLnN0YWdlID0gbmV3IFBJWEkuQ29udGFpbmVyKClcbiAgICAvLyBTZXQgdXAgdGhlIHJlbmRlcmVyLCBhZGQgdGhlIGNhbnZhcyB0byB0aGUgcGFnZSwgYW5kIHN0YXJ0IHRoZSByZW5kZXJcbiAgICAvLyBsb29wIChyZW5kZXJzIGV2ZXJ5IGZyYW1lIHdpdGggcmVxdWVzdEFuaW1hdGlvbkZyYW1lKVxuICAgIHRoaXMucmVuZGVyZXIgPVxuICAgICAgbmV3IFBJWEkuV2ViR0xSZW5kZXJlcihcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLFxuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LFxuICAgICAgICB7YW50aWFsaWFzOiB0cnVlfSlcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMucmVuZGVyZXIudmlldylcbiAgICB0aGlzLnJlbmRlckxvb3AoKVxuICAgIC8vIFRoaXMgYWRkcyB0aGUgbWVzc2FnZSBhbmQgYnV0dG9ucyB0byB0aGUgc3RhZ2VcbiAgICB0aGlzLmNyZWF0ZVVJKClcbiAgICAvLyBUaGUgYm9hcmQgd2lsbCBjb250YWluIHRoZSBjaGVja2VycyBhbmQgc3F1YXJlc1xuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5ib2FyZCA9IG5ldyBQSVhJLkNvbnRhaW5lcigpKVxuICAgIHRoaXMuYm9hcmQucG9zaXRpb24gPSBuZXcgUElYSS5Qb2ludChcbiAgICAgIHRoaXMucmVuZGVyZXIud2lkdGggLyAyLFxuICAgICAgdGhpcy5yZW5kZXJlci5oZWlnaHQgLyAyIC0gY29uZmlnLmJ1dHRvbi5oZWlnaHQgLyAyXG4gICAgKVxuICAgIC8vIHJlZnJlc2goKSBhZGRzIHRoZSBzcXVhcmVzLCBhbmQgdGhlaXIgYXJyb3dzLCB0byB0aGUgYm9hcmRcbiAgICAvLyBJdCB3aWxsIGFkZCBzcXVhcmVzIG9mIHRoZSBhcHByb3ByaWF0ZSBzaXplIGFuZCBwb3NpdGlvbiB0aGVtc2VsdmVzIHRvXG4gICAgLy8gZmlsbCB0aGUgc2ltdWxhdGlvbiBzaXplLiBJdCB3aWxsIGFsc28gZGVzdHJveSBleHRyYSBzcXVhcmVzIHdoZW4gdGhlXG4gICAgLy8gc2ltdWxhdGlvbiBpcyBkb3duc2l6ZWQuXG4gICAgdGhpcy5yZWZyZXNoKClcbiAgICAvLyByZXN0YXJ0KCkgbW92ZXMgdGhlIGNoZWNrZXJzIHRvIHRoZSBzdGFydGluZyBwb3NpdGlvbiBhbmQgcGxhY2VzIHRoZW1cbiAgICAvLyBvbiB0b3Agb2YgYWxsIGJvYXJkIHNxdWFyZXMgKGluY2x1ZGluZyBuZXcgb25lcylcbiAgICB0aGlzLnJlc3RhcnQoKVxuICB9XG5cbiAgcHVibGljIHJlZnJlc2goKTp2b2lkIHtcbiAgICAvLyBEZXRlcm1pbmUgdGhlIHNxdWFyZSBzaXplIGJhc2VkIG9uIHRoZSB3aW5kb3cgc2l6ZSBhbmQgc2ltdWxhdGlvbiBzaXplXG4gICAgY29uc3QgYm9hcmRTaXplOm51bWJlciA9XG4gICAgICBNYXRoLm1pbih0aGlzLnJlbmRlcmVyLndpZHRoLCB0aGlzLnJlbmRlcmVyLmhlaWdodClcbiAgICAgICAgLSB0aGlzLm1lc3NhZ2UuaGVpZ2h0XG4gICAgICAgIC0gY29uZmlnLmJ1dHRvbi5oZWlnaHRcbiAgICAgICAgLSBjb25maWcuYnV0dG9uLmZyb21Cb3R0b21cbiAgICAgICAgLSBjb25maWcubWVzc2FnZS5mcm9tVG9wXG4gICAgICAgIC0gY29uZmlnLm1hcmdpbiAqIDJcbiAgICB0aGlzLnNxdWFyZVNpemUgPSBib2FyZFNpemUgLyB0aGlzLnNpbXVsYXRpb24uc2l6ZVxuICAgIGlmKHRoaXMuY2hlY2tlcjEpIHtcbiAgICAgIHRoaXMuYm9hcmQucmVtb3ZlQ2hpbGQodGhpcy5jaGVja2VyMSlcbiAgICAgIHRoaXMuYm9hcmQucmVtb3ZlQ2hpbGQodGhpcy5jaGVja2VyMilcbiAgICAgIHRoaXMuY2hlY2tlcjEuZGVzdHJveSgpXG4gICAgICB0aGlzLmNoZWNrZXIyLmRlc3Ryb3koKVxuICAgIH1cbiAgICAvLyBUaGUgY2hlY2tlcnMgYXJlIGNoaWxkcmVuIG9mIHRoZSBib2FyZCBzbyB0aGV5IGNhbiBiZSBwb3NpdGlvbmVkXG4gICAgLy8gdXNpbmcgdGhlIHNhbWUgcm91dGluZSBhcyB0aGUgc3F1YXJlcywgYm9hcmRQb3NpdGlvblRvUGl4ZWxzKClcbiAgICB0aGlzLmNoZWNrZXIxID0gdGhpcy5jcmVhdGVDaGVja2VyKClcbiAgICB0aGlzLmNoZWNrZXIyID0gdGhpcy5jcmVhdGVDaGVja2VyKClcbiAgICAvLyBEZWxldGUgYW55IHNxdWFyZXMgdGhhdCBleGNlZWQgdGhlIGN1cnJlbnQgc2ltdWxhdGlvbiBsYXlvdXQgc2l6ZVxuICAgIHRoaXMuc2hyaW5rQm9hcmRBc05lZWRlZCgpXG4gICAgLy8gQ3JlYXRlIHNxdWFyZXMgYXMgbmVlZGVkLCBzZXQgdGhlaXIgcG9zaXRpb24gYW5kIGNvbG9yLFxuICAgIC8vIGFuZCBzZXQgYWxsIGFycm93IGRpcmVjdGlvbnMgZnJvbSB0aGUgc2ltdWxhdGlvbiBsYXlvdXRcbiAgICB0aGlzLnNldHVwQm9hcmQoKVxuICB9XG5cbiAgcHVibGljIHJlc3RhcnQoKTp2b2lkIHtcbiAgICAvLyBTdG9wIGFueSBvbmdvaW5nIGFuaW1hdGlvbnNcbiAgICBUd2VlbkxpdGUua2lsbFR3ZWVuc09mKHRoaXMuY2hlY2tlcjEucG9zaXRpb24pXG4gICAgVHdlZW5MaXRlLmtpbGxUd2VlbnNPZih0aGlzLmNoZWNrZXIxLnNjYWxlKVxuICAgIFR3ZWVuTGl0ZS5raWxsVHdlZW5zT2YodGhpcy5jaGVja2VyMi5wb3NpdGlvbilcbiAgICAvLyBNb3ZlIHRoZSBjaGVja2VycyB0byB0aGUgc2ltdWxhdGlvbiBzdGFydGluZyBwb3NpdGlvbnNcbiAgICBjb25zdCBwaXhlbFBvc2l0aW9uOlBJWEkuUG9pbnQgPVxuICAgICAgdGhpcy5ib2FyZFBvc2l0aW9uVG9QaXhlbHModGhpcy5zaW11bGF0aW9uLnN0YXJ0aW5nUG9zaXRpb24pXG4gICAgdGhpcy5jaGVja2VyMS5wb3NpdGlvbiA9IHBpeGVsUG9zaXRpb25cbiAgICB0aGlzLmNoZWNrZXIyLnBvc2l0aW9uID0gcGl4ZWxQb3NpdGlvblxuICAgIHRoaXMuYm9hcmQucmVtb3ZlQ2hpbGQodGhpcy5jaGVja2VyMSlcbiAgICB0aGlzLmJvYXJkLnJlbW92ZUNoaWxkKHRoaXMuY2hlY2tlcjIpXG4gICAgdGhpcy5ib2FyZC5hZGRDaGlsZCh0aGlzLmNoZWNrZXIxKVxuICAgIHRoaXMuYm9hcmQuYWRkQ2hpbGQodGhpcy5jaGVja2VyMilcbiAgICAvLyBSZXNpemUgdGhlIGZpcnN0IGNoZWNrZXIgdG8gc2NhbGUgb25lLCBzaW5jZSBpdCBpcyBzaHJ1bmsgdG8gemVybyBzY2FsZVxuICAgIC8vIHdoZW4gYSBzaW11bGF0aW9uIGlzIGNvbXBsZXRlZFxuICAgIHRoaXMuY2hlY2tlcjEuc2NhbGUuc2V0KDEsIDEpXG4gIH1cblxuICAvLyBDYWxsZWQgYnkgdGhlIGNvbnRyb2xsZXIgdG8gc2V0IHRoZSBhcHByb3ByaWF0ZSB0ZXh0IGF0IHNjcmVlbiB0b3BcbiAgcHVibGljIHNob3dNZXNzYWdlKG1lc3NhZ2U6c3RyaW5nKTp2b2lkIHtcbiAgICB0aGlzLm1lc3NhZ2UudGV4dCA9IG1lc3NhZ2VcbiAgfVxuXG4gIC8vIENhbGxlZCBieSB0aGUgY29udHJvbGxlciB0byBtb3ZlIHRoZSBjaGVja2VyIHRvIGEgbmV3IHBvc2l0aW9uXG4gIHB1YmxpYyBtb3ZlQ2hlY2tlcihudW1iZXI6bnVtYmVyLCBwb3NpdGlvbjpQb3NpdGlvbik6dm9pZCB7XG4gICAgY29uc3QgY2hlY2tlcjpQSVhJLkRpc3BsYXlPYmplY3QgPVxuICAgICAgbnVtYmVyID09PSAxID8gdGhpcy5jaGVja2VyMSA6IHRoaXMuY2hlY2tlcjJcbiAgICBjb25zdCBwaXhlbFBvc2l0aW9uOlBJWEkuUG9pbnQgPSB0aGlzLmJvYXJkUG9zaXRpb25Ub1BpeGVscyhwb3NpdGlvbilcbiAgICAvLyBVc2UgdGhlIEdyZWVuc29jayBUd2VlbkxpdGUgbGlicmFyeSB0byBhbmltYXRlIHRoZSBtb3ZlbWVudFxuICAgIFR3ZWVuTGl0ZS50byhcbiAgICAgIGNoZWNrZXIucG9zaXRpb24sXG4gICAgICBjb25maWcuY2hlY2tlci5tb3ZlVGltZSxcbiAgICAgIHt4OiBwaXhlbFBvc2l0aW9uLngsIHk6IHBpeGVsUG9zaXRpb24ueX1cbiAgICApXG4gICAgdGhpcy5zb3VuZE1hbmFnZXIucGxheSgnbW92ZScpXG4gIH1cblxuICAvLyBDYWxsZWQgYnkgdGhlIGNvbnRyb2xsZXIgd2hlbiB0aGUgc2ltdWxhdGlvbiBlbmRzXG4gIC8vIFRoZSBzdGF0ZSBpcyBhIGRldGVybWluYXRpb24gb2Ygd2hldGhlciBvciBub3QgdGhlIHBhdGggaXMgY2lyY3VsYXJcbiAgcHVibGljIGVuZFZpc3VhbGl6YXRpb24oc3RhdGU6U2ltdWxhdGlvblN0YXRlKSB7XG4gICAgLy8gU2hyaW5rIHRoZSBmaXJzdCBjaGVja2VyIHRvIHNjYWxlIHplcm9cbiAgICBUd2VlbkxpdGUudG8odGhpcy5jaGVja2VyMS5zY2FsZSwgLjUsIHt4OiAwLCB5OiAwfSlcbiAgICAvLyBQbGF5IGNvbGxpc2lvbiBvciBmYWxsIHNvdW5kXG4gICAgc3dpdGNoKHN0YXRlKSB7XG4gICAgICBjYXNlIFNpbXVsYXRpb25TdGF0ZS5DaXJjdWxhcjpcbiAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIucGxheSgnY29sbGlkZScpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFNpbXVsYXRpb25TdGF0ZS5Ob25jaXJjdWxhcjpcbiAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIucGxheSgnZmFsbCcpXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGJvYXJkUG9zaXRpb25Ub1BpeGVscyhib2FyZFBvc2l0aW9uOlBvc2l0aW9uKTpQSVhJLlBvaW50IHtcbiAgICByZXR1cm4gbmV3IFBJWEkuUG9pbnQoXG4gICAgICAoYm9hcmRQb3NpdGlvbi5jb2wgLSB0aGlzLnNpbXVsYXRpb24uc2l6ZSAvIDIpICogdGhpcy5zcXVhcmVTaXplICsgdGhpcy5zcXVhcmVTaXplIC8gMixcbiAgICAgIChib2FyZFBvc2l0aW9uLnJvdyAtIHRoaXMuc2ltdWxhdGlvbi5zaXplIC8gMikgKiB0aGlzLnNxdWFyZVNpemUgKyB0aGlzLnNxdWFyZVNpemUgLyAyXG4gICAgKVxuICB9XG5cbiAgLy8gQ3JlYXRlcyB0aGUgbWVzc2FnZSBhbmQgdGhlIGJ1dHRvbnMsIGFuZCBzZXQgdXAgdGhlIGV2ZW50IGhhbmRsaW5nXG4gIC8vIFRoZSBwb3NpdGlvbmluZyBjb3VsZCBjZXJ0YWlubHkgdXNlIHNvbWUgZW5oYW5jZW1lbnQgLSBUREJcbiAgLy8gRHluYW1pY2FsbHkgY2VudGVyaW5nIHRoZW0gYXMgdGhleSBhcmUgYWRkZWQgdG8gYSBjb250YWluZXIsIGZvciBleGFtcGxlXG4gIHByaXZhdGUgY3JlYXRlVUkoKSB7XG4gICAgY29uc3QgcG9zaXRpb25ZID1cbiAgICAgIHRoaXMucmVuZGVyZXIuaGVpZ2h0IC0gY29uZmlnLmJ1dHRvbi5mcm9tQm90dG9tIC0gY29uZmlnLmJ1dHRvbi5oZWlnaHQgLyAyXG4gICAgLy8gUmVzaXplKyBCdXR0b25cbiAgICAvLyBSZWR1Y2UgdGhlIHNpbXVsYXRpb24gc2l6ZSBieSBvbmUgd2hlbiBwcmVzc2VkXG4gICAgdGhpcy5jcmVhdGVCdXR0b24oXG4gICAgICBuZXcgUElYSS5Qb2ludChcbiAgICAgICAgdGhpcy5yZW5kZXJlci53aWR0aCAvIDJcbiAgICAgICAgICAtIGNvbmZpZy5idXR0b24ud2lkdGggKiAxLjVcbiAgICAgICAgICAtIGNvbmZpZy5tYXJnaW4gKiAxLjUsXG4gICAgICAgIHBvc2l0aW9uWVxuICAgICAgKSxcbiAgICAgICctJyxcbiAgICAgICgpID0+IHRoaXMub25yZXNpemUoLTEpLFxuICAgICAgdHJ1ZSAvLyBzbWFsbCBidXR0b25cbiAgICApXG4gICAgLy8gUmVzaXplLSBCdXR0b25cbiAgICAvLyBJbmNyZWFzZSB0aGUgc2ltdWxhdGlvbiBzaXplIGJ5IG9uZSB3aGVuIHByZXNzZWRcbiAgICB0aGlzLmNyZWF0ZUJ1dHRvbihcbiAgICAgIG5ldyBQSVhJLlBvaW50KFxuICAgICAgICB0aGlzLnJlbmRlcmVyLndpZHRoIC8gMiAtIGNvbmZpZy5idXR0b24ud2lkdGggKiAyIC0gY29uZmlnLm1hcmdpbixcbiAgICAgICAgcG9zaXRpb25ZXG4gICAgICApLFxuICAgICAgJysnLFxuICAgICAgKCkgPT4gdGhpcy5vbnJlc2l6ZSgxKSxcbiAgICAgIHRydWUgLy8gc21hbGwgYnV0dG9uXG4gICAgKVxuICAgIC8vIFNodWZmbGUgQnV0dG9uXG4gICAgLy8gU2h1ZmZsZSB0aGUgYXJyb3cgZGlyZWN0aW9uc1xuICAgIHRoaXMuY3JlYXRlQnV0dG9uKFxuICAgICAgbmV3IFBJWEkuUG9pbnQoXG4gICAgICAgIHRoaXMucmVuZGVyZXIud2lkdGggLyAyIC0gY29uZmlnLmJ1dHRvbi53aWR0aCAvIDIgLSBjb25maWcubWFyZ2luIC8gMixcbiAgICAgICAgcG9zaXRpb25ZXG4gICAgICApLFxuICAgICAgJ1NodWZmbGUnLFxuICAgICAgdGhpcy5vbnNodWZmbGVcbiAgICApXG4gICAgLy8gUGxheSBCdXR0b25cbiAgICAvLyBTdGFydCB0aGUgc2ltdWxhdGlvbjsgdGhlIGNvbnRyb2xsZXIgd2lsbCBoYW5kbGUgZGVsYXlpbmcgdGhlXG4gICAgLy8gc2ltdWxhdGlvbidzIGl0ZXJhdG9yIHRvIGFsbG93IHRoZSB2aXN1YWxpemF0aW9uIHRpbWUgdG8gYW5pbWF0ZVxuICAgIHRoaXMuY3JlYXRlQnV0dG9uKFxuICAgICAgbmV3IFBJWEkuUG9pbnQoXG4gICAgICAgIHRoaXMucmVuZGVyZXIud2lkdGggLyAyICsgY29uZmlnLmJ1dHRvbi53aWR0aCAvIDIgKyBjb25maWcubWFyZ2luIC8gMixcbiAgICAgICAgcG9zaXRpb25ZXG4gICAgICApLFxuICAgICAgJ1BsYXknLFxuICAgICAgdGhpcy5vbnBsYXlcbiAgICApXG4gICAgLy8gU3RvcCBCdXR0b25cbiAgICAvLyBTdG9wIHRoZSBzaW1sdWF0aW9uIGFuZCBtb3ZlIHRoZSBjaGVja2VycyBiYWNrIHRvIHN0YXJ0aW5nIHBvc2l0aW9uXG4gICAgdGhpcy5jcmVhdGVCdXR0b24oXG4gICAgICBuZXcgUElYSS5Qb2ludChcbiAgICAgICAgdGhpcy5yZW5kZXJlci53aWR0aCAvIDIgKyBjb25maWcuYnV0dG9uLndpZHRoICogMS41ICsgY29uZmlnLm1hcmdpbixcbiAgICAgICAgcG9zaXRpb25ZXG4gICAgICApLFxuICAgICAgJ1N0b3AnLFxuICAgICAgdGhpcy5vbnN0b3BcbiAgICApXG4gICAgLy8gTWVzc2FnZSB0aGF0IGFwcGVhcnMgb24gdGhlIHRvcCBvZiB0aGUgc2NyZWVuXG4gICAgLy8gVGhlIG1lc3NhZ2UgdGV4dCBpcyBzZXQgYnkgdGhlIGNvbnRyb2xsZXIgdXNpbmcgc2hvd01lc3NhZ2UoKVxuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQodGhpcy5tZXNzYWdlID0gbmV3IFBJWEkuVGV4dCgnUHJlc3MgUGxheSB0byBCZWdpbicsIHtcbiAgICAgIGFsaWduOiBjb25maWcubWVzc2FnZS5hbGlnbixcbiAgICAgIGxpbmVKb2luOiBjb25maWcubWVzc2FnZS5saW5lSm9pbixcbiAgICAgIGZpbGw6IGNvbmZpZy5tZXNzYWdlLmZpbGwubWFwKGNvbG9yID0+IFBJWEkudXRpbHMucmdiMmhleChjb2xvcikpLFxuICAgICAgc3Ryb2tlOiBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLm1lc3NhZ2Uuc3Ryb2tlKSxcbiAgICAgIHN0cm9rZVRoaWNrbmVzczogY29uZmlnLm1lc3NhZ2Uuc3Ryb2tlVGhpY2tuZXNzXG4gICAgfSkpXG4gICAgdGhpcy5tZXNzYWdlLmFuY2hvci5zZXQoLjUsIDApXG4gICAgdGhpcy5tZXNzYWdlLnBvc2l0aW9uID0gbmV3IFBJWEkuUG9pbnQoXG4gICAgICB0aGlzLnJlbmRlcmVyLndpZHRoIC8gMixcbiAgICAgIGNvbmZpZy5tZXNzYWdlLmZyb21Ub3BcbiAgICApXG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUJ1dHRvbihcbiAgICBwb3NpdGlvbjpQSVhJLlBvaW50LFxuICAgIGxhYmVsOnN0cmluZyxcbiAgICBhY3Rpb246eygpOnZvaWR9LFxuICAgIHNtYWxsOmJvb2xlYW4gPSBmYWxzZVxuICApOlBJWEkuR3JhcGhpY3Mge1xuICAgIGNvbnN0IGJ1dHRvbjpQSVhJLkdyYXBoaWNzID0gbmV3IFBJWEkuR3JhcGhpY3MoKVxuICAgIC8vIFNtYWxsIGJ1dHRvbnMgYXJlIGhhbGYgdGhlIGNvbmZpZ3VyZWQgd2lkdGhcbiAgICBjb25zdCB3aWR0aDpudW1iZXIgPSBjb25maWcuYnV0dG9uLndpZHRoICogKHNtYWxsID8gLjUgOiAxKVxuICAgIC8vIENlbnRlciB0aGUgYnV0dG9uIGF0IHRoZSBnaXZlbiBwb3NpdGlvblxuICAgIC8vIEtlZXBzIGNlbnRlcmluZyBvZiB0ZXh0IHNpbXBsZXIgdGhhbiBtb3ZpbmcgdG9wL2xlZnQgb2YgZHJhd1JlY3RcbiAgICBidXR0b24ucG9zaXRpb24gPSBuZXcgUElYSS5Qb2ludChcbiAgICAgIHBvc2l0aW9uLnggLSB3aWR0aCAvIDIsXG4gICAgICBwb3NpdGlvbi55IC0gY29uZmlnLmJ1dHRvbi5oZWlnaHQgLyAyXG4gICAgKVxuICAgIC8vIFNldCB0aGUgc3R5bGVzIGZyb20gdGhlIGNvbmZpZyBhbmQgZHJhdyB0byBjb25maWd1cmVkIHNpemVcbiAgICBidXR0b24ubGluZVN0eWxlKFxuICAgICAgY29uZmlnLmJ1dHRvbi5zdHJva2VUaGlja25lc3MsXG4gICAgICBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmJ1dHRvbi5zdHJva2UpXG4gICAgKVxuICAgIGJ1dHRvbi5iZWdpbkZpbGwoUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5idXR0b24uZmlsbCkpXG4gICAgYnV0dG9uLmRyYXdSZWN0KDAsIDAsIHdpZHRoLCBjb25maWcuYnV0dG9uLmhlaWdodClcbiAgICBidXR0b24uZW5kRmlsbCgpXG4gICAgLy8gQWRkIHN0eWxlZCBidXR0b24gdGV4dFxuICAgIGNvbnN0IHRleHQ6UElYSS5UZXh0ID0gbmV3IFBJWEkuVGV4dChsYWJlbCwge1xuICAgICAgYWxpZ246IGNvbmZpZy5idXR0b24udGV4dC5hbGlnbixcbiAgICAgIGxpbmVKb2luOiBjb25maWcuYnV0dG9uLnRleHQubGluZUpvaW4sXG4gICAgICBmaWxsOiBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmJ1dHRvbi50ZXh0LmZpbGwpLFxuICAgICAgc3Ryb2tlOiBQSVhJLnV0aWxzLnJnYjJoZXgoY29uZmlnLmJ1dHRvbi50ZXh0LnN0cm9rZSksXG4gICAgICBzdHJva2VUaGlja25lc3M6IGNvbmZpZy5idXR0b24udGV4dC5zdHJva2VUaGlja25lc3NcbiAgICB9KVxuICAgIC8vIENlbnRlciB0aGUgdGV4dCBvbiB0aGUgYnV0dG9uXG4gICAgdGV4dC5wb3NpdGlvbiA9IG5ldyBQSVhJLlBvaW50KHdpZHRoIC8gMiwgY29uZmlnLmJ1dHRvbi5oZWlnaHQgLyAyKVxuICAgIHRleHQuYW5jaG9yLnNldCguNSlcbiAgICBidXR0b24uYWRkQ2hpbGQodGV4dClcbiAgICAvLyBTZXQgdXAgdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgYnV0dG9uLmludGVyYWN0aXZlID0gdHJ1ZVxuICAgIGJ1dHRvbi5vbignbW91c2V1cCcsIGFjdGlvbilcbiAgICBidXR0b24ub24oJ3RvdWNoZW5kJywgYWN0aW9uKVxuICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoYnV0dG9uKVxuICAgIHJldHVybiBidXR0b25cbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQ2hlY2tlcigpOlBJWEkuR3JhcGhpY3Mge1xuICAgIGNvbnN0IGNoZWNrZXI6UElYSS5HcmFwaGljcyA9IG5ldyBQSVhJLkdyYXBoaWNzKClcbiAgICAvLyBTZW1pLXRyYW5zcGFyZW50IHNvIHRoYXQgdGhlIGFycm93cyBjYW4gYmUgc2VlblxuICAgIGNoZWNrZXIuYWxwaGEgPSBjb25maWcuY2hlY2tlci5hbHBoYVxuICAgIGNoZWNrZXIubGluZVN0eWxlKFxuICAgICAgY29uZmlnLmNoZWNrZXIuc3Ryb2tlVGhpY2tuZXNzLFxuICAgICAgUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5jaGVja2VyLnN0cm9rZSlcbiAgICApXG4gICAgY2hlY2tlci5iZWdpbkZpbGwoUElYSS51dGlscy5yZ2IyaGV4KGNvbmZpZy5jaGVja2VyLmZpbGwpKVxuICAgIC8vIFNldCBzY2FsZSByZWxhdGl2ZSB0byBzcXVhcmUgc2l6ZVxuICAgIGNoZWNrZXIuZHJhd0NpcmNsZSgwLCAwLCB0aGlzLnNxdWFyZVNpemUgKiBjb25maWcuY2hlY2tlci5yZWxhdGl2ZVNpemUpXG4gICAgY2hlY2tlci5lbmRGaWxsKClcbiAgICB0aGlzLmJvYXJkLmFkZENoaWxkKGNoZWNrZXIpXG4gICAgcmV0dXJuIGNoZWNrZXJcbiAgfVxuXG4gIHByaXZhdGUgc2hyaW5rQm9hcmRBc05lZWRlZCgpOnZvaWQge1xuICAgIC8vIERlc3Ryb3kgZXh0cmEgYm9hcmQgcG9zaXRpb25zIGlmIHRoZSBuZXcgbGF5b3V0IGlzIHNtYWxsZXIgdGhhbiB0aGVcbiAgICAvLyBsYXN0IGJvYXJkXG4gICAgd2hpbGUodGhpcy5zcXVhcmVzLmxlbmd0aCA+IHRoaXMuc2ltdWxhdGlvbi5zaXplKSB7XG4gICAgICAvLyBEZWxldGUgdGhlIGxhc3Qgcm93XG4gICAgICBjb25zdCByb3c6U3F1YXJlW10gPSB0aGlzLnNxdWFyZXNbdGhpcy5zcXVhcmVzLmxlbmd0aCAtIDFdXG4gICAgICB3aGlsZShyb3cubGVuZ3RoID4gMClcbiAgICAgICAgcm93LnBvcCgpLmRlc3Ryb3koKVxuICAgICAgdGhpcy5zcXVhcmVzLnBvcCgpXG4gICAgICAvLyBEZWxldGUgdGhlIGxhc3QgY29sdW1uIGZyb20gZWFjaCByb3dcbiAgICAgIGZvcihsZXQgcm93IG9mIHRoaXMuc3F1YXJlcylcbiAgICAgICAgcm93LnBvcCgpLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBCb2FyZCgpOnZvaWQge1xuICAgIC8vIGV2ZW4gdHJhY2tzIHRoZSBhbHRlcm5hdGluZyBzcXVhcmUgY29sb3JzXG4gICAgbGV0IGV2ZW46Ym9vbGVhbiA9IGZhbHNlXG4gICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBib2FyZCBwb3NpdGlvbnMgZm9yIHRoZSBnaXZlbiBib2FyZCBzaXplXG4gICAgZm9yKGxldCByb3c6bnVtYmVyID0gMCA7IHJvdyA8IHRoaXMuc2ltdWxhdGlvbi5zaXplIDsgcm93KyspIHtcbiAgICAgIC8vIEFkZCB0aGUgcm93IGlmIG91ciBib2FyZCBpc24ndCB0aGF0IGJpZyB5ZXRcbiAgICAgIGlmKHJvdyA+IHRoaXMuc3F1YXJlcy5sZW5ndGggLSAxKVxuICAgICAgICB0aGlzLnNxdWFyZXMucHVzaChbXSlcbiAgICAgIGZvcihsZXQgY29sOm51bWJlciA9IDAgOyBjb2wgPCB0aGlzLnNpbXVsYXRpb24uc2l6ZSA7IGNvbCsrKSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uOlBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKHJvdywgY29sKVxuICAgICAgICAvLyBUaGUgc2ltdWxhdGlvbiBsYXlvdXQgZ2l2ZXMgdXMgdGhlIGFycm93IGRpcmVjdGlvbiB0byBkcmF3XG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbjpEaXJlY3Rpb24gPSB0aGlzLnNpbXVsYXRpb24ubGF5b3V0W3Jvd11bY29sXVxuICAgICAgICB0aGlzLnNldHVwU3F1YXJlKHBvc2l0aW9uLCBldmVuLCBkaXJlY3Rpb24pXG4gICAgICAgIC8vIFN0YWdnZXIgdGhlIHNxdWFyZSBjb2xvcnNcbiAgICAgICAgZXZlbiA9ICFldmVuXG4gICAgICB9XG4gICAgICAvLyBGb3IgZXZlbi1zaXplZCBib2FyZHMsIGhhdmUgdG8gc3RhZ2dlciB0aGUgc3F1YXJlIGNvbG9ycyBiYWNrXG4gICAgICBpZih0aGlzLnNpbXVsYXRpb24uc2l6ZSAlIDIgPT09IDApXG4gICAgICAgIGV2ZW4gPSAhZXZlblxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBTcXVhcmUoXG4gICAgcG9zaXRpb246UG9zaXRpb24sXG4gICAgZXZlbjpib29sZWFuLFxuICAgIGRpcmVjdGlvbjpEaXJlY3Rpb25cbiAgKTp2b2lkIHtcbiAgICAvLyBJZiB3ZSBkb24ndCB5ZXQgaGF2ZSBhIHNxdWFyZSBmb3IgdGhpcyBwb3NpdGlvbiwgY3JlYXRlIGl0XG4gICAgaWYocG9zaXRpb24uY29sID4gdGhpcy5zcXVhcmVzW3Bvc2l0aW9uLnJvd10ubGVuZ3RoIC0gMSkge1xuICAgICAgdGhpcy5zcXVhcmVzW3Bvc2l0aW9uLnJvd10ucHVzaChcbiAgICAgICAgbmV3IFNxdWFyZSh0aGlzLCBwb3NpdGlvbiwgZXZlbiwgZGlyZWN0aW9uKSlcbiAgICB9XG4gICAgLy8gSWYgd2UgZG8gaGF2ZSBhIHNxdWFyZSBhdCB0aGlzIHBvc2l0aW9uIGFscmVhZHksIHRlbGwgaXQgdG8gcmVzZXRcbiAgICAvLyBpdHMgcG9zaXRpb24sIGNvbG9yLCBhbmQgYXJyb3cgZGlyZWN0aW9uIGlmIG5lZWRlZFxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5zcXVhcmVzW3Bvc2l0aW9uLnJvd11bcG9zaXRpb24uY29sXS5yZXNldChldmVuLCBkaXJlY3Rpb24pXG4gICAgfVxuICB9XG5cbiAgLy8gRmF0IGFycm93IHRvIHByZXNlcnZlIFwidGhpc1wiXG4gIHByaXZhdGUgcmVuZGVyTG9vcCA9ICgpOnZvaWQgPT4ge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnJlbmRlckxvb3ApXG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zdGFnZSlcbiAgfVxufVxuIl19
