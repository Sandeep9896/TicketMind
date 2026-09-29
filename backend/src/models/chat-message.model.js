import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 10000
    },
    action: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

chatMessageSchema.index({ ticketId: 1, createdAt: -1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
