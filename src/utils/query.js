export function query(form) {
    return Object.values(form).some(value => {
        if (typeof value === 'string') return value.trim() !== ''

        return value !== undefined && value !== null
    })

}