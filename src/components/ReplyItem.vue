<template>
    <div class="reply-item">
        <div class="user-info">
            <div class="window cursor" @click="goPersonal(reply.userId)">
                <img :src="getAvatar(reply.avatar)" :alt="reply.nickName + '的头像' || '未知用户的头像'" class="user-avatar" />
            </div>
            <div class="user-details">
                <div class="user-name">
                    <div>{{ reply.nickName || '未知用户' }} </div>
                    <div v-if="reply.parentId == parentId"> 回复了{{ parentName || '未知用户' }}&nbsp;</div>
                    <div class="my-tag" v-if="reply.userId == userId">我</div>
                </div>
                <div class="comment-content-wrapper">
                    <div class="comment-content tran" :class="{ collapsed: !showAll }"
                        v-html="formatRichText(reply.commentContent)"></div>
                    <div v-if="isOverflow" class="expand-btn " @click="toggleShow">
                        {{ showAll ? '收起🔺' : '展开🔻' }}
                    </div>
                </div>
                <div class="comment-actions">
                    <span class="like cursor" @click="handleLikeComment">
                        <i class="el-icon-thumb" :style="{ color: reply.likeStatus == 1 ? '#f9cea0' : '#999' }">
                            {{ reply.likeStatus == 1 ? '取消点赞' : '点赞' }}({{ reply.likeNumber }})
                        </i>
                    </span>
                    <!-- 显示回复输入框 -->
                    <span class="reply cursor" @click="showReplyInput = !showReplyInput">
                        <i class="el-icon-chat-dot-square">{{ showReplyInput ? '收起回复' : '回复' }}</i>
                    </span>
                </div>
            </div>

            <div class="comment-time">
                <div>{{ time(reply.createTime) }}</div>
                <span class="delete cursor" v-if="reply.userId == userId">
                    <i class="el-icon-delete" @click="handleDeleteComment">删除评论</i>
                </span>
            </div>

        </div>
        <!-- 回复输入框 -->
        <div class="send-comment" v-if="showReplyInput">
            <el-input v-model="replyContent" type="textarea" placeholder="请输入回复内容..." />
            <div v-if="previewImages.length" style="margin: 10px 0; display: flex; gap: 10px;">
                <img v-for="(img, index) in previewImages" :key="index" :src="img"
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

                <button :loading="btnLoading" class="send-btn cursor" @click="handleAddComment">回复</button>
            </div>
        </div>
        <ReplyItem v-for="replyReply in replies" :key="replyReply.commentId" :reply="replyReply" @refresh="loadReplies"
            :user-id="userId" :reply-total="total" :parent-id="replyReply.parentId" :parent-name="reply.nickName" />

    </div>
</template>

<script>
import { time } from '@/utils/time';
import { addComment, deleteComment, getSonComments } from '@/api/comment';
import { like, cancelLike } from '@/api/detail';
import { uploadImg } from '@/api/personal';
import { silenceStatus } from '@/api/index';

