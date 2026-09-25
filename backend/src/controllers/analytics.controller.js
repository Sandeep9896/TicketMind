import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import * as analyticsService from '../services/analytics.service.js';

const getOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTicketOverviewStats();

  res.status(StatusCodes.OK).json({
    success: true,
    data
  });
});

const getTicketsPerCategory = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTicketsPerCategory();

  res.status(StatusCodes.OK).json({
    success: true,
    data
  });
});

const getAgentPerformance = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAgentPerformanceStats();

  res.status(StatusCodes.OK).json({
    success: true,
    data
  });
});

export { getOverview, getTicketsPerCategory, getAgentPerformance };
