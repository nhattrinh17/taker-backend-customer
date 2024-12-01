import { Trip } from '@entities/trip.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RecoverEvent,
  RemoveEvent,
  SoftRemoveEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class TripSubscriber implements EntitySubscriberInterface<Trip> {
  tripId: string;
  constructor(
    dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Trip;
  }

  /**
   * Called after entity is loaded.
   */
  afterLoad(entity: any) {
    // console.log(`AFTER ENTITY LOADED: `, entity);
    this.tripId = entity.id;
  }

  /**
   * Called before trip insertion.
   */
  beforeInsert(event: InsertEvent<Trip>) {
    console.log(`BEFORE TRIP INSERTED: `, event.entity);
  }

  /**
   * Called after entity insertion.
   */
  afterInsert(event: InsertEvent<Trip>) {
    console.log(`AFTER ENTITY INSERTED: `, event.entity);
    try {
      this.tripId &&
        this.eventEmitter.emit('update-trip-log', {
          tripId: this.tripId,
          type: 'CREATE',
          data: JSON.stringify(event.entity),
        });
    } catch (e) {}
  }

  /**
   * Called before entity update.
   */
  beforeUpdate(event: UpdateEvent<Trip>) {
    console.log(`BEFORE ENTITY UPDATED: `, event.entity);
  }

  /**
   * Called after entity update.
   */
  afterUpdate(event: UpdateEvent<Trip>) {
    console.log(`AFTER ENTITY UPDATED: `, this.tripId, event.entity);
    try {
      this.tripId &&
        this.eventEmitter.emit('update-trip-log', {
          tripId: this.tripId,
          type: 'UPDATE',
          data: JSON.stringify(event.entity),
        });
    } catch (e) {}
  }

  /**
   * Called before entity removal.
   */
  beforeRemove(event: RemoveEvent<any>) {
    console.log(
      `BEFORE ENTITY WITH ID ${event.entityId} REMOVED: `,
      event.entity,
    );
  }

  /**
   * Called after entity removal.
   */
  afterRemove(event: RemoveEvent<any>) {
    console.log(
      `AFTER ENTITY WITH ID ${event.entityId} REMOVED: `,
      event.entity,
    );
  }

  /**
   * Called before entity removal.
   */
  beforeSoftRemove(event: SoftRemoveEvent<any>) {
    console.log(
      `BEFORE ENTITY WITH ID ${event.entityId} SOFT REMOVED: `,
      event.entity,
    );
  }

  /**
   * Called after entity removal.
   */
  afterSoftRemove(event: SoftRemoveEvent<any>) {
    console.log(
      `AFTER ENTITY WITH ID ${event.entityId} SOFT REMOVED: `,
      event.entity,
    );
  }

  /**
   * Called before entity recovery.
   */
  beforeRecover(event: RecoverEvent<any>) {
    console.log(
      `BEFORE ENTITY WITH ID ${event.entityId} RECOVERED: `,
      event.entity,
    );
  }

  /**
   * Called after entity recovery.
   */
  afterRecover(event: RecoverEvent<any>) {
    console.log(
      `AFTER ENTITY WITH ID ${event.entityId} RECOVERED: `,
      event.entity,
    );
  }
}
