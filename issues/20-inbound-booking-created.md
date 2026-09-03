# Create a ProductionOrder from inbound BookingCreated

## Goal

An inbound `BookingCreated` event creates exactly one `ProductionOrder` in status `Open`, without any HTTP call.

## Context

From `specs/manufacturing.md`, section "Events", inbound row: `BookingCreated` `{ bookingId, tireSpec, garageId }` creates a `ProductionOrder` in status `Open`. Per `AGENTS.md`: subscribe with `messaging.on('BookingCreated', ...)` inside `init()`, before `super.init()`'s server starts listening, use `msg.data` for the payload. There is still no POST to create an order by hand.

## Acceptance criteria

- [ ] emitting `BookingCreated` with `{ bookingId, tireSpec, garageId }` creates exactly one `ProductionOrder`
- [ ] the created row has status `Open` and carries `bookingId`, `tireSpec`, `garageId` unchanged
- [ ] the row is readable afterwards via `GET /manufacturing/ProductionOrders(<ID>)`

## Files likely touched

- `srv/manufacturing-service.ts`
- `test/manufacturing.test.ts`

## Done when

- [ ] tests cover every acceptance criterion
- [ ] `npm run check` green, hook passed
- [ ] PR opened with a `curl` example, reviewed by the other pair, merged
