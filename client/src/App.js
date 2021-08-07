import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Row, Alert, Col } from 'react-bootstrap';
import './App.css';
import { Title } from './Title';
import { CreateSurvey } from './createSurvey';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API } from './API';
import { LogInForm } from './logInForm';
import { LeftSidebar } from './leftSideBar';
import { Surveys } from './surveysComponent';
import { Responses } from './Responses'

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [surveys, setSurveys] = useState([]);
  const [update, setUpdate] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let user = await API.getUserInfo();
        setUsername(user.name);
        setLoggedIn(true);
      } catch (err) {
        //console.error(err.error);
      }
    };
    checkAuth();
  }, [loggedIn, setLoggedIn]);

  useEffect(() => {
    const getSurveys = async () => {
      try {
          if(update === true) {
            if (!loggedIn) {
            let list = await API.getAllSurveys();
            setSurveys((old) => {
              old = [];
              list.forEach((v) => old.push(v));
              return old;
            });
          }
          else {
            let list = await API.getUserSurveys();
            setSurveys((old) => {
              old = [];
              list.forEach((v) => old.push(v));
              return old;
            });
          }
          setUpdate(false);
        }
      } catch {
        setMessage({ msg: "error occour in loading surveys", type: "danger" });
        setUpdate(false);
      }
    };
    getSurveys();
  }, [update, loggedIn]);


  const doLogIn = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setUpdate(true);
      setUsername(user);
    } catch (err) {
      setMessage({ msg: err, type: 'danger' });
    }
  };

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUpdate(true);
    setUsername('');
    // clean up everything
    setMessage('');
  };

  return (
    <Router>
      <Container fluid id="aside_section">
        <Row><Title loggedIn={loggedIn} logOut={doLogOut} username={username} /></Row>
        <Switch>
          <Route path="/" exact render={() =>
            <>
              {message && <Container fluid><Row>
                <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
              </Row>
              </Container>}
              <Row>
                <Col xs={12} sm={4} className="d-sm-block">
                  <LeftSidebar surveys={surveys} loggedIn={loggedIn} />
                </Col>
              </Row>
            </>
          } />
          <Route path="/createSurvey" exact render={() =>
            loggedIn ? <CreateSurvey surveys={surveys} username={username} setUpdate={setUpdate} update={update} /> : <Alert variant="danger">You are not logged!</Alert>
          } />
          <Route path="/login" exact render={() =>
            <>
            {message && <Container fluid="sm">
                <Alert variant={message.type} onClose={() => setMessage('')}>{message.msg}</Alert>
              </Container>}
              {loggedIn ? <Redirect to="/" /> : <LogInForm logIn={doLogIn} setMessage={setMessage}/>}
            </>
          } />
          <Route path="/survey/:id" exact render={({ match }) => {
            let val = surveys.find((e) => e.id === parseInt(match.params.id));
            if(val === undefined)
              return <Alert variant="danger">Survey not found</Alert>;
            return (
              loggedIn === false ? 
              <>
                <Row>
                  <Col xs={4} className="d-sm-block">
                    <LeftSidebar surveys={surveys} loggedIn={loggedIn} />
                  </Col>
                  <Surveys survey={val} loggedIn={loggedIn} />
                </Row>
              </> : <Alert variant="danger">You are logged in!</Alert>
            )
          }
          } />
          <Route path="/responses/:id" exact render={({ match }) => {
            let val = surveys.find((e) => e.id === parseInt(match.params.id));
            if(val === undefined)
              return <Alert variant="danger">Response not found</Alert>;;
            
            return (
              loggedIn === true ?
              <>
                <Row>
                  <Col xs={4} className="d-sm-block">
                    <LeftSidebar surveys={surveys} loggedIn={loggedIn} />
                  </Col>
                  <Responses survey={val} loggedIn={loggedIn} />
                </Row>
              </> : <Alert variant="danger">You are not logged in!</Alert>
            )
          }
          } />
        </Switch>
      </Container>
    </Router >
  );
}

export default App;
