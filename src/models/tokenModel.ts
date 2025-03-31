import mongoose, { Schema, Document } from 'mongoose';

export interface IToken extends Document {
  userId: string;
  token: string;
  createdAt: Date;
}

const tokenSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '7d',
    },
  },
  { 
    timestamps: true,
    versionKey: false, 
  }
);

export default mongoose.model<IToken>('Token', tokenSchema);
