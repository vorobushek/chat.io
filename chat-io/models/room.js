const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  admin: {
    type: String,
    required: false
  },
  users:{
    type: Array,
    required:false
  }
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
