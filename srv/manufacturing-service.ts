import cds from '@sap/cds'

/**
 * Handlers for the manufacturing service. This issue only covers the read endpoints;
 * the inbound BookingCreated event and the finish action follow in later issues.
 */
export default class ManufacturingService extends cds.ApplicationService {
  async init() {
    // Every service in the chain needs a messaging connection, even before it uses it.
    await cds.connect.to('messaging')

    return super.init()
  }
}
