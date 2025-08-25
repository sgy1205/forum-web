<template>
    <div class="post-item ">
        <div class="post-meta">
            <div class="main-info">
                <div class="up-row">
                    <a v-if="authorId != currentUserId" @click.stop.prevent="goPersonal(item.userId)" href="">
                        <img :src="getAvatar(item.avatar)" class="post-avatar cursor" />
                    </a>
                    <div v-else>
                        <img :src="getAvatar(item.avatar)" class="post-avatar" />
                    </div>
                    <div class="main-info-down">
                        <div class="user-name">{{ item.nickName || '未知用户' }}</div>
                        <div> 发布于 {{ friendlyCreateTime }}</div>
                    </div>
                </div>
                <div class="tags" style="display: flex; align-items: center; gap: 10px;">
                    <el-tag v-if="item.recommend == 1" type="success">推荐</el-tag>
                    <el-tag v-if="item.auditStatus == 0" type="warning">审核中</el-tag>
                    <el-tag v-if="item.auditStatus == 2" type="error">审核不通过</el-tag>
                    <el-tag v-if="this.$route.path == '/index' && item.postId" type="primary">帖子</el-tag>

                </div>
            </div>
        </div>
        <div class="cursor" @click="goDetail(item.userId, type = 'post')">
            <div class="post-title">{{ item.title }}</div>
            <div class="post-content" v-html="formatRichText(item.content)"></div>

            <div class="post-node-row">
                <div class="post-node tran">{{ item.node }}</div>
            </div>
        </div>

        <div class="post-actions">
            <div @click="toggleLike(item.likeStatus, item.auditStatus)"
                :style="item.likeStatus == 1 ? 'color: red;' : ''"><i class="el-icon-thumb"></i> {{
                    item.likeNumber }}
            </div>
            <div><i class="el-icon-chat-round" @click="goDetail(item.userId, type = 'post', true)"></i> {{
                item.commentNumber
                }}</div>
        </div>

    </div>
</template>

<script>
import { time } from '@/utils/time.js'
import { like } from '@/api/detail'
export default {
    name: 'PostItem',
    props: {
        item: {
            type: Object,
            required: true
        },
        // 话题作者id
        authorId: {
            type: [String, Number],
            default: ''
        },
        // 主页主人id
        currentUserId: {
            type: [String, Number],
            default: ''
        },
    },
    data() {
        return {
            debounce: false,
        };
    },
    created() {

    },
    computed: {
        friendlyCreateTime() {
            return time(this.item.createTime)
        },
    },
    methods: {
        getAvatar(avatar) {
            if (!avatar) {
                return require('@/assets/images/默认头像.png');
            }
            if (avatar.startsWith('http') || avatar.startsWith('https')) {
                return avatar;
            }
            return avatar;
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
        goPersonal(id) {
            this.$router.push(`/personal/${id}`)
        },
        goDetail(userId, type, scrollToComment = false) {
            // 跳转到详情页
            this.$router.push({
                path: `/detail/${userId}`,
                query: { type, postId: this.item.postId, scrollToComment }
            })
        },
        toggleLike(status, auditStatus) {

            if (this.debounce) return;
            this.debounce = true;
            console.log('auditStatus', auditStatus);

            if (auditStatus != 1 && this.$route.path !== '/index') {
                this.$message.error('帖子未审核通过，无法点赞');
                setTimeout(() => {
                    this.debounce = false;
                }, 2000);
                return;
            }
            const data = {
                targetId: this.item.postId,
                type: '0'
            }
            // 切换点赞状态
            if (status == 0) {
                like(data).then(res => {

                    this.item.likeStatus = 1;
                    this.item.likeNumber++;
                    this.$message.success(res.msg);
                    setTimeout(() => {
                        this.debounce = false;
                    }, 2000);
                }).catch(err => {
                    console.log(err);
                    setTimeout(() => {
                        this.debounce = false;
                    }, 2000);
                });
            } else if (status == 1) {
                like(data).then(res => {
                    this.item.likeStatus = 0;
                    this.item.likeNumber--;
                    this.$message.success(res.msg);
                    setTimeout(() => {
                        this.debounce = false;
                    }, 2000);
                }).catch(err => {
                    setTimeout(() => {
                        this.debounce = false;
                    }, 2000);
                });
            } else {
                this.$message.error('点赞状态异常');
                setTimeout(() => {
                    this.debounce = false;
                }, 2000);
            }
        }
    }
}
</script>

<style lang="scss" scoped>

.post-item {
    background-color: #ffffff;
    box-sizing: border-box;
    // width: 860px;
    // height: 100px;
    border-radius: 8px;
    margin-bottom: 16px;
    padding: 12px;

    .post-title {
        text-align: left;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .post-content {
        text-align: left;
        margin-top: 10px;
        font-size: 14px;
        color: #7a7a7a;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
    }

    .post-meta {
        font-size: 12px;
        color: #888;
        gap: 10px;
        margin-bottom: 10px;

        .main-info {
            display: flex;
            justify-content: space-between;

            .up-row {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .main-info-down {
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 5px;

                .user-name {
                    font-size: 14px;
                    color: black;

                }
            }
        }
    }

    .post-node-row {
        font-size: 13px;
        margin-top: 10px;
        display: flex;

        .post-node {
            background-color: #ecb80e;
            padding: 6px;
            border-radius: 10px;
            cursor: pointer;
        }

    }

    .post-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-right: 6px;
    }

    .post-actions {
        display: flex;
        gap: 10px;
        font-size: 12px;
        color: #888;
        justify-content: end;
        box-sizing: border-box;

        div {
            cursor: pointer;
        }
    }
}
</style>