export default {
    props: {
        reply: Object,
        userId: {
            type: [String, Number],
            required: true
        },
        isLast: {
            type: Boolean,
            default: false
        },
        parentId: {
            type: [String, Number],
            default: ''
        },
        parentName: {
            type: String,
            default: ''
        }
    },
    components: {
        ReplyItem: () => import('@/components/ReplyItem.vue'),
    },
    data() {
        return {
            proxyTarget: process.env.VUE_APP_PROXY_TARGET,
            showAll: false,
            isOverflow: false,
            debounce: false,
            btnLoading: false,
            replies: [],
            showReplies: false,
            showReplyInput: false,
            replyContent: '',
            // 图片预览
            previewImages: [],
            // 本地图片
            imageFiles: [],
            total: 0,
            pageNum: 1,
            pageSize: 5,
            silence: 0,
        };
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
        this.loadReplies();

    },
    methods: {
        toggleShow() {
            this.showAll = !this.showAll;
        },
        // 处理富文本
        formatRichText(content) {
            if (!content) return '';
            const imgTest = /<img[\s\S]*?>/g;
            const imgTags = content.match(imgTest);
            if (imgTags && imgTags.length > 0) {
                imgTags.forEach(imgTag => {
                    const newImgTag = imgTag.replace('<img', '<img style="max-width:100%;width:100px;height:auto;"');
                    // 替换回原始内容
                    content = content.replace(imgTag, newImgTag);
                });
            }
            return content;
        },
        checkOverflow(retry = 3) {
            this.$nextTick(() => {
                const el = this.$el.querySelector('.comment-content');
                if (!el) return;

                // 默认都加collapsed
                el.classList.add('collapsed');

                // 监听图片加载
                const imgs = el.querySelectorAll('img');
                let loaded = 0;
                if (imgs.length > 0) {
                    imgs.forEach(img => {
                        if (img.complete) {
                            loaded++;
                        } else {
                            img.onload = img.onerror = () => {
                                loaded++;
                                // 图片加载完再判断
                                if (loaded === imgs.length) {
                                    this.checkOverflow(0);
                                }
                            };
                        }
                    });
                    // 等待图片加载
                    if (loaded !== imgs.length) return;
                }

                // 判断溢出
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
        // 加载回复的回复
        getAvatar(avatar) {
            if (!avatar) {
                return require('@/assets/images/默认头像.png');
            }
            if (avatar.startsWith('http') || avatar.startsWith('https')) {
                return avatar;
            }
            return this.proxyTarget + avatar;
        },
        loadReplies() {
            getSonComments({
                postId: this.$route.query.type == 'post' ? Number(this.$route.query.postId) : Number(this.$route.query.articleId),
                userId: this.userId,
                parentId: this.reply.commentId,
                pageNum: this.pageNum,
                pageSize: this.pageSize
            }).then(res => {
                this.replies = res.rows || [];
                this.total = res.total || 0;
                setTimeout(() => {
                    this.btnLoading = false;
                }, 1000);
            }).catch(err => {
                setTimeout(() => {
                    this.btnLoading = false;
                }, 1000);
            });
        },
        goPersonal(userId) {
            this.$router.push({ path: `/personal/${userId}` });
        },
        // 点赞评论
        handleLikeComment() {
            if (this.debounce) return;
            this.debounce = true;
            const data = { postType: 2, postId: this.reply.commentId };
            if (this.reply.likeStatus == 1) {
                cancelLike(data).then(res => {
                    this.$message.success(res.msg);
                    this.$emit('refresh');
                    setTimeout(() => {
                        this.debounce = false;
                    }, 1000);
                }).catch(err => {
                    setTimeout(() => {
                        this.debounce = false;
                    }, 1000);
                });
            } else {
                like(data).then(res => {
                    this.$message.success(res.msg);
                    this.$emit('refresh');
                    setTimeout(() => {
                        this.debounce = false;
                    }, 1000);
                }).catch(err => {
                    setTimeout(() => {
                        this.debounce = false;
                    }, 1000);
                });
            }
        },
        // 处理图片上传
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
        // 处理回复
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
                    // 如果有图片，先上传图片
                    if (this.imageFiles.length > 0) {
                        const uploadPromises = this.imageFiles.map(file => {
                            const formData = new FormData();
                            formData.append('files', file);
                            return uploadImg(formData);
                        });
                        Promise.all(uploadPromises).then(results => {
                            results.forEach(res => {
                                const imageUrl = process.env.VUE_APP_BASE_API + res.fileNames;
                                commentContent += `<img src="${imageUrl}" style="max-width:150px;"/>`;
                            });
                            this.submitComment(commentContent);
                        }).catch(() => {
                            this.$message.error('图片上传失败');
                            this.btnLoading = false;
                        });
                    } else {
                        // 没有图片直接提交评论
                        this.submitComment(commentContent);
                    }
                }
            }).catch(err => {
            });

        },
        // 添加回复
        submitComment(commentContent) {

            const data = {
                postId: this.$route.query.type == 'post' ? Number(this.$route.query.postId) : Number(this.$route.query.articleId),
                userId: Number(this.userId),
                commentContent,
                parentId: this.reply.commentId,
                commentType: 2
            };
            addComment(data).then(res => {
                this.$emit('refresh');
                this.showReplyInput = false;
                this.$message.success(res.msg);
                this.replyContent = '';
                this.previewImages = [];
                this.imageFiles = [];
                this.loadReplies();

            }).catch(err => {
            });
        },
        //  删评
        handleDeleteComment() {
            this.$confirm('确定删除该评论吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteComment(this.reply.commentId).then(() => {
                    this.$emit('refresh');
                });
            });
        },
        // 切换回复显示
        toggleReplies() {
            this.showReplies = !this.showReplies;

        },

    }
};
</script>
<style lang="scss" scoped>
.el-divider--horizontal {
    margin: 20px 0 !important;
}

.reply-item {
    margin: 10px auto;

    .comment-content {
        max-width: 530px;
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


    .expand-btn {
        color: #CF4B67;
        cursor: pointer;
        font-size: 13px;
        margin-bottom: 5px;
        user-select: none;
    }

    .user-name {

        .my-tag {
            background-color: #f89595;
            border: 1px solid #dbaa60;
            width: 30px;
            height: 25px;
            border-radius: 10px;
            text-align: center;
            color: #ffffff;
            line-height: 25px;
            font-size: 14px;
        }

        display: flex;
        gap: 5px;
    }
}
</style>