const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Department = require('./models/Department');
const LeavePolicy = require('./models/LeavePolicy');
const Leave = require('./models/Leave');

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await LeavePolicy.deleteMany({});
    await Leave.deleteMany({});
    console.log('Cleared existing data');

    // Create Departments
    const departments = await Department.create([
      {
        name: 'Engineering',
        code: 'ENG',
        description: 'Software Engineering Department'
      },
      {
        name: 'Human Resources',
        code: 'HR',
        description: 'Human Resources Department'
      },
      {
        name: 'Sales',
        code: 'SALES',
        description: 'Sales and Marketing Department'
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: 'Finance and Accounting Department'
      }
    ]);
    console.log('Departments created');

    // Create Users
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@company.com',
      password: 'admin123',
      employeeId: 'EMP001',
      role: 'general_manager',
      department: departments[0]._id,
      leaveBalances: {
        casual: 12,
        medical: 12,
        earned: 15,
        unpaid: 0
      }
    });

    const manager = await User.create({
      firstName: 'Manager',
      lastName: 'Smith',
      email: 'manager@company.com',
      password: 'manager123',
      employeeId: 'EMP002',
      role: 'team_manager',
      department: departments[0]._id,
      leaveBalances: {
        casual: 12,
        medical: 12,
        earned: 15,
        unpaid: 0
      }
    });

    const teamLeader = await User.create({
      firstName: 'Team',
      lastName: 'Leader',
      email: 'leader@company.com',
      password: 'leader123',
      employeeId: 'EMP003',
      role: 'team_leader',
      department: departments[0]._id,
      manager: manager._id,
      leaveBalances: {
        casual: 12,
        medical: 12,
        earned: 15,
        unpaid: 0
      }
    });

    const employee1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'employee@company.com',
      password: 'employee123',
      employeeId: 'EMP004',
      role: 'team_member',
      department: departments[0]._id,
      manager: teamLeader._id,
      leaveBalances: {
        casual: 10,
        medical: 11,
        earned: 13,
        unpaid: 0
      }
    });

    const employee2 = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@company.com',
      password: 'jane123',
      employeeId: 'EMP005',
      role: 'team_member',
      department: departments[1]._id,
      manager: teamLeader._id,
      leaveBalances: {
        casual: 12,
        medical: 10,
        earned: 14,
        unpaid: 0
      }
    });

    const employee3 = await User.create({
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@company.com',
      password: 'bob123',
      employeeId: 'EMP006',
      role: 'team_member',
      department: departments[2]._id,
      manager: manager._id,
      leaveBalances: {
        casual: 11,
        medical: 12,
        earned: 15,
        unpaid: 0
      }
    });

    console.log('Users created');

    // Update department managers
    await Department.findByIdAndUpdate(departments[0]._id, { manager: manager._id });
    await Department.findByIdAndUpdate(departments[1]._id, { manager: manager._id });
    console.log('Department managers assigned');

    // Create Leave Policies
    await LeavePolicy.create([
      {
        name: 'Casual Leave Policy',
        leaveType: 'casual',
        annualQuota: 12,
        maxConsecutiveDays: 5,
        carryForward: {
          allowed: true,
          maxDays: 5
        },
        requiresApproval: true,
        minimumNotice: 1,
        description: 'Casual leave can be taken for personal reasons with prior notice.'
      },
      {
        name: 'Medical Leave Policy',
        leaveType: 'medical',
        annualQuota: 12,
        maxConsecutiveDays: 10,
        carryForward: {
          allowed: false,
          maxDays: 0
        },
        requiresApproval: true,
        minimumNotice: 0,
        description: 'Medical leave for health-related issues. Medical certificate required for more than 3 days.'
      },
      {
        name: 'Earned Leave Policy',
        leaveType: 'earned',
        annualQuota: 15,
        maxConsecutiveDays: 15,
        carryForward: {
          allowed: true,
          maxDays: 10
        },
        requiresApproval: true,
        minimumNotice: 7,
        description: 'Earned leave for planned vacations and personal time off.'
      },
      {
        name: 'Unpaid Leave Policy',
        leaveType: 'unpaid',
        annualQuota: 0,
        maxConsecutiveDays: null,
        carryForward: {
          allowed: false,
          maxDays: 0
        },
        requiresApproval: true,
        minimumNotice: 7,
        description: 'Unpaid leave for extended absences without pay.'
      }
    ]);
    console.log('Leave policies created');

    // Create sample leave requests
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 5);
    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 7);

    await Leave.create([
      {
        employee: employee1._id,
        leaveType: 'casual',
        startDate: futureDate1,
        endDate: futureDate2,
        numberOfDays: 3,
        reason: 'Family function to attend',
        status: 'pending'
      },
      {
        employee: employee2._id,
        leaveType: 'medical',
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate: new Date(today.getFullYear(), today.getMonth(), 2),
        numberOfDays: 2,
        reason: 'Medical checkup',
        status: 'approved',
        approvedBy: manager._id,
        approvedAt: new Date()
      },
      {
        employee: employee3._id,
        leaveType: 'earned',
        startDate: new Date(today.getFullYear(), today.getMonth() - 1, 10),
        endDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
        numberOfDays: 6,
        reason: 'Vacation with family',
        status: 'approved',
        approvedBy: manager._id,
        approvedAt: new Date()
      }
    ]);
    console.log('Sample leave requests created');

    console.log('\n=================================');
    console.log('Database seeded successfully!');
    console.log('=================================');
    console.log('\nDemo Credentials:');
    console.log('----------------------------------');
    console.log('Admin (General Manager):');
    console.log('  Email: admin@company.com');
    console.log('  Password: admin123');
    console.log('\nManager (Team Manager):');
    console.log('  Email: manager@company.com');
    console.log('  Password: manager123');
    console.log('\nTeam Leader:');
    console.log('  Email: leader@company.com');
    console.log('  Password: leader123');
    console.log('\nEmployee:');
    console.log('  Email: employee@company.com');
    console.log('  Password: employee123');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
