import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';
import { Ticket } from '../models/ticket.model.js';
import SOCKET_EVENTS from '../socket/socketEvents.js';
import { emitNotificationToRoles, emitNotificationToUsers } from '../socket/socketServer.js';

const basePopulate = [
  { path: 'createdBy', select: 'name email role' },
  { path: 'assignedTo', select: 'name email role' },
  { path: 'comments.commentedBy', select: 'name email role' }
];

const notifyTicketAssignment = async (ticket) => {
  const populatedTicket = await Ticket.findById(ticket._id).populate(basePopulate);
  const notification = {
    ticketId: populatedTicket._id,
    ticket: populatedTicket,
    assignedTo: populatedTicket.assignedTo
  };

  await emitNotificationToUsers([populatedTicket.assignedTo._id], SOCKET_EVENTS.TICKET_ASSIGNED, notification);
  // await emitNotificationToRoles(['admin'], SOCKET_EVENTS.TICKET_ASSIGNED, notification);

  return populatedTicket;
};

const createTicket = async ({ title, description, priority, category, createdBy }) => {
  const ticket = await Ticket.create({
    title,
    description,
    priority: priority || 'medium',
    category: category || 'Other',
    createdBy
  });

  const populatedTicket = await Ticket.findById(ticket._id).populate(basePopulate);

  const notification = {
    ticketId: populatedTicket._id,
    ticket: populatedTicket
  };

  await emitNotificationToRoles(['admin'], SOCKET_EVENTS.TICKET_CREATED, notification);

  return populatedTicket;
};

const getAllTickets = async () => Ticket.find({}).sort({ createdAt: -1 }).populate(basePopulate);

const getUserTickets = async (userId) =>
  Ticket.find({ createdBy: userId }).sort({ createdAt: -1 }).populate(basePopulate);

const assignTicketToAgent = async ({ ticketId, agentId }) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ticket not found');
  }

  const agent = await User.findById(agentId);

  if (!agent || agent.role !== 'agent') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'agentId must belong to an agent user');
  }

  ticket.assignedTo = agentId;
  await ticket.save();

  return notifyTicketAssignment(ticket);
};

const updateTicketStatus = async ({ ticketId, status, currentUser }) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ticket not found');
  }

  const isAdmin = currentUser.role === 'admin';
  const isAssignedAgent =
    currentUser.role === 'agent' &&
    ticket.assignedTo &&
    ticket.assignedTo.toString() === currentUser._id.toString();

  if (!isAdmin && !isAssignedAgent) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admin or assigned agent can update ticket status');
  }

  ticket.status = status;

  if (['resolved', 'closed'].includes(status) && !ticket.resolvedAt) {
    ticket.resolvedAt = new Date();
  }

  if (['open', 'in_progress'].includes(status)) {
    ticket.resolvedAt = null;
  }

  await ticket.save();

  return Ticket.findById(ticket._id).populate(basePopulate);
};

const addCommunication = async ({ ticketId, communication, currentUser }) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ticket not found');
  }

  const isAdmin = currentUser.role === 'admin';
  const isAssignedAgent =
    currentUser.role === 'agent' && ticket.assignedTo && ticket.assignedTo.toString() === currentUser._id.toString();
  const isOwner = ticket.createdBy.toString() === currentUser._id.toString();

  if (!isAdmin && !isAssignedAgent && !isOwner) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Not allowed to communicate on this ticket');
  }

  ticket.comments.push({
    comment: communication.trim(),
    commentedBy: currentUser._id
  });

  await ticket.save();

  return Ticket.findById(ticket._id).populate(basePopulate);
};
const updateTicket = async ({ ticketId, updateData, currentUser }) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ticket not found');
  }

  /* ===== AUTHORIZATION ===== */
  const isAdmin = currentUser.role === 'admin';
  const isAssignedAgent =
    currentUser.role === 'agent' && ticket.assignedTo && ticket.assignedTo.toString() === currentUser._id.toString();
  const isOwner = ticket.createdBy.toString() === currentUser._id.toString();

  if (!isAdmin && !isAssignedAgent && !isOwner) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Not allowed to update this ticket');
  }

  /* ===== FIELD-LEVEL RESTRICTIONS ===== */
  const restrictedFields = ['priority', 'category', 'assignedTo', 'createdBy',]; // Fields only admin can update
  const isDescriptionUpdate = 'description' in updateData;

  // Only admin can update restricted fields
  if (!isAdmin) {
    restrictedFields.forEach((field) => {
      if (field in updateData) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `Only admins can update ${field}`
        );
      }
    });
  }

  // Apply updates
  Object.keys(updateData).forEach((field) => {
    if (restrictedFields.includes(field)) {
      // Only admin can update restricted fields
      if (isAdmin) {
        ticket[field] = updateData[field];
      }
    } else if (field === 'description' && isDescriptionUpdate) {
      // For description, append additional details instead of replacing
      ticket[field] = `${ticket[field]}\n\n--- Updated Details ---\n${updateData[field]}`;
    } else {
      ticket[field] = updateData[field];
    }
  });

  await ticket.save();

  return Ticket.findById(ticket._id).populate(basePopulate);
};

export {
  createTicket,
  getAllTickets,
  getUserTickets,
  assignTicketToAgent,
  updateTicketStatus,
  addCommunication,
  updateTicket,
  notifyTicketAssignment
};
