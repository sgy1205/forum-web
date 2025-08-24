<template>
    <div class="box">
        <div v-if="length > 0 && length < pagination.total" style="display: flex;justify-content: center;gap: 20px;">
            <div class="load-more tran" @click="loadMore">
                加载更多 <i class="el-icon-arrow-down"></i>

            </div>
            <div v-if="pagination.pageSize > 5" class="load-more tran " @click="retract">收起 <i
                    class="el-icon-arrow-up"></i>
            </div>
        </div>
        <div v-if="pagination.total > 5">
            <div class="no-more" v-if="length >= pagination.total && pagination.total > 0">
                <div>没有更多内容了~~
                    <span class="back-to-top tran" @click="scrollToTop"> 返回顶部</span>
                </div>
                <div class="retract tran " @click="retract">收起 <i class="el-icon-arrow-up"></i></div>
            </div>
        </div>
        <!-- 如果总条数小于5条那就不展示收起之类的 -->
        <div v-else>
            <div class="no-more">没有更多内容了~~</div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        length: {
            type: Number,
            required: true
        },
        pagination: {
            type: Object,
            required: true
        }
    },
    data() {
        return {

        };
    },
    methods: {
        loadMore(type) {
            this.$emit('load-more', type);
        },
        retract(type) {
            this.$emit('retract', type);
        },
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.box {
    margin-top: 10px;
    // width: 100%;

    .load-more {
        text-align: center;
        padding: 20px 0 10px 0;
        cursor: pointer;
        color: rgb(194, 194, 194);
        // font-size: 18px;

        &:hover {
            color: #409eff;
        }
    }

    .no-more {
        text-align: center;
        margin: 20px 0;
        color: rgb(194, 194, 194);
    }

    .back-to-top {
        text-decoration: none;
        color: #409eff;
        cursor: pointer;

        &:hover {
            color: #1184ff;
        }
    }

    .retract {
        font-size: 18px;
        margin-top: 10px;
        cursor: pointer;

        &:hover {
            color: #409eff;
        }
    }
}
</style>