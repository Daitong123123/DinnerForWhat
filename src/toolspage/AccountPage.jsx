import React, { useState, useEffect } from "react";
import { useAuth } from "../login/AuthContext.js";

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
  FormHelperText,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DatePicker,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNavigationBar from "../BottomNavigationBar.jsx";
import Layout from "../Layout.jsx";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/system";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  getMonth,
  getYear,
} from "date-fns";
import COLORS from "../constants/color.js";
import apiRequest from "../api.js";
import DynamicAvatar from "../commons/DynamicAvatar.jsx";

// 自定义样式
const StyledHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: COLORS.primary,
  color: "white",
  padding: "1rem 1.5rem",
  "& .MuiCardHeader-title": {
    fontSize: "1.25rem",
    fontWeight: "bold",
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "1rem",
  boxShadow: "0 4px 15px rgba(255, 94, 135, 0.08)",
  marginBottom: "1.5rem",
}));

const AmountInput = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    fontSize: "2.5rem",
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.dark,
    padding: "1rem 0",
  },
  "& .MuiInput-underline:before, & .MuiInput-underline:after": {
    borderBottom: "none",
  },
}));

const CategoryButton = styled(Button)(({ theme, isActive, type }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.75rem 0.5rem",
  borderRadius: "0.75rem",
  minWidth: "60px",
  backgroundColor: isActive
    ? type === "income"
      ? COLORS.primary + "15"
      : COLORS.secondary + "15"
    : "transparent",
  color: isActive
    ? type === "income"
      ? COLORS.primary
      : COLORS.secondary
    : COLORS.dark,
  "&:hover": {
    backgroundColor: isActive
      ? type === "income"
        ? COLORS.primary + "25"
        : COLORS.secondary + "25"
      : "#f5f5f5",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "1.5rem",
    marginBottom: "0.25rem",
  },
  "& .MuiButton-label": {
    fontSize: "0.75rem",
  },
}));

const RecordItem = styled(ListItem)(({ theme, type }) => ({
  padding: "0.75rem 1rem",
  "&:hover": {
    backgroundColor: "#f9f9f9",
  },
  "& .MuiListItemText-primary": {
    fontWeight: "500",
  },
  "& .MuiListItemText-secondary": {
    fontSize: "0.8rem",
    color: "#888",
  },
  "& .MuiListItemAvatar-root": {
    minWidth: "40px",
  },
  "& .MuiAvatar-root": {
    backgroundColor:
      type === "income" ? COLORS.primary + "20" : COLORS.secondary + "20",
    color: type === "income" ? COLORS.primary : COLORS.secondary,
  },
}));

const AmountText = styled(Typography)(({ theme, type }) => ({
  fontWeight: "bold",
  color: type === "income" ? COLORS.primary : COLORS.secondary,
}));

