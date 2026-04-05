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
    summary: 'Summary',
    balance: 'Balance',
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
    paidBy: 'Paid by',
    share: 'Share',
    edit: 'Edit',
    delete: 'Delete',
    exportToExcel: 'Export to Excel',

    // Header Labels (for Excel)
    sheetExpenses: 'Expenses',
    sheetSplits: 'Split Breakdown',
    sheetBalances: 'Balances & Settlements',

    // Form
    descriptionLabel: 'Description',
    amount: 'Amount ($)',
    category: 'Category',
    payer: 'Payer',
    payee: 'Payee',
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
    other: 'Other',

    // === NEW: Event Search ===
    searchEvents: 'Search Events',
    searchEventsPlaceholder: 'Search by event name...',
    noSearchResults: 'No events found matching your search.',
    requestToJoin: 'Request to Join',
    requestSent: 'Request Sent',
    alreadyRequested: 'You have already requested to join this event.',
    searchPublicEvents: 'Search for public events to join.',

    // === NEW: Join Requests ===
    pendingRequests: 'Pending Requests',
    joinRequest: 'Join Request',
    approve: 'Approve',
    deny: 'Deny',
    approved: 'Approved',
    denied: 'Denied',
    pending: 'Pending',
    requestApproved: 'Request approved',
    requestDenied: 'Request denied',
    noRequests: 'No pending requests.',
    wantsToJoin: 'wants to join',

    // === NEW: Invitations ===
    inviteUser: 'Invite User',
    invitationSent: 'Invitation Sent',
    sendInvitation: 'Send Invitation',
    sending: 'Sending...',
    invitePending: 'Invitation pending',
    alreadyInvited: 'This user has already been invited.',
    acceptInvitation: 'Accept',
    declineInvitation: 'Decline',
    invitationAccepted: 'Invitation accepted! You are now a member.',
    invitationDeclined: 'Invitation declined.',
    invitedYou: 'invited you to join',
    youAreInvited: 'You are invited to join',

    // === NEW: Guest Linking ===
    linkGuest: 'Link Guest',
    linkGuestToUser: 'Link Guest to User',
    selectGuest: 'Select Guest',
    sendLinkRequest: 'Send Link Request',
    linkRequestSent: 'Link request sent!',
    linkToYourAccount: 'wants to link a guest to your account in',
    guestToLink: 'Guest to link',
    acceptLink: 'Accept',
    declineLink: 'Decline',
    linkAccepted: 'Guest linked to your account!',
    linkDeclined: 'Link declined.',

    // === NEW: Alias ===
    alias: 'Alias',
    aliasPlaceholder: 'Display name in this event',
    aliasHint: 'Shown in event instead of your real name',

    // === NEW: Notifications ===
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    markAllRead: 'Mark all read',
    clearAll: 'Clear all',
    justNow: 'just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',

    // === NEW: Event Settings ===
    eventSettings: 'Event Settings',
    makeSearchable: 'Make event searchable',
    searchableHint: 'Allow other users to find and request to join this event',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved!',

    // === NEW: Misc ===
    addGuest: 'Add Guest',
    optionalMessage: 'Message (optional)',
    from: 'From',
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
    summary: '总计',
    balance: '差额',
    memberTab: '成员',
    settlementPlan: '结算计划',
    individualBalances: '个人余额',
    allSettled: '所有余额已结清。做得好！',
    pay: '支付',
    groupMembers: '团队成员',
    addMember: '添加成员',
    weight: '权重',
    registeredUser: '已注册用户',
    guest: '访客',
    admin: '管理员',
    editExpense: '编辑支出',
    deleteExpenseConfirm: '您确定要删除这笔支出吗？',
    paidBy: '付款',
    share: '分摊',
    edit: '编辑',
    delete: '删除',
    exportToExcel: '导出至Excel',

    // Header Labels (for Excel)
    sheetExpenses: '支出总览',
    sheetSplits: '分摊详情',
    sheetBalances: '余额与结算计划',

    // Form
    descriptionLabel: '描述',
    amount: '金额 ($)',
    category: '类别',
    payer: '付款人',
    payee: '收款人',
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
    flight: '机票',
    hotel: '酒店',
    'rental car': '租车',
    gas: '加油',
    parking: '停车',
    restaurant: '餐厅',
    grocery: '超市',
    ticket: '门票',
    other: '其他',

    // === NEW: Event Search ===
    searchEvents: '搜索活动',
    searchEventsPlaceholder: '按活动名称搜索...',
    noSearchResults: '未找到匹配的活动。',
    requestToJoin: '申请加入',
    requestSent: '已发送申请',
    alreadyRequested: '您已申请加入此活动。',
    searchPublicEvents: '搜索公开活动以加入。',

    // === NEW: Join Requests ===
    pendingRequests: '待处理请求',
    joinRequest: '加入请求',
    approve: '批准',
    deny: '拒绝',
    approved: '已批准',
    denied: '已拒绝',
    pending: '待处理',
    requestApproved: '请求已批准',
    requestDenied: '请求已拒绝',
    noRequests: '没有待处理的请求。',
    wantsToJoin: '想要加入',

    // === NEW: Invitations ===
    inviteUser: '邀请用户',
    invitationSent: '邀请已发送',
    sendInvitation: '发送邀请',
    sending: '发送中...',
    invitePending: '邀请待处理',
    alreadyInvited: '此用户已被邀请。',
    acceptInvitation: '接受',
    declineInvitation: '拒绝',
    invitationAccepted: '邀请已接受！您现在是成员了。',
    invitationDeclined: '邀请已拒绝。',
    invitedYou: '邀请您加入',
    youAreInvited: '您被邀请加入',

    // === NEW: Guest Linking ===
    linkGuest: '关联访客',
    linkGuestToUser: '将访客关联到用户',
    selectGuest: '选择访客',
    sendLinkRequest: '发送关联请求',
    linkRequestSent: '关联请求已发送！',
    linkToYourAccount: '想将一位访客关联到您的账户，在活动',
    guestToLink: '要关联的访客',
    acceptLink: '接受',
    declineLink: '拒绝',
    linkAccepted: '访客已关联到您的账户！',
    linkDeclined: '关联已拒绝。',

    // === NEW: Alias ===
    alias: '别名',
    aliasPlaceholder: '在此活动中显示的名称',
    aliasHint: '在活动中显示此名称代替您的真实姓名',

    // === NEW: Notifications ===
    notifications: '通知',
    noNotifications: '没有通知',
    markAllRead: '全部已读',
    clearAll: '清除全部',
    justNow: '刚刚',
    minutesAgo: '分钟前',
    hoursAgo: '小时前',
    daysAgo: '天前',

    // === NEW: Event Settings ===
    eventSettings: '活动设置',
    makeSearchable: '允许搜索此活动',
    searchableHint: '允许其他用户找到并申请加入此活动',
    saveSettings: '保存设置',
    settingsSaved: '设置已保存！',

    // === NEW: Misc ===
    addGuest: '添加访客',
    optionalMessage: '留言（可选）',
  }
};

export type Language = 'en' | 'zh';
export type TranslationKey = keyof typeof translations.en;
