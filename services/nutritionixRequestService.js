const axios = require('axios');

async function getCalories(keyword) {
    try {
        const response = await axios.post(
            'https://trackapi.nutritionix.com/v2/natural/nutrients',
            {query: keyword},
            {headers: {'x-app-key': process.env.X_APP_KEY, 'x-app-id': process.env.X_APP_ID}}
        );
        return response.data.foods[0].nf_calories;
    } catch (e) {
        return 0;
    }
}

module.exports = { getCalories };