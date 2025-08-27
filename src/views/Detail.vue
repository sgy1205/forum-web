<template>
    <div class="detail">
        <HeadersBar />
        <div class="top-down" v-loading="loading">
            <div class="main-container">
                <div class="content-list"
                    style="margin-bottom: 20px;background-color: #F5F6FA;display: flex;flex-direction: column;padding: 0; gap: 20px;">
                    <div class="side-option">
                        <div class="option cursor tran" @click="toggleLike(post.likeStatus)"
                            :style="{ backgroundColor: post.likeStatus == 1 ? '#f9cea0 !important' : '#fff ' }">
                            <i class="el-icon-thumb"></i>
                        </div>
                        <div class="option cursor tran" @click="goComment">
                            <i class="el-icon-chat-dot-square"></i>
                        </div>
                        <div class="option cursor tran" @click="handleCollect(post.collectionStatus, post.postId)"
                            :style="{ backgroundColor: post.collectionStatus == 1 ? '#f9cea0 !important' : '#fff ' }">
                            <i class="el-icon-star-off"></i>
                        </div>
                    </div>

                    <!-- 仅保留帖子相关审核提示 -->
                    <el-alert v-if="this.$route.query.type == 'post' && post.auditStatus == '0'" title="该话题正在审核中，请耐心等待"
                        effect="dark" type="warning" :closable="false" />
                    <el-alert v-if="this.$route.query.type == 'post' && post.auditStatus == '2'" title="该话题审核不通过！"
                        effect="dark" type="error" :closable="false" />

                    <!-- 仅保留帖子内容容器 -->
                    <div class="post tran">
                        <div class="head-row">
                            <div class="user-info">
                                <div class="user-avatar cursor">
                                    <img :src="getAvatar(post.avatar)" alt="" @click="goPersonal(post.userId)" />
                                </div>
                                <div class="user-details">
                                    <div class="user-name">{{ this.userInfo.nickName || '未知用户' }}</div>
                                    <div class="time" v-if="post.updateTime == post.createTime">发布于 {{
                                        friendlyCreateTime }}</div>
                                    <div class="time" v-else>修改于 {{ friendlyUpdateTime }}</div>
                                </div>
                            </div>
                            <el-dropdown trigger="click" placement="" @command="handleManage"
                                v-show="userId == this.curId" class="manage ">
                                <span class="cursor">
                                    管理
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item command="edit">修改</el-dropdown-item>
                                    <el-dropdown-item command="delete">删除</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                        <div class="post-box">
                            <div class="post-title">{{ post.title }}</div>
                            <div class="post-content" v-html="formatRichText(post.content)"></div>
                            <div class="footer-row">
                                <div class="post-node tran">{{ post.node || '默认节点' }}</div>
                                <div class="tag-list">
                                    <div class="tag" v-for="tag in post.tagsList" :key="tag.tagsId">#{{ tag.tagsName }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <el-divider></el-divider>
                        <div class="action-row">
                            <div class="views cursor">
                                <i class="el-icon-view">浏览({{ post.browseNumber || 0 }})</i>
                            </div>
                            <div class="likes cursor"
                                :style="{ color: post.likeStatus == 1 ? '#f9cea0 !important' : '#000' }">
                                <i class="el-icon-thumb" @click="toggleLike()">点赞({{
                                    post.likeNumber || 0
                                }})</i>
                            </div>
                            <div class="collect cursor"
                                :style="{ color: post.collectionStatus == 1 ? '#f9cea0 !important' : '#000' }">
                                <i class="el-icon-star-off" @click="handleCollect(post.postId)">收藏({{
                                    post.collectionNumber || 0 }})</i>
                            </div>
                        </div>
                    </div>

                    <!-- 仅保留帖子评论区 -->
                    <div v-if="this.$route.query.type == 'post' && post.userId" :key="JSON.stringify(commentList)">
                        <CommentPlace ref="commentPlace" :audit="post.auditStatus" :postId="postId"
                            :authorId="post.userId" :userInfo="userInfo" :commentType="1" :userId="userId"
                            @refresh="getDetail" :commentNumber="post.commentNumber" />
                    </div>
                </div>
                <UserBoard :userInfo="userInfo" />
            </div>
        </div>
    </div>
</template>

