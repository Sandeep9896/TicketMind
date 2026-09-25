import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import * as ticketService from '../services/ticket.service.js';
import SOCKET_EVENTS from '../socket/socketEvents.js';
import { emitToRole, emitToUser, emitToTicket } from '../socket/socketServer.js';
import {
  validateCreateTicketPayload,
  validateAssignTicketPayload,
  validateUpdateStatusPayload,
  validateAddCommunicationPayload,
  getCommunicationText
} from '../modules/ticket/validators/ticket.validator.js';

import { assignAgentWithAi } from '../services/ai-admin.service.js';
const createTicket = asyncHandler(async (req, res) => {
  validateCreateTicketPayload(req.body);

  const ticket = await ticketService.createTicket({
    ...req.body,
    createdBy: req.user._id
  });

  emitToRole('agent', SOCKET_EVENTS.TICKET_CREATED, {
    ticketId: ticket._id,
    ticket
  });


  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Ticket created successfully',
    data: ticket
  });
  console.log('[AI ADMIN] scheduling assignAgentWithAi for ticket:', ticket._id);
  assignAgentWithAi(ticket).catch((error) => {
    console.error('[AI ADMIN] assignAgentWithAi failed:', error?.message || error);
  });
});

const getAllTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.getAllTickets();

  res.status(StatusCodes.OK).json({
    success: true,
    data: tickets
  });
});

const getUserTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.getUserTickets(req.user._id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: tickets
  });
});

const assignTicketToAgent = asyncHandler(async (req, res) => {
  validateAssignTicketPayload(req.params.ticketId, req.body);

  const ticket = await ticketService.assignTicketToAgent({
    ticketId: req.params.ticketId,
    agentId: req.body.agentId
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Ticket assigned successfully',
    data: ticket
  });
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  validateUpdateStatusPayload(req.params.ticketId, req.body);

  const ticket = await ticketService.updateTicketStatus({
    ticketId: req.params.ticketId,
    status: req.body.status,
    currentUser: req.user
  });

  emitToUser(ticket.createdBy._id, SOCKET_EVENTS.TICKET_STATUS_UPDATED, {
    ticketId: ticket._id,
    status: ticket.status,
    ticket
  });

  emitToTicket(ticket._id, SOCKET_EVENTS.TICKET_STATUS_UPDATED, {
    ticketId: ticket._id,
    status: ticket.status,
    ticket
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Ticket status updated successfully',
    data: ticket
  });
});

const addCommunication = asyncHandler(async (req, res) => {
  validateAddCommunicationPayload(req.params.ticketId, req.body);

  const ticket = await ticketService.addCommunication({
    ticketId: req.params.ticketId,
    communication: getCommunicationText(req.body),
    currentUser: req.user
  });

  const latestCommunication = ticket.comments[ticket.comments.length - 1];

  emitToTicket(ticket._id, SOCKET_EVENTS.TICKET_COMMUNICATION_ADDED, {
    ticketId: ticket._id,
    communication: latestCommunication,
    ticket
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Communication added successfully',
    data: ticket
  });
});

export {
  createTicket,
  getAllTickets,
  getUserTickets,
  assignTicketToAgent,
  updateTicketStatus,
  addCommunication
};
