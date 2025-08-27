<template>
    <div class="comment-place tran" v-loading="loading">
        <div class="title">全部评论({{ commentNumber }})</div>
        <div class="send-comment">
            <el-input v-model="newComment" type="textarea" placeholder="请输入您要发表的内容..." />
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

                <el-button class="send-btn cursor" @click="handleAddComment" :loading="btnLoading">发布</el-button>
            </div>
        </div>
        <el-empty v-if="comments.length === 0" description="暂无评论"></el-empty>
        <div v-else class="comment-list">
            <CommentList :comments="comments" :user-id="userId" @refresh="getCommentsList" />
        </div>

    </div>
</template>

<script>
import { time } from '@/utils/time';
import { getComments, addComment, deleteComment } from '@/api/comment';
import { uploadImg } from '@/api/personal';
import { silenceStatus } from '@/api/index';

export default {
    name: 'CommentPlace',
    props: {
        postId: {
            type: [String, Number],
        },
        authorId: {
            type: [String, Number],
        },
        userInfo: {
            type: Object,
            required: true
        },
        userId: {
            type: [String, Number],
            required: true
        },
        commentType: {
            type: Number,
            required: true
        },
        commentNumber: {
            type: Number,
            default: 0
        },
        audit: {
            type: [Number, String],
            default: 0
        }
    },
    components: {
        CommentList: () => import('@/components/CommentList.vue')
    },
    data() {
        return {
            debounce: false,
            btnLoading: false,
            loading: false,
            newComment: '',
            comments: [],
            // 图片预览
            previewImages: [],
            // 本地图片
            imageFiles: [],
            commentPagination: {
                pageNum: 1,
                pageSize: 5,
                total: 0
            },
            silence: 0
        };
    },
    mounted() {
        this.loading = true;
        this.getCommentsList();
    },
    methods: {
        time,
        goPersonal(userId) {
            this.$router.push({ path: `/personal/${userId}` });
        },
        getCommentsList() {
            
            return getComments(Number(this.postId)).then(res => {
                this.comments = res.data || res.rows; // 适配新数据格式
                this.commentPagination.total = res.total || this.comments.length;
                this.loading = false;
            }).catch(err => {
                console.log(err);
                this.loading = false;
            });
        },
        handleAddComment() {
            if (this.btnLoading) return;
            this.btnLoading = true;
            if (this.audit != 1) {
                this.$message.warning('审核中，暂时无法发表评论');
                this.newComment = '';
                this.btnLoading = false;
                this.previewImages = [];
                this.imageFiles = [];
                return;
            }
            if (!this.newComment.trim() && this.imageFiles.length === 0) {
                this.$message.error('评论内容不能为空');
                this.btnLoading = false;
                return;
            }
            silenceStatus(this.userId).then(res => {
                if (res.silenceStatus != 0) {
                    this.$message.error('您已被禁言，无法发表评论');
                    this.newComment = '';
                    this.btnLoading = false;
                    return;
                } else {
                    let commentContent = this.newComment;
                    commentContent += '<br/>'; // 添加换行
                    // 如果有图片，先上传图片
                    if (this.imageFiles.length > 0) {
                        const uploadPromises = this.imageFiles.map(file => {
                            const formData = new FormData();
                            formData.append('file', file);
                            return uploadImg(formData);
                        });
                        Promise.all(uploadPromises).then(results => {
                            results.forEach(res => {
                                console.log('上传结果:', res);
                                const imageUrl = res.data;
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
            }).catch(() => {
                this.btnLoading = false;
            });
        },
        submitComment(commentContent) {
            const data = {
                commentContent,
                parentId: Number(this.postId),
                commentType: '0'
            };
            
            addComment(data).then(res => {
                this.$emit('refresh');
                this.getCommentsList();
                this.$message.success('评论成功');
                this.newComment = '';
                this.previewImages = [];
                this.imageFiles = [];
                this.btnLoading = false;
            }).catch(() => {
                this.btnLoading = false;
            });
        },
        handleDeleteComment(commentId) {
            this.$confirm('确定删除该评论吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteComment(commentId).then(res => {
                    this.$message.success(res.msg);
                    this.getCommentsList();
                }).catch(err => {
                    console.log(err);
                });
            }).catch(() => {
                this.$message.info('已取消删除');
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
        }
    }
}
</script>

<style lang="scss">
// 主题
body.dark {
    .comment-place {
        background-color: #222222;
        color: #fff;
    }

    body.dark .el-input__inner,
    .el-textarea__inner {

        background-color: #3A3A3A !important;
        border: #3A3A3A 1px solid !important;
        color: #ffffff;
        transition: 0.3s ease !important;
    }
}

.comment-place {
    padding: 20px;
    background-color: white;
    border-radius: 12px;
    font-size: 16px;
    color: #333;

    .title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 12px;
    }

    .send-comment {
        border: #d9d7d772 solid 1px;
        text-align: end;

        .send-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .upload-image {
                margin-left: 10px;
                color: #a7a7a7;

                i {
                    color: #a7a7a7;
                }
            }

            .send-btn {
                background-color: #48C78E;
                border: none;
                padding: 5px 10px;
                border-radius: 6px;
                margin: 4px;
            }
        }

    }

    .reply-list {
        .reply {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #a7a7a7;
        }
    }

    .comment-list {
        .comment-item {
            margin: 20px 0;

            .user-info {
                display: flex;
                justify-content: space-between;
                gap: 10px;


                .window {
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
                    justify-content: space-between;
                    gap: 20px;
                    text-align: left;

                    .comment-content {
                        font-size: 14px;
                    }

                    .comment-actions {
                        display: flex;
                        gap: 10px;

                        i {
                            color: #a7a7a7;
                        }
                    }

                }

                .comment-time {
                    flex: 1;
                    text-align: end;
                    font-size: 14px;
                    color: #a7a7a7;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }


            }

        }
    }
}
</style>