<template>
    <div class="combined-page">
        <HeaderBar />

        <!-- 2. Node选择栏 - 固定定位 -->
        <div class="node-tab-container">
            <div class="tab-row">
                <!-- Node选项 -->
                <div style="display: flex; gap: 20px;">
                    <div v-for="(tab) in nodeTabs" :key="tab.value"
                        :class="['tab-item', { active: activeNode === tab.value }]" @click="changeNode(tab)">
                        {{ tab.label }}
                    </div>
                </div>
                <!-- 时间筛选 -->
                <div class="tab-select">
                    <el-dropdown @command="handleTimeDropdown" trigger="click" placement="bottom-end">
                        <span class="dropdown-trigger">
                            {{ timeFrame === 0 ? '时间不限' : '最近' }}
                            <i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item :command="0" :disabled="timeFrame === 0">时间不限</el-dropdown-item>
                            <el-dropdown-item :command="3" :disabled="timeFrame === 3">最近</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </div>
        </div>

        <!-- 3. 主体内容区（左菜单 + 中间帖子 + 右签到） -->
        <div class="main-content">
            <!-- 左侧：最新/推荐/关注菜单 -->
            <div class="left-menu tran">
                <div class="menu-options tran" v-for="(menu, index) in contentMenus" :key="index"
                    @click="changeContentMenu(menu)">
                    <div class="menu-item tran" :class="{ active: menu.active }">
                        <img :src="menu.icon" alt="">
                        <div class="menu-name">{{ menu.name }}</div>
                    </div>
                </div>
            </div>

            <!-- 中间：帖子列表 -->
            <div class="middle-posts">
                <div class="content-list tran" v-loading="loading" :key="JSON.stringify(postList)">
                    <!-- 空状态 -->
                    <div v-if="postList.length === 0" class="empty-state">
                        <el-empty description="暂无帖子"></el-empty>
                    </div>
                    <!-- 帖子列表 -->
                    <div v-else>
                        <PostItem v-for="(item, index) in postList" :key="index" :item="item" :author-id="item.userId"
                            :current-user-id="curUserId" />
                        <!-- 加载更多 -->
                        <LoadMore :length="postList.length" :pagination="pagination" @load-more="handleLoadMore"
                            @retract="handleRetract" />
                    </div>
                </div>
            </div>

            <!-- 右侧：仅保留签到组件（积分排名已移至签到组件内） -->
            <div class="right-sidebar">
                <div class="sidebar-card">
                    <SignIn />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// 导入资源和组件
import iconNew from '@/assets/images/最新.png';
import iconRecommend from '@/assets/images/推荐.png';
import iconConcern from '@/assets/images/关注.png';

// 接口：统一使用search接口
import { search } from '@/api/index.js';

