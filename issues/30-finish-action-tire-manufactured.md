# Add finish action emitting TireManufactured

## Goal

`finish` on an `Open` `ProductionOrder` sets it to `Finished`, emits `TireManufactured`, and returns the updated order. Wrong state or unknown id answer with the right HTTP status.

## Context

From `specs/manufacturing.md`, section "Endpoints": `POST /manufacturing/ProductionOrders(<ID>)/ManufacturingService.finish`, bound action, allowed only in `Open`. Section "Events", outbound row: `TireManufactured` `{ bookingId, tireSpec, garageId, orderId }`. Per `AGENTS.md`: validate current state, `req.reject(409, ...)` for wrong state, `req.reject(404, ...)` for missing row, emit from an `after` handler so the row exists, return `SELECT.one.from(req.subject)`. Do not name the handler method `finish` on the service class if it collides with the action registration rule, follow the convention in `AGENTS.md` (`this.on('finish', ProductionOrders, ...)`, helper named differently if needed).

## Acceptance criteria

- [ ] `finish` on an `Open` order returns it with `status: "Finished"`
- [ ] `finish` emits `TireManufactured` with exactly `{ bookingId, tireSpec, garageId, orderId }`
- [ ] `finish` on a `Finished` order answers `409`
- [ ] `finish` on an unknown id answers `404`

## Files likely touched

- `srv/manufacturing-service.cds`
- `srv/manufacturing-service.ts`
- `test/manufacturing.test.ts`

## Done when

- [ ] tests cover every acceptance criterion
- [ ] `npm run check` green, hook passed
- [ ] PR opened with a `curl` example, reviewed by the other pair, merged
