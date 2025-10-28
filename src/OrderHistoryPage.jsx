import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { useAuth } from "./login/AuthContext.js";
import apiRequest from "./api";
const COLORS = {
  primary: "#FF5E87",
  secondary: "#FFB6C1",
  accent: "#FF85A2",
  light: "#FFF0F3",
  dark: "#333333",
};

// 状态映射
const STATUS_MAP = {
  0: { text: "待处理", color: "default" },
  1: { text: "采购中", color: "info" },
  2: { text: "制作中", color: "warning" },
  3: { text: "已完成", color: "success" },
  4: { text: "已取消", color: "error" },
};

// 单菜状态映射
const DISH_STATUS_MAP = {
  0: { text: "未开始", color: "default" },
  1: { text: "制作中", color: "warning" },
  2: { text: "已完成", color: "success" },
};

const OrderHistoryPage = () => {
  const [dailyOrders, setDailyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [dishStatusList, setDishStatusList] = useState([]);
  const [remark, setRemark] = useState("");

  const { user } = useAuth();
  const userId = user?.userId || "";
  const coupleId = user?.coupleId || "";

  // 获取订单列表
  useEffect(() => {
    fetchDailyOrders();
  }, [coupleId]);

  const fetchDailyOrders = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(
        "/orders/daily",
        "POST",
        { coupleId },
        null
      );
      if (response?.code === "200") {
        setDailyOrders(response.data || []);
      }
    } catch (error) {
      console.error("获取订单失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 打开状态更新弹窗
  const openUpdateDialog = (order) => {
    setCurrentOrder(order);
    setSelectedStatus(order.status);
    setRemark("");
    // 初始化单菜状态
    const initialDishStatus = order.items.map((item) => ({
      itemId: item.id,
      dishStatus: item.dishStatus || 0,
      dishProcessTime: item.dishProcessTime || 0,
    }));
    setDishStatusList(initialDishStatus);
    setUpdateDialogOpen(true);
  };

  // 更新单菜状态
  const handleDishStatusChange = (index, field, value) => {
    const newList = [...dishStatusList];
    newList[index][field] = field === "dishProcessTime" ? Number(value) : value;
    setDishStatusList(newList);
  };

  // 提交状态更新
  const submitStatusUpdate = async () => {
    if (!currentOrder) return;

    const updateData = {
      orderId: currentOrder.id,
      status: selectedStatus,
      operatorId: userId,
      remark,
      dishStatusList: dishStatusList,
    };

    try {
      const response = await apiRequest(
        "/orders/update-status",
        "POST",
        updateData,
        null
      );
      if (response?.code === "200") {
        showSnackbar("状态更新成功", "success");
        setUpdateDialogOpen(false);
        fetchDailyOrders(); // 刷新订单列表
      }
    } catch (error) {
      showSnackbar("状态更新失败: " + error.message, "error");
    }
  };

  // 显示提示
  const showSnackbar = (message, severity = "info") => {
    // 复用原有Snackbar逻辑
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ marginBottom: 3, color: COLORS.primary }}>
        厨房订单
      </Typography>

      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "0 auto" }} />
      ) : dailyOrders.length === 0 ? (
        <Box sx={{ textAlign: "center", padding: 4 }}>
          <Typography>暂无订单记录</Typography>
        </Box>
      ) : (
        dailyOrders.map((daily) => (
          <Box key={daily.date} sx={{ marginBottom: 3 }}>
            {/* 日期标题 */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 2,
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>
                {daily.date === new Date().toISOString().split("T")[0]
                  ? "今日订单"
                  : daily.date}
              </Typography>
              <Typography color={COLORS.primary}>
                总计 ¥{daily.totalAmount.toFixed(2)}
              </Typography>
            </Box>

            {/* 订单列表 */}
            {daily.orders.map((order) => (
              <Card
                key={order.id}
                sx={{
                  marginBottom: 2,
                  border: `1px solid ${COLORS.secondary}`,
                }}
              >
                <CardContent sx={{ padding: 2 }}>
                  {/* 订单头部（状态+操作） */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: "bold" }}>
                        订单号：{order.orderNo}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: 1,
                        }}
                      >
                        <Chip
                          label={STATUS_MAP[order.status]?.text || "未知状态"}
                          color={STATUS_MAP[order.status]?.color || "default"}
                          size="small"
                          sx={{ marginRight: 2 }}
                        />
                        {order.processTime && (
                          <Typography
                            sx={{ fontSize: 12, color: COLORS.lightText }}
                          >
                            总耗时：{order.processTime}分钟
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* 只有非创建人可操作状态（对方操作） */}
                    {order.createdBy !== userId && (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ backgroundColor: COLORS.primary }}
                        onClick={() => openUpdateDialog(order)}
                      >
                        更新状态
                      </Button>
                    )}
                  </Box>

                  {/* 订单项（带单菜状态和耗时） */}
                  <List sx={{ maxHeight: 200, overflow: "auto" }}>
                    {order.items.map((item, idx) => (
                      <React.Fragment key={item.id}>
                        <ListItem sx={{ padding: "8px 0" }}>
                          <ListItemText
                            primary={
                              <Box
                                display="flex"
                                justifyContent="space-between"
                              >
                                <Typography>{item.dishName}</Typography>
                                <Typography>
                                  ¥{item.price.toFixed(2)} x {item.quantity}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box display="flex" flexWrap="wrap" gap="8px">
                                {item.taste && (
                                  <Typography>口味：{item.taste}</Typography>
                                )}
                                {item.sideDishes && (
                                  <Typography>
                                    配菜：
                                    {JSON.parse(item.sideDishes)
                                      .map((s) => s.name)
                                      .join("、")}
                                  </Typography>
                                )}
                                <Chip
                                  label={
                                    DISH_STATUS_MAP[item.dishStatus]?.text ||
                                    "未开始"
                                  }
                                  color={
                                    DISH_STATUS_MAP[item.dishStatus]?.color ||
                                    "default"
                                  }
                                  size="small"
                                />
                                {item.dishProcessTime && (
                                  <Typography>
                                    耗时：{item.dishProcessTime}分钟
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {idx < order.items.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>

                  {/* 状态变更日志 */}
                  <Box sx={{ marginTop: 2 }}>
                    <Typography
                      sx={{ fontSize: 12, fontWeight: "bold", marginBottom: 1 }}
                    >
                      状态变更记录
                    </Typography>
                    <List sx={{ maxHeight: 100, overflow: "auto" }}>
                      {order.statusLogs?.map((log, idx) => (
                        <React.Fragment key={log.id}>
                          <ListItem
                            sx={{ padding: "4px 0", minHeight: "40px" }}
                          >
                            <ListItemText
                              primary={
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                >
                                  <Typography sx={{ fontSize: 12 }}>
                                    {log.operateTime} ·{" "}
                                    {STATUS_MAP[log.status]?.text}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: COLORS.lightText,
                                    }}
                                  >
                                    操作人：
                                    {log.operatorId === userId
                                      ? "自己"
                                      : "对方"}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                log.remark && (
                                  <Typography sx={{ fontSize: 11 }}>
                                    {log.remark}
                                  </Typography>
                                )
                              }
                            />
                          </ListItem>
                          {idx < order.statusLogs.length - 1 && (
                            <Divider sx={{ margin: "4px 0" }} />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ))
      )}

      {/* 状态更新弹窗 */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>更新订单状态</DialogTitle>
        <DialogContent sx={{ padding: 2 }}>
          {/* 订单状态选择 */}
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>订单状态</InputLabel>
            <Select
              value={selectedStatus}
              label="订单状态"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value={0}>待处理</MenuItem>
              <MenuItem value={1}>采购中</MenuItem>
              <MenuItem value={2}>制作中</MenuItem>
              <MenuItem value={3}>已完成</MenuItem>
              <MenuItem value={4}>已取消</MenuItem>
            </Select>
          </FormControl>

          {/* 单菜状态和耗时 */}
          <Typography sx={{ marginBottom: 1, fontWeight: "bold" }}>
            单菜状态
          </Typography>
          {currentOrder?.items.map((item, idx) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: 1,
                gap: 2,
              }}
            >
              <Typography sx={{ flex: 1, fontSize: 14 }}>
                {item.dishName}
              </Typography>
              <FormControl sx={{ width: "120px" }} size="small">
                <InputLabel>状态</InputLabel>
                <Select
                  value={dishStatusList[idx]?.dishStatus || 0}
                  label="状态"
                  onChange={(e) =>
                    handleDishStatusChange(idx, "dishStatus", e.target.value)
                  }
                >
                  <MenuItem value={0}>未开始</MenuItem>
                  <MenuItem value={1}>制作中</MenuItem>
                  <MenuItem value={2}>已完成</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="耗时(分钟)"
                type="number"
                size="small"
                value={dishStatusList[idx]?.dishProcessTime || 0}
                onChange={(e) =>
                  handleDishStatusChange(idx, "dishProcessTime", e.target.value)
                }
                sx={{ width: "100px" }}
                inputProps={{ min: 0 }}
              />
            </Box>
          ))}

          {/* 备注 */}
          <TextField
            fullWidth
            label="备注"
            multiline
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            sx={{ marginTop: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>取消</Button>
          <Button
            onClick={submitStatusUpdate}
            sx={{ backgroundColor: COLORS.primary, color: "#fff" }}
          >
            确认更新
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderHistoryPage;