export default {
    name: 'CombinedHome',
    components: {
        HeaderBar: () => import('@/components/HeaderBar.vue'),
        PostItem: () => import('@/components/PostItem.vue'),
        SignIn: () => import('@/components/SignIn.vue'),
        LoadMore: () => import('@/components/LoadMore.vue')
    },
    data() {
        return {
            // 基础状态
            loading: false,
            curUserId: this.$store.state.user.user.id || localStorage.getItem('userId') || '',

            // 1. Node选择相关（顶部Tab）
            nodeTabs: [
                { label: '全部', value: 'all' },
                { label: '日常', value: 'daily' },
                { label: '工作', value: 'work' },
                { label: '游戏', value: 'game' },
                { label: '摸鱼', value: 'fishing' },
                { label: '美图', value: 'beauty_picture' },
                { label: '交流', value: 'exchange' },
                { label: '旅游', value: 'travel' },
                { label: '提问', value: 'questions' },
            ],
            activeNode: 'all', // 当前选中的Node
            timeFrame: 0, // 时间筛选：0-不限，3-最近

            // 2. 内容菜单（左侧：最新/推荐/关注）
            contentMenus: [
                { name: '最新', active: true, icon: iconNew },
                { name: '推荐', active: false, icon: iconRecommend },
                { name: '关注', active: false, icon: iconConcern }
            ],

            // 3. 分页配置
            pagination: {
                pageNum: 1,
                pageSize: 5,
                total: 0
            },

            // 4. 帖子列表数据
            postList: []
        };
    },
    created() {
        // 初始化：获取帖子列表
        this.fetchPostList();
    },
    watch: {
        '$route.query.searchContent': {
            handler() {
                this.pagination.pageNum = 1;
                this.fetchPostList();
            },
            immediate: false
        }
    },
    methods: {
        // 1. 切换Node（顶部Tab）- 修改为切换时滚动到顶部
        changeNode(tab) {
            this.activeNode = tab.value;
            this.pagination.pageNum = 1; // 重置分页
            // 切换Node时滚动到页面顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.fetchPostList();
        },

        // 2. 切换内容菜单（左侧：最新/推荐/关注）
        changeContentMenu(menu) {
            // 重置菜单激活状态
            this.contentMenus.forEach(item => item.active = false);
            menu.active = true;
            this.pagination.pageNum = 1; // 重置分页
            // 切换菜单时滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.fetchPostList();
        },

        // 3. 时间筛选下拉框
        handleTimeDropdown(command) {
            this.timeFrame = command;
            this.pagination.pageNum = 1; // 重置分页
            // 切换时间筛选时也滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.fetchPostList();
        },

        // 4. 统一获取帖子列表
        fetchPostList() {
            this.loading = true;
            const params = this.buildSearchParams();

            search(params)
                .then(res => {
                    this.postList = res.rows;
                    this.pagination.total = res.total;
                })
                .catch(err => {
                    console.error('获取帖子失败：', err);
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        // 5. 构造search接口参数
        buildSearchParams() {
            const { pageNum, pageSize } = this.pagination;
            const activeMenu = this.contentMenus.find(menu => menu.active).name;
            let recommend = 0;
            let concernStatus = 0;
            let node = '';
            const searchContent = this.$route.query.searchContent || '';

            // 左侧菜单 → 参数映射
            switch (activeMenu) {
                case '最新':
                    recommend = 0;
                    concernStatus = 0;
                    break;
                case '推荐':
                    recommend = 1;
                    concernStatus = 0;
                    break;
                case '关注':
                    concernStatus = 1;
                    recommend = 0;
                    break;
            }

            // 顶部Node → node参数
            if (this.activeNode !== 'all' && this.activeNode !== 'recommend') {
                const activeTab = this.nodeTabs.find(tab => tab.value === this.activeNode);
                node = activeTab ? activeTab.label : '';
            }

            // 最终参数
            return {
                pageNum,
                pageSize,
                recommend,
                searchContent,
                concernStatus,
                timeFrame: this.timeFrame,
                node
            };
        },

        // 6. 加载更多
        handleLoadMore() {
            if (this.postList.length >= this.pagination.total) return;
            this.pagination.pageNum++;
            this.fetchPostList();
        },

        // 7. 收起（重置第一页）
        handleRetract() {
            this.pagination.pageNum = 1;
            this.fetchPostList();
            // 收起时滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
};
</script>

<style lang="scss" scoped>
// 全局样式：固定浅色模式
.combined-page {
    width: 100%;
    background-color: #f5f5f5;
    box-sizing: border-box;
}

// Node选择栏样式 - 固定定位修改
.node-tab-container {
    width: 90%;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 8px 20px;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    // 固定定位到顶部
    position: fixed;
    top: 60px; // 假设HeaderBar高度为60px，可根据实际调整
    left: 5%; // 配合width:90%居中
    z-index: 100; // 确保在内容上方显示
    // 添加过渡效果使固定更平滑
    transition: all 0.3s ease;

    .tab-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #eeeeee;
        padding-bottom: 8px;
        margin-top: 5px;


        .tab-item {
            font-size: 16px;
            color: #888888;
            padding: 8px 0;
            cursor: pointer;
            transition: all 0.3s ease;

            &.active {
                color: #222222;
                font-weight: bold;
                border-bottom: 2px solid #f9cea0;
            }

            &:hover {
                color: #f9cea0;
            }
        }

        .tab-select {
            .dropdown-trigger {
                cursor: pointer;
                font-size: 15px;
                color: #222222;
                padding: 6px 16px;
                border-radius: 4px;
                border: 1px solid #eeeeee;
                background: #ffffff;
                display: flex;
                align-items: center;
                transition: border-color 0.3s ease;

                &:hover {
                    border-color: #f9cea0;
                }
            }
        }
    }
}

// 主体内容区布局
.main-content {
    width: 90%;
    margin: 100px auto 40px; // 增加顶部margin，避免被固定栏遮挡
    display: flex;
    gap: 20px;
    align-items: flex-start;

    // 左侧菜单
    .left-menu {
        width: 200px;
        background-color: #ffffff;
        border-radius: 12px;
        padding: 30px 0;
        box-sizing: border-box;
        position: sticky;
        top: 160px;
        height: fit-content;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        .menu-options {
            width: 100%;
            cursor: pointer;

            &:hover {
                background-color: #fff7f7;
            }

            .menu-item {
                width: 100%;
                padding: 10px 30px;
                display: flex;
                align-items: center;
                font-weight: bold;
                color: #222222;
                box-sizing: border-box;

                &.active {
                    background-color: #fff7f7;
                }

                img {
                    width: 30px;
                    height: 30px;
                    margin-right: 10px;
                }
            }
        }
    }

    // 中间帖子列表
    .middle-posts {
        flex: 1;
        background-color: #ffffff;
        border-radius: 12px;
        padding: 20px;
        box-sizing: border-box;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        // 添加最小高度避免内容切换时的闪烁
        min-height: 600px;

        .content-list {
            width: 100%;

            .empty-state {
                padding: 40px 0;
                text-align: center;
            }
        }
    }

    // 右侧：仅签到组件
    .right-sidebar {
        width: 280px;

        .sidebar-card {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 16px;
            box-sizing: border-box;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
    }
}

// 加载样式
.el-loading-mask {
    background-color: rgba(255, 255, 255, 0.8) !important;
}

// PostItem样式适配
::v-deep .PostItem {
    background-color: #ffffff !important;
    color: #222222 !important;
    margin-bottom: 16px;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

    &:last-child {
        margin-bottom: 0;
    }

    .post-tag {
        background-color: #fff7f7 !important;
        color: #f9cea0 !important;
    }
}

// 过渡效果优化
.tran {
    transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}
</style>
