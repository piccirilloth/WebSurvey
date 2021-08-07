import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Badge } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { RiSurveyLine } from "react-icons/ri";
import { Link } from 'react-router-dom';

function Title(props) {
    return (
        <Navbar bg='dark' variant='dark' fixed="top">
            <Navbar.Brand href="/"><RiSurveyLine /> WTWSurvey</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
                {props.loggedIn ? <Nav className="mr-auto"><Link to="/createSurvey"><Button variant="success">Create a new survey</Button></Link></Nav> : ''}
                <Navbar.Text>
                    {props.loggedIn ? <div><Badge pill variant="dark">user: {props.username}</Badge> <Link to="/"><Button onClick={props.logOut} variant="danger">Log Out</Button></Link></div> : <Link to="/login"><Button variant="success">Log In</Button></Link>}
                </Navbar.Text>
            </Navbar.Collapse>
        </Navbar>);
}

export { Title }