import request from '@/utils/request'
/**
 * 获取登录用户的帖子列表
 * @param {*} params 
 * @returns 
 */
export function postList(params) {
    return request({
        url: '/userCenter/userCenterPost',
        method: 'get',
        params
    })
}
/**
 * 获取帖子详情
 * @param {*} postId 
 * @returns 
 */
export function postDetail(postId) {
    return request({
        url: `/post/detail/${postId}`,
        method: 'get',
    })
}

/**
 * 发布帖子
 * @param {*} data 
 * @returns 
 */
export function addPost(data) {
    return request({
        url: '/post',
        method: 'post',
        data
    })
}

/**
 * 修改帖子
 * @param {*} data 
 * @returns 
 */
export function updatePost(data) {
    return request({
        url: '/post',
        method: 'put',
        data
    })
}

/**
 * 删除帖子
 * @param {*} id 
 * @returns 
 */
export function deletePost(id) {
    return request({
        url: `/post/${id}`,
        method: 'delete'
    })
}

/**
 * 获取推荐标签
 * @returns 
 */
export function getRecommendTags() {
    return request({
        url: '/tags',
        method: 'get'
    })
}

/**
 * 添加标签
 * @param {*} params 
 * @returns 
 */
export function addTags(params) {
    return request({
        url: '/tags',
        method: 'post',
        params
    })
}

/**
 * 查询标签
 * @param {*} params 
 * @returns 
 */
export function searchTags(params) {
    return request({
        url: '/tags/select',
        method: 'get',
        params
    })
}