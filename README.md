# Orbital Excursions

A 2D side-view space-tourism shuttle landing game prototype built with HTML, Canvas, and JavaScript.

Open `index.html` in any modern browser.

## Controls

- `W` / `Up`: main engine
- `A` / `D`: lateral RCS
- `Q` / `E`: rotate
- `Enter`: start or retry

## Goal

Deliver passengers to the illuminated landing pad quickly, safely, and comfortably while managing limited fuel.

## Payout

```text
money = 500
      + (fuelPercent / 100) * 500
      + happinessPercent * 5
      + max(0, (90 - missionSeconds) * 10)
```

The speed bonus is capped at 900 credits. Failed missions pay nothing.
