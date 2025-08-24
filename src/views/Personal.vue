<template>
    <div class="personal main">
        <HeaderBar />
        <div class="top-down">
            <div class="main-container tran" v-loading="Loading">
                <div class="banner" :style="`background-image: url(${this.getBack(this.userInfo.background)})`">
                    <div class="avoid-change">
                        <el-upload :show-file-list="false" :action="uploadImgUrl" :headers="uploadHeaders"
                            :before-upload="beforeBackUpload" :on-success="handleBackUploadSuccess" name="files">
                            <div v-show="isCurrentUser" class="set-back tran">
                                <i class="el-icon-lightning"></i>
                                设置背景
                            </div>
                        </el-upload>
                    </div>
                    <div class="opacity-wrapper">
                        <div class="user-col">
                            <div class="user-name">{{ this.userInfo.nickName }}</div>
                            <div class="user-signature">{{ this.userInfo.signature }}</div>
                        </div>
                        <div class="follow-btn cursor tran" v-show="!isCurrentUser" @click="handleFollow">
                            <div v-if="!hasFollow">
                                <i class="el-icon-plus"></i>
                                关注
                            </div>
                            <div class="has-follow tran" v-else>
                                <i class="el-icon-check"></i>
                                已关注
                            </div>
                        </div>
                    </div>
                    <div class="avatar">
                        <img :src="getAvatar(this.userInfo.avatar)" alt="">
                    </div>
                </div>
                <div class="detail">
                    <div class="info-col">
                        <div class="achievement pub-box tran">
                            <div class="achievement-title title">个人成就</div>
                            <el-divider></el-divider>
                            <div class="achievement-content">
                                <div class="achievement-item cursor" @click="showPoints">
                                    <div class="achievement-name ">积分</div>
                                    <span class="achievement-value">{{ this.userInfo.points || 0 }}</span>
                                </div>
                                <div class="achievement-item cursor" @click="showPosts">
                                    <div class="achievement-name ">话题</div>
                                    <span class="achievement-value">{{ this.userInfo.postNumber || 0 }}</span>
                                </div>
                                <div class="achievement-item cursor">
                                    <div class="achievement-name ">评论</div>
                                    <span class="achievement-value">{{ this.userInfo.commentNumber || 0 }}</span>
                                </div>
                                <div class="achievement-item cursor">
                                    <div class="achievement-name ">注册排名</div>
                                    <span class="achievement-value">{{ this.userInfo.rank || "未知" }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="personal-detail pub-box tran">
                            <div class="diff-row">
                                <div class="personal-detail-title title">个人资料</div>
                                <div>
                                    <div v-show="isCurrentUser" class="edit" @click="goEditMine">编辑资料</div>
                                </div>
                            </div>
                            <el-divider></el-divider>
                            <div class="user-info">
                                <div class="user-name-row">
                                    <div class="user-name-title">昵称</div>
                                    <div class="user-name">{{ this.userInfo.nickName }}</div>
                                </div>
                                <el-divider></el-divider>
                                <div class="user-signature-row">
                                    <div class="user-signature-title">签名</div>
                                    <div class="user-signature">{{ this.userInfo.signature || '这个人很懒，什么都没有留下' }}</div>
                                </div>
                                <div class="user-center-box" v-show="!isCurrentUser">
                                    <el-divider></el-divider>
                                    <div class="user-center-row">
                                        <div class="user-center-title">主页</div>
                                        <a v-if="userInfo.homepageUrl" :href="`${userInfo.homepageUrl}${userInfo.id}`"
                                            class="user-center tran">
                                            {{ userInfo.homepageUrl }}</a>
                                        <div v-else class="no-homepage">暂无主页</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="fans pub-box tran">
                            <div class="diff-row">
                                <div class="fans-title title" :key="this.userInfo.fanTotal">粉丝 {{ this.userInfo.fanTotal
                                }}</div>
                                <div class="more" @click="showFansAndFollow('fans')">更多</div>
                            </div>
                            <el-divider></el-divider>
                            <div v-if="fansList.length !== 0" class="fans-list" :key="JSON.stringify(fansList)">
                                <FollowNFan v-for="(fan, index) in fansList" :key="fan.userId || index" :fanFo="fan"
                                    :userId="userId" :concernList="concernList" :short=true
                                    @refreshFansAndFollow="refreshFansAndFollow" />
                            </div>
                            <div v-else class="no-fans">暂无粉丝</div>
                        </div>
                        <div class="follow pub-box tran">
                            <div class="diff-row">
                                <div class="follow-title title" :key="this.userInfo.concernTotal">关注{{
                                    this.userInfo.concernTotal }}</div>
                                <div class="more" @click="showFansAndFollow('follow')">更多</div>
                            </div>
                            <el-divider></el-divider>
                            <div v-if="followList.length !== 0" class="follow-list" :key="JSON.stringify(followList)">
                                <FollowNFan v-for="(follow, index) in followList" :key="follow.userId || index"
                                    :fanFo="follow" :userId="userId" :concernList="concernList" :short=true
                                    @refreshFansAndFollow="refreshFansAndFollow" />
                            </div>
                            <div v-else class="no-follow">暂无关注</div>
                        </div>
                    </div>

                    <div class="content-list">
                        <div v-if="activeTabGroup === 'points'">
                            <div>
                                <div class="content-title">
                                    <i class="el-icon-trophy"></i>
                                    积分记录
                                </div>
                                <el-divider></el-divider>
                                <el-empty v-if="pointsList.length === 0" description="暂无积分记录"></el-empty>
                                <div v-else style="margin-top: 10px;">
                                    <div v-for="(item, index) in pointsList" :key="index" class="points-item">
                                        <div class="points-type" style="color: #F56C6C;">获取积分</div>
                                        <div class="points-value">
                                            <i class="el-icon-medal"></i>
                                            {{ item.pointNumber }}
                                        </div>
                                        <div class="points-msg">{{ item.pointType == '0' ? '签到' : '发帖' }}</div>
                                        <div class="points-time">@{{ item.createTime }}</div>
                                    </div>
                                    <LoadMore :length="pointsList.length" :pagination="pointsPagination"
                                        @load-more="loadMore('points')" @retract="retract('points')" />
                                </div>
                            </div>
                        </div>
                        <div v-else-if="activeTabGroup === 'message'">
                            <div class="content-title"
                                style="display: flex; align-items: center;justify-content: space-between;">
                                <i class="el-icon-message">&nbsp;消息</i>
                                <div v-if="unreadCount > 0" class="unread-count" style="text-align: end;"
                                    :key="unreadCount">{{ unreadCount
                                    }}条未读消息
                                    <div class="mark-read cursor" @click="allRead">全部标记为已读☝️</div>
                                </div>
                            </div>
                            <el-divider></el-divider>
                            <el-empty v-if="msgList.length === 0" description="暂无消息记录"></el-empty>
                            <div v-else class="message-col">
                                <div
                                    style="margin-bottom: 10px; display: flex; align-items: center;justify-content: space-between;">
                                    <el-checkbox v-model="isAllSelected" @change="toggleSelectAll"
                                        style="margin-right: 10px;">全选</el-checkbox>
                                    <el-button :disabled="selectedMsgIds.length === 0"
                                        @click="deleteSomeMsg">批量删除</el-button>
                                </div>
                                <div v-for="(item, index) in msgList" :key="index">
                                    <div class="message-item">
                                        <el-checkbox :value="selectedMsgIds.includes(item.messageId)"
                                            @change="checked => handleSelectMsg(item.messageId, checked)"
                                            style="margin-right: 10px;" />
                                        <div class="avatar-window">
                                            <img :src="getAvatar(item.avatar)" class="avatar" alt="">
                                        </div>
                                        <div class="message">
                                            <div class="message-row">
                                                <div style="display: flex;gap: 10px;">
                                                    <div class="message-time">{{ time(item.createTime) }}</div>
                                                    <div v-if="item.typeCode == 0" class="msg">
                                                        你的内容有新消息！</div>
                                                    <div v-if="item.typeCode == 1" class="msg">
                                                        你的帖子有新消息！</div>
                                                    <div v-if="item.typeCode == 2" class="msg">
                                                        你的评论有新消息！</div>
                                                    <div v-if="item.typeCode == 3" class="msg">
                                                        有人关注了你！</div>
                                                </div>
                                                <el-tag type="danger" v-if="item.readStatus == 0">未读</el-tag>
                                            </div>
                                            <div class="vector tran"></div>
                                            <div class="message-about tran">
                                                <div class="message-content">{{ item.content }}</div>
                                            </div>
                                            <div
                                                style="display: flex;justify-content: space-between;align-items: center; margin-top: 10px;">
                                                <!-- 关注 -->
                                                <div v-show="item.typeCode == 3" class="message-href cursor"
                                                    @click="goPersonal(item.operatorId, item.readStatus, item.messageId)">
                                                    去他的主页看看>></div>
                                                <!-- 帖子评论 -->
                                                <div v-show="item.typeCode == 2 && item.type.includes('POST')"
                                                    class="message-href cursor"
                                                    @click="goDetail(item.id, type = 'post', item.readStatus, item.messageId)">
                                                    点击查看详情>>
                                                </div>
                                                <!-- 帖子 -->
                                                <div v-show="item.typeCode == 1 && item.type != 'POST_DELETED'"
                                                    class="message-href cursor"
                                                    @click="goDetail(item.id, type = 'post', item.readStatus, item.messageId)">
                                                    点击查看详情>>
                                                </div>
                                                <div class="cursor"
                                                    style="margin-left:10px;color: gray;flex:1 ;text-align: end;"
                                                    @click="deleteSingleMsg(item.messageId)">删除🗑️
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <el-divider v-if="index !== msgList.length - 1"></el-divider>
                                </div>
                                <LoadMore :length="msgList.length" :pagination="msgListPagination"
                                    @load-more="loadMore('msg')" @retract="retract('msg')" />
                            </div>
                        </div>
                        <div v-else>
                            <div v-if="activeTabGroup === 'collection'" class="content-title">
                                <i class="el-icon-star-off"></i>
                                收藏列表
                            </div>
                            <el-tabs v-model="activeTab">
                                <template v-if="activeTabGroup === 'collection'">
                                    <el-tab-pane name="all">
                                        <span slot="label">
                                            <i class="el-icon-view tab-icon"></i>全部
                                        </span>
                                        <div v-if="sortedCollection.length !== 0">
                                            <PostItem v-for="(item, index) in sortedCollection" :key="index"
                                                :item="item" :author-id="item.userId" :current-user-id="curId" />
                                            <LoadMore :length="sortedCollection.length" :pagination="collectPagination"
                                                @load-more="loadMore('collect')" @retract="retract('collect')" />
                                        </div>
                                        <el-empty v-else description="暂无收藏"></el-empty>
                                    </el-tab-pane>
                                    <el-tab-pane name="post">
                                        <span slot="label">
                                            <i class="el-icon-chat-line-square tab-icon"></i>话题
                                        </span>
                                        <div v-if="sortedCollection.filter(item => item.type == 'post').length !== 0">
                                            <PostItem
                                                v-for="(PostItem, index) in sortedCollection.filter(item => item.type == 'post')"
                                                :key="index" :item="PostItem" :author-id="PostItem.userId"
                                                :current-user-id="curId" />
                                            <LoadMore
                                                :length="sortedCollection.filter(item => item.type == 'post').length"
                                                :pagination="collectPagination" @load-more="loadMore('collect')"
                                                @retract="retract('collect')" />
                                        </div>
                                        <el-empty v-else description="暂无话题"></el-empty>
                                    </el-tab-pane>
                                </template>
                                <template v-else-if="activeTabGroup === 'post'">
                                    <el-tab-pane name="post">
                                        <span slot="label">
                                            <i class="el-icon-chat-line-square tab-icon"></i>话题
                                        </span>
                                        <div v-if="postList.length !== 0">
                                            <PostItem v-for="(PostItem, index) in postList" :key="index"
                                                :item="PostItem" :author-id="PostItem.userId"
                                                :current-user-id="curId" />
                                            <LoadMore :length="postList.length" :pagination="postPagination"
                                                @load-more="loadMore('post')" @retract="retract('post')" />
                                        </div>
                                        <el-empty v-else description="暂无话题"></el-empty>
                                    </el-tab-pane>
                                </template>
                                <template v-else>
                                    <el-tab-pane name="fans">
                                        <span slot="label">
                                            <i class="el-icon-user-solid tab-icon"></i>粉丝
                                        </span>
                                        <div v-if="moreFansList.length !== 0" class="fans-list"
                                            :key="JSON.stringify(moreFansList)">
                                            <FollowNFan v-for="(fan, index) in moreFansList" :key="fan.userId || index"
                                                :fanFo="fan" :userId="userId" :concernList="concernList" :short=false
                                                @refreshFansAndFollow="refreshFansAndFollow" />
                                            <LoadMore :length="moreFansList.length" :pagination="fansListPagination"
                                                @load-more="loadMore('fans')" @retract="retract('fans')" />
                                        </div>
                                        <el-empty v-else description="暂无粉丝"></el-empty>
                                    </el-tab-pane>
                                    <el-tab-pane name="follow">
                                        <span slot="label">
                                            <i class="el-icon-user tab-icon"></i>关注
                                        </span>
                                        <div v-if="moreFollowList.length !== 0" class="follow-list"
                                            :key="JSON.stringify(moreFollowList)">
                                            <FollowNFan v-for="(follow, index) in moreFollowList"
                                                :key="follow.userId || index" :fanFo="follow" :userId="userId"
                                                :concernList="concernList" :short=false
                                                @refreshFansAndFollow="refreshFansAndFollow" />
                                            <LoadMore :length="moreFollowList.length" :pagination="followListPagination"
                                                @load-more="loadMore('follow')" @retract="retract('follow')" />
                                        </div>
                                        <el-empty v-else description="暂无关注"></el-empty>
                                    </el-tab-pane>
                                </template>
                            </el-tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { time } from '@/utils/time.js';
import { curUser } from '@/api/login';
import { postList } from '@/api/post';
import { userBack, follow, collection, points, followList, fansList, msgList, msgHasRead, readMsg, setRead, deleteMsg } from '@/api/personal';
import { getToken } from '@/utils/auth';

export default {
    name: 'Personal',
    components: {
        HeaderBar: () => import('@/components/HeaderBar.vue'),
        PostItem: () => import('@/components/PostItem.vue'),
        FollowNFan: () => import('@/components/FollowNFan.vue'),
        LoadMore: () => import('@/components/LoadMore.vue'),
    },
    watch: {
        '$route.params.id': {
            immediate: true,
            async handler(newId) {
                this.Loading = true;
                try {
                    this.curId = newId;
                    this.userId = this.$store.state.user?.id || localStorage.getItem('userId') || '';
                    
                    let curUserRes, userRes;
                    if (this.curId === this.userId) {
                        curUserRes = userRes = await curUser(this.userId);
                    } else {
                        [curUserRes, userRes] = await Promise.all([
                            curUser(this.userId),
                            curUser(this.curId)
                        ]);
                    }

                    const [postRes] = await Promise.all([
                        postList({ userId: this.curId, pageNum: this.postPagination.pageNum, pageSize: this.postPagination.pageSize }),
                    ]);
                    
                    this.postList = postRes.rows || [];
                    this.postPagination.total = postRes.total;
                    this.concernList = curUserRes.data.concernListVos || [];
                    this.userInfo = userRes.data;
                    this.userInfo.id = this.curId;
                    this.fansList = userRes.data.fansListVos || [];
                    this.fansListPagination.total = userRes.data.fanTotal;
                    this.followList = userRes.data.concernListVos || [];
                    this.followListPagination.total = userRes.data.concernTotal;

                } catch (err) {
                    console.error(err);
                } finally {
                    this.Loading = false;
                }
            }
        },
        '$route.query.tab': {
            immediate: true,
            async handler(val) {
                window.scrollTo({ top: 0, behavior: 'smooth' });

                if (val === 'collection') {
                    this.activeTabGroup = 'collection';
                    this.activeTab = 'all';
                    const collectRes = await collection({ userId: this.userId, pageNum: this.collectPagination.pageNum, pageSize: this.collectPagination.pageSize });
                    this.collectList = collectRes.rows || [];
                    this.collectPagination.total = collectRes.total;
                } else if (val === 'points') {
                    this.activeTabGroup = 'points';
                    const pointsRes = await points({ pageNum: this.pointsPagination.pageNum, pageSize: this.pointsPagination.pageSize });
                    this.pointsList = pointsRes.rows || [];
                    this.pointsPagination.total = pointsRes.total;
                } else if (val === 'message') {
                    this.activeTabGroup = 'message';
                    const msgRes = await msgList({ pageNum: this.msgListPagination.pageNum, pageSize: this.msgListPagination.pageSize });
                    this.msgList = msgRes.rows || [];
                    this.msgListPagination.total = msgRes.total;
                    this.getUnread();
                } else if (val === 'fans') {
                    const fansRes = await fansList({ userId: this.curId, pageNum: 1, pageSize: 5 });
                    this.moreFansList = fansRes.rows || [];
                    const followRes = await followList({ userId: this.curId, pageNum: 1, pageSize: 5 });
                    this.moreFollowList = followRes.rows || [];
                    this.activeTabGroup = 'fans';
                    this.activeTab = 'fans';
                } else if (val === 'follow') {
                    const fansRes = await fansList({ userId: this.curId, pageNum: 1, pageSize: 5 });
                    this.moreFansList = fansRes.rows || [];
                    const followRes = await followList({ userId: this.curId, pageNum: 1, pageSize: 5 });
                    this.moreFollowList = followRes.rows || [];
                    this.activeTabGroup = 'follow';
                    this.activeTab = 'follow';
                } else {
                    this.activeTabGroup = 'post';
                    this.activeTab = 'post';
                }
            }
        }
    },
    data() {
        return {
            Loading: false,
            proxyTarget: process.env.VUE_APP_PROXY_TARGET,
            selectedMsgIds: [],
            isAllSelected: false,
            msgUserAvatars: {},
            uploadImgUrl: process.env.VUE_APP_PROXY_TARGET + '/common/uploads',
            uploadHeaders: {
                Authorization: 'Bearer ' + getToken('token'),
            },
            activeTab: 'post',
            activeTabGroup: 'post',
            userId: '',
            curId: '',
            currentRoute: this.$route.path,
            myConcernList: [],
            concernList: [],
            collectList: [],
            msgList: [],
            userInfo: {},
            postList: [],
            fansList: [],
            followList: [],
            moreFansList: [],
            moreFollowList: [],
            pointsList: [],
            pointsPagination: {
                pageNum: 1,
                pageSize: 5,
                total: 0,
            },
            collectPagination: {
                pageNum: 1,
                pageSize: 5,
                total: 0,
            },
            postPagination: {
                pageNum: 1,
                pageSize: 5,
                total: 0,
            },
            fansListPagination: {
                pageNum: 1,
                pageSize: 5,
                total: 0,
            },
            followListPagination: {
                pageNum: 1,
                pageSize: 5,
                total: 0,
            },
            msgListPagination: {
                pageNum: 1,
                pageSize: 5,
                total: 0,
            },
        }
    },
    created() {
        this.curId = this.$route.params.id;
        this.userId = localStorage.getItem('userId')
    },
    computed: {
        unreadCount() {
            return this.$store.state.user.user.unreadCount || localStorage.getItem('unreadCount') || 0;
        },
        sortedCollection() {
            return this.collectList.map(item => {
                return { ...item, type: 'post' };
            });
        },
        isCurrentUser() {
            if (!this.userId || !this.curId) return false;
            return this.curId == this.userId;
        },
        hasFollow() {
            return this.concernList.some(item => item.userId == this.curId);
        },
    },
    methods: {
        getAvatar(avatar) {
            if (!avatar) {
                return require('@/assets/images/默认头像.png');
            }
            if (avatar.startsWith('http') || avatar.startsWith('https')) {
                return avatar;
            } else {
                return this.proxyTarget + avatar;
            }
        },
        getBack(background) {
            if (!background) {
                return require('@/assets/images/back4.jpg');
            }
            if (background.startsWith('http') || background.startsWith('https')) {
                return background;
            } else {
                return this.proxyTarget + background;
            }
        },
        time,
        handleSelectMsg(id, checked) {
            if (checked) {
                if (!this.selectedMsgIds.includes(id)) {
                    this.selectedMsgIds.push(id);
                }
            } else {
                this.selectedMsgIds = this.selectedMsgIds.filter(mid => mid !== id);
            }
            this.isAllSelected = this.selectedMsgIds.length === this.msgList.length;
        },
        toggleSelectAll(checked) {
            if (checked) {
                this.selectedMsgIds = this.msgList.map(item => item.messageId);
            } else {
                this.selectedMsgIds = [];
            }
        },
        deleteSingleMsg(id) {
            this.$confirm('确定删除该消息吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteMsg({ ids: [id] }).then(res => {
                    this.$message.success('删除成功');
                    this.reloadMsgList();
                }).catch(err => {
                });
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        deleteSomeMsg() {
            this.$confirm('确定批量删除选中的消息吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteMsg({ ids: this.selectedMsgIds }).then(res => {
                    this.selectedMsgIds = [];
                    this.isAllSelected = false;
                    this.$message.success('批量删除成功');
                    this.reloadMsgList();
                }).catch(() => { });
            });
        },
        reloadMsgList() {
            msgList({ pageNum: this.msgListPagination.pageNum, pageSize: this.msgListPagination.pageSize }).then(res => {
                this.msgList = res.rows || [];
                this.msgListPagination.total = res.total;
                this.getUnread();
            });
        },
        allRead() {
            this.$confirm('确定将所有消息标记为已读吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                readMsg().then(res => {
                    this.$message.success('已标记为已读');
                    this.getUnread();
                }).catch(err => {
                });
            }).catch(() => {
            });
        },
        getUnread() {
            msgHasRead().then(res => {
                this.$store.commit('setUnreadCount', res.data || 0);
                localStorage.setItem('unreadCount', res.data || 0);
            }).catch(err => {
            });
        },
        goPersonal(operatorId, readStatus, messageId) {
            if (readStatus == 0) {
                setRead({ id: messageId }).then(res => {
                    this.getUnread();
                    this.$router.push(`/personal/${operatorId}`);
                }).catch(err => {
                });
            } else {
                this.$router.push(`/personal/${operatorId}`);
            }
        },
        goDetail(id, type, readStatus, messageId) {
            if (readStatus == 0) {
                setRead({ id: messageId }).then(res => {
                    this.getUnread();
                    this.$router.push({
                        path: `/detail/${this.curId}`,
                        query: { type, [`${type}Id`]: id }
                    });
                }).catch(err => {
                });
            } else {
                this.$router.push({
                    path: `/detail/${this.curId}`,
                    query: { type, [`${type}Id`]: id }
                });
            }
        },
        beforeBackUpload(file) {
            const isImage = /\.(jpg|jpeg|png|gif|bmp)$/i.test(file.name);
            if (!isImage) {
                this.$message.error('请上传JPG、PNG、GIF或BMP格式的图片');
                return false;
            }
            return true;
        },
        handleBackUploadSuccess(res) {
            const url = res.fileNames;
            if (!url) {
                this.$message.error('上传失败');
                return;
            }
            this.setBack(url);
        },
        setBack(url) {
            userBack({ background: url }).then(res => {
                this.$message.success('背景设置成功');
                curUser(this.curId).then(res => {
                    this.userInfo.background = res.data.background.startsWith('http') || res.data.background.startsWith('https') ? res.data.background : process.env.VUE_APP_PROXY_TARGET + res.data.background;
                }).catch(err => {
                });
            }).catch(err => {
            });
        },
        goEditMine() {
            this.$router.push(`/editmine/${this.userId}`);
        },
        handleFollow() {
            follow({
                concernUserId: this.curId,
            }).then(res => {
                this.fansListPagination.pageNum = 1;
                this.followListPagination.pageNum = 1;
                this.fansListPagination.pageSize = 5;
                this.followListPagination.pageSize = 5;
                fansList({ userId: this.curId, pageNum: this.fansListPagination.pageNum, pageSize: this.fansListPagination.pageSize }).then(res => {
                    this.fansList = res.rows || [];
                    this.fansListPagination.total = res.total;
                    this.moreFansList = res.rows || [];
                }).catch(err => {
                });
                followList({ userId: this.curId, pageNum: this.followListPagination.pageNum, pageSize: this.followListPagination.pageSize }).then(res => {
                    this.followList = res.rows || [];
                    this.followListPagination.total = res.total;
                    this.moreFollowList = res.rows || [];
                }).catch(err => {
                });
                curUser(this.curId).then(res => {
                    this.userInfo.fanTotal = res.data.fanTotal;
                    this.userInfo.concernTotal = res.data.concernTotal;
                }).catch(err => {
                });
                curUser(this.userId).then(res => {
                    this.concernList = res.data.concernListVos || [];
                }).catch(err => {
                });
                this.$message.success(res.msg)
            }).catch(err => {
            });
        },
        refreshFansAndFollow() {
            curUser(this.curId).then(res => {
                this.userInfo = res.data;
                this.userInfo.id = this.curId;

                fansList({ userId: this.curId, pageNum: 1, pageSize: 5 }).then(res => {
                    this.fansList = res.rows || [];
                    this.fansListPagination.total = res.total;
                    this.moreFansList = res.rows || [];
                }).catch(err => {
                });
                followList({ userId: this.curId, pageNum: 1, pageSize: 5 }).then(res => {
                    this.followList = res.rows || [];
                    this.followListPagination.total = res.total;
                    this.moreFollowList = res.rows || [];
                }).catch(err => {
                });
            }).catch(err => {
            });
            curUser(this.userId).then(res => {
                this.concernList = res.data.concernListVos || [];
            }).catch(err => {
            });
        },
        loadMore(type) {
            if (type === 'collect') {
                if (this.collectList.length >= this.collectPagination.total) {
                    return;
                }
                this.collectPagination.pageSize += 5;
                collection({ pageNum: this.collectPagination.pageNum, pageSize: this.collectPagination.pageSize }).then(res => {
                    this.collectList = res.rows;
                    this.collectPagination.total = res.total;
                }).catch(err => {
                });
            } else if (type === 'fans') {
                if (this.moreFansList.length >= this.fansListPagination.total) {
                    return;
                }
                this.moreFansListPagination.pageSize += 5;
                fansList({ userId: this.userId, pageNum: this.moreFansListPagination.pageNum, pageSize: this.moreFansListPagination.pageSize }).then(res => {
                    this.moreFansList = res.rows || [];
                    this.moreFansListPagination.total = res.total;
                }).catch(err => {
                });
            } else if (type === 'follow') {
                if (this.moreFollowList.length >= this.followListPagination.total) {
                    return;
                }
                this.moreFollowListPagination.pageSize += 5;
                followList({ userId: this.userId, pageNum: this.moreFollowListPagination.pageNum, pageSize: this.moreFollowListPagination.pageSize }).then(res => {
                    this.moreFollowList = res.rows || [];
                    this.moreFollowListPagination.total = res.total;
                }).catch(err => {
                });
            } else if (type === 'post') {
                if (this.postList.length >= this.postPagination.total) {
                    return;
                }
                this.postPagination.pageSize += 5;
                postList({ userId: this.curId, pageNum: this.postPagination.pageNum, pageSize: this.postPagination.pageSize }).then(res => {
                    this.postList = res.rows || [];
                    this.postPagination.total = res.total;
                }).catch(err => {
                });
            } else if (type === 'points') {
                if (this.pointsList.length >= this.pointsPagination.total) {
                    return;
                }
                this.pointsPagination.pageSize += 5;
                points({ pageNum: this.pointsPagination.pageNum, pageSize: this.pointsPagination.pageSize }).then(res => {
                    this.pointsList = res.rows || [];
                    this.pointsPagination.total = res.total;
                }).catch(err => {
                });
            } else if (type === 'msg') {
                if (this.msgList.length >= this.msgListPagination.total) {
                    return;
                }
                this.msgListPagination.pageSize += 5;
                msgList({ pageNum: this.msgListPagination.pageNum, pageSize: this.msgListPagination.pageSize }).then(res => {
                    this.msgList = res.rows || [];
                    this.msgListPagination.total = res.total;
                }).catch(err => {
                });
            }
        },
        retract(type) {
            if (type === 'collect') {
                this.collectPagination.pageSize = 5;
                collection({ pageNum: this.collectPagination.pageNum, pageSize: this.collectPagination.pageSize }).then(res => {
                    this.collectList = res.rows;
                    this.collectPagination.total = res.total;
                }).catch(err => {
                });
            } else if (type === 'fans') {
                this.moreFansListPagination.pageSize = 5;
                fansList({ pageNum: this.moreFansListPagination.pageNum, pageSize: this.moreFansListPagination.pageSize }).then(res => {
                    this.moreFansList = res.rows;
                    this.moreFansListPagination.total = res.total;
                }).catch(err => {
                });
            } else if (type === 'follow') {
                this.moreFollowListPagination.pageSize = 5;
                followList({ pageNum: this.moreFollowListPagination.pageNum, pageSize: this.moreFollowListPagination.pageSize, userId: this.userId }).then(res => {
                    this.moreFollowList = res.rows;
                    this.moreFollowListPagination.total = res.total;
                }).catch(err => {
                });
            } else if (type === 'post') {
                this.postPagination.pageSize = 5;
                postList({ userId: this.curId, pageNum: this.postPagination.pageNum, pageSize: this.postPagination.pageSize }).then(res => {
                    this.postList = res.rows || [];
                    this.postPagination.total = res.total;
                }).catch(err => {
                });
            } else if (type === 'points') {
                this.pointsPagination.pageSize = 5;
                points({ pageNum: this.pointsPagination.pageNum, pageSize: this.pointsPagination.pageSize }).then(res => {
                    this.pointsList = res.rows || [];
                    this.pointsPagination.total = res.total;
                }).catch(err => {
                });
            } else if (type === 'msg') {
                this.msgListPagination.pageSize = 5;
                msgList({ pageNum: this.msgListPagination.pageNum, pageSize: this.msgListPagination.pageSize }).then(res => {
                    this.msgList = res.rows || [];
                    this.msgListPagination.total = res.total;
                }).catch(err => {
                });
            }
        },
        showFansAndFollow(type) {
            this.activeTabGroup = 'fans';
            this.activeTab = type;
            if (this.$route.query.tab == type) {
                return;
            }
            this.$router.push({ path: `/personal/${this.curId}`, query: { tab: type } });
        },
        showPosts() {
            this.activeTabGroup = 'post';
            this.activeTab = 'post';
            if (this.$route.query.tab === 'post') {
                return;
            }
            this.$router.push({ path: `/personal/${this.curId}`, query: { tab: 'post' } });
        },
        showPoints() {
            if (this.$route.query.tab === 'points') {
                return;
            }
            if (this.curId != this.userId) {
                return;
            }
            this.$router.push({ path: `/personal/${this.userId}`, query: { tab: 'points' } });
            this.activeTabGroup = 'points';
        }
    }
}
</script>

