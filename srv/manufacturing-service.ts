import cds from '@sap/cds'

const { INSERT } = cds.ql

type BookingCreatedPayload = {
  bookingId: string
  tireSpec: string
  garageId: string
}

/**
 * Handlers for the manufacturing service. This issue adds the inbound BookingCreated
 * event; the finish action and its outbound event follow in a later issue.
 */
export default class ManufacturingService extends cds.ApplicationService {
  async init() {
    const { ProductionOrders } = this.entities

    const messaging = await cds.connect.to('messaging')

    messaging.on('BookingCreated', async (msg: { data: unknown }) => {
      const { bookingId, tireSpec, garageId } = msg.data as BookingCreatedPayload
      await INSERT.into(ProductionOrders).entries({ bookingId, tireSpec, garageId })
    })

    return super.init()
  }
}
