<template>
    <div class="comment-list">
        <CommentItem 
            v-for="(comment, index) in comments" 
            :key="comment.commentId" 
            :comment="comment" 
            :user-id="userId"
            @refresh="refresh" 
            :is-last="index == comments.length - 1" 
        />
    </div>
</template>

<script>
export default {
    props: {
        comments: Array,
        userId: [String, Number]
    },
    components: {
        CommentItem: () => import('@/components/CommentItem.vue')
    },
    methods: {
        refresh() {
            this.$emit('refresh');
        }
    }
};
</script>
<style scoped>

</style>