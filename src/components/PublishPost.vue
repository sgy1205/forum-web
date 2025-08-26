<template>
    <div class="publish-post">
        <div v-if="!this.$route.query.id" class="content-title">发布话题</div>
        <div v-else class="content-title">修改话题</div>
        <el-divider></el-divider>
        <el-form :rules="rules" ref="postFormRef" :model="postForm">
            <!-- 节点选择 -->
            <el-form-item prop="node" style="margin-top: 20px;">
                <div v-if="!this.$route.query.id" class="custom-node-list">
                    <span v-for="item in nodeList" :key="item"
                        :class="['custom-node', 'tran', { active: postForm.node === item }]"
                        @click="postForm.node = item">
                        {{ item }}
                    </span>
                </div>
                <div v-else class="custom-node-list">
                    <span class="custom-node active">{{ postForm.node }}</span>
                </div>
            </el-form-item>

            <!-- 标题输入 -->
            <el-form-item prop="title">
                <div class="title">
                    <el-input v-model="postForm.title" placeholder="请输入标题"></el-input>
                </div>
            </el-form-item>

            <!-- 富文本编辑器 -->
            <el-form-item :model="postForm.content" prop="content" style="height: 360px">
                <quill-editor v-model="postForm.content" :options="editorOption" ref="quillEditorRef"
                    style="height: 300px;box-sizing: border-box;" />
            </el-form-item>

            <!-- 字数统计 -->
            <div class="editor-count">字数: {{ contentLength }}</div>

            <!-- 标签选择区域 -->
            <el-form-item prop="tagsList">
                <!-- 已选标签 -->
                <div class="tag-input-wrapper">
                    <span v-for="(tagId, index) in postForm.tagsList" :key="tagId" class="tag-selected">
                        {{ getTagNameById(tagId) }}
                        <i class="el-icon-close" @click="removeTag(index)"></i>
                    </span>
                    <input v-model="tagInput" @focus="showRecommend = true" @keydown.enter.prevent="addTagByName"
                        @keydown.delete="deleteLastTag" placeholder="标签，输入好后按回车确定" class="tag-input" />
                </div>

                <!-- 推荐标签（含搜索/添加功能） -->
                <div v-if="showRecommend" class="tag-recommend">
                    <!-- 推荐标签标题栏 -->
                    <div style="display: flex;justify-content: space-between;align-items: center;">
                        <div class="recommend-title">推荐标签</div>
                        <i class="el-icon-close cursor" @click="showRecommend = false"></i>
                    </div>

                    <!-- 新增：搜索标签 + 添加标签 功能区 -->
                    <div class="tag-operation-bar" style="margin: 12px 0;">
                        <!-- 搜索标签 -->
                        <div class="tag-search" style="display: flex;align-items: center;margin-right: 16px;">
                            <el-input 
                                v-model="searchTagInput" 
                                placeholder="搜索标签" 
                                size="small" 
                                style="width: 200px;margin-right: 8px;"
                                @keydown.enter.prevent="handleSearchTags"
                            />
                            <el-button type="primary" size="small" @click="handleSearchTags">搜索</el-button>
                        </div>

                        <!-- 添加标签 -->
                        <div class="tag-add" style="display: flex;align-items: center;">
                            <el-input 
                                v-model="newTagInput" 
                                placeholder="输入新标签" 
                                size="small" 
                                style="width: 200px;margin-right: 8px;"
                                @keydown.enter.prevent="handleAddTag"
                            />
                            <el-button type="success" size="small" @click="handleAddTag">添加</el-button>
                        </div>
                    </div>

                    <el-divider></el-divider>

                    <!-- 标签列表（搜索结果会替换此列表） -->
                    <div class="recommend-list">
                        <span 
                            v-for="tag in recommendTags" 
                            :key="tag.tagsId" 
                            class="recommend-tag"
                            @click="addRecommendTag(tag.tagsId)" 
                            :class="{ disabled: postForm.tagsList.includes(tag.tagsId) }"
                        >
                            {{ tag.tagsName }}
                        </span>
                        <!-- 无标签时的提示 -->
                        <div v-if="recommendTags.length === 0" class="no-tag-tip">暂无匹配标签</div>
                    </div>
                </div>
            </el-form-item>

            <!-- 提交按钮 -->
            <el-form-item style="display: flex;justify-content: start;"
                :style="{ justifyContent: this.$route.query.id ? 'start ' : 'end' }">
                <div v-if="!this.$route.query.id" class="publish cursor" @click="sonPublish">发布</div>
                <div v-else class="publish cursor" @click="sonEdit">修改</div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
