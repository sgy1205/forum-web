<template>
    <div class="header-bar tran">
        <div class="container">
            <div class="header-left">
                <img class="header-logo" src="../assets/images/帽子.png" alt="">
                <el-menu mode="horizontal" :router="true" class="nav-menu" :default-active="$route.path"
                    v-if="getToken()">
                    <el-menu-item index="/index">首页</el-menu-item>
                </el-menu>
            </div>
            <div class="header-right">
                <div class="get-in"
                    v-if="this.$router.currentRoute.path !== '/login' && this.$router.currentRoute.path !== '/register'">
                    <el-form ref="queryFormRef" :model="queryForm" inline size="mini" class="search-bar"
                        @submit.native.prevent>
                        <el-form-item prop="search">
                            <div class="search tran">
                                <input class="search-input tran" v-model="queryForm.search" placeholder="请输入你想查找的内容"
                                    @keyup.enter="handleQuery(queryForm)">
                                <button type="button" class="search-button tran" @click="handleQuery(queryForm)">
                                    <i class="el-icon-search"></i>
                                </button>
                            </div>
                        </el-form-item>
                    </el-form>
                    <div class="label tran" @click="handlePublishPost">
                        <i class="el-icon-plus"></i>
                        发布话题
                    </div>
                </div>
                <!-- 未登录状态 -->
                <div v-if="this.$router.currentRoute.path !== '/login' && !getToken()" class="unlogin-bar">
                    <button class="header-login-btn tran" @click="goLogin">登录</button>
                </div>
                <!-- 已登录状态 -->
                <div v-if="this.$router.currentRoute.path !== '/login' && this.$router.currentRoute.path !== '/register' && getToken()"
                    class="haslogin-bar">
                    <div class="message" @click="handleCommand('message')">
                        <i class="el-icon-message"></i>
                        消息
                        <span v-if="unreadCount > 0"> ({{ unreadCount }})</span>
                    </div>
                    <el-dropdown @command="handleCommand">
                        <div class="user-info">
                            <div class="window">
                                <img v-if="avatar" class="avatar" :src="avatar">
                                <!-- <img v-else src="@/assets/images/默认头像.png" class="avatar" alt=""> -->
                            </div>
                            <div class="user-name">
                                {{ userName }}
                            </div>
                            <i class="el-icon-arrow-down"></i>
                        </div>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="personal">
                                <i class="el-icon-user"></i>
                                个人中心
                            </el-dropdown-item>
                            <el-dropdown-item command="collection">
                                <i class="el-icon-star-off"></i>
                                我的收藏
                            </el-dropdown-item>
                            <el-dropdown-item command="points">
                                <i class="el-icon-trophy"></i>
                                我的积分
                            </el-dropdown-item>
                            <el-dropdown-item command="editmine">
                                <i class="el-icon-edit"></i>
                                编辑资料
                            </el-dropdown-item>
                            <el-dropdown-item command="logout">
                                <i class="el-icon-toilet-paper"></i>
                                退出登录
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { MessageBox } from 'element-ui';
import { query } from '@/utils/query.js';
import { getToken } from '../utils/auth.js';
import { removeToken } from '../utils/auth.js';
import { msgHasRead } from "@/api/personal.js";
export default {
    name: 'HeaderBar',
    data() {
        return {
            queryForm: {
                search: this.$route.query.searchContent || '',
            },
            rules: {
                search: [
                    { required: true, message: '请输入搜索内容', trigger: 'blur' }
                ]
            },
        };
    },
    created() {
        const cached = localStorage.getItem('userInfo');
        if (cached) {
            try {
                this.$store.commit('setUserInfo', JSON.parse(cached));
            } catch (e) {
                console.warn('缓存的用户信息格式错误，已清除');
                localStorage.removeItem('userInfo');
            }
        }
    },
    computed: {
        // 先检查整个user状态是否存在
        userState() {
            // 双重检查，确保不会访问undefined的属性
            if (!this.$store || !this.$store.state || !this.$store.state.user) {
                return {};
            }
            return this.$store.state.user;
        },
        userInfo() {
            // 从userState中获取user信息，确保安全
            return this.userState.user || {};
        },
        avatar() {
            const user = this.userInfo;

            if (user.avatar?.startsWith('http') || user.avatar?.startsWith('https')) {
                return user.avatar || localStorage.getItem('avatar') || require('@/assets/images/默认头像.png');
            } else if (user.avatar) {
                return user.avatar || localStorage.getItem('avatar') || '@/assets/images/默认头像.png';
            } else {
                return require('@/assets/images/默认头像.png');
            }
        },
        userName() {
            return this.userInfo.nickName || localStorage.getItem('nickName') || '昵称';
        },
        unreadCount() {
            // 这里是之前报错的位置，增加了多重检查
            return this.userInfo.unreadCount || 0;
        },
    },
    mounted() {
        // 只有在有token的情况下才获取未读消息
        if (getToken()) {
            this.getUnread();
        }
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        getToken,
        getUnread() {
            if (!getToken()) return;
            msgHasRead().then(res => {
                // 确保store存在再提交
                if (this.$store && this.$store.commit) {
                    this.$store.commit('setUnreadCount', res.data);
                }
                localStorage.setItem('unreadCount', res.data || 0);
            }).catch(err => {
                console.error('获取未读消息失败:', err);
            });
        },
        handleQuery(queryForm) {
            const hasInput = query(queryForm)

            const newQuery = { searchContent: queryForm.search };
            if (
                this.$route.path === '/index' &&
                this.$route.query.searchContent === queryForm.search
            ) {
                return;
            }

            if (this.$route.path !== '/index') {
                if (!hasInput) return this.$message.warning('请输入要查询的信息！')
                this.$router.push({ path: '/index', query: newQuery });
            } else {
                this.$router.replace({ path: '/index', query: newQuery });
            }
        },
        goLogin() {
            if (this.$route.path !== '/login') {
                this.$router.push('/login');
            }
        },
        handlePublishPost() {
            // 从localStorage获取userId更可靠，避免依赖store
            const userId = this.userInfo.id || localStorage.getItem('userId');
            if (!userId) {
                this.$message.warning('请先登录');
                this.goLogin();
                return;
            }

            if (this.$route.path === `/publish/${userId}` && this.$route.query.type === 'post' && this.$route.query.id === undefined) {
                return;
            }
            this.$router.push({ path: `/publish/${userId}`, query: { type: 'post' } });
        },
        handleScroll() {
            const header = document.querySelector('.header-bar');
            if (header) {
                header.style.top = '0px';
            }
        },
        handleCommand(command) {
            const userId = this.userInfo.id || localStorage.getItem('userId');
            if (!userId && command !== 'logout') {
                this.$message.warning('请先登录');
                this.goLogin();
                return;
            }

            const mineoption = [
                'personal',
                'collection',
                'points',
                'message',
                'editmine'
            ];

            if (mineoption.includes(command)) {
                let query = {};
                if (command === 'collection') query.tab = 'collection';
                if (command === 'points') query.tab = 'points';
                if (command === 'message') query.tab = 'message';
                if (command === 'editmine') {
                    if (this.$route.path === `/editmine/${userId}`) {
                        return;
                    }
                    this.$router.replace({ path: `/editmine/${userId}` }).catch(() => { });
                } else {
                    if (this.$route.path === `/personal/${userId}` && this.$route.query.tab === query.tab) {
                        return;
                    }
                    this.$router.replace({ path: `/personal/${userId}`, query });
                }
                return;
            } else if (command === 'logout') {
                MessageBox.confirm(" 确认退出登录吗？", "系统提示", {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }).then(() => {
                    removeToken();
                    localStorage.removeItem('userInfo');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('nickName');
                    localStorage.removeItem('avatar');
                    localStorage.removeItem('signature');
                    localStorage.removeItem('homepageUrl');
                    localStorage.removeItem('points');
                    localStorage.removeItem('commentNumber');
                    localStorage.removeItem('userRank');
                    localStorage.removeItem('email');
                    localStorage.removeItem('postDraft')
                    localStorage.removeItem('postEditDraft')
                    localStorage.removeItem('articleDraft')
                    localStorage.removeItem('articleEditDraft')
                    localStorage.removeItem('fansListVos');
                    localStorage.removeItem('msConcernListVos');
                    localStorage.removeItem('userFanTotal');
                    localStorage.removeItem('userTopicNumber');
                    localStorage.removeItem('userConcernTotal');
                    localStorage.removeItem('background');


                    this.$router.push('/login').catch(() => { });
                    this.$message.success('退出登录成功');
                }).catch(() => { });
            }
        }
    },
};
</script>

