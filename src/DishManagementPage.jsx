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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import apiRequest from "./api.js"; // 导入统一封装的API请求

const DishManagementPage = () => {
  // 状态管理
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

  // 从AuthContext获取用户信息
  const { user, loading: authLoading } = useAuth();
  const userId = user?.userId || "";
  const coupleId = user?.coupleId || "";

  // 初始化数据（等待Auth加载完成）
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

  // 获取菜品列表（按情侣ID筛选）
  const fetchDishes = async () => {
    setLoading(true);
    try {
      // 适配GET请求：参数通过body传递，API封装会转为query参数
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

  // 获取菜品分类
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

  // 图片上传处理（FormData格式）
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      showSnackbar("请上传图片文件", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 调用图片上传接口（FormData格式，API封装会跳过Content-Type设置）
      const response = await apiRequest("/image/p", "POST", formData, navigate);
      if (response && response.code === "200" && response.data) {
        setImageId(response.data);
        // 获取预览URL（调用下载接口）
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

  // 打开新增/编辑弹窗
  const openDishDialog = (dish = null) => {
    setIsEditMode(!!dish);
    setCurrentDish(dish);

    if (dish) {
      // 编辑模式：填充表单
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
      // 新增模式：重置表单
      setImageId("");
      setImagePreview("");
      setTastes([""]);
      setSideDishes([{ name: "", price: 0 }]);
    }

    setOpenDialog(true);
  };

  // 口味管理
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

  // 配菜管理
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

  // 保存菜品（新增/编辑）
  const saveDish = async () => {
    // 获取表单数据
    const nameInput = document.getElementById("dishName");
    const priceInput = document.getElementById("dishPrice");
    const categoryInput = document.getElementById("dishCategory");
    const descInput = document.getElementById("dishDesc");

    // 表单验证
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

    // 构建请求数据
    const dishData = {
      userId: userId,
      coupleId: coupleId,
      imageId: imageId,
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
      price: Number(priceInput.value),
      category: categoryInput.value,
      tastes: tastes.filter((t) => t.trim()), // 过滤空值
      sideDishes: sideDishes.filter(
        (side) => side.name.trim() && side.price > 0
      ), // 过滤空值
    };

    // 编辑模式需传入ID和图片ID
    if (isEditMode) {
      dishData.id = currentDish.id;
      dishData.imageId = imageId || currentDish.imageId;
    } else {
      dishData.imageId = imageId;
    }

    try {
      const url = isEditMode ? "/update-dish" : "/add-dish";
      // 调用新增/编辑接口（JSON格式，API封装会自动设置Content-Type）
      const response = await apiRequest(url, "POST", dishData, navigate);
      if (response && response.code === "200") {
        showSnackbar(isEditMode ? "菜品修改成功" : "菜品添加成功", "success");
        setOpenDialog(false);
        fetchDishes(); // 刷新列表
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

  // 删除菜品
  const deleteDish = async (dishId) => {
    if (!window.confirm("确定要删除该菜品吗？删除后不可恢复")) return;

    try {
      // 调用删除接口（GET请求，参数通过body传递）
      const response = await apiRequest(
        "/delete-dish",
        "GET",
        { dishId: dishId, coupleId: coupleId },
        navigate
      );
      if (response && response.code === "200") {
        showSnackbar("菜品删除成功", "success");
        fetchDishes(); // 刷新列表
      } else {
        throw new Error(response?.message || "删除失败");
      }
    } catch (error) {
      showSnackbar("删除失败: " + error.message, "error");
    }
  };

  // 显示提示信息
  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Auth加载中显示loading
  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#f5f5f5",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: "#f5f5f5",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* 页面标题和新增按钮 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ color: "#333", fontWeight: "bold" }}>
          菜品管理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => openDishDialog()}
          sx={{
            backgroundColor: "#FF4D4F",
            "&:hover": { backgroundColor: "#e04345" },
          }}
        >
          新增菜品
        </Button>
      </Box>

      {/* 菜品列表表格 */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
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
            <CircularProgress color="primary" />
          </Box>
        ) : dishes.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              padding: 6,
              color: "#666",
            }}
          >
            <Typography>暂无菜品数据，点击"新增菜品"添加</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>图片</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>菜品名称</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>分类</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>价格</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>口味</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>配菜</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dishes.map((dish) => (
                <TableRow key={dish.id} hover sx={{ cursor: "pointer" }}>
                  <TableCell>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "1px solid #eee",
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
                          backgroundColor: "#FFF0F0",
                          color: "#FF4D4F",
                        }}
                      />
                    )) || (
                      <Typography variant="body2" color="text.secondary">
                        无
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {dish.sideDishes?.map((side, index) => (
                      <Chip
                        key={index}
                        label={`${side.name}(+¥${side.price.toFixed(2)})`}
                        size="small"
                        sx={{
                          margin: "0 4px 4px 0",
                          backgroundColor: "#F0F7FF",
                          color: "#1890FF",
                        }}
                      />
                    )) || (
                      <Typography variant="body2" color="text.secondary">
                        无
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        openDishDialog(dish);
                      }}
                      color="primary"
                      size="small"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDish(dish.id);
                      }}
                      color="error"
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* 新增/编辑菜品弹窗 */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
            overflow: "auto",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#f5f5f5",
            padding: 2,
            fontWeight: "bold",
          }}
        >
          {isEditMode ? "编辑菜品" : "新增菜品"}
        </DialogTitle>
        <DialogContent sx={{ padding: 3 }}>
          <Grid container spacing={3}>
            {/* 图片上传区域 */}
            <Grid item xs={12} md={4}>
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
                    height: 180,
                    border: "2px dashed #ccc",
                    borderRadius: 2,
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
                    <ImageIcon sx={{ fontSize: 48, color: "#999" }} />
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
                    sx={{ width: "100%" }}
                  >
                    {imageId ? "更换图片" : "上传图片"}
                  </Button>
                </label>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ marginTop: 1 }}
                >
                  支持JPG、PNG格式，建议尺寸1:1
                </Typography>
              </Box>
            </Grid>

            {/* 基本信息表单 */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    id="dishName"
                    label="菜品名称"
                    fullWidth
                    defaultValue={currentDish?.name || ""}
                    variant="outlined"
                    required
                    sx={{ backgroundColor: "#fff" }}
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
                    sx={{ backgroundColor: "#fff" }}
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
                    sx={{ backgroundColor: "#fff" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="dishDesc"
                    label="菜品描述"
                    fullWidth
                    multiline
                    rows={3}
                    defaultValue={currentDish?.description || ""}
                    variant="outlined"
                    sx={{ backgroundColor: "#fff" }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* 口味设置 */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ marginBottom: 1, fontWeight: "bold" }}
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
                    sx={{ backgroundColor: "#fff" }}
                  />
                  <IconButton
                    onClick={() => handleRemoveTaste(index)}
                    disabled={tastes.length <= 1}
                    color="error"
                    size="small"
                  >
                    <RemoveCircleOutline />
                  </IconButton>
                  {index === tastes.length - 1 && (
                    <IconButton
                      onClick={handleAddTaste}
                      color="primary"
                      size="small"
                    >
                      <AddCircleOutline />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Typography variant="caption" color="text.secondary">
                至少保留一种口味，为空将不显示
              </Typography>
            </Grid>

            {/* 配菜设置 */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ marginBottom: 1, fontWeight: "bold" }}
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
                    sx={{ backgroundColor: "#fff" }}
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
                    sx={{ backgroundColor: "#fff" }}
                  />
                  <IconButton
                    onClick={() => handleRemoveSideDish(index)}
                    disabled={sideDishes.length <= 1}
                    color="error"
                    size="small"
                  >
                    <RemoveCircleOutline />
                  </IconButton>
                  {index === sideDishes.length - 1 && (
                    <IconButton
                      onClick={handleAddSideDish}
                      color="primary"
                      size="small"
                    >
                      <AddCircleOutline />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Typography variant="caption" color="text.secondary">
                名称和价格均不为空才会显示
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ padding: 2, borderTop: "1px solid #eee" }}>
          <Button
            onClick={() => setOpenDialog(false)}
            startIcon={<Cancel />}
            variant="outlined"
          >
            取消
          </Button>
          <Button
            onClick={saveDish}
            startIcon={<Save />}
            variant="contained"
            sx={{ backgroundColor: "#FF4D4F" }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示弹窗 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DishManagementPage;
