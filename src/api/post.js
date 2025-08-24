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
 * @param {*} data 
 * @returns 
 */
export function postDetail(data) {
    return request({
        url: '/user/post',
        method: 'post',
        data,
        headers: { 'Content-Type': 'application/json' }
    })
}
/**
 * 获取所有帖子
 * @returns 
 */
export function allPost(data) {
    return request({
        url: '/user/post/lists',
        method: 'post',
        data
    })
}

/**
 * 发布帖子
 * @param {*} data 
 * @returns 
 */
export function addPost(data) {
    return request({
        url: '/user/post/add',
        method: 'post',
        data,
        headers: { 'Content-Type': 'application/json' }
    })
}

/**
 * 修改帖子
 * @param {*} data 
 * @returns 
 */
export function updatePost(data) {
    return request({
        url: '/user/post/update',
        method: 'put',
        data,
        headers: { 'Content-Type': 'application/json' }
    })
}

/**
 * 删除帖子
 * @param {*} id 
 * @returns 
 */
export function deletePost(id) {
    return request({
        url: `/user/post/${id}`,
        method: 'delete'
    })
}