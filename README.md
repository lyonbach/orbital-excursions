# Orbital Excursions

A 2D side-view space-tourism shuttle landing game prototype built with HTML, Canvas, and JavaScript.

Open `index.html` in any modern browser.

## Controls

- `W` / `Up`: main engine
- `A` / `D`: lateral RCS
- `Q` / `E`: rotate
- `Enter`: start or retry

## Goal

Deliver passengers to the illuminated landing pad without damaging the hull or crew, while managing limited fuel and avoiding excessive G-forces.

## Systems

- Separate vertical and lateral G-force tracking
- Limited fuel
- Ground-impact hull damage
- Passenger health and happiness affected by acceleration and landing quality
- Landing-pad detection and mission scoring

## Payout

```text
money = 500
      + (fuelPercent / 100) * 500
      + happinessPercent * 5
```

Failed missions pay nothing.