<script>
import { time } from '@/utils/time.js';
import { saveDraft } from '@/utils/publish.js';
import { postDetail, deletePost } from '@/api/post';
import { curUser } from '@/api/login.js';
import { collect, like } from '@/api/detail';

export default {
    name: 'Collection',
    components: {
        HeadersBar: () => import('@/components/HeaderBar.vue'),
        UserBoard: () => import('@/components/UserBoard.vue'),
        CommentPlace: () => import('@/components/CommentPlace.vue'),
    },
    data() {
        return {
            proxyTarget: process.env.VUE_APP_PROXY_TARGET,
            debounce: false,
            loading: false,
            userId: '',
            userInfo: {},
            curId: '',
            postId: '',
            post: {},
            commentList: [],
            commentPagination: {
                pageNum: 1,
                pageSize: 5,
                total: 0
            }
        };
    },
    created() {
        this.loading = true;
        this.curId = this.$route.params.id;
        this.userId = this.$store.state.user.id || localStorage.getItem('userId') || '';
        this.postId = this.$route.query.postId; // 仅保留帖子ID赋值

        // 获取用户信息
        curUser(this.curId).then(res => {
            this.userInfo = res.data;
            this.loading = false;
        }).catch(() => {
            this.loading = false;
        });

        // 获取帖子详情
        this.getDetail();
    },
    computed: {
        // 仅保留帖子的创建时间格式化
        friendlyCreateTime() {
            return this.post.createTime ? time(this.post.createTime) : '未知时间';
        },
        // 仅保留帖子的更新时间格式化
        friendlyUpdateTime() {
            return this.post.updateTime ? time(this.post.updateTime) : '未知时间';
        }
    },
    methods: {
        // 获取头像（逻辑不变）
        getAvatar(avatar) {
            if (!avatar) {
                return require('@/assets/images/默认头像.png');
            }
            if (avatar.startsWith('http') || avatar.startsWith('https')) {
                return avatar;
            }
            return this.proxyTarget + avatar;
        },
        // 处理富文本（逻辑不变）
        formatRichText(content) {
            if (!content) return '';
            const imgTest = /<img[\s\S]*?>/g;
            const imgTags = content.match(imgTest);
            if (imgTags && imgTags.length > 0) {
                imgTags.forEach(imgTag => {
                    const newImgTag = imgTag.replace('<img', '<img style="max-width:150px;height:auto;"');
                    content = content.replace(imgTag, newImgTag);
                });
            }
            return content;
        },
        // 仅保留帖子详情获取逻辑
        getDetail() {
            postDetail(Number(this.postId)).then(res => {
                if (res.code === 500) {
                    this.$message.error('该话题已被删除或不存在');
                    this.$router.push({ path: `/personal/${this.userId}` });
                    return;
                }
                this.post = res.data;
                // 滚动到评论区（逻辑不变）
                this.$nextTick(() => {
                    if (this.$route.query.scrollToComment == 'true') {
                        const commentEl = this.$refs.commentPlace;
                        if (commentEl && commentEl.$el) {
                            commentEl.$el.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                });
            }).catch(err => {
                this.$router.push({ path: `/personal/${this.userId}` });
            });
        },
        // 前往个人主页（逻辑不变）
        goPersonal(id) {
            this.$router.push({ path: `/personal/${id}` });
        },
        // 帖子管理（仅保留帖子相关逻辑）
        handleManage(command) {
            if (command === 'edit') {
                // 仅保存帖子草稿
                saveDraft('postEditDraft', this.post);
                this.$router.push({
                    path: `/publish/${this.userId}`,
                    query: { type: 'post', id: this.post.postId }
                });
            } else if (command === 'delete') {
                this.$confirm('确定要删除吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deletePost(this.postId).then(res => {
                        this.$message.success(res.msg);
                        this.$router.push({ path: `/personal/${this.userId}` });
                    }).catch(() => { });
                }).catch(() => { });
            }
        },
        // 帖子点赞（移除文章相关逻辑）
        toggleLike() {
            if (this.debounce) return;
            this.debounce = true;

            // 仅判断帖子审核状态
            if (this.post.auditStatus && this.post.auditStatus != '1') {
                this.$message.warning('该内容审核还未通过，无法点赞');
                setTimeout(() => {
                    this.debounce = false;
                }, 1000);
                return;
            }

            const data = {
                targetId: this.post.postId,
                type: '0' // 固定为帖子类型
            };

            like(data).then(res => {
                this.$message.success(res.msg);
                setTimeout(() => {
                    if(this.post.likeStatus == '0'){
                        this.post.likeStatus = '1'
                        this.post.likeNumber +=1
                    }else{
                        this.post.likeStatus = '0'
                        this.post.likeNumber -=1
                    }
                    this.debounce = false;
                }, 2000);
            }).catch(err => {
                setTimeout(() => {
                    this.debounce = false;
                }, 2000);
            });
        },
        // 帖子收藏（移除文章相关逻辑）
        handleCollect(postId) {
            if (this.debounce) return;
            this.debounce = true;

            // 仅判断帖子审核状态
            if (this.post.auditStatus && this.post.auditStatus != '1') {
                this.$message.warning('该内容审核还未通过，无法收藏');
                setTimeout(() => {
                    this.debounce = false;
                }, 1000);
                return;
            }

            // 仅处理帖子收藏/取消收藏
            collect(postId).then(res => {
                this.$message.success(res.msg);
                setTimeout(() => {
                    if(this.post.collectionStatus == '0'){
                        this.post.collectionStatus = '1'
                        this.post.collectionNumber += 1
                    }else{
                        this.post.collectionStatus = '0'
                        this.post.collectionNumber -= 1
                    }
                    this.debounce = false;
                }, 2000);
            }).catch(err => {
                setTimeout(() => {
                    this.debounce = false;
                }, 2000);
            });
        },
        // 滚动到评论区（逻辑不变）
        goComment() {
            this.$nextTick(() => {
                const commentEl = this.$refs.commentPlace;
                if (commentEl && commentEl.$el) {
                    commentEl.$el.scrollIntoView({ behavior: 'smooth' });
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
// 富文本内容样式（逻辑不变）
.post-content {
    word-break: break-all;
    white-space: pre-line;
}

// 下拉菜单样式（逻辑不变）
.el-dropdown-menu {
    position: absolute;
    top: 140px !important;
}

// 主容器样式（仅保留帖子相关布局）
.main-container {
    display: flex;
    gap: 20px;
    position: relative;

    .content-list {
        margin-left: 15%;
    }

    .user-board{
        margin-left: 40px;
    }

    // 侧边操作按钮（逻辑不变）
    .side-option {
        position: fixed;
        top: 50%;
        left: 50px;
        display: flex;
        flex-direction: column;
        gap: 30px;
        transform: translateY(-50%);
        z-index: 2000;

        .option {
            background-color: white;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            justify-content: center;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

            i {
                font-size: 24px;
                color: #909090;
                line-height: 60px;
                font-weight: bold;
            }
        }
    }

    // 帖子容器样式（保留原有效果）
    .post {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 20px;
        background-color: white;
        border-radius: 12px;
        width: 750px;

        // 帖子头部（用户信息+管理）
        .head-row {
            display: flex;

            .user-info {
                display: flex;
                gap: 10px;
                flex: 1;

                .user-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    overflow: hidden;

                    img {
                        width: 100%;
                        height: 100%;
                    }
                }

                .user-details {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;

                    .user-name {
                        font-weight: bold;
                        font-size: 16px;
                    }

                    .time {
                        font-size: 14px;
                        color: #7a7a7a;
                    }
                }
            }

            .manage {
                text-align: end;
                width: 30px;
            }

            .el-dropdown {
                margin-left: 10px;
            }
        }

        // 帖子内容区域
        .post-box {
            display: flex;
            flex-direction: column;
            gap: 20px;
            text-align: left;

            .post-title {
                font-size: 20px;
                font-weight: bold;
            }

            .post-node {
                font-size: 14px;
                color: #7a7a7a;
                background-color: #F8F9F9;
                width: fit-content;
                padding: 5px 10px;
                text-align: center;
                border-radius: 8px;
                border: 1px solid #d0cfcf84;
            }

            // 帖子底部（节点+标签）
            .footer-row {
                display: flex;
                justify-content: space-between;

                .tag-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;

                    .tag {
                        background-color: #efedf1;
                        padding: 5px 10px;
                        border-radius: 10px;
                        font-size: 14px;
                        color: #7a7a7a;
                        border: 1px solid #d0cfcf84;
                    }
                }
            }
        }

        // 帖子操作栏（浏览+点赞+收藏）
        .action-row {
            display: flex;
            justify-content: space-around;
            align-items: center;
        }
    }
}
</style>