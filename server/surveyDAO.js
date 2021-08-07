'use strict';

const db = require('./db');

const listSurveys = () => {
    return new Promise((resolve, reject) => {
        db.all('select * from survey', function (err, rows) {
            if (err)
                reject(false);
            else {
                const surveys = rows.map((elem) => ({ id: elem.id, user: elem.user, title: elem.title, n_quest: elem.n_quest, n_ans: elem.n_ans, username: elem.username, questions: "" }));
                resolve(surveys);
            }
        });
    });
}

const listQuestionOfSurvey = (surveyId) => {
    return new Promise((resolve, reject) => {
        db.all('select * from question where surveyId = ?', [surveyId], function (err, rows) {
            if (err)
                reject(err);
            else {
                const questions = rows.map((elem) => ({ id: elem.id, test: elem.test, surveyId: elem.surveyId, min: elem.min, max: elem.max, type: elem.type, contentJSON: elem.contentJSON, order: elem.position }));
                //console.log(questions);
                resolve(questions);
            }
        });
    });
}

exports.getSurveysWithQuestions = async () => {
    try {
        let surveys = await listSurveys();
        for (let i = 0; i < surveys.length; i++) {
            surveys[i].questions = await listQuestionOfSurvey(surveys[i].id);
        }
        return surveys;
    } catch {
        return false;
    }
}

const listUserSurvey = (userId) => {
    return new Promise((resolve, reject) => {
        db.all('select * from survey where user = ?', [userId], function (err, rows) {
            if (err)
                reject(err);
            else {
                const surveys = rows.map((elem) => ({ id: elem.id, user: elem.user, title: elem.title, n_ans: elem.n_ans, username: elem.username, questions: "" }));
                resolve(surveys);
            }
        });
    });
}

exports.getSurveysWithQuestionsAuth = async (userId) => {
    try {
        let surveys = await listUserSurvey(userId);
        for (let i = 0; i < surveys.length; i++) {
            surveys[i].questions = await listQuestionOfSurvey(surveys[i].id);
        }
        return surveys;
    } catch {
        return false;
    }
}

const insertQuestion = (question) => {
    return new Promise((resolve, reject) => {
        const sql = `insert into question(test, surveyId, min, max, type, position, contentJSON) values(?, ?, ?, ?, ?, ?, json(?))`;
        db.run(sql, [question.test, question.surveyId, question.min, question.max, question.type, question.order, JSON.stringify(question.contentJSON)], (err) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}

const insertSurvey = (survey, userid, username) => {
    return new Promise((resolve, reject) => {
        const sql = 'insert into survey(id, user, title, n_ans, n_quest, username) values(?, ?, ?, ?, ?, ?)';
        db.run(sql, [survey.id, userid, survey.title, survey.n_ans, survey.n_quest, username], function (err) {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}

exports.insertSurveyAndQuestions = async (survey, userId, questions, username) => {
    try {
        await insertSurvey(survey, userId, username);
        for (let i = 0; i < survey.n_quest; i++) {
            await insertQuestion(questions[i]);
        }
    } catch (err) {
        throw err;
    }
}

exports.insertResponse = (response) => {
    return new Promise((resolve, reject) => {
        const sql = 'insert into responses(username, surveyId, response) values(?, ?, json(?))';
        db.run(sql, [response.username, response.surveyId, JSON.stringify(response.response)], function (err) {
            if(err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}

exports.getResponses = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = "select responses.id, responses.username, responses.surveyId, responses.response from responses, survey where survey.id = responses.surveyId and survey.user = ?";
        db.all(sql, [userId], function (err, rows) {
            if(err)
                reject(err);
            resolve(rows);
        })
    })
}

exports.updateNAns = (surveyId) => {
    return new Promise((resolve, reject) => {
        const sql = 'update survey set n_ans=n_ans+1 where survey.id = ?';
        db.run(sql, [surveyId], (err) => {
            if(err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(true);
        })
    })
}

exports.getSurveyId = () => {
    return new Promise((resolve, reject) => {
        const sql = 'select id from survey';
        db.all(sql, function (err, rows) {
            if(err)
                reject(err);
            resolve(rows);
        })
    })
}
