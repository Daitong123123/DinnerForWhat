import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
} from "@mui/material";
import {
  Add,
  Remove,
  ShoppingCart,
  Search,
  Fastfood,
} from "@mui/icons-material";
import apiRequest from "./api";
import { useNavigate } from "react-router-dom";
import BottomNavigationBar from "./BottomNavigationBar";
import { useAuth } from "./login/AuthContext.js";

// 美团风格主题配置
const meituanTheme = {
  primary: "#FF4D4F", // 美团红
  secondary: "#FFF0F0",
  text: "#333333",
  lightText: "#666666",
  border: "#EEEEEE",
  background: "#F5F5F5",
  categoryActive: "#FF4D4F",
  categoryNormal: "#333333",
};

// 占位图（无图片时显示）
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/80x80?text=无图片";

const OrderingPage = () => {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState(["全部"]);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [dishDetailOpen, setDishDetailOpen] = useState(false);
  const [currentDish, setCurrentDish] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [taste, setTaste] = useState("");
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();
  const userId = user?.userId || "";
  const coupleId = user?.coupleId || "";

  // 获取菜品列表
  useEffect(() => {
    const fetchDishes = async () => {
      const formData = {
        curPage: 1,
        pageSize: 100,
        coupleId: coupleId,
      };
      try {
        const response = await apiRequest(
          "/get-dishes",
          "POST",
          formData,
          navigate
        );
        if (response?.code === "200" && response.data) {
          setDishes(response.data);

          // 提取分类（去重）
          const uniqueCats = [
            "全部",
            ...new Set(
              response.data.map((dish) => dish.category).filter(Boolean)
            ),
          ];
          setCategories(uniqueCats);
        }
      } catch (error) {
        console.error("请求出错:", error);
      }
    };

    fetchDishes();
  }, [navigate, coupleId]);

  // 打开菜品详情
  const openDishDetail = (dish) => {
    setCurrentDish(dish);
    setQuantity(1);
    // 初始化选项
    const initialOptions = {};
    if (dish.sideDishes && dish.sideDishes.length) {
      dish.sideDishes.forEach((side) => {
        initialOptions[side.id] = false;
      });
    }
    setSelectedOptions(initialOptions);
    setTaste(dish.tastes?.[0] || "");
    setDishDetailOpen(true);
  };

  // 处理配菜选择
  const handleSideDishChange = (sideId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [sideId]: !prev[sideId],
    }));
  };

  // 结算按钮点击事件（新增创建订单逻辑）
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // 构建订单数据
    const orderData = {
      userId: userId,
      coupleId: coupleId,
      createdBy: userId, // 创建人ID
      totalAmount: cartTotal,
      items: cart.map((item) => ({
        dishId: item.dishId,
        dishName: item.name,
        price: item.unitPrice,
        quantity: item.quantity,
        taste: item.taste,
        sideDishes: JSON.stringify(item.selectedSides),
        dishStatus: 0, // 初始状态：未开始
      })),
    };

    try {
      // 调用创建订单接口
      const response = await apiRequest(
        "/orders/create",
        "POST",
        orderData,
        navigate
      );
      if (response?.code === "200") {
        console.log("订单提交成功，已发送至厨房", "success");
        setCart([]); // 清空购物车
        navigate("/kitchen"); // 跳转到厨房页面
      }
    } catch (error) {
      console.log("订单提交失败: " + error.message, "error");
    }
  };
  // 添加到购物车
  const addToCart = () => {
    if (!currentDish) return;

    // 计算选中的配菜
    const selectedSides = currentDish.sideDishes
      ? Object.entries(selectedOptions)
          .filter(([_, checked]) => checked)
          .map(([id]) =>
            currentDish.sideDishes.find((side) => side.id === Number(id))
          ) // 适配数字ID
      : [];

    // 计算单价（基础价格 + 配菜价格）
    const unitPrice =
      currentDish.price +
      selectedSides.reduce((sum, side) => sum + side.price, 0);

    const cartItem = {
      id: `${currentDish.id}-${JSON.stringify(
        selectedSides.map((s) => s.id)
      )}-${taste}`, // 唯一标识（菜品ID+配菜+口味）
      dishId: currentDish.id,
      name: currentDish.name,
      imageUrl: currentDish.imageUrl || PLACEHOLDER_IMAGE,
      unitPrice,
      quantity,
      selectedSides,
      taste,
      totalPrice: unitPrice * quantity,
    };

    const existingItemIndex = cart.findIndex((item) => item.id === cartItem.id);

    if (existingItemIndex > -1) {
      // 更新已有项数量
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
      newCart[existingItemIndex].totalPrice =
        newCart[existingItemIndex].unitPrice *
        newCart[existingItemIndex].quantity;
      setCart(newCart);
    } else {
      // 添加新项
      setCart([...cart, cartItem]);
    }

    setDishDetailOpen(false);
  };

  // 从购物车移除
  const removeFromCart = (index) => {
    const newCart = [...cart];
    if (newCart[index].quantity > 1) {
      newCart[index].quantity -= 1;
      newCart[index].totalPrice =
        newCart[index].unitPrice * newCart[index].quantity;
    } else {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  // 过滤菜品（分类+搜索）
  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "全部" || dish.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // 计算购物车总额
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: meituanTheme.background,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 顶部搜索栏 */}
      <Box
        sx={{
          padding: "12px 16px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: meituanTheme.background,
            borderRadius: "20px",
            padding: "8px 16px",
          }}
        >
          <Search color="action" sx={{ mr: 1 }} />
          <TextField
            placeholder="搜索菜品"
            variant="standard"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: "14px" },
            }}
          />
        </Box>
      </Box>

      {/* 主体内容（左侧分类+右侧菜品列表） */}
      <Box sx={{ flex: 1, display: "flex", height: "calc(100vh - 120px)" }}>
        {/* 左侧分类栏（固定宽度，可滚动） */}
        <Box
          sx={{
            width: "100px",
            backgroundColor: "#fff",
            borderRight: `1px solid ${meituanTheme.border}`,
            overflowY: "auto",
          }}
        >
          <List disablePadding>
            {categories.map((category) => (
              <ListItem
                key={category}
                button
                onClick={() => setActiveCategory(category)}
                sx={{
                  justifyContent: "center",
                  padding: "16px 0",
                  borderLeft: `3px solid ${
                    activeCategory === category
                      ? meituanTheme.categoryActive
                      : "transparent"
                  }`,
                  backgroundColor:
                    activeCategory === category
                      ? meituanTheme.secondary
                      : "#fff",
                }}
              >
                <ListItemText
                  primary={category}
                  primaryTypographyProps={{
                    fontSize: "14px",
                    fontWeight: activeCategory === category ? "bold" : "normal",
                    color:
                      activeCategory === category
                        ? meituanTheme.categoryActive
                        : meituanTheme.categoryNormal,
                    textAlign: "center",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* 右侧菜品列表（横向卡片，可滚动） */}
        <Box
          sx={{
            flex: 1,
            padding: "16px",
            overflowY: "auto",
            backgroundColor: meituanTheme.background,
          }}
        >
          {/* 分类标题 */}
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: meituanTheme.text,
            }}
          >
            {activeCategory}
          </Typography>

          {/* 菜品横向卡片列表 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredDishes.map((dish) => (
              <Card
                key={dish.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  borderRadius: "8px",
                  boxShadow: "none",
                  border: `1px solid ${meituanTheme.border}`,
                  backgroundColor: "#fff",
                  "&:hover": {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  },
                  cursor: "pointer",
                }}
                onClick={() => openDishDetail(dish)}
              >
                {/* 菜品图片 */}
                <Box
                  sx={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginRight: "16px",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={dish.imageUrl || PLACEHOLDER_IMAGE}
                    alt={dish.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>

                {/* 菜品信息（名称、描述、价格） */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: "bold",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "4px",
                      color: meituanTheme.text,
                    }}
                  >
                    {dish.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "12px",
                      color: meituanTheme.lightText,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      marginBottom: "8px",
                      height: "28px",
                    }}
                  >
                    {dish.description || "美味佳肴，值得品尝"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: meituanTheme.primary,
                    }}
                  >
                    ¥{dish.price.toFixed(2)}
                  </Typography>
                </Box>

                {/* 销量标签 */}
                <Box
                  sx={{
                    marginRight: "16px",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: meituanTheme.lightText,
                    }}
                  >
                    {dish.sales || 0}人已点
                  </Typography>
                </Box>

                {/* 加减按钮（悬浮显示，点击不触发卡片跳转） */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {cart.findIndex(
                    (item) =>
                      item.dishId === dish.id &&
                      JSON.stringify(item.selectedSides.map((s) => s.id)) ===
                        JSON.stringify([]) &&
                      item.taste === (dish.tastes?.[0] || "")
                  ) > -1 ? (
                    // 已有默认配置（无配菜+默认口味）的菜品，显示加减按钮
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <IconButton
                        size="small"
                        sx={{ width: "24px", height: "24px", padding: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetIndex = cart.findIndex(
                            (item) =>
                              item.dishId === dish.id &&
                              JSON.stringify(
                                item.selectedSides.map((s) => s.id)
                              ) === JSON.stringify([]) &&
                              item.taste === (dish.tastes?.[0] || "")
                          );
                          if (targetIndex > -1) removeFromCart(targetIndex);
                        }}
                      >
                        <Remove sx={{ fontSize: "16px" }} />
                      </IconButton>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          minWidth: "20px",
                          textAlign: "center",
                        }}
                      >
                        {cart.find(
                          (item) =>
                            item.dishId === dish.id &&
                            JSON.stringify(
                              item.selectedSides.map((s) => s.id)
                            ) === JSON.stringify([]) &&
                            item.taste === (dish.tastes?.[0] || "")
                        )?.quantity || 0}
                      </Typography>
                      <IconButton
                        size="small"
                        sx={{ width: "24px", height: "24px", padding: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // 直接添加默认配置（无配菜+默认口味）
                          const defaultCartItem = {
                            id: `${dish.id}-[]-${dish.tastes?.[0] || ""}`,
                            dishId: dish.id,
                            name: dish.name,
                            imageUrl: dish.imageUrl || PLACEHOLDER_IMAGE,
                            unitPrice: dish.price,
                            quantity: 1,
                            selectedSides: [],
                            taste: dish.tastes?.[0] || "",
                            totalPrice: dish.price,
                          };
                          const existingIndex = cart.findIndex(
                            (item) => item.id === defaultCartItem.id
                          );
                          if (existingIndex > -1) {
                            const newCart = [...cart];
                            newCart[existingIndex].quantity += 1;
                            newCart[existingIndex].totalPrice =
                              newCart[existingIndex].unitPrice *
                              newCart[existingIndex].quantity;
                            setCart(newCart);
                          } else {
                            setCart([...cart, defaultCartItem]);
                          }
                        }}
                      >
                        <Add sx={{ fontSize: "16px" }} />
                      </IconButton>
                    </Box>
                  ) : (
                    // 无默认配置，显示"加入购物车"按钮
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: meituanTheme.primary,
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        "&:hover": {
                          backgroundColor: "#e04345",
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDishDetail(dish);
                      }}
                    >
                      加入购物车
                    </Button>
                  )}
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      {/* 购物车底部栏（固定底部） */}
      <Box
        sx={{
          position: "fixed",
          bottom: "56px", // 避开底部导航
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          padding: "12px 16px",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              position: "relative",
              marginRight: "12px",
            }}
          >
            <ShoppingCart color="primary" sx={{ fontSize: "24px" }} />
            <Box
              sx={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                backgroundColor: meituanTheme.primary,
                color: "#fff",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {cartItemCount}
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: "bold" }}>
              总计: ¥{cartTotal.toFixed(2)}
            </Typography>
            <Typography
              sx={{ fontSize: "12px", color: meituanTheme.lightText }}
            >
              另需配送费 ¥5
            </Typography>
          </Box>
        </Box>
        <Button
          sx={{
            backgroundColor: meituanTheme.primary,
            color: "#fff",
            padding: "8px 24px",
            borderRadius: "20px",
            "&:hover": {
              backgroundColor: "#e04345",
            },
            opacity: cartItemCount > 0 ? 1 : 0.6,
            pointerEvents: cartItemCount > 0 ? "auto" : "none",
          }}
          onClick={handleCheckout} // 原先是跳转，现在改为创建订单
        >
          去结算
        </Button>
      </Box>

      {/* 底部导航 */}
      <BottomNavigationBar />

      {/* 菜品详情弹窗 */}
      <Dialog
        open={dishDetailOpen}
        onClose={() => setDishDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", overflow: "hidden" },
        }}
      >
        {currentDish && (
          <>
            <DialogTitle sx={{ padding: 0 }}>
              <img
                src={currentDish.imageUrl || PLACEHOLDER_IMAGE}
                alt={currentDish.name}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
            </DialogTitle>
            <DialogContent sx={{ padding: "16px" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", marginBottom: "8px" }}
              >
                {currentDish.name}
              </Typography>
              <Typography
                sx={{
                  color: meituanTheme.primary,
                  fontWeight: "bold",
                  marginBottom: "16px",
                }}
              >
                ¥{currentDish.price.toFixed(2)}
              </Typography>

              {/* 口味选择 */}
              {currentDish.tastes && currentDish.tastes.length > 0 && (
                <FormControl fullWidth sx={{ marginBottom: "16px" }}>
                  <InputLabel>选择口味</InputLabel>
                  <Select
                    value={taste}
                    label="选择口味"
                    onChange={(e) => setTaste(e.target.value)}
                  >
                    {currentDish.tastes.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* 配菜选择 */}
              {currentDish.sideDishes && currentDish.sideDishes.length > 0 && (
                <Box sx={{ marginBottom: "16px" }}>
                  <Typography sx={{ marginBottom: "8px", fontWeight: "bold" }}>
                    选择配菜
                  </Typography>
                  <Grid container spacing={1}>
                    {currentDish.sideDishes.map((side) => (
                      <Grid item xs={6} key={side.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedOptions[side.id] || false}
                              onChange={() => handleSideDishChange(side.id)}
                            />
                          }
                          label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ fontSize: "14px" }}>
                                {side.name}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  color: meituanTheme.primary,
                                  marginLeft: "4px",
                                }}
                              >
                                +¥{side.price.toFixed(2)}
                              </Typography>
                            </Box>
                          }
                          sx={{ margin: 0 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* 数量选择 */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "24px",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <Typography
                  sx={{
                    margin: "0 16px",
                    minWidth: "30px",
                    textAlign: "center",
                    fontSize: "16px",
                  }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Add />
                </IconButton>
              </Box>
            </DialogContent>
            <DialogActions sx={{ padding: "16px" }}>
              <Button
                fullWidth
                sx={{
                  backgroundColor: meituanTheme.primary,
                  color: "#fff",
                  padding: "12px",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#e04345",
                  },
                }}
                onClick={addToCart}
              >
                加入购物车
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrderingPage;
