import React, { useState, useEffect } from 'react';
import {
    Grid,
    Typography,
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    CardHeader,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    DatePicker,
    FormHelperText,
    AppBar,
    Toolbar
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNavigationBar from '../BottomNavigationBar.jsx';
import Layout from '../Layout.jsx';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import { styled } from '@mui/system';
import { format, parseISO } from 'date-fns';
import COLORS from '../constants/color.js';



// 自定义样式
const StyledHeader = styled(CardHeader)(({ theme }) => ({
    backgroundColor: COLORS.primary,
    color: 'white',
    padding: '1rem 1.5rem',
    '& .MuiCardHeader-title': {
        fontSize: '1.25rem',
        fontWeight: 'bold',
    },
}));
  
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: '1rem',
    boxShadow: '0 4px 15px rgba(255, 94, 135, 0.08)',
    marginBottom: '1.5rem',
}));

const AmountInput = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-input': {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        color: COLORS.dark,
        padding: '1rem 0',
    },
    '& .MuiInput-underline:before, & .MuiInput-underline:after': {
        borderBottom: 'none',
    },
}));

const CategoryButton = styled(Button)(({ theme, isActive, type }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem 0.5rem',
    borderRadius: '0.75rem',
    minWidth: '60px',
    backgroundColor: isActive ?
        (type === 'income' ? COLORS.primary + '15' : COLORS.secondary + '15') :
        'transparent',
    color: isActive ?
        (type === 'income' ? COLORS.primary : COLORS.secondary) :
        COLORS.dark,
    '&:hover': {
        backgroundColor: isActive ?
            (type === 'income' ? COLORS.primary + '25' : COLORS.secondary + '25') :
            '#f5f5f5',
    },
    '& .MuiSvgIcon-root': {
        fontSize: '1.5rem',
        marginBottom: '0.25rem',
    },
    '& .MuiButton-label': {
        fontSize: '0.75rem',
    },
}));

const RecordItem = styled(ListItem)(({ theme, type }) => ({
    padding: '0.75rem 1rem',
    '&:hover': {
        backgroundColor: '#f9f9f9',
    },
    '& .MuiListItemText-primary': {
        fontWeight: '500',
    },
    '& .MuiListItemText-secondary': {
        fontSize: '0.8rem',
        color: '#888',
    },
    '& .MuiListItemAvatar-root': {
        minWidth: '40px',
    },
    '& .MuiAvatar-root': {
        backgroundColor: type === 'income' ? COLORS.primary + '20' : COLORS.secondary + '20',
        color: type === 'income' ? COLORS.primary : COLORS.secondary,
    },
}));

const AmountText = styled(Typography)(({ theme, type }) => ({
    fontWeight: 'bold',
    color: type === 'income' ? COLORS.primary : COLORS.secondary,
}));

function AccountPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [recordType, setRecordType] = useState('expense'); // expense 或 income
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(recordType === 'expense' ? 'food' : 'salary');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date());
    const [records, setRecords] = useState([]);
    const [selectedUser, setSelectedUser] = useState('user1'); // user1 或 user2

    // 模拟用户数据
    const users = [
        { id: 'user1', name: '小明', avatar: 'https://picsum.photos/seed/user1/100/100' },
        { id: 'user2', name: '小红', avatar: 'https://picsum.photos/seed/user2/100/100' }
    ];

    // 支出分类
    const expenseCategories = [
        { id: 'food', name: '餐饮', icon: <i class="fa fa-cutlery"></i> },
        { id: 'transport', name: '交通', icon: <i class="fa fa-car"></i> },
        { id: 'shopping', name: '购物', icon: <i class="fa fa-shopping-bag"></i> },
        { id: 'entertainment', name: '娱乐', icon: <i class="fa fa-film"></i> },
        { id: 'clothes', name: '服饰', icon: <i class="fa fa-tshirt"></i> },
        { id: 'housing', name: '住房', icon: <i class="fa fa-home"></i> },
        { id: 'health', name: '医疗', icon: <i class="fa fa-medkit"></i> },
        { id: 'education', name: '教育', icon: <i class="fa fa-book"></i> },
        { id: 'gifts', name: '礼物', icon: <i class="fa fa-gift"></i> },
        { id: 'other', name: '其他', icon: <i class="fa fa-ellipsis-h"></i> }
    ];

    // 收入分类
    const incomeCategories = [
        { id: 'salary', name: '工资', icon: <i class="fa fa-credit-card"></i> },
        { id: 'bonus', name: '奖金', icon: <i class="fa fa-trophy"></i> },
        { id: 'investment', name: '投资', icon: <i class="fa fa-line-chart"></i> },
        { id: 'parttime', name: '兼职', icon: <i class="fa fa-briefcase"></i> },
        { id: 'gifts', name: '礼金', icon: <i class="fa fa-gift"></i> },
        { id: 'other', name: '其他', icon: <i class="fa fa-ellipsis-h"></i> }
    ];

    // 加载历史记录
    useEffect(() => {
        // 模拟从API加载历史记录
        const mockRecords = [
            { id: 1, type: 'expense', amount: 128.5, category: 'food', note: '晚餐', date: new Date('2023-05-19'), user: 'user1' },
            { id: 2, type: 'expense', amount: 85.0, category: 'shopping', note: '买水果', date: new Date('2023-05-19'), user: 'user2' },
            { id: 3, type: 'income', amount: 5000, category: 'salary', note: '5月工资', date: new Date('2023-05-15'), user: 'user1' },
            { id: 4, type: 'expense', amount: 1200, category: 'housing', note: '房租', date: new Date('2023-05-10'), user: 'user2' },
            { id: 5, type: 'expense', amount: 320, category: 'entertainment', note: '看电影', date: new Date('2023-05-08'), user: 'user1' },
        ];

        setRecords(mockRecords);
    }, []);

    // 处理金额输入
    const handleAmountChange = (e) => {
        // 只允许输入数字和小数点
        const value = e.target.value.replace(/[^0-9.]/g, '');
        // 限制只能有一个小数点
        const decimalCount = (value.match(/\./g) || []).length;
        if (decimalCount <= 1) {
            setAmount(value);
        }
    };

    // 切换记录类型
    const toggleRecordType = (type) => {
        if (type !== recordType) {
            setRecordType(type);
            // 根据类型设置默认分类
            setCategory(type === 'expense' ? 'food' : 'salary');
        }
    };

    // 选择分类
    const selectCategory = (catId) => {
        setCategory(catId);
    };

    // 提交记录
    const submitRecord = () => {
        if (!amount) {
            return;
        }

        const newRecord = {
            id: Date.now(),
            type: recordType,
            amount: parseFloat(amount),
            category: category,
            note: note,
            date: date,
            user: selectedUser
        };

        // 添加新记录
        setRecords([newRecord, ...records]);

        // 重置表单
        setAmount('');
        setNote('');
        setDate(new Date());

        // 显示成功提示
        alert('记账成功！');
    };

    // 格式化日期
    const formatDate = (date) => {
        return format(date, 'yyyy-MM-dd');
    };

    // 获取分类名称
    const getCategoryName = (catId) => {
        const categoryList = recordType === 'expense' ? expenseCategories : incomeCategories;
        const cat = categoryList.find(c => c.id === catId);
        return cat ? cat.name : catId;
    };

    // 获取用户信息
    const getUser = (userId) => {
        return users.find(u => u.id === userId) || { name: userId };
    };

    // 计算总收入
    const calculateTotalIncome = () => {
        return records
            .filter(r => r.type === 'income')
            .reduce((total, record) => total + record.amount, 0);
    };

    // 计算总支出
    const calculateTotalExpense = () => {
        return records
            .filter(r => r.type === 'expense')
            .reduce((total, record) => total + record.amount, 0);
    };

    // 计算结余
    const calculateBalance = () => {
        return calculateTotalIncome() - calculateTotalExpense();
    };

    return (
        <Layout>
            {/* 顶部导航栏 */}
            <AppBar position="sticky" color="inherit" elevation={0} sx={{ backgroundColor: 'white' }}>
                <Toolbar sx={{ padding: '0.5rem 1rem' }}>
                    <IconButton
                        edge="start"
                        color="primary"
                        aria-label="back"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', color: COLORS.dark, fontWeight: 'bold' }}>
                        情侣记账
                    </Typography>
                    <Box sx={{ width: 24 }} /> {/* 保持布局对称 */}
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 3, minHeight: 'calc(100vh - 112px)', backgroundColor: COLORS.lightPink }}>
                {/* 收支统计卡片 */}
                <StyledCard>
                    <StyledHeader
                        title="本月收支"
                    />
                    <CardContent sx={{ padding: '1.5rem' }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                <Typography variant="subtitle2" color="text.secondary">总收入</Typography>
                                <Typography variant="h5" fontWeight="bold" color={COLORS.primary}>
                                    <MoneyIcon fontSize="small" />{calculateTotalIncome().toFixed(2)}
                                </Typography>
                            </Grid>
                            <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                <Typography variant="subtitle2" color="text.secondary">总支出</Typography>
                                <Typography variant="h5" fontWeight="bold" color={COLORS.secondary}>
                                    <MoneyIcon fontSize="small" />{calculateTotalExpense().toFixed(2)}
                                </Typography>
                            </Grid>
                            <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                <Typography variant="subtitle2" color="text.secondary">结余</Typography>
                                <Typography variant="h5" fontWeight="bold" color={calculateBalance() >= 0 ? COLORS.primary : COLORS.secondary}>
                                    <MoneyIcon fontSize="small" />{calculateBalance().toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard>

                {/* 快速记账区域 */}
                <StyledCard>
                    <Box sx={{ p: '1rem 1.5rem' }}>
                        {/* 记录类型选择 */}
                        <Grid container spacing={2} alignItems="center" mb={3}>
                            <Grid item>
                                <Button
                                    variant={recordType === 'expense' ? 'contained' : 'outlined'}
                                    color="secondary"
                                    onClick={() => toggleRecordType('expense')}
                                    startIcon={<RemoveIcon />}
                                    sx={{ borderRadius: '1rem', textTransform: 'none' }}
                                >
                                    支出
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant={recordType === 'income' ? 'contained' : 'outlined'}
                                    color="primary"
                                    onClick={() => toggleRecordType('income')}
                                    startIcon={<AddIcon />}
                                    sx={{ borderRadius: '1rem', textTransform: 'none' }}
                                >
                                    收入
                                </Button>
                            </Grid>
                            <Grid item xs>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="user-select-label">记录人</InputLabel>
                                    <Select
                                        labelId="user-select-label"
                                        id="user-select"
                                        value={selectedUser}
                                        label="记录人"
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        sx={{ borderRadius: '0.75rem' }}
                                    >
                                        {users.map(user => (
                                            <MenuItem key={user.id} value={user.id}>
                                                <Avatar src={user.avatar} sx={{ mr: 2 }} />
                                                {user.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* 金额输入 */}
                        <AmountInput
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0.00"
                            variant="standard"
                            fullWidth
                            InputProps={{
                                startAdornment: <MoneyIcon style={{ fontSize: '2.5rem', color: '#ccc' }} />,
                                inputProps: {
                                    maxLength: 10,
                                    pattern: '[0-9.]*',
                                }
                            }}
                        />

                        {/* 分类选择 */}
                        <Typography variant="subtitle1" fontWeight="500" mt={3} mb={2}>
                            分类
                        </Typography>
                        <Grid container spacing={1} justifyContent="space-around">
                            {(recordType === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                <Grid item key={cat.id}>
                                    <CategoryButton
                                        isActive={category === cat.id}
                                        type={recordType}
                                        onClick={() => selectCategory(cat.id)}
                                    >
                                        {cat.icon}
                                        <span>{cat.name}</span>
                                    </CategoryButton>
                                </Grid>
                            ))}
                        </Grid>

                        {/* 备注和日期 */}
                        <Grid container spacing={2} mt={3}>
                            <Grid item xs={8}>
                                <TextField
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="添加备注"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                        endAdornment: <IconButton><i class="fa fa-paper-plane-o"></i></IconButton>
                                    }}
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    id="date"
                                    label="日期"
                                    type="date"
                                    value={format(date, 'yyyy-MM-dd')}
                                    onChange={(e) => setDate(parseISO(e.target.value))}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    InputProps={{
                                        startAdornment: <CalendarIcon />
                                    }}
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                        </Grid>

                        {/* 提交按钮 */}
                        <Button
                            variant="contained"
                            color={recordType === 'expense' ? 'secondary' : 'primary'}
                            fullWidth
                            onClick={submitRecord}
                            sx={{
                                mt: 4,
                                py: '0.75rem',
                                borderRadius: '1rem',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 15px rgba(255, 94, 135, 0.2)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(255, 94, 135, 0.3)',
                                }
                            }}
                        >
                            确认记账
                        </Button>
                    </Box>
                </StyledCard>

                {/* 历史记录列表 */}
                <StyledCard>
                    <CardHeader
                        title="最近记录"
                        action={
                            <Button size="small" color="primary" onClick={() => navigate('/tool/account/history')}>
                                查看全部
                            </Button>
                        }
                    />
                    <Divider />
                    <List>
                        {records.slice(0, 5).map(record => (
                            <RecordItem key={record.id} type={record.type}>
                                <ListItemAvatar>
                                    <Avatar>
                                        {getCategoryName(record.category).charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={getCategoryName(record.category)}
                                    secondary={`${getUser(record.user).name} · ${formatDate(record.date)} · ${record.note || '无备注'}`}
                                />
                                <AmountText type={record.type}>{record.amount.toFixed(2)}</AmountText>
                            </RecordItem>
                        ))}
                    </List>
                </StyledCard>
            </Box>
            <BottomNavigationBar />
        </Layout>
    );
}

export default AccountPage;