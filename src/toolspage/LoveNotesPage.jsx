import React, { useState, useEffect, useRef } from 'react';
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
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Tooltip,
    Slide,
    AppBar,
    Toolbar,
    Backdrop,
    CircularProgress,
    Snackbar,
    Alert,
    Paper,
    CardMedia
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNavigationBar from '../BottomNavigationBar.jsx';
import Layout from '../Layout.jsx';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PersonIcon from '@mui/icons-material/Person';
import { styled } from '@mui/system';
import { format, parseISO } from 'date-fns';
import COLORS from '../constants/color.js';
import apiRequest from '../api.js';
import { useAuth } from '../login/AuthContext.js';
import heartPattern from '../assets/heart-pattern.svg'; // 爱心背景图案

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
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 20px rgba(255, 94, 135, 0.15)',
    },
}));

const NoteCard = styled(Card)(({ theme }) => ({
    borderRadius: '1rem',
    boxShadow: '0 2px 10px rgba(255, 94, 135, 0.05)',
    marginBottom: '1.25rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 15px rgba(255, 94, 135, 0.1)',
    },
}));

const NoteContent = styled(CardContent)(({ theme }) => ({
    padding: '1.25rem',
    '&:last-child': {
        paddingBottom: '1.25rem',
    },
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
    borderRadius: '0.75rem',
    textTransform: 'none',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    '&:hover': {
        transform: 'scale(1.03)',
    },
}));

const EditTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root': {
        borderRadius: '0.75rem',
    },
}));

