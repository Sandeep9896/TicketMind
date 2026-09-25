import { Ticket } from '../models/ticket.model.js';

const getTicketOverviewStats = async () => {
  const [counts] = await Ticket.aggregate([
    {
      $group: {
        _id: null,
        totalTickets: { $sum: 1 },
        openTickets: {
          $sum: {
            $cond: [{ $eq: ['$status', 'open'] }, 1, 0]
          }
        },
        closedTickets: {
          $sum: {
            $cond: [{ $eq: ['$status', 'closed'] }, 1, 0]
          }
        }
      }
    }
  ]);

  const [resolution] = await Ticket.aggregate([
    {
      $match: {
        resolvedAt: { $ne: null },
        status: { $in: ['resolved', 'closed'] }
      }
    },
    {
      $project: {
        resolutionTimeMs: { $subtract: ['$resolvedAt', '$createdAt'] }
      }
    },
    {
      $group: {
        _id: null,
        avgResolutionTimeMs: { $avg: '$resolutionTimeMs' }
      }
    }
  ]);

  const avgResolutionTimeMs = resolution?.avgResolutionTimeMs || 0;

  return {
    totalTickets: counts?.totalTickets || 0,
    openTickets: counts?.openTickets || 0,
    closedTickets: counts?.closedTickets || 0,
    averageResolutionTimeMs: Number(avgResolutionTimeMs.toFixed(2)),
    averageResolutionTimeHours: Number((avgResolutionTimeMs / (1000 * 60 * 60)).toFixed(2))
  };
};

const getTicketsPerCategory = async () => {
  const data = await Ticket.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        category: { $ifNull: ['$_id', 'Uncategorized'] },
        count: 1
      }
    },
    {
      $sort: { count: -1, category: 1 }
    }
  ]);

  return data;
};

const getAgentPerformanceStats = async () => {
  const data = await Ticket.aggregate([
    {
      $match: {
        assignedTo: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$assignedTo',
        totalAssigned: { $sum: 1 },
        resolvedOrClosed: {
          $sum: {
            $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0]
          }
        },
        closedTickets: {
          $sum: {
            $cond: [{ $eq: ['$status', 'closed'] }, 1, 0]
          }
        },
        avgResolutionTimeMs: {
          $avg: {
            $cond: [
              {
                $and: [
                  { $in: ['$status', ['resolved', 'closed']] },
                  { $ne: ['$resolvedAt', null] }
                ]
              },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'agent'
      }
    },
    {
      $unwind: {
        path: '$agent',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        agentId: '$_id',
        agentName: '$agent.name',
        agentEmail: '$agent.email',
        totalAssigned: 1,
        resolvedOrClosed: 1,
        closedTickets: 1,
        resolutionRate: {
          $cond: [
            { $gt: ['$totalAssigned', 0] },
            {
              $round: [
                {
                  $multiply: [{ $divide: ['$resolvedOrClosed', '$totalAssigned'] }, 100]
                },
                2
              ]
            },
            0
          ]
        },
        averageResolutionTimeHours: {
          $cond: [
            { $gt: ['$avgResolutionTimeMs', 0] },
            { $round: [{ $divide: ['$avgResolutionTimeMs', 1000 * 60 * 60] }, 2] },
            0
          ]
        }
      }
    },
    {
      $sort: { resolutionRate: -1, totalAssigned: -1 }
    }
  ]);

  return data;
};

export {
  getTicketOverviewStats,
  getTicketsPerCategory,
  getAgentPerformanceStats
};
