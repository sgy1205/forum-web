<template>
    <div class="comment-item">
        <div class="user-info">
            <div class="window cursor" @click="goPersonal(comment.userId)">
                <img :src="getAvatar(comment.avatar)" :alt="comment.nickName + '的头像' || '未知用户的头像'"
                    class="user-avatar" />
            </div>
            <div class="user-details">
                <div class="user-name" style="display: flex; gap: 8px;">{{ comment.nickName }}
                    <div v-if="comment.replyNickName"> 回复 @{{ comment.replyNickName }} </div>
                    <div class="my-tag" v-if="comment.userId == userId">我</div>
                </div>

                <div class="comment-content-wrapper">
                    <div class="comment-content tran" :class="{ collapsed: !showAll }"
                        v-html="formatRichText(comment.commentContent)"></div>
                    <div v-if="isOverflow" class="expand-btn " @click="toggleShow">
                        {{ showAll ? '收起🔺' : '展开🔻' }}
                    </div>
                </div>
                <div class="comment-actions">
                    <span class="like cursor" @click="handleLikeComment">
                        <i class="el-icon-thumb" :style="{ color: comment.likeStatus == 1 ? '#f9cea0' : '#999' }">
                            {{ comment.likeStatus == 1 ? '取消点赞' : '点赞' }}({{ comment.likeNumber }})
                        </i>
                    </span>
                    <span class="reply cursor" @click="showReplyInput = !showReplyInput">
                        <i class="el-icon-chat-dot-square">{{ showReplyInput ? '收起回复' : '回复' }}</i>
                    </span>
                </div>
            </div>
            <div class="comment-time">
                <div>{{ time(comment.createTime) }}</div>
                <span class="delete cursor" v-if="comment.userId == userId">
                    <i class="el-icon-delete" @click="handleDeleteComment">删除评论</i>
                </span>
            </div>
        </div>

        <!-- 回复输入框 -->
        <div class="send-comment" v-if="showReplyInput">
            <el-input v-model="replyContent" type="textarea" placeholder="请输入回复内容..." />
            <div v-if="previewImages.length" style="margin: 10px 0; display: flex; gap: 10px;">
                <img v-for="(img, idx) in previewImages" :key="idx" :src="img"
                    style="max-width:100px;max-height:100px;" />
            </div>

            <div class="send-actions">
                <div class="upload-image cursor">
                    <el-upload class="img-uploader" action="" :auto-upload="false" :show-file-list="false"
                        :on-change="handleImgChange">
                        <i class="el-icon-picture-outline"></i>
                        图片
                    </el-upload>
                </div>

                <el-button :loading="btnLoading" class="send-btn cursor" @click="handleAddComment">回复</el-button>
            </div>
        </div>

        <!-- 子评论控制与列表 -->
        <div class="child-comment-container">
            <!-- 初始状态：显示查看回复按钮（中间位置） -->
            <div v-if="hasChildren && !showChildren" class="child-comment-control center-control">
                <div class="load-more tran" @click="showChildren = true">
                    查看回复 ({{ comment.children.length }})
                </div>
            </div>

            <!-- 展开状态：显示子评论列表 -->
            <div v-if="hasChildren && showChildren" class="child-comments">
                <CommentItem v-for="(child, index) in displayedChildren" :key="child.commentId" :comment="child"
                    :user-id="userId" @refresh="handleRefresh" :is-last="index === displayedChildren.length - 1" />

                <!-- 子评论操作区 -->
                <div class="child-comment-actions">
                    <!-- 还有更多子评论时：右侧显示收起按钮 -->
                    <div v-if="displayCount < comment.children.length" class="right-control">
                        <div class="load-more tran" @click="loadMoreChildren">
                            显示更多 <i class="el-icon-arrow-down"></i>
                        </div>
                        <div class="load-more tran" @click="retractChildren">
                            收起评论 <i class="el-icon-arrow-up"></i>
                        </div>
                    </div>

                    <!-- 所有子评论已显示：中间显示收起按钮 -->
                    <div v-else class="center-control">
                        <div class="load-more tran" @click="retractChildren">
                            收起评论 <i class="el-icon-arrow-up"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { time } from '@/utils/time';