// 导入工具函数
import {
    getDraft, saveDraft, clearDraft,
    getContentLength, removeTag, deleteLastTag, addRecommendTag, sonPublish, sonEdit, isContentChanged
} from '@/utils/publish';

// 导入API接口（含新增的标签搜索/添加接口）
import { uploadImg } from '@/api/personal';
import { getRecommendTags, addTags, searchTags } from '@/api/post';

export default {
    name: 'PublishPost',
    props: {
        postForm: {
            type: Object,
            required: true
        },
        authorId: {
            type: String,
            required: true
        }
    },
    created() {
        // 初始化时获取默认推荐标签
        this.getRecommendTag();
    },
    components: {},
    data() {
        // 内容长度验证器
        const contentValidator = (rule, value, callback) => {
            if (this.contentLength < 5) {
                callback(new Error('内容长度不能少于 5 个字符'));
            } else {
                callback();
            }
        };

        return {
            debounce: false,
            originDraft: null, // 初始草稿
            nodeList: ['交流', '提问', '工作', '摸鱼', '日常', '游戏'], // 节点列表
            tagInput: '', // 手动输入标签的输入值
            showRecommend: false, // 是否显示推荐标签
            recommendTags: [], // 推荐标签列表（含搜索结果）
            
            // 新增：搜索/添加标签相关变量
            searchTagInput: '', // 搜索标签的输入值
            newTagInput: '', // 新增标签的输入值

            // 富文本编辑器配置
            editorOption: {
                modules: {
                    toolbar: {
                        container: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code-block'],
                            [{ 'header': 1 }, { 'header': 2 }],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            [{ 'indent': '-1' }, { 'indent': '+1' }],
                            [{ 'align': [] }],
                            ['link', 'image'],
                            ['clean'],
                        ],
                        handlers: {
                            image: () => {
                                const input = document.createElement('input');
                                input.setAttribute('type', 'file');
                                input.setAttribute('accept', 'image/*');
                                input.click();
                                input.onchange = () => {
                                    const file = input.files[0];
                                    if (file) {
                                        this.handleImageUpload(file);
                                    }
                                };
                            }
                        }
                    }
                },
                theme: 'snow'
            },

            // 表单验证规则
            rules: {
                node: [
                    { required: true, message: '请选择节点', trigger: 'blur' }
                ],
                title: [
                    { required: true, message: '请输入标题', trigger: 'change' },
                    { max: 20, message: '标题长度不能超过 20 个字符', trigger: 'blur' }
                ],
                content: [
                    { required: true, message: '请输入内容', trigger: 'change' },
                    { validator: contentValidator, trigger: 'blur' }
                ],
                tagsList: [
                    { required: true, message: '请选择标签', trigger: 'blur' },
                    { type: 'array', max: 6, message: '标签不能超过 6 个', trigger: 'change' }
                ]
            }
        };
    },
    mounted() {
        // 从本地存储加载草稿
        if (this.$route.query.id) {
            getDraft('postEditDraft', this.postForm);
            this.originDraft = JSON.parse(localStorage.getItem('postEditDraft') || '{}');
        } else {
            getDraft('postDraft', this.postForm);
            this.originDraft = JSON.parse(localStorage.getItem('postDraft') || '{}');
        }
    },
    watch: {
        // 监听表单变化，自动保存草稿
        postForm: {
            handler(val) {
                if (this.$route.query.id) {
                    saveDraft('postEditDraft', val);
                } else {
                    saveDraft('postDraft', val);
                }
            },
            deep: true
        },
        // 监听路由ID变化，重新加载对应草稿
        '$route.query.id'(newId) {
            if (newId) {
                getDraft('postEditDraft', this.postForm);
            } else {
                getDraft('postDraft', this.postForm);
            }
        }
    },
    computed: {
        // 计算内容长度（去除富文本标签）
        contentLength() {
            return getContentLength(this.postForm.content);
        }
    },
    methods: {
        /**
         * 根据tagsId获取对应的tagsName
         * @param {Number} tagId - 标签ID
         * @returns {String} 标签名称（无匹配时返回ID）
         */
        getTagNameById(tagId) {
            const tag = this.recommendTags.find(t => t.tagsId === tagId);
            return tag ? tag.tagsName : String(tagId);
        },

        /**
         * 获取默认推荐标签
         */
        getRecommendTag() {
            getRecommendTags().then(res => {
                this.recommendTags = res.data || [];
            }).catch(err => {
                this.$message.error('获取推荐标签失败');
                console.error('获取推荐标签错误：', err);
            });
        },

        /**
         * 富文本编辑器图片上传
         * @param {File} file - 上传的图片文件
         */
        handleImageUpload(file) {
            const formData = new FormData();
            formData.append('file', file); // 注意：后端接收参数名是file（原代码是files，已适配后端）
            
            uploadImg(formData).then(res => {
                const imageUrl = res.data; // 适配后端返回的图片URL
                // 获取Quill编辑器实例
                const quill = this.$refs.quillEditorRef.quill || 
                              (this.$refs.quillEditorRef.getEditor && this.$refs.quillEditorRef.getEditor());
                
                if (quill) {
                    const range = quill.getSelection(true);
                    // 在光标位置插入图片
                    quill.insertEmbed(range ? range.index : 0, 'image', imageUrl);
                } else {
                    this.$message.error('编辑器未初始化');
                }

                // 保存图片文件名（适配后端参数）
                if (this.postForm.imageUrl) {
                    this.postForm.imageUrl += ',' + res.newFileNames;
                } else {
                    this.postForm.imageUrl = res.newFileNames;
                }
            }).catch(err => {
                console.error('图片上传失败：', err);
                this.$message.error('图片上传失败');
            });
        },

        /**
         * 手动输入标签添加（按回车触发）
         */
        addTagByName() {
            const tagName = this.tagInput.trim();
            if (!tagName) return;

            // 检查是否为推荐标签中的标签
            const existingTag = this.recommendTags.find(t => t.tagsName === tagName);
            if (existingTag) {
                // 是推荐标签，添加标签ID
                if (!this.postForm.tagsList.includes(existingTag.tagsId)) {
                    this.postForm.tagsList.push(existingTag.tagsId);
                } else {
                    this.$message.warning('该标签已添加');
                }
            } else {
                // 非推荐标签（自定义标签），提示需先添加到系统
                this.$message.info('请先通过"添加标签"功能将该标签加入系统');
            }

            // 清空输入框
            this.tagInput = '';
        },

        /**
         * 新增：搜索标签（调用searchTags接口）
         */
        handleSearchTags() {
            const searchName = this.searchTagInput.trim();
            console.log(searchName)
            // 搜索关键词为空时，重新加载默认推荐标签
            if (!searchName) {
                this.getRecommendTag();
                return;
            }

            // 调用搜索接口（GET请求，参数用params传递）
            searchTags({ tagsName: searchName }).then(res => {
                this.recommendTags = res.data || [];
            }).catch(err => {
                this.$message.error('搜索标签失败');
                console.error('搜索标签错误：', err);
            });
        },

        /**
         * 新增：添加标签（调用addTags接口）
         */
        handleAddTag() {
            const tagName = this.newTagInput.trim();
            if (!tagName) {
                this.$message.warning('请输入标签名称');
                return;
            }

            // 调用添加标签接口（POST请求）
            addTags({ tagsName: tagName }).then(res => {
                this.$message.success('标签添加成功');
                // 清空输入框
                this.newTagInput = '';
                // 重新加载推荐标签列表（显示新添加的标签）
                this.getRecommendTag();
            }).catch(err => {
                // 后端返回错误信息（如标签已存在、含违禁词）
                const errorMsg = err.response?.data?.msg || '标签添加失败';
                this.$message.error(errorMsg);
                console.error('添加标签错误：', err);
            });
        },

        /**
         * 移除已选标签
         * @param {Number} index - 标签在数组中的索引
         */
        removeTag(index) {
            removeTag(this.postForm.tagsList, index);
        },

        /**
         * 按删除键移除最后一个标签（输入框为空时）
         */
        deleteLastTag() {
            deleteLastTag(this.postForm.tagsList, this.tagInput);
        },

        /**
         * 添加推荐标签（点击推荐标签时触发）
         * @param {Number} tagId - 推荐标签的ID
         */
        addRecommendTag(tagId) {
            addRecommendTag(tagId, this.postForm.tagsList);
        },

        /**
         * 发布话题（触发父组件submit事件）
         */
        sonPublish() {
            this.$refs.postFormRef.validate(valid => {
                if (valid) {
                    this.postForm.createTime = new Date().toISOString();
                    this.$emit('submit', 'post', this.postForm);
                    clearDraft('postDraft');
                } else {
                    this.$message.error('请检查内容是否符合要求');
                }
            });
        },

        /**
         * 修改话题（触发父组件edit事件）
         */
        sonEdit() {
            // 检查内容是否有修改
            if (!isContentChanged(this.originDraft, this.postForm)) {
                this.$message.error('请修改内容后再提交');
                return;
            }

            this.$refs.postFormRef.validate(valid => {
                if (valid) {
                    this.postForm.createTime = new Date().toISOString();
                    this.$emit('edit', 'post', this.postForm);
                    clearDraft('postEditDraft');
                } else {
                    this.$message.error('请检查内容是否符合要求');
                }
            });
        },

        /**
         * 发布回调（备用，实际由父组件处理）
         */
        handlePublish(type, val) {
            if (this.debounce) return;
            this.debounce = true;
            addPost(val).then(res => {
                this.$message.success(res.msg);
                // 清空表单
                this.postForm.title = '';
                this.postForm.content = '';
                this.postForm.tagsList = [];
                this.postForm.node = '';
                clearDraft('postDraft');
                setTimeout(() => {
                    this.debounce = false;
                }, 1000);
                // 跳转到详情页
                this.$router.push({ path: `/detail/${this.authorId}`, query: { type: 'post', postId: res.data } });
            }).catch(err => {
                this.debounce = false;
                this.$message.error('发布失败');
            });
        },

        /**
         * 编辑回调（备用，实际由父组件处理）
         */
        handleEdit(type, val) {
            if (this.debounce) return;
            this.debounce = true;
            updatePost(val).then(res => {
                this.$message.success(res.msg);
                // 清空表单
                this.postForm.title = '';
                this.postForm.content = '';
                this.postForm.tagsList = [];
                this.postForm.node = '';
                clearDraft('postEditDraft');
                setTimeout(() => {
                    this.debounce = false;
                }, 1000);
                // 跳转到详情页
                this.$router.push({ path: `/detail/${this.authorId}`, query: { type: 'post', postId: res.data } });
            }).catch(err => {
                this.debounce = false;
                this.$message.error('修改失败');
            });
        }
    }
};
</script>

