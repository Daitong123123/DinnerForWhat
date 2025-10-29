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
  IconButton,
} from "@mui/material";
import { useAuth } from "./login/AuthContext.js";
import apiRequest from "./api";
import { Cancel, AccessTime, Edit } from "@mui/icons-material";

// 美团外卖风格主题配置
const meituanTheme = {
  primary: "#FFD100", // 美团黄
  primaryDark: "#FFC800",
  secondary: "#FFF8E6", // 浅黄背景
  text: "#333333",
  lightText: "#666666",
  grayText: "#999999",
  border: "#EEEEEE",
  red: "#FF4444", // 已取消状态
  green: "#4CAF50", // 已完成状态
  blue: "#1890FF", // 采购中状态
  orange: "#FF8C00", // 制作中状态
};

// 状态映射（适配美团颜色体系）
const STATUS_MAP = {
  0: { text: "待处理", color: "default", bgColor: meituanTheme.secondary },
  1: { text: "采购中", color: "primary", bgColor: "#E6F7FF" },
  2: { text: "制作中", color: "warning", bgColor: "#FFF7E6" },
  3: { text: "已完成", color: "success", bgColor: "#E8F5E9" },
  4: { text: "已取消", color: "error", bgColor: "#FFF0F0" },
};

// 单菜状态映射（适配美团颜色体系）
const DISH_STATUS_MAP = {
  0: { text: "未开始", color: "default", bgColor: meituanTheme.secondary },
  1: { text: "制作中", color: "warning", bgColor: "#FFF7E6" },
  2: { text: "已完成", color: "success", bgColor: "#E8F5E9" },
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
        fetchDailyOrders();
      }
    } catch (error) {
      showSnackbar("状态更新失败: " + error.message, "error");
    }
  };

  // 显示提示
  const showSnackbar = (message, severity = "info") => {
    alert(message); // 实际项目建议替换为 MUI 的 Snackbar 组件
  };

  return (
    <Box
      sx={{
        padding: { xs: 1, md: 2 },
        backgroundColor: meituanTheme.secondary,
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          marginBottom: 3,
          color: meituanTheme.text,
          fontWeight: "bold",
          fontSize: { xs: "1.2rem", md: "1.5rem" },
          paddingLeft: { xs: 1, md: 0 },
        }}
      >
        厨房订单
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 4 }}>
          <CircularProgress sx={{ color: meituanTheme.primary }} />
        </Box>
      ) : dailyOrders.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            padding: { xs: 4, md: 8 },
            backgroundColor: "#fff",
            borderRadius: "12px",
            margin: { xs: 1, md: 0 },
          }}
        >
          <Typography sx={{ color: meituanTheme.lightText }}>
            暂无订单记录
          </Typography>
        </Box>
      ) : (
        dailyOrders.map((daily) => (
          <Box
            key={daily.date}
            sx={{ marginBottom: 3, padding: { xs: 1, md: 0 } }}
          >
            {/* 日期标题 */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 2,
                padding: { xs: 0, md: 0 },
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: meituanTheme.text,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                }}
              >
                {daily.date === new Date().toISOString().split("T")[0]
                  ? "今日订单"
                  : daily.date}
              </Typography>
              <Chip
                label={`总计 ¥${daily.totalAmount.toFixed(2)}`}
                sx={{
                  backgroundColor: meituanTheme.primary,
                  color: meituanTheme.text,
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                }}
              />
            </Box>

            {/* 订单列表 */}
            {daily.orders.map((order) => (
              <Card
                key={order.id}
                sx={{
                  marginBottom: 2,
                  border: `1px solid ${meituanTheme.border}`,
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  backgroundColor: "#fff",
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ padding: 0 }}>
                  {/* 订单头部（状态+操作） */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", md: "center" },
                      padding: 2,
                      borderBottom: `1px solid ${meituanTheme.border}`,
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color: meituanTheme.text,
                          fontSize: { xs: "0.9rem", md: "1rem" },
                        }}
                      >
                        订单号：{order.orderNo}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: 1,
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={STATUS_MAP[order.status]?.text || "未知状态"}
                          sx={{
                            backgroundColor:
                              STATUS_MAP[order.status]?.bgColor ||
                              meituanTheme.secondary,
                            color:
                              STATUS_MAP[order.status]?.color === "default"
                                ? meituanTheme.text
                                : undefined,
                            fontSize: "0.75rem",
                            height: 22,
                          }}
                        />
                        {order.processTime && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              fontSize: "0.8rem",
                              color: meituanTheme.lightText,
                            }}
                          >
                            <AccessTime
                              sx={{ fontSize: "14px", marginRight: 0.5 }}
                            />
                            <Typography>
                              总耗时：{order.processTime}分钟
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* 操作按钮 */}
                    {order.createdBy !== userId && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Edit />}
                        sx={{
                          backgroundColor: meituanTheme.primary,
                          color: meituanTheme.text,
                          fontWeight: "bold",
                          borderRadius: "20px",
                          padding: { xs: "4px 12px", md: "6px 16px" },
                          textTransform: "none",
                          alignSelf: { xs: "flex-end", md: "center" },
                        }}
                        onClick={() => openUpdateDialog(order)}
                      >
                        更新状态
                      </Button>
                    )}
                  </Box>

                  {/* 订单项 */}
                  <List
                    sx={{ maxHeight: { xs: 150, md: 200 }, overflow: "auto" }}
                  >
                    {order.items.map((item, idx) => (
                      <React.Fragment key={item.id}>
                        <ListItem
                          sx={{ padding: { xs: "8px 16px", md: "8px 24px" } }}
                        >
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: { xs: "column", md: "row" },
                                  justifyContent: "space-between",
                                  gap: 0.5,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: "500",
                                    fontSize: { xs: "0.9rem", md: "1rem" },
                                  }}
                                >
                                  {item.dishName}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontWeight: "bold",
                                    color: meituanTheme.red,
                                    fontSize: { xs: "0.9rem", md: "1rem" },
                                  }}
                                >
                                  ¥{item.price.toFixed(2)} x {item.quantity}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "8px",
                                  marginTop: 0.5,
                                  fontSize: { xs: "0.8rem", md: "0.9rem" },
                                }}
                              >
                                {item.taste && (
                                  <Typography
                                    sx={{ color: meituanTheme.lightText }}
                                  >
                                    口味：{item.taste}
                                  </Typography>
                                )}
                                {item.sideDishes && (
                                  <Typography
                                    sx={{ color: meituanTheme.lightText }}
                                  >
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
                                  sx={{
                                    backgroundColor:
                                      DISH_STATUS_MAP[item.dishStatus]
                                        ?.bgColor || meituanTheme.secondary,
                                    color:
                                      DISH_STATUS_MAP[item.dishStatus]
                                        ?.color === "default"
                                        ? meituanTheme.text
                                        : undefined,
                                    fontSize: "0.7rem",
                                    height: 20,
                                  }}
                                />
                                {item.dishProcessTime && (
                                  <Typography
                                    sx={{ color: meituanTheme.lightText }}
                                  >
                                    耗时：{item.dishProcessTime}分钟
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {idx < order.items.length - 1 && (
                          <Divider sx={{ margin: 0 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>

                  {/* 状态变更日志 */}
                  <Box
                    sx={{
                      padding: 2,
                      borderTop: `1px solid ${meituanTheme.border}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        fontWeight: "bold",
                        marginBottom: 1,
                        color: meituanTheme.text,
                      }}
                    >
                      状态变更记录
                    </Typography>
                    <List
                      sx={{
                        maxHeight: { xs: 100, md: 120 },
                        overflow: "auto",
                        padding: 0,
                      }}
                    >
                      {order.statusLogs?.map((log, idx) => (
                        <React.Fragment key={log.id}>
                          <ListItem
                            sx={{
                              padding: { xs: "4px 0", md: "6px 0" },
                              minHeight: "36px",
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", md: "row" },
                                    justifyContent: "space-between",
                                    gap: 0.5,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: { xs: "0.8rem", md: "0.9rem" },
                                      color: meituanTheme.text,
                                    }}
                                  >
                                    {log.operateTime} ·{" "}
                                    {STATUS_MAP[log.status]?.text}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: { xs: "0.8rem", md: "0.9rem" },
                                      color: meituanTheme.lightText,
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
                                  <Typography
                                    sx={{
                                      fontSize: { xs: "0.75rem", md: "0.8rem" },
                                      color: meituanTheme.lightText,
                                      marginTop: 0.5,
                                    }}
                                  >
                                    备注：{log.remark}
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
        PaperProps={{
          sx: {
            borderRadius: "16px",
            maxHeight: "90vh",
            overflow: "auto",
          },
        }}
        sx={{ "& .MuiDialog-container": { alignItems: "flex-end" } }}
      >
        <DialogTitle
          sx={{
            backgroundColor: meituanTheme.primary,
            color: meituanTheme.text,
            fontWeight: "bold",
            padding: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          更新订单状态
          <IconButton
            size="small"
            onClick={() => setUpdateDialogOpen(false)}
            sx={{ color: meituanTheme.text }}
          >
            <Cancel fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: 2 }}>
          {/* 订单状态选择 */}
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>订单状态</InputLabel>
            <Select
              value={selectedStatus}
              label="订单状态"
              onChange={(e) => setSelectedStatus(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                "& .Mui-focused .MuiOutlinedInput-root": {
                  borderColor: meituanTheme.primary,
                },
              }}
            >
              <MenuItem value={0}>待处理</MenuItem>
              <MenuItem value={1}>采购中</MenuItem>
              <MenuItem value={2}>制作中</MenuItem>
              <MenuItem value={3}>已完成</MenuItem>
              <MenuItem value={4}>已取消</MenuItem>
            </Select>
          </FormControl>

          {/* 单菜状态和耗时 */}
          <Typography
            sx={{
              marginBottom: 1,
              fontWeight: "bold",
              color: meituanTheme.text,
              fontSize: "0.9rem",
            }}
          >
            单菜状态
          </Typography>
          <Box sx={{ maxHeight: 200, overflow: "auto", marginBottom: 2 }}>
            {currentOrder?.items.map((item, idx) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "flex-start", md: "center" },
                  marginBottom: 1,
                  gap: 1,
                  padding: { xs: 0, md: 0 },
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontSize: { xs: "0.85rem", md: "0.9rem" },
                    color: meituanTheme.text,
                  }}
                >
                  {item.dishName}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    width: { xs: "100%", md: "auto" },
                  }}
                >
                  <FormControl
                    sx={{ flex: 1, minWidth: { xs: "100px", md: "120px" } }}
                    size="small"
                  >
                    <InputLabel>状态</InputLabel>
                    <Select
                      value={dishStatusList[idx]?.dishStatus || 0}
                      label="状态"
                      onChange={(e) =>
                        handleDishStatusChange(
                          idx,
                          "dishStatus",
                          e.target.value
                        )
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                      }}
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
                      handleDishStatusChange(
                        idx,
                        "dishProcessTime",
                        e.target.value
                      )
                    }
                    sx={{
                      flex: 1,
                      minWidth: { xs: "80px", md: "100px" },
                      "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                    }}
                    inputProps={{ min: 0 }}
                  />
                </Box>
              </Box>
            ))}
          </Box>

          {/* 备注 */}
          <TextField
            fullWidth
            label="备注"
            multiline
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            sx={{
              marginTop: 1,
              "& .MuiOutlinedInput-root": { borderRadius: "8px" },
              "& .Mui-focused .MuiOutlinedInput-root": {
                borderColor: meituanTheme.primary,
              },
            }}
            placeholder="输入备注信息（可选）"
          />
        </DialogContent>
        <DialogActions
          sx={{
            padding: 2,
            borderTop: `1px solid ${meituanTheme.border}`,
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => setUpdateDialogOpen(false)}
            sx={{
              borderColor: meituanTheme.border,
              color: meituanTheme.lightText,
              borderRadius: "20px",
              textTransform: "none",
            }}
            variant="outlined"
          >
            取消
          </Button>
          <Button
            onClick={submitStatusUpdate}
            sx={{
              backgroundColor: meituanTheme.primary,
              color: meituanTheme.text,
              fontWeight: "bold",
              borderRadius: "20px",
              textTransform: "none",
              padding: "6px 20px",
            }}
            variant="contained"
          >
            确认更新
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderHistoryPage;
