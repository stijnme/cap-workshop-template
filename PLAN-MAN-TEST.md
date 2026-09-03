# Plan: manual tests with VS Code "REST Client"

Goal: exercise the manufacturing service's HTTP surface against a real, running `cds watch`
instance, no mocks. This complements (never replaces) the automated suite in
`test/manufacturing.test.ts`, which stays the source of truth for `npm run check`.

## Scope

Only HTTP endpoints are covered here: `GET` list/read/filter and the `finish` bound action.

`BookingCreated` (in) and `TireManufactured` (out) travel over CAP `file-based-messaging`
(`~/.cds-msg-box`), not HTTP. There is no request a human can fire at this service to trigger or
observe them directly. They stay covered by the automated tests (`messaging.emit(...)` /
`messaging.on(...)` in `test/manufacturing.test.ts`) and, per `README.md`, come together for real
only in the finale with all four services running. Out of scope for this plan.

## Prerequisites

- VS Code extension `humao.rest-client` ("REST Client") installed.
- `npm install` once (also wires the pre-commit hook).
- The CAP project running in its own terminal: `npm run watch` (port `4005`, override with
  `PORT=<port> npm run watch`). Leave it running for the whole session; do not use `cds.test`,
  the REST Client talks to the real HTTP server.
- The seed data resets only when the process restarts (sqlite is `:memory:`). If a run mutates
  state (e.g. `finish`), restart `npm run watch` to get back to the seeded fixture before rerunning
  the file top to bottom.
- Per `README.md`: only one `cds watch` per machine/user at a time, since they share the same
  message box file. Not an issue here since this plan never touches messaging.

## File layout

```
http/
  manufacturing.http   # one file for this service, REST Client variables + requests
```

`http/` is new, sits next to `srv/`, `test/`, not under `test/` since these are not part of
`npm test` / `npm run check`. They are a manual, human-driven complement. Commit the file, no
secrets in it.

## `manufacturing.http` content

Top of file, variables so the host/port and the seeded fixture ids are defined once:

```http
@host = http://localhost:4005
@base = {{host}}/manufacturing
@seededId = 00000000-0000-0000-0000-000000000001
@seededBookingId = 00000000-0000-0000-0000-000000000101
@unknownId = 00000000-0000-0000-0000-000000000999
```

Requests, separated by `###`, one per acceptance criterion, ordered so read-only calls come first
and mutating `finish` calls come last:

1. `GET {{base}}/ProductionOrders`
   `# expect: 200, value[] contains the seeded row with status "Open"`
2. `GET {{base}}/ProductionOrders({{seededId}})`
   `# expect: 200, bookingId equals {{seededBookingId}}`
3. `GET {{base}}/ProductionOrders?$filter=bookingId eq {{seededBookingId}}`
   `# expect: 200, value.length == 1, value[0].ID == {{seededId}}`
4. `POST {{base}}/ProductionOrders({{seededId}})/ManufacturingService.finish`
   `# expect: 200, status == "Finished"`
5. `GET {{base}}/ProductionOrders({{seededId}})` (again)
   `# expect: 200, status == "Finished" (transition persisted)`
6. `POST {{base}}/ProductionOrders({{seededId}})/ManufacturingService.finish` (again)
   `# expect: 409 (already Finished)`
7. `POST {{base}}/ProductionOrders({{unknownId}})/ManufacturingService.finish`
   `# expect: 404 (unknown id)`

Each request in the file carries its `# expect: ...` comment directly above it, so a developer
reading the REST Client response pane knows immediately whether the result is correct.

## Steps to build the file

1. Create `http/manufacturing.http`.
2. Add the `@host`/`@base`/`@seededId`/`@seededBookingId`/`@unknownId` variables at the top.
3. Add the seven requests above in order, each with its `# expect: ...` comment, separated by
   `###`.
4. Add a short header comment at the top of the file pointing back to this plan and to
   `npm run watch` as the prerequisite.

## Steps to run manually

1. `npm run watch` in one terminal (fresh sqlite in-memory db, seeded fixture loaded).
2. Open `http/manufacturing.http` in VS Code.
3. Click "Send Request" above requests 1-3, confirm the read-only baseline against the comments.
4. Click "Send Request" on 4, confirm `200`/`Finished`, then 5 to confirm persistence.
5. Click "Send Request" on 6 and 7, confirm `409` and `404`.
6. To rerun from a clean slate, stop and restart `npm run watch`, then repeat from step 3.

## Done when

- [ ] `http/manufacturing.http` exists with the variables and the seven requests above
- [ ] every request has an `# expect: ...` comment with the status and the field(s) to check
- [ ] a developer can go from `git clone` to all seven requests green using only `npm install`,
      `npm run watch`, and the REST Client "Send Request" action, no other tooling or mocks
