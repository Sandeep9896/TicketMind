import mongoose from 'mongoose';

const conversationMessageSchema = new mongoose.Schema(
	{
		role: {
			type: String,
			enum: ['user', 'assistant', 'system'],
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
			type: String,
			default: null
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed,
			default: {}
		},
		createdAt: {
			type: Date,
			default: Date.now
		}
	},
	{ _id: false }
);

const conversationSchema = new mongoose.Schema(
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
		messages: {
			type: [conversationMessageSchema],
			default: []
		}
	},
	{
		timestamps: true
	}
);

conversationSchema.index({ ticketId: 1, userId: 1 }, { unique: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
