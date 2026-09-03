# Plan: manufacturing service

Source: `specs/manufacturing.md`. Port `4005`, OData path `/manufacturing`.

## Entities

**ProductionOrders** (`cuid`)

- `bookingId` : UUID, required, comes from the inbound event
- `tireSpec` : String(50), required
- `garageId` : String(20), required, passed through unchanged
- `status` : String(20) enum `Open` (default) / `Finished`

## Endpoints

- `GET /manufacturing/ProductionOrders`, `GET /manufacturing/ProductionOrders(<ID>)` - list, read one, `$filter=bookingId eq <id>` must work
- `POST /manufacturing/ProductionOrders(<ID>)/ManufacturingService.finish` - bound action, only allowed in `Open`, sets `Finished`, emits `TireManufactured`, returns the order. `409` on wrong state, `404` on unknown id.

No POST to create an order by hand: orders come from the inbound event only.

## Events

- in `BookingCreated` `{ bookingId, tireSpec, garageId }` -> creates one `ProductionOrder` in status `Open`
- out `TireManufactured` `{ bookingId, tireSpec, garageId, orderId }` -> emitted when `finish` succeeds

## Build order

Every step leaves the service runnable and `npm run check` green.

1. **Entity and read endpoints** (`issues/10-*.md`): rename `Greetings`/`HelloService` to `ProductionOrders`/`ManufacturingService`, full field set, seed CSV, GET + `$filter` covered by tests. No action yet, no events yet - this is the foundation everything else builds on.
2. **Inbound event** (`issues/20-*.md`): subscribe to `BookingCreated` in `init()`, create a `ProductionOrder` in status `Open` from the payload. Test by emitting the event and reading the row back over HTTP.
3. **Action with outbound event** (`issues/30-*.md`): bound action `finish`, state check (`409`/`404`), status transition, emits `TireManufactured` with exactly `{ bookingId, tireSpec, garageId, orderId }`. Test by subscribing to the event in the test before calling the action.

## Tests needed per step

- Step 1: GET list returns seeded rows, GET by key, `$filter=bookingId eq <id>` returns the right row.
- Step 2: emitting `BookingCreated` creates exactly one `ProductionOrder` with the right fields and status `Open`.
- Step 3: `finish` on `Open` returns `Finished` and the event fires with the exact payload; `finish` on `Finished` answers `409`; `finish` on an unknown id answers `404`.
