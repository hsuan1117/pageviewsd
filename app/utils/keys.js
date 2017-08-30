module.exports = {


    /**
     * Generate index key
     *
     * @param {String} label
     * @param {Date} date
     * @returns {String}
     */
    indexKey(label, date) {
        return label + '-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    },


    /**
     * Generate merged key
     *
     * @param {String} label
     * @returns {String}
     */
    mergedKey(label) {
        return label + '-merged';
    },


    /**
     * Extract date from index key
     *
     * @param {String} key
     * @returns {String|Boolean}
     */
    extractDate(key) {
        const result = key.match(new RegExp('-(\\d{4}-\\d{1,2}-\\d{1,2})'));
        return (result && result.length >= 2) ? result[1] : false;
    }

};