// 月份选择组件
const MonthSelector = ({ year, month, onChange }) => {
  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item>
        <FormControl variant="outlined" size="small">
          <InputLabel>年份</InputLabel>
          <Select
            value={year}
            label="年份"
            onChange={(e) => onChange(e.target.value, month)}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item>
        <FormControl variant="outlined" size="small">
          <InputLabel>月份</InputLabel>
          <Select
            value={month}
            label="月份"
            onChange={(e) => onChange(year, e.target.value)}
          >
            {months.map((m) => (
              <MenuItem key={m} value={m}>
                {m}月
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [recordType, setRecordType] = useState("expense"); // expense 或 income
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(
    recordType === "expense" ? "food" : "salary"
  );
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { user, spouse, loading: authLoading } = useAuth();

  // 年月选择
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()) + 1);

  // 编辑/删除相关状态
  const [editingRecord, setEditingRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  // 计算当月第一天和最后一天
  const getMonthRange = (year, month) => {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    return { startDate, endDate };
  };

  // 从后端获取记录
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getMonthRange(selectedYear, selectedMonth);
      const params = {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      };
      let response = undefined;
      if (spouse) {
        response = await apiRequest(
          "/api/account/records/couple",
          "GET",
          params,
          navigate
        );
      } else {
        response = await apiRequest(
          "/api/account/records/user",
          "GET",
          params,
          navigate
        );
      }
      if (response && response.code === "200") {
        setRecords(response.data || []);
      } else {
        setError(response ? response.message : "获取记录失败");
      }
    } catch (error) {
      setError(error.message || "网络错误");
    } finally {
      setLoading(false);
    }
  };

  // 在用户数据加载完成后初始化 selectedUser
  useEffect(() => {
    if (user) {
      setSelectedUser(user.userId);
    }
    fetchRecords();
  }, [user, selectedYear, selectedMonth]);

  // 如果认证信息正在加载或者用户未登录，显示加载状态
  if (authLoading || !user) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      </Layout>
    );
  }

  // 支出分类
  const expenseCategories = [
    { id: "food", name: "餐饮", icon: <i class="fa fa-cutlery"></i> },
    { id: "transport", name: "交通", icon: <i class="fa fa-car"></i> },
    { id: "shopping", name: "购物", icon: <i class="fa fa-shopping-bag"></i> },
    { id: "entertainment", name: "娱乐", icon: <i class="fa fa-film"></i> },
    { id: "clothes", name: "服饰", icon: <i class="fa fa-tshirt"></i> },
    { id: "housing", name: "住房", icon: <i class="fa fa-home"></i> },
    { id: "health", name: "医疗", icon: <i class="fa fa-medkit"></i> },
    { id: "education", name: "教育", icon: <i class="fa fa-book"></i> },
    { id: "gifts", name: "礼物", icon: <i class="fa fa-gift"></i> },
    { id: "other", name: "其他", icon: <i class="fa fa-ellipsis-h"></i> },
  ];

  // 收入分类
  const incomeCategories = [
    { id: "salary", name: "工资", icon: <i class="fa fa-credit-card"></i> },
    { id: "bonus", name: "奖金", icon: <i class="fa fa-trophy"></i> },
    { id: "investment", name: "投资", icon: <i class="fa fa-line-chart"></i> },
    { id: "parttime", name: "兼职", icon: <i class="fa fa-briefcase"></i> },
    { id: "gifts", name: "礼金", icon: <i class="fa fa-gift"></i> },
    { id: "other", name: "其他", icon: <i class="fa fa-ellipsis-h"></i> },
  ];

  // 处理金额输入
  const handleAmountChange = (e) => {
    // 只允许输入数字和小数点
    const value = e.target.value.replace(/[^0-9.]/g, "");
    // 限制只能有一个小数点
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount <= 1) {
      setAmount(value);
    }
  };

  // 提交记录
  const submitRecord = async () => {
    if (!amount) {
      setError("请输入金额");
      setOpenSnackbar(true);
      return;
    }

    const newRecord = {
      type: recordType,
      amount: amount,
      category: category,
      note: note,
      date: date,
      userId: selectedUser, // 使用当前选择的用户ID
    };

    // 如果是编辑模式，添加ID
    if (isEditing && editingRecord) {
      newRecord.id = editingRecord.id;
    }

    // 重置错误状态
    setError("");

    try {
      const endpoint = isEditing ? "/api/account/update" : "/api/account/add";
      const response = await apiRequest(endpoint, "POST", newRecord, navigate);

      if (response && response.code === "200") {
        setSuccessMessage(isEditing ? "更新成功！" : "记账成功！");
        setOpenSnackbar(true);

        // 刷新记录
        fetchRecords();

        // 重置表单
        resetForm();
      } else {
        setError(
          response ? response.message : isEditing ? "更新失败" : "记账失败"
        );
        setOpenSnackbar(true);
      }
    } catch (error) {
      setError(error.message || (isEditing ? "更新出错" : "记账出错"));
      setOpenSnackbar(true);
    }
  };

  // 重置表单
  const resetForm = () => {
    setAmount("");
    setNote("");
    setDate(new Date());
    setRecordType("expense");
    setCategory("food");
    setIsEditing(false);
    setEditingRecord(null);
  };

  // 开始编辑记录
  const startEditing = (record) => {
    setEditingRecord(record);
    setIsEditing(true);
    setRecordType(record.type);
    setAmount(record.amount.toString());
    setCategory(record.category);
    setNote(record.note || "");
    setDate(parseISO(record.date));
    setSelectedUser(record.userId);
  };

  // 确认删除记录
  const confirmDelete = (record) => {
    setEditingRecord(record);
    setIsDeleting(true);
  };

  // 执行删除
  const executeDelete = async () => {
    if (!editingRecord) return;

    try {
      const response = await apiRequest(
        "/api/account/delete",
        "POST",
        { id: editingRecord.id },
        navigate
      );

      if (response && response.code === "200") {
        setSuccessMessage("删除成功！");
        setOpenSnackbar(true);

        // 刷新记录
        fetchRecords();

        // 关闭删除确认
        setIsDeleting(false);
        setEditingRecord(null);
      } else {
        setError(response ? response.message : "删除失败");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setError(error.message || "删除出错");
      setOpenSnackbar(true);
    }
  };

  // 计算总收入
  const calculateTotalIncome = () => {
    return records
      .filter((r) => r.type === "income")
      .reduce((total, record) => total + parseFloat(record.amount || 0), 0);
  };

  // 计算总支出
  const calculateTotalExpense = () => {
    return records
      .filter((r) => r.type === "expense")
      .reduce((total, record) => total + parseFloat(record.amount || 0), 0);
  };

  // 切换记录类型
  const toggleRecordType = (type) => {
    if (type !== recordType) {
      setRecordType(type);
      // 根据类型设置默认分类
      setCategory(type === "expense" ? "food" : "salary");
    }
  };

  // 选择分类
  const selectCategory = (catId) => {
    setCategory(catId);
  };

  // 格式化日期
  const formatDate = (dateStr) => {
    return format(parseISO(dateStr), "yyyy-MM-dd");
  };

  // 获取分类名称
  const getCategoryName = (catId) => {
    const categoryList =
      recordType === "expense" ? expenseCategories : incomeCategories;
    const cat = categoryList.find((c) => c.id === catId);
    return cat ? cat.name : catId;
  };

  // 获取用户信息
  const getUser = (userId) => {
    if (userId === user.userId) {
      return {
        id: user.userId,
        name: user.userName || "我",
        avatar: "https://picsum.photos/seed/user1/100/100",
      };
    } else if (spouse && userId === spouse.userId) {
      return {
        id: spouse.userId,
        name: spouse.userName || "伴侣",
        avatar: "https://picsum.photos/seed/user2/100/100",
      };
    }
    return { id: userId, name: userId };
  };

  // 计算结余
  const calculateBalance = () => {
    return calculateTotalIncome() - calculateTotalExpense();
  };

  // 关闭提示框
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  // 分页相关
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Layout>
      {/* 顶部导航栏 */}
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ backgroundColor: "white" }}
      >
        <Toolbar sx={{ padding: "0.5rem 1rem" }}>
          <IconButton
            edge="start"
            color="primary"
            aria-label="back"
            onClick={() => navigate(-1)}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              color: COLORS.dark,
              fontWeight: "bold",
            }}
          >
            情侣记账
          </Typography>
          <Box sx={{ width: 24 }} /> {/* 保持布局对称 */}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          p: 3,
          minHeight: "calc(100vh - 160px)",
          pb: "40px",
          backgroundColor: COLORS.lightPink,
        }}
      >
        {/* 收支统计卡片 */}
        <StyledCard>
          <StyledHeader title="收支统计" />
          <CardContent sx={{ padding: "1.5rem" }}>
            <MonthSelector
              year={selectedYear}
              month={selectedMonth}
              onChange={(year, month) => {
                setSelectedYear(year);
                setSelectedMonth(month);
              }}
            />
            <Grid container spacing={3} alignItems="center" mt={3}>
              <Grid item xs={4} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  总收入
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={COLORS.primary}
                >
                  <MoneyIcon fontSize="small" />
                  {calculateTotalIncome().toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  总支出
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={COLORS.secondary}
                >
                  <MoneyIcon fontSize="small" />
                  {calculateTotalExpense().toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  结余
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={
                    calculateBalance() >= 0 ? COLORS.primary : COLORS.secondary
                  }
                >
                  <MoneyIcon fontSize="small" />
                  {calculateBalance().toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* 快速记账区域 */}
        <StyledCard>
          <Box sx={{ p: "1rem 1.5rem" }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              {isEditing ? "编辑记录" : "快速记账"}
            </Typography>

            {/* 记录类型选择 */}
            <Grid container spacing={2} alignItems="center" mb={3}>
              <Grid item>
                <Button
                  variant={recordType === "expense" ? "contained" : "outlined"}
                  color="secondary"
                  onClick={() => toggleRecordType("expense")}
                  startIcon={<RemoveIcon />}
                  sx={{ borderRadius: "1rem", textTransform: "none" }}
                >
                  支出
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant={recordType === "income" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => toggleRecordType("income")}
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: "1rem", textTransform: "none" }}
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
                    sx={{ borderRadius: "0.75rem" }}
                  >
                    {/* 直接使用 user 和 spouse 对象 */}
                    <MenuItem value={user.userId}>
                      <DynamicAvatar size="md" bgColor="#FF5E87" />
                      {user.userName || "我"}
                    </MenuItem>
                    {spouse && (
                      <MenuItem value={spouse.userId}>
                        <DynamicAvatar userId={spouse.userId} size="md" />
                        {spouse.userName || "伴侣"}
                      </MenuItem>
                    )}
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
                startAdornment: (
                  <MoneyIcon style={{ fontSize: "2.5rem", color: "#ccc" }} />
                ),
                inputProps: {
                  maxLength: 10,
                  pattern: "[0-9.]*",
                },
              }}
            />

            {/* 分类选择 */}
            <Typography variant="subtitle1" fontWeight="500" mt={3} mb={2}>
              分类
            </Typography>
            <Grid container spacing={1} justifyContent="space-around">
              {(recordType === "expense"
                ? expenseCategories
                : incomeCategories
              ).map((cat) => (
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
                    endAdornment: (
                      <IconButton>
                        <i class="fa fa-paper-plane-o"></i>
                      </IconButton>
                    ),
                  }}
                  sx={{ borderRadius: "0.75rem" }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="date"
                  label="日期"
                  type="date"
                  value={format(date, "yyyy-MM-dd")}
                  onChange={(e) => setDate(parseISO(e.target.value))}
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: <CalendarIcon />,
                  }}
                  sx={{ borderRadius: "0.75rem" }}
                />
              </Grid>
            </Grid>

            {/* 提交按钮 */}
            <Button
              variant="contained"
              color={recordType === "expense" ? "secondary" : "primary"}
              fullWidth
              onClick={submitRecord}
              sx={{
                mt: 4,
                py: "0.75rem",
                borderRadius: "1rem",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "bold",
                boxShadow: "0 4px 15px rgba(255, 94, 135, 0.2)",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(255, 94, 135, 0.3)",
                },
              }}
            >
              {isEditing ? "保存修改" : "确认记账"}
            </Button>

            {/* 取消编辑按钮 */}
            {isEditing && (
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={resetForm}
                sx={{
                  mt: 2,
                  py: "0.75rem",
                  borderRadius: "1rem",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                取消
              </Button>
            )}
          </Box>
        </StyledCard>

        {/* 历史记录列表 */}
        <StyledCard>
          <CardHeader title={`${selectedYear}年${selectedMonth}月记录`} />
          <Divider />
          {loading ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                加载中...
              </Typography>
            </Box>
          ) : records.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                暂无记录
              </Typography>
            </Box>
          ) : (
            <Box>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>分类</TableCell>
                      <TableCell>记录人</TableCell>
                      <TableCell>金额</TableCell>
                      <TableCell>日期</TableCell>
                      <TableCell>备注</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRecords.map((record) => (
                      <TableRow
                        key={record.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Avatar
                            sx={{
                              mr: 2,
                              backgroundColor:
                                record.type === "income"
                                  ? (COLORS.primary = "#FFC0CB")
                                  : (COLORS.secondary = "#87CEEB"),
                            }}
                          >
                            {getCategoryName(record.category).charAt(0)}
                          </Avatar>
                          {getCategoryName(record.category)}
                        </TableCell>
                        <TableCell>
                          <DynamicAvatar userId={record.userId} size="md" />
                          {getUser(record.userId).name}
                        </TableCell>
                        <TableCell>
                          <AmountText type={record.type}>
                            {parseFloat(record.amount || 0).toFixed(2)}
                          </AmountText>
                        </TableCell>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.note || ""}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => startEditing(record)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => confirmDelete(record)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={Math.ceil(records.length / recordsPerPage)}
                  page={currentPage}
                  onChange={paginate}
                  color="primary"
                />
              </Box>
            </Box>
          )}
        </StyledCard>
      </Box>
      <BottomNavigationBar />

      {/* 删除确认对话框 */}
      <Dialog
        open={isDeleting}
        onClose={() => setIsDeleting(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"确认删除"}</DialogTitle>
        <DialogContent>
          <Typography>你确定要删除这条记录吗？此操作无法撤销。</Typography>
          <Typography variant="body2" color="text.secondary" mt={2}>
            {editingRecord &&
              `${getCategoryName(editingRecord.category)} · ${formatDate(
                editingRecord.date
              )} · ${parseFloat(editingRecord.amount || 0).toFixed(2)}元`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleting(false)}>取消</Button>
          <Button onClick={executeDelete} color="error" autoFocus>
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示框 */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default AccountPage;
