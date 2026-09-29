import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import * as aiTicketService from '../services/ai-ticket.service.js';
import {
  validateDescriptionPayload,
  validateReplyPayload,
  validateSummaryPayload
} from '../modules/ai-service/validators/ai-ticket.validator.js';
import ApiError from '../utils/ApiError.js';

const categorizeTicket = asyncHandler(async (req, res) => {
  validateDescriptionPayload(req.body);

  const data = await aiTicketService.categorizeTicket(req.body.description);

  res.status(StatusCodes.OK).json({
    success: true,
    data
  });
});

const detectPriority = asyncHandler(async (req, res) => {
  validateDescriptionPayload(req.body);

  const data = await aiTicketService.detectPriority(req.body.description);

  res.status(StatusCodes.OK).json({
    success: true,
    data
  });
});

const analyzeTicket = asyncHandler(async (req, res) => {
  validateDescriptionPayload(req.body);

  const data = await aiTicketService.analyzeTicket(req.body.description);

  res.status(StatusCodes.OK).json({
    success: true,
    data
  });
});

const suggestDescriptions = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title || !title.toString().trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'title is required');
  }

  const data = await aiTicketService.suggestDescriptions(title.toString());

  res.status(StatusCodes.OK).json({
    success: true,
    data
  });
});

const generateProfessionalReply = asyncHandler(async (req, res) => {
  validateReplyPayload(req.body);

  const data = await aiTicketService.generateProfessionalReply({
    ...req.body,
    currentUser: req.user
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data
  });
});

const summarizeTicketConversation = asyncHandler(async (req, res) => {
  validateSummaryPayload(req.body);

  const data = await aiTicketService.summarizeTicketConversation(req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    data
  });
});

const getTicketConversation = asyncHandler(async (req, res) => {
  const data = await aiTicketService.getTicketConversation({
    ticketId: req.params.ticketId,
    currentUser: req.user
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data
  });
});

const sendChatMessage = asyncHandler(async (req, res) => {
  const ticketId = req.body?.ticketId?.toString().trim();
  const content = req.body?.content?.toString().trim();
  if (!ticketId) throw new ApiError(StatusCodes.BAD_REQUEST, 'ticketId is required');
  if (!content) throw new ApiError(StatusCodes.BAD_REQUEST, 'content is required');
  const data = await aiTicketService.chat({
    ticketId,
    userId: req.user._id,
    content,
    currentUser: req.user
  });
  res.json({ success: true, data });
});

const getChatHistory = asyncHandler(async (req, res) => {
  const ticketId = req.params.ticketId;
  const data = await aiTicketService.getChatHistory({
    ticketId,
    userId: req.user._id,
    currentUser: req.user,
    limit: req.query.limit
  });
  res.json({ success: true, data });
});

export {
  categorizeTicket,
  detectPriority,
  analyzeTicket,
  generateProfessionalReply,
  summarizeTicketConversation,
  getTicketConversation,
  sendChatMessage,
  getChatHistory
};
export { suggestDescriptions };
