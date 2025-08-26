<template>
    <div class="sign-in">
        <div class="sign-row tran">
            <div class="content-title">签到</div>
            <el-divider></el-divider>
            <div class="sign-content">
                <i class="el-icon-coin"></i>
                <div class="points">{{ myPoints }}</div>
                <div class="sign-btn cursor" v-if="checkStatus == 0" @click="handleCheck">
                    <i class="el-icon-date"></i>
                    立即签到
                </div>
                <div class="sign-btn cursor" v-else>
                    <i class="el-icon-check"></i>
                    连续签到{{ checkNum }}天
                </div>
            </div>
        </div>
        <div class="points-rank tran" :key="userList.length">
            <div class="content-title">积分排名</div>
            <el-divider></el-divider>
            <div class="user-list">
                <div class="user-row" v-for="user in userList" :key="user.userId">
                    <div class="col">
                        <div class="window cursor" @click="goPersonal(user.userId)">
                            <img :src="user.avatar
                                ? (user.avatar.startsWith('http') || user.avatar.startsWith('https')
                                    ? user.avatar
                                    : proxyTarget + user.avatar)
                                : require('@/assets/images/默认头像.png')" class="user-avatar" />
                        </div>
                        <div class="user-info cursor" @click="goPersonal(user.userId)">
                            <div class="user-name">{{ user.nickName || '未知用户' }}
                                <div v-if="user.userId == userId"> (我)</div>
                            </div>
                            <div class="user-meta">
                                <span class="user-posts">{{ user.postNum }} 帖子 ·</span>
                                <span class="user-comments">{{ user.commentNum }} 评论</span>
                            </div>
                        </div>
                        <div class="points">
                            <i class="el-icon-coin"></i>
                            {{ user.points }}
                        </div>
                    </div>
                    <el-divider v-if="user.userId !== userList[userList.length - 1].userId"></el-divider>

                </div>
            </div>
            <LoadMore :length="userList.length" :pagination="rankPagination" @load-more="loadMore('rank')"
                @retract="retract('rank')" />
        </div>

    </div>
</template>

<script>
import { check, checkStatus, checkNum, pointRank } from '@/api/check';


export default {
    name: 'Collection',
    props: {

    },
    components: {
        LoadMore: () => import('./LoadMore.vue')
    },
    data() {

        return {
            proxyTarget: process.env.VUE_APP_PROXY_TARGET,
            userId: '',
            checkStatus: '',
            checkNum: 0,
            myPoints: '',
            userList: [
            ],
            rankPagination: {
                pageNum: 1,
                pageSize: 5,
                total: 0
            }
        };
    },
    mounted() {
        this.userId = this.$store.state.user.user.id || localStorage.getItem('userId') || '';
        checkStatus().then(res => {
            this.checkStatus = res.checkStatus
            this.myPoints = res.points;
        }).catch(err => {
        });
        checkNum().then(res => {
            this.checkNum = res.checkNum
        }).catch(err => {
        });
        this.refreshRank()
    },
    methods: {
        refreshRank() {
            pointRank({ pageNum: this.rankPagination.pageNum, pageSize: this.rankPagination.pageSize }).then(res => {
                this.userList = res.rows || [];
                this.rankPagination.total = res.total;
            }).catch(err => {
            });
        },
        loadMore(type) {
            if (type === 'rank') {
                if (this.userList.length >= this.rankPagination.total) {
                    return;
                }
                this.rankPagination.pageSize += 5;
                this.refreshRank()
            }
        },

        retract(type) {
            if (type === 'rank') {
                this.rankPagination.pageSize = 5;
                this.refreshRank()
            }
        },
        goPersonal(id) {
            this.$router.push({ name: 'Personal', params: { id } });
        },
        handleCheck() {
            check().then(res => {
                this.$message.success(res.msg);
                checkStatus().then(res => {
                    this.checkStatus = res.checkStatus;
                    this.myPoints = res.points;
                }).catch(err => {
                });
                checkNum().then(res => {
                    this.checkNum = res.checkNum;
                }).catch(err => {
                });
                this.refreshRank()
            }).catch(err => {
            });
        }
    },
};
</script>

<style lang="scss" scoped>
// 主题
body.dark {
    .sign-in {

        .points-rank,
        .sign-row {
            background-color: #222;
            color: #fff;

            .sign-btn {
                &:hover {
                    background-color: #333;
                }
            }
        }
    }
}

.sign-in {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: fit-content;
    position: sticky;
    top: 90px;

    .sign-row,
    .points-rank {
        background-color: white;
        border-radius: 12px;
        padding: 15px;
    }

    .sign-content {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
        justify-content: space-between;

        .points {
            font-size: 16px;
            font-weight: bold;
        }

        .el-icon-coin,
        .el-icon-date {
            font-weight: bold;
        }

        .sign-btn {
            border: 1px solid #8e909486;
            padding: 5px 10px;
            border-radius: 10px;
            width: 120px;
            text-align: center;

            &:hover {
                background-color: #f0f0f0;
            }
        }
    }

    .user-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-top: 20px;

        .user-row {

            .col {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;

                .user-name {
                    display: flex;

                }

                .window {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;

                    img {
                        width: 100%;
                        height: 100%;
                    }
                }

                .user-meta {
                    font-size: 12px;
                    color: #666;
                }

                .points {
                    flex: 1;
                    text-align: end;
                    color: #666;
                }
            }
        }
    }
}
</style>