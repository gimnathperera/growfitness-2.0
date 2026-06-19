export const getFirstName = (fullName?: string) => {
    if (!fullName) return '';
    return fullName.trim().replace(/\s+/g, ' ').split(' ')[0];
};