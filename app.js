import Game from './game.js';
import { Earth, Moon } from './environment.js';
import { ShipTypeA } from './ship.js';
import { Platform } from './gameObject.js';
import Vector2 from './vector.js';


class App {
    constructor(context) {
        this.run = this.run.bind(this);
        this.context = context;

        const canvas = context.canvas;

        this.resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;

            this.screenWidth = window.innerWidth;
            this.screenHeight = window.innerHeight;

            canvas.width = Math.round(this.screenWidth * dpr);
            canvas.height = Math.round(this.screenHeight * dpr);

            canvas.style.width = `${this.screenWidth}px`;
            canvas.style.height = `${this.screenHeight}px`;

            context.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        // Set the correct dimensions before creating the game and objects.
        this.resizeCanvas();

        window.addEventListener("resize", this.resizeCanvas);

        this.game = new Game(context, new Moon());

        const startPos = new Vector2(
            this.screenWidth / 2,
            this.screenHeight / 4
        );

        this.playerShip = new ShipTypeA(startPos, new Vector2(0, 0));
        this.game.addGameObject(this.playerShip);

        this.platform = new Platform(
            new Vector2(this.screenWidth / 4, this.screenHeight / 2),
            this.screenWidth / 2,
            20
        );

        this.game.addGameObject(this.platform);

        canvas.setAttribute("tabindex", "0");
        canvas.focus();


        canvas.addEventListener('keydown', (event) => {
            if (event.code === "KeyA") {
                event.preventDefault();
                this.playerShip.thrust.x = -this.playerShip.thrustCapability.x;
            } else if (event.code === "KeyD") {
                event.preventDefault();
                this.playerShip.thrust.x = this.playerShip.thrustCapability.x;
            } else if (event.code === "KeyW") {
                event.preventDefault();
                this.playerShip.thrust.y = this.playerShip.thrustCapability.y;
            } else if (event.code === "KeyS") {
                event.preventDefault();
                this.playerShip.thrust.y = -this.playerShip.thrustCapability.y;
            } else if (event.code === "KeyQ") {
                event.preventDefault();
                this.playerShip.angularAcceleration = -this.playerShip.angularThrustCapability;
            } else if (event.code === "KeyE") {
                event.preventDefault();
                this.playerShip.angularAcceleration = this.playerShip.angularThrustCapability;
            }
        });

        canvas.addEventListener("keyup", (e) => {
            if (["KeyA", "KeyD"].includes(e.code)) {
                e.preventDefault();
                this.playerShip.thrust.x = 0;
            }
            if (["KeyW", "KeyS"].includes(e.code)) {
                e.preventDefault();
                this.playerShip.thrust.y = 0;
            }
            if (["KeyQ", "KeyE"].includes(e.code)) {
                e.preventDefault();
                this.playerShip.angularAcceleration = 0;
            }
        });
    }

    run() {
        // Physics and game logic update.
        this.game.update();

        // Rendering update follows.
        this.context.clearRect(0, 0, this.screenWidth, this.screenHeight);
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.screenWidth, this.screenHeight);

        this.game.render(this.context);
        requestAnimationFrame(this.run);
    }
}


export default App;