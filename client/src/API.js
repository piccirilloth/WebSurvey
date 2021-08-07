
async function logIn(credentials) {
    let response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user.name;
    }
    else {
        try {
            const errDetail = await response.json();
            throw errDetail.message;
        }
        catch (err) {
            throw err;
        }
    }
}

async function logOut() {
    await fetch('/api/logout/current', { method: 'DELETE' });
}

async function getUserInfo() {
    const response = await fetch('/api/login/current');
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    } else {
        throw userInfo;  // an object with the error coming from the server
    }
}

async function getAllSurveys() {
    const response = await fetch('/api/getSurveys');
    const surveys = await response.json();
    if(response.ok) {
        return surveys;
    } else {
        throw response; // an object with the error coming from the server
    }
}

async function getUserSurveys() {
    const response = await fetch('/api/getUserSurvey');
    const surveys = await response.json();
    if(response.ok) {
        return surveys;
    } else {
        throw response; // an object with the error coming from the server
    }
}

async function createSurvey(survey, questions) {
    return new Promise((resolve, reject) => {
        fetch('/api/createSurvey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({survey: survey, questions: questions}),
        }).then((response) => {
            if(response.ok)
                resolve(null);
            else {
                reject({error: 'Error in the communication with the server'});
            }
        }).catch(() => reject({error: 'Error in the communication with the server'}));
    });
}

async function createResponse(response) {
    return new Promise((resolve, reject) => {
        fetch('/api/createResponse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({response: response}),
        }).then((res) => {
            if(response.ok)
                resolve(true);
            else
                reject({error: 'Error in the communication with the server'});
        }).catch(() => reject({error: 'Error in the communication with the server'}));
    });
}

async function getResponses() {
        const response = await fetch('/api/getResponses');
        const responses = await response.json();
        if(response.ok)
            return responses;
        else
            throw response;
}

async function getSurveyId() {
    const response = await fetch('/api/getNextSurveyId');
    const id = await response.json();
    if(response.ok)
        return id.id;
    else
        throw id;
}

const API = { logIn, logOut, getUserInfo, getAllSurveys, getUserSurveys, createSurvey, createResponse, getResponses, getSurveyId };

export { API }