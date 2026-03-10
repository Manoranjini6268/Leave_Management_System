const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Department = require('./models/Department');
const LeavePolicy = require('./models/LeavePolicy');
const Leave = require('./models/Leave');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    await User.deleteMany({});
    await Department.deleteMany({});
    await LeavePolicy.deleteMany({});
    await Leave.deleteMany({});
    console.log('Cleared existing data');

    // ── Departments ────────────────────────────────────────────────────────────
    const [engDept, hrDept, salesDept, financeDept, productDept] =
      await Department.create([
        { name: 'Engineering',       code: 'ENG',   description: 'Software Engineering' },
        { name: 'Human Resources',   code: 'HR',    description: 'People & Culture' },
        { name: 'Sales',             code: 'SALES', description: 'Sales & Business Development' },
        { name: 'Finance',           code: 'FIN',   description: 'Finance & Accounting' },
        { name: 'Product',           code: 'PROD',  description: 'Product Management & Design' },
      ]);
    console.log('Departments created');

    // ── Top-level Admin ────────────────────────────────────────────────────────
    const admin = await User.create({
      firstName: 'Rachel', lastName: 'Morgan',
      email: 'admin@company.com', password: 'admin123',
      employeeId: 'EMP001', role: 'general_manager',
      department: engDept._id,
      leaveBalances: { casual: 12, medical: 12, earned: 15, unpaid: 0 },
    });

    // ── Team Managers ──────────────────────────────────────────────────────────
    const engManager = await User.create({
      firstName: 'Daniel', lastName: 'Carter',
      email: 'manager@company.com', password: 'manager123',
      employeeId: 'EMP002', role: 'team_manager',
      department: engDept._id,
      leaveBalances: { casual: 11, medical: 12, earned: 14, unpaid: 0 },
    });

    const hrManager = await User.create({
      firstName: 'Sophia', lastName: 'Lee',
      email: 'hr.manager@company.com', password: 'hr1234',
      employeeId: 'EMP003', role: 'team_manager',
      department: hrDept._id,
      leaveBalances: { casual: 12, medical: 12, earned: 15, unpaid: 0 },
    });

    // ── Team Leaders ───────────────────────────────────────────────────────────
    const engLeader = await User.create({
      firstName: 'Marcus', lastName: 'Webb',
      email: 'leader@company.com', password: 'leader123',
      employeeId: 'EMP004', role: 'team_leader',
      department: engDept._id, manager: engManager._id,
      leaveBalances: { casual: 10, medical: 12, earned: 13, unpaid: 0 },
    });

    const prodLeader = await User.create({
      firstName: 'Nadia', lastName: 'Patel',
      email: 'prod.leader@company.com', password: 'prod1234',
      employeeId: 'EMP005', role: 'team_leader',
      department: productDept._id, manager: engManager._id,
      leaveBalances: { casual: 12, medical: 11, earned: 15, unpaid: 0 },
    });

    // ── Team Members ───────────────────────────────────────────────────────────
    const emp1 = await User.create({
      firstName: 'John', lastName: 'Doe',
      email: 'employee@company.com', password: 'employee123',
      employeeId: 'EMP006', role: 'team_member',
      department: engDept._id, manager: engLeader._id,
      leaveBalances: { casual: 9, medical: 11, earned: 12, unpaid: 0 },
    });

    const emp2 = await User.create({
      firstName: 'Jane', lastName: 'Smith',
      email: 'jane@company.com', password: 'jane123',
      employeeId: 'EMP007', role: 'team_member',
      department: engDept._id, manager: engLeader._id,
      leaveBalances: { casual: 11, medical: 10, earned: 14, unpaid: 0 },
    });

    const emp3 = await User.create({
      firstName: 'Bob', lastName: 'Johnson',
      email: 'bob@company.com', password: 'bob123',
      employeeId: 'EMP008', role: 'team_member',
      department: hrDept._id, manager: hrManager._id,
      leaveBalances: { casual: 12, medical: 12, earned: 13, unpaid: 0 },
    });

    const emp4 = await User.create({
      firstName: 'Emily', lastName: 'Chen',
      email: 'emily@company.com', password: 'emily123',
      employeeId: 'EMP009', role: 'team_member',
      department: salesDept._id, manager: engManager._id,
      leaveBalances: { casual: 10, medical: 12, earned: 15, unpaid: 0 },
    });

    const emp5 = await User.create({
      firstName: 'Carlos', lastName: 'Rivera',
      email: 'carlos@company.com', password: 'carlos123',
      employeeId: 'EMP010', role: 'team_member',
      department: productDept._id, manager: prodLeader._id,
      leaveBalances: { casual: 11, medical: 11, earned: 14, unpaid: 0 },
    });

    console.log('Users created (10)');

    // Assign managers to departments
    await Department.findByIdAndUpdate(engDept._id,     { manager: engManager._id });
    await Department.findByIdAndUpdate(hrDept._id,      { manager: hrManager._id });
    await Department.findByIdAndUpdate(salesDept._id,   { manager: engManager._id });
    await Department.findByIdAndUpdate(productDept._id, { manager: engManager._id });
    console.log('Department managers assigned');

    // ── Leave Policies ─────────────────────────────────────────────────────────
    await LeavePolicy.create([
      {
        name: 'Casual Leave Policy', leaveType: 'casual',
        annualQuota: 12, maxConsecutiveDays: 5,
        carryForward: { allowed: true, maxDays: 5 },
        requiresApproval: true, minimumNotice: 1,
        description: 'Casual leave for personal errands. Max 5 consecutive days. 1-day advance notice required.',
        isActive: true,
      },
      {
        name: 'Medical Leave Policy', leaveType: 'medical',
        annualQuota: 12, maxConsecutiveDays: 10,
        carryForward: { allowed: false, maxDays: 0 },
        requiresApproval: true, minimumNotice: 0,
        description: 'Medical leave for health issues. Certificate required for more than 3 days.',
        isActive: true,
      },
      {
        name: 'Earned Leave Policy', leaveType: 'earned',
        annualQuota: 15, maxConsecutiveDays: 15,
        carryForward: { allowed: true, maxDays: 10 },
        requiresApproval: true, minimumNotice: 7,
        description: 'Earned leave for planned holidays. 7-day advance notice required.',
        isActive: true,
      },
      {
        name: 'Unpaid Leave Policy', leaveType: 'unpaid',
        annualQuota: 0, maxConsecutiveDays: null,
        carryForward: { allowed: false, maxDays: 0 },
        requiresApproval: true, minimumNotice: 7,
        description: 'Unpaid leave for extended absences. Approved case-by-case.',
        isActive: true,
      },
    ]);
    console.log('Leave policies created');

    // ── Sample Leave Requests ──────────────────────────────────────────────────
    const y = new Date().getFullYear();
    const d = (m, day) => new Date(y, m - 1, day);

    await Leave.create([
      // ── Approved leaves (past) ────────────────────────────────
      {
        employee: emp1._id, leaveType: 'casual',
        startDate: d(2, 10), endDate: d(2, 11), numberOfDays: 2,
        reason: 'Personal errands', status: 'approved',
        approvedBy: engLeader._id, approvedAt: d(2, 8),
      },
      {
        employee: emp2._id, leaveType: 'medical',
        startDate: d(1, 15), endDate: d(1, 17), numberOfDays: 3,
        reason: 'Flu and fever', status: 'approved',
        approvedBy: engLeader._id, approvedAt: d(1, 15),
      },
      {
        employee: emp3._id, leaveType: 'earned',
        startDate: d(3, 1), endDate: d(3, 7), numberOfDays: 7,
        reason: 'Annual family vacation', status: 'approved',
        approvedBy: hrManager._id, approvedAt: d(2, 22),
      },
      {
        employee: emp4._id, leaveType: 'casual',
        startDate: d(4, 22), endDate: d(4, 23), numberOfDays: 2,
        reason: 'Attending sibling graduation', status: 'approved',
        approvedBy: engManager._id, approvedAt: d(4, 20),
      },
      {
        employee: emp5._id, leaveType: 'earned',
        startDate: d(5, 5), endDate: d(5, 9), numberOfDays: 5,
        reason: 'Planned road trip', status: 'approved',
        approvedBy: prodLeader._id, approvedAt: d(4, 27),
      },
      // ── Rejected leaves ───────────────────────────────────────
      {
        employee: emp1._id, leaveType: 'earned',
        startDate: d(6, 10), endDate: d(6, 20), numberOfDays: 11,
        reason: 'Extended summer holiday',
        status: 'rejected',
        rejectedBy: engLeader._id, rejectedAt: d(6, 5),
        rejectionReason: 'Critical project deadline during this period.',
      },
      {
        employee: emp2._id, leaveType: 'casual',
        startDate: d(3, 25), endDate: d(3, 27), numberOfDays: 3,
        reason: 'Weekend trip extension',
        status: 'rejected',
        rejectedBy: engLeader._id, rejectedAt: d(3, 23),
        rejectionReason: 'Team at minimum capacity, cannot approve.',
      },
      // ── Cancelled leaves ──────────────────────────────────────
      {
        employee: emp4._id, leaveType: 'medical',
        startDate: d(5, 14), endDate: d(5, 15), numberOfDays: 2,
        reason: 'Doctor appointment (rescheduled)',
        status: 'cancelled',
      },
      // ── Pending leaves (current/upcoming) ────────────────────
      {
        employee: emp1._id, leaveType: 'casual',
        startDate: (() => { const t = new Date(); t.setDate(t.getDate() + 5); return t; })(),
        endDate:   (() => { const t = new Date(); t.setDate(t.getDate() + 7); return t; })(),
        numberOfDays: 3,
        reason: 'Family function', status: 'pending',
      },
      {
        employee: emp3._id, leaveType: 'medical',
        startDate: (() => { const t = new Date(); t.setDate(t.getDate() + 1); return t; })(),
        endDate:   (() => { const t = new Date(); t.setDate(t.getDate() + 3); return t; })(),
        numberOfDays: 3,
        reason: 'Dental surgery follow-up', status: 'pending',
      },
      {
        employee: emp5._id, leaveType: 'earned',
        startDate: (() => { const t = new Date(); t.setDate(t.getDate() + 14); return t; })(),
        endDate:   (() => { const t = new Date(); t.setDate(t.getDate() + 18); return t; })(),
        numberOfDays: 5,
        reason: 'International trip', status: 'pending',
      },
    ]);
    console.log('Sample leave requests created (11)');

    console.log('\n══════════════════════════════════════');
    console.log('  Database seeded successfully!');
    console.log('══════════════════════════════════════');
    console.log('\nDemo Credentials:');
    console.log('──────────────────────────────────────');
    console.log('General Manager (Admin):');
    console.log('  Email   : admin@company.com');
    console.log('  Password: admin123');
    console.log('\nTeam Manager (Engineering):');
    console.log('  Email   : manager@company.com');
    console.log('  Password: manager123');
    console.log('\nTeam Manager (HR):');
    console.log('  Email   : hr.manager@company.com');
    console.log('  Password: hr1234');
    console.log('\nTeam Leader (Engineering):');
    console.log('  Email   : leader@company.com');
    console.log('  Password: leader123');
    console.log('\nTeam Leader (Product):');
    console.log('  Email   : prod.leader@company.com');
    console.log('  Password: prod1234');
    console.log('\nEmployee (John Doe):');
    console.log('  Email   : employee@company.com');
    console.log('  Password: employee123');
    console.log('\nEmployee (Jane Smith):');
    console.log('  Email   : jane@company.com');
    console.log('  Password: jane123');
    console.log('──────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
