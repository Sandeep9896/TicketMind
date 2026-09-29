import mongoose from 'mongoose';

const ticketStatuses = ['open', 'in_progress', 'resolved', 'closed'];
const ticketPriorities = ['low', 'medium', 'high', 'urgent'];
const ticketCategories = ['Hardware', 'Software', 'Network', 'Access', 'Security', 'Account', 'Billing', 'Other'];

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000
    },
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    _id: false,
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000
    },
    priority: {
      type: String,
      enum: ticketPriorities,
      default: 'medium'
    },
    category: {
      type: String,
      enum: ticketCategories,
      default: 'Other',
      index: true
    },
    status: {
      type: String,
      enum: ticketStatuses,
      default: 'open'
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    comments: {
      type: [commentSchema],
      default: []
    },
    aiChatSummary: {
      type: String,
      default: '',
      maxlength: 10000
    },
  },
  {
    timestamps: true
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

export { Ticket, ticketStatuses, ticketPriorities, ticketCategories };
