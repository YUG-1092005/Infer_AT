const mongoose = require('mongoose');
const User = require('./models/userModel');
require('dotenv').config();

const sampleUsers = [
  // Engineering Department
  { fullName: 'Rajesh Kumar', username: 'rajesh.kumar', email: 'rajesh.kumar@kmrl.com', password: 'password123', department: 'Engineering', role: 'manager' },
  { fullName: 'Priya Sharma', username: 'priya.sharma', email: 'priya.sharma@kmrl.com', password: 'password123', department: 'Engineering', role: 'supervisor' },
  { fullName: 'Amit Singh', username: 'amit.singh', email: 'amit.singh@kmrl.com', password: 'password123', department: 'Engineering', role: 'officer' },
  { fullName: 'Sneha Patel', username: 'sneha.patel', email: 'sneha.patel@kmrl.com', password: 'password123', department: 'Engineering', role: 'assistant' },
  
  // Operations Department
  { fullName: 'Vikram Reddy', username: 'vikram.reddy', email: 'vikram.reddy@kmrl.com', password: 'password123', department: 'Operations', role: 'manager' },
  { fullName: 'Kavya Nair', username: 'kavya.nair', email: 'kavya.nair@kmrl.com', password: 'password123', department: 'Operations', role: 'supervisor' },
  { fullName: 'Rohit Gupta', username: 'rohit.gupta', email: 'rohit.gupta@kmrl.com', password: 'password123', department: 'Operations', role: 'officer' },
  { fullName: 'Anita Joshi', username: 'anita.joshi', email: 'anita.joshi@kmrl.com', password: 'password123', department: 'Operations', role: 'executive' },
  
  // Maintenance Department
  { fullName: 'Suresh Yadav', username: 'suresh.yadav', email: 'suresh.yadav@kmrl.com', password: 'password123', department: 'Maintenance', role: 'manager' },
  { fullName: 'Meera Iyer', username: 'meera.iyer', email: 'meera.iyer@kmrl.com', password: 'password123', department: 'Maintenance', role: 'supervisor' },
  { fullName: 'Kiran Verma', username: 'kiran.verma', email: 'kiran.verma@kmrl.com', password: 'password123', department: 'Maintenance', role: 'officer' },
  { fullName: 'Deepak Jain', username: 'deepak.jain', email: 'deepak.jain@kmrl.com', password: 'password123', department: 'Maintenance', role: 'assistant' },
  
  // Safety & Security Department
  { fullName: 'Arjun Menon', username: 'arjun.menon', email: 'arjun.menon@kmrl.com', password: 'password123', department: 'Safety & Security', role: 'manager' },
  { fullName: 'Pooja Agarwal', username: 'pooja.agarwal', email: 'pooja.agarwal@kmrl.com', password: 'password123', department: 'Safety & Security', role: 'supervisor' },
  { fullName: 'Manoj Tiwari', username: 'manoj.tiwari', email: 'manoj.tiwari@kmrl.com', password: 'password123', department: 'Safety & Security', role: 'officer' },
  
  // IT & Communications Department
  { fullName: 'Rahul Bansal', username: 'rahul.bansal', email: 'rahul.bansal@kmrl.com', password: 'password123', department: 'IT & Communications', role: 'manager' },
  { fullName: 'Divya Kapoor', username: 'divya.kapoor', email: 'divya.kapoor@kmrl.com', password: 'password123', department: 'IT & Communications', role: 'supervisor' },
  { fullName: 'Sanjay Mishra', username: 'sanjay.mishra', email: 'sanjay.mishra@kmrl.com', password: 'password123', department: 'IT & Communications', role: 'officer' },
  
  // Human Resources Department
  { fullName: 'Neha Chopra', username: 'neha.chopra', email: 'neha.chopra@kmrl.com', password: 'password123', department: 'Human Resources', role: 'manager' },
  { fullName: 'Ravi Saxena', username: 'ravi.saxena', email: 'ravi.saxena@kmrl.com', password: 'password123', department: 'Human Resources', role: 'supervisor' },
  { fullName: 'Sunita Rao', username: 'sunita.rao', email: 'sunita.rao@kmrl.com', password: 'password123', department: 'Human Resources', role: 'executive' },
  
  // Finance Department
  { fullName: 'Ashok Pandey', username: 'ashok.pandey', email: 'ashok.pandey@kmrl.com', password: 'password123', department: 'Finance', role: 'manager' },
  { fullName: 'Rekha Sinha', username: 'rekha.sinha', email: 'rekha.sinha@kmrl.com', password: 'password123', department: 'Finance', role: 'supervisor' },
  { fullName: 'Vinod Kumar', username: 'vinod.kumar', email: 'vinod.kumar@kmrl.com', password: 'password123', department: 'Finance', role: 'officer' },
  
  // Administration Department
  { fullName: 'Lakshmi Pillai', username: 'lakshmi.pillai', email: 'lakshmi.pillai@kmrl.com', password: 'password123', department: 'Administration', role: 'manager' },
  { fullName: 'Gopal Krishnan', username: 'gopal.krishnan', email: 'gopal.krishnan@kmrl.com', password: 'password123', department: 'Administration', role: 'supervisor' },
  { fullName: 'Shanti Devi', username: 'shanti.devi', email: 'shanti.devi@kmrl.com', password: 'password123', department: 'Administration', role: 'assistant' },
  
  // Customer Service Department
  { fullName: 'Ramesh Chand', username: 'ramesh.chand', email: 'ramesh.chand@kmrl.com', password: 'password123', department: 'Customer Service', role: 'supervisor' },
  { fullName: 'Geeta Sharma', username: 'geeta.sharma', email: 'geeta.sharma@kmrl.com', password: 'password123', department: 'Customer Service', role: 'officer' },
  { fullName: 'Mukesh Agrawal', username: 'mukesh.agrawal', email: 'mukesh.agrawal@kmrl.com', password: 'password123', department: 'Customer Service', role: 'executive' }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.VITE_MONGO_URL);
    console.log('Connected to MongoDB');

    // Clear existing users (optional - remove this line if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    // Check if users already exist
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.fullName}`);
      } else {
        console.log(`User already exists: ${userData.fullName}`);
      }
    }

    console.log('Sample users seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();