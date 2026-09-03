# Replace Greetings with ProductionOrders and its GET endpoints

## Goal

The placeholder `Greetings`/`HelloService` is gone. `ProductionOrders` exists with its full field set from the spec, seeded, and reachable read-only over HTTP.

## Context

From `specs/manufacturing.md`, section "Entities": `ProductionOrders` with `bookingId`, `tireSpec`, `garageId`, `status` (enum `Open`/`Finished`, default `Open`). Section "Endpoints": the two GET routes and `$filter=bookingId eq <id>`. No action and no events in this issue, those come later. Service is `ManufacturingService` at `@path: '/manufacturing'`, port `4005`.

## Acceptance criteria

- [ ] `GET /manufacturing/ProductionOrders` lists the seeded orders
- [ ] `GET /manufacturing/ProductionOrders(<ID>)` reads one order
- [ ] `GET /manufacturing/ProductionOrders?$filter=bookingId eq <id>` returns only the matching row
- [ ] no file mentions `Greetings` or `HelloService` any more

## Files likely touched

- `db/schema.cds`
- `db/data/workshop-Greetings.csv` -> `db/data/workshop-ProductionOrders.csv`
- `srv/hello-service.cds` -> `srv/manufacturing-service.cds`
- `srv/hello-service.ts` -> `srv/manufacturing-service.ts`
- `test/hello.test.ts` -> `test/manufacturing.test.ts`
- `package.json` (port if changed)

## Done when

- [ ] tests cover every acceptance criterion
- [ ] `npm run check` green, hook passed
- [ ] PR opened with a `curl` example, reviewed by the other pair, merged
