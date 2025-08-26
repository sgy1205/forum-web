import request from '@/utils/request'

/**
 * 搜索
 * @param {*} params 
 * @returns 
 */
export function search(params) {
    return request({
        url: '/home',
        method: 'get',
        params
    })
}

/**
 * 获取用户禁言状态
 * @param {*} data 
 * @returns 
 */
export function silenceStatus(id) {
    return request({
        url: `/silence/getSilenceStatus/${id}`,
        method: 'get'
    })
}