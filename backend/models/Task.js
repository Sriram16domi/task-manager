import mongoose from 'mongoose';

// Define the Schema for a Task
const taskSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Task text is required'],
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      }
    }
  }
);

// Create the Mongoose Model
const Task = mongoose.model('Task', taskSchema);

export default Task;
