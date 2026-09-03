import cds from '@sap/cds'

const { INSERT, SELECT, UPDATE } = cds.ql

type BookingCreatedPayload = {
  bookingId: string
  tireSpec: string
  garageId: string
}

type ProductionOrderRow = {
  ID: string
  bookingId: string
  tireSpec: string
  garageId: string
  status: string
}

/**
 * Handlers for the manufacturing service: inbound BookingCreated creates a
 * ProductionOrder, the finish action transitions it to Finished and emits
 * the outbound TireManufactured event.
 */
export default class ManufacturingService extends cds.ApplicationService {
  async init() {
    const { ProductionOrders } = this.entities

    const messaging = await cds.connect.to('messaging')

    messaging.on('BookingCreated', async (msg: { data: unknown }) => {
      const { bookingId, tireSpec, garageId } = msg.data as BookingCreatedPayload
      await INSERT.into(ProductionOrders).entries({ bookingId, tireSpec, garageId })
    })

    this.on('finish', ProductionOrders, async (req) => {
      const order = (await SELECT.one.from(req.subject)) as ProductionOrderRow | undefined
      if (!order) return req.reject(404, 'ProductionOrder not found')
      if (order.status !== 'Open') return req.reject(409, `ProductionOrder is ${order.status}`)

      await UPDATE.entity(ProductionOrders, order.ID).with({ status: 'Finished' })
      return SELECT.one.from(req.subject)
    })

    this.after(
      'finish',
      ProductionOrders,
      async (result: ProductionOrderRow | ProductionOrderRow[]) => {
        const order = Array.isArray(result) ? result[0] : result
        await messaging.emit('TireManufactured', {
          bookingId: order.bookingId,
          tireSpec: order.tireSpec,
          garageId: order.garageId,
          orderId: order.ID,
        })
      },
    )

    return super.init()
  }
}