<style lang="scss">
/* 样式部分保持不变 */
.el-button--primary {
    border: #DCDFE6 1px solid !important;
    color: #6B6C70;

    &:hover {
        background-color: #DCDFE6 !important;
        color: #4AA3FF !important;
    }
}

.el-message-box {
    .el-button {
        color: #333333 !important;

        &:hover {
            border: 1px solid #7e9feb !important;
        }
    }
}

.header-bar {
    background-color: #ffffff;
    width: 100%;
    height: 60px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1000;
    margin: 0;
    padding: 0;
    will-change: transform;
    transform: translateZ(0);

    .container {
        max-width: 1400px;
        width: 100%;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        padding: 0 20px;
        box-sizing: border-box;

        .header-left {
            height: 100%;
            display: flex;
            align-items: center;

            .header-logo {
                width: 50px;
                height: auto;
                margin-right: 20px;
            }

            .nav-menu {
                padding-left: 50px;
            }

            .el-menu-item {
                font-size: 16px;
                color: #333333;
                font-weight: bold;
            }

            .el-menu-item.is-active {
                background-color: #F0F2F4;
            }
        }

        .header-right {
            height: 100%;
            display: flex;
            align-items: center;

            .get-in {
                display: flex;
                align-items: center;

                .label {
                    text-align: center;
                    background-color: #F0F0F0;
                    box-sizing: border-box;
                    border-radius: 4px;
                    padding: 7px 12px;
                    margin-right: 20px;
                    cursor: pointer;

                    &:hover {
                        background-color: #e8e7e7;
                    }
                }

                .search-bar {
                    margin-right: 20px;

                    .el-form-item {
                        margin-bottom: 0;
                    }

                    .search {
                        display: flex;
                        align-items: center;
                        border: #dcdfe6 1px solid;
                        border-radius: 20px;
                        background-color: #F9FAFB;

                        .search-input {
                            width: 150px;
                            padding: 6px 12px;
                            border: none !important;
                            border-radius: 20px;
                            outline: none;
                            background-color: #F9FAFB;
                        }

                        .search-button {
                            background-color: #F9FAFB;
                            border: none;
                            border-radius: 0 20px 20px 0;
                            padding: 6px 12px;
                            cursor: pointer;

                            &:hover {
                                background-color: #e8e7e7;
                            }
                        }
                    }
                }
            }

            .unlogin-bar {
                .header-login-btn {
                    color: #4B4956;
                    border: 2px solid #d3d3d3;
                    border-radius: 8px;
                    padding: 6px 12px;
                    cursor: pointer;

                    &:hover {
                        background-color: #e4e4e4;
                    }
                }
            }

            .haslogin-bar {
                height: 100%;
                display: flex;
                align-items: center;
                gap: 20px;

                .message {
                    font-weight: bold;
                    cursor: pointer;

                    .el-icon-message {
                        font-weight: bold;
                    }
                }

                .user-info {
                    display: flex;
                    gap: 10px;
                    cursor: pointer;
                    align-items: center;

                    .window {
                        border-radius: 50%;
                        overflow: hidden;
                        height: 34px;

                        .avatar {
                            width: 34px;
                            height: 34px;
                            object-fit: cover;
                        }
                    }

                    .user-name {
                        line-height: 34px;
                        font-weight: bold;
                        color: black;
                    }

                    .el-icon-arrow-down {
                        line-height: 34px;
                        margin-left: 5px;
                        color: #596CFF;
                        font-weight: bold;
                    }
                }
            }
        }
    }
}

body {
    margin: 0;
    padding: 0;
}
</style>
