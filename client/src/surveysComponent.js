import { Container, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { API } from './API';
import { Overlay } from './Overlay';

function SurveysComp(props) {
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [textAreas, setTextAreas] = useState([]);
    const [checks, setChecks] = useState([]);
    const [update, setUpdate] = useState(true);
    const [variantUser, setVariantUser] = useState("info");
    const [end, setEnd] = useState(false);

    useEffect(() => {
        setUsername('');
    }, [props])

    useEffect(() => {
        if (update === true) {
            loadState(props.survey, setTextAreas, setChecks);
            setUpdate(false);
        }
    }, [update, props.survey])

    function isLoaded() {
        let flag = false;
        props.survey.questions.forEach((question) => {
            checks.forEach((c) => {
                if (c.questId === question.id)
                    flag = true;
            });
            textAreas.forEach((c) => {
                if (c.id === question.id)
                    flag = true;
            });
        });
        if (flag === false && update !== true)
            setUpdate(true);
    }

    isLoaded();

    function handleSubmission(event) {
        event.preventDefault();
        let flag = true;
        if (username === '') {
            setVariantUser("danger");
            flag = false;
        } else {
            setVariantUser("info");
        }
        props.survey.questions.forEach((val) => {
            if (val.type === 'closed') {
                let count = 0;
                let c = checks;
                c.filter((ans) => ans.questId === val.id).forEach((check) => {
                    if (check.value === true)
                        count++;
                });
                if (val.min !== 0)
                    if (count > val.max || count < val.min) {
                        setMessage(`Error! Check mandatory answer of question ${val.order}`); //review when implement order
                        flag = false;
                    }
                    else if (val.max > 0)
                        if (count > val.max) {
                            setMessage(`Error! Check mandatory answer of question ${val.order}`); //review when implement order
                            flag = false;
                        }
            } else if (val.type === 'open') {
                if (val.min === 1 && val.max === 1) {
                    //mandatory 
                    if (textAreas.filter((v) => v.id === val.id).value === '') {
                        setMessage(`Error! Check mandatory answer of question ${val.order}`);
                        flag = false;
                    }
                }
            }
        });
        if (flag === true) {
            setMessage('');
            // insert the response into the db
            let responses = [];
            props.survey.questions.forEach((question) => {
                let response = [];
                if (question.type === 'closed') {
                    response = checks.filter((elem) => elem.questId === question.id).map((v) => {
                        return { text: v.text, value: v.value };
                    });
                }
                else if (question.type === 'open') {
                    response = { value: textAreas.find(v => v.id === question.id).value };
                }
                responses.push({ question: question.test, response: response });
            });
            let r = { username: username, surveyId: props.survey.id, response: responses };
            API.createResponse(r).then().catch((err) => setMessage(err.error));
            setEnd(true);
        }
    }

    function Questions() {
        return (props.survey.questions.sort((a, b) => a.order - b.order).map((elem) => (
            <div key={elem.id}>
                <Alert className="questions" >
                    <Alert.Heading><Row><Col md="11">{`${elem.order}. `}{elem.test}</Col> <Col md="1" className="text-right">{elem.type === 'closed' ? <Overlay value={`min: ${elem.min} max: ${elem.max}`} /> : elem.min === 1 && elem.max === 1 ? <Overlay value="mandatory" /> : <Overlay value="optional" />}</Col></Row> </Alert.Heading>
                    <Answers question={elem} checks={checks} textAreas={textAreas} setChecks={setChecks} setTextAreas={setTextAreas} />
                </Alert>
            </div>
        )));
    }

    function ClosedAns(props) {
        const [localState, setLocalState] = useState(checks.find((element) => element.questId === props.question.id && element.text === props.elem.text).value);
        function updateChecks(v) {
            setChecks(checks => {
                checks.forEach((element) => {
                    if (element.questId === props.question.id && element.text === props.elem.text) {
                        element.value = v;
                        setLocalState(element.value)
                    }
                })
                return checks;
            });
        }

        return (<>
            <hr />
            <Form key={props.elem.text}>
                <Form.Group controlId="check">
                    <Form.Check type="checkbox" label={props.elem.text} checked={localState} onChange={(ev) => updateChecks(ev.target.checked)} />
                </Form.Group>
            </Form>
        </>)
    }

    function OpenAns(props) {
        const [localState, setLocalState] = useState(textAreas.find((element) => element.id === props.question.id).value);
        function updateTextAreas() {
            setTextAreas(textAreas => {
                textAreas.forEach((elem) => {
                    if (elem.id === props.question.id) {
                        elem.value = localState;
                    }
                })
                return textAreas;
            });
        }

        useEffect(() => {
            updateTextAreas();
        }, [localState])
        return (
            <>
                <hr />
                <Form>
                    <Form.Group className="form-group">
                        <Form.Control as="textarea" maxLength={200} placeholder="write maximum 200 characters..." rows={4} value={localState} onChange={(ev) => setLocalState(ev.target.value)} />
                    </Form.Group>
                </Form>
            </>)
    }

    function Answers(props) {
        if (props.question.type === 'closed') {
            return (JSON.parse(props.question.contentJSON).map((elem) =>
                <ClosedAns key={elem.text} question={props.question} elem={elem} />
            ));
        }
        else if (props.question.type === 'open') {
            return (
                <OpenAns question={props.question} />
            )
        }
    }

    return (update === false ?
        end ? <Redirect to="/" /> :
            <Col xs={12} sm={8}>
                <Container fluid>
                    {message && <Alert variant="danger" onClose={() => setMessage('')} dismissible>{message}</Alert>}
                    <Alert variant={variantUser} >
                        <Form>
                            <Form.Group as={Row} >
                                <Form.Label column sm="2">
                                    <Alert.Heading>Name</Alert.Heading>
                                </Form.Label>
                                <Form.Control type="text" placeholder="username" value={username} onChange={(ev) => setUsername(ev.target.value)} />
                            </Form.Group>
                        </Form>
                    </Alert>
                    <hr />
                    <Row className="ml-1">
                        <h2>Survey: {props.survey.title}</h2>
                    </Row>
                    <hr />
                    <Questions />
                    <Button onClick={handleSubmission} variant="success">Send</Button>
                </Container>
            </Col> : ''
    )
}

function loadState(survey, setTextAreas, setChecks) {
    let c = [];
    let t = [];
    survey.questions.forEach(element => {
        if (element.type === 'open') {
            t.push({ id: element.id, value: '' });
        }
        else if (element.type === 'closed') {
            for (let i = 0; i < JSON.parse(element.contentJSON).length; i++) {
                c.push({ questId: element.id, value: false, text: JSON.parse(element.contentJSON)[i].text });
            }
        }
    });
    setChecks(c);
    setTextAreas(t);
}

function Surveys(props) {
    return <SurveysComp survey={props.survey} loggedIn={props.loggedIn} updateSurvey={props.updateSurvey} />
}

export { Surveys }