<style lang="scss" scoped>
// 全局居中样式
.top-down {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

.main-container {
    width: 1100px;
    height: 100%;
    background-color: #F3F7FE;
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 0 auto; // 确保容器居中
    padding: 20px;
    box-sizing: border-box;
}

// 主题样式
body.dark {
    .main-container {
        background-color: #141414;

        .pub-box {
            background-color: #222222 !important;
            color: #7a7a7a;

            .achievement-value {
                transition: all 0.3s;
                color: #FFFFFF !important;
            }

            .title {
                transition: all 0.3s;
                color: #FFFFFF;
            }
        }

        .vector {
            background-color: #2b2b2b !important;
        }

        .message-about {
            background-color: #2b2b2b !important;
        }
    }
}

.banner {
    position: relative;
    width: 100%;
    height: 220px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;

    .set-back {
        width: 100px;
        height: 30px;
        text-align: center;
        margin: 20px 20px 0 0;
        background-color: rgba(227, 227, 227, 0.259);
        border-radius: 5px;
        line-height: 30px;
        color: #00000063;
        font-size: 14px;
        cursor: pointer;

        &:hover {
            background-color: rgba(227, 227, 227, 0.5);
        }
    }

    .opacity-wrapper {
        width: 100%;
        height: 60px;
        background: linear-gradient(90deg,
                rgba(255, 255, 255, 0.444) 0%,
                rgba(255, 255, 255, 0)100%);
        display: flex;
        align-items: center;
        justify-content: space-between;

        .follow-btn,
        .has-follow {
            height: 40px;
            text-align: center;
            line-height: 40px;
            width: 100px;
            background-color: #296cff;
            color: white;
            font-weight: bold;
            border-radius: 8px;
            margin-right: 10px;

            &:hover {
                background-color: #4c85ff;
            }

            .el-icon-plus,
            .el-icon-check {
                font-weight: bold;
            }
        }

        .has-follow {
            background-color: #84abff;
        }

        .user-col {
            margin-left: 110px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            color: black;

            .user-name {
                font-weight: bold;
            }

            .user-signature {
                font-size: 14px;
            }
        }
    }

    .avatar {
        position: absolute;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        bottom: 20px;
        left: 10px;

        img {
            width: 80px;
            height: 80px;
        }
    }
}

.detail {
    display: flex;
    gap: 20px;

    .info-col {
        width: 300px;
        display: flex;
        flex-direction: column;
        gap: 20px;

        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .pub-box {
            padding: 10px;
            width: 100%;
            background-color: #FFFFFF;
            border-radius: 10px;
            box-sizing: border-box;

            .diff-row {
                display: flex;
                justify-content: space-between;

                .edit,
                .more {
                    cursor: pointer;
                }
            }

            .user-signature {
                max-width: 220px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .achievement {
            .achievement-content {
                display: flex;
                justify-content: space-between;
                padding: 16px 16px 0 16px;
                font-size: 14px;
                color: #A7A7AF;
            }

            .achievement-item {
                width: 100%;
                display: flex;
                flex-direction: column;

                .achievement-name {
                    text-align: center;
                }

                .achievement-value {
                    width: 100%;
                    color: black;
                    font-weight: bold;
                    text-align: center;
                }
            }
        }

        .personal-detail {
            .user-info {
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 10px;

                .user-name-row,
                .user-signature-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 20px 0 10px 0;
                }

                .user-signature-row {
                    padding: 10px 0 !important;
                }

                .user-center-box {
                    .user-center-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 20px 0;
                        gap: 10px;

                        .user-center {
                            display: inline-block;
                            text-decoration: none;
                            color: #296cff;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            flex: 1;

                            &:hover {
                                color: #709dff;
                            }
                        }
                    }
                }
            }
        }

        .no-fans,
        .no-follow {
            text-align: center;
            color: #c2c2c6bc;
            padding: 20px;
        }
    }

    .el-icon-star-off,
    .el-icon-trophy,
    .el-icon-message,
    .el-icon-user {
        font-weight: bold;
    }

    .points-item {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;

        .points-type {
            font-weight: bold;
            color: #67C23A;
        }

        .points-value {
            font-weight: bold;

            & i {
                font-weight: bold;
            }
        }

        .points-msg,
        .points-time {
            color: #909399;
        }
    }

    .mark-read {
        font-size: 14px;
        color: #909399;
    }

    .message-col {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        gap: 20px;

        .message-item {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;

            .avatar-window {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                }
            }

            .message {
                position: relative;
                flex: 1;

                .message-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .msg {
                        color: #818489;
                        font-size: 14px;
                    }
                }

                .message-time {
                    color: #818489;
                    font-size: 14px;
                }

                .message-content {
                    margin-left: 20px;
                }

                .vector {
                    position: absolute;
                    background-color: #F2F2F2;
                    width: 10px;
                    height: 10px;
                    transform: rotate(45deg);
                    top: 38px;
                    left: 18px;
                    z-index: 0;
                }

                .message-about {
                    margin-top: 10px;
                    background-color: #F2F2F2;
                    font-size: 14px;
                    width: 100%;
                    height: 50px;
                    z-index: 1000;
                    line-height: 50px;
                }

                .message-href {
                    flex: 1;
                    display: inline-block;
                    text-decoration: none;
                    color: #296cff;
                }
            }
        }
    }
}
</style>