import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Snackbar,
  Alert,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Image as ImageIcon,
  AddCircleOutline,
  RemoveCircleOutline,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./login/AuthContext.js";
import apiRequest from "./api.js";

// 美团外卖风格主题配置
const meituanTheme = {
  primary: "#FFD100", // 美团黄
  primaryDark: "#FFC800",
  secondary: "#FFF8E6", // 浅黄背景
  text: "#333333",
  lightText: "#666666",
  grayText: "#999999",
  border: "#EEEEEE",
  red: "#FF4444", // 辅助红色（删除按钮）
};

const DishManagementPage = () => {
  // 状态管理（保持不变）
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDish, setCurrentDish] = useState(null);
  const [imageId, setImageId] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [tastes, setTastes] = useState([""]);
  const [sideDishes, setSideDishes] = useState([{ name: "", price: 0 }]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  // Auth相关（保持不变）
  const { user, loading: authLoading } = useAuth();
  const userId = user?.userId || "";
  const coupleId = user?.coupleId || "";

  // 初始化数据（保持不变）
  useEffect(() => {
    if (authLoading) return;

    if (!userId || !coupleId) {
      showSnackbar("请先登录并绑定情侣关系", "error");
      navigate("/home");
      return;
    }
    fetchDishes();
    fetchCategories();
  }, [userId, coupleId, authLoading, navigate]);

  // API请求函数（保持不变）
  const fetchDishes = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(
        "/get-dishes",
        "POST",
        {
          curPage: 1,
          pageSize: 100,
          coupleId: coupleId,
        },
        navigate
      );

      if (response && response.code === "200") {
        setDishes(response.data || []);
      } else {
        throw new Error(response?.message || "获取菜品列表失败");
      }
    } catch (error) {
      showSnackbar("获取菜品失败: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiRequest("/get-categories", "GET", {}, navigate);
      if (response && response.code === "200") {
        setCategories(response.data || []);
      } else {
        throw new Error(response?.message || "获取分类失败");
      }
    } catch (error) {
      showSnackbar("获取分类失败: " + error.message, "error");
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showSnackbar("请上传图片文件", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiRequest("/image/p", "POST", formData, navigate);
      if (response && response.code === "200" && response.data) {
        setImageId(response.data);
        const previewRes = await apiRequest(
          `/get-image-preview`,
          "GET",
          { fileId: response.data },
          navigate
        );
        if (previewRes && previewRes.code === "200") {
          setImagePreview(previewRes.data || "");
        }
        showSnackbar("图片上传成功", "success");
      } else {
        throw new Error(response?.message || "图片上传失败");
      }
    } catch (error) {
      showSnackbar("图片上传失败: " + error.message, "error");
    }
  };

  const openDishDialog = (dish = null) => {
    setIsEditMode(!!dish);
    setCurrentDish(dish);

    if (dish) {
      setImageId(dish.imageId || "");
      setImagePreview(dish.imageUrl || "");
      setTastes(dish.tastes && dish.tastes.length ? [...dish.tastes] : [""]);
      setSideDishes(
        dish.sideDishes && dish.sideDishes.length
          ? dish.sideDishes.map((side) => ({
              name: side.name,
              price: side.price,
            }))
          : [{ name: "", price: 0 }]
      );
    } else {
      setImageId("");
      setImagePreview("");
      setTastes([""]);
      setSideDishes([{ name: "", price: 0 }]);
    }

    setOpenDialog(true);
  };

  // 口味管理（保持不变）
  const handleAddTaste = () => setTastes([...tastes, ""]);
  const handleRemoveTaste = (index) => {
    if (tastes.length <= 1) return;
    const newTastes = [...tastes];
    newTastes.splice(index, 1);
    setTastes(newTastes);
  };
  const handleTasteChange = (index, value) => {
    const newTastes = [...tastes];
    newTastes[index] = value;
    setTastes(newTastes);
  };

  // 配菜管理（保持不变）
  const handleAddSideDish = () =>
    setSideDishes([...sideDishes, { name: "", price: 0 }]);
  const handleRemoveSideDish = (index) => {
    if (sideDishes.length <= 1) return;
    const newSides = [...sideDishes];
    newSides.splice(index, 1);
    setSideDishes(newSides);
  };
  const handleSideDishChange = (index, field, value) => {
    const newSides = [...sideDishes];
    newSides[index][field] = field === "price" ? Number(value) : value;
    setSideDishes(newSides);
  };

  // 保存菜品（保持不变）
  const saveDish = async () => {
    const nameInput = document.getElementById("dishName");
    const priceInput = document.getElementById("dishPrice");
    const categoryInput = document.getElementById("dishCategory");
    const descInput = document.getElementById("dishDesc");

    if (!nameInput.value.trim()) {
      showSnackbar("请输入菜品名称", "warning");
      nameInput.focus();
      return;
    }
    if (
      !priceInput.value ||
      isNaN(priceInput.value) ||
      Number(priceInput.value) <= 0
    ) {
      showSnackbar("请输入有效的价格", "warning");
      priceInput.focus();
      return;
    }
    if (!categoryInput.value) {
      showSnackbar("请选择菜品分类", "warning");
      return;
    }
    if (!isEditMode && !imageId) {
      showSnackbar("请上传菜品图片", "warning");
      return;
    }

    const dishData = {
      userId: userId,
      coupleId: coupleId,
      imageId: imageId,
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
      price: Number(priceInput.value),
      category: categoryInput.value,
      tastes: tastes.filter((t) => t.trim()),
      sideDishes: sideDishes.filter(
        (side) => side.name.trim() && side.price > 0
      ),
    };

    if (isEditMode) {
      dishData.id = currentDish.id;
      dishData.imageId = imageId || currentDish.imageId;
    } else {
      dishData.imageId = imageId;
    }

    try {
      const url = isEditMode ? "/update-dish" : "/add-dish";
      const response = await apiRequest(url, "POST", dishData, navigate);
      if (response && response.code === "200") {
        showSnackbar(isEditMode ? "菜品修改成功" : "菜品添加成功", "success");
        setOpenDialog(false);
        fetchDishes();
      } else {
        throw new Error(
          response?.message || `${isEditMode ? "修改" : "添加"}失败`
        );
      }
    } catch (error) {
      showSnackbar(
        `${isEditMode ? "修改" : "添加"}失败: ${error.message}`,
        "error"
      );
    }
  };

  // 删除菜品（保持不变）
  const deleteDish = async (dishId) => {
    if (!window.confirm("确定要删除该菜品吗？删除后不可恢复")) return;

    try {
      const response = await apiRequest(
        "/delete-dish",
        "GET",
        { dishId: dishId, coupleId: coupleId },
        navigate
      );
      if (response && response.code === "200") {
        showSnackbar("菜品删除成功", "success");
        fetchDishes();
      } else {
        throw new Error(response?.message || "删除失败");
      }
    } catch (error) {
      showSnackbar("删除失败: " + error.message, "error");
    }
  };

  // 显示提示信息（保持不变）
  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Auth加载中显示loading（优化样式）
  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: meituanTheme.background || "#f5f5f5",
        }}
      >
        <CircularProgress sx={{ color: meituanTheme.primary }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: { xs: 1, md: 3 }, // 移动端减小内边距
        backgroundColor: meituanTheme.background || "#f5f5f5",
        minHeight: "100vh", // 覆盖全屏高度
      }}
    >
      {/* 页面标题和新增按钮（美团风格改造） */}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", md: "space-between" }, // 移动端居中
          alignItems: "center",
          marginBottom: { xs: 2, md: 3 },
          flexDirection: { xs: "column", md: "row" }, // 移动端垂直堆叠
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: meituanTheme.text,
            fontWeight: "bold",
            fontSize: { xs: "1.2rem", md: "1.5rem" }, // 移动端字号适配
          }}
        >
          菜品管理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => openDishDialog()}
          sx={{
            backgroundColor: meituanTheme.primary,
            color: meituanTheme.text,
            fontWeight: "bold",
            borderRadius: "24px", // 美团大圆角按钮
            padding: { xs: "8px 24px", md: "10px 30px" },
            "&:hover": { backgroundColor: meituanTheme.primaryDark },
            boxShadow: "0 2px 8px rgba(255,209,0,0.4)", // 黄色阴影
          }}
        >
          新增菜品
        </Button>
      </Box>

      {/* 菜品列表（响应式改造核心） */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px", // 大圆角
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              padding: 4,
            }}
          >
            <CircularProgress sx={{ color: meituanTheme.primary }} />
          </Box>
        ) : dishes.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              padding: { xs: 4, md: 6 },
              color: meituanTheme.lightText,
            }}
          >
            <Typography variant="body1">
              暂无菜品数据，点击"新增菜品"添加
            </Typography>
          </Box>
        ) : (
          // 桌面端表格 + 移动端卡片列表
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Table>
              <TableHead sx={{ backgroundColor: meituanTheme.secondary }}>
                {" "}
                {/* 浅黄表头 */}
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", color: meituanTheme.text }}
                  >
                    图片
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: meituanTheme.text }}
                  >
                    菜品名称
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: meituanTheme.text }}
                  >
                    分类
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: meituanTheme.text }}
                  >
                    价格
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: meituanTheme.text }}
                  >
                    口味
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: meituanTheme.text }}
                  >
                    配菜
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", color: meituanTheme.text }}
                  >
                    操作
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dishes.map((dish) => (
                  <TableRow key={dish.id} hover sx={{ cursor: "pointer" }}>
                    {/* 桌面端表格内容（优化样式） */}
                    <TableCell>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: `1px solid ${meituanTheme.border}`,
                        }}
                      >
                        <img
                          src={dish.imageUrl || "/placeholder.png"}
                          alt={dish.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{dish.name}</TableCell>
                    <TableCell>{dish.category}</TableCell>
                    <TableCell>¥{dish.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {dish.tastes?.map((taste, index) => (
                        <Chip
                          key={index}
                          label={taste}
                          size="small"
                          sx={{
                            margin: "0 4px 4px 0",
                            backgroundColor: meituanTheme.secondary,
                            color: "#FF8C00",
                            borderRadius: "4px",
                          }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {dish.sideDishes?.map((side, index) => (
                        <Chip
                          key={index}
                          label={`${side.name}(+¥${side.price.toFixed(2)})`}
                          size="small"
                          sx={{
                            margin: "0 4px 4px 0",
                            backgroundColor: "#E8F5E9",
                            color: "#4CAF50",
                            borderRadius: "4px",
                          }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          openDishDialog(dish);
                        }}
                        size="small"
                        sx={{ color: meituanTheme.text }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDish(dish.id);
                        }}
                        size="small"
                        sx={{ color: meituanTheme.red }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* 移动端菜品卡片列表（新增） */}
        <Box sx={{ display: { xs: "block", md: "none" }, padding: 1 }}>
          {dishes.map((dish) => (
            <Paper
              key={dish.id}
              sx={{
                marginBottom: 2,
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                backgroundColor: "#fff",
              }}
            >
              <Box sx={{ display: "flex", padding: 2, gap: 2 }}>
                {/* 菜品图片 */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "8px",
                    overflow: "hidden",
                    flexShrink: 0, // 防止图片缩小
                    border: `1px solid ${meituanTheme.border}`,
                  }}
                >
                  <img
                    src={dish.imageUrl || "/placeholder.png"}
                    alt={dish.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>

                {/* 菜品信息 */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      color: meituanTheme.text,
                      fontSize: "15px",
                    }}
                  >
                    {dish.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: meituanTheme.red,
                      marginTop: 0.5,
                      fontWeight: "bold",
                    }}
                  >
                    ¥{dish.price.toFixed(2)}
                  </Typography>
                  <Box
                    sx={{
                      marginTop: 1,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {dish.tastes?.map((taste, index) => (
                      <Chip
                        key={index}
                        label={taste}
                        size="small"
                        sx={{
                          backgroundColor: meituanTheme.secondary,
                          color: "#FF8C00",
                          borderRadius: "4px",
                          height: 20,
                          fontSize: "11px",
                        }}
                      />
                    ))}
                  </Box>
                  <Box
                    sx={{
                      marginTop: 1,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {dish.sideDishes?.map((side, index) => (
                      <Chip
                        key={index}
                        label={`${side.name}(+¥${side.price.toFixed(2)})`}
                        size="small"
                        sx={{
                          backgroundColor: "#E8F5E9",
                          color: "#4CAF50",
                          borderRadius: "4px",
                          height: 20,
                          fontSize: "11px",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* 操作按钮（底部固定，美团风格） */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  padding: "8px 16px",
                  borderTop: `1px solid ${meituanTheme.border}`,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => openDishDialog(dish)}
                  sx={{
                    borderColor: meituanTheme.primary,
                    color: meituanTheme.text,
                    borderRadius: "20px",
                    padding: "4px 12px",
                    textTransform: "none",
                    fontWeight: "500",
                  }}
                >
                  编辑
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => deleteDish(dish.id)}
                  sx={{
                    backgroundColor: meituanTheme.red,
                    color: "#fff",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    textTransform: "none",
                    fontWeight: "500",
                  }}
                >
                  删除
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </TableContainer>

      {/* 新增/编辑菜品弹窗（移动端适配改造） */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            maxHeight: "95vh", // 增大弹窗高度
            overflow: "auto",
            paddingBottom: 1,
          },
        }}
        sx={{ "& .MuiDialog-container": { alignItems: "flex-end" } }} // 移动端底部弹出
      >
        <DialogTitle
          sx={{
            backgroundColor: meituanTheme.secondary,
            padding: 2,
            fontWeight: "bold",
            color: meituanTheme.text,
            fontSize: "1.1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isEditMode ? "编辑菜品" : "新增菜品"}
          <IconButton
            size="small"
            onClick={() => setOpenDialog(false)}
            sx={{ color: meituanTheme.lightText }}
          >
            <Cancel fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: { xs: 2, md: 3 } }}>
          <Grid container spacing={2}>
            {/* 图片上传区域（移动端全屏宽度） */}
            <Grid item xs={12}>
              {" "}
              {/* 移除md断点，统一为12列 */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 150, md: 180 }, // 移动端减小图片高度
                    border: `2px dashed ${meituanTheme.border}`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 2,
                    overflow: "hidden",
                    backgroundColor: "#fafafa",
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="菜品预览"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <ImageIcon
                      sx={{ fontSize: 48, color: meituanTheme.grayText }}
                    />
                  )}
                </Box>
                <input
                  type="file"
                  id="imageUpload"
                  hidden
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                <label htmlFor="imageUpload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<ImageIcon />}
                    sx={{
                      width: "100%",
                      borderColor: meituanTheme.primary,
                      color: meituanTheme.text,
                      borderRadius: "20px",
                      textTransform: "none",
                    }}
                  >
                    {imageId ? "更换图片" : "上传图片"}
                  </Button>
                </label>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ marginTop: 1, color: meituanTheme.grayText }}
                >
                  支持JPG、PNG格式，建议尺寸1:1
                </Typography>
              </Box>
            </Grid>

            {/* 基本信息表单（移动端垂直堆叠） */}
            <Grid item xs={12}>
              {" "}
              {/* 移除md断点，统一为12列 */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    id="dishName"
                    label="菜品名称"
                    fullWidth
                    defaultValue={currentDish?.name || ""}
                    variant="outlined"
                    required
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        borderColor: meituanTheme.border,
                      },
                      "& .Mui-focused .MuiOutlinedInput-root": {
                        borderColor: meituanTheme.primary,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    id="dishPrice"
                    label="价格（元）"
                    fullWidth
                    type="number"
                    step="0.01"
                    min="0.01"
                    defaultValue={currentDish?.price || ""}
                    variant="outlined"
                    required
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        borderColor: meituanTheme.border,
                      },
                      "& .Mui-focused .MuiOutlinedInput-root": {
                        borderColor: meituanTheme.primary,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    id="dishCategory"
                    label="菜品分类"
                    fullWidth
                    defaultValue={currentDish?.category || ""}
                    variant="outlined"
                    required
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        borderColor: meituanTheme.border,
                      },
                      "& .Mui-focused .MuiOutlinedInput-root": {
                        borderColor: meituanTheme.primary,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="dishDesc"
                    label="菜品描述"
                    fullWidth
                    multiline
                    rows={2} // 移动端减少行数
                    defaultValue={currentDish?.description || ""}
                    variant="outlined"
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        borderColor: meituanTheme.border,
                      },
                      "& .Mui-focused .MuiOutlinedInput-root": {
                        borderColor: meituanTheme.primary,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* 口味设置（优化样式） */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{
                  marginBottom: 1,
                  fontWeight: "bold",
                  color: meituanTheme.text,
                }}
              >
                口味设置
              </Typography>
              {tastes.map((taste, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 1,
                    gap: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    value={taste}
                    onChange={(e) => handleTasteChange(index, e.target.value)}
                    placeholder={`请输入口味 ${index + 1}`}
                    variant="outlined"
                    size="small"
                    sx={{
                      backgroundColor: "#fff",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        borderColor: meituanTheme.border,
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => handleRemoveTaste(index)}
                    disabled={tastes.length <= 1}
                    size="small"
                    sx={{ color: meituanTheme.red }}
                  >
                    <RemoveCircleOutline />
                  </IconButton>
                  {index === tastes.length - 1 && (
                    <IconButton
                      onClick={handleAddTaste}
                      size="small"
                      sx={{ color: meituanTheme.primary }}
                    >
                      <AddCircleOutline />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Grid>

            {/* 配菜设置（优化样式） */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{
                  marginBottom: 1,
                  fontWeight: "bold",
                  color: meituanTheme.text,
                }}
              >
                配菜设置
              </Typography>
              {sideDishes.map((side, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 1,
                    gap: 1,
                  }}
                >
                  <TextField
                    flex={3}
                    value={side.name}
                    onChange={(e) =>
                      handleSideDishChange(index, "name", e.target.value)
                    }
                    placeholder={`配菜名称 ${index + 1}`}
                    variant="outlined"
                    size="small"
                    sx={{
                      backgroundColor: "#fff",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        borderColor: meituanTheme.border,
                      },
                    }}
                  />
                  <TextField
                    flex={1}
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={side.price}
                    onChange={(e) =>
                      handleSideDishChange(index, "price", e.target.value)
                    }
                    placeholder="价格"
                    variant="outlined"
                    size="small"
                    sx={{
                      backgroundColor: "#fff",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        borderColor: meituanTheme.border,
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => handleRemoveSideDish(index)}
                    disabled={sideDishes.length <= 1}
                    size="small"
                    sx={{ color: meituanTheme.red }}
                  >
                    <RemoveCircleOutline />
                  </IconButton>
                  {index === sideDishes.length - 1 && (
                    <IconButton
                      onClick={handleAddSideDish}
                      size="small"
                      sx={{ color: meituanTheme.primary }}
                    >
                      <AddCircleOutline />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            padding: 2,
            borderTop: `1px solid ${meituanTheme.border}`,
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            startIcon={<Cancel />}
            variant="outlined"
            sx={{
              borderColor: meituanTheme.border,
              color: meituanTheme.lightText,
              borderRadius: "20px",
              padding: "6px 20px",
              textTransform: "none",
            }}
          >
            取消
          </Button>
          <Button
            onClick={saveDish}
            startIcon={<Save />}
            variant="contained"
            sx={{
              backgroundColor: meituanTheme.primary,
              color: meituanTheme.text,
              fontWeight: "bold",
              borderRadius: "20px",
              padding: "6px 20px",
              boxShadow: "0 2px 8px rgba(255,209,0,0.4)",
              textTransform: "none",
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示弹窗（优化样式） */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: "8px",
            backgroundColor:
              snackbar.severity === "success" ? "#E8F5E9" : undefined,
            color: snackbar.severity === "success" ? "#4CAF50" : undefined,
            border: `1px solid ${
              snackbar.severity === "success" ? "#C8E6C9" : meituanTheme.border
            }`,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DishManagementPage;
