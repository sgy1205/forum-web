<template>
    <div class="collection main">
        <HeadersBar />
        <div class="top-down">
            <div class="main-container">
                <PublishPost v-if="$route.query.type === 'post'" :postForm="postForm" :type="$route.query.type"
                    @submit="handlePublish" @edit="handleEdit" :authorId="userId" />
            </div>
        </div>
    </div>
</template>

<script>
// 仅保留帖子相关API
import { addPost, updatePost } from '@/api/post';
export default {
    name: 'Publish',
    components: {
        HeadersBar: () => import('@/components/HeaderBar.vue'),
        PublishPost: () => import('@/components/PublishPost.vue'),
    },
    data() {
        return {
            userId: '',
            postForm: {
                postId: this.$route.query.postId ? this.$route.query.postId : '',
                node: '',
                title: '',
                content: '',
                tagsList: [],
                createTime: '',
            }
        };
    },

    created() {
        this.userId = localStorage.getItem('userId') || '';
        this.postForm = {
            postId: this.$route.query.postId ? this.$route.query.postId : '',
            title: '',
            node: '',
            content: '',
            type: this.$route.query.type || 'post',
            tagsList: [],
            authorId: localStorage.getItem('userId') || '',
            createTime: '',
        };
    },
    methods: {
        // 仅保留帖子发布处理
        handlePublish(type, val) {
            if (type === 'post') {
                this.postForm = val;
                const data = {
                    content: val.content,
                    node: val.node,
                    tagsIds: val.tagsList,
                    title: val.title,
                };
                addPost(data).then(res => {
                    this.$message.success(res.msg);
                    // 发布成功后清空表单和草稿
                    this.postForm = {
                        postId: '',
                        node: '',
                        title: '',
                        content: '',
                        tagsList: [],
                        createTime: '',
                    };
                    localStorage.removeItem('postDraft');
                    this.$router.push({ path: `/detail/${this.userId}`, query: { type: 'post', postId: res.data } });
                }).catch(err => { });
            }
        },
        // 仅保留帖子编辑处理
        handleEdit(type, val) {
            if (type === 'post') {
                this.postForm = val;
                const data = {
                    postId: val.postId,
                    html: val.content,
                    node: val.node,
                    tagsList: val.tagsList,
                    title: val.title,
                    imageUrl: val.imageUrl || '',
                    fileUrl: val.fileUrl || '',
                };
                updatePost(data).then(res => {
                    this.$message.success(res.msg);
                    this.postForm = {
                        postId: '',
                        node: '',
                        title: '',
                        content: '',
                        tagsList: [],
                        createTime: '',
                    };
                    localStorage.removeItem('postEditDraft');
                    this.$router.push({ path: `/detail/${this.userId}`, query: { type: 'post', postId: val.postId } });
                }).catch(err => { });
            }
        },
    }
}
</script>

<style lang="scss">

// 仅保留帖子相关样式
.publish-post {
    background-color: white;
    padding: 20px;
    border-radius: 12px;
    width: 60%;
    margin: auto;
    box-sizing: border-box;
}

.selected-node {
    margin-top: 4px;
    font-weight: bold;
    border: 1px solid #dcdfe6;
}

.editor-count {
    color: #888;
    font-size: 14px;
    margin: 10px 0;
    border: 1px solid #DCDFE6;
    padding: 10px;
}

.tag-input-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    min-height: 40px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 6px 8px;
    background: #fff;

    .tag-selected {
        background: #f0f9eb;
        color: #67c23a;
        border-radius: 4px;
        padding: 2px 8px;
        margin-right: 6px;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        font-size: 14px;

        i {
            font-size: 14px;
            margin-left: 4px;
            cursor: pointer;
        }
    }

    .tag-input {
        border: none;
        outline: none;
        font-size: 14px;
        min-width: 60px;
        flex: 1;
        margin-bottom: 4px;
    }
}

.tag-recommend {
    background: #f8f9fa;
    border-radius: 8px;
    margin-top: 8px;
    padding: 12px;
    border: 1px solid #ebeef5;

    .recommend-title {
        font-weight: bold;
        color: #17906b;
        margin-bottom: 8px;
    }

    .recommend-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 10px;

        .recommend-tag {
            background: #e3f9f1;
            color: #17906b;
            border-radius: 6px;
            padding: 4px 16px;
            cursor: pointer;
            font-size: 15px;

            &.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }
}

.publish {
    padding: 10px;
    background-color: #48C78E;
    width: 60px;
    border-radius: 10px;
    color: white;
    line-height: 30px;
    text-align: center;

    &:hover {
        background-color: darken(#48C78E, 5%);
    }
}
</style>
