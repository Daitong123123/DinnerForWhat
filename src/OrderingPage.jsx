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
  Badge,
  Chip,
} from "@mui/material";
import {
  Add,
  Remove,
  ShoppingCart,
  Search,
  Fastfood,
  Star,
  LocalFireDepartment,
  Cancel,
} from "@mui/icons-material";
import apiRequest from "./api";
import { useNavigate } from "react-router-dom";
import BottomNavigationBar from "./BottomNavigationBar";
import { useAuth } from "./login/AuthContext.js";

// 美团外卖风格主题配置
const meituanTheme = {
  primary: "#FFD100", // 美团黄
  primaryDark: "#FFC800",
  secondary: "#FFF8E6",
  text: "#333333",
  lightText: "#666666",
  grayText: "#999999",
  border: "#EEEEEE",
  background: "#F5F5F5",
  red: "#FF4444", // 辅助红色（价格、按钮）
  green: "#4CAF50", // 辅助绿色（满减）
};

// 占位图（无图片时显示）
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/100x100?text=无图片";

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

  // 结算按钮点击事件
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const orderData = {
      userId: userId,
      coupleId: coupleId,
      createdBy: userId,
      totalAmount: cartTotal,
      items: cart.map((item) => ({
        dishId: item.dishId,
        dishName: item.name,
        price: item.unitPrice,
        quantity: item.quantity,
        taste: item.taste,
        sideDishes: JSON.stringify(item.selectedSides),
        dishStatus: 0,
      })),
    };

    try {
      const response = await apiRequest(
        "/orders/create",
        "POST",
        orderData,
        navigate
      );
      if (response?.code === "200") {
        console.log("订单提交成功，已发送至厨房", "success");
        setCart([]);
        navigate("/kitchen");
      }
    } catch (error) {
      console.log("订单提交失败: " + error.message, "error");
    }
  };

  // 添加到购物车
  const addToCart = () => {
    if (!currentDish) return;

    const selectedSides = currentDish.sideDishes
      ? Object.entries(selectedOptions)
          .filter(([_, checked]) => checked)
          .map(([id]) =>
            currentDish.sideDishes.find((side) => side.id === Number(id))
          )
      : [];

    const unitPrice =
      currentDish.price +
      selectedSides.reduce((sum, side) => sum + side.price, 0);

    const cartItem = {
      id: `${currentDish.id}-${JSON.stringify(
        selectedSides.map((s) => s.id)
      )}-${taste}`,
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
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
      newCart[existingItemIndex].totalPrice =
        newCart[existingItemIndex].unitPrice *
        newCart[existingItemIndex].quantity;
      setCart(newCart);
    } else {
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

  // 计算当前选择的总价（修复语法错误：移到JSX外）
  const calculateCurrentTotal = () => {
    if (!currentDish) return 0;
    const selectedSidePrice = currentDish.sideDishes
      ? Object.entries(selectedOptions)
          .filter(([_, checked]) => checked)
          .reduce((sum, [id]) => {
            const side = currentDish.sideDishes.find(
              (s) => s.id === Number(id)
            );
            return sum + (side ? side.price : 0);
          }, 0)
      : 0;
    return (currentDish.price + selectedSidePrice) * quantity;
  };

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
            borderRadius: "24px",
            padding: "8px 16px",
          }}
        >
          <Search color="action" sx={{ mr: 1, color: meituanTheme.grayText }} />
          <TextField
            placeholder="搜索菜品"
            variant="standard"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: "14px", color: meituanTheme.text },
            }}
          />
        </Box>
      </Box>

      {/* 主体内容 */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 180px)",
        }}
      >
        {/* 移动端：顶部分类横向滚动栏 */}
        <Box
          sx={{
            width: "100%",
            backgroundColor: "#fff",
            padding: "8px 16px",
            borderBottom: `1px solid ${meituanTheme.border}`,
            overflowX: "auto",
            whiteSpace: "nowrap",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            display: { xs: "block", md: "none" },
          }}
        >
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setActiveCategory(category)}
              sx={{
                minWidth: "auto",
                padding: "6px 12px",
                marginRight: "8px",
                borderRadius: "16px",
                backgroundColor:
                  activeCategory === category ? meituanTheme.primary : "#fff",
                color:
                  activeCategory === category
                    ? meituanTheme.text
                    : meituanTheme.lightText,
                fontWeight: activeCategory === category ? "bold" : "normal",
                fontSize: "14px",
                textTransform: "none",
                "&:last-child": { marginRight: 0 },
              }}
            >
              {category}
            </Button>
          ))}
        </Box>

        {/* 桌面端：左侧分类栏 */}
        <Box
          sx={{
            width: "100px",
            backgroundColor: "#fff",
            borderRight: `1px solid ${meituanTheme.border}`,
            overflowY: "auto",
            display: { xs: "none", md: "block" },
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
                      ? meituanTheme.primary
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
                        ? meituanTheme.text
                        : meituanTheme.lightText,
                    textAlign: "center",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* 菜品列表 */}
        <Box
          sx={{
            flex: 1,
            padding: { xs: "12px", md: "16px" },
            overflowY: "auto",
            backgroundColor: meituanTheme.background,
          }}
        >
          {/* 分类标题（仅桌面端显示） */}
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: meituanTheme.text,
              display: { xs: "none", md: "block" },
            }}
          >
            {activeCategory}
          </Typography>

          {/* 满减提示 */}
          <Box
            sx={{
              backgroundColor: meituanTheme.secondary,
              borderRadius: "8px",
              padding: "8px 12px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LocalFireDepartment
              sx={{ color: meituanTheme.red, fontSize: "16px" }}
            />
            <Typography sx={{ fontSize: "13px", color: meituanTheme.red }}>
              满30元免配送费 | 满50元减5元
            </Typography>
          </Box>

          {/* 菜品卡片列表 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredDishes.map((dish) => (
              <Card
                key={dish.id}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "12px",
                  borderRadius: "12px",
                  boxShadow: "none",
                  border: `1px solid ${meituanTheme.border}`,
                  backgroundColor: "#fff",
                  "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
                  cursor: "pointer",
                }}
                onClick={() => openDishDetail(dish)}
              >
                {/* 菜品图片 */}
                <Box
                  sx={{
                    width: { xs: "80px", md: "100px" },
                    height: { xs: "80px", md: "100px" },
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginRight: "12px",
                    flexShrink: 0,
                    position: "relative",
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
                  {/* 热销标签 */}
                  {dish.sales && dish.sales > 10 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "4px",
                        left: "4px",
                        backgroundColor: meituanTheme.red,
                        color: "#fff",
                        fontSize: "10px",
                        padding: "2px 4px",
                        borderRadius: "4px",
                      }}
                    >
                      热销
                    </Box>
                  )}
                </Box>

                {/* 菜品信息 */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      marginBottom: "4px",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: meituanTheme.text,
                        fontSize: "15px",
                      }}
                    >
                      {dish.name}
                    </Typography>
                    {/* 评分标签 */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Star sx={{ color: "#FFB800", fontSize: "12px" }} />
                      <Typography
                        sx={{ fontSize: "12px", color: meituanTheme.lightText }}
                      >
                        {dish.rating || 4.5}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 口味标签 */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    {dish.tastes?.slice(0, 2).map((t, idx) => (
                      <Chip
                        key={idx}
                        label={t}
                        size="small"
                        sx={{
                          height: "18px",
                          fontSize: "11px",
                          backgroundColor: meituanTheme.secondary,
                          color: meituanTheme.text,
                          borderRadius: "4px",
                        }}
                      />
                    ))}
                    {dish.tastes?.length > 2 && (
                      <Typography
                        sx={{ fontSize: "11px", color: meituanTheme.grayText }}
                      >
                        等{dish.tastes.length}种口味
                      </Typography>
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "12px",
                      color: meituanTheme.grayText,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      marginBottom: "8px",
                      height: "16px",
                    }}
                  >
                    {dish.description || "美味佳肴，值得品尝"}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: meituanTheme.red,
                      }}
                    >
                      ¥{dish.price.toFixed(2)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: meituanTheme.grayText,
                      }}
                    >
                      {dish.sales || 0}人已点
                    </Typography>
                  </Box>
                </Box>

                {/* 加减按钮 */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0",
                    marginTop: "4px",
                  }}
                >
                  {cart.findIndex(
                    (item) =>
                      item.dishId === dish.id &&
                      JSON.stringify(item.selectedSides.map((s) => s.id)) ===
                        JSON.stringify([]) &&
                      item.taste === (dish.tastes?.[0] || "")
                  ) > -1 ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        border: `1px solid ${meituanTheme.border}`,
                        borderRadius: "16px",
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          width: "28px",
                          height: "28px",
                          padding: 0,
                          color: meituanTheme.text,
                        }}
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
                        <Remove sx={{ fontSize: "18px" }} />
                      </IconButton>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          minWidth: "24px",
                          textAlign: "center",
                          color: meituanTheme.text,
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
                        sx={{
                          width: "28px",
                          height: "28px",
                          padding: 0,
                          color: meituanTheme.text,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
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
                        <Add sx={{ fontSize: "18px" }} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: meituanTheme.primary,
                        color: meituanTheme.text,
                        padding: "4px 12px",
                        borderRadius: "16px",
                        minWidth: "80px",
                        textTransform: "none",
                        fontSize: "13px",
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: meituanTheme.primaryDark,
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

      {/* 购物车底部栏 */}
      <Box
        sx={{
          position: "fixed",
          bottom: "56px",
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          padding: "12px 16px",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
          borderRadius: "16px 16px 0 0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              position: "relative",
              marginRight: "12px",
            }}
          >
            <Badge
              badgeContent={cartItemCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: meituanTheme.red,
                  color: "#fff",
                  fontSize: "12px",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  top: "-8px",
                  right: "-8px",
                },
              }}
            >
              <ShoppingCart
                sx={{ fontSize: "26px", color: meituanTheme.primary }}
              />
            </Badge>
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "16px",
                color: meituanTheme.text,
              }}
            >
              总计: ¥{cartTotal.toFixed(2)}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: meituanTheme.grayText }}>
              {cartTotal < 30
                ? `还差¥${(30 - cartTotal).toFixed(2)}免配送费`
                : "已免配送费"}
            </Typography>
          </Box>
        </Box>
        <Button
          sx={{
            backgroundColor:
              cartItemCount > 0 ? meituanTheme.primary : meituanTheme.border,
            color:
              cartItemCount > 0 ? meituanTheme.text : meituanTheme.grayText,
            padding: "8px 24px",
            borderRadius: "24px",
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": {
              backgroundColor:
                cartItemCount > 0
                  ? meituanTheme.primaryDark
                  : meituanTheme.border,
            },
            pointerEvents: cartItemCount > 0 ? "auto" : "none",
          }}
          onClick={handleCheckout}
        >
          去结算({cartItemCount})
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
          sx: { borderRadius: "20px", overflow: "hidden", maxHeight: "90vh" },
        }}
        sx={{ "& .MuiDialog-container": { alignItems: "flex-end" } }}
      >
        {currentDish && (
          <>
            <DialogTitle sx={{ padding: 0, position: "relative" }}>
              <img
                src={currentDish.imageUrl || PLACEHOLDER_IMAGE}
                alt={currentDish.name}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <IconButton
                sx={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderRadius: "50%",
                }}
                onClick={() => setDishDetailOpen(false)}
              >
                <Cancel sx={{ fontSize: "20px", color: meituanTheme.text }} />
              </IconButton>
            </DialogTitle>
            <DialogContent
              sx={{ padding: "16px", maxHeight: "40vh", overflowY: "auto" }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  marginBottom: "8px",
                  fontSize: "18px",
                  color: meituanTheme.text,
                }}
              >
                {currentDish.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <Typography
                  sx={{
                    color: meituanTheme.red,
                    fontWeight: "bold",
                    fontSize: "20px",
                    marginRight: "12px",
                  }}
                >
                  ¥{currentDish.price.toFixed(2)}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Star sx={{ color: "#FFB800", fontSize: "14px" }} />
                  <Typography
                    sx={{ fontSize: "14px", color: meituanTheme.lightText }}
                  >
                    {currentDish.rating || 4.5} | {currentDish.sales || 0}人已点
                  </Typography>
                </Box>
              </Box>

              {/* 菜品描述 */}
              <Typography
                sx={{
                  fontSize: "14px",
                  color: meituanTheme.lightText,
                  marginBottom: "16px",
                  lineHeight: 1.5,
                }}
              >
                {currentDish.description || "精选食材制作，口感丰富，欢迎品尝"}
              </Typography>

              {/* 口味选择 */}
              {currentDish.tastes && currentDish.tastes.length > 0 && (
                <Box sx={{ marginBottom: "16px" }}>
                  <Typography
                    sx={{
                      marginBottom: "8px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: meituanTheme.text,
                    }}
                  >
                    选择口味
                  </Typography>
                  <Grid container spacing={1}>
                    {currentDish.tastes.map((t) => (
                      <Grid item xs={4} key={t}>
                        <Button
                          fullWidth
                          variant={taste === t ? "contained" : "outlined"}
                          sx={{
                            borderRadius: "8px",
                            padding: "6px 0",
                            textTransform: "none",
                            backgroundColor:
                              taste === t ? meituanTheme.primary : "#fff",
                            color:
                              taste === t
                                ? meituanTheme.text
                                : meituanTheme.lightText,
                            borderColor:
                              taste === t
                                ? meituanTheme.primary
                                : meituanTheme.border,
                            "&:hover": {
                              backgroundColor:
                                taste === t
                                  ? meituanTheme.primaryDark
                                  : "#fafafa",
                            },
                          }}
                          onClick={() => setTaste(t)}
                        >
                          {t}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* 配菜选择 */}
              {currentDish.sideDishes && currentDish.sideDishes.length > 0 && (
                <Box sx={{ marginBottom: "16px" }}>
                  <Typography
                    sx={{
                      marginBottom: "8px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: meituanTheme.text,
                    }}
                  >
                    选择配菜（可选）
                  </Typography>
                  <Grid container spacing={1}>
                    {currentDish.sideDishes.map((side) => (
                      <Grid item xs={6} key={side.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedOptions[side.id] || false}
                              onChange={() => handleSideDishChange(side.id)}
                              sx={{
                                "&.Mui-checked": {
                                  color: meituanTheme.primary,
                                },
                              }}
                            />
                          }
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "14px",
                                  color: meituanTheme.text,
                                }}
                              >
                                {side.name}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "13px",
                                  color: meituanTheme.red,
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
                  border: `1px solid ${meituanTheme.border}`,
                  width: "120px",
                  margin: "0 auto",
                  borderRadius: "20px",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  sx={{ width: "40px", height: "40px", padding: 0 }}
                >
                  <Remove sx={{ fontSize: "20px", color: meituanTheme.text }} />
                </IconButton>
                <Typography
                  sx={{
                    margin: "0 16px",
                    minWidth: "30px",
                    textAlign: "center",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: meituanTheme.text,
                  }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => q + 1)}
                  sx={{ width: "40px", height: "40px", padding: 0 }}
                >
                  <Add sx={{ fontSize: "20px", color: meituanTheme.text }} />
                </IconButton>
              </Box>
            </DialogContent>
            <DialogActions
              sx={{
                padding: "16px",
                borderTop: `1px solid ${meituanTheme.border}`,
              }}
            >
              <Button
                fullWidth
                sx={{
                  backgroundColor: meituanTheme.primary,
                  color: meituanTheme.text,
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  textTransform: "none",
                  "&:hover": { backgroundColor: meituanTheme.primaryDark },
                }}
                onClick={addToCart}
              >
                加入购物车（¥{calculateCurrentTotal().toFixed(2)}）
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrderingPage;
