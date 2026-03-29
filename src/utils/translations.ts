export const translations = {
  en: {
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    passwordMismatch: 'Passwords do not match.',
    processing: 'Processing...',
    
    // Navbar
    logout: 'Logout',
    
    // Dashboard
    tripsAndEvents: 'Your Trips & Events',
    manageExpenses: 'Manage your group expenses effortlessly.',
    newEvent: 'New Event',
    noEventsFound: 'No events found',
    startFirstTrip: 'Start your first trip or event to track balances.',
    startAnEvent: 'Start an Event',
    createEvent: 'Create New Event',
    eventName: 'Event Name',
    description: 'Description (Optional)',
    create: 'Create',
    cancel: 'Cancel',
    loadingEvents: 'Loading events...',
    
    // Event Detail
    members: 'members',
    expenses: 'expenses',
    addExpense: 'Add Expense',
    balances: 'Balances',
    memberTab: 'Members',
    settlementPlan: 'Settlement Plan',
    individualBalances: 'Individual Balances',
    allSettled: 'All balances are settled. Good job!',
    pay: 'pay',
    groupMembers: 'Group Members',
    addMember: 'Add Member',
    weight: 'Weight',
    registeredUser: 'Registered User',
    guest: 'Guest',
    admin: 'Admin',
    editExpense: 'Edit Expense',
    deleteExpenseConfirm: 'Are you sure you want to delete this expense?',
    
    // Form
    descriptionLabel: 'Description',
    amount: 'Amount ($)',
    category: 'Category',
    payer: 'Payer',
    date: 'Date',
    participants: 'Participants & Weights',
    saveExpense: 'Save Expense',
    atLeastOneParticipant: 'At least one person must share the cost.',
    
    // Members
    userEmail: 'User Email',
    displayName: 'Display Name',
    defaultWeight: 'Default Weight',
    permissions: 'Permissions',
    normalUser: 'Normal User',
    adding: 'Adding...',
    userNotFound: 'User with this email not found. They must sign up first.',
    alreadyMember: 'This user is already a member of this event.',
    
    // Categories
    flight: 'Flight',
    hotel: 'Hotel',
    'rental car': 'Rental Car',
    gas: 'Gas',
    parking: 'Parking',
    restaurant: 'Restaurant',
    grocery: 'Grocery',
    ticket: 'Ticket',
    other: 'Other'
  },
  zh: {
    // Auth
    login: '登录',
    signup: '注册',
    email: '电子邮件',
    password: '密码',
    confirmPassword: '确认密码',
    fullName: '姓名',
    signIn: '登录',
    createAccount: '创建账户',
    passwordMismatch: '两次输入的密码不一致。',
    processing: '处理中...',
    
    // Navbar
    logout: '登出',
    
    // Dashboard
    tripsAndEvents: '您的旅行与活动',
    manageExpenses: '轻松管理您的团队支出。',
    newEvent: '新活动',
    noEventsFound: '未找到活动',
    startFirstTrip: '开始您的第一次旅行或活动，记录余额。',
    startAnEvent: '开始活动',
    createEvent: '创建新活动',
    eventName: '活动名称',
    description: '描述（可选）',
    create: '创建',
    cancel: '取消',
    loadingEvents: '加载活动中...',
    
    // Event Detail
    members: '成员',
    expenses: '支出',
    addExpense: '添加支出',
    balances: '余额',
    memberTab: '成员',
    settlementPlan: '结算计划',
    individualBalances: '个人余额',
    allSettled: '所有余额已结清。做得好！',
    pay: '向',
    groupMembers: '团队成员',
    addMember: '添加成员',
    weight: '权重',
    registeredUser: '已注册用户',
    guest: '访客',
    admin: '管理员',
    editExpense: '编辑支出',
    deleteExpenseConfirm: '您确定要删除这笔支出吗？',
    
    // Form
    descriptionLabel: '描述',
    amount: '金额 ($)',
    category: '类别',
    payer: '付款人',
    date: '日期',
    participants: '分摊成员与权重',
    saveExpense: '保存支出',
    atLeastOneParticipant: '至少需要一人参与分摊。',
    
    // Members
    userEmail: '用户邮箱',
    displayName: '显示名称',
    defaultWeight: '默认权重',
    permissions: '权限',
    normalUser: '普通用户',
    adding: '添加中...',
    userNotFound: '未找到该邮箱对应的用户。请确保他们已注册。',
    alreadyMember: '该用户已经是该活动的成员。',
    
    // Categories
    flight: '飞往',
    hotel: '酒店',
    'rental car': '租车',
    gas: '加油',
    parking: '停车',
    restaurant: '餐厅',
    grocery: '超市',
    ticket: '门票',
    other: '其他'
  }
};

export type Language = 'en' | 'zh';
export type TranslationKey = keyof typeof translations.en;
