import { Form, Alert, Button, Row, Col, Container, Modal, InputGroup, FormControl } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { GoPlus } from "react-icons/go";
import { BsFillCaretDownFill, BsFillCaretUpFill, BsFillTrashFill } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.min.css';
import { API } from './API';
import { Redirect } from 'react-router-dom';
import { Overlay } from './Overlay';

function CreateSurvey(props) {
    return (
        <Container fluid="sm">
            <QuestionsForm surveys={props.surveys} username={props.username} setUpdate={props.setUpdate} update={props.update} />
        </Container>
    )
}

function QuestionsForm(props) {
    const [title, setTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [questions, setQuestions] = useState([]);
    const [show, setShow] = useState(false);
    const [surveyId, setSurveyId] = useState(undefined);

    useEffect(() => {

    }, [questions]);

    useEffect(() => {
        const getId = async () => {
            try {
                let id = await API.getSurveyId();
                setSurveyId(id);
            } catch {
                setErrorMessage("Error in loading the survey id");
            }
        }
        getId();
    }, [])

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function handlePublish() {
        let flag = true;
        if (title === '') {
            flag = false;
            setErrorMessage("Survey's title cannot be empty!");
        }
        if (questions.length === 0) {
            flag = false;
            setErrorMessage("A survey must contain at least one question!");
        }
        if (flag === true) {
            let s = { id: surveyId, title: title, n_ans: 0, n_quest: questions.length, username: props.username };
            API.createSurvey(s, questions).then(() => props.setUpdate(true)).catch((err) => {
                setErrorMessage("Error in the communication with the db");
                flag = false;
            });
        }
    }

    function Questions() {
        function deleteQuestion(question) {
            let temp = questions;
            let index = temp.indexOf(question);
            temp.splice(index, 1);
            for (let i = index; i < questions.length; i++)
                questions[i].order = questions[i].order - 1;
            setQuestions([...temp]);
        }

        function moveDown(question) {
            if (question.order < questions.length) {
                let temp = questions;
                let index1, index2;
                temp.forEach((v) => {
                    if (v.order === question.order + 1)
                        index1 = temp.indexOf(v);
                    else if (v.order === question.order)
                        index2 = temp.indexOf(v);
                });
                temp[index1].order = question.order;
                temp[index2].order = question.order + 1;
                setQuestions([...temp]);
            }
        }

        function moveUp(question) {
            if (question.order > 1) {
                let temp = questions;
                let index1, index2;
                temp.forEach((v) => {
                    if (v.order === question.order - 1)
                        index1 = temp.indexOf(v);
                    else if (v.order === question.order)
                        index2 = temp.indexOf(v);
                });
                temp[index1].order = question.order;
                temp[index2].order = question.order - 1;
                setQuestions([...temp]);
            }
        }

        return questions.sort((a, b) => a.order - b.order).map((question) => (
            <Alert className="questions" key={question.order}>
                <div>
                    <Alert.Heading>
                        <Row><Col md="11">{`${question.order}. `}{question.test}</Col><Col md="1" className="text-right">{question.type === 'closed' ? <Overlay value={`min: ${+question.min} max: ${+question.max}`} /> : question.min === 1 && question.max === 1 ? <Overlay value="mandatory" /> : <Overlay value="optional" />}</Col></Row>
                        <Row>
                            <Col md="11">
                                <BsFillCaretDownFill onClick={() => moveDown(question)} /> <BsFillCaretUpFill onClick={() => moveUp(question)} />
                            </Col>
                            <Col md="1" className="text-right">
                                <BsFillTrashFill onClick={() => deleteQuestion(question)} />
                            </Col>
                        </Row>
                    </Alert.Heading>
                    {question.type === 'open' ? <>
                        <hr />
                        <Form>
                            <Form.Group className="form-group">
                                <Form.Control as="textarea" rows={4} value={""} onChange={() => ''} />
                            </Form.Group>
                        </Form>
                    </> :
                        question.contentJSON.map((value) => (<div key={value.text}><hr />{value.text}</div>))
                    }
                </div>
            </Alert>
        ))
    }

    return (!props.update ?
        <>
            <Form>
                {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
                <Form.Group controlId='defineTitle'>
                    <Form.Label><h1>Title</h1></Form.Label>
                    <Form.Control type='test' value={title} onChange={ev => setTitle(ev.target.value)} />
                </Form.Group>
            </Form>
            <Questions />
            <QuestForm show={show} handleClose={handleClose} handleShow={handleShow} questions={questions} setQuestions={setQuestions} surveyId={surveyId} />
            <Row>
                <Col md="10">
                    <Button variant="primary" onClick={handleShow} ><GoPlus /></Button>
                </Col>
                <Col md="2" className="text-right">
                    <Button variant="success" onClick={handlePublish}>Publish</Button>
                </Col>
            </Row>
        </> : <Redirect to="/" />
    );
}

function QuestForm(props) {
    const [text, setText] = useState('');
    const [min, setMin] = useState('');
    const [max, setMax] = useState('');
    const [openQuest, setOpenQuest] = useState(true);
    const [ans, setAns] = useState([]);
    const [showAnsForm, setShowAnsForm] = useState(false);
    const [answer, setAnswer] = useState('');
    const [mand, setMand] = useState(false);
    const [errMsg, setErrMsg] = useState('');;

    function handleSubmission(event) {
        event.preventDefault();
        let flag = true;
        if (openQuest === false && (min === '' || max === '' || isNaN(min) || isNaN(max) || parseInt(min) < 0 || parseInt(min) > ans.length || parseInt(max) <= 0 || parseInt(max) > ans.length || parseInt(min) > parseInt(max))) {
            flag = false;
            setErrMsg("Error! min and max non valid");
        }
        if (text === '') {
            setErrMsg("Error! the question's text cannot be empty");
            flag = false;
        }
        if (flag === true) {
            setErrMsg('');
            let quest = undefined;

            if (openQuest === true) {
                quest = { test: text, surveyId: props.surveyId, min: mand ? 1 : 0, max: mand ? 1 : 0, type: "open", contentJSON: "", order: props.questions.length + 1 };
            } else if (openQuest === false) {
                let cont = [];
                ans.forEach((el) => cont.push({ text: el }))
                quest = { test: text, surveyId: props.surveyId, min: min, max: max, type: "closed", contentJSON: cont, order: props.questions.length + 1 };
            }
            props.setQuestions((old) => [...old, { ...quest }]);
            setAns([]);
            setMin('');
            setMax('');
            setOpenQuest(true);
            setMand(false);
            setText('');
            props.handleClose();
        }
    }

    return (
        <>
            <Modal
                show={props.show}
                onHide={props.handleClose}
                backdrop="static"
                keyboard={false}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Create a new question</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errMsg ? <Alert variant="danger">{errMsg}</Alert> : ''}
                    <Container fluid="sm">
                        <Form>
                            <Form.Group id="text">
                                <Form.Label>Question's text</Form.Label>
                                <Form.Control type='test' value={text} onChange={ev => setText(ev.target.value)} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Choose question's type</Form.Label>
                                <Form.Control as="select" value={openQuest ? 'Open' : 'Closed'} onChange={(ev) => ev.target.value === 'Open' ? setOpenQuest(true) : setOpenQuest(false)}>
                                    <option>Open</option>
                                    <option>Closed</option>
                                </Form.Control>
                            </Form.Group>
                            {!openQuest ? <Form.Group id="minmax">
                                <Form.Label>Minimum number of responses</Form.Label>
                                <Form.Control type='test' value={min} onChange={ev => setMin(ev.target.value)} />
                                <Form.Label>Maximum number of responses</Form.Label>
                                <Form.Control type='test' value={max} onChange={ev => setMax(ev.target.value)} />
                            </Form.Group> : ''}
                            {!openQuest ? <>
                                {ans.map((elem) => <Alert key={elem} variant="info">{elem}</Alert>)}
                                <Button variant="success" onClick={() => setShowAnsForm(true)}><GoPlus /></Button>

                                {showAnsForm ? <InputGroup className="mb-3">
                                    <FormControl
                                        placeholder="Answer..."
                                        aria-label="Answer..."
                                        aria-describedby="basic-addon2"
                                        value={answer}
                                        onChange={(ev) => setAnswer(ev.target.value)}
                                    />
                                    <InputGroup.Append>
                                        <Button variant="outline-secondary" onClick={() => {
                                            if (ans.find((v) => v === answer) !== undefined) {
                                                setErrMsg("Two answer cannot have the same text!");
                                            }
                                            else if (answer !== '') {
                                                setAns((old) => [...old, answer]);
                                                setShowAnsForm(false);
                                                setAnswer('');
                                            }
                                        }}>Add</Button>
                                    </InputGroup.Append>
                                </InputGroup> : ''}
                            </>
                                : <Form.Group id="mandatory">
                                    <Form.Check type="checkbox" label="Mandatory question?" checked={mand} onChange={() => setMand(!mand)} />
                                </Form.Group>}
                        </Form>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.handleClose}>
                        Close
                    </Button>
                    <Button onClick={handleSubmission} variant="success">Add</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export { CreateSurvey }