<style lang="scss" scoped>
// 表单内容区域高度适配
::v-deep .el-form-item__content {
    height: 100%;
}

// 节点选择样式
.custom-node-list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap; // 适配小屏幕，自动换行

    .custom-node {
        padding: 4px 18px;
        border: 1px solid #dcdfe6;
        border-radius: 6px;
        cursor: pointer;
        background: #f5f7fa;
        color: #606266;
        user-select: none;
        transition: all 0.2s ease;

        &:hover {
            background: #e4e7ed;
        }

        &.active {
            background: #3273DC;
            color: #fff;
            border-color: #3273DC;
        }
    }
}

// 标签操作栏（搜索+添加）样式
.tag-operation-bar {
    display: flex;
    flex-wrap: wrap; // 小屏幕自动换行
    gap: 16px;
    align-items: center;
}

// 无标签提示样式
.no-tag-tip {
    color: #999;
    font-size: 14px;
    padding: 8px 0;
}

// 推荐标签列表样式补充
::v-deep .recommend-list {
    min-height: 40px; // 避免无标签时高度塌陷
    align-items: center;
}

// 发布按钮样式优化
.publish {
    padding: 8px 20px;
    background-color: #48C78E;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: darken(#48C78E, 5%);
    }
}

// 适配小屏幕样式
@media (max-width: 768px) {
    .tag-operation-bar {
        flex-direction: column;
        align-items: flex-start;
    }

    .tag-search, .tag-add {
        width: 100%;
    }

    ::v-deep .el-input {
        width: 100% !important;
    }
}
</style>