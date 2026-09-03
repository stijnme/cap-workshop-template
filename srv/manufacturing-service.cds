using { workshop as db } from '../db/schema';

@path: '/manufacturing'
service ManufacturingService {
  entity ProductionOrders as projection on db.ProductionOrders actions {
    action finish() returns ProductionOrders;
  };
}
