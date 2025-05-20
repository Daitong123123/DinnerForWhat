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
    CircularProgress
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
import Person2Icon from '@mui/icons-material/Person2';
import { styled } from '@mui/system';
import { format, parseISO } from 'date-fns';
import COLORS from '../constants/color.js';
import { v4 as uuidv4 } from 'uuid';

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
    
    // 模拟用户数据
    const users = [
        { id: 'user1', name: '小明', avatar: 'https://picsum.photos/seed/user1/100/100' },
        { id: 'user2', name: '小红', avatar: 'https://picsum.photos/seed/user2/100/100' }
    ];
    
    // 加载笔记数据
    useEffect(() => {
        // 模拟从API加载笔记数据
        const mockNotes = [
            { 
                id: uuidv4(), 
                title: '第一次约会', 
                content: '今天是我们第一次约会的日子，去了那家我们一直想去的咖啡厅，聊了很多很多，感觉时间过得好快。我永远不会忘记这一天，希望以后还有更多美好的回忆。', 
                date: new Date('2023-05-10'), 
                author: 'user1',
                tags: ['约会', '纪念日']
            },
            { 
                id: uuidv4(), 
                title: '我们的恋爱一周年', 
                content: '不知不觉已经一年了，时间过得真快。谢谢你这一年来的陪伴和爱，希望我们能一直走下去，创造更多美好的回忆。', 
                date: new Date('2023-06-15'), 
                author: 'user2',
                tags: ['周年纪念日', '爱情']
            },
            { 
                id: uuidv4(), 
                title: '周末的短途旅行', 
                content: '这个周末我们一起去了周边的小镇，风景很美，我们拍了很多照片。最喜欢和你一起旅行的时光，无论去哪里，只要有你在身边就好。', 
                date: new Date('2023-07-05'), 
                author: 'user1',
                tags: ['旅行', '周末']
            },
            { 
                id: uuidv4(), 
                title: '今天向你表白了', 
                content: '犹豫了很久，今天终于鼓起勇气向你表白了。当你说愿意做我女朋友的时候，我真的好开心。我会好好爱你，珍惜你，给你幸福的。', 
                date: new Date('2023-04-01'), 
                author: 'user1',
                tags: ['表白', '爱情']
            },
            { 
                id: uuidv4(), 
                title: '谢谢你的生日惊喜', 
                content: '我的生日，你为我准备了一个惊喜派对，邀请了我的好朋友们。我真的很感动，也很开心。这是我过得最难忘的一个生日，谢谢你为我做的一切。', 
                date: new Date('2023-03-15'), 
                author: 'user2',
                tags: ['生日', '惊喜']
            },
        ];
        
        setNotes(mockNotes);
    }, []);
    
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
        setSelectedNote(note ? { ...note } : { id: uuidv4(), title: '', content: '', date: new Date(), author: 'user1', tags: [] });
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
    const saveNote = () => {
        if (!selectedNote.title.trim()) {
            alert('请输入笔记标题');
            return;
        }
        
        setLoading(true);
        
        // 模拟API请求延迟
        setTimeout(() => {
            if (isNewNote) {
                // 添加新笔记
                setNotes([selectedNote, ...notes]);
            } else {
                // 更新现有笔记
                setNotes(notes.map(note => note.id === selectedNote.id ? selectedNote : note));
            }
            
            setLoading(false);
            closeNoteDialog();
            alert('笔记保存成功！');
        }, 800);
    };
    
    // 删除笔记
    const deleteNote = (noteId) => {
        if (window.confirm('确定要删除这条笔记吗？')) {
            setLoading(true);
            
            // 模拟API请求延迟
            setTimeout(() => {
                setNotes(notes.filter(note => note.id !== noteId));
                setLoading(false);
                alert('笔记已删除！');
            }, 500);
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
                    <IconButton
                        color="primary"
                        onClick={() => openNoteDialog(null, true)}
                        sx={{ display: { xs: 'none', md: 'block' } }}
                    >
                        <AddIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            
            <Box sx={{ p: 3, minHeight: 'calc(100vh - 112px)', backgroundColor: COLORS.lightPink }}>
                {/* 新建笔记按钮（移动端） */}
                <Box sx={{ mb: 4, display: { xs: 'block', md: 'none' } }}>
                    <ActionButton
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => openNoteDialog(null, true)}
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: '1rem', py: '0.75rem', fontWeight: 'bold' }}
                    >
                        新建笔记
                    </ActionButton>
                </Box>
                
                {/* 笔记列表 */}
                <Box sx={{ mt: 2 }}>
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
                                                    {getUser(note.author).name}
                                                </Typography>
                                                <Typography variant="body1" color="text.primary" mb={2} lineClamp={2}>
                                                    {note.content}
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {note.tags.map(tag => (
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
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary" mb={3}>
                                暂无爱情笔记
                            </Typography>
                            <ActionButton
                                variant="contained"
                                color="primary"
                                onClick={() => openNoteDialog(null, true)}
                                startIcon={<AddIcon />}
                                sx={{ borderRadius: '1rem', py: '0.75rem', fontWeight: 'bold' }}
                            >
                                新建第一条笔记
                            </ActionButton>
                        </Box>
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
                            {selectedNote?.tags.map(tag => (
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
                            <span style={{ fontWeight: '500' }}>{getUser(selectedNote?.author || 'user1').name}</span>
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
        </Layout>
    );
}

export default LoveNotesPage;