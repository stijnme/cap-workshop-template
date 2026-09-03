import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import cds from '@sap/cds'

const test = cds.test('.')
const { GET } = test

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
})
