import request from '@/utils/request'

/**
 * 签到
 * @returns 
 */
export function check() {
    return request({
        url: '/check/userCheck',
        method: 'post'
    })
}
/**
 * 查询用户签到状态
 * @returns 
 */
export function checkStatus() {
    return request({
        url: '/check/checkstatus',
        method: 'get'
    })
}
/**
 * 获取连续签到天数
 * @returns 
 */
export function checkNum() {
    return request({
        url: '/check/getcheckNum',
        method: 'get'
    })
}

/**
 * 获取用户积分排名
 * @returns 
 */
export function pointRank(params) {
    return request({
        url: '/point/getUserPointsRank',
        method: 'get',
        params
    })
}
