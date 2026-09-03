import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import cds from '@sap/cds'

const test = cds.test('.')
const { GET, POST } = test

const SEEDED_ID = '00000000-0000-0000-0000-000000000001'
const SEEDED_BOOKING_ID = '00000000-0000-0000-0000-000000000101'

describe('ManufacturingService', () => {
  it('lists the seeded production orders', async () => {
    const { data } = await GET('/manufacturing/ProductionOrders')
    assert.equal(data.value.length, 1)
    assert.equal(data.value[0].tireSpec, '205/55R16')
    assert.equal(data.value[0].garageId, 'garage-1')
    assert.equal(data.value[0].status, 'Open')
  })

  it('reads one production order by key', async () => {
    const { data } = await GET(`/manufacturing/ProductionOrders(${SEEDED_ID})`)
    assert.equal(data.bookingId, SEEDED_BOOKING_ID)
  })

  it('filters production orders by bookingId', async () => {
    const { data } = await GET(
      `/manufacturing/ProductionOrders?$filter=bookingId eq ${SEEDED_BOOKING_ID}`,
    )
    assert.equal(data.value.length, 1)
    assert.equal(data.value[0].ID, SEEDED_ID)
  })

  it('creates a ProductionOrder from an inbound BookingCreated event', async () => {
    const bookingId = '00000000-0000-0000-0000-000000000102'
    const messaging = await cds.connect.to('messaging')

    await messaging.emit('BookingCreated', {
      bookingId,
      tireSpec: '225/45R17',
      garageId: 'garage-2',
    })

    const { data } = await GET(`/manufacturing/ProductionOrders?$filter=bookingId eq ${bookingId}`)
    assert.equal(data.value.length, 1)
    assert.equal(data.value[0].tireSpec, '225/45R17')
    assert.equal(data.value[0].garageId, 'garage-2')
    assert.equal(data.value[0].status, 'Open')
  })

  it('finishes an Open order, sets status Finished, and emits TireManufactured', async () => {
    const messaging = await cds.connect.to('messaging')
    const received: unknown[] = []
    messaging.on('TireManufactured', async (msg: { data: unknown }) => {
      received.push(msg.data)
    })

    const { data } = await POST(
      `/manufacturing/ProductionOrders(${SEEDED_ID})/ManufacturingService.finish`,
      {},
    )

    assert.equal(data.status, 'Finished')
    assert.equal(received.length, 1)
    assert.deepEqual(received[0], {
      bookingId: SEEDED_BOOKING_ID,
      tireSpec: '205/55R16',
      garageId: 'garage-1',
      orderId: SEEDED_ID,
    })
  })

  it('answers 409 when finishing an already Finished order', async () => {
    await assert.rejects(
      POST(`/manufacturing/ProductionOrders(${SEEDED_ID})/ManufacturingService.finish`, {}),
      (err: { response: { status: number } }) => {
        assert.equal(err.response.status, 409)
        return true
      },
    )
  })

  it('answers 404 when finishing an unknown id', async () => {
    const unknownId = '00000000-0000-0000-0000-000000000999'
    await assert.rejects(
      POST(`/manufacturing/ProductionOrders(${unknownId})/ManufacturingService.finish`, {}),
      (err: { response: { status: number } }) => {
        assert.equal(err.response.status, 404)
        return true
      },
    )
  })
})
