const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_TICKET_ROOM: 'ticket:join',
  LEAVE_TICKET_ROOM: 'ticket:leave',
  TICKET_CREATED: 'ticket:created',
  TICKET_STATUS_UPDATED: 'ticket:status-updated',
  TICKET_COMMUNICATION_ADDED: 'ticket:communication-added'
};

export default SOCKET_EVENTS;