// 空状态样式
const EmptyStateContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 4px 20px rgba(255, 94, 135, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    
    // 背景爱心图案
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${heartPattern})`,
        backgroundSize: '200px',
        backgroundRepeat: 'repeat',
        opacity: '0.05',
        zIndex: 0,
    }
}));

const EmptyStateTitle = styled(Typography)(({ theme }) => ({
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: '1rem',
    zIndex: 1,
    textAlign: 'center',
}));

const EmptyStateMessage = styled(Typography)(({ theme }) => ({
    fontSize: '1rem',
    color: COLORS.dark,
    marginBottom: '2rem',
    maxWidth: '300px',
    textAlign: 'center',
    zIndex: 1,
}));

const FloatingHeart = styled(Box)(({ theme, position, size, opacity }) => ({
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    background: `radial-gradient(circle, ${COLORS.primary} 0%, ${COLORS.primary + '80'} 100%)`,
    borderRadius: '50%',
    opacity: opacity,
    zIndex: 0,
    animation: `float${Math.floor(Math.random() * 3) + 1} 8s ease-in-out infinite`,
    '@keyframes float1': {
        '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
        '50%': { transform: 'translateY(-20px) rotate(10deg)' },
    },
    '@keyframes float2': {
        '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
        '50%': { transform: 'translateY(-15px) rotate(-10deg)' },
    },
    '@keyframes float3': {
        '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
        '50%': { transform: 'translateY(-25px) rotate(5deg)' },
    },
    ...position,
}));

function LoveNotesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isNewNote, setIsNewNote] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const noteTitleRef = useRef(null);
    const noteContentRef = useRef(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    
    const { user, spouse, loading: authLoading } = useAuth();
    const coupleId = user?.coupleId || ''; // 从用户信息中获取coupleId，字符串类型
    
    // 模拟用户数据
    const users = [
        { id: user?.userId || 'user1', name: user?.userName || '我', avatar: 'https://picsum.photos/seed/user1/100/100' },
        spouse ? { id: spouse.userId, name: spouse.userName || '伴侣', avatar: 'https://picsum.photos/seed/user2/100/100' } : null
    ].filter(Boolean);
    
    // 空状态提示语数组
    const emptyStateMessages = [
        "记录下你们的点点滴滴，创造专属回忆",
        "每一段爱情都值得被珍藏，从这里开始",
        "用文字留住心动瞬间，让爱有迹可循",
        "写下你们的故事，让时光见证爱情成长",
        "爱情需要仪式感，记录是最好的告白"
    ];
    
    // 随机选择一条提示语
    const randomMessage = emptyStateMessages[Math.floor(Math.random() * emptyStateMessages.length)];
    
    // 加载笔记数据
    useEffect(() => {
        if (coupleId) {
            fetchNotes();
        }
    }, [coupleId]);
    
    // 获取笔记数据
    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await apiRequest('/api/love-note/list', 'GET', { coupleId }, navigate);
            if (response && response.code === '200') {
                // 转换日期格式
                const formattedNotes = response.data.map(note => ({
                    ...note,
                    date: new Date(note.createTime),
                    tags: note.tags ? note.tags.split(',') : []
                }));
                setNotes(formattedNotes);
            } else {
                setError(response?.message || '获取笔记失败');
                setOpenSnackbar(true);
            }
        } catch (error) {
            setError('网络错误，请稍后重试');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };
    
    // 格式化日期
    const formatDate = (date) => {
        return format(date, 'yyyy-MM-dd');
    };
    
    // 获取用户信息
    const getUser = (userId) => {
        return users.find(u => u.id === userId) || { name: userId };
    };
    
    // 打开笔记对话框
    const openNoteDialog = (note = null, isNew = false) => {
        setSelectedNote(note ? { 
            ...note, 
            date: note.date ? new Date(note.date) : new Date(),
            tags: note.tags || []
        } : { 
            id: null, 
            coupleId: coupleId,
            title: '', 
            content: '', 
            date: new Date(), 
            authorId: user?.userId || 'user1', 
            tags: [] 
        });
        setIsNewNote(isNew);
        setDialogOpen(true);
        
        // 自动聚焦标题输入框
        setTimeout(() => {
            if (noteTitleRef.current) {
                noteTitleRef.current.focus();
            }
        }, 300);
    };
    
    // 关闭笔记对话框
    const closeNoteDialog = () => {
        setDialogOpen(false);
        setSelectedNote(null);
    };
    
    // 保存笔记
    const saveNote = async () => {
        if (!selectedNote.title.trim()) {
            setError('请输入笔记标题');
            setOpenSnackbar(true);
            return;
        }
        
        setLoading(true);
        
        try {
            // 准备提交的数据
            const noteData = {
                ...selectedNote,
                tags: selectedNote.tags.join(','),
                createTime: selectedNote.date?.toISOString() || new Date().toISOString(),
                coupleId: coupleId
            };
            
            let result;
            const endpoint = isNewNote ? '/api/love-note/add' : '/api/love-note/update';
            
            result = await apiRequest(endpoint, 'POST', noteData, navigate);
            
            if (result && result.code === '200') {
                setSuccessMessage(isNewNote ? '笔记创建成功！' : '笔记更新成功！');
                setOpenSnackbar(true);
                
                // 更新本地状态
                if (isNewNote) {
                    setNotes([{ ...selectedNote, id: result.data }, ...notes]);
                } else {
                    setNotes(notes.map(note => note.id === selectedNote.id ? selectedNote : note));
                }
                
                closeNoteDialog();
            } else {
                setError(result?.message || (isNewNote ? '创建笔记失败' : '更新笔记失败'));
                setOpenSnackbar(true);
            }
        } catch (error) {
            setError('网络错误，请稍后重试');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };
    
    // 删除笔记
    const deleteNote = async (noteId) => {
        if (window.confirm('确定要删除这条笔记吗？')) {
            setLoading(true);
            
            try {
                const result = await apiRequest('/api/love-note/delete', 'GET', { id: noteId }, navigate);
                
                if (result && result.code === '200') {
                    setSuccessMessage('笔记已删除！');
                    setOpenSnackbar(true);
                    
                    // 更新本地状态
                    setNotes(notes.filter(note => note.id !== noteId));
                } else {
                    setError(result?.message || '删除笔记失败');
                    setOpenSnackbar(true);
                }
            } catch (error) {
                setError('网络错误，请稍后重试');
                setOpenSnackbar(true);
            } finally {
                setLoading(false);
            }
        }
    };
    
    // 打开更多操作菜单
    const openMenu = (event, noteId) => {
        setAnchorEl(event.currentTarget);
        setSelectedNote(notes.find(note => note.id === noteId));
    };
    
    // 关闭更多操作菜单
    const closeMenu = () => {
        setAnchorEl(null);
    };
    
    // 更新笔记内容
    const updateNoteField = (field, value) => {
        setSelectedNote(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    // 添加标签
    const addTag = (tag) => {
        if (tag && !selectedNote.tags.includes(tag)) {
            updateNoteField('tags', [...selectedNote.tags, tag]);
        }
    };
    
    // 删除标签
    const removeTag = (tagToRemove) => {
        updateNoteField('tags', selectedNote.tags.filter(tag => tag !== tagToRemove));
    };
    
    // 关闭提示框
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    // 如果认证信息正在加载或者用户未登录，显示加载状态
    if (authLoading || !user) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <CircularProgress color="primary" />
                </Box>
            </Layout>
        );
    }

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
                        爱情笔记
                    </Typography>
                </Toolbar>
            </AppBar>
            
            <Box sx={{ p: 3, minHeight: 'calc(100vh - 112px)', backgroundColor: COLORS.lightPink }}>
                {/* 笔记列表 */}
                <Box sx={{ mt: 2 }}>
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress color="primary" />
                        </Box>
                    )}
                    
                    {notes.length > 0 ? (
                        <List>
                            {notes.map(note => (
                                <NoteCard key={note.id}>
                                    <NoteContent>
                                        <Grid container alignItems="center" justifyContent="space-between">
                                            <Grid item xs={10}>
                                                <Typography variant="h6" fontWeight="bold" color={COLORS.dark} mb={1}>
                                                    {note.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" mb={2}>
                                                    <DateRangeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    {formatDate(note.date)}
                                                    <span sx={{ mx: 2 }}>|</span>
                                                    <PersonIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    {getUser(note.authorId).name}
                                                </Typography>
                                                <Typography variant="body1" color="text.primary" mb={2} lineClamp={2}>
                                                    {note.content}
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {note.tags?.filter(tag => tag).map(tag => (
                                                        <Chip
                                                            key={tag}
                                                            label={tag}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: COLORS.primary + '15',
                                                                color: COLORS.primary,
                                                                '&:hover': {
                                                                    backgroundColor: COLORS.primary + '25',
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Grid>
                                            <Grid item xs={2} sx={{ textAlign: 'right' }}>
                                                <IconButton
                                                    aria-label="more"
                                                    aria-controls={`note-menu-${note.id}`}
                                                    aria-haspopup="true"
                                                    onClick={(e) => openMenu(e, note.id)}
                                                    color="primary"
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </NoteContent>
                                </NoteCard>
                            ))}
                        </List>
                    ) : !loading && (
                        <EmptyStateContainer>
                            {/* 浮动爱心装饰 */}
                            <FloatingHeart position={{ top: '10%', left: '15%' }} size={30} opacity={0.2} />
                            <FloatingHeart position={{ top: '20%', right: '20%' }} size={25} opacity={0.3} />
                            <FloatingHeart position={{ bottom: '30%', left: '10%' }} size={20} opacity={0.25} />
                            <FloatingHeart position={{ bottom: '20%', right: '15%' }} size={35} opacity={0.15} />
                            
                            {/* 主内容 */}
                            <Avatar 
                                sx={{ 
                                    width: 80, 
                                    height: 80, 
                                    backgroundColor: COLORS.primary, 
                                    mb: 3, 
                                    boxShadow: '0 8px 20px rgba(255, 94, 135, 0.3)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => openNoteDialog(null, true)}
                            >
                                <AddIcon fontSize="large" />
                            </Avatar>
                            
                            <EmptyStateTitle>还没有爱情笔记</EmptyStateTitle>
                            <EmptyStateMessage>{randomMessage}</EmptyStateMessage>
                            
                            <Box 
                                sx={{ 
                                    cursor: 'pointer',
                                    borderRadius: '1rem', 
                                    py: '0.75rem', 
                                    px: '2rem', 
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 15px rgba(255, 94, 135, 0.2)',
                                    backgroundColor: COLORS.primary,
                                    color: 'white',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(255, 94, 135, 0.3)',
                                        transform: 'scale(1.03)',
                                    }
                                }}
                                onClick={() => openNoteDialog(null, true)}
                            >
                                点击上方红色加号开始记录
                            </Box>
                        </EmptyStateContainer>
                    )}
                </Box>
            </Box>
            
            {/* 更多操作菜单 */}
            <Menu
                id="note-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={closeMenu}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        borderRadius: '0.75rem',
                        boxShadow: '0 8px 25px rgba(255, 94, 135, 0.15)',
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem
                    onClick={() => {
                        closeMenu();
                        openNoteDialog(selectedNote, false);
                    }}
                >
                    <EditIcon sx={{ mr: 2, color: COLORS.primary }} />
                    编辑笔记
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        closeMenu();
                        deleteNote(selectedNote.id);
                    }}
                >
                    <DeleteIcon sx={{ mr: 2, color: COLORS.secondary }} />
                    删除笔记
                </MenuItem>
            </Menu>
            
            {/* 笔记编辑对话框 */}
            <Dialog
                open={dialogOpen}
                onClose={closeNoteDialog}
                maxWidth="md"
                fullWidth
                TransitionComponent={Slide}
                TransitionProps={{ direction: 'up' }}
            >
                <DialogTitle sx={{ backgroundColor: COLORS.primary, color: 'white' }}>
                    {isNewNote ? '新建笔记' : '编辑笔记'}
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <EditTextField
                        label="标题"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={selectedNote?.title || ''}
                        onChange={(e) => updateNoteField('title', e.target.value)}
                        inputRef={noteTitleRef}
                        sx={{ mb: 3 }}
                    />
                    
                    <EditTextField
                        label="内容"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={8}
                        value={selectedNote?.content || ''}
                        onChange={(e) => updateNoteField('content', e.target.value)}
                        inputRef={noteContentRef}
                    />
                    
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle2" fontWeight="500" mb={2}>
                            标签
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {selectedNote?.tags?.map(tag => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    onDelete={() => removeTag(tag)}
                                    size="small"
                                    sx={{
                                        backgroundColor: COLORS.primary + '15',
                                        color: COLORS.primary,
                                        '&:hover': {
                                            backgroundColor: COLORS.primary + '25',
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                        <EditTextField
                            label="添加标签（用逗号分隔）"
                            variant="outlined"
                            fullWidth
                            size="small"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault();
                                    const tag = e.target.value.trim().replace(',', '');
                                    if (tag) {
                                        addTag(tag);
                                        e.target.value = '';
                                    }
                                }
                            }}
                        />
                    </Box>
                    
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle', color: COLORS.primary }} />
                            <span style={{ fontWeight: '500' }}>{getUser(selectedNote?.authorId || user?.userId || 'user1').name}</span>
                        </Box>
                        <Box>
                            <DateRangeIcon sx={{ mr: 1, verticalAlign: 'middle', color: COLORS.primary }} />
                            <span style={{ fontWeight: '500' }}>{formatDate(selectedNote?.date || new Date())}</span>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <ActionButton
                        variant="outlined"
                        color="secondary"
                        onClick={closeNoteDialog}
                        startIcon={<CancelIcon />}
                        sx={{ mr: 2 }}
                    >
                        取消
                    </ActionButton>
                    <ActionButton
                        variant="contained"
                        color="primary"
                        onClick={saveNote}
                        startIcon={<SaveIcon />}
                    >
                        保存
                    </ActionButton>
                </DialogActions>
                
                {/* 加载中遮罩 */}
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}
                    open={loading}
                >
                    <CircularProgress color="primary" />
                </Backdrop>
            </Dialog>
            
            <BottomNavigationBar />
            
            {/* 提示框 */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={error ? 'error' : 'success'}
                    sx={{ width: '100%' }}
                >
                    {error || successMessage}
                </Alert>
            </Snackbar>
        </Layout>
    );
}

export default LoveNotesPage;
