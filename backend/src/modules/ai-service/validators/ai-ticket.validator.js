import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../utils/ApiError.js';

const requireText = (value, fieldName, minLength = 3) => {
  if (!value || typeof value !== 'string') {
    throw new ApiError(StatusCodes.BAD_REQUEST, `${fieldName} is required`);
  }

  if (value.trim().length < minLength) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `${fieldName} must be at least ${minLength} characters`);
  }
};

const validateDescriptionPayload = (body) => {
  requireText(body.description, 'description', 3);
};

const validateReplyPayload = (body) => {
  const isFollowUp = body.isFollowUp === true;
  const minLength = isFollowUp ? 1 : 3;
  
  if (!body.description || typeof body.description !== 'string') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'description is required');
  }

  if (body.description.trim().length < minLength) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `description must be at least ${minLength} character(s)`);
  }

  if (body.ticketTitle && typeof body.ticketTitle !== 'string') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ticketTitle must be a string');
  }

  if (body.conversation && typeof body.conversation !== 'string') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'conversation must be a string');
  }

  if (body.ticketId && typeof body.ticketId !== 'string') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ticketId must be a string');
  }

  if (body.isFollowUp !== undefined && typeof body.isFollowUp !== 'boolean') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'isFollowUp must be a boolean');
  }

  if (body.forceCreateTicket !== undefined && typeof body.forceCreateTicket !== 'boolean') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'forceCreateTicket must be a boolean');
  }
};

const validateSummaryPayload = (body) => {
  requireText(body.conversation, 'conversation', 3);

  if (body.description && typeof body.description !== 'string') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'description must be a string');
  }
};

export { validateDescriptionPayload, validateReplyPayload, validateSummaryPayload };
