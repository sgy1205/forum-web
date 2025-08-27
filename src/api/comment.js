import request from '@/utils/request';

/**
 * 获取评论列表
 * @param {*} postId 
 * @returns 
 */
export function getComments(postId) {
    return request({
        url: `/comment/list/${postId}`,
        method: 'get'
    })
}


/**
 * 发表评论
 * @param {*} data 
 * @returns 
 */
export function addComment(data) {
    return request({
        url: '/comment',
        method: 'post',
        data
    })
}
/**
 * 删除评论
 * @param {*} id 
 * @returns 
 */
export function deleteComment(id) {
    return request({
        url: `/comment/${id}`,
        method: 'delete'
    })
}