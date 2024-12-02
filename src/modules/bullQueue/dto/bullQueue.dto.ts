export class QueueLeaveRoomDto {
  socketId: string;
  roomName: string;
}

export class QueueStartJointRoomDto {
  userId: string;
}

export class QueueHandleLeaveRoomBEDto {
  userId: string;
}
