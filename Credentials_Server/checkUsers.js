const mongoose = require('mongoose');
const User = require('./models/userModel');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.VITE_MONGO_URL);
    console.log('Connected to MongoDB');
    
    const users = await User.find({}, 'fullName username email department role').sort({createdAt: -1});
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`- ${user.fullName} (${user.username}) - ${user.role} in ${user.department}`);
    });
    console.log(`\nTotal users: ${users.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();