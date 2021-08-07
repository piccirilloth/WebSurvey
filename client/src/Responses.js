import { Container, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { API } from './API';
import { BsArrowRight, BsArrowLeft } from "react-icons/bs";

function ResponsesComp(props) {
    const [activeUser, setActiveUser] = useState(undefined);
    const [allUsers, setAllUsers] = useState([]);
    const [index, setIndex] = useState(0);
    const [message, setMessage] = useState('');
    const [surveyRes, setSurveyRes] = useState([]);
    const [update, setUpdate] = useState(false);

    useEffect(() => {
        const getUsers = async () => {
            try {
                let list = await API.getResponses();
                setAllUsers(list);
            } catch {
                setMessage({ msg: "error occour in loading responses" });
            }
        }
        getUsers();
    }, [])

    useEffect(() => {
        const updateUsers = () => {
            if (update === true && allUsers !== []) {
                // setSurveyRes(allUsers.filter((v) => v.surveyId === props.survey.id));
                setSurveyRes((old) => {
                    old = [];
                    allUsers.filter((v) => v.surveyId === props.survey.id).forEach(v => old.push(v));
                    return old;
                });
                setIndex(0);
                setActiveUser(allUsers.filter((v) => v.surveyId === props.survey.id)[0]);
                setUpdate(false);
            }
        }
        updateUsers();
    }, [update, allUsers, props.survey.id]);

    function Questions() {
        let type = '';
        let k = 0;
        let res = JSON.parse(activeUser.response);
        return (res.map((elem) => {
            elem.response.length ? type = 'closed' : type = 'open';
            k++;
            return <div key={k}>
                <Alert className="questions" >
                    <Alert.Heading>{elem.question}</Alert.Heading>
                    <Answers type={type} value={elem.response} />
                </Alert>
            </div>
        }));
    }

    function Answers(props) {
        if (props.type === 'closed') {
            return (props.value.map((elem) =>
                <ClosedAns key={elem.text} elem={elem} />
            ));
        }
        else if (props.type === 'open') {
            return (
                <OpenAns value={props.value.value} />
            )
        }
    }

    function OpenAns(props) {
        return (
            <>
                <hr />
                <Form>
                    <Form.Group className="form-group">
                        <Form.Control as="textarea" rows={4} value={props.value} disabled />
                    </Form.Group>
                </Form>
            </>)
    }

    function ClosedAns(props) {
        return (<>
            <hr />
            <Form key={props.elem.text}>
                <Form.Group controlId="check">
                    <Form.Check type="checkbox" label={props.elem.text} checked={props.elem.value} disabled />
                </Form.Group>
            </Form>
        </>)
    }

    function NextPrevious() {
        return <Row>
            <Col md={11}>
                <Button onClick={() => {
                    setActiveUser(surveyRes[index - 1]);
                    setIndex((index) => index - 1)
                }} variant="success" disabled={index - 1 < 0 ? true : false}><BsArrowLeft />
                </Button>
            </Col>
            <Col md={1} className="text-right">
                <Button onClick={() => {
                    setActiveUser(surveyRes[index + 1]);
                    setIndex((index) => index + 1)
                }} variant="success" disabled={index + 1 >= surveyRes.length}><BsArrowRight />
                </Button>
            </Col>
        </Row>
    }

    if (props.survey.n_ans === 0)
        return <Col xs={12} sm={8}><Alert variant="info">No responses are available</Alert></Col>
    return (
        activeUser !== undefined ?
            activeUser.surveyId === props.survey.id ?
                <Col xs={12} sm={8}>
                    <Container fluid>
                        {message && <Alert variant="danger" onClose={() => setMessage('')} dismissible>{message}</Alert>}
                        <Alert variant="info" >
                            <Alert.Heading>Name: {activeUser.username}</Alert.Heading>
                        </Alert>
                        <NextPrevious />
                        <hr />
                        <Row className="ml-1">
                            <h2>Survey: {props.survey.title}</h2>
                        </Row>
                        <hr />
                        <Questions />
                        <NextPrevious />
                    </Container>
                </Col> : (!update ? setUpdate(true) : '')
            : (!update ? setUpdate(true) : '')
    )
}

function Responses(props) {
    return <ResponsesComp survey={props.survey} />
}

export { Responses }