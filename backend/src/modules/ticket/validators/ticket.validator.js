import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../utils/ApiError.js';
import { ticketStatuses, ticketPriorities, ticketCategories } from '../../../models/ticket.model.js';

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validateCreateTicketPayload = (payload) => {
  const { title, description, priority, category } = payload;

  if (!title || !description) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'title and description are required');
  }

  if (title.trim().length < 5 || title.trim().length > 150) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'title must be between 5 and 150 characters');
  }

  if (description.trim().length < 10 || description.trim().length > 5000) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'description must be between 10 and 5000 characters');
  }

  if (priority && !ticketPriorities.includes(priority)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `priority must be one of: ${ticketPriorities.join(', ')}`);
  }

  if (category && !ticketCategories.includes(category)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `category must be one of: ${ticketCategories.join(', ')}`);
  }
};

const validateAssignTicketPayload = (ticketId, payload) => {
  if (!isValidObjectId(ticketId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ticketId');
  }

  if (!payload.agentId || !isValidObjectId(payload.agentId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Valid agentId is required');
  }
};

const validateUpdateStatusPayload = (ticketId, payload) => {
  if (!isValidObjectId(ticketId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ticketId');
  }

  if (!payload.status || !ticketStatuses.includes(payload.status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `status must be one of: ${ticketStatuses.join(', ')}`);
  }
};

const getCommunicationText = (payload) => payload.communication || payload.comment;

const validateAddCommunicationPayload = (ticketId, payload) => {
  if (!isValidObjectId(ticketId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid ticketId');
  }

  const communication = getCommunicationText(payload);

  if (!communication || communication.trim().length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'communication is required');
  }

  if (communication.trim().length > 2000) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'communication cannot exceed 2000 characters');
  }
};

export {
  validateCreateTicketPayload,
  validateAssignTicketPayload,
  validateUpdateStatusPayload,
  validateAddCommunicationPayload,
  getCommunicationText
};
