export enum StatusEnum {
  SEARCHING = 'SEARCHING', // Finding a shoemaker
  ACCEPTED = 'ACCEPTED', // Found a shoemaker
  MEETING = 'MEETING',
  INPROGRESS = 'INPROGRESS', // Shoemaker is working on the shoe
  COMPLETED = 'COMPLETED', // Trip is completed
  SHOEMAKER_CANCEL = 'SHOEMAKER_CANCEL', // Shoemaker canceled the trip after accepting
  CUSTOMER_CANCEL = 'CUSTOMER_CANCEL', // Customer canceled the trip
}

export enum PartialStatusEnum {
  MEETING = StatusEnum.MEETING,
  INPROGRESS = StatusEnum.INPROGRESS,
  COMPLETED = StatusEnum.COMPLETED,
}

export enum ShoemakerStatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum StatusBlogEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum SocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECTION_ERROR = 'connect_error',
  CONNECTION_TIMEOUT = 'connect_timeout',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnect_attempt',
  RECONNECTING = 'reconnecting',
  RECONNECT_ERROR = 'reconnect_error',
  RECONNECT_FAILED = 'reconnect_failed',
  RECONNECT_ABORTED = 'reconnect_aborted',
  FIND_CLOSET_SHOE_MAKERS = 'find-closest-shoemakers',
  NOT_FOUND = 'not-found', //find-closest-shoemaker
  UPDATE_LOCATION = 'update-location',
  TRIP_STATUS = 'trip-status',
  PAYMENT_STATUS = 'payment-status',
}
