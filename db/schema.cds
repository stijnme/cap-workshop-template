namespace workshop;

using { cuid } from '@sap/cds/common';

entity ProductionOrders : cuid {
  bookingId : UUID not null;
  tireSpec  : String(50) not null;
  garageId  : String(20) not null;
  status    : String(20) enum { Open; Finished } default 'Open';
}
