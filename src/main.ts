import App from './app.js';

const canvas = document.getElementById('gameArea');

if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas #gameArea was not found.');
}

const context = canvas.getContext('2d');

if (context === null) {
    throw new Error('Could not create a 2D canvas context.');
}

const app = new App(context);
requestAnimationFrame(app.run);