import { like } from '@/api/detail';
import { addComment, deleteComment } from '@/api/comment';
import { uploadImg } from '@/api/personal';
import { silenceStatus } from '@/api/index';

export default {
    name: 'CommentItem',
    props: {
        comment: Object,
        userId: {
            type: [String, Number],
            required: true
        },
        isLast: {
            type: Boolean,
            default: false
        },
    },
    components: {
        CommentItem: () => import('./CommentItem.vue')
    },
    data() {
        return {
            showAll: false,
            isOverflow: false,
            deboounce: false,
            btnLoading: false,
            proxyTarget: process.env.VUE_APP_PROXY_TARGET,
            showReplyInput: false,
            replyContent: '',
            previewImages: [],
            imageFiles: [],
            // 子评论控制相关状态
            showChildren: false,      // 是否显示子评论区域
            displayCount: 5           // 显示的子评论数量
        };
    },
    computed: {
        // 判断是否有子评论
        hasChildren() {
            return this.comment.children && Array.isArray(this.comment.children) && this.comment.children.length > 0;
        },
        // 计算需要显示的子评论
        displayedChildren() {
            if (!this.hasChildren) return [];
            return this.comment.children.slice(0, this.displayCount);
        }
    },
    watch: {
        'comment.commentContent': {
            handler() {
                this.checkOverflow();
            },
            immediate: true
        }
    },
    mounted() {
        this.showAll = false;
        this.checkOverflow();
    },
    methods: {
        toggleShow() {
            this.showAll = !this.showAll;
        },
        formatRichText(content) {
            if (!content) return '';

            const imgTest = /<img[\s\S]*?>/g;
            const imgTags = content.match(imgTest);
            if (imgTags && imgTags.length > 0) {
                imgTags.forEach(imgTag => {
                    const newImgTag = imgTag.replace('<img', '<img style="max-width:100%;width:100px;height:auto;"');
                    content = content.replace(imgTag, newImgTag);
                });
            }
            return content;
        },
        checkOverflow(retry = 3) {
            this.$nextTick(() => {
                const el = this.$el.querySelector('.comment-content');
                if (!el) return;

                el.classList.add('collapsed');

                const imgs = el.querySelectorAll('img');
                let loaded = 0;
                if (imgs.length > 0) {
                    imgs.forEach(img => {
                        if (img.complete) {
                            loaded++;
                        } else {
                            img.onload = img.onerror = () => {
                                loaded++;
                                if (loaded === imgs.length) {
                                    this.checkOverflow(0);
                                }
                            };
                        }
                    });
                    if (loaded !== imgs.length) return;
                }

                this.isOverflow = el.scrollHeight > el.clientHeight + 1;

                if (this.showAll) {
                    el.classList.remove('collapsed');
                }

                if (retry > 0 && !this.isOverflow) {
                    setTimeout(() => this.checkOverflow(retry - 1), 100);
                }
            });
        },
        time,
        getAvatar(avatar) {
            if (!avatar) {
                return require('@/assets/images/默认头像.png');
            }
            if (avatar.startsWith('http') || avatar.startsWith('https')) {
                return avatar;
            }
            return this.proxyTarget + avatar;
        },
        goPersonal(userId) {
            this.$router.push({ path: `/personal/${userId}` });
        },
        handleLikeComment() {
            if (this.deboounce) return;
            this.deboounce = true;
            const data = { type: 1, targetId: this.comment.commentId, postId: Number(this.$route.query.postId) };
            like(data).then(res => {
                this.$message.success(res.msg);
                this.$emit('refresh');
                setTimeout(() => {
                    this.deboounce = false;
                    if (this.comment.likeStatus == '0') {
                        this.comment.likeStatus = '1'
                        this.comment.likeNumber += 1
                    } else {
                        this.comment.likeStatus = '0'
                        this.comment.likeNumber -= 1
                    }
                }, 2000);
            }).catch(err => {
                setTimeout(() => {
                    this.deboounce = false;
                }, 2000);
            });
        },
        handleImgChange(file) {
            const isImage = /\.(jpg|jpeg|png|gif|bmp)$/i.test(file.name);
            if (!isImage) {
                this.$message.error('请上传JPG、PNG、GIF或BMP格式的图片');
                return;
            }
            this.imageFiles.push(file.raw);
            const reader = new FileReader();
            reader.onload = (item) => {
                this.previewImages.push(item.target.result);
            };
            reader.readAsDataURL(file.raw);
        },
        handleAddComment() {
            if (this.btnLoading) return;
            this.btnLoading = true;
            if (!this.replyContent.trim() && this.imageFiles.length === 0) {
                this.$message.error('回复内容不能为空');
                this.btnLoading = false;
                return;
            }
            silenceStatus(this.userId).then(res => {
                if (res.silenceStatus != 0) {
                    this.$message.error('您已被禁言，无法回复');
                    this.replyContent = '';
                    this.btnLoading = false;
                    this.showReplyInput = false;
                    return;
                } else {
                    let commentContent = this.replyContent;
                    commentContent += '<br/>'; // 添加换行
                    if (this.imageFiles.length > 0) {
                        const uploadPromises = this.imageFiles.map(file => {
                            const formData = new FormData();
                            formData.append('file', file);
                            return uploadImg(formData);
                        });
                        Promise.all(uploadPromises).then(results => {
                            results.forEach(res => {
                                const imageUrl = res.data;
                                commentContent += `<img src="${imageUrl}" style="max-width:150px;"/>`;
                            });
                            this.submitComment(commentContent);
                        }).catch(() => {
                            this.$message.error('图片上传失败');
                            this.btnLoading = false;
                        });
                    } else {
                        this.submitComment(commentContent);
                    }
                }
            }).catch(err => {
                this.btnLoading = false;
            });
        },
        submitComment(commentContent) {
            const data = {
                commentContent,
                parentId: this.comment.commentId,
                commentType: 1
            };

            addComment(data).then(res => {
                this.$emit('refresh');
                this.showReplyInput = false;
                this.$message.success(res.msg);
                this.replyContent = '';
                this.previewImages = [];
                this.imageFiles = [];
                this.btnLoading = false;
            }).catch(err => {
                this.btnLoading = false;
            });
        },
        handleDeleteComment() {
            this.$confirm('确定删除该评论吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteComment(this.comment.commentId).then(() => {
                    this.$emit('refresh');
                });
            });
        },
        handleRefresh() {
            this.$emit('refresh');
        },
        // 加载更多子评论
        loadMoreChildren() {
            this.displayCount += 5;
            if (this.displayCount > this.comment.children.length) {
                this.displayCount = this.comment.children.length;
            }
        },
        //收起评论
        retractChildren() {
            this.showChildren = false;
            this.displayCount = 5;
        }
    }
};
</script>
<style lang="scss" scoped>
.comment-item {
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }

    .comment-content {
        max-width: 590px;
        word-break: break-all;
    }

    .comment-content-wrapper {
        position: relative;
    }

    .comment-content.collapsed {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        max-height: 4em;
    }

    .my-tag {
        background-color: #f89595;
        border: 1px solid #dbaa60;
        width: 30px;
        height: 25px;
        border-radius: 10px;
        text-align: center;
        color: #fff;
        line-height: 25px;
        font-size: 14px;
    }

    .expand-btn {
        color: #CF4B67;
        cursor: pointer;
        font-size: 13px;
        margin-bottom: 5px;
        user-select: none;
    }

    .el-divider--horizontal {
        margin: 10px 0 !important;
    }

    .send-comment {
        max-width: 90%;
        margin: 10px auto;
    }

    // 子评论相关样式
    .child-comment-container {
        margin-left: 40px;
        margin-top: 10px;
    }

    .child-comments {
        margin-top: 10px;
    }

    .child-comment-control {
        padding: 5px 0;
    }

    .child-comment-actions {
        padding: 5px 0;
    }

    // 中间对齐控制区
    .center-control {
        display: flex;
        justify-content: center;
    }

    // 右侧对齐控制区
    .right-control {
        display: flex;
        justify-content: flex-end;
        gap: 20px; // 显示更多和收起按钮之间的间距
    }

    .load-more {
        color: #409eff;
        cursor: pointer;
        padding: 5px 0;
        display: inline-block;

        &:hover {
            text-decoration: underline;
        }
    }
}
</style>