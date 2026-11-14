# Orbital Excursions

## How to run

Install the dependencies and compile the TypeScript source:

```bash
npm install
npm run build
```

Serve the project directory with a local web server, then open the displayed URL in a browser:

```bash
python3 -m http.server
```

## Commands

| Command | Description |
| --- | --- |
| `npm run build` | Compiles TypeScript from `src/` into `dist/`. |
| `npm run watch` | Recompiles TypeScript whenever source files change. |
| `npm run typecheck` | Checks TypeScript types without writing output files. |
| `npm run start` | Starts an http server at the default port. |
| `npm test` | Currently has no test suite configured and exits with an error